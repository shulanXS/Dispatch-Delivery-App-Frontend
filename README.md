# SkyDrop App - 前端开发文档

## 一、项目概述

本项目是一个**无人配送商超App**前端，采用 React + Vite 技术栈，实现完整的购物流程：从商品浏览、加购、结算、到无人机/机器人配送追踪。

### 主题特色
- 无人配送（无人机 + 地面机器人）
- 极速配送体验
- 实时物流追踪

---

## 二、技术栈

| 类别 | 技术 | 说明 |
|------|------|------|
| 框架 | React 18 + Vite | 现代前端标配 |
| 路由 | React Router v6 | 官方推荐路由 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 样式 | Tailwind CSS | 原子化CSS框架 |
| 图标 | Lucide React | 现代简约图标 |
| HTTP | Axios | 可扩展的HTTP库 |

---

## 三、开发环境

### 环境要求
- Node.js >= 18
- npm 或 yarn
- Android SDK（构建 APK 时需要）

### 快速开始

```bash
# 克隆仓库
git clone https://github.com/shulanXS/Dispatch-Delivery-App-Frontend.git
cd Dispatch-Delivery-App-Frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### Android APK 打包

```bash
# 添加 Android 平台（如已存在可跳过）
npx cap add android

# 同步 Web 代码到 Android 项目
npx cap sync android

# 打开 Android Studio
npx cap open android

# 或使用命令行构建 APK
cd android
./gradlew assembleDebug
```

构建完成后，APK 文件位于：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### PWA 说明

项目已配置 PWA（渐进式 Web 应用）：
- `public/manifest.json` - PWA 清单配置
- `public/sw.js` - Service Worker，支持离线缓存
- 图标位于 `public/icons/`

---

## 四、分支规范

```
main            → 稳定版本/最终提交版本（禁止直接修改）
dev             → 开发主分支（所有功能合并至此）
feature-姓名/模块 → 个人功能开发分支
```

### 开发流程

```bash
# 1. 切换到 dev 并同步最新代码
git checkout dev
git pull origin dev

# 2. 从 dev 创建个人功能分支
git checkout -b feature-zhangsan/home

# 3. 开发完成后提交
git add .
git commit -m "完成首页布局"

# 4. 推送到远程并创建 PR
git push origin feature-zhangsan/home
```

### 分支命名示例

| 分支名 | 说明 |
|--------|------|
| feature-zhangsan/home | 张三负责首页 |
| feature-lisi/category | 李四负责分类商品 |
| feature-wangwu/cart | 王五负责购物车 |

### 提交信息规范

```
完成首页布局
新增商品卡片组件
修复购物车数量计算bug
优化物流追踪时间线样式
```

---

## 五、目录结构

```
src/
├── assets/                 # 静态资源
│   └── images/            # 商品图片
├── components/            # 公共组件
│   ├── Header.jsx         # 顶部导航
│   ├── ProductCard.jsx    # 商品卡片
│   └── CartItem.jsx       # 购物车商品项
├── pages/                 # 页面组件
│   ├── Home/              # 首页（组员A）
│   ├── Category/          # 分类商品（组员B）
│   ├── Cart/              # 购物车（组员C）
│   ├── Checkout/          # 订单结算（组员D）
│   ├── OrderDetail/       # 订单详情（组员E）
│   └── Logistics/         # 物流追踪（组员E）
├── store/                 # Zustand 状态管理
│   ├── useProductStore.js
│   ├── useCartStore.js
│   ├── useOrderStore.js
│   └── useDeliveryStore.js
├── mock/                  # Mock 静态数据
│   ├── categories.js      # 分类数据
│   ├── products.js        # 商品数据（40个商品）
│   └── addresses.js       # 地址数据
├── router/
│   └── index.jsx          # 路由配置
├── App.jsx
├── main.jsx
└── index.css
```

---

## 六、页面路由对照表

| 路由 | 页面 | 负责人 | 依赖 Store | 说明 |
|------|------|--------|------------|------|
| `/` | 首页 | 组员A | useProductStore | 入口页面，展示分类和活动 |
| `/category/:id?` | 分类商品 | 组员B | useProductStore, useCartStore | 商品列表，可加购 |
| `/cart` | 购物车 | 组员C | useCartStore | 购物车管理 |
| `/checkout` | 订单结算 | 组员D | useCartStore, useOrderStore, useDeliveryStore | 结算和配送选择 |
| `/order/:id` | 订单详情 | 组员E | useOrderStore | 订单信息展示 |
| `/logistics/:id` | 物流追踪 | 组员E | useOrderStore, useDeliveryStore | 实时配送追踪 |

---

## 七、数据结构规范

### 商品数据 Product

```javascript
{
  id: string,        // 唯一标识，如 'p001'
  name: string,     // 商品名称，如 '有机生菜'
  price: number,    // 单价，如 6.90
  category: string,  // 分类ID，如 'vegetable'
  unit: string,      // 规格单位，如 '500g'
  image: string      // 图片路径，如 '/images/vegetable'
}
```

### 购物车项 CartItem

```javascript
{
  productId: string,  // 商品ID
  name: string,      // 商品名称
  price: number,     // 单价
  image: string,     // 图片路径
  quantity: number,  // 数量
  selected: boolean  // 是否选中
}
```

### 订单 Order

```javascript
{
  orderId: string,           // 订单号，如 'ORD1718800000000'
  status: 'confirmed' | 'preparing' | 'shipping' | 'arriving' | 'done',
  items: CartItem[],         // 订单商品
  totalAmount: number,       // 商品总金额
  deliveryMethod: 'drone' | 'robot',
  deliveryFee: number,       // 配送费
  discount: number,          // 优惠金额
  address: Address,          // 收货地址
  createTime: string,        // 下单时间（ISO格式）
  estimatedTime: string      // 预计送达时间
}
```

### 地址 Address

```javascript
{
  id: string,
  name: string,      // 收货人姓名
  phone: string,     // 联系电话
  detail: string,    // 详细地址
  isDefault: boolean // 是否默认地址
}
```

### 物流 Logistics

```javascript
{
  orderId: string,
  currentStep: number,  // 当前步骤索引（0-4）
  steps: [
    { status: string, text: string, time: string }
  ],
  equipment: {
    type: 'drone' | 'robot',
    distance: number,    // 距离（米）
    speed: number,      // 速度（km/h）
    battery: number     // 电量（%）
  }
}
```

---

## 八、Store 使用规范

### useProductStore

```javascript
import { useProductStore } from '../../store/useProductStore';

