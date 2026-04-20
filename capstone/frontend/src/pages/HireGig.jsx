import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Package, Clock, DollarSign, Shield, ArrowLeft, CheckCircle } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

export default function HireGig() {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orderDetails, setOrderDetails] = useState({
    requirements: '',
    urgency: 'normal'
  });

  useEffect(() => {
    fetchGigDetails();
  }, [gigId]);

  const fetchGigDetails = async () => {
    try {
      const response = await fetch(`${API_URL}/gigs/${gigId}`);
      if (response.ok) {
        const data = await response.json();
        setGig(data);
      } else {
        alert('Gig not found');
        navigate('/client/search');
      }
    } catch (error) {
      console.error('Error fetching gig:', error);
      alert('Error loading gig details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!orderDetails.requirements.trim()) {
      alert('Please provide your requirements');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userEmail = localStorage.getItem('userEmail');
      
      const response = await fetch(`${API_URL}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          gigId: gig.id,
          gigTitle: gig.title,
          price: gig.price,
          deliveryDays: gig.deliveryDays,
          requirements: orderDetails.requirements,
          urgency: orderDetails.urgency,
          clientEmail: userEmail,
          sellerEmail: gig.seller?.email || 'seller@example.com'
        })
      });

      if (response.ok) {
        alert('Order placed successfully! Check "My Orders" to track progress.');
        navigate('/client/orders');
      } else {
        const error = await response.json();
        alert('Error placing order: ' + (error.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Error placing order');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 pt-24 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="min-h-screen bg-brand-dark p-8 pt-24">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-white text-xl">Gig not found</p>
          <button
            onClick={() => navigate('/client/search')}
            className="mt-4 px-6 py-3 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 animate-float opacity-20">
        <div className="w-40 h-40 bg-gradient-to-br from-brand-orange/60 to-purple-500/60 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 left-10 animate-float-delayed opacity-20">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/60 to-cyan-500/60 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/client/search')}
          className="flex items-center gap-2 text-brand-muted hover:text-white transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Search
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Gig Details */}
          <div className="md:col-span-2 space-y-6">
            <div className="bg-brand-card rounded-2xl p-8 border border-white/10">
              <h1 className="text-3xl font-bold text-white mb-4">{gig.title}</h1>
              <p className="text-brand-muted mb-6">{gig.description}</p>

              <div className="flex gap-4 mb-6">
                <span className="bg-brand-orange/20 text-brand-orange px-4 py-2 rounded-full text-sm font-semibold">
                  {gig.category}
                </span>
                <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-sm text-white">{gig.deliveryDays} days delivery</span>
                </div>
              </div>

              {/* Seller Info */}
              <div className="border-t border-white/10 pt-6">
                <h3 className="text-white font-semibold mb-3">About the Seller</h3>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-brand-orange to-orange-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">{gig.seller?.name?.charAt(0) || 'S'}</span>
                  </div>
                  <div>
                    <p className="text-white font-semibold">{gig.seller?.name || 'Student Seller'}</p>
                    {gig.seller?.verified && <p className="text-xs text-green-400">✓ Verified Seller</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Order Form */}
            <div className="bg-brand-card rounded-2xl p-8 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-6">Order Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-white font-semibold mb-2">Your Requirements</label>
                  <textarea
                    value={orderDetails.requirements}
                    onChange={(e) => setOrderDetails({ ...orderDetails, requirements: e.target.value })}
                    placeholder="Describe what you need, provide any files or links, and specific instructions..."
                    rows="6"
                    className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none resize-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white font-semibold mb-2">Urgency</label>
                  <select
                    value={orderDetails.urgency}
                    onChange={(e) => setOrderDetails({ ...orderDetails, urgency: e.target.value })}
                    className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent (may cost extra)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-brand-card rounded-2xl p-6 border border-white/10 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-brand-orange" />
                  <div>
                    <p className="text-sm text-brand-muted">Service</p>
                    <p className="text-white font-semibold">{gig.title.substring(0, 30)}...</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-brand-muted">Delivery Time</p>
                    <p className="text-white font-semibold">{gig.deliveryDays} days</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-brand-muted">Protection</p>
                    <p className="text-white font-semibold">Escrow Protected</p>
                  </div>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-brand-muted">Service Price</span>
                  <span className="text-white font-semibold">₹{gig.price}</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total</span>
                  <span className="text-brand-orange">₹{gig.price}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                className="w-full bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange text-white font-bold py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-orange/50 flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Place Order (₹{gig.price})
              </button>

              <p className="text-xs text-brand-muted text-center mt-4">
                Payment will be held in escrow until work is completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
