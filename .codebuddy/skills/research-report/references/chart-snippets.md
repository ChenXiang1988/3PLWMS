# 图表代码片段

七类图的可复制结构。CSS 已在 `assets/report-template.html` 里，新增图型时把对应的 CSS 一并复制过去。所有颜色只用报告令牌，不写死十六进制（矩阵的语义色除外）。

## 0. 通用规则

- 每个图形容器加 `role="img"` 与 `aria-label`，`aria-label` 与 `<figcaption>` 的结论一致。
- 图形包在 `<figure>` 里，`<figcaption>` 写 `图 N ｜ 一句结论`。
- 宽度自适应，不设固定 `width`；SVG 用固定 `viewBox` + `max-width:100%`。
- 打印不跨页：`figure{break-inside:avoid}`（模板已含）。

## 1. 横向条形

**用在哪**：多个对象的同一指标对比（页面数、模块数、定价档数）；第 2、5、6 节。

```html
<figure>
  <div class="bars" role="img" aria-label="各系统页面数量：JeeWMS 118 页、OpenWES 20 节、OpenWCS 19 模块">
    <div class="bar-row"><span class="bar-label">JeeWMS</span><span class="bar-track"><span class="bar" style="width:100%"></span></span><span class="bar-num">118 页</span></div>
    <div class="bar-row"><span class="bar-label">OpenWES</span><span class="bar-track"><span class="bar" style="width:17%"></span></span><span class="bar-num">20 节</span></div>
    <div class="bar-row"><span class="bar-label">OpenWCS</span><span class="bar-track"><span class="bar" style="width:16%"></span></span><span class="bar-num">19 模块</span></div>
  </div>
  <figcaption>图 1 ｜ JeeWMS 的页面数是另两套的六倍，逐页记录只能按它取上限</figcaption>
</figure>
```

```css
.bars{display:grid;gap:8px;margin:14px 0 18px;font-size:13.6px}
.bar-row{display:grid;grid-template-columns:88px minmax(0,1fr) 76px;align-items:center;gap:10px}
.bar-label{color:var(--muted);text-align:right;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.bar-track{height:10px;background:var(--accent-soft);border-radius:2px}
.bar{display:block;height:10px;background:var(--accent);border-radius:2px}
.bar-row.muted .bar{background:#b9c8d6}
.bar-num{font-variant-numeric:tabular-nums;text-align:right;color:var(--ink)}
```

宽度百分比 = 该项数值 ÷ 最大项数值。条从 0 起，不截断基线。

## 2. 堆叠占比条

**用在哪**：三段以内的构成（覆盖率、已看/未看）；第 2 节。

```html
<figure>
  <div class="stack" role="img" aria-label="覆盖构成：已看 62%、未看 24%、不适用 14%">
    <span class="seg s1" style="width:62%">已看 62%</span>
    <span class="seg s2" style="width:24%">未看 24%</span>
    <span class="seg s3" style="width:14%">不适用 14%</span>
  </div>
  <figcaption>图 2 ｜ 未看的 24% 集中在计费与发票两段，其余模块已逐页过</figcaption>
</figure>
```

```css
.stack{display:flex;height:16px;border-radius:3px;overflow:hidden;margin:14px 0 8px;font-size:11px;color:#fff}
.stack .seg{display:flex;align-items:center;justify-content:center;white-space:nowrap;border-right:2px solid var(--paper)}
.stack .seg:last-child{border-right:0}
.stack .s1{background:var(--accent)}
.stack .s2{background:#8ea9bd}
.stack .s3{background:#c9d6e1;color:#33404f}
```

超过三段合并尾部为「其他」。总和不等于 100% 时在图注写口径。

## 3. 步骤链

**用在哪**：线性流程（收货六步、审核流）；第 3 节。

```html
<figure>
  <ol class="steps" role="img" aria-label="收货流程：到货登记 → 验收 → 上架 → 完成">
    <li>到货登记</li>
    <li>验收</li>
    <li>上架</li>
    <li class="end">完成</li>
  </ol>
  <figcaption>图 3 ｜ 验收是唯一可整单退回的节点，上架之后只能冲销</figcaption>
</figure>
```

```css
.steps{display:flex;flex-wrap:wrap;align-items:center;gap:6px;list-style:none;padding:0;margin:14px 0 18px;font-size:13px}
.steps li{background:var(--accent-soft);border:1px solid #cfe1ef;color:#194f75;border-radius:6px;padding:5px 10px;white-space:nowrap}
.steps li:not(:first-child)::before{content:"→";color:var(--faint);margin-right:6px}
.steps li.end{font-weight:650}
.steps li.alt{background:#fff;border-style:dashed;color:var(--muted)}
```

异常分支用 `class="alt"` 另起一行，不横穿主链。

## 4. 状态带

**用在哪**：状态推进与终态；第 3 节、第 5 节。

```html
<figure>
  <div class="band" role="img" aria-label="状态推进：待处理 → 拣货中 → 已复核 → 已发货；已发货为不可逆终态">
    <span class="st">待处理</span><span class="ar">→</span>
    <span class="st">拣货中</span><span class="ar">→</span>
    <span class="st">已复核</span><span class="ar">→</span>
    <span class="st end">已发货</span>
  </div>
  <p class="band-note">逆向：拣货中可撤销回待处理；已复核需反审核</p>
  <figcaption>图 4 ｜ 可逆节点止于已复核，已发货只能走退货单</figcaption>
</figure>
```

```css
.band{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin:14px 0 6px;font-size:13px}
.band .st{border:1px solid var(--line);border-radius:4px;padding:4px 9px;background:#fcfdfe}
.band .st.end{border-bottom:2px solid var(--ink);font-weight:650}
.band .ar{color:var(--faint)}
.band-note{margin:0 0 6px;font-size:12.5px;color:var(--muted)}
```

终态加下边线；不可逆要在图注点明。

## 5. 缩进树

**用在哪**：菜单树、模块层级；第 2 节。

```html
<figure>
  <ul class="tree" role="img" aria-label="菜单树：订单下有订单处理与手工订单，订单处理下有列表与详情">
    <li>订单
      <ul>
        <li>订单处理
          <ul><li>列表</li><li>详情</li></ul>
        </li>
        <li>手工订单</li>
      </ul>
    </li>
  </ul>
  <figcaption>图 5 ｜ 订单段只有两层，第三层是页内抽屉，不进菜单</figcaption>
</figure>
```

```css
.tree,.tree ul{list-style:none;margin:0;padding-left:14px}
.tree{font-size:13.6px;margin:12px 0 18px;color:var(--ink)}
.tree ul{border-left:1px solid var(--line)}
.tree li{position:relative;padding:3px 0 3px 12px;white-space:nowrap}
.tree li::before{content:"";position:absolute;left:0;top:15px;width:8px;border-top:1px solid var(--line)}
.tree > li{padding-left:0}
.tree > li::before{display:none}
```

超过三层折叠为「等 N 项」，不折行。

## 6. 参与者泳道（内联 SVG）

**用在哪**：跨角色或跨系统的交互顺序；第 3 节。

```html
<figure>
  <svg viewBox="0 0 640 200" role="img" aria-label="时序：货主提交计划单，中台受理后分仓，仓库确认并回传执行单" style="max-width:100%;height:auto">
    <g font-size="13" font-family="inherit">
      <rect x="40" y="10" width="120" height="26" rx="4" fill="#eaf2f9" stroke="#cfe1ef"/>
      <text x="100" y="28" text-anchor="middle" fill="#1c2430">货主</text>
      <rect x="260" y="10" width="120" height="26" rx="4" fill="#eaf2f9" stroke="#cfe1ef"/>
      <text x="320" y="28" text-anchor="middle" fill="#1c2430">运营中台</text>
      <rect x="480" y="10" width="120" height="26" rx="4" fill="#eaf2f9" stroke="#cfe1ef"/>
      <text x="540" y="28" text-anchor="middle" fill="#1c2430">仓库</text>
      <line x1="100" y1="40" x2="100" y2="180" stroke="#e2e7ee"/>
      <line x1="320" y1="40" x2="320" y2="180" stroke="#e2e7ee"/>
      <line x1="540" y1="40" x2="540" y2="180" stroke="#e2e7ee"/>
      <line x1="100" y1="70" x2="320" y2="70" stroke="#5a6675"/>
      <text x="210" y="64" text-anchor="middle" fill="#5a6675">提交计划单</text>
      <line x1="320" y1="110" x2="540" y2="110" stroke="#5a6675"/>
      <text x="430" y="104" text-anchor="middle" fill="#5a6675">确认并分仓</text>
      <line x1="540" y1="150" x2="320" y2="150" stroke="#8792a1" stroke-dasharray="4 3"/>
      <text x="430" y="144" text-anchor="middle" fill="#8792a1">回传执行单</text>
    </g>
  </svg>
  <figcaption>图 6 ｜ 分仓是唯一串行点，货主与仓库之间没有直接消息</figcaption>
</figure>
```

参与者不超过四列；消息标签写动作与对象，不写「调用」「处理」。

## 7. 能力矩阵

**用在哪**：多对象 × 多维度；第 1 节证据级、第 5 节能力对比。

```html
<figure>
  <table class="matrix">
    <thead><tr><th>能力维度</th><th>JeeWMS</th><th>OpenWES</th><th>OpenWCS</th></tr></thead>
    <tbody>
      <tr><td>计费链路</td><td class="m-y">有</td><td class="m-n">无</td><td class="m-u">未验证</td></tr>
      <tr><td>波次下发</td><td class="m-y">有</td><td class="m-y">有</td><td class="m-n">无</td></tr>
    </tbody>
  </table>
  <figcaption>图 7 ｜ 三套都缺设备调度与计费的联动，差距在计费一侧</figcaption>
</figure>
```

```css
.matrix td.m-y{background:#e9f4ed;color:#2b6c49}
.matrix td.m-n{background:#fbeded;color:#9c3b3b}
.matrix td.m-u{background:#fdf3e5;color:#9a5b16}
```

三档必须带文字，颜色不单独表意；未验证不能涂成「无」。
