// 平台页 key 前缀 → 平台名（用于按 pageKey 在共享数据里过滤出对应平台行）
const MAP = [
  ['wx', '微信小店'],
  ['jd', '京东'],
  ['taobao', '淘宝'],
  ['lazada', 'Lazada'],
  ['amazon', 'Amazon'],
  ['temu', 'Temu'],
  ['tiktok', 'TikTok Shop'],
  ['aliexpress', '速卖通'],
];

export function platformOfKey(key = '') {
  for (const [p, name] of MAP) if (key.startsWith(p + '-')) return name;
  return null;
}
