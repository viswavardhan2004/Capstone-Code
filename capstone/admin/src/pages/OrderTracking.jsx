import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, Clock, CheckCircle, AlertCircle, MessageCircle, Upload, Star } from 'lucide-react';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function OrderTracking() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deliverables, setDeliverables] = useState('');
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [revisionMsg, setRevisionMsg] = useState('');
  const userEmail = localStorage.getItem('userEmail');
  const userType = localStorage.getItem('userType');

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Auto-refresh every 5s
    return () => clearInterval(interval);
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}`);
      if (response.ok) {
        const data = await response.json();
        setOrder(data);
      }
    } catch (error) {
      console.error('Failed to fetch order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartWork = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/start-work`, {
        method: 'POST'
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Failed to start work:', error);
    }
  };

  const handleSubmitWork = async () => {
    if (!deliverables.trim()) {
      setAlert({ message: '⚠️ Please provide deliverables/work link', type: 'warning' });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/submit-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliverables, notes })
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setDeliverables('');
        setNotes('');
        setAlert({ message: '🎉 Work submitted! Waiting for client approval.', type: 'success' });
      }
    } catch (error) {
      console.error('Failed to submit work:', error);
    }
  };

  const handleApprove = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, review })
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setAlert({ message: `🎉 Work approved! ₹${data.studentEarnings} released to student.`, type: 'success' });
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleRequestRevision = async () => {
    if (!revisionMsg.trim()) {
      setAlert({ message: '⚠️ Please explain what needs to be revised', type: 'warning' });
      return;
    }
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/request-revision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ revisionRequest: revisionMsg })
      });
      if (response.ok) {
        const data = await response.json();
        setOrder(data.order);
        setRevisionMsg('');
        setAlert({ message: '🔄 Revision requested. Funds remain locked.', type: 'info' });
      }
    } catch (error) {
      console.error('Failed to request revision:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center pt-24">
        <div className="text-white">Loading order...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-brand-dark flex items-center justify-center pt-24">
        <div className="text-center">
          <p className="text-white mb-4">Order not found</p>
          <button onClick={() => navigate('/dashboard')} className="bg-brand-orange text-white px-6 py-2 rounded-lg">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isStudent = userType === 'student';
  const isClient = userType === 'client';

  return (
    <div className="min-h-screen bg-brand-dark p-4 pt-24">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-brand-card rounded-2xl p-6 mb-6 border border-white/10">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">{order.gigTitle}</h1>
              <p className="text-brand-muted">Order ID: {order._id.substring(0, 8)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-brand-orange">₹{order.amount}</p>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="flex items-center justify-between mb-6">
            <TimelineStep icon={<CheckCircle />} active={true} label="Payment" />
            <div className="flex-1 h-1 bg-white/10 mx-2">
              <div className={`h-full bg-brand-orange transition-all ${order.status !== 'deposit_pending' ? 'w-full' : 'w-0'}`} />
            </div>
            <TimelineStep icon={<Lock />} active={order.status !== 'deposit_pending'} label="Escrow" />
            <div className="flex-1 h-1 bg-white/10 mx-2">
              <div className={`h-full bg-brand-orange transition-all ${['in_progress', 'submitted_for_review', 'completed'].includes(order.status) ? 'w-full' : 'w-0'}`} />
            </div>
            <TimelineStep icon={<Clock />} active={['in_progress', 'submitted_for_review', 'completed'].includes(order.status)} label="Working" />
            <div className="flex-1 h-1 bg-white/10 mx-2">
              <div className={`h-full bg-brand-orange transition-all ${order.status === 'completed' ? 'w-full' : 'w-0'}`} />
            </div>
            <TimelineStep icon={<CheckCircle />} active={order.status === 'completed'} label="Complete" />
          </div>

          {/* Status Badge */}
          <div className="flex justify-center">
            <div className={`inline-flex px-4 py-2 rounded-full text-sm font-semibold ${
              order.status === 'deposit_pending' ? 'bg-blue-500/20 text-blue-400' :
              order.status === 'in_escrow' ? 'bg-yellow-500/20 text-yellow-400' :
              order.status === 'in_progress' ? 'bg-orange-500/20 text-orange-400' :
              order.status === 'submitted_for_review' ? 'bg-purple-500/20 text-purple-400' :
              order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {order.status === 'deposit_pending' && '💳 Payment Pending'}
              {order.status === 'in_escrow' && '🔒 Funds Locked in Escrow'}
              {order.status === 'in_progress' && '⏳ Student Working'}
              {order.status === 'submitted_for_review' && '👀 Awaiting Client Review'}
              {order.status === 'completed' && '✅ Completed'}
              {order.status === 'revision_requested' && '🔄 Revision Requested'}
            </div>
          </div>
        </div>

        {/* Escrow Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-brand-card rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <Lock className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-brand-muted text-sm">Escrow Balance</p>
                <p className="text-white text-xl font-bold">₹{order.amount}</p>
              </div>
            </div>
          </div>
          <div className="bg-brand-card rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-brand-muted text-sm">Time Remaining</p>
                <p className="text-white text-xl font-bold">
                  {order.dueDate ? Math.max(0, Math.ceil((new Date(order.dueDate) - new Date()) / (1000 * 60 * 60 * 24))) : 'N/A'} days
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Student Actions */}
        {isStudent && order.status === 'in_escrow' && (
          <div className="bg-brand-card rounded-xl p-6 mb-6 border border-green-500/30">
            <h3 className="text-white font-bold text-lg mb-4">✅ Escrow Funded - Ready to Start!</h3>
            <p className="text-brand-muted mb-4">Payment is locked safely. Click below to begin working.</p>
            <button onClick={handleStartWork} className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold w-full">
              Start Working
            </button>
          </div>
        )}

        {isStudent && order.status === 'in_progress' && (
          <div className="bg-brand-card rounded-xl p-6 mb-6 border border-white/10">
            <h3 className="text-white font-bold text-lg mb-4">📤 Submit Your Work</h3>
            <div className="space-y-4">
              <div>
                <label className="text-white font-medium mb-2 block">Deliverables / Work Link *</label>
                <input
                  type="text"
                  value={deliverables}
                  onChange={(e) => setDeliverables(e.target.value)}
                  placeholder="https://drive.google.com/... or paste deliverable link"
                  className="w-full bg-brand-dark text-white px-4 py-3 rounded-lg border border-white/10 focus:border-brand-orange outline-none"
                />
              </div>
              <div>
                <label className="text-white font-medium mb-2 block">Additional Notes (Optional)</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Explain what you've done..."
                  rows={3}
                  className="w-full bg-brand-dark text-white px-4 py-3 rounded-lg border border-white/10 focus:border-brand-orange outline-none resize-none"
                />
              </div>
              <button onClick={handleSubmitWork} className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold w-full flex items-center justify-center gap-2">
                <Upload className="w-5 h-5" /> Submit Work for Review
              </button>
            </div>
          </div>
        )}

        {isStudent && order.status === 'revision_requested' && (
          <div className="bg-brand-card rounded-xl p-6 mb-6 border border-orange-500/30">
            <h3 className="text-white font-bold text-lg mb-4">🔄 Revision Requested</h3>
            <p className="text-brand-muted mb-2">Client feedback:</p>
            <div className="bg-brand-dark p-4 rounded-lg mb-4 border border-orange-500/20">
              <p className="text-white">{order.revisionRequest || 'Please make the requested changes'}</p>
            </div>
            <p className="text-brand-muted mb-4">Update your work and resubmit.</p>
            <div className="space-y-4">
              <input
                type="text"
                value={deliverables}
                onChange={(e) => setDeliverables(e.target.value)}
                placeholder="Updated deliverable link"
                className="w-full bg-brand-dark text-white px-4 py-3 rounded-lg border border-white/10 focus:border-brand-orange outline-none"
              />
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="What did you fix?"
                rows={3}
                className="w-full bg-brand-dark text-white px-4 py-3 rounded-lg border border-white/10 focus:border-brand-orange outline-none resize-none"
              />
              <button onClick={handleSubmitWork} className="bg-brand-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold w-full">
                Resubmit Work
              </button>
            </div>
          </div>
        )}

        {/* Client Review */}
        {isClient && order.status === 'submitted_for_review' && (
          <div className="bg-brand-card rounded-xl p-6 mb-6 border border-purple-500/30">
            <h3 className="text-white font-bold text-lg mb-4">👀 Review Submitted Work</h3>
            
            {order.deliverables && (
              <div className="bg-brand-dark p-4 rounded-lg mb-4">
                <p className="text-brand-muted text-sm mb-2">Deliverables:</p>
                <a href={order.deliverables} target="_blank" rel="noopener noreferrer" className="text-brand-orange hover:underline break-all">
                  {order.deliverables}
                </a>
              </div>
            )}
            
            {order.submissionNotes && (
              <div className="bg-brand-dark p-4 rounded-lg mb-4">
                <p className="text-brand-muted text-sm mb-2">Student Notes:</p>
                <p className="text-white">{order.submissionNotes}</p>
              </div>
            )}

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white font-medium mb-2 block flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500" /> Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl ${star <= rating ? 'text-yellow-500' : 'text-white/20'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white font-medium mb-2 block">Review (Optional)</label>
                <textarea
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  placeholder="Share your feedback..."
                  rows={3}
                  className="w-full bg-brand-dark text-white px-4 py-3 rounded-lg border border-white/10 focus:border-brand-orange outline-none resize-none"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              <button onClick={handleApprove} className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" /> Approve & Release Payment
              </button>
              <button onClick={() => setRevisionMsg('Please revise...')} className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2">
                <AlertCircle className="w-5 h-5" /> Request Revision
              </button>
            </div>

            {revisionMsg && (
              <div className="mt-4 space-y-3">
                <textarea
                  value={revisionMsg}
                  onChange={(e) => setRevisionMsg(e.target.value)}
                  placeholder="Explain what needs to be changed..."
                  rows={3}
                  className="w-full bg-brand-dark text-white px-4 py-3 rounded-lg border border-orange-500/30 outline-none resize-none"
                />
                <div className="flex gap-3">
                  <button onClick={handleRequestRevision} className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold">
                    Send Revision Request
                  </button>
                  <button onClick={() => setRevisionMsg('')} className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20">
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Completed Status */}
        {order.status === 'completed' && (
          <div className="bg-brand-card rounded-xl p-6 mb-6 border border-green-500/30">
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-white font-bold text-2xl mb-2">Order Completed! 🎉</h3>
              <p className="text-brand-muted mb-4">
                {isStudent && `You earned ₹${(order.amount * 0.9).toFixed(0)} (₹${(order.amount * 0.1).toFixed(0)} platform fee)`}
                {isClient && 'Payment released to student. Thank you!'}
              </p>
              {order.rating && (
                <div className="flex justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < order.rating ? 'text-yellow-500 fill-yellow-500' : 'text-white/20'}`} />
                  ))}
                </div>
              )}
              {order.review && (
                <div className="bg-brand-dark p-4 rounded-lg mt-4">
                  <p className="text-white italic">"{order.review}"</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="bg-brand-card rounded-xl p-6 border border-white/10">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-brand-orange" />
            <h3 className="text-white font-bold text-lg">Order Chat</h3>
          </div>
          <div className="bg-brand-dark p-4 rounded-lg text-center text-brand-muted">
            Chat coming soon...
          </div>
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

function TimelineStep({ icon, active, label }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className={`w-10 h-10 rounded-full flex items-center justify-center transition ${
        active ? 'bg-brand-orange text-white' : 'bg-white/10 text-white/40'
      }`}>
        {icon}
      </div>
      <p className={`text-xs font-medium ${active ? 'text-white' : 'text-white/40'}`}>{label}</p>
    </div>
  );
}
