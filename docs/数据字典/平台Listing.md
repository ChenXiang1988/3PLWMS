# 平台Listing（数据字典）

> 实体：平台Listing（Platform Listing）｜对应原型页面：商品 / 平台 Listing（`owner` 模块 `listing-list`）
> 定位：SPU 变体在各平台店铺的刊登记录，承接价格与库存推送状态。

## 1. Listing 字段

| 字段 key | 中文名 | 类型 | 长度 | 必填 | 取值 / 口径 | 说明 / 关联 |
| --- | --- | --- | --- | --- | --- | --- |
| `listingCode` | Listing 编码 | String | 24 | 是 | `LS` + 流水 | 全局唯一 |
| `platformCode` | 平台 | String | 20 | 是 | 关联平台主档 | |
| `shopCode` | 店铺 | String | 20 | 是 | 关联平台店铺 | |
| `platformItemId` | 平台商品 ID | String | 64 | 否 | 平台返回 | |
| `platformSku` | 平台 SKU | String | 64 | 否 | 平台返回 | |
| `spuCode` | SPU | String | 24 | 是 | 关联 SPU | |
| `variantCode` | 变体 | String | 24 | 否 | 关联变体 | |
| `pricePushStatus` | 价格推送状态 | Enum | — | 是 | 未推送 / 已推送 / 推送失败 | |
| `stockPushStatus` | 库存推送状态 | Enum | — | 是 | 未推送 / 已推送 / 推送失败 | |
| `updateTime` | 更新时间 | Datetime | — | 是 | | |

## 2. 状态与口径

- 一个变体在一个店铺只有一条 Listing。
- 推送失败保留失败原因，重试不新建行。
- 平台商品 ID 与平台 SKU 由平台返回，不手工造。

## 3. 与其它主档的关系

- SPU、变体：两个外键。
- 平台店铺：`shopCode` 为外键。
- 刊登任务：一个任务可生成多条 Listing。

## 4. 原型衔接建议

- 页面：`owner/listing-list`，list 骨架，按平台、店铺、推送状态筛选。
- 行动作：重新推送；抽屉展示平台商品 ID 与推送轨迹。
