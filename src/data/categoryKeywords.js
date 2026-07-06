// Soft-categorization dictionary: the backend Product entity has no
// `category` field, so the frontend infers a category from product
// name + description keywords. Each keyword is matched as a substring (case-insensitive).

export const categoryKeywords = {
  fruit: [
    'avocado', 'avocados', 'apple', 'banana', 'strawberry', 'orange', 'lemon',
    'grape', 'watermelon', 'peach', 'pear', 'blueberry', 'mango', 'kiwi',
    '苹果', '香蕉', '草莓', '橙', '柠檬', '葡萄', '西瓜', '桃子', '梨', '蓝莓', '芒果'
  ],
  vegetable: [
    'salad', 'greens', 'spinach', 'lettuce', 'cabbage', 'cucumber', 'tomato',
    'potato', 'eggplant', 'carrot', 'broccoli', 'pumpkin', '生菜', '菠菜', '白菜',
    '黄瓜', '番茄', '土豆', '茄子', '萝卜', '西蓝花', '南瓜'
  ],
  drinks: [
    'coffee', 'cold brew', 'espresso', 'latte', 'tea', 'juice', 'soda', 'water',
    '可乐', '雪碧', '矿泉水', '咖啡', '奶茶', '果汁', '啤酒', '苏打', '茶', 'matcha'
  ],
  snacks: [
    'chocolate', 'chip', 'cookie', 'biscuit', 'cake', 'bread', 'sourdough',
    'burrito', 'snack', '薯片', '饼干', '巧克力', '蛋糕', '面包', '麻薯', '曲奇'
  ],
  dairy: [
    'milk', 'yogurt', 'cheese', 'butter', 'cream', 'dairy', 'oat milk',
    '牛奶', '酸奶', '奶酪', '黄油', '奶粉'
  ],
  meat: [
    'chicken', 'pork', 'beef', 'lamb', 'duck', 'bacon', 'sausage', 'meat',
    'salmon', 'fillet', '牛', '猪', '鸡', '羊', '鸭', '培根', '香肠', '肉'
  ],
  seafood: [
    'fish', 'shrimp', 'crab', 'shellfish', 'clam', 'scallop', 'salmon', 'tuna',
    '鱼', '虾', '蟹', '贝', '扇贝', '三文鱼', '金枪鱼', '海鲜'
  ],
  frozen: [
    'ice cream', 'frozen', 'freeze', '雪糕', '冰淇淋', '冰激凌', '速冻', '冷冻'
  ],
};

export function inferCategory(product) {
  if (!product) return null;
  const text = `${product.name || ''} ${product.description || ''}`.toLowerCase();
  for (const [catId, kws] of Object.entries(categoryKeywords)) {
    if (kws.some((kw) => text.includes(kw.toLowerCase()))) return catId;
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