import React, { useState, useEffect } from 'react';
import { AlertCircle, DollarSign, ArrowLeft, CheckCircle, Clock, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CustomAlert from '../components/CustomAlert';

export default function AdminDisputes() {
  const navigate = useNavigate();
  const [alert, setAlert] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [filter, setFilter] = useState('all');
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    fetchDisputes();
  }, []);

  const fetchDisputes = async () => {
    try {
      // Fetch all transactions from admin endpoint
      const response = await fetch(`${API_URL}/admin/transactions`);
      if (response.ok) {
        const data = await response.json();
        // Format transactions as disputes - filter for problematic ones
        const formattedDisputes = data.map(transaction => ({
          _id: transaction._id,
          orderId: transaction._id,
          studentName: transaction.studentName || 'Unknown Student',
          clientName: transaction.clientName || 'Unknown Client',
          title: transaction.title || 'Transaction',
          amount: transaction.amount || 0,
          status: transaction.status === 'REJECTED' ? 'open' : (transaction.status === 'IN_ESCROW' ? 'pending' : 'processing'),
          reason: transaction.rejectionReason || `Status: ${transaction.status}`,
          createdAt: new Date(transaction.createdAt),
          messages: 0,
          evidence: 'Transaction details available'
        }));
        setDisputes(formattedDisputes);
      }
    } catch (error) {
      console.error('Failed to fetch disputes:', error);
      setAlert({ message: '⚠️ Failed to load disputes', type: 'warning' });
    }
  };

  const filteredDisputes = filter === 'all' ? disputes : disputes.filter(d => d.status === filter);

  const handleResolveDispute = () => {
    if (!selectedDispute || !resolution) return;
    
    setDisputes(disputes.map(d => 
      d._id === selectedDispute._id 
        ? { ...d, status: 'resolved', reason: resolution }
        : d
    ));
    setAlert({ message: '✓ Dispute resolved successfully', type: 'success' });
    setSelectedDispute(null);
    setResolution('');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-brand-dark">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <AlertCircle className="w-8 h-8 text-red-500" />
              Disputes & Refunds
            </h1>
            <p className="text-brand-muted">Handle conflicts and manage refund requests</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Total Disputes</p>
            <p className="text-3xl font-bold text-white">{disputes.length}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Open Cases</p>
            <p className="text-3xl font-bold text-red-400">{disputes.filter(d => d.status === 'open').length}</p>
          </div>
          <div className="bg-brand-card border border-white/10 rounded-xl p-4">
            <p className="text-brand-muted text-sm mb-2">Resolved</p>
            <p className="text-3xl font-bold text-green-400">{disputes.filter(d => d.status === 'resolved').length}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition font-semibold ${
                filter === 'all' 
                  ? 'bg-brand-orange text-white' 
                  : 'bg-white/10 text-brand-muted hover:bg-white/20'
              }`}
            >
              All Cases
            </button>
            <button
              onClick={() => setFilter('open')}
              className={`px-4 py-2 rounded-lg transition font-semibold ${
                filter === 'open' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-white/10 text-brand-muted hover:bg-white/20'
              }`}
            >
              Open
            </button>
            <button
              onClick={() => setFilter('resolved')}
              className={`px-4 py-2 rounded-lg transition font-semibold ${
                filter === 'resolved' 
                  ? 'bg-green-500 text-white' 
                  : 'bg-white/10 text-brand-muted hover:bg-white/20'
              }`}
            >
              Resolved
            </button>
          </div>
        </div>

        {/* Disputes List */}
        <div className="space-y-4">
          {filteredDisputes.length === 0 ? (
            <div className="bg-brand-card border border-white/10 rounded-xl p-12 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-brand-muted">No disputes to resolve!</p>
            </div>
          ) : (
            filteredDisputes.map(dispute => (
              <div
                key={dispute._id}
                onClick={() => setSelectedDispute(selectedDispute?._id === dispute._id ? null : dispute)}
                className="bg-brand-card border border-white/10 rounded-xl p-6 hover:border-brand-orange/50 transition cursor-pointer"
              >
                <div className="grid md:grid-cols-5 gap-4 items-start mb-4">
                  <div>
                    <p className="text-sm text-brand-muted mb-1">Case ID</p>
                    <p className="text-white font-semibold text-sm">{dispute._id}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted mb-1">Issue</p>
                    <p className="text-white font-semibold">{dispute.title}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted mb-1">Amount</p>
                    <p className="text-xl font-bold text-brand-orange">₹{dispute.amount}</p>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted mb-1">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1 ${
                      dispute.status === 'open' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${dispute.status === 'open' ? 'bg-red-400' : 'bg-green-400'}`}></div>
                      {dispute.status === 'open' ? 'Open' : 'Resolved'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-brand-muted mb-1">Filed</p>
                    <p className="text-white text-sm">{new Date(dispute.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                {/* Expanded View */}
                {selectedDispute?._id === dispute._id && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="grid md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <p className="text-sm text-brand-muted mb-3">Parties Involved</p>
                        <div className="space-y-2 text-white">
                          <p><span className="text-brand-muted">Student:</span> {dispute.studentName}</p>
                          <p><span className="text-brand-muted">Client:</span> {dispute.clientName}</p>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-brand-muted mb-3">Case Details</p>
                        <div className="space-y-2 text-white">
                          <p><span className="text-brand-muted">Evidence:</span> {dispute.evidence}</p>
                          <p className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-brand-orange" />
                            {dispute.messages} messages exchanged
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-lg p-4 mb-6 border border-white/5">
                      <p className="text-sm text-brand-muted mb-2">Complaint Description</p>
                      <p className="text-white">{dispute.reason}</p>
                    </div>

                    {dispute.status === 'open' && (
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-brand-muted block mb-2">Resolution Action</label>
                          <textarea
                            value={resolution}
                            onChange={(e) => setResolution(e.target.value)}
                            placeholder="Decide resolution: Refund amount, compensation, or dismissal..."
                            className="w-full bg-brand-dark text-white rounded-lg border border-white/5 px-4 py-3 placeholder-brand-muted outline-none"
                            rows="4"
                          />
                        </div>
                        <div className="grid md:grid-cols-2 gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResolveDispute();
                            }}
                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/30 px-4 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                          >
                            <CheckCircle className="w-5 h-5" />
                            Resolve Case
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setAlert({ message: '⚖️ Case escalated to mediation panel', type: 'info' });
                            }}
                            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 border border-yellow-500/30 px-4 py-3 rounded-lg font-semibold transition"
                          >
                            Escalate to Mediation
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
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
