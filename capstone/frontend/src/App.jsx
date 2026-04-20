import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Auth from './pages/Auth';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';

import ClientDashboard from './pages/ClientDashboard';
import StudentProfile from './pages/StudentProfile';
import StudentGigs from './pages/StudentGigs';
import StudentEarnings from './pages/StudentEarnings';
import StudentOrders from './pages/StudentOrders';
import ClientSearch from './pages/ClientSearch';
import ClientTransactions from './pages/ClientTransactions';
import ClientOrders from './pages/ClientOrders';
import Profile from './pages/Profile';
import PublicProfile from './pages/PublicProfile';
import Messages from './pages/Messages';
import CreateListing from './pages/CreateListing';
import OrderTracking from './pages/OrderTracking';

export default function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/" element={<Home />} />
        
        {/* Student Routes */}
        <Route path="/student/profile" element={<StudentProfile />} />
        <Route path="/student/gigs" element={<StudentGigs />} />
        <Route path="/student/earnings" element={<StudentEarnings />} />
        <Route path="/student/orders" element={<StudentOrders />} />
        
        {/* Client Routes */}
        <Route path="/client/search" element={<ClientSearch />} />
        <Route path="/client/transactions" element={<ClientTransactions />} />
        <Route path="/client/orders" element={<ClientOrders />} />
        

        
        {/* General Routes */}
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/client-dashboard" element={<ClientDashboard />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/profile/:userId" element={<PublicProfile />} />
        <Route path="/create" element={<CreateListing />} />
        <Route path="/order/:orderId" element={<OrderTracking />} />
      </Routes>
    </Router>
  );
}