import { useState } from 'react';
import Shell from './components/Shell.jsx';
import Login from './pages/Login.jsx';
import ProductPage from './pages/ProductPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';
import TransactionsPage from './pages/TransactionsPage.jsx';
import WarehousePage from './pages/WarehousePage.jsx';

const pages = {
  products: ProductPage,
  warehouses: WarehousePage,
  transactions: TransactionsPage,
  reports: ReportsPage
};

function App() {
  const [username, setUsername] = useState(localStorage.getItem('smsUsername') || '');
  const [activePage, setActivePage] = useState('products');

  if (!username) {
    return <Login onLogin={setUsername} />;
  }

  const Page = pages[activePage];

  const logout = () => {
    localStorage.removeItem('smsToken');
    localStorage.removeItem('smsUsername');
    setUsername('');
  };

  return (
    <Shell activePage={activePage} onLogout={logout} onNavigate={setActivePage} username={username}>
      <Page />
    </Shell>
  );
}

export default App;
