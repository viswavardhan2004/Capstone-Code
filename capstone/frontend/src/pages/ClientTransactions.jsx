import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Clock, MessageCircle, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function ClientTransactions() {
  const [alert, setAlert] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedTx, setSelectedTx] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [ratingLoading, setRatingLoading] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [revisionLoading, setRevisionLoading] = useState(false);
  const navigate = useNavigate();
  
  const clientId = localStorage.getItem('userId') || localStorage.getItem('userEmail');

  useEffect(() => {
    if (!clientId) {
      navigate('/auth');
      return;
    }
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      
      // Fetch all transactions where this user is the client
      const response = await fetch(`${API_URL}/escrow/client/${encodeURIComponent(clientId)}`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        setAlert({ message: '⚠️ Failed to load transactions', type: 'warning' });
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setAlert({ message: '❌ Error loading transactions', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(tx => tx.status.toLowerCase() === filter.toLowerCase());

  const handleApprovePayment = async (txId) => {
    try {
      const response = await fetch(`${API_URL}/escrow/approve/${txId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (response.ok) {
        setAlert({ message: '✅ Payment approved! Student will receive the funds.', type: 'success' });
        // Update transaction status locally
        setTransactions(transactions.map(tx => 
          tx._id === txId ? { ...tx, status: 'COMPLETED' } : tx
        ));
        setShowRatingModal(true);
        setSelectedTx(txId);
      } else {
        setAlert({ message: '❌ Failed to approve payment', type: 'error' });
      }
    } catch (error) {
      console.error('Error approving payment:', error);
      setAlert({ message: '❌ Error approving payment', type: 'error' });
    }
  };

  const handleRequestRevision = async (txId) => {
    if (!revisionReason.trim()) {
      setAlert({ message: '⚠️ Please provide a revision reason', type: 'warning' });
      return;
    }

    try {
      setRevisionLoading(true);
      const response = await fetch(`${API_URL}/escrow/request-revision/${txId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: revisionReason })
      });

      if (response.ok) {
        setAlert({ message: '🔄 Revision requested! Student has been notified.', type: 'success' });
        setTransactions(transactions.map(tx => 
          tx._id === txId ? { ...tx, status: 'REVISION_REQUESTED' } : tx
        ));
        setShowRevisionModal(false);
        setRevisionReason('');
      } else {
        setAlert({ message: '❌ Failed to request revision', type: 'error' });
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      setAlert({ message: '❌ Error requesting revision', type: 'error' });
    } finally {
      setRevisionLoading(false);
    }
  };

  const handleSubmitRating = async () => {
    try {
      setRatingLoading(true);
      const response = await fetch(`${API_URL}/escrow/rate/${selectedTx}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review })
      });

      if (response.ok) {
        setAlert({ message: '⭐ Rating submitted! Thank you for your feedback.', type: 'success' });
        setShowRatingModal(false);
        setRating(5);
        setReview('');
        setSelectedTx(null);
      } else {
        setAlert({ message: '❌ Failed to submit rating', type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setAlert({ message: '❌ Error submitting rating', type: 'error' });
    } finally {
      setRatingLoading(false);
    }
  };

  const handleMessageStudent = (tx) => {
    navigate('/messages', { state: { selectedStudent: tx.studentId } });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'REVISION_REQUESTED':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-blue-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'IN_ESCROW':
        return 'text-yellow-400';
      case 'REVISION_REQUESTED':
        return 'text-orange-400';
      case 'REJECTED':
        return 'text-red-400';
      case 'WORK_SUBMITTED':
        return 'text-blue-400';
      default:
        return 'text-brand-muted';
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-brand-muted">Manage your purchases and payments</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['all', 'in_escrow', 'work_submitted', 'revision_requested', 'completed', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg transition font-semibold whitespace-nowrap ${
                filter === f
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-card text-brand-muted hover:text-white border border-white/10'
              }`}
            >
              {f.replace(/_/g, ' ').toUpperCase()}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {loading ? (
          <p className="text-brand-muted text-center py-12">Loading transactions...</p>
        ) : filteredTransactions.length === 0 ? (
          <div className="bg-brand-card rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-brand-muted mb-4">
              {filter === 'all' 
                ? 'No transactions yet. Start hiring students!' 
                : `No ${filter.replace(/_/g, ' ')} transactions`}
            </p>
            <a href="/student/search" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition font-semibold">
              Find Students
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx) => (
              <div 
                key={tx._id} 
                className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/30 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(tx.status)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{tx.title || 'Project'}</h3>
                      <p className="text-brand-muted text-sm">
                        Student: <span className="text-white">{tx.studentId?.name || 'Unknown'}</span>
                      </p>
                      <p className="text-brand-muted text-sm">
                        Created: {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-2xl">₹{tx.amount.toFixed(2)}</p>
                    <p className={`text-sm font-semibold capitalize ${getStatusColor(tx.status)}`}>
                      {tx.status.replace(/_/g, ' ')}
                    </p>
                  </div>
                </div>

                {/* Status-specific messages */}
                {tx.status === 'WORK_SUBMITTED' && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">Student has submitted their work for your review. Please approve or request revisions.</p>
                  </div>
                )}

                {tx.status === 'REVISION_REQUESTED' && (
                  <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-orange-300 text-sm">You requested revisions. Waiting for student to resubmit work.</p>
                  </div>
                )}

                {tx.status === 'REJECTED' && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">Admin rejected this payment. Reason: {tx.rejectionReason || 'Not provided'}</p>
                  </div>
                )}

                {tx.status === 'IN_ESCROW' && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">Payment is in escrow. Waiting for admin approval before student delivers work.</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {tx.status === 'WORK_SUBMITTED' && (
                    <>
                      <button
                        onClick={() => handleApprovePayment(tx._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Pay
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTx(tx._id);
                          setShowRevisionModal(true);
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition font-semibold"
                      >
                        Request Revision
                      </button>
                    </>
                  )}

                  {tx.status === 'COMPLETED' && (
                    <button
                      onClick={() => {
                        setSelectedTx(tx._id);
                        setShowRatingModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Rate Work
                    </button>
                  )}

                  <button
                    onClick={() => handleMessageStudent(tx)}
                    className="flex-1 bg-brand-card hover:bg-brand-card/80 text-white py-2 rounded-lg transition font-semibold border border-white/10 flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Message
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-card rounded-2xl p-8 max-w-md w-full border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Rate This Work</h2>
            
            <div className="mb-6">
              <p className="text-brand-muted text-sm mb-3">How would you rate the quality?</p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="transition"
                  >
                    <Star 
                      className={`w-8 h-8 ${
                        star <= rating 
                          ? 'fill-yellow-400 text-yellow-400' 
                          : 'text-white/30'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-brand-muted text-sm mb-2">Leave a review (optional)</p>
              <textarea
                value={review}
                onChange={(e) => setReview(e.target.value)}
                placeholder="Share your experience with this student..."
                className="w-full bg-brand-dark text-white rounded-lg p-3 border border-white/10 focus:border-brand-orange focus:outline-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setSelectedTx(null);
                  setRating(5);
                  setReview('');
                }}
                className="flex-1 bg-brand-dark hover:bg-brand-dark/80 text-white py-2 rounded-lg transition font-semibold border border-white/10"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={ratingLoading}
                className="flex-1 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg transition font-semibold"
              >
                {ratingLoading ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revision Modal */}
      {showRevisionModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-brand-card rounded-2xl p-8 max-w-md w-full border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-4">Request Revision</h2>
            <p className="text-brand-muted text-sm mb-4">Tell the student what needs to be fixed or improved.</p>
            
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="e.g., Please adjust the color scheme to match the designs..."
              className="w-full bg-brand-dark text-white rounded-lg p-3 border border-white/10 focus:border-brand-orange focus:outline-none mb-6"
              rows="4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionReason('');
                  setSelectedTx(null);
                }}
                className="flex-1 bg-brand-dark hover:bg-brand-dark/80 text-white py-2 rounded-lg transition font-semibold border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestRevision(selectedTx)}
                disabled={revisionLoading}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 rounded-lg transition font-semibold"
              >
                {revisionLoading ? 'Requesting...' : 'Request'}
              </button>
            </div>
          </div>
        </div>
      )}

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
