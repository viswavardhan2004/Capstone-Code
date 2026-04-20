import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Filter, ArrowLeft, RefreshCw, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';

export default function AdminTransactions() {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    fetchTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, search, statusFilter, dateRange]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // Mock transaction data
      const mockTransactions = [
        { _id: 'tx001', title: 'Logo Design', amount: 2500, studentId: '1', clientId: '2', status: 'IN_ESCROW', createdAt: new Date(Date.now() - 2*24*60*60*1000), completedAt: null },
        { _id: 'tx002', title: 'Web Development', amount: 5000, studentId: '2', clientId: '1', status: 'COMPLETED', createdAt: new Date(Date.now() - 5*24*60*60*1000), completedAt: new Date(Date.now() - 1*24*60*60*1000) },
        { _id: 'tx003', title: 'Blog Writing', amount: 800, studentId: '3', clientId: '4', status: 'WAITING_ADMIN_APPROVAL', createdAt: new Date(Date.now() - 1*60*60*1000), completedAt: null },
        { _id: 'tx004', title: 'Math Tutoring', amount: 1500, studentId: '4', clientId: '2', status: 'IN_ESCROW', createdAt: new Date(Date.now() - 3*24*60*60*1000), completedAt: null },
        { _id: 'tx005', title: 'Video Editing', amount: 3500, studentId: '5', clientId: '1', status: 'COMPLETED', createdAt: new Date(Date.now() - 10*24*60*60*1000), completedAt: new Date(Date.now() - 2*24*60*60*1000) },
      ];
      setTransactions(mockTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = transactions;

    // Search filter
    if (search) {
      result = result.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t._id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter(t => t.status === statusFilter);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      switch(dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(filterDate.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(filterDate.getMonth() - 1);
          break;
      }
      
      result = result.filter(t => new Date(t.createdAt) >= filterDate);
    }

    setFiltered(result);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'WAITING_ADMIN_APPROVAL': return 'bg-yellow-500/20 text-yellow-400';
      case 'IN_ESCROW': return 'bg-blue-500/20 text-blue-400';
      case 'COMPLETED': return 'bg-green-500/20 text-green-400';
      case 'DISPUTED': return 'bg-red-500/20 text-red-400';
      default: return 'bg-white/10 text-white';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'WAITING_ADMIN_APPROVAL': return '⏳ Awaiting Approval';
      case 'IN_ESCROW': return '🔒 In Escrow';
      case 'COMPLETED': return '✅ Completed';
      case 'DISPUTED': return '⚠️ Disputed';
      default: return status;
    }
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const completedAmount = transactions.filter(t => t.status === 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);
  const pendingAmount = transactions.filter(t => t.status !== 'COMPLETED').reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-8 h-8 text-brand-orange" />
              Transaction Management
            </h1>
            <p className="text-brand-muted">View and manage all transactions</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Total Transactions</p>
            <p className="text-3xl font-bold text-white">{transactions.length}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Total Volume</p>
            <p className="text-2xl font-bold text-brand-orange">₹{totalAmount.toLocaleString()}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Completed</p>
            <p className="text-2xl font-bold text-green-400">₹{completedAmount.toLocaleString()}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">₹{pendingAmount.toLocaleString()}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-brand-card border border-white/10 rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm text-brand-muted block mb-2">Search</label>
              <div className="flex items-center gap-2 bg-brand-dark rounded-lg border border-white/5 px-4 py-2">
                <Search className="w-5 h-5 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-brand-muted outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-brand-muted block mb-2">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-brand-dark text-white rounded-lg border border-white/5 px-4 py-2"
              >
                <option value="all">All Status</option>
                <option value="WAITING_ADMIN_APPROVAL">Awaiting Approval</option>
                <option value="IN_ESCROW">In Escrow</option>
                <option value="COMPLETED">Completed</option>
                <option value="DISPUTED">Disputed</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-brand-muted block mb-2">Date Range</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="w-full bg-brand-dark text-white rounded-lg border border-white/5 px-4 py-2"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => fetchTransactions()}
                className="w-full bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-brand-card border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-brand-muted">Loading transactions...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-brand-muted">No transactions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-dark border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Amount</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(tx => (
                    <tr key={tx._id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <code className="text-xs text-brand-muted">{tx._id}</code>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{tx.title}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-xl font-bold text-brand-orange">₹{tx.amount.toLocaleString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(tx.status)}`}>
                          {getStatusLabel(tx.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-brand-muted text-sm">{new Date(tx.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        {tx.completedAt ? (
                          <p className="text-green-400 text-sm">
                            {Math.floor((new Date(tx.completedAt) - new Date(tx.createdAt)) / (1000 * 60 * 60 * 24))} days
                          </p>
                        ) : (
                          <p className="text-yellow-400 text-sm">Ongoing</p>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
