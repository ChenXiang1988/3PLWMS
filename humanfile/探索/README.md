# 仓内作业调度仿真程序

这是一个使用 Python 编写的离散事件仿真程序，按以下链路推进仓内作业：

```text
L1 业务单据 → L2 工序单据 → L3 任务单据 → 资源调度 → 状态回写
```

## 运行环境

- Python 3.12 或更高版本
- PyYAML 6.x

安装依赖：

```bash
python3 -m pip install -r requirements.txt
```

## 校验场景

在本目录执行：

```bash
python3 -m wms_sim validate \
  --scenario scenario/scenario.yaml
```

## 执行仿真

```bash
python3 -m wms_sim simulate \
  --scenario scenario/scenario.yaml \
  --policy budget-reservation-score \
  --seed 20261111 \
  --output runs/20261111-001
```

结果会写入：

```text
runs/20261111-001/
├── run-manifest.json
├── summary.json
├── documents.jsonl
├── process-documents.jsonl
├── tasks.jsonl
├── snapshots.csv
└── decisions.jsonl
```

## 追踪单据

```bash
python3 -m wms_sim trace \
  --run runs/20261111-001 \
  --document OUT-20261111-0001
```

## 当前第一版能力

- 入库单、出库单和明细行；
- L1 → L2 → L3 三层单据派生；
- 到货签收、质检、装容器、上架、补货、拣货、复核、增值加工、打包、集货、出库交接；
- 整托出库、供应商免检、普通订单免加工、单包裹直接交接等节点跳过；
- 库存、库位、人员和叉车的基础约束；
- 事件队列、任务开始、任务完成和资源释放；
- 单据链路、任务状态和调度决策日志输出。

示例场景只用于验证程序链路，不能代替场景资料中完整的 `78` 张 L1 单据生成器。后续扩展应先补充批量场景生成，再增加更复杂的库位、通道、容器和调度策略。
