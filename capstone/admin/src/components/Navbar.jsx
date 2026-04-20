import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart3, MessageSquare, User, Plus, Shield, Menu, LogIn, LogOut, Briefcase, ShoppingBag, Sun, Moon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [showStudentMenu, setShowStudentMenu] = useState(false);
  const [showClientMenu, setShowClientMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileStudentMenu, setShowMobileStudentMenu] = useState(false);
  const [showMobileClientMenu, setShowMobileClientMenu] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [userType, setUserType] = useState('');
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  useEffect(() => {
    // Check auth state on every route change
    const checkAuthState = () => {
      const token = localStorage.getItem('token');
      const verified = localStorage.getItem('isVerified') === 'true';
      const type = localStorage.getItem('userType');
      
      setIsLoggedIn(!!token);
      setIsVerified(verified);
      setUserType(type);
    };

    checkAuthState();
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    localStorage.removeItem('isVerified');
    localStorage.removeItem('userEmail');
    window.location.href = '/auth';
  };

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-2xl shadow-2xl border-b"
      style={{ 
        backgroundColor: 'var(--navbar-bg)',
        borderColor: 'var(--border-color)'
      }}
    >
      <div
        className="container mx-auto px-6 py-4 flex justify-between items-center"
      >
        <Link to="/" className="text-2xl font-bold flex items-center gap-3 group" style={{ color: 'var(--text-primary)' }}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange to-orange-600 rounded-xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-brand-orange to-orange-600 p-2 rounded-xl transform group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="bg-gradient-to-r from-brand-orange to-orange-600 bg-clip-text text-transparent font-bold text-xl">Micro-Job</span>
        </Link>
        
        <div className="hidden md:flex gap-4 items-center">
          <Link to="/" className="text-brand-text hover:text-brand-orange transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-orange/10 hover:to-orange-600/10 group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 to-orange-600/0 group-hover:from-brand-orange/5 group-hover:to-orange-600/5 transition-all"></div>
            <Home className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" /> 
            <span className="relative z-10 font-medium">Home</span>
          </Link>

          {isLoggedIn && (
            <Link to="/dashboard" className="text-brand-text hover:text-brand-orange transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-orange/10 hover:to-orange-600/10 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 to-orange-600/0 group-hover:from-brand-orange/5 group-hover:to-orange-600/5 transition-all"></div>
              <BarChart3 className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" /> 
              <span className="relative z-10 font-medium">Dashboard</span>
            </Link>
          )}

          {/* Student Dropdown - Only for verified students */}
          {isLoggedIn && isVerified && (
            <div 
              className="relative"
              onMouseEnter={() => setShowStudentMenu(true)}
              onMouseLeave={() => setShowStudentMenu(false)}
            >
              <button className="text-brand-text hover:text-brand-orange transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-orange/10 hover:to-orange-600/10 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 to-orange-600/0 group-hover:from-brand-orange/5 group-hover:to-orange-600/5 transition-all"></div>
                <Briefcase className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" /> 
                <span className="relative z-10 font-medium">Sell Services</span>
              </button>
            <div 
              className={`absolute left-0 mt-2 w-60 bg-brand-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${
                showStudentMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
              style={{ zIndex: 100 }}
            >
              <div className="py-2">
                <Link 
                  to="/student/gigs" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group rounded-t-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">📝</span>
                  <div>
                    <p className="font-semibold">My Gigs</p>
                    <p className="text-xs text-brand-muted">Create services</p>
                  </div>
                </Link>
                <Link 
                  to="/student/orders" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">📋</span>
                  <div>
                    <p className="font-semibold">My Orders</p>
                    <p className="text-xs text-brand-muted">Track work</p>
                  </div>
                </Link>
                <Link 
                  to="/student/earnings" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">💰</span>
                  <div>
                    <p className="font-semibold">Earnings</p>
                    <p className="text-xs text-brand-muted">View payments</p>
                  </div>
                </Link>
                <div className="border-t mx-2" style={{ borderColor: 'var(--border-color)' }}></div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-white/5 transition group rounded-b-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">⚙️</span>
                  <div>
                    <p className="font-semibold">Account Settings</p>
                    <p className="text-xs text-brand-muted">Edit profile</p>
                  </div>
                </Link>
              </div>
            </div>
            </div>
          )}

          {/* Client Dropdown - For all logged in users */}
          {isLoggedIn && (
            <div 
              className="relative"
              onMouseEnter={() => setShowClientMenu(true)}
              onMouseLeave={() => setShowClientMenu(false)}
            >
              <button className="text-brand-text hover:text-brand-orange transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-orange/10 hover:to-orange-600/10 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 to-orange-600/0 group-hover:from-brand-orange/5 group-hover:to-orange-600/5 transition-all"></div>
                <ShoppingBag className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" /> 
                <span className="relative z-10 font-medium">Buy Services</span>
              </button>
            <div 
              className={`absolute left-0 mt-2 w-60 bg-brand-card/80 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-300 ${
                showClientMenu ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
              }`}
              style={{ zIndex: 100 }}
            >
              <div className="py-2">
                <Link 
                  to="/client/search" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-white/5 transition group rounded-t-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">🔍</span>
                  <div>
                    <p className="font-semibold">Search Services</p>
                    <p className="text-xs text-brand-muted">Find talent</p>
                  </div>
                </Link>
                <Link 
                  to="/client/transactions" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 transition group"
                >
                  <span className="text-2xl group-hover:scale-110 transition">📊</span>
                  <div>
                    <p className="font-semibold">My Orders</p>
                    <p className="text-xs text-brand-muted">Payment history</p>
                  </div>
                </Link>
                <div className="border-t mx-2" style={{ borderColor: 'var(--border-color)' }}></div>
                <Link 
                  to="/profile" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-white/5 transition group rounded-b-2xl"
                >
                  <span className="text-2xl group-hover:scale-110 transition">⚙️</span>
                  <div>
                    <p className="font-semibold">Account Settings</p>
                    <p className="text-xs text-brand-muted">Edit profile</p>
                  </div>
                </Link>
              </div>
            </div>
            </div>
          )}

          {isLoggedIn && userType !== 'admin' && (
            <Link to="/messages" className="text-brand-text hover:text-brand-orange transition-all flex items-center gap-2 px-4 py-2.5 rounded-xl hover:bg-gradient-to-r hover:from-brand-orange/10 hover:to-orange-600/10 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-orange/0 to-orange-600/0 group-hover:from-brand-orange/5 group-hover:to-orange-600/5 transition-all"></div>
              <MessageSquare className="w-4 h-4 relative z-10 group-hover:scale-110 transition-transform" /> 
              <span className="relative z-10 font-medium">Messages</span>
            </Link>
          )}

          {isLoggedIn && userType === 'admin' && (
            <Link to="/admin-dashboard" className="relative bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 px-4 py-2.5 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all flex items-center gap-2 border border-red-500/30 shadow-lg hover:shadow-red-500/50 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 transition-all"></div>
              <Shield className="w-4 h-4 relative z-10 group-hover:rotate-12 transition-transform" /> 
              <span className="relative z-10 font-semibold">Admin Panel</span>
            </Link>
          )}

          {isLoggedIn && isVerified && (
            <Link to="/create" className="relative bg-gradient-to-r from-brand-orange to-orange-600 text-white px-4 py-2.5 rounded-xl hover:shadow-xl hover:shadow-brand-orange/50 transition-all flex items-center gap-2 group overflow-hidden hover:scale-105">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all"></div>
              <Plus className="w-4 h-4 relative z-10 group-hover:rotate-90 transition-transform" /> 
              <span className="relative z-10 font-semibold">Create Gig</span>
            </Link>
          )}

          <button
            onClick={toggleTheme}
            className="relative bg-gradient-to-br from-brand-orange/20 to-orange-600/20 text-white p-3 rounded-xl hover:from-brand-orange/30 hover:to-orange-600/30 transition-all duration-300 border border-brand-orange/30 shadow-lg hover:shadow-brand-orange/50 group overflow-hidden hover:scale-110"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-orange/0 to-orange-600/0 group-hover:from-brand-orange/10 group-hover:to-orange-600/10 transition-all"></div>
            <div className="relative z-10">
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              ) : (
                <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />
              )}
            </div>
          </button>

          {!isLoggedIn ? (
            <Link to="/auth" className="relative bg-gradient-to-r from-brand-orange to-orange-600 text-white px-6 py-2.5 rounded-xl hover:shadow-xl hover:shadow-brand-orange/50 transition-all flex items-center gap-2 border border-brand-orange/50 shadow-lg hover:scale-105 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-white/5 transition-all"></div>
              <LogIn className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" /> 
              <span className="relative z-10 font-semibold">Login</span>
            </Link>
          ) : (
            <button onClick={handleLogout} className="relative bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 px-6 py-2.5 rounded-xl hover:from-red-500/30 hover:to-pink-500/30 transition-all flex items-center gap-2 border border-red-500/30 shadow-lg hover:scale-105 group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-pink-500/0 group-hover:from-red-500/10 group-hover:to-pink-500/10 transition-all"></div>
              <LogOut className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform" /> 
              <span className="relative z-10 font-semibold">Logout</span>
            </button>
          )}
        </div>

        <div className="md:hidden flex items-center gap-4">
          <button
            onClick={toggleTheme}
            className="relative bg-gradient-to-r from-brand-orange/20 to-brand-glow/20 text-white p-2.5 rounded-xl hover:from-brand-orange/30 hover:to-brand-glow/30 transition-all duration-300 border border-brand-orange/30"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 animate-pulse" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
          <button 
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="text-brand-text cursor-pointer p-2"
          >
            <Menu className="w-6 h-6" />
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden fixed top-20 right-4 w-72 bg-brand-card border border-white/20 shadow-2xl rounded-2xl max-h-[calc(100vh-120px)] overflow-y-auto z-50">
            <div className="px-4 py-6 flex flex-col gap-1">
              {/* Home Link */}
              <Link 
                to="/" 
                className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all group" 
                onClick={() => setShowMobileMenu(false)}
              >
                <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-medium">Home</span>
              </Link>

              {/* Dashboard Link */}
              {isLoggedIn && (
                <Link 
                  to="/dashboard" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all group" 
                  onClick={() => setShowMobileMenu(false)}
                >
                  <BarChart3 className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Dashboard</span>
                </Link>
              )}

              {/* Sell Services Dropdown - Mobile */}
              {isLoggedIn && isVerified && (
                <div className="border-t border-white/10 my-2 pt-2">
                  <button
                    onClick={() => setShowMobileStudentMenu(!showMobileStudentMenu)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <Briefcase className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Sell Services</span>
                    </div>
                    <span className={`text-brand-orange transition-transform ${showMobileStudentMenu ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  {showMobileStudentMenu && (
                    <div className="bg-brand-orange/5 rounded-lg ml-2 mt-2 border-l-2 border-brand-orange/30">
                      <Link 
                        to="/student/gigs" 
                        className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all group"
                        onClick={() => { setShowMobileMenu(false); setShowMobileStudentMenu(false); }}
                      >
                        <span className="text-xl">📝</span>
                        <div>
                          <p className="font-medium text-sm">My Gigs</p>
                          <p className="text-xs text-brand-muted">Create services</p>
                        </div>
                      </Link>
                      <Link 
                        to="/student/orders" 
                        className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all group"
                        onClick={() => { setShowMobileMenu(false); setShowMobileStudentMenu(false); }}
                      >
                        <span className="text-xl">📋</span>
                        <div>
                          <p className="font-medium text-sm">My Orders</p>
                          <p className="text-xs text-brand-muted">Track work</p>
                        </div>
                      </Link>
                      <Link 
                        to="/student/earnings" 
                        className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all group"
                        onClick={() => { setShowMobileMenu(false); setShowMobileStudentMenu(false); }}
                      >
                        <span className="text-xl">💰</span>
                        <div>
                          <p className="font-medium text-sm">Earnings</p>
                          <p className="text-xs text-brand-muted">View payments</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Buy Services Dropdown - Mobile */}
              {isLoggedIn && (
                <div className="border-t border-white/10 my-2 pt-2">
                  <button
                    onClick={() => setShowMobileClientMenu(!showMobileClientMenu)}
                    className="w-full flex items-center justify-between gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="font-medium">Buy Services</span>
                    </div>
                    <span className={`text-brand-orange transition-transform ${showMobileClientMenu ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  
                  {showMobileClientMenu && (
                    <div className="bg-brand-orange/5 rounded-lg ml-2 mt-2 border-l-2 border-brand-orange/30">
                      <Link 
                        to="/client/search" 
                        className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all group"
                        onClick={() => { setShowMobileMenu(false); setShowMobileClientMenu(false); }}
                      >
                        <span className="text-xl">🔍</span>
                        <div>
                          <p className="font-medium text-sm">Search Services</p>
                          <p className="text-xs text-brand-muted">Find talent</p>
                        </div>
                      </Link>
                      <Link 
                        to="/client/transactions" 
                        className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-lg transition-all group"
                        onClick={() => { setShowMobileMenu(false); setShowMobileClientMenu(false); }}
                      >
                        <span className="text-xl">📊</span>
                        <div>
                          <p className="font-medium text-sm">My Orders</p>
                          <p className="text-xs text-brand-muted">Payment history</p>
                        </div>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Messages Link */}
              {isLoggedIn && userType !== 'admin' && (
                <Link 
                  to="/messages" 
                  className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all group" 
                  onClick={() => setShowMobileMenu(false)}
                >
                  <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  <span className="font-medium">Messages</span>
                </Link>
              )}

              {/* Admin Panel Link */}
              {isLoggedIn && userType === 'admin' && (
                <Link 
                  to="/admin-dashboard" 
                  className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 hover:text-red-300 hover:from-red-500/30 hover:to-pink-500/30 rounded-xl transition-all group border border-red-500/30" 
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Shield className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span className="font-semibold">Admin Panel</span>
                </Link>
              )}

              {/* Create Gig Button */}
              {isLoggedIn && isVerified && (
                <Link 
                  to="/create" 
                  className="flex items-center justify-center gap-3 px-4 py-3 bg-gradient-to-r from-brand-orange to-orange-600 text-white rounded-xl hover:shadow-xl hover:shadow-brand-orange/50 transition-all group font-semibold my-2" 
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                  <span>Create Gig</span>
                </Link>
              )}

              {/* Profile & Account */}
              {isLoggedIn && (
                <div className="border-t border-white/10 my-2 pt-2">
                  <Link 
                    to="/profile" 
                    className="flex items-center gap-3 px-4 py-3 text-brand-text hover:text-brand-orange hover:bg-brand-orange/10 rounded-xl transition-all group" 
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    <span className="font-medium">Account Settings</span>
                  </Link>
                </div>
              )}

              {/* Auth Buttons */}
              <div className="border-t border-white/10 mt-4 pt-4">
                {!isLoggedIn ? (
                  <Link 
                    to="/auth" 
                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-brand-orange to-orange-600 text-white rounded-xl hover:shadow-xl hover:shadow-brand-orange/50 transition-all font-semibold group" 
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Login</span>
                  </Link>
                ) : (
                  <button 
                    onClick={() => { handleLogout(); setShowMobileMenu(false); }} 
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-400 hover:from-red-500/30 hover:to-pink-500/30 rounded-xl transition-all font-semibold border border-red-500/30 group"
                  >
                    <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    <span>Logout</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}