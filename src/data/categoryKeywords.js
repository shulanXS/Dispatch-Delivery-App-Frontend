// Soft-categorization dictionary: the backend Product entity has no
// `category` field, so the frontend infers a category from product
// name + description keywords. Each keyword is matched as a substring.
// This is intentionally a transitional solution; once the backend
// exposes `products.category`, the lookup helpers can be replaced
// with a direct field read.

export const categoryKeywords = {
  vegetable: ['生菜', '菠菜', '白菜', '黄瓜', '番茄', '土豆', '茄子', '萝卜', '西蓝花', '南瓜'],
  fruit: ['苹果', '香蕉', '草莓', '橙', '柠檬', '葡萄', '西瓜', '桃子', '梨', '蓝莓'],
  drinks: ['可乐', '雪碧', '矿泉水', '咖啡', '奶茶', '果汁', '啤酒', '苏打', '茶'],
  snacks: ['薯片', '饼干', '巧克力', '蛋糕', '面包', '麻薯', '曲奇'],
  dairy: ['牛奶', '酸奶', '奶酪', '黄油', '奶粉'],
  meat: ['鸡', '猪', '牛', '羊', '鸭', '培根', '香肠'],
  seafood: ['鱼', '虾', '蟹', '贝', '扇贝', '三文鱼'],
  frozen: ['冰激凌', '速冻', '冷冻', '雪糕'],
};

export function inferCategory(product) {
  if (!product) return null;
  const text = `${product.name || ''} ${product.description || ''}`;
  for (const [catId, kws] of Object.entries(categoryKeywords)) {
    if (kws.some((kw) => text.includes(kw))) return catId;
  }
  return 'other';
}

export function groupProductsByCategory(products) {
  const buckets = {};
  for (const p of products || []) {
    const cat = inferCategory(p);
    if (!buckets[cat]) buckets[cat] = [];
    buckets[cat].push(p);
  }
  return buckets;
}