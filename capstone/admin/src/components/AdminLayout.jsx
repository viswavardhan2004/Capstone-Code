import { Link, useLocation } from 'react-router-dom';
import { Shield, Users, AlertTriangle, BarChart3, LogOut, Home, FileText, DollarSign } from 'lucide-react';

const navItems = [
  { path: '/admin-dashboard', icon: Home, label: 'Overview' },
  { path: '/admin/fraud-alerts', icon: AlertTriangle, label: 'Fraud Detection' },
  { path: '/admin/users', icon: Users, label: 'Users' },
  { path: '/admin/transactions', icon: DollarSign, label: 'Transactions' },
  { path: '/admin/disputes', icon: FileText, label: 'Disputes' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
];

export default function AdminLayout({ children }) {
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = 'http://localhost:5173/auth';
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col fixed h-full z-40">
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="font-bold text-white text-sm">Micro-Job</p>
              <p className="text-xs text-red-400 font-semibold">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  active
                    ? 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 border border-red-500/30'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${active ? 'text-red-400' : ''}`} />
                <span className="font-medium text-sm">{label}</span>
                {label === 'Fraud Detection' && (
                  <span className="ml-auto bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full font-bold animate-pulse">!</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 group"
          >
            <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 min-h-screen bg-gray-950">
        {children}
      </main>
    </div>
  );
}
