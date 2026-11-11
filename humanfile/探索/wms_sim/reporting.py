from __future__ import annotations

import csv
import json
from dataclasses import asdict
from decimal import Decimal
from pathlib import Path
from typing import Any

from .models import SimulationState


def json_default(value: Any):
    if isinstance(value, Decimal):
        return str(value)
    if hasattr(value, "isoformat"):
        return value.isoformat()
    if isinstance(value, set):
        return sorted(value)
    raise TypeError(f"不支持序列化：{type(value).__name__}")


def write_json(path: Path, data: Any) -> None:
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2, default=json_default), encoding="utf-8")


def write_jsonl(path: Path, rows: list[Any]) -> None:
    with path.open("w", encoding="utf-8") as stream:
        for row in rows:
            stream.write(json.dumps(row, ensure_ascii=False, default=json_default) + "\n")


def summary(state: SimulationState) -> dict[str, Any]:
    documents = list(state.documents.values())
    processes = list(state.process_documents.values())
    tasks = list(state.tasks.values())
    return {
        "businessDate": state.now.date().isoformat(),
        "documents": {
            "inbound": sum(item.doc_type == "inbound" for item in documents),
            "outbound": sum(item.doc_type == "outbound" for item in documents),
            "total": len(documents),
        },
        "processDocuments": {
            "total": len(processes),
            "completed": sum(item.status == "completed" for item in processes),
            "readyOrRunning": sum(item.status in {"ready", "released", "running"} for item in processes),
        },
        "tasks": {
            "total": len(tasks),
            "completed": sum(item.status == "completed" for item in tasks),
            "blocked": sum(item.status == "blocked" for item in tasks),
            "waiting": sum(item.status == "waiting" for item in tasks),
            "carryOver": sum(item.status == "carry_over" for item in tasks),
        },
        "resources": {
            resource.resource_id: {
                "type": resource.resource_type,
                "status": resource.status,
                "location": resource.location,
            }
            for resource in state.resources.values()
        },
    }


def export_run(state: SimulationState, output_dir: str | Path, scenario_code: str, policy_code: str, seed: int) -> Path:
    output = Path(output_dir)
    output.mkdir(parents=True, exist_ok=True)
    write_json(output / "summary.json", summary(state))
    write_json(output / "run-manifest.json", {
        "scenarioCode": scenario_code,
        "policyCode": policy_code,
        "seed": seed,
        "simulationNow": state.now,
    })
    write_jsonl(output / "documents.jsonl", [asdict(item) for item in state.documents.values()])
    write_jsonl(output / "process-documents.jsonl", [asdict(item) for item in state.process_documents.values()])
    write_jsonl(output / "tasks.jsonl", [asdict(item) for item in state.tasks.values()])
    write_jsonl(output / "decisions.jsonl", [asdict(item) for item in state.decisions])
    with (output / "snapshots.csv").open("w", encoding="utf-8", newline="") as stream:
        rows = state.snapshots
        fieldnames = ["timestamp", "runningTasks", "completedTasks", "blockedTasks", "waitingTasks"]
        writer = csv.DictWriter(stream, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    return output
