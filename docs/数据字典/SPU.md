# SPU（数据字典）

> 实体：SPU（Standard Product Unit）｜对应原型页面：商品 / SPU 列表（`owner` 模块 `spu-list`）
> 定位：商品中枢的第一层，统一品名与品类；变体、平台 Listing 与仓储 SKU 都挂在 SPU 下。

## 1. SPU 字段

| 字段 key | 中文名 | 类型 | 长度 | 必填 | 取值 / 口径 | 说明 / 关联 |
| --- | --- | --- | --- | --- | --- | --- |
| `spuCode` | SPU 编码 | String | 24 | 是 | `SP` + 流水 | 全局唯一 |
| `spuName` | 品名 | String | 120 | 是 | | |
| `category` | 品类 | String | 40 | 是 | 商城类目或自建类目 | |
| `brand` | 品牌 | String | 40 | 否 | | |
| `lifecycleStatus` | 生命周期 | Enum | — | 是 | 在售 / 热销 / 新品 / 滞销 / 清仓 / 停售 | |
| `variantCount` | 变体数 | Int | — | 否 | 派生 | |
| `listingCount` | Listing 数 | Int | — | 否 | 派生 | |
| `skuCount` | 仓储 SKU 数 | Int | — | 否 | 派生，可为 0 | |
| `updateTime` | 更新时间 | Datetime | — | 是 | 系统写入 | |

## 2. 状态与口径

- 生命周期按近 30 天销量与上架时间派生，不手工改。
- SPU 与仓储 SKU 的关联可为空：一件代发不必建仓储 SKU。
- 停售只影响新建 Listing，不影响已下订单。

## 3. 与其它主档的关系

- 变体：一对多。
- 平台 Listing：一个 SPU 可对应多平台多店铺 Listing。
- 商品主档：仓储 SKU 挂在 SPU 下，可为空。

## 4. 原型衔接建议

- 页面：`owner/spu-list`，list 骨架，按生命周期筛选。
- 行抽屉：商品详情 / 商品配对两个页签；配对页签含匹配状态与批量匹配。