// 获取所有商品
const products = useProductStore(state => state.products);

// 获取所有分类
const categories = useProductStore(state => state.categories);

// 按分类筛选商品
const getProductsByCategory = useProductStore(state => state.getProductsByCategory);
const vegetableProducts = getProductsByCategory('vegetable');

// 根据ID获取商品
const getProductById = useProductStore(state => state.getProductById);
const product = getProductById('p001');
```

### useCartStore

```javascript
import { useCartStore } from '../../store/useCartStore';

// 添加商品到购物车
const addToCart = useCartStore(state => state.addToCart);
addToCart(product);

// 更新商品数量
const updateQuantity = useCartStore(state => state.updateQuantity);
updateQuantity('p001', 3);

// 切换商品选中状态
const toggleSelected = useCartStore(state => state.toggleSelected);
toggleSelected('p001');

// 全选/取消全选
const toggleSelectAll = useCartStore(state => state.toggleSelectAll);

// 删除商品
const removeFromCart = useCartStore(state => state.removeFromCart);
removeFromCart('p001');

// 清空购物车
const clearCart = useCartStore(state => state.clearCart);

// 获取选中的商品
const getSelectedItems = useCartStore(state => state.getSelectedItems);

// 获取总价
const getTotalPrice = useCartStore(state => state.getTotalPrice);
const total = getTotalPrice();

// 获取已选商品数量
const getTotalCount = useCartStore(state => state.getTotalCount);
const count = getTotalCount();
```

### useOrderStore

```javascript
import { useOrderStore } from '../../store/useOrderStore';

// 创建订单
const createOrder = useCartStore(state => state.createOrder);
const order = createOrder({
  items: [...],
  totalAmount: 100.00,
  deliveryMethod: 'drone',
  deliveryFee: 5.00,
  discount: 3.00,
  address: {...},
  estimatedTime: '15-25分钟'
});

// 根据ID获取订单
const getOrderById = useOrderStore(state => state.getOrderById);
const order = getOrderById('ORD1718800000000');

// 更新订单状态
const updateOrderStatus = useOrderStore(state => state.updateOrderStatus);
updateOrderStatus('ORD1718800000000', 'shipping');
```

### useDeliveryStore

```javascript
import { useDeliveryStore } from '../../store/useDeliveryStore';

// 设置配送方式
const setDeliveryMethod = useDeliveryStore(state => state.setDeliveryMethod);
setDeliveryMethod('drone'); // 或 'robot'

// 获取当前配送方式
const deliveryMethod = useDeliveryStore(state => state.deliveryMethod);

// 获取模拟物流数据
const getMockLogistics = useDeliveryStore(state => state.getMockLogistics);
const logistics = getMockLogistics(orderId, 'drone');
```

---

## 九、组件开发规范

### 样式开发
- 使用 Tailwind CSS 进行样式开发
- 遵循移动端优先设计
- 最大宽度 `max-w-md`（428px），居中显示

### 组件规范
- 公共组件放在 `src/components/` 目录
- 页面组件放在 `src/pages/` 对应目录
- 使用 Lucide React 图标库

### 图标使用示例

```javascript
import { ShoppingCart, MapPin, Plane } from 'lucide-react';

// 使用方式
<ShoppingCart className="w-6 h-6" />
<MapPin className="w-5 h-5 text-blue-600" />
<Plane className="w-8 h-8 text-blue-600" />
```

---

## 十、组员分工

| 组员 | 负责模块 | 主要任务 |
|------|---------|---------|
| 组员A | 首页 | 首页布局、品牌展示、分类入口、活动区域 |
| 组员B | 分类商品 | 商品列表、搜索筛选、加入购物车 |
| 组员C | 购物车 | 商品管理、数量修改、结算流程 |
| 组员D | 订单结算 | 地址管理、配送选择、订单提交 |
| 组员E | 订单详情+物流 | 订单信息展示、物流时间线、实时追踪 |

---

## 十一、注意事项

1. **禁止直接修改公共组件**
   - 如需修改 `Header`、`ProductCard`、`CartItem` 等公共组件，请先与组长沟通

2. **保持数据格式一致**
   - 所有接口数据必须符合文档中的数据结构规范

3. **及时处理冲突**
   - 遇到 Git 冲突请及时在群里沟通，不要强行覆盖

4. **PR 审查**
   - 所有 PR 必须经过组长 review 后才能合并到 dev 分支

5. **保持分支同步**
   - 开发前务必先 pull 最新代码到 dev 分支

---

## 十二、问题反馈

如有技术问题或需求变更，请及时在群里沟通或提交 Issue。
