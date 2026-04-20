import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, MessageSquare, Upload, Loader, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function StudentOrders() {
  const [alert, setAlert] = useState(null);
  const [orders, setOrders] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [submitting, setSubmitting] = useState(null);
  const studentId = localStorage.getItem('userId') || localStorage.getItem('userEmail');
  const navigate = useNavigate();

  // Redirect if not logged in
  useEffect(() => {
    if (!studentId) {
      navigate('/auth');
    }
  }, [studentId, navigate]);

  // Fetch orders and transactions from backend
  useEffect(() => {
    if (studentId) {
      fetchOrders();
      fetchTransactions();
    }
  }, [studentId]);

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${API_URL}/orders/student/${studentId}`);
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setLoading(false);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch(`${API_URL}/escrow/student/${encodeURIComponent(studentId)}`);
      const data = await response.json();
      setTransactions(data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'deposit_pending': return <Clock className="w-5 h-5 text-blue-400" />;
      case 'in_escrow': return <Clock className="w-5 h-5 text-purple-400" />;
      case 'in_progress': return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'submitted_for_review': return <AlertCircle className="w-5 h-5 text-orange-400" />;
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'revision_requested': return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'disputed': return <AlertCircle className="w-5 h-5 text-red-600" />;
      default: return null;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      deposit_pending: 'Awaiting Payment',
      in_escrow: 'Funds Secured',
      in_progress: 'In Progress',
      submitted_for_review: 'Under Review',
      completed: 'Completed',
      revision_requested: 'Revision Needed',
      disputed: 'Disputed'
    };
    return labels[status] || status;
  };

  const handleStartWork = async (orderId) => {
    try {
      setSubmitting(orderId);
      const response = await fetch(`${API_URL}/orders/${orderId}/start-work`, {
        method: 'POST'
      });
      const data = await response.json();
      setOrders(orders.map(o => o.id === orderId ? data.order : o));
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to start work:', error);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitWork = async (orderId) => {
    try {
      setSubmitting(orderId);
      const response = await fetch(`${API_URL}/orders/${orderId}/submit-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deliverables: 'Work files attached',
          notes: 'Ready for review'
        })
      });
      const data = await response.json();
      setOrders(orders.map(o => o.id === orderId ? data.order : o));
      setSelectedOrder(null);
    } catch (error) {
      console.error('Failed to submit work:', error);
    } finally {
      setSubmitting(null);
    }
  };

  const handleSubmitTransactionWork = async (transactionId) => {
    try {
      setSubmitting(transactionId);
      const response = await fetch(`${API_URL}/escrow/submit-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transactionId })
      });
      
      if (response.ok) {
        setAlert({ message: '✅ Work submitted! Waiting for client review.', type: 'success' });
        fetchTransactions();
      } else {
        const error = await response.json();
        setAlert({ message: '❌ Error: ' + (error.error || 'Failed to submit work'), type: 'error' });
      }
    } catch (error) {
      console.error('Failed to submit work:', error);
      setAlert({ message: '❌ Failed to submit work', type: 'error' });
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-white mb-8">My Orders & Transactions</h1>

        {/* Escrow Transactions Section */}
        {transactions.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">💰 Active Escrow Transactions</h2>
            <div className="space-y-4">
              {transactions.map(tx => (
                <div
                  key={tx._id}
                  className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{tx.title}</h3>
                      <p className="text-brand-muted text-sm">Transaction ID: {tx._id.slice(-8)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-brand-orange mb-2">₹{tx.amount}</p>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={
                          tx.status === 'COMPLETED' ? 'px-3 py-1 rounded-full font-semibold bg-green-500/20 text-green-400' :
                          tx.status === 'WORK_SUBMITTED' ? 'px-3 py-1 rounded-full font-semibold bg-purple-500/20 text-purple-400' :
                          tx.status === 'IN_ESCROW' ? 'px-3 py-1 rounded-full font-semibold bg-yellow-500/20 text-yellow-400' :
                          tx.status === 'WAITING_ADMIN_APPROVAL' ? 'px-3 py-1 rounded-full font-semibold bg-blue-500/20 text-blue-400' :
                          tx.status === 'REVISION_REQUESTED' ? 'px-3 py-1 rounded-full font-semibold bg-orange-500/20 text-orange-400' :
                          'px-3 py-1 rounded-full font-semibold bg-white/10 text-white'
                        }>
                          {tx.status === 'WAITING_ADMIN_APPROVAL' ? '⏳ Awaiting Admin' :
                           tx.status === 'IN_ESCROW' ? '🔒 Funded - Start Work' :
                           tx.status === 'WORK_SUBMITTED' ? '📤 Submitted' :
                           tx.status === 'REVISION_REQUESTED' ? '🔄 Revision Needed' :
                           tx.status === 'COMPLETED' ? '✅ Completed' : tx.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {tx.status === 'IN_ESCROW' && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => handleSubmitTransactionWork(tx._id)}
                        disabled={submitting === tx._id}
                        className="bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition flex items-center gap-2"
                      >
                        <Upload className="w-4 h-4" />
                        {submitting === tx._id ? 'Submitting...' : 'Submit Work'}
                      </button>
                    </div>
                  )}

                  {tx.status === 'REVISION_REQUESTED' && (
                    <div className="mt-4">
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 mb-3">
                        <p className="text-orange-400 text-sm font-semibold mb-2">🔄 Client Requested Revision</p>
                        {tx.revisionMessage && (
                          <p className="text-white text-sm mb-2">Reason: "{tx.revisionMessage}"</p>
                        )}
                        <p className="text-brand-muted text-sm">Make the requested changes and resubmit your work.</p>
                      </div>
                      <button
                        onClick={() => handleSubmitTransactionWork(tx._id)}
                        disabled={submitting === tx._id}
                        className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg transition flex items-center gap-2 justify-center font-semibold"
                      >
                        <Upload className="w-4 h-4" />
                        {submitting === tx._id ? 'Resubmitting...' : 'Resubmit Work'}
                      </button>
                    </div>
                  )}

                  {tx.status === 'WORK_SUBMITTED' && (
                    <div className="mt-4 bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                      <p className="text-purple-400 text-sm">✅ Work submitted! Waiting for client to review and approve.</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Orders Section */}
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader className="w-8 h-8 text-brand-orange animate-spin" />
          </div>
        ) : (orders.length === 0 && transactions.length === 0) ? (
          <div className="bg-brand-card rounded-2xl p-12 text-center border border-white/10">
            <p className="text-brand-muted mb-4">No orders yet. Your first client will appear here!</p>
          </div>
        ) : orders.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-white mb-4">📋 Regular Orders</h2>
            <div className="space-y-4">
            {orders.map(order => (
              <div
                key={order.id}
                className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition"
              >
                {/* Order Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2">{order.gigTitle}</h3>
                    <p className="text-brand-muted text-sm">Client: {order.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-brand-orange mb-2">₹{order.amount}</p>
                    <div className="flex items-center gap-2 text-sm">
                      {getStatusIcon(order.status)}
                      <span className={`font-semibold ${
                        order.status === 'completed' ? 'text-green-400' :
                        order.status === 'submitted_for_review' ? 'text-orange-400' :
                        order.status === 'revision_requested' ? 'text-red-400' :
                        order.status === 'disputed' ? 'text-red-600' :
                        'text-yellow-400'
                      }`}>
                        {getStatusLabel(order.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Button */}
                <div className="mb-4">
                  <button
                    onClick={() => navigate(`/order/${order._id}`)}
                    className="w-full bg-brand-orange/10 text-brand-orange border border-brand-orange/30 hover:bg-brand-orange/20 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Order Details & Submit Work
                  </button>
                </div>

                {/* Timeline */}
                <div className="grid md:grid-cols-3 gap-4 text-sm mb-4">
                  <div className="bg-brand-dark rounded-lg p-3 border border-white/5">
                    <p className="text-brand-muted">Created</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="bg-brand-dark rounded-lg p-3 border border-white/5">
                    <p className="text-brand-muted">Due</p>
                    <p className={`text-white ${new Date() > new Date(order.dueDate) ? 'text-red-400' : ''}`}>
                      {new Date(order.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="bg-brand-dark rounded-lg p-3 border border-white/5">
                    <p className="text-brand-muted">Days Left</p>
                    <p className="text-white">{Math.ceil((new Date(order.dueDate) - new Date()) / (1000 * 60 * 60 * 24))} days</p>
                  </div>
                </div>

                {/* Expanded Details */}
                {selectedOrder?.id === order.id && (
                  <div className="mt-6 pt-6 border-t border-white/10 space-y-4">
                    {/* Status-specific Actions */}
                    {order.status === 'deposit_pending' && (
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <p className="text-blue-400 text-sm mb-3">💳 Waiting for client to deposit funds in escrow</p>
                      </div>
                    )}

                    {order.status === 'in_escrow' && (
                      <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-4">
                        <p className="text-purple-400 text-sm mb-3">🔒 Funds secured in escrow. Ready to start?</p>
                        <button
                          onClick={() => handleStartWork(order.id)}
                          disabled={submitting === order.id}
                          className="w-full bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          {submitting === order.id ? <Loader className="w-4 h-4 animate-spin" /> : null}
                          Start Working
                        </button>
                      </div>
                    )}

                    {order.status === 'in_progress' && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-yellow-400 text-sm mb-3">⏳ Work in progress. Ready to submit?</p>
                        <button
                          onClick={() => handleSubmitWork(order.id)}
                          disabled={submitting === order.id}
                          className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2 rounded-lg transition flex items-center justify-center gap-2"
                        >
                          {submitting === order.id ? <Loader className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                          Submit Work
                        </button>
                      </div>
                    )}

                    {order.status === 'submitted_for_review' && (
                      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                        <p className="text-orange-400 text-sm flex items-center gap-2 mb-3">
                          <Clock className="w-4 h-4" /> Client is reviewing your work...
                        </p>
                        <p className="text-brand-muted text-sm">Submitted on {new Date(order.submittedAt).toLocaleDateString()}</p>
                      </div>
                    )}

                    {order.status === 'completed' && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-green-400 text-sm flex items-center gap-2 mb-3">
                          <CheckCircle className="w-4 h-4" /> Work Approved! Payment Released!
                        </p>
                        <p className="text-brand-muted text-sm">💰 ₹{order.amount} transferred to your wallet (₹{(order.amount * 0.9).toFixed(2)} after 10% platform fee)</p>
                      </div>
                    )}

                    {order.status === 'revision_requested' && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm flex items-center gap-2 mb-3">
                          <AlertCircle className="w-4 h-4" /> Client Requested Revision
                        </p>
                        <p className="text-brand-muted text-sm mb-3">Make changes and resubmit. Money stays locked until approved.</p>
                        <button
                          onClick={() => handleSubmitWork(order.id)}
                          disabled={submitting === order.id}
                          className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white py-2 rounded-lg transition"
                        >
                          {submitting === order.id ? <Loader className="w-4 h-4 animate-spin inline mr-2" /> : null}
                          Resubmit Work
                        </button>
                      </div>
                    )}

                    {order.status === 'disputed' && (
                      <div className="bg-red-600/10 border border-red-600/30 rounded-lg p-4">
                        <p className="text-red-400 text-sm">⚠️ This order is under dispute. Support team has been notified.</p>
                      </div>
                    )}

                    {/* Chat */}
                    <button className="w-full mt-4 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition flex items-center justify-center gap-2">
                      <MessageSquare className="w-4 h-4" /> Chat with Client
                    </button>
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>
        )}
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
