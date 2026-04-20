import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Shield, AlertCircle, LogOut, CheckCircle, Clock, DollarSign, Eye, TrendingUp, Activity, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function AdminDashboard() {
  const [alert, setAlert] = useState(null);
  const [stats, setStats] = useState({
    users: { total: 0, students: 0, clients: 0 },
    transactions: { total: 0, completed: 0, pending: 0, inEscrow: 0, rejected: 0, recentTrend: 0 },
    revenue: { total: 0, completed: 0, pending: 0, commission: 0, avgValue: 0 },
    metrics: { successRate: 0, avgTransactionValue: 0 },
    topStudents: [],
    statusBreakdown: []
  });
  const [pendingPayments, setPendingPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectConfirm, setRejectConfirm] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    if (userType !== 'admin') {
      navigate('/');
    }
    fetchPendingPayments();
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const statsResponse = await fetch(`${API_URL}/admin/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const fetchPendingPayments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/escrow/pending`);
      const data = await response.json();
      setPendingPayments(data);
    } catch (error) {
      console.error('Failed to fetch pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async (transactionId) => {
    try {
      setConfirming(transactionId);
      const response = await fetch(`${API_URL}/escrow/admin-confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });

      if (response.ok) {
        setAlert({ message: '✓ Payment confirmed! Funds locked in escrow', type: 'success' });
        fetchPendingPayments();
        setSelectedPayment(null);
      } else {
        setAlert({ message: '❌ Error confirming payment', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({ message: '❌ Failed to confirm payment', type: 'error' });
    } finally {
      setConfirming(null);
    }
  };

  const handleRejectPayment = async (transactionId) => {
    if (!rejectReason.trim()) {
      setAlert({ message: '⚠️ Please provide a reason for rejection', type: 'warning' });
      return;
    }

    try {
      setRejecting(transactionId);
      const response = await fetch(`${API_URL}/escrow/admin-reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId, reason: rejectReason })
      });

      if (response.ok) {
        setAlert({ message: '❌ Payment rejected successfully', type: 'info' });
        fetchPendingPayments();
        setRejectConfirm(null);
        setRejectReason('');
        setSelectedPayment(null);
      } else {
        setAlert({ message: '❌ Error rejecting payment', type: 'error' });
      }
    } catch (error) {
      console.error('Error:', error);
      setAlert({ message: '❌ Failed to reject payment', type: 'error' });
    } finally {
      setRejecting(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="rounded-2xl p-8 mb-8 border bg-brand-card border-white/10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-white">Admin Control Panel</h1>
              <p className="text-brand-muted">Payment Verification & Platform Management</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-red-500/20 text-red-400 px-4 py-2 rounded-lg border border-red-500/30">
                <Shield className="w-5 h-5" />
                <span className="font-semibold">Super Admin</span>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8">
          <div className="rounded-xl p-6 border bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-300">Total Users</p>
                <h3 className="text-3xl font-bold text-white">{stats.users.total}</h3>
                <p className="text-xs text-blue-300 mt-1">{stats.users.students} students • {stats.users.clients} clients</p>
              </div>
              <Users className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl p-6 border bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-300">Completed Orders</p>
                <h3 className="text-3xl font-bold text-white">{stats.transactions.completed}</h3>
                <p className="text-xs text-green-300 mt-1">Success rate: {stats.metrics.successRate}%</p>
              </div>
              <CheckCircle className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl p-6 border bg-gradient-to-br from-yellow-500/10 to-yellow-600/5 border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-300">Pending Approval</p>
                <h3 className="text-3xl font-bold text-white">{stats.transactions.pending}</h3>
                <p className="text-xs text-yellow-300 mt-1">₹{(stats.revenue.pending || 0).toLocaleString()}</p>
              </div>
              <Clock className="w-12 h-12 text-yellow-500 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl p-6 border bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-300">Total Revenue</p>
                <h3 className="text-3xl font-bold text-white">₹{(stats.revenue.total || 0).toLocaleString()}</h3>
                <p className="text-xs text-purple-300 mt-1">Commission: ₹{(stats.revenue.commission || 0).toLocaleString()}</p>
              </div>
              <TrendingUp className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </div>

          <div className="rounded-xl p-6 border bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-300">Avg Order Value</p>
                <h3 className="text-3xl font-bold text-white">₹{Math.round(stats.metrics.avgTransactionValue)}</h3>
                <p className="text-xs text-orange-300 mt-1">Total Orders: {stats.transactions.total}</p>
              </div>
              <Activity className="w-12 h-12 text-orange-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Analytics Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Transaction Status Breakdown */}
          <div className="rounded-xl p-6 border bg-brand-card border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Zap className="w-5 h-5 text-brand-orange" />
              Transaction Status
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <span className="text-blue-300">In Escrow</span>
                <span className="text-white font-bold">{stats.transactions.inEscrow}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <span className="text-green-300">Completed</span>
                <span className="text-white font-bold">{stats.transactions.completed}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <span className="text-yellow-300">Pending</span>
                <span className="text-white font-bold">{stats.transactions.pending}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <span className="text-red-300">Rejected</span>
                <span className="text-white font-bold">{stats.transactions.rejected}</span>
              </div>
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="rounded-xl p-6 border bg-brand-card border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-500" />
              Revenue Breakdown
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-brand-muted">Completed</span>
                  <span className="text-green-400 font-bold">₹{(stats.revenue.completed || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{width: `${stats.revenue.total > 0 ? (stats.revenue.completed / stats.revenue.total * 100) : 0}%`}}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-brand-muted">Pending</span>
                  <span className="text-yellow-400 font-bold">₹{(stats.revenue.pending || 0).toLocaleString()}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2">
                  <div 
                    className="bg-yellow-500 h-2 rounded-full" 
                    style={{width: `${stats.revenue.total > 0 ? (stats.revenue.pending / stats.revenue.total * 100) : 0}%`}}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10">
                <div className="flex justify-between">
                  <span className="text-brand-muted">Platform Commission (10%)</span>
                  <span className="text-purple-400 font-bold">₹{(stats.revenue.commission || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="rounded-xl p-6 border bg-brand-card border-white/10">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-orange" />
              Key Metrics
            </h3>
            <div className="space-y-4">
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-sm text-brand-muted mb-1">Success Rate</p>
                <p className="text-3xl font-bold text-green-400">{stats.metrics.successRate}%</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-sm text-brand-muted mb-1">Avg Transaction Value</p>
                <p className="text-3xl font-bold text-blue-400">₹{Math.round(stats.metrics.avgTransactionValue)}</p>
              </div>
              <div className="bg-white/5 rounded-lg p-4 border border-white/5">
                <p className="text-sm text-brand-muted mb-1">Last 30 Days</p>
                <p className="text-3xl font-bold text-purple-400">{stats.transactions.recentTrend}</p>
                <p className="text-xs text-brand-muted mt-1">New transactions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Pending Payments Section */}
        <div className="rounded-xl p-6 border bg-brand-card border-white/10 mb-8">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-white">
            <Clock className="w-6 h-6 text-yellow-500" />
            Pending Payment Verifications
          </h2>

          {loading ? (
            <div className="text-center py-12">
              <p className="text-brand-muted">Loading pending payments...</p>
            </div>
          ) : pendingPayments.length === 0 ? (
            <div className="text-center py-12 bg-brand-dark rounded-lg border border-white/5">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-brand-muted">No pending payments! All transactions verified.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayments.map((payment) => (
                <div
                  key={payment._id}
                  className="bg-brand-dark rounded-lg p-6 border border-white/5 hover:border-brand-orange/30 transition"
                >
                  <div className="grid md:grid-cols-4 gap-4 items-start mb-4">
                    <div>
                      <p className="text-sm text-brand-muted mb-1">Job Title</p>
                      <p className="text-white font-semibold">{payment.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-muted mb-1">Amount</p>
                      <p className="text-2xl font-bold text-brand-orange">₹{payment.amount}</p>
                    </div>
                    <div>
                      <p className="text-sm text-brand-muted mb-1">Status</p>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                        <span className="text-white font-semibold">Awaiting Verification</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-brand-muted mb-1">Submitted</p>
                      <p className="text-white">{new Date(payment.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  {/* Verification Details */}
                  <div className="grid md:grid-cols-2 gap-4 bg-white/5 rounded-lg p-4 mb-4 border border-white/5">
                    <div>
                      <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">UPI Payment Details</p>
                      <p className="text-white font-semibold">Transaction ID: {payment._id}</p>
                      <p className="text-brand-muted text-sm mt-1">Amount: ₹{payment.amount}</p>
                      <p className="text-brand-muted text-sm">To: karanvirpvtonly@oksbi</p>
                    </div>
                    <div>
                      <p className="text-xs text-brand-muted uppercase tracking-wide mb-2">Instructions</p>
                      <ol className="text-brand-muted text-sm space-y-1 list-decimal list-inside">
                        <li>Check your bank account for ₹{payment.amount} from customer</li>
                        <li>Verify transaction matches amount and UPI ID</li>
                        <li>Click "Confirm Payment" to lock funds in escrow</li>
                      </ol>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleConfirmPayment(payment._id)}
                      disabled={confirming === payment._id}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-6 py-3 rounded-lg font-semibold transition disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      {confirming === payment._id ? 'Confirming...' : 'Confirm Payment ✓'}
                    </button>
                    <button
                      onClick={() => setRejectConfirm(payment._id)}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <AlertCircle className="w-5 h-5" />
                      Reject Payment ✗
                    </button>
                    <button
                      onClick={() => setSelectedPayment(selectedPayment === payment._id ? null : payment._id)}
                      className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      Details
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {selectedPayment === payment._id && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <p className="text-xs text-brand-muted uppercase tracking-wide mb-3">Full Transaction Details</p>
                      <div className="bg-white/5 rounded p-4 font-mono text-xs text-brand-muted space-y-1 max-h-48 overflow-y-auto">
                        <p>Transaction ID: <span className="text-white">{payment._id}</span></p>
                        <p>Student ID: <span className="text-white">{payment.studentId}</span></p>
                        <p>Client ID: <span className="text-white">{payment.clientId}</span></p>
                        <p>Amount: <span className="text-white">₹{payment.amount}</span></p>
                        <p>Status: <span className="text-yellow-400">{payment.status}</span></p>
                        <p>Created: <span className="text-white">{new Date(payment.createdAt).toLocaleString()}</span></p>
                        <p>QR Scanned: <span className="text-white">{payment.qrScannedAt ? new Date(payment.qrScannedAt).toLocaleString() : 'N/A'}</span></p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Management Sections */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Users Management */}
          <div className="rounded-xl p-6 border bg-brand-card border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Users className="w-5 h-5 text-brand-orange" /> User Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                View All Users
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                Ban/Suspend Users
              </button>
              <button
                onClick={() => navigate('/admin/users')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                Verify Accounts
              </button>
            </div>
          </div>

          {/* Dispute Management */}
          <div className="rounded-xl p-6 border bg-brand-card border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <AlertCircle className="w-5 h-5 text-red-500" /> Dispute Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/disputes')}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-lg transition font-semibold"
              >
                View Disputes
              </button>
              <button
                onClick={() => navigate('/admin/disputes')}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-lg transition font-semibold"
              >
                Handle Refunds
              </button>
              <button
                onClick={() => navigate('/admin/disputes')}
                className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-3 rounded-lg transition font-semibold"
              >
                Mediation Cases
              </button>
            </div>
          </div>

          {/* Transactions Management */}
          <div className="rounded-xl p-6 border bg-brand-card border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <BarChart3 className="w-5 h-5 text-brand-orange" /> Transaction Management
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/transactions')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                View All Transactions
              </button>
              <button
                onClick={() => navigate('/admin/disputes')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                View Disputes
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                View Reports
              </button>
            </div>
          </div>

          {/* Platform Settings */}
          <div className="rounded-xl p-6 border bg-brand-card border-white/10">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-white">
              <Shield className="w-5 h-5 text-brand-orange" /> Platform Settings
            </h2>
            <div className="space-y-3">
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                Commission Settings
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                Category Management
              </button>
              <button
                onClick={() => navigate('/admin/reports')}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-3 rounded-lg transition font-semibold"
              >
                Reports & Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Alert */}
      {alert && (
        <CustomAlert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)}
        />
      )}

      {/* Reject Confirmation Modal */}
      {rejectConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-brand-card rounded-2xl p-8 border-2 border-red-500/50 max-w-lg w-full shadow-2xl shadow-red-500/30 animate-scale-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-9 h-9 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Reject Payment?</h3>
                <p className="text-brand-muted text-sm">Provide a reason for the client</p>
              </div>
            </div>
            
            <p className="text-white mb-4">
              This payment will be marked as rejected and the client will be notified.
            </p>

            <div className="mb-6">
              <label className="block text-white font-semibold mb-2">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Payment not received, Amount mismatch, Invalid transaction..."
                className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-red-500 outline-none transition resize-none"
                rows="4"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRejectConfirm(null);
                  setRejectReason('');
                }}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRejectPayment(rejectConfirm)}
                disabled={rejecting === rejectConfirm || !rejectReason.trim()}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <AlertCircle className="w-5 h-5" />
                {rejecting === rejectConfirm ? 'Rejecting...' : 'Reject Payment'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
