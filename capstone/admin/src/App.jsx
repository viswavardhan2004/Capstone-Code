import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTransactions from './pages/AdminTransactions';
import AdminDisputes from './pages/AdminDisputes';
import AdminReports from './pages/AdminReports';
import FraudAlertsPage from './pages/FraudAlertsPage';

export default function App() {
  return (
    <Router>
      <AdminLayout>
        <Routes>
          <Route path="/" element={<AdminDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/admin/fraud-alerts" element={<FraudAlertsPage />} />
          <Route path="/admin/users" element={<AdminUsers />} />
          <Route path="/admin/transactions" element={<AdminTransactions />} />
          <Route path="/admin/disputes" element={<AdminDisputes />} />
          <Route path="/admin/reports" element={<AdminReports />} />
        </Routes>
      </AdminLayout>
    </Router>
  );
}