import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/Home/HomePage';
import CategoryPage from '../pages/Category/CategoryPage';
import CartPage from '../pages/Cart/CartPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import OrderDetailPage from '../pages/OrderDetail/OrderDetailPage';
import LogisticsPage from '../pages/Logistics/LogisticsPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'category/:id?', element: <CategoryPage /> },
      { path: 'cart', element: <CartPage /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'order/:id', element: <OrderDetailPage /> },
      { path: 'logistics/:id', element: <LogisticsPage /> },
    ],
  },
]);
