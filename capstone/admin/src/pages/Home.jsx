import React, { useState, useEffect } from 'react';
import { CheckCircle, Lock, Users, MessageSquare, Zap, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  return (
    <div className="min-h-screen transition-colors duration-300" style={{ backgroundColor: 'var(--bg-dark)' }}>
      {/* Hero Section */}
      <div className="relative py-24 px-4 overflow-hidden pt-20" style={{ background: 'linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-card) 50%, var(--bg-dark) 100%)' }}>
        {/* Animated gradient background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-brand-orange/5 via-transparent to-purple-500/5 animate-gradient"></div>
          <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-blue-500/5 via-transparent to-pink-500/5 animate-gradient-delayed"></div>
        </div>
        
        {/* Floating 3D Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 animate-float">
            <div className="w-32 h-32 bg-gradient-to-br from-brand-orange/20 to-purple-500/20 rounded-3xl backdrop-blur-sm border border-white/10 transform rotate-12 shadow-2xl hover:scale-110 transition-transform"></div>
          </div>
          <div className="absolute top-40 right-20 animate-float-delayed">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-brand-orange/20 rounded-2xl backdrop-blur-sm border border-white/10 transform -rotate-12 shadow-2xl hover:scale-110 transition-transform"></div>
          </div>
          <div className="absolute bottom-32 left-1/4 animate-float">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl backdrop-blur-sm border border-white/10 transform rotate-45 shadow-2xl hover:scale-110 transition-transform"></div>
          </div>
          <div className="absolute top-1/2 right-10 animate-float-delayed">
            <div className="w-28 h-28 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl backdrop-blur-sm border border-white/10 transform -rotate-6 shadow-2xl hover:scale-110 transition-transform"></div>
          </div>
        </div>

        <div className="relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div className="text-center md:text-left space-y-6">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-orange/20 to-orange-600/20 border border-brand-orange/30 rounded-full backdrop-blur-sm shadow-lg hover:scale-105 transition-transform">
                  <span className="text-2xl">🎓</span>
                  <span className="text-brand-orange font-semibold text-sm">Verified Students Only</span>
                </div>
                <h1 className="text-5xl md:text-7xl font-semibold mb-6 leading-tight" style={{ color: 'var(--text-primary)' }}>
                  <span className="bg-gradient-to-r from-brand-orange via-orange-600 to-brand-orange bg-clip-text text-transparent animate-gradient">Micro-Job</span>
                  <br />
                  <span className="text-4xl md:text-5xl">The Verified Student</span>
                  <br />
                  <span className="text-4xl md:text-5xl bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">Marketplace</span>
                </h1>
                <p className="text-xl md:text-2xl leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  Connect <span className="text-brand-orange font-semibold">verified university students</span> with clients who need their skills. <span className="text-purple-400 font-semibold">Secure escrow payments</span> ensure trust for everyone.
                </p>
                <div className="flex justify-center md:justify-start gap-4 flex-wrap pt-4">
                  {isLoggedIn ? (
                    <Link to="/dashboard" className="relative bg-gradient-to-r from-brand-orange to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-brand-orange/50 group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-white/10 transition-all"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        Go to Dashboard
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  ) : (
                    <Link to="/auth" className="relative bg-gradient-to-r from-brand-orange to-orange-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 shadow-2xl hover:shadow-brand-orange/50 group overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 to-white/0 group-hover:from-white/20 group-hover:to-white/10 transition-all"></div>
                      <span className="relative z-10 flex items-center gap-2">
                        Get Started
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </span>
                    </Link>
                  )}
                  <a href="#how-it-works" className="relative border-2 border-brand-orange text-brand-orange hover:bg-brand-orange/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all transform hover:scale-105 backdrop-blur-sm group overflow-hidden">
                    <div className="absolute inset-0 bg-brand-orange/0 group-hover:bg-brand-orange/5 transition-all"></div>
                    <span className="relative z-10">Learn More</span>
                  </a>
                </div>
              </div>

              {/* Hero Visual - Original 3D cards */}
              <div className="relative">
                <div className="relative z-10">
                  <div className="bg-gradient-to-br from-brand-orange/10 to-purple-500/10 rounded-3xl p-8 backdrop-blur-lg border border-white/10 shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex items-center justify-center aspect-square animate-pulse">
                        <div className="text-center">
                          <Users className="w-12 h-12 mx-auto mb-2 text-cyan-400" />
                          <p className="text-cyan-400 font-semibold text-sm">Verified Students</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex items-center justify-center aspect-square animate-pulse" style={{ animationDelay: '0.2s' }}>
                        <div className="text-center">
                          <Lock className="w-12 h-12 mx-auto mb-2 text-pink-400" />
                          <p className="text-pink-400 font-semibold text-sm">Secure Escrow</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex items-center justify-center aspect-square animate-pulse" style={{ animationDelay: '0.4s' }}>
                        <div className="text-center">
                          <MessageSquare className="w-12 h-12 mx-auto mb-2 text-emerald-400" />
                          <p className="text-emerald-400 font-semibold text-sm">Real-time Chat</p>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-2xl p-6 backdrop-blur-sm border border-white/10 flex items-center justify-center aspect-square animate-pulse" style={{ animationDelay: '0.6s' }}>
                        <div className="text-center">
                          <Zap className="w-12 h-12 mx-auto mb-2 text-orange-400" />
                          <p className="text-orange-400 font-semibold text-sm">Instant Pay</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                {/* Background decoration */}
                <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-r from-brand-orange/20 to-purple-500/20 rounded-full blur-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Features */}
      <div className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Why Micro-Job?</h2>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>The most trusted platform for student freelancers</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="rounded-xl p-8 border hover:border-brand-orange/50 transition group hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <div className="absolute top-0 left-0 w-16 h-16 bg-green-500/10 rounded-2xl blur-xl"></div>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>University Verified</h3>
            <p style={{ color: 'var(--text-muted)' }}>Students register with real university emails (.edu, @lpu.in). Clients get verified, trusted talent.</p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-green-500/10 text-green-400 text-xs rounded-full border border-green-500/20">✓ Verified</span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">🎓 Students</span>
            </div>
          </div>

          <div className="rounded-xl p-8 border hover:border-brand-orange/50 transition group hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Lock className="w-8 h-8 text-purple-400" />
              </div>
              <div className="absolute top-0 left-0 w-16 h-16 bg-purple-500/10 rounded-2xl blur-xl"></div>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Secure Escrow Vault</h3>
            <p style={{ color: 'var(--text-muted)' }}>Payments locked until work is approved. No scams. No fraud.</p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-purple-500/10 text-purple-400 text-xs rounded-full border border-purple-500/20">🔒 Safe</span>
              <span className="px-3 py-1 bg-pink-500/10 text-pink-400 text-xs rounded-full border border-pink-500/20">💰 Protected</span>
            </div>
          </div>

          <div className="rounded-xl p-8 border hover:border-brand-orange/50 transition group hover:scale-105 hover:shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
            <div className="relative">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="w-8 h-8 text-blue-400" />
              </div>
              <div className="absolute top-0 left-0 w-16 h-16 bg-blue-500/10 rounded-2xl blur-xl"></div>
            </div>
            <h3 className="text-xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>Dual Marketplace</h3>
            <p style={{ color: 'var(--text-muted)' }}>Students earn from peers. External clients hire verified talent.</p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-xs rounded-full border border-blue-500/20">👥 Community</span>
              <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-xs rounded-full border border-cyan-500/20">⚡ Fast</span>
            </div>
          </div>
        </div>
      </div>

      {/* Potential Commercialization Partners Marquee */}
      <div className="w-full py-20 px-4 overflow-hidden relative border-y" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        {/* Subtle ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 -left-40 w-80 h-80 bg-brand-orange/10 rounded-full blur-3xl opacity-30"></div>
          <div className="absolute top-1/2 -right-40 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl opacity-20"></div>
        </div>

        <style>{`
          @keyframes partnerScroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .partner-marquee-wrapper {
            overflow: hidden;
            background: linear-gradient(90deg, 
              var(--bg-card) 0%, 
              var(--bg-card) 5%,
              transparent 15%, 
              transparent 85%,
              var(--bg-card) 95%,
              var(--bg-card) 100%);
            padding: 2.5rem 0;
            position: relative;
            z-index: 1;
          }
          
          .partner-scroll-track {
            display: flex;
            gap: 3rem;
            animation: partnerScroll 35s linear infinite;
            width: fit-content;
          }
          
          .partner-scroll-track:hover {
            animation-play-state: paused;
          }
          
          .partner-name {
            position: relative;
            padding: 0.75rem 1.5rem;
            border-radius: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            flex-shrink: 0;
            background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
            border: 1px solid var(--border-color);
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.25);
            transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s ease, box-shadow 0.3s ease;
          }
          
          .partner-name:hover {
            transform: translateY(-3px) scale(1.02);
            border-color: var(--border-hover);
            box-shadow: 0 10px 28px rgba(255, 107, 53, 0.18);
          }

          .partner-logo img {
            filter: grayscale(12%) contrast(105%);
            transition: filter 0.3s ease, transform 0.3s ease;
          }

          .partner-logo:hover img {
            filter: none;
            transform: translateY(-2px);
          }

          .partner-label {
            color: var(--text-primary);
            font-weight: 600;
            font-size: 0.95rem;
            line-height: 1.2;
            text-align: center;
            white-space: nowrap;
          }
        `}</style>
        
        <div className="text-center mb-12 relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
            POTENTIAL COMMERCIALIZATION PARTNERS
          </h2>
          <p className="text-base" style={{ color: 'var(--text-muted)' }}>
            Strategic partnerships with leading global platforms and initiatives
          </p>
        </div>
        
        <div className="partner-marquee-wrapper">
          <div className="partner-scroll-track">
            {[
              { name: 'LinkedIn', logo: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128' },
              { name: 'Internshala', logo: 'https://www.google.com/s2/favicons?domain=internshala.com&sz=128' },
              { name: 'Handshake', logo: 'https://www.google.com/s2/favicons?domain=joinhandshake.com&sz=128' },
              { name: 'Upwork', logo: 'https://www.google.com/s2/favicons?domain=upwork.com&sz=128' },
              { name: 'Toptal', logo: 'https://www.google.com/s2/favicons?domain=toptal.com&sz=128' },
              { name: 'Coursera for Campus', logo: 'https://www.google.com/s2/favicons?domain=coursera.org&sz=128' },
              { name: 'NASSCOM (India)', logo: 'https://www.google.com/s2/favicons?domain=nasscom.in&sz=128' },
              { name: "Wipro's TalentNext", logo: 'https://www.google.com/s2/favicons?domain=wipro.com&sz=128' }
            ].concat([
              { name: 'LinkedIn', logo: 'https://www.google.com/s2/favicons?domain=linkedin.com&sz=128' },
              { name: 'Internshala', logo: 'https://www.google.com/s2/favicons?domain=internshala.com&sz=128' },
              { name: 'Handshake', logo: 'https://www.google.com/s2/favicons?domain=joinhandshake.com&sz=128' },
              { name: 'Upwork', logo: 'https://www.google.com/s2/favicons?domain=upwork.com&sz=128' },
              { name: 'Toptal', logo: 'https://www.google.com/s2/favicons?domain=toptal.com&sz=128' },
              { name: 'Coursera for Campus', logo: 'https://www.google.com/s2/favicons?domain=coursera.org&sz=128' },
              { name: 'NASSCOM (India)', logo: 'https://www.google.com/s2/favicons?domain=nasscom.in&sz=128' },
              { name: "Wipro's TalentNext", logo: 'https://www.google.com/s2/favicons?domain=wipro.com&sz=128' }
            ]).map((partner, idx) => (
              <div key={idx} className="partner-name partner-logo">
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="h-10 w-auto object-contain"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // If logo fails, hide the img and rely on the text label.
                    e.currentTarget.style.display = 'none';
                  }}
                  loading="lazy"
                />
                <span className="partner-label">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Student Journey */}
      <div id="how-it-works" className="py-20 px-4 border-y" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>📍 The Student Journey (Seller)</h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>5 steps to monetize your skills</p>

          <div className="space-y-6">
            {[
              { step: 1, title: "Verification", desc: "Register with university email. Get instant 'Verified' badge.", icon: "✓", color: "green" },
              { step: 2, title: "Profile & Gigs", desc: "List skills and create gigs like 'Design logo for $25'.", icon: "📝", color: "blue" },
              { step: 3, title: "Receive Orders", desc: "Chat with clients, clarify details, and start working.", icon: "💬", color: "purple" },
              { step: 4, title: "Submit Work", desc: "Upload files and click 'Submit'. Money still locked.", icon: "⏳", color: "yellow" },
              { step: 5, title: "Get Paid", desc: "Client approves → Payment released instantly.", icon: "💰", color: "green" }
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl p-6 border hover:border-brand-orange/30 transition" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{item.step}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            <Link to="/student/profile" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition">
              → Start Selling
            </Link>
          </div>
        </div>
      </div>

      {/* Client Journey */}
      <div className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-4 text-center" style={{ color: 'var(--text-primary)' }}>🔍 The Client Journey (Buyer)</h2>
          <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: 'var(--text-muted)' }}>5 steps to hire verified talent</p>

          <div className="space-y-6">
            {[
              { step: 1, title: "Search & Filter", desc: "Find verified students by category, price, and rating.", icon: "🔍" },
              { step: 2, title: "Secure Hiring", desc: "Deposit payment → Locked in escrow vault.", icon: "🔒" },
              { step: 3, title: "Chat & Monitor", desc: "Communicate with student, share files, track progress.", icon: "💬" },
              { step: 4, title: "Review Work", desc: "Approve or request revision. Money stays locked until approved.", icon: "👀" },
              { step: 5, title: "Leave Feedback", desc: "Rate student 1-5 stars. Build platform trust.", icon: "⭐" }
            ].map((item, idx) => (
              <div key={idx} className="rounded-xl p-6 border hover:border-brand-orange/30 transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
                <div className="flex gap-6">
                  <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">{item.step}</div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                    <p style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 text-center">
            {isLoggedIn ? (
              <Link to="/client/search" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition">
                → Browse Services
              </Link>
            ) : (
              <Link to="/auth" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition">
                → Browse Services
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Escrow System */}
      <div className="py-20 px-4 border-y" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)' }}>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: 'var(--text-primary)' }}>🔐 The Escrow Vault: Your Trust Bridge</h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="rounded-xl p-8 border" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>How It Works</h3>
              <div className="space-y-4">
                {[
                  "💰 Client Deposits → Payment Locked",
                  "🔒 Student Sees Money But Can't Touch It",
                  "✏️ Student Creates Work",
                  "👀 Client Reviews & Approves",
                  "✅ Payment Released to Student Wallet"
                ].map((item, idx) => (
                  <p key={idx} style={{ color: 'var(--text-muted)' }}>{item}</p>
                ))}
              </div>
            </div>

            <div className="rounded-xl p-8 border" style={{ backgroundColor: 'var(--bg-dark)', borderColor: 'var(--border-color)' }}>
              <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>Why This Matters</h3>
              <div className="space-y-3">
                <p style={{ color: 'var(--text-muted)' }}>🛡️ <strong style={{ color: 'var(--text-primary)' }}>No Scams</strong> - Student can't disappear with money</p>
                <p style={{ color: 'var(--text-muted)' }}>🛡️ <strong style={{ color: 'var(--text-primary)' }}>Client Protected</strong> - Can refuse if work is bad</p>
                <p style={{ color: 'var(--text-muted)' }}>⚖️ <strong style={{ color: 'var(--text-primary)' }}>Fair System</strong> - Micro-Job is neutral third party</p>
                <p style={{ color: 'var(--text-muted)' }}>📊 <strong style={{ color: 'var(--text-primary)' }}>Build Trust</strong> - Ratings create reputation</p>
              </div>
            </div>
          </div>

          <div className="mt-8 bg-brand-orange/10 border border-brand-orange/50 rounded-xl p-6 text-center">
            <p style={{ color: 'var(--text-primary)' }}>
              <strong>This is your patent-worthy innovation:</strong> Verified campus talent + Secure escrow + Campus community
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="py-20 px-4" style={{ background: 'linear-gradient(to bottom, var(--bg-dark), var(--bg-card))' }}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6" style={{ color: 'var(--text-primary)' }}>Ready to Get Started?</h2>
          <p className="text-xl mb-8" style={{ color: 'var(--text-muted)' }}>Join verified students and trusted clients</p>
          <div className="flex justify-center gap-4 flex-wrap">
            {isLoggedIn ? (
              <>
                <Link to="/dashboard" className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition">
                  Go to Dashboard
                </Link>
                <Link to="/client/search" className="border border-brand-orange text-brand-orange hover:bg-brand-orange/10 px-8 py-3 rounded-lg font-semibold transition">
                  Browse Services
                </Link>
              </>
            ) : (
              <>
                <Link to="/auth" className="bg-brand-orange hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition">
                  Sign Up Now
                </Link>
                <a href="#how-it-works" className="border border-brand-orange text-brand-orange hover:bg-brand-orange/10 px-8 py-3 rounded-lg font-semibold transition">
                  Learn More
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}