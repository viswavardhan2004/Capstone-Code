import React from 'react';
import { X, CheckCircle } from 'lucide-react';

export default function PaymentModal({ isOpen, onClose, onConfirm, amount, upiId = "karanvirpvtonly@oksbi" }) {
  if (!isOpen) return null;

  // Generate correct UPI payment string with actual amount
  const upiString = `upi://pay?pa=${upiId}&pn=UniGigs&am=${amount}&tr=UNIGIGS_JOB_${Date.now()}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiString)}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-brand-card border border-white/10 rounded-2xl max-w-sm w-full p-6 relative shadow-2xl">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-brand-muted hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Scan to Pay</h2>
          <p className="text-brand-muted text-sm mb-6">
            Send <span className="text-brand-orange font-bold">₹{amount}</span> to verify this job
          </p>
          
          {/* QR CODE DISPLAY */}
          <div className="bg-white p-4 rounded-xl mx-auto w-56 h-56 mb-6 flex items-center justify-center">
            <img 
              src={qrCodeUrl}
              alt="QR Code" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>

          <p className="text-sm text-brand-muted mb-4">
            <strong>UPI ID:</strong> {upiId}
          </p>

          <div className="flex flex-col gap-3">
            <button 
              onClick={onConfirm}
              className="w-full py-3 bg-brand-orange text-white font-bold rounded-xl hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-5 h-5" /> I Have Paid ✓
            </button>
            <button 
              onClick={onClose}
              className="w-full py-3 bg-white/5 text-brand-muted font-medium rounded-xl hover:bg-white/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
