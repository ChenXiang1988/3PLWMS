from __future__ import annotations

from datetime import datetime
from pathlib import Path
from typing import Any

try:
    import yaml
except ImportError:  # pragma: no cover - 给无 PyYAML 环境清晰提示
    yaml = None

from .models import (
    DocumentLine,
    Inventory,
    L1Document,
    Location,
    Resource,
    decimal,
    parse_datetime,
)


class ScenarioError(ValueError):
    """场景输入不符合仿真要求。"""


def load_yaml(path: Path) -> dict[str, Any]:
    if yaml is None:
        raise ScenarioError("缺少 PyYAML，请先执行 pip install -r requirements.txt")
    with path.open("r", encoding="utf-8") as stream:
        data = yaml.safe_load(stream) or {}
    if not isinstance(data, dict):
        raise ScenarioError(f"场景文件必须是对象：{path}")
    return data


def load_scenario(path: str | Path) -> dict[str, Any]:
    entry = Path(path).resolve()
    root = load_yaml(entry)
    scenario = root.get("scenario", root)
    if not isinstance(scenario, dict):
        raise ScenarioError("scenario 必须是对象")

    loaded: dict[str, Any] = {"meta": scenario}
    for key in ("warehouse", "locations", "inventory", "documents", "process_routes", "resources", "policies"):
        file_key = "process-routes" if key == "process_routes" else key
        ref = scenario.get(file_key, scenario.get(key))
        if isinstance(ref, str):
            loaded[key] = load_yaml(entry.parent / ref)
        else:
            loaded[key] = ref or {}
    return loaded


def _rows(data: Any, key: str) -> list[dict[str, Any]]:
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        rows = data.get(key, [])
        if isinstance(rows, list):
            return rows
        if isinstance(rows, dict):
            nested = rows.get(key, [])
            return nested if isinstance(nested, list) else []
    return []


def build_documents(data: dict[str, Any] | list[dict[str, Any]]) -> dict[str, L1Document]:
    rows = _rows(data, "documents")
    documents: dict[str, L1Document] = {}
    for row in rows:
        lines = [
            DocumentLine(
                line_no=int(item["lineNo"]),
                sku=str(item["sku"]),
                plan_qty=decimal(item["planQty"]),
                unit=str(item["unit"]),
                batch_no=str(item.get("batchNo", "")),
                container_type=str(item.get("containerType", "carton")),
                source_location=item.get("sourceLocation"),
                target_location=item.get("targetLocation"),
                need_qc=bool(item.get("needQc", False)),
                cross_dock=bool(item.get("crossDock", False)),
                picking_mode=str(item.get("pickingMode", "piece")),
                need_check=bool(item.get("needCheck", False)),
                need_value_added=bool(item.get("needValueAdded", False)),
                need_pack=bool(item.get("needPack", False)),
                need_consolidation=bool(item.get("needConsolidation", False)),
            )
            for item in row.get("lines", [])
        ]
        documents[row["docNo"]] = L1Document(
            doc_no=str(row["docNo"]),
            doc_type=str(row["docType"]),
            warehouse=str(row.get("warehouse", "WH-001")),
            owner=str(row.get("owner", "OWNER-001")),
            plan_time=parse_datetime(row["planTime"]),
            priority=int(row.get("priority", 1)),
            lines=lines,
            inbound_type=row.get("inboundType"),
            outbound_type=row.get("outboundType"),
            due_time=parse_datetime(row["dueTime"]) if row.get("dueTime") else None,
            status=str(row.get("status", "released")),
        )
    return documents


def build_locations(data: dict[str, Any] | list[dict[str, Any]]) -> dict[str, Location]:
    rows = _rows(data, "locations")
    return {
        row["code"]: Location(
            code=str(row["code"]),
            zone=str(row.get("zone", "")),
            location_type=str(row.get("type", "")),
            capacity={key: decimal(value) for key, value in row.get("capacity", {}).items()},
            occupied={key: decimal(value) for key, value in row.get("occupied", {}).items()},
            reserved={key: decimal(value) for key, value in row.get("reserved", {}).items()},
            status=str(row.get("status", "available")),
        )
        for row in rows
    }


def build_inventory(data: dict[str, Any] | list[dict[str, Any]]) -> dict[str, Inventory]:
    rows = _rows(data, "inventory")
    result = {}
    for row in rows:
        item = Inventory(
            inventory_id=str(row["inventoryId"]),
            owner=str(row["owner"]),
            sku=str(row["sku"]),
            batch_no=str(row.get("batchNo", "")),
            container_type=str(row.get("containerType", "carton")),
            quantity=decimal(row["quantity"]),
            unit=str(row["unit"]),
            location=str(row["location"]),
            available_qty=decimal(row.get("availableQty", row["quantity"])),
            locked_qty=decimal(row.get("lockedQty", 0)),
        )
        result[item.inventory_id] = item
    return result


def build_resources(data: dict[str, Any] | list[dict[str, Any]]) -> dict[str, Resource]:
    rows = _rows(data, "resources")
    return {
        row["resourceId"]: Resource(
            resource_id=str(row["resourceId"]),
            resource_type=str(row["resourceType"]),
            capabilities=set(row.get("capabilities", [])),
            location=str(row.get("location", "")),
            capacity=int(row.get("capacity", 1)),
            status=str(row.get("status", "available")),
        )
        for row in rows
    }


def validate_scenario(data: dict[str, Any]) -> list[str]:
    errors: list[str] = []
    documents = build_documents(data)
    locations = build_locations(data)
    inventory = build_inventory(data)
    resources = build_resources(data)

    if not documents:
        errors.append("documents 不能为空")
    for doc in documents.values():
        if not doc.lines:
            errors.append(f"{doc.doc_no} 没有明细行")
        for line in doc.lines:
            if line.plan_qty <= 0:
                errors.append(f"{doc.doc_no}/{line.line_no} 的 planQty 必须大于 0")

    for item in inventory.values():
        if item.location not in locations:
            errors.append(f"库存 {item.inventory_id} 引用了不存在的位置 {item.location}")
        if item.available_qty < 0 or item.locked_qty < 0:
            errors.append(f"库存 {item.inventory_id} 的数量不能为负数")
        if item.available_qty + item.locked_qty > item.quantity:
            errors.append(f"库存 {item.inventory_id} 的可用数和锁定数超过总量")

    if len(resources) == 0:
        errors.append("resources 不能为空")
    for location in locations.values():
        for unit in set(location.capacity) | set(location.occupied) | set(location.reserved):
            if location.capacity.get(unit, decimal(0)) < 0 or location.occupied.get(unit, decimal(0)) < 0 or location.reserved.get(unit, decimal(0)) < 0:
                errors.append(f"位置 {location.code} 的容量或占用不能为负数")
            if location.occupied.get(unit, decimal(0)) + location.reserved.get(unit, decimal(0)) > location.capacity.get(unit, decimal(0)):
                errors.append(f"位置 {location.code}/{unit} 的占用和预占超过容量")
    return errors
