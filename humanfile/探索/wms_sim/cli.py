from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime
from pathlib import Path

from .engine import SimulationEngine
from .models import SimulationState
from .reporting import export_run, summary
from .scenario import (
    ScenarioError,
    build_documents,
    build_inventory,
    build_locations,
    build_resources,
    load_scenario,
    validate_scenario,
)


def build_state(data: dict) -> SimulationState:
    warehouse = data.get("warehouse", {}).get("warehouse", data.get("warehouse", {}))
    business_date = warehouse.get("businessDate", "2026-11-11")
    start_time = warehouse.get("simulationStart", f"{business_date}T08:30:00")
    state = SimulationState(now=datetime.fromisoformat(start_time))
    state.documents = build_documents(data.get("documents", {}))
    state.locations = build_locations(data.get("locations", {}))
    state.inventories = build_inventory(data.get("inventory", {}))
    state.resources = build_resources(data.get("resources", {}))
    return state


def command_validate(args: argparse.Namespace) -> int:
    data = load_scenario(args.scenario)
    errors = validate_scenario(data)
    if errors:
        print(json.dumps({"valid": False, "errors": errors}, ensure_ascii=False, indent=2))
        return 1
    print(json.dumps({"valid": True, "message": "场景校验通过"}, ensure_ascii=False, indent=2))
    return 0


def command_simulate(args: argparse.Namespace) -> int:
    data = load_scenario(args.scenario)
    errors = validate_scenario(data)
    if errors:
        print(json.dumps({"valid": False, "errors": errors}, ensure_ascii=False, indent=2))
        return 1
    state = build_state(data)
    warehouse = data.get("warehouse", {}).get("warehouse", data.get("warehouse", {}))
    business_date = warehouse.get("businessDate", "2026-11-11")
    end_time = datetime.fromisoformat(warehouse.get("simulationEnd", f"{business_date}T22:00:00"))
    engine = SimulationEngine(state, end_time)
    engine.run()
    scenario_meta = data.get("meta", {})
    export_run(
        state,
        args.output,
        scenario_meta.get("code", "WMS-SIM"),
        args.policy,
        args.seed,
    )
    print(json.dumps(summary(state), ensure_ascii=False, indent=2, default=str))
    return 0


def command_trace(args: argparse.Namespace) -> int:
    run_dir = Path(args.run)
    documents = {}
    for line in (run_dir / "documents.jsonl").read_text(encoding="utf-8").splitlines():
        row = json.loads(line)
        if row.get("doc_no", row.get("docNo")) == args.document:
            documents[args.document] = row
    if not documents:
        print(f"找不到单据：{args.document}", file=sys.stderr)
        return 1
    process_rows = [json.loads(line) for line in (run_dir / "process-documents.jsonl").read_text(encoding="utf-8").splitlines()]
    task_rows = [json.loads(line) for line in (run_dir / "tasks.jsonl").read_text(encoding="utf-8").splitlines()]
    related_processes = [row for row in process_rows if args.document in row.get("source_doc_nos", row.get("sourceDocNos", []))]
    for process in related_processes:
        process_no = process.get("process_doc_no", process.get("processDocNo"))
        print(f"{process_no} {process.get('node_name', process.get('nodeName'))} [{process.get('status')}]")
        for task in task_rows:
            if task.get("process_doc_no", task.get("processDocNo")) == process_no:
                print(f"  └── {task.get('task_no', task.get('taskNo'))} [{task.get('status')}]")
    return 0


def make_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(prog="wms-sim", description="仓内作业调度离散事件仿真程序")
    subparsers = parser.add_subparsers(dest="command", required=True)

    validate = subparsers.add_parser("validate", help="校验场景")
    validate.add_argument("--scenario", required=True)
    validate.set_defaults(handler=command_validate)

    simulate = subparsers.add_parser("simulate", help="运行仿真")
    simulate.add_argument("--scenario", required=True)
    simulate.add_argument("--policy", default="budget-reservation-score")
    simulate.add_argument("--seed", type=int, default=20261111)
    simulate.add_argument("--output", required=True)
    simulate.set_defaults(handler=command_simulate)

    trace = subparsers.add_parser("trace", help="追踪单据")
    trace.add_argument("--run", required=True)
    trace.add_argument("--document", required=True)
    trace.set_defaults(handler=command_trace)
    return parser


def main(argv: list[str] | None = None) -> int:
    parser = make_parser()
    args = parser.parse_args(argv)
    try:
        return args.handler(args)
    except (ScenarioError, KeyError, ValueError) as error:
        print(f"错误：{error}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
