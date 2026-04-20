import React, { useState, useEffect } from 'react';
import { Users, Search, Ban, CheckCircle, Shield, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function AdminUsers() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [users, search, filter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // Fetch all users from admin endpoint
      const response = await fetch(`${API_URL}/admin/users`);
      if (response.ok) {
        const data = await response.json();
        const allUsers = Array.isArray(data) ? data : [];
        setUsers(allUsers);
      } else {
        setAlert({ message: '⚠️ Failed to load users', type: 'warning' });
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAlert({ message: '⚠️ Failed to load users. Trying again...', type: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let result = users;

    // Search filter
    if (search) {
      result = result.filter(u =>
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Status filter
    if (filter !== 'all') {
      result = result.filter(u => u.status === filter);
    }

    setFiltered(result);
  };

  const handleBanUser = async (userId) => {
    setActionLoading(userId);
    setTimeout(() => {
      setUsers(users.map(u => u._id === userId ? { ...u, status: 'suspended' } : u));
      setActionLoading(null);
      setAlert({ message: '✓ User suspended successfully', type: 'success' });
    }, 500);
  };

  const handleUnbanUser = async (userId) => {
    setActionLoading(userId);
    setTimeout(() => {
      setUsers(users.map(u => u._id === userId ? { ...u, status: 'active' } : u));
      setActionLoading(null);
      setAlert({ message: '✓ User activated successfully', type: 'success' });
    }, 500);
  };

  const handleVerifyUser = async (userId) => {
    setActionLoading(userId);
    setTimeout(() => {
      setUsers(users.map(u => u._id === userId ? { ...u, verified: true } : u));
      setActionLoading(null);
      setAlert({ message: '✓ User verified successfully', type: 'success' });
    }, 500);
  };

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
              <Users className="w-8 h-8 text-brand-orange" />
              User Management
            </h1>
            <p className="text-brand-muted">Manage, verify, and moderate user accounts</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Total Users</p>
            <p className="text-3xl font-bold text-white">{users.length}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Active</p>
            <p className="text-3xl font-bold text-green-400">{users.filter(u => u.status === 'active').length}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Suspended</p>
            <p className="text-3xl font-bold text-red-400">{users.filter(u => u.status === 'suspended').length}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Verified</p>
            <p className="text-3xl font-bold text-blue-400">{users.filter(u => u.verified).length}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-brand-card border border-white/10 rounded-xl p-6 mb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-brand-muted block mb-2">Search by name or email</label>
              <div className="flex items-center gap-2 bg-brand-dark rounded-lg border border-white/5 px-4 py-2">
                <Search className="w-5 h-5 text-brand-muted" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-brand-muted outline-none"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-brand-muted block mb-2">Filter by status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full bg-brand-dark text-white rounded-lg border border-white/5 px-4 py-2"
              >
                <option value="all">All Users</option>
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => { setSearch(''); setFilter('all'); }}
                className="w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition"
              >
                Reset Filters
              </button>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-brand-card border border-white/10 rounded-xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-brand-muted">Loading users...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-brand-muted">No users found matching your criteria</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-brand-dark border-b border-white/10">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">User</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Orders</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Joined</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(user => (
                    <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition">
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-white font-semibold">{user.name}</p>
                          <p className="text-brand-muted text-sm">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.role === 'student' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
                        }`}>
                          {user.role === 'student' ? '👨‍🎓 Student' : '💼 Client'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${
                          user.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${user.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          {user.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-white font-semibold">{user.completedOrders}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-brand-muted text-sm">{new Date(user.joinedDate).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {user.status === 'active' ? (
                            <button
                              onClick={() => handleBanUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="p-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition disabled:opacity-50"
                            >
                              <Ban className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleUnbanUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="p-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-lg transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {!user.verified && (
                            <button
                              onClick={() => handleVerifyUser(user._id)}
                              disabled={actionLoading === user._id}
                              className="p-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition disabled:opacity-50"
                            >
                              <Shield className="w-4 h-4" />
                            </button>
                          )}
                          {user.verified && (
                            <div className="p-2 bg-blue-500/10 text-blue-400">
                              <CheckCircle className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
    </div>
  );
}
