import { createBrowserRouter } from 'react-router-dom';
import App from '../App';
import HomePage from '../pages/Home/HomePage';
import CategoryPage from '../pages/Category/CategoryPage';
import CartPage from '../pages/Cart/CartPage';
import CheckoutPage from '../pages/Checkout/CheckoutPage';
import OrderDetailPage from '../pages/OrderDetail/OrderDetailPage';
import LogisticsPage from '../pages/Logistics/LogisticsPage';
import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import MyOrdersPage from '../pages/Orders/MyOrdersPage';
import ProfilePage from '../pages/Profile/ProfilePage';
import RequireAuth from '../components/RequireAuth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'signup', element: <SignupPage /> },
      {
        path: 'category/:id?',
        element: (
          <RequireAuth>
            <CategoryPage />
          </RequireAuth>
        ),
      },
      {
        path: 'cart',
        element: (
          <RequireAuth>
            <CartPage />
          </RequireAuth>
        ),
      },
      {
        path: 'checkout',
        element: (
          <RequireAuth>
            <CheckoutPage />
          </RequireAuth>
        ),
      },
      {
        path: 'order/:orderNo',
        element: (
          <RequireAuth>
            <OrderDetailPage />
          </RequireAuth>
        ),
      },
      {
        path: 'logistics/:orderNo',
        element: (
          <RequireAuth>
            <LogisticsPage />
          </RequireAuth>
        ),
      },
      {
        path: 'orders',
        element: (
          <RequireAuth>
            <MyOrdersPage />
          </RequireAuth>
        ),
      },
      {
        path: 'profile',
        element: (
          <RequireAuth>
            <ProfilePage />
          </RequireAuth>
        ),
      },
    ],
  },
]);