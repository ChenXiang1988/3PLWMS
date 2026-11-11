from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timedelta
from decimal import Decimal
from typing import Any


@dataclass
class Location:
    code: str
    zone: str
    location_type: str
    capacity: dict[str, Decimal]
    occupied: dict[str, Decimal] = field(default_factory=dict)
    reserved: dict[str, Decimal] = field(default_factory=dict)
    status: str = "available"

    def available(self, unit: str) -> Decimal:
        return self.capacity.get(unit, Decimal("0")) - self.occupied.get(unit, Decimal("0")) - self.reserved.get(unit, Decimal("0"))


@dataclass
class Inventory:
    inventory_id: str
    owner: str
    sku: str
    batch_no: str
    container_type: str
    quantity: Decimal
    unit: str
    location: str
    available_qty: Decimal
    locked_qty: Decimal = Decimal("0")


@dataclass
class Resource:
    resource_id: str
    resource_type: str
    capabilities: set[str]
    location: str
    capacity: int = 1
    status: str = "available"
    busy_until: datetime | None = None
    current_task_no: str | None = None


@dataclass
class DocumentLine:
    line_no: int
    sku: str
    plan_qty: Decimal
    unit: str
    batch_no: str
    container_type: str
    source_location: str | None = None
    target_location: str | None = None
    need_qc: bool = False
    cross_dock: bool = False
    picking_mode: str = "piece"
    need_check: bool = False
    need_value_added: bool = False
    need_pack: bool = False
    need_consolidation: bool = False


@dataclass
class L1Document:
    doc_no: str
    doc_type: str
    warehouse: str
    owner: str
    plan_time: datetime
    priority: int
    lines: list[DocumentLine]
    inbound_type: str | None = None
    outbound_type: str | None = None
    due_time: datetime | None = None
    status: str = "released"
    route_decisions: list[dict[str, Any]] = field(default_factory=list)
    process_doc_nos: list[str] = field(default_factory=list)


@dataclass
class ProcessNode:
    process_code: str
    node_name: str
    sequence: int
    task_prefix: str
    required: bool = False


@dataclass
class L2ProcessDocument:
    process_doc_no: str
    process_code: str
    node_name: str
    batch_no: str
    sequence: int
    source_doc_nos: list[str]
    line_refs: list[tuple[str, int]]
    task_prefix: str
    status: str = "created"
    planned_qty: Decimal = Decimal("0")
    completed_qty: Decimal = Decimal("0")
    task_nos: list[str] = field(default_factory=list)
    predecessor_nos: list[str] = field(default_factory=list)


@dataclass
class L3Task:
    task_no: str
    process_doc_no: str
    source_doc_no: str
    task_type: str
    source_location: str | None
    target_location: str | None
    quantity: Decimal
    unit: str
    required_resource_type: str
    duration_minutes: int
    earliest_start: datetime
    due_time: datetime | None
    priority: int
    status: str = "created"
    required_resource_id: str | None = None
    reservation_id: str | None = None
    started_at: datetime | None = None
    completed_at: datetime | None = None
    blocked_reason: str | None = None


@dataclass(order=True)
class SimulationEvent:
    timestamp: datetime
    sequence: int
    event_type: str = field(compare=False)
    payload: dict[str, Any] = field(compare=False, default_factory=dict)


@dataclass
class DecisionLog:
    timestamp: datetime
    decision_type: str
    result: str
    reason_code: str | None = None
    task_no: str | None = None
    process_doc_no: str | None = None
    source_doc_no: str | None = None
    details: dict[str, Any] = field(default_factory=dict)


@dataclass
class Reservation:
    reservation_id: str
    task_no: str
    inventory_id: str | None = None
    inventory_qty: Decimal = Decimal("0")
    location_code: str | None = None
    location_unit: str | None = None
    location_qty: Decimal = Decimal("0")
    resource_id: str | None = None


@dataclass
class SimulationState:
    now: datetime
    documents: dict[str, L1Document] = field(default_factory=dict)
    process_documents: dict[str, L2ProcessDocument] = field(default_factory=dict)
    tasks: dict[str, L3Task] = field(default_factory=dict)
    inventories: dict[str, Inventory] = field(default_factory=dict)
    locations: dict[str, Location] = field(default_factory=dict)
    resources: dict[str, Resource] = field(default_factory=dict)
    reservations: dict[str, Reservation] = field(default_factory=dict)
    events: list[SimulationEvent] = field(default_factory=list)
    decisions: list[DecisionLog] = field(default_factory=list)
    snapshots: list[dict[str, Any]] = field(default_factory=list)
    sequence: int = 0

    def next_sequence(self) -> int:
        self.sequence += 1
        return self.sequence

    def schedule(self, timestamp: datetime, event_type: str, payload: dict[str, Any]) -> None:
        import heapq

        heapq.heappush(
            self.events,
            SimulationEvent(timestamp, self.next_sequence(), event_type, payload),
        )

    def pop_event(self) -> SimulationEvent | None:
        import heapq

        if not self.events:
            return None
        return heapq.heappop(self.events)


def decimal(value: Any) -> Decimal:
    return value if isinstance(value, Decimal) else Decimal(str(value))


def parse_datetime(value: str) -> datetime:
    return datetime.fromisoformat(value)


def minutes_after(start: datetime, minutes: int) -> datetime:
    return start + timedelta(minutes=minutes)
