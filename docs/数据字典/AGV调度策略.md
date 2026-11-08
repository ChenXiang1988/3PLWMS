# AGV调度策略（数据字典）

> 实体：AGV 调度策略（AGV Strategy）｜对应原型页面：设备与容器 / AGV 调度策略（`resource` 模块 `agv-strategy`）
> 定位：AGV 任务分配、充电与避让规则；字段为 C 级推断，原型只做结构与演示值。

## 1. 策略字段

| 字段 key | 中文名 | 类型 | 长度 | 必填 | 取值 / 口径 | 说明 / 关联 |
| --- | --- | --- | --- | --- | --- | --- |
| `strategyCode` | 策略编码 | String | 20 | 是 | 全局唯一 | |
| `warehouseCode` | 仓库 | String | 20 | 是 | 关联仓库主档 | |
| `priorityRule` | 优先级规则 | Enum | — | 是 | 先到先做 / 最短路径 / 任务类型优先 | |
| `chargeThreshold` | 充电阈值 | Int | — | 是 | 电量百分比 | |
| `chargeIdleMinutes` | 空闲充电分钟 | Int | — | 否 | 空闲多久去充电 | |
| `avoidZone` | 避让区 | String | 120 | 否 | 库区编码，逗号分隔 | |
| `maxTaskPerRobot` | 单机任务上限 | Int | — | 是 | | |
| `strategyStatus` | 状态 | Enum | — | 是 | 启用 / 停用 | |

## 2. 状态与口径

- 同一仓库只有一套启用策略。
- 充电阈值与空闲充电分钟同时满足才触发充电。
- 避让区内的任务不分配给 AGV。

## 3. 与其它主档的关系

- 仓库主档：`warehouseCode` 为外键。
- 设备档案：按设备类型 AGV 生效。
- 任务池任务：派工按本策略排序。

## 4. 原型衔接建议

- 页面：`resource/agv-strategy`，list 骨架，按启停页签。
- 动作：启用、停用；字段只做结构，不写死阈值。
