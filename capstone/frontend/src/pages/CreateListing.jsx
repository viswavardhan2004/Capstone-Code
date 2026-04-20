import React, { useState } from 'react';
import { API_URL } from '../config/apiConfig';
import { Package, DollarSign, Clock, FileText, Image, Tag } from 'lucide-react';
import CustomAlert from '../components/CustomAlert';

export default function CreateListing() {
  const [alert, setAlert] = useState(null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const sellerEmail = localStorage.getItem('userEmail');
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
        setAlert({ message: '🎉 Gig created successfully! Check "My Gigs" to see all your listings.', type: 'success' });
        setFormData({ title: '', description: '', category: 'coding', price: '', deliveryDays: '3' });
      } else {
        let errorText = 'Unknown error';
        try { const error = await response.json(); errorText = error.error || JSON.stringify(error); } catch (_) { errorText = response.statusText || String(response.status); }
        setAlert({ message: '❌ Error creating gig: ' + errorText, type: 'error' });
      }
    } catch (err) {
      console.error('Create gig failed:', err);
      setAlert({ message: '❌ Error creating gig: ' + (err.message || err), type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8 pt-24 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-20 right-10 animate-float opacity-20">
        <div className="w-40 h-40 bg-gradient-to-br from-purple-500/60 to-pink-500/60 rounded-full blur-3xl"></div>
      </div>
      <div className="absolute bottom-20 left-10 animate-float-delayed opacity-20">
        <div className="w-32 h-32 bg-gradient-to-br from-blue-500/60 to-cyan-500/60 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-white mb-3">Create Your Gig</h2>
          <p className="text-brand-muted">Showcase your skills and start earning</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition-all hover:scale-105 group">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Package className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-white font-bold mb-1">Step 1</h3>
            <p className="text-sm text-brand-muted">Describe your service</p>
          </div>

          <div className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition-all hover:scale-105 group">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <DollarSign className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-white font-bold mb-1">Step 2</h3>
            <p className="text-sm text-brand-muted">Set your price</p>
          </div>

          <div className="bg-brand-card rounded-xl p-6 border border-white/10 hover:border-brand-orange/50 transition-all hover:scale-105 group">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition">
              <Clock className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-white font-bold mb-1">Step 3</h3>
            <p className="text-sm text-brand-muted">Set delivery time</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-brand-card rounded-2xl p-8 border border-white/10 backdrop-blur-sm space-y-6">
          {/* Title */}
          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-orange" />
              Gig Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="I will create a professional website..."
              className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none transition"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-brand-orange" />
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what you'll deliver..."
              rows="5"
              className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none transition resize-none"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-white font-semibold mb-2 flex items-center gap-2">
              <Tag className="w-4 h-4 text-brand-orange" />
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none transition"
            >
              <option value="coding">Coding & Programming</option>
              <option value="design">Design & Graphics</option>
              <option value="writing">Writing & Content</option>
              <option value="tutoring">Tutoring & Teaching</option>
              <option value="video">Video & Animation</option>
              <option value="marketing">Marketing</option>
            </select>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Price */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-brand-orange" />
                Price (₹)
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="50"
                min="1"
                className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none transition"
                required
              />
            </div>

            {/* Delivery Time */}
            <div>
              <label className="block text-white font-semibold mb-2 flex items-center gap-2">
                <Clock className="w-4 h-4 text-brand-orange" />
                Delivery Time (days)
              </label>
              <input
                type="number"
                name="deliveryDays"
                value={formData.deliveryDays}
                onChange={handleChange}
                min="1"
                max="30"
                className="w-full bg-brand-dark rounded-lg px-4 py-3 text-white border border-white/10 focus:border-brand-orange outline-none transition"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-brand-orange to-orange-600 hover:from-orange-600 hover:to-brand-orange text-white font-bold py-4 rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-brand-orange/50 flex items-center justify-center gap-2"
            >
              <Package className="w-5 h-5" />
              Create Gig
            </button>
          </div>
        </form>

        {/* Preview Card */}
        {formData.title && (
          <div className="mt-8 bg-brand-card rounded-xl p-6 border border-white/10 backdrop-blur-sm animate-slideIn">
            <h3 className="text-white font-bold mb-4 flex items-center gap-2">
              <Image className="w-5 h-5 text-brand-orange" />
              Preview
            </h3>
            <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
              <h4 className="text-lg font-bold text-white mb-2">{formData.title}</h4>
              <p className="text-sm text-brand-muted mb-3">{formData.description}</p>
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-brand-orange/20 text-brand-orange rounded-full text-xs font-semibold">{formData.category}</span>
                <span className="text-2xl font-bold text-brand-orange">₹{formData.price || '0'}</span>
              </div>
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