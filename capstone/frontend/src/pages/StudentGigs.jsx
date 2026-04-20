import React, { useState, useEffect } from 'react';
import { Package, DollarSign, Clock, FileText, Image, Tag, Trash2 } from 'lucide-react';
import { API_URL } from '../config/apiConfig';
import CustomAlert from '../components/CustomAlert';

export default function StudentGigs() {
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [gigs, setGigs] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'coding',
    price: '',
    deliveryDays: '3'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateGig = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const sellerEmail = localStorage.getItem('userEmail');
      
      if (!sellerEmail) {
        setAlert({ message: '⚠️ Please log in to create a gig', type: 'warning' });
        return;
      }
      
      const response = await fetch(`${API_URL}/gigs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, sellerEmail })
      });

      if (response.ok) {
        await response.json();
        setFormData({ title: '', description: '', category: 'coding', price: '', deliveryDays: '3' });
        setAlert({ message: '🎉 Gig created successfully!', type: 'success' });
        fetchGigs();
      } else {
        const error = await response.json();
        setAlert({ message: '❌ Error creating gig: ' + (error.error || 'Unknown error'), type: 'error' });
      }
    } catch (error) {
      setAlert({ message: '❌ Error creating gig', type: 'error' });
    }
  };

  const fetchGigs = async () => {
    try {
      const sellerEmail = localStorage.getItem('userEmail');
      if (!sellerEmail) return;
      
      const response = await fetch(`${API_URL}/gigs/student/${encodeURIComponent(sellerEmail)}`);
      if (response.ok) {
        const myGigs = await response.json();
        setGigs(myGigs);
      }
    } catch (error) {
      console.error('Error fetching gigs:', error);
    }
  };

  const confirmDelete = (id) => {
    setDeleteConfirm(id);
  };

  const deleteGig = async (id) => {
    try {
      const userEmail = localStorage.getItem('userEmail');
      const response = await fetch(`${API_URL}/gigs/${id}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setGigs(gigs.filter(g => g._id !== id));
        setAlert({ message: '✅ Gig deleted successfully', type: 'success' });
      } else {
        const error = await response.json();
        setAlert({ message: '❌ Error: ' + (error.error || 'Failed to delete gig'), type: 'error' });
      }
    } catch (error) {
      console.error('Delete error:', error);
      setAlert({ message: '❌ Failed to delete gig', type: 'error' });
    } finally {
      setDeleteConfirm(null);
    }
  };

  useEffect(() => {
    fetchGigs();
  }, []);

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24 relative overflow-hidden">
      {/* Decorative Elements to match CreateListing look */}
      <div className="absolute top-20 right-10 animate-float opacity-20">
        <div className="w-40 h-40 bg-gradient-to-br from-purple-500/60 to-pink-500/60 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 left-10 animate-float-delayed opacity-20">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/60 to-cyan-500/60 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-4xl font-bold text-white mb-2">Create Your Gig</h2>
            <p className="text-brand-muted">Showcase your skills and start earning</p>
          </div>
          <button
            onClick={() => window.location.href = '/create'}
            className="bg-brand-orange text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
          >
            <Package className="w-4 h-4" /> Full Create Page
          </button>
        </div>

        {/* Hint card prompting to use the full create page */}
        <div className="bg-brand-card rounded-2xl p-6 border border-white/10 mb-10">
          <h3 className="text-white font-bold mb-2">Create a new gig</h3>
          <p className="text-brand-muted text-sm mb-4">Use the dedicated full-page creator for the best experience.</p>
          <button
            onClick={() => window.location.href = '/create'}
            className="bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange text-white font-bold px-5 py-3 rounded-lg transition-all duration-300"
          >
            Go to Full Create Page
          </button>
        </div>

        {/* My Gigs List */}
        <div className="mt-10">
          <h3 className="text-2xl font-bold text-white mb-4">Your Gigs</h3>
          {gigs.length === 0 ? (
            <div className="bg-brand-card rounded-2xl p-8 border border-white/10 text-center">
              <p className="text-brand-muted">No gigs yet. Create your first gig to start earning!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {gigs.map((gig) => (
                <div key={gig._id} className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{gig.title}</h4>
                      <p className="text-brand-muted mb-3">{gig.description.substring(0, 140)}{gig.description.length > 140 ? '...' : ''}</p>
                      <div className="flex flex-wrap gap-3 text-sm">
                        <span className="px-3 py-1 bg-brand-dark rounded-full text-brand-orange border border-brand-orange/30">{gig.category}</span>
                        <span className="px-3 py-1 bg-brand-dark rounded-full text-white border border-white/10">{gig.deliveryDays} days</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-brand-orange mb-3">₹{gig.price}</p>
                      <button
                        onClick={() => confirmDelete(gig._id)}
                        className="inline-flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition"
                      >
                        <Trash2 className="w-4 h-4" /> Delete
                      </button>
                    </div>
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

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-brand-card rounded-2xl p-8 border-2 border-red-500/50 max-w-md w-full shadow-2xl shadow-red-500/20 animate-scale-in">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-400" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-white">Delete Gig?</h3>
                <p className="text-brand-muted text-sm">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-white mb-6">
              Are you sure you want to permanently delete this gig? All associated data will be removed.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteGig(deleteConfirm)}
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
