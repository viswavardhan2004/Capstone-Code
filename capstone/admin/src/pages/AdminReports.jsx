import React, { useState, useEffect } from 'react';
import { BarChart3, ArrowLeft, TrendingUp, Users, DollarSign, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function AdminReports() {
  const navigate = useNavigate();
  const [timeframe, setTimeframe] = useState('month');
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalClients: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    completedOrders: 0,
    pendingOrders: 0,
    avgOrderValue: 0,
    disputeRate: 0,
    customerSatisfaction: 0,
    revenueByMonth: [],
    topCategories: [],
    topStudents: [],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      
      // Fetch comprehensive stats from admin endpoint
      const statsResponse = await fetch(`${API_URL}/admin/stats`);
      if (!statsResponse.ok) throw new Error('Failed to fetch stats');
      const stats = await statsResponse.json();

      // Fetch all transactions for detailed analytics
      const transactionsResponse = await fetch(`${API_URL}/admin/transactions`);
      if (!transactionsResponse.ok) throw new Error('Failed to fetch transactions');
      const transactions = await transactionsResponse.json();

      // Fetch all orders for category analysis
      const ordersResponse = await fetch(`${API_URL}/admin/orders`);
      if (!ordersResponse.ok) throw new Error('Failed to fetch orders');
      const orders = await ordersResponse.json();

      // Calculate revenue by month (last 7 months)
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const currentMonth = new Date().getMonth();
      const revenueByMonth = [];
      
      for (let i = 6; i >= 0; i--) {
        const monthIndex = (currentMonth - i + 12) % 12;
        const monthTransactions = transactions.filter(t => {
          const transDate = new Date(t.createdAt);
          return transDate.getMonth() === monthIndex;
        });
        const monthRevenue = monthTransactions.reduce((sum, t) => sum + (t.amount || 0), 0);
        revenueByMonth.push({
          month: months[monthIndex],
          revenue: monthRevenue
        });
      }

      // Calculate top categories from orders
      const categoryMap = {};
      orders.forEach(order => {
        const category = order.category || 'Other';
        if (!categoryMap[category]) {
          categoryMap[category] = { name: category, orders: 0, revenue: 0 };
        }
        categoryMap[category].orders += 1;
        categoryMap[category].revenue += order.amount || 0;
      });
      const topCategories = Object.values(categoryMap)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Get top students from stats (already calculated in backend)
      const topStudents = (stats.topStudents || []).slice(0, 5).map(student => ({
        name: student.studentName || 'Unknown Student',
        completedOrders: student.completedCount || 0,
        earnings: student.totalEarnings || 0
      }));

      // Calculate dispute rate
      const rejectedCount = stats.transactions?.rejected || 0;
      const disputeRate = stats.transactions?.total > 0 
        ? ((rejectedCount / stats.transactions.total) * 100).toFixed(1)
        : 0;

      // Calculate customer satisfaction (based on completed orders with ratings)
      const ratedOrders = orders.filter(o => o.rating && o.rating > 0);
      const avgRating = ratedOrders.length > 0
        ? (ratedOrders.reduce((sum, o) => sum + o.rating, 0) / ratedOrders.length).toFixed(1)
        : 0;

      setAnalytics({
        totalUsers: stats.users?.total || 0,
        totalStudents: stats.users?.students || 0,
        totalClients: stats.users?.clients || 0,
        totalTransactions: stats.transactions?.total || 0,
        totalRevenue: stats.revenue?.total || 0,
        completedOrders: stats.transactions?.completed || 0,
        pendingOrders: stats.transactions?.pending || 0,
        avgOrderValue: parseFloat(stats.revenue?.avgValue || 0),
        disputeRate: parseFloat(disputeRate),
        customerSatisfaction: parseFloat(avgRating),
        revenueByMonth,
        topCategories,
        topStudents,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setAlert({ message: '⚠️ Failed to load analytics data', type: 'warning' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-brand-dark">
      {alert && <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin-dashboard')}
              className="p-2 hover:bg-white/10 rounded-lg transition"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-brand-orange" />
                Reports & Analytics
              </h1>
              <p className="text-brand-muted">Platform statistics and performance metrics</p>
            </div>
          </div>
          <select
            value={timeframe}
            onChange={(e) => setTimeframe(e.target.value)}
            className="bg-brand-card text-white rounded-lg border border-white/10 px-4 py-2"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
            <option value="year">This Year</option>
          </select>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-brand-orange/30 border-t-brand-orange rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-brand-muted">Loading analytics...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Key Metrics */}
            <div className="grid md:grid-cols-4 gap-4 mb-8">
              <div className="bg-brand-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-brand-muted text-sm">Total Revenue</p>
                  <DollarSign className="w-5 h-5 text-brand-orange" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">₹{(analytics.totalRevenue / 100000).toFixed(1)}L</p>
                <p className="text-green-400 text-sm flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  {analytics.completedOrders} completed orders
                </p>
              </div>

              <div className="bg-brand-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-brand-muted text-sm">Total Users</p>
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{analytics.totalUsers}</p>
                <p className="text-white text-sm">
                  {analytics.totalStudents} students · {analytics.totalClients} clients
                </p>
              </div>

              <div className="bg-brand-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-brand-muted text-sm">Completed Orders</p>
                  <Activity className="w-5 h-5 text-green-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">{analytics.completedOrders}</p>
                <p className="text-green-400 text-sm">
                  Success rate: {analytics.totalTransactions > 0 ? ((analytics.completedOrders / analytics.totalTransactions) * 100).toFixed(1) : 0}%
                </p>
              </div>

              <div className="bg-brand-card border border-white/10 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-brand-muted text-sm">Avg Order Value</p>
                  <DollarSign className="w-5 h-5 text-yellow-400" />
                </div>
                <p className="text-3xl font-bold text-white mb-2">₹{analytics.avgOrderValue.toLocaleString()}</p>
                <p className="text-yellow-400 text-sm">
                  Dispute rate: {analytics.disputeRate}%
                </p>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-brand-card border border-white/10 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-6">Revenue Trend (Last 7 Months)</h2>
              {analytics.revenueByMonth.length > 0 ? (
                <div className="flex items-end justify-around gap-2 h-64">
                  {analytics.revenueByMonth.map((data, idx) => {
                    const maxRevenue = Math.max(...analytics.revenueByMonth.map(d => d.revenue), 1);
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 flex-1">
                        <div className="relative h-full w-full flex items-end justify-center">
                          <div
                            className="w-8 bg-gradient-to-t from-brand-orange to-brand-orange/50 rounded-t-lg transition hover:opacity-80"
                            style={{ height: `${(data.revenue / maxRevenue) * 100}%` }}
                            title={`₹${data.revenue.toLocaleString()}`}
                          ></div>
                        </div>
                        <p className="text-xs text-brand-muted">{data.month}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-brand-muted text-center py-20">No revenue data available yet</p>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Top Categories */}
              <div className="bg-brand-card border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Top Service Categories</h2>
                {analytics.topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topCategories.map((cat, idx) => {
                      const maxRevenue = Math.max(...analytics.topCategories.map(c => c.revenue), 1);
                      return (
                        <div key={idx} className="bg-white/5 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-semibold">{cat.name}</p>
                            <p className="text-brand-orange font-bold">₹{(cat.revenue / 1000).toFixed(0)}K</p>
                          </div>
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-brand-orange rounded-full h-2"
                              style={{ width: `${(cat.revenue / maxRevenue) * 100}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-brand-muted mt-2">{cat.orders} orders completed</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-brand-muted text-center py-10">No category data available yet</p>
                )}
              </div>

              {/* Top Students */}
              <div className="bg-brand-card border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-6">Top Earning Students</h2>
                {analytics.topStudents.length > 0 ? (
                  <div className="space-y-4">
                    {analytics.topStudents.map((student, idx) => {
                      const maxEarnings = Math.max(...analytics.topStudents.map(s => s.earnings), 1);
                      return (
                        <div key={idx} className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                          <div>
                            <p className="text-white font-semibold">{student.name}</p>
                            <p className="text-brand-muted text-sm">{student.completedOrders} orders completed</p>
                          </div>
                          <div className="text-right">
                            <p className="text-brand-orange font-bold">₹{(student.earnings / 1000).toFixed(0)}K</p>
                            <div className="w-20 bg-white/10 rounded-full h-1 mt-2">
                              <div
                                className="bg-green-500 rounded-full h-1"
                                style={{ width: `${(student.earnings / maxEarnings) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-brand-muted text-center py-10">No student data available yet</p>
                )}
              </div>
            </div>

            {/* Platform Health */}
            <div className="bg-brand-card border border-white/10 rounded-xl p-6 mt-8">
              <h2 className="text-xl font-bold text-white mb-6">Platform Health</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <p className="text-brand-muted text-sm mb-3">Customer Satisfaction</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-4xl font-bold text-yellow-400">{analytics.customerSatisfaction || 0}</p>
                    <p className="text-white">/ 5.0</p>
                  </div>
                  <div className="mt-3 flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={i < Math.floor(analytics.customerSatisfaction) ? 'text-yellow-400' : 'text-white/20'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-brand-muted text-sm mb-3">Success Rate</p>
                  <p className="text-4xl font-bold text-green-400">
                    {analytics.totalTransactions > 0 ? ((analytics.completedOrders / analytics.totalTransactions) * 100).toFixed(0) : 0}%
                  </p>
                  <p className="text-white text-sm mt-2">
                    {analytics.completedOrders} of {analytics.totalTransactions} transactions
                  </p>
                </div>

                <div>
                  <p className="text-brand-muted text-sm mb-3">Active Orders</p>
                  <p className="text-4xl font-bold text-blue-400">{analytics.pendingOrders}</p>
                  <p className="text-white text-sm mt-2">Currently in progress</p>
                </div>
              </div>
            </div>

            {/* Export Button */}
            <div className="mt-8 flex justify-center">
              <button 
                onClick={() => setAlert({ message: '📊 Export feature coming soon!', type: 'success' })}
                className="bg-brand-orange/20 hover:bg-brand-orange/30 text-brand-orange border border-brand-orange/30 px-8 py-3 rounded-lg font-semibold transition"
              >
                📊 Export Full Report (PDF)
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
