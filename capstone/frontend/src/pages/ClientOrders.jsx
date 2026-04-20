import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, MessageCircle, Star, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function ClientOrders() {
  const [alert, setAlert] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingData, setRatingData] = useState({ rating: 5, review: '' });
  const [submittingRating, setSubmittingRating] = useState(false);
  const [showRevisionModal, setShowRevisionModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState('');
  const [submittingRevision, setSubmittingRevision] = useState(false);
  
  const clientId = localStorage.getItem('userId') || localStorage.getItem('userEmail');
  const navigate = useNavigate();

  useEffect(() => {
    if (!clientId) {
      navigate('/auth');
      return;
    }
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/orders/client/${encodeURIComponent(clientId)}`);
      console.log('Fetching orders for client:', clientId);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('Orders fetched:', data.length, 'orders');
        console.log('Order statuses:', data.map(o => o.status));
        setOrders(data);
      } else {
        setAlert({ message: '⚠️ Failed to load orders', type: 'warning' });
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setAlert({ message: '❌ Error loading orders', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const handleApproveOrder = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/escrow/approve/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approverId: localStorage.getItem('userId') })
      });

      if (response.ok) {
        setAlert({ message: '✅ Order approved! Payment has been released to student.', type: 'success' });
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'COMPLETED' } : o));
        setShowRatingModal(true);
        setSelectedOrder(orderId);
      } else {
        setAlert({ message: '❌ Failed to approve order', type: 'error' });
      }
    } catch (error) {
      console.error('Error approving order:', error);
      setAlert({ message: '❌ Error approving order', type: 'error' });
    }
  };

  const handleRequestRevision = async (orderId) => {
    if (!revisionReason.trim()) {
      setAlert({ message: '⚠️ Please provide details for revision', type: 'warning' });
      return;
    }

    try {
      setSubmittingRevision(true);
      const response = await fetch(`${API_URL}/escrow/request-revision/${orderId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: revisionReason })
      });

      if (response.ok) {
        setAlert({ message: '🔄 Revision request sent! Student has been notified.', type: 'success' });
        setOrders(orders.map(o => o._id === orderId ? { ...o, status: 'REVISION_REQUESTED' } : o));
        setShowRevisionModal(false);
        setRevisionReason('');
      } else {
        setAlert({ message: '❌ Failed to request revision', type: 'error' });
      }
    } catch (error) {
      console.error('Error requesting revision:', error);
      setAlert({ message: '❌ Error requesting revision', type: 'error' });
    } finally {
      setSubmittingRevision(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!selectedOrder) return;
    
    try {
      setSubmittingRating(true);
      const response = await fetch(`${API_URL}/escrow/rate/${selectedOrder}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating: ratingData.rating,
          review: ratingData.review.trim(),
          raterId: localStorage.getItem('userId')
        })
      });

      const data = await response.json();

      if (response.ok) {
        setAlert({ message: '⭐ Thank you for rating! Your feedback helps our community.', type: 'success' });
        // Update the order to mark it as rated
        setOrders(orders.map(o => 
          o._id === selectedOrder 
            ? { ...o, rating: ratingData.rating, review: ratingData.review } 
            : o
        ));
        setShowRatingModal(false);
        setRatingData({ rating: 5, review: '' });
        setSelectedOrder(null);
      } else {
        setAlert({ message: `❌ ${data.error || 'Failed to submit rating'}`, type: 'error' });
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      setAlert({ message: '❌ Error submitting rating', type: 'error' });
    } finally {
      setSubmittingRating(false);
    }
  };

  const handleMessageStudent = (order) => {
    navigate('/messages', { state: { selectedStudent: order.studentId } });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'WORK_SUBMITTED':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'REVISION_REQUESTED':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'REJECTED':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      'WAITING_ADMIN_APPROVAL': 'Pending Admin Approval',
      'IN_ESCROW': 'Payment in Escrow',
      'WORK_SUBMITTED': 'Ready for Review',
      'COMPLETED': 'Completed',
      'REVISION_REQUESTED': 'Revision Requested',
      'REJECTED': 'Rejected'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-400';
      case 'WORK_SUBMITTED':
        return 'text-blue-400';
      case 'REVISION_REQUESTED':
        return 'text-orange-400';
      case 'REJECTED':
        return 'text-red-400';
      case 'IN_ESCROW':
        return 'text-yellow-400';
      default:
        return 'text-brand-muted';
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">My Orders</h1>
          <p className="text-brand-muted">View and manage your orders with students</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-2">
          {['all', 'WAITING_ADMIN_APPROVAL', 'IN_ESCROW', 'WORK_SUBMITTED', 'REVISION_REQUESTED', 'COMPLETED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-6 py-2 rounded-lg transition font-semibold whitespace-nowrap ${
                filter === f
                  ? 'bg-brand-orange text-white'
                  : 'bg-brand-card text-brand-muted hover:text-white border border-white/10'
              }`}
            >
              {f === 'all' ? 'ALL' : f.replace(/_/g, ' ')}
            </button>
          ))}
        </div>

        {/* Orders List */}
        {loading ? (
          <p className="text-brand-muted text-center py-12">Loading orders...</p>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-brand-card rounded-2xl p-12 border border-white/10 text-center">
            <p className="text-brand-muted mb-4">
              {filter === 'all' 
                ? 'No orders yet. Start hiring students to see them here!' 
                : `No ${filter} orders`}
            </p>
            <a href="/client/search" className="inline-block bg-brand-orange hover:bg-orange-600 text-white px-6 py-2 rounded-lg transition font-semibold">
              Hire a Student
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div 
                key={order._id} 
                className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/30 transition"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="mt-1">
                      {getStatusIcon(order.status)}
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{order.title || 'Order'}</h3>
                      <p className="text-brand-muted text-sm">
                        Student: <span className="text-white">{order.studentId?.name || 'Unknown'}</span>
                      </p>
                      <p className="text-brand-muted text-sm">
                        Order Date: {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold text-2xl">₹{order.amount?.toFixed(2) || '0.00'}</p>
                    <p className={`text-sm font-semibold capitalize ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </p>
                  </div>
                </div>

                {/* Status Messages */}
                {order.status === 'WAITING_ADMIN_APPROVAL' && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">⏳ Your payment is being verified by admin. Work will start once approved.</p>
                  </div>
                )}

                {order.status === 'IN_ESCROW' && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">💰 Payment is secured in escrow. Student is working on your order.</p>
                  </div>
                )}

                {order.status === 'WORK_SUBMITTED' && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-blue-300 text-sm">📤 Student has submitted their work! Please review and approve or request revisions.</p>
                  </div>
                )}

                {order.status === 'REVISION_REQUESTED' && (
                  <div className="mb-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
                    <p className="text-orange-300 text-sm">🔄 You requested revisions. Waiting for student to resubmit work.</p>
                  </div>
                )}

                {order.status === 'COMPLETED' && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                    <p className="text-green-300 text-sm">
                      ✅ Order completed! Student has been paid.
                      {order.rating ? (
                        <span className="ml-2">
                          You rated this order {order.rating}⭐
                        </span>
                      ) : (
                        <span className="ml-2">Don't forget to leave a rating!</span>
                      )}
                    </p>
                  </div>
                )}

                {order.status === 'REJECTED' && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <p className="text-red-300 text-sm">❌ Admin rejected this order. Reason: {order.rejectionReason || 'Not provided'}</p>
                  </div>
                )}

                {/* Display Rating if exists */}
                {order.rating && (
                  <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-semibold">Your Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star 
                            key={star}
                            className={`w-4 h-4 ${
                              star <= order.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    {order.review && (
                      <p className="text-white text-sm mt-2">"{order.review}"</p>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 flex-wrap">
                  {order.status === 'WORK_SUBMITTED' && (
                    <>
                      <button
                        onClick={() => handleApproveOrder(order._id)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve & Release
                      </button>
                      <button
                        onClick={() => {
                          setSelectedOrder(order._id);
                          setShowRevisionModal(true);
                        }}
                        className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-2 rounded-lg transition font-semibold"
                      >
                        Request Revision
                      </button>
                    </>
                  )}

                  {order.status === 'COMPLETED' && !order.rating && (
                    <button
                      onClick={() => {
                        setSelectedOrder(order._id);
                        setShowRatingModal(true);
                      }}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2"
                    >
                      <Star className="w-4 h-4" />
                      Rate & Review
                    </button>
                  )}

                  <button
                    onClick={() => handleMessageStudent(order)}
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
            <h2 className="text-2xl font-bold text-white mb-4">Rate This Order</h2>
            
            <div className="mb-6">
              <p className="text-brand-muted text-sm mb-3">How satisfied are you with the work?</p>
              <div className="flex gap-2 justify-center">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    key={star}
                    onClick={() => setRatingData({ ...ratingData, rating: star })}
                    className="transition transform hover:scale-110"
                  >
                    <Star 
                      className={`w-10 h-10 ${
                        star <= ratingData.rating
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
                value={ratingData.review}
                onChange={(e) => setRatingData({ ...ratingData, review: e.target.value })}
                placeholder="Tell other clients about your experience..."
                className="w-full bg-brand-dark text-white rounded-lg p-3 border border-white/10 focus:border-brand-orange focus:outline-none"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRatingModal(false);
                  setRatingData({ rating: 5, review: '' });
                  setSelectedOrder(null);
                }}
                className="flex-1 bg-brand-dark hover:bg-brand-dark/80 text-white py-2 rounded-lg transition font-semibold border border-white/10"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitRating}
                disabled={submittingRating}
                className="flex-1 bg-brand-orange hover:bg-orange-600 disabled:opacity-50 text-white py-2 rounded-lg transition font-semibold"
              >
                {submittingRating ? 'Submitting...' : 'Submit'}
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
            <p className="text-brand-muted text-sm mb-4">Tell the student what changes or improvements you'd like.</p>
            
            <textarea
              value={revisionReason}
              onChange={(e) => setRevisionReason(e.target.value)}
              placeholder="e.g., Can you adjust the font size? The colors should be more vibrant..."
              className="w-full bg-brand-dark text-white rounded-lg p-3 border border-white/10 focus:border-brand-orange focus:outline-none mb-6"
              rows="4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRevisionModal(false);
                  setRevisionReason('');
                  setSelectedOrder(null);
                }}
                className="flex-1 bg-brand-dark hover:bg-brand-dark/80 text-white py-2 rounded-lg transition font-semibold border border-white/10"
              >
                Cancel
              </button>
              <button
                onClick={() => handleRequestRevision(selectedOrder)}
                disabled={submittingRevision}
                className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white py-2 rounded-lg transition font-semibold"
              >
                {submittingRevision ? 'Submitting...' : 'Submit Request'}
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
