import React, { useState, useEffect } from 'react';
import { TrendingUp, Lock, CheckCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function StudentEarnings() {
  const [alert, setAlert] = useState(null);
  const [earnings, setEarnings] = useState({
    totalEarned: 0,
    inEscrow: 0,
    available: 0,
    transactions: []
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const studentId = localStorage.getItem('userId') || localStorage.getItem('userEmail');

  useEffect(() => {
    if (!studentId) {
      navigate('/auth');
      return;
    }
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      
      // Fetch transactions for this student
      const response = await fetch(`${API_URL}/escrow/student/${encodeURIComponent(studentId)}`);
      if (response.ok) {
        const transactions = await response.json();
        
        // Calculate earnings breakdown
        let totalEarned = 0;
        let inEscrow = 0;
        let available = 0;
        
        const formattedTransactions = transactions.map(tx => {
          const amount = tx.amount || 0;
          
          if (tx.status === 'COMPLETED') {
            totalEarned += amount;
            available += amount;
          } else if (tx.status === 'IN_ESCROW') {
            totalEarned += amount;
            inEscrow += amount;
          }
          
          return {
            id: tx._id,
            title: tx.title || 'Project',
            amount: amount,
            status: tx.status,
            date: new Date(tx.createdAt).toLocaleDateString(),
            client: tx.clientId?.name || 'Client',
            createdAt: new Date(tx.createdAt)
          };
        });

        setEarnings({
          totalEarned,
          inEscrow,
          available,
          transactions: formattedTransactions.sort((a, b) => b.createdAt - a.createdAt)
        });
      } else {
        setAlert({ message: '⚠️ Failed to load earnings', type: 'warning' });
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setAlert({ message: '❌ Error loading earnings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = () => {
    if (earnings.available <= 0) {
      setAlert({ message: '⚠️ No balance available to withdraw', type: 'warning' });
      return;
    }
    setAlert({ message: '🎉 Withdrawal request submitted! Amount will be transferred within 2-3 business days.', type: 'success' });
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wallet & Earnings</h1>
          <p className="text-brand-muted">Track your income from completed projects</p>
        </div>

        {/* Earnings Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Total Earned */}
          <div className="bg-gradient-to-br from-brand-card to-brand-dark rounded-xl p-6 border border-green-500/30 hover:border-green-500/60 transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brand-muted text-sm">Total Earned</p>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-white mb-1">₹{earnings.totalEarned.toFixed(2)}</h3>
            <p className="text-xs text-green-400">{earnings.transactions.length} transactions</p>
          </div>

          {/* In Escrow (Locked) */}
          <div className="bg-gradient-to-br from-brand-card to-brand-dark rounded-xl p-6 border border-yellow-500/30 hover:border-yellow-500/60 transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brand-muted text-sm">In Escrow (Locked)</p>
              <Lock className="w-5 h-5 text-yellow-500" />
            </div>
            <h3 className="text-3xl font-bold text-yellow-400">₹{earnings.inEscrow.toFixed(2)}</h3>
            <p className="text-xs text-yellow-400 mt-2">Waiting for client approval</p>
          </div>

          {/* Available to Withdraw */}
          <div className="bg-gradient-to-br from-brand-card to-brand-dark rounded-xl p-6 border border-blue-500/30 hover:border-blue-500/60 transition">
            <div className="flex items-center justify-between mb-4">
              <p className="text-brand-muted text-sm">Available</p>
              <CheckCircle className="w-5 h-5 text-blue-500" />
            </div>
            <h3 className="text-3xl font-bold text-blue-400">₹{earnings.available.toFixed(2)}</h3>
            <button 
              onClick={handleWithdraw}
              className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-2 rounded-lg transition text-sm font-semibold flex items-center justify-center gap-2"
            >
              <ArrowRight className="w-4 h-4" />
              Withdraw Now
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="bg-brand-card rounded-2xl p-8 border border-white/10 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">How Your Earnings Work</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">1</div>
              <div>
                <p className="text-white font-semibold">Client deposits payment</p>
                <p className="text-brand-muted text-sm">Client deposits funds into escrow vault for security</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">2</div>
              <div>
                <p className="text-white font-semibold">You deliver work</p>
                <p className="text-brand-muted text-sm">Submit your completed work through the dashboard</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">3</div>
              <div>
                <p className="text-white font-semibold">Money goes to "In Escrow"</p>
                <p className="text-brand-muted text-sm">Funds are locked and shown here while client reviews</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 bg-brand-orange rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold text-sm">4</div>
              <div>
                <p className="text-white font-semibold">Client approves = Payment Released</p>
                <p className="text-brand-muted text-sm">Funds move to Available, then you can withdraw</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-brand-card rounded-2xl p-8 border border-white/10">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Transactions</h2>
          {loading ? (
            <p className="text-brand-muted">Loading transactions...</p>
          ) : earnings.transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-brand-muted mb-4">No transactions yet. Start completing gigs to earn money!</p>
              <a href="/student/gigs" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition font-semibold">
                Create Your First Gig
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {earnings.transactions.map((tx) => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-brand-dark rounded-lg border border-white/5 hover:border-brand-orange/30 transition">
                  <div className="flex items-center gap-4">
                    {tx.status === 'COMPLETED' ? (
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </div>
                    ) : tx.status === 'IN_ESCROW' ? (
                      <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center">
                        <Lock className="w-5 h-5 text-yellow-500" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Clock className="w-5 h-5 text-blue-500" />
                      </div>
                    )}
                    <div>
                      <p className="text-white font-semibold">{tx.title}</p>
                      <p className="text-brand-muted text-sm">From: {tx.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-lg">₹{tx.amount.toFixed(2)}</p>
                    <p className={`text-xs capitalize font-semibold ${
                      tx.status === 'COMPLETED' ? 'text-green-400' :
                      tx.status === 'IN_ESCROW' ? 'text-yellow-400' :
                      'text-blue-400'
                    }`}>
                      {tx.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>
              ))}
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
