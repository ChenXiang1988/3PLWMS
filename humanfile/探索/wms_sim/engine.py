from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Any

from .models import (
    DecisionLog,
    L1Document,
    L2ProcessDocument,
    L3Task,
    ProcessNode,
    Reservation,
    SimulationState,
    minutes_after,
)


INBOUND_NODES = [
    ProcessNode("NODE-RECV", "到货签收", 10, "RCV", required=True),
    ProcessNode("NODE-QC", "质检", 20, "QC"),
    ProcessNode("NODE-PKG", "装容器", 30, "PKG"),
    ProcessNode("NODE-SHELF", "上架", 40, "PUT"),
]

OUTBOUND_NODES = [
    ProcessNode("NODE-REPLENISH", "补货", 10, "RPL"),
    ProcessNode("NODE-PICK", "拣货", 20, "PICK"),
    ProcessNode("NODE-CHECK", "复核播种", 30, "CHECK"),
    ProcessNode("NODE-VALUE", "增值加工", 40, "VALUE"),
    ProcessNode("NODE-PACK", "打包装箱", 50, "PACK"),
    ProcessNode("NODE-SET", "组包/集包", 60, "SET"),
    ProcessNode("NODE-HANDOVER", "出库交接", 90, "HND", required=True),
]

SKIP_REASONS = {
    "NODE-QC": "供应商免检",
    "NODE-PKG": "目标容器已匹配",
    "NODE-SHELF": "越库转运",
    "NODE-REPLENISH": "拣选位库存足够",
    "NODE-PICK": "整托直出",
    "NODE-CHECK": "整托直出",
    "NODE-VALUE": "普通订单无需加工",
    "NODE-PACK": "整托直出",
    "NODE-SET": "单包裹直接交接",
}

DURATION_MINUTES = {
    "NODE-RECV": 8,
    "NODE-QC": 10,
    "NODE-PKG": 8,
    "NODE-SHELF": 12,
    "NODE-REPLENISH": 14,
    "NODE-PICK": 16,
    "NODE-CHECK": 8,
    "NODE-VALUE": 12,
    "NODE-PACK": 10,
    "NODE-SET": 8,
    "NODE-HANDOVER": 11,
}

RESOURCE_TYPES = {
    "NODE-RECV": "forklift",
    "NODE-QC": "checker",
    "NODE-PKG": "forklift",
    "NODE-SHELF": "forklift",
    "NODE-REPLENISH": "forklift",
    "NODE-PICK": "picker",
    "NODE-CHECK": "checker",
    "NODE-VALUE": "picker",
    "NODE-PACK": "packer",
    "NODE-SET": "forklift",
    "NODE-HANDOVER": "forklift",
}


class SimulationEngine:
    def __init__(self, state: SimulationState, end_time: datetime):
        self.state = state
        self.end_time = end_time
        self.process_counter = 0
        self.task_counter = 0
        self.reservation_counter = 0
        self.batch_counter = 0
        self.route_map: dict[str, list[ProcessNode]] = {
            "inbound": INBOUND_NODES,
            "outbound": OUTBOUND_NODES,
        }

    def run(self) -> SimulationState:
        for document in sorted(self.state.documents.values(), key=lambda item: (item.plan_time, item.doc_no)):
            self.state.schedule(document.plan_time, "DOCUMENT_RELEASED", {"doc_no": document.doc_no})

        while True:
            event = self.state.pop_event()
            if event is None or event.timestamp > self.end_time:
                break
            self.state.now = event.timestamp
            self._handle_event(event.event_type, event.payload)
            self.dispatch_ready_tasks()
            self.snapshot()

        for task in self.state.tasks.values():
            if task.status not in {"completed", "cancelled"}:
                task.status = "carry_over"
        self.refresh_all_documents()
        return self.state

    def _handle_event(self, event_type: str, payload: dict[str, Any]) -> None:
        if event_type == "DOCUMENT_RELEASED":
            self.release_document(payload["doc_no"])
        elif event_type == "TASK_COMPLETED":
            self.complete_task(payload["task_no"])

    def release_document(self, doc_no: str) -> None:
        document = self.state.documents[doc_no]
        document.status = "processing"
        route = self.route_map[document.doc_type]
        decisions = self.decide_route(document, route)
        document.route_decisions = decisions
        required = [item for item in decisions if item["decision"] == "required"]
        for decision in required:
            self.create_process_document(document, decision)
        self.activate_process_documents()

    def decide_route(self, document: L1Document, route: list[ProcessNode]) -> list[dict[str, Any]]:
        line_values = document.lines
        is_pallet = all(line.picking_mode == "pallet" for line in line_values) if line_values else False
        needs_qc = any(line.need_qc for line in line_values)
        needs_pack = any(line.need_pack for line in line_values)
        needs_check = any(line.need_check for line in line_values)
        needs_value = any(line.need_value_added for line in line_values)
        needs_consolidation = any(line.need_consolidation for line in line_values)
        cross_dock = all(line.cross_dock for line in line_values) if line_values else False
        decisions = []
        for node in route:
            required = node.required
            if node.process_code == "NODE-QC":
                required = needs_qc
            elif node.process_code == "NODE-PKG":
                required = any(line.container_type != "carton" for line in line_values)
            elif node.process_code == "NODE-SHELF":
                required = not cross_dock
            elif node.process_code == "NODE-REPLENISH":
                required = self.needs_replenishment(document)
            elif node.process_code == "NODE-PICK":
                required = not is_pallet
            elif node.process_code == "NODE-CHECK":
                required = needs_check or not is_pallet
            elif node.process_code == "NODE-VALUE":
                required = needs_value
            elif node.process_code == "NODE-PACK":
                required = needs_pack and not is_pallet
            elif node.process_code == "NODE-SET":
                required = needs_consolidation
            decision = "required" if required else "skipped"
            decisions.append({
                "processCode": node.process_code,
                "nodeName": node.node_name,
                "sequence": node.sequence,
                "required": required,
                "decision": decision,
                "skipReason": None if required else SKIP_REASONS.get(node.process_code, "业务编排不需要"),
            })
        return decisions

    def needs_replenishment(self, document: L1Document) -> bool:
        if document.doc_type != "outbound":
            return False
        for line in document.lines:
            if not self.has_picking_inventory(line.sku, line.plan_qty):
                return True
        return False

    def has_picking_inventory(self, sku: str, quantity: Decimal) -> bool:
        total = Decimal("0")
        for item in self.state.inventories.values():
            if item.sku == sku and item.location.startswith("PK-"):
                total += item.available_qty
        return total >= quantity

    def create_process_document(self, document: L1Document, decision: dict[str, Any]) -> L2ProcessDocument:
        self.process_counter += 1
        self.batch_counter += 1
        code = decision["processCode"]
        prefix = next(node.task_prefix for node in self.route_map[document.doc_type] if node.process_code == code)
        process_doc_no = f"{prefix}-20261111-{self.process_counter:04d}"
        line_refs = [(document.doc_no, line.line_no) for line in document.lines]
        planned_qty = sum((line.plan_qty for line in document.lines), Decimal("0"))
        process = L2ProcessDocument(
            process_doc_no=process_doc_no,
            process_code=code,
            node_name=decision["nodeName"],
            batch_no=f"WAV-20261111-{self.batch_counter:04d}",
            sequence=decision["sequence"],
            source_doc_nos=[document.doc_no],
            line_refs=line_refs,
            task_prefix=prefix,
            planned_qty=planned_qty,
        )
        document.process_doc_nos.append(process_doc_no)
        self.state.process_documents[process_doc_no] = process
        return process

    def activate_process_documents(self) -> None:
        for process in self.state.process_documents.values():
            if process.status != "created":
                continue
            predecessor = self._predecessor(process)
            if predecessor is not None and predecessor.status != "completed":
                continue
            process.status = "ready"
            self.create_tasks(process)

    def _predecessor(self, process: L2ProcessDocument) -> L2ProcessDocument | None:
        candidates = [
            item for item in self.state.process_documents.values()
            if item.source_doc_nos == process.source_doc_nos and item.sequence < process.sequence
        ]
        return max(candidates, key=lambda item: item.sequence, default=None)

    def create_tasks(self, process: L2ProcessDocument) -> None:
        if process.task_nos:
            return
        document = self.state.documents[process.source_doc_nos[0]]
        for line in document.lines:
            self.task_counter += 1
            task_no = f"{process.task_prefix}-{self.task_counter:04d}"
            source, target, resource_type = self.task_shape(process.process_code, line)
            task = L3Task(
                task_no=task_no,
                process_doc_no=process.process_doc_no,
                source_doc_no=document.doc_no,
                task_type=process.node_name,
                source_location=source,
                target_location=target,
                quantity=line.plan_qty,
                unit=line.unit,
                required_resource_type=resource_type,
                duration_minutes=DURATION_MINUTES.get(process.process_code, 10),
                earliest_start=document.plan_time,
                due_time=document.due_time,
                priority=document.priority,
            )
            self.state.tasks[task_no] = task
            process.task_nos.append(task_no)
        process.status = "released"
        for task_no in process.task_nos:
            self.state.tasks[task_no].status = "released"

    def task_shape(self, process_code: str, line: Any) -> tuple[str | None, str | None, str]:
        shapes = {
            "NODE-RECV": ("DOCK-01", "RB-01", "forklift"),
            "NODE-QC": ("RCV-01", "RCV-01", "checker"),
            "NODE-PKG": ("RB-01", "SZ-A", "forklift"),
            "NODE-SHELF": ("RB-01", line.target_location or "SZ-A", "forklift"),
            "NODE-REPLENISH": ("SZ-A", "PK-01", "forklift"),
            "NODE-PICK": (line.source_location or "PK-01", "CB-01", "picker"),
            "NODE-CHECK": ("CB-01", "CB-01", "checker"),
            "NODE-VALUE": ("CB-01", "CB-01", "picker"),
            "NODE-PACK": ("CB-01", "SHP-01", "packer"),
            "NODE-SET": ("CB-01", "SB-01", "forklift"),
            "NODE-HANDOVER": ("SB-01", "DOCK-01", "forklift"),
        }
        return shapes[process_code]

    def dispatch_ready_tasks(self) -> None:
        candidates = []
        for task in self.state.tasks.values():
            if task.status not in {"released", "waiting", "blocked"}:
                continue
            feasible, reason = self.is_feasible(task)
            if feasible:
                candidates.append(task)
            elif reason in {"PREDECESSOR_NOT_COMPLETED", "RESOURCE_UNAVAILABLE"}:
                task.status = "waiting"
                task.blocked_reason = reason
            else:
                task.status = "blocked"
                task.blocked_reason = reason
                self.log("task_admission", "blocked", reason, task)
        candidates.sort(key=lambda task: (-task.priority, task.due_time or datetime.max, task.task_no))
        for task in candidates:
            if task.status == "running":
                continue
            resource = self.find_resource(task.required_resource_type)
            if resource is None:
                task.status = "waiting"
                self.log("task_dispatch", "waiting", "RESOURCE_UNAVAILABLE", task)
                continue
            task.blocked_reason = None
            self.reserve(task, resource.resource_id)
            task.status = "running"
            task.started_at = self.state.now
            resource.status = "busy"
            resource.current_task_no = task.task_no
            resource.busy_until = minutes_after(self.state.now, task.duration_minutes)
            self.state.schedule(resource.busy_until, "TASK_COMPLETED", {"task_no": task.task_no})
            self.log("task_dispatch", "started", None, task, {"resourceId": resource.resource_id})

    def is_feasible(self, task: L3Task) -> tuple[bool, str | None]:
        process = self.state.process_documents[task.process_doc_no]
        predecessor = self._predecessor(process)
        if predecessor is not None and predecessor.status != "completed":
            return False, "PREDECESSOR_NOT_COMPLETED"
        if self.state.now < task.earliest_start:
            return False, "EARLIEST_START_NOT_REACHED"
        resource = self.find_resource(task.required_resource_type)
        if resource is None:
            return False, "RESOURCE_UNAVAILABLE"
        if task.target_location and task.target_location in self.state.locations:
            location = self.state.locations[task.target_location]
            capacity_unit = self._capacity_unit(task)
            if capacity_unit in location.capacity and location.available(capacity_unit) < self._capacity_qty(task):
                return False, "TARGET_LOCATION_CAPACITY"
        return True, None

    def _capacity_unit(self, task: L3Task) -> str:
        if task.task_type in {"拣货", "补货", "增值加工", "打包装箱"}:
            return "piece"
        if task.task_type in {"组包/集包"}:
            return "container"
        return task.unit

    def _capacity_qty(self, task: L3Task) -> Decimal:
        if self._capacity_unit(task) == "container":
            return Decimal("1")
        return task.quantity

    def find_resource(self, resource_type: str):
        for resource in self.state.resources.values():
            if resource.resource_type == resource_type and resource.status == "available" and resource.capabilities.intersection({resource_type, "general"}):
                return resource
        return None

    def reserve(self, task: L3Task, resource_id: str) -> None:
        self.reservation_counter += 1
        reservation_id = f"RSV-{self.reservation_counter:05d}"
        task.reservation_id = reservation_id
        reservation = Reservation(reservation_id=reservation_id, task_no=task.task_no, resource_id=resource_id)
        if task.target_location and task.target_location in self.state.locations:
            location = self.state.locations[task.target_location]
            unit = self._capacity_unit(task)
            quantity = self._capacity_qty(task)
            if unit in location.capacity:
                location.reserved[unit] = location.reserved.get(unit, Decimal("0")) + quantity
                reservation.location_code = location.code
                reservation.location_unit = unit
                reservation.location_qty = quantity
        self.state.reservations[reservation_id] = reservation

    def complete_task(self, task_no: str) -> None:
        task = self.state.tasks[task_no]
        if task.status != "running":
            return
        task.status = "completed"
        task.completed_at = self.state.now
        if task.reservation_id:
            reservation = self.state.reservations.pop(task.reservation_id, None)
            if reservation:
                if reservation.location_code in self.state.locations and reservation.location_unit:
                    location = self.state.locations[reservation.location_code]
                    location.reserved[reservation.location_unit] = max(
                        Decimal("0"),
                        location.reserved.get(reservation.location_unit, Decimal("0")) - reservation.location_qty,
                    )
                if reservation.resource_id in self.state.resources:
                    resource = self.state.resources[reservation.resource_id]
                    resource.status = "available"
                    resource.current_task_no = None
                    resource.location = task.target_location or resource.location
                    resource.busy_until = None
        process = self.state.process_documents[task.process_doc_no]
        process.completed_qty += task.quantity
        if all(self.state.tasks[item].status == "completed" for item in process.task_nos):
            process.status = "completed"
            self.log("process_update", "completed", None, task, {"processDocNo": process.process_doc_no})
            self.activate_process_documents()
        self.log("task_update", "completed", None, task)
        self.refresh_all_documents()

    def refresh_all_documents(self) -> None:
        for document in self.state.documents.values():
            processes = [self.state.process_documents[item] for item in document.process_doc_nos]
            if processes and all(item.status == "completed" for item in processes):
                document.status = "completed"
            elif any(item.status == "blocked" for item in processes):
                document.status = "blocked"

    def snapshot(self) -> None:
        self.state.snapshots.append({
            "timestamp": self.state.now.isoformat(),
            "runningTasks": sum(item.status == "running" for item in self.state.tasks.values()),
            "completedTasks": sum(item.status == "completed" for item in self.state.tasks.values()),
            "blockedTasks": sum(item.status == "blocked" for item in self.state.tasks.values()),
            "waitingTasks": sum(item.status == "waiting" for item in self.state.tasks.values()),
        })

    def log(self, decision_type: str, result: str, reason: str | None, task: L3Task, details: dict[str, Any] | None = None) -> None:
        self.state.decisions.append(DecisionLog(
            timestamp=self.state.now,
            decision_type=decision_type,
            result=result,
            reason_code=reason,
            task_no=task.task_no,
            process_doc_no=task.process_doc_no,
            source_doc_no=task.source_doc_no,
            details=details or {},
        ))
