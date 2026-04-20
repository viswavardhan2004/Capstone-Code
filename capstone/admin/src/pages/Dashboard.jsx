import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ShoppingBag, TrendingUp, Users, DollarSign, Package, CheckCircle, Shield } from 'lucide-react';

export default function Dashboard() {
  const [userType, setUserType] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [activeView, setActiveView] = useState('seller');

  useEffect(() => {
    const type = localStorage.getItem('userType');
    const verified = localStorage.getItem('isVerified') === 'true';
    const email = localStorage.getItem('userEmail');
    
    setUserType(type);
    setIsVerified(verified);
    setUserEmail(email);
    
    if (type === 'client') {
      setActiveView('buyer');
    }
  }, []);

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 relative overflow-hidden" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* Background Decorative Elements */}
      <div className="absolute top-20 right-10 animate-float opacity-20">
        <div className="w-40 h-40 bg-gradient-to-br from-brand-orange/40 to-purple-500/40 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 left-10 animate-float-delayed opacity-20">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/40 to-cyan-500/40 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="rounded-2xl p-8 mb-8 border backdrop-blur-sm hover:shadow-2xl transition-all duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Welcome to Micro-Job Dashboard</h1>
              <p className="mb-4" style={{ color: 'var(--text-muted)' }}>{userEmail}</p>
              <div className="flex items-center gap-2">
                {isVerified ? (
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-400 px-4 py-2 rounded-lg border border-green-500/30">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-semibold">Verified Student - Full Access</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-400 px-4 py-2 rounded-lg border border-yellow-500/30">
                    <Shield className="w-5 h-5" />
                    <span className="font-semibold">External Client - Buyer Access</span>
                  </div>
                )}
              </div>
            </div>

            {isVerified && (
              <div className="flex gap-2 bg-brand-dark rounded-xl p-2">
                <button
                  onClick={() => setActiveView('seller')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    activeView === 'seller'
                      ? 'bg-brand-orange text-white'
                      : 'text-brand-muted hover:text-white'
                  }`}
                >
                  <Briefcase className="w-5 h-5" />
                  Seller View
                </button>
                <button
                  onClick={() => setActiveView('buyer')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${
                    activeView === 'buyer'
                      ? 'bg-brand-orange text-white'
                      : 'text-brand-muted hover:text-white'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5" />
                  Buyer View
                </button>
              </div>
            )}
          </div>
        </div>

        {isVerified && activeView === 'seller' && (
          <div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Seller Dashboard</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/student/profile" className="rounded-xl p-8 border hover:border-brand-orange transition-all duration-300 group hover:scale-105 hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-brand-orange/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-orange/20 to-orange-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Users className="w-6 h-6 text-brand-orange" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>My Profile</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Manage profile, skills, portfolio</p>
              </Link>

              <Link to="/student/gigs" className="rounded-xl p-8 border hover:border-brand-orange transition-all duration-300 group hover:scale-105 hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Briefcase className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>My Gigs</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Create and manage services</p>
              </Link>

              <Link to="/student/orders" className="rounded-xl p-8 border hover:border-brand-orange transition-all duration-300 group hover:scale-105 hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Package className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>My Orders</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track and submit work</p>
              </Link>
            </div>
          </div>
        )}

        {activeView === 'buyer' && (
          <div>
            <h2 className="text-3xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Buyer Dashboard</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Link to="/client/search" className="rounded-xl p-8 border hover:border-brand-orange transition-all duration-300 group hover:scale-105 hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Search Services</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Find verified students</p>
              </Link>

              <Link to="/client/orders" className="rounded-xl p-8 border hover:border-brand-orange transition-all duration-300 group hover:scale-105 hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <Package className="w-6 h-6 text-yellow-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>My Orders</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Track and approve work</p>
              </Link>

              <Link to="/client/transactions" className="rounded-xl p-8 border hover:border-brand-orange transition-all duration-300 group hover:scale-105 hover:shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-2xl group-hover:scale-150 transition-all duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-all duration-300 shadow-lg">
                    <DollarSign className="w-6 h-6 text-pink-400" />
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Transactions</h3>
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Payment history</p>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}