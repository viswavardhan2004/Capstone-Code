import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, User, Lock, Mail, Shield } from 'lucide-react';
import CustomAlert from '../components/CustomAlert';
import { API_URL } from '../config/apiConfig';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ email: '', password: '', name: '', confirmPassword: '' });
  const [alert, setAlert] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Check if email is university email using domain match (aligned with backend)
  const isUniversityEmail = (email) => {
    const universityDomains = ['lpu.in', '.edu', '.ac.in', 'university.com', 'college.com'];
    const domain = email.toLowerCase().split('@')[1];
    if (!domain) return false;
    return universityDomains.some(d => domain.endsWith(d));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && formData.password !== formData.confirmPassword) {
      setAlert({ message: '❌ Passwords do not match!', type: 'error' });
      return;
    }

    // Check for admin credentials
    if (formData.email === 'karanvir@gmail.com' && formData.password === '1234') {
      localStorage.setItem('token', 'admin-token-' + Date.now());
      localStorage.setItem('userId', 'admin');
      localStorage.setItem('userType', 'admin');
      localStorage.setItem('userEmail', formData.email);
      localStorage.setItem('isVerified', 'false');
      
      setAlert({ message: '🔐 Admin Login Successful! Welcome Boss!', type: 'success' });
      setTimeout(() => navigate('/admin-dashboard'), 1500);
      return;
    }

    // Auto-detect user type based on email
    const userType = isUniversityEmail(formData.email) ? 'student' : 'client';

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : { email: formData.email, password: formData.password, name: formData.name, role: userType };

      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userId', data.userId || formData.email);
        localStorage.setItem('userType', userType);
        localStorage.setItem('userEmail', formData.email);
        localStorage.setItem('isVerified', isUniversityEmail(formData.email) ? 'true' : 'false');
        
        const successMessage = isLogin 
          ? `🎉 Welcome Back! ${userType === 'student' ? '✅ Verified Student Access' : '👤 Client Access'}`
          : `🎊 Account Created! ${userType === 'student' ? '✅ Verified Student' : '👤 External Client'}`;
        
        setAlert({ message: successMessage, type: 'success' });
        setTimeout(() => navigate('/dashboard'), 1500);
      } else {
        setAlert({ message: `❌ ${data.error || 'Authentication failed'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setAlert({ message: '⚠️ Error connecting to server. Please try again.', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-24 relative overflow-hidden" style={{ background: 'linear-gradient(to bottom right, var(--bg-dark), var(--bg-dark), var(--bg-card))' }}>
      {/* Floating 3D Decorative Elements */}
      <div className="absolute top-10 left-10 animate-float">
        <div className="w-24 h-24 bg-gradient-to-br from-brand-orange/30 to-purple-500/30 rounded-3xl backdrop-blur-sm border border-white/10 transform rotate-12 shadow-2xl"></div>
      </div>
      <div className="absolute top-1/4 right-20 animate-float-delayed">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/30 to-cyan-500/30 rounded-full backdrop-blur-sm border border-white/10 shadow-2xl"></div>
      </div>
      <div className="absolute bottom-20 left-1/4 animate-float">
        <div className="w-20 h-20 bg-gradient-to-br from-pink-500/30 to-red-500/30 rounded-2xl backdrop-blur-sm border border-white/10 transform -rotate-12 shadow-2xl"></div>
      </div>
      <div className="absolute bottom-1/4 right-10 animate-float-delayed">
        <div className="w-28 h-28 bg-gradient-to-br from-green-500/30 to-emerald-500/30 rounded-3xl backdrop-blur-sm border border-white/10 transform rotate-45 shadow-2xl"></div>
      </div>

      {alert && (
        <CustomAlert 
          message={alert.message} 
          type={alert.type} 
          onClose={() => setAlert(null)}
          duration={3000}
        />
      )}
      <div className="max-w-md w-full relative z-10">
        <div className="text-center mb-8">
          <div className="relative inline-block mb-4">
            <h1 className="text-5xl font-bold text-brand-orange mb-4 animate-pulse">Micro-Job</h1>
            <div className="absolute -inset-4 bg-brand-orange/20 blur-3xl rounded-full -z-10"></div>
          </div>
          <p className="text-lg mb-2" style={{ color: 'var(--text-muted)' }}>{isLogin ? 'Welcome Back' : 'Create Account'}</p>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Login to access your account' : 'Sign up with any email address'}
          </p>
        </div>

        <div className="rounded-2xl p-8 border shadow-xl backdrop-blur-lg hover:shadow-2xl hover:scale-[1.02] transition-all duration-300" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
          <div className="mb-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text-primary)' }}>Auto-Detection Enabled</p>
                <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  <strong className="text-green-400">University Email:</strong> Full access (Buy & Sell)<br/>
                  <strong className="text-yellow-400">Personal Email:</strong> Buyer access only
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your name"
                  required={!isLogin}
                  className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
                Email Address
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com or you@university.edu"
                required
                className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
              {formData.email && (
                <p className={`text-xs mt-2 ${isUniversityEmail(formData.email) ? 'text-green-400' : 'text-yellow-400'}`}>
                  {isUniversityEmail(formData.email) 
                    ? '✅ Verified Student - Full Access (Buy & Sell)' 
                    : '👤 External Client - Buyer Access Only'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required={!isLogin}
                  className="w-full rounded-lg px-4 py-3 border focus:border-brand-orange outline-none transition"
                  style={{ backgroundColor: 'var(--input-bg)', color: 'var(--text-primary)', borderColor: 'var(--border-color)' }}
                />
              </div>
            )}

            <button 
              type="submit"
              className="w-full bg-brand-orange hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition transform hover:scale-105"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="text-center mt-6">
            <p style={{ color: 'var(--text-muted)' }}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
              <button 
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand-orange hover:text-orange-400 font-semibold transition"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
