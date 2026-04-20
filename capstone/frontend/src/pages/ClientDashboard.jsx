import React, { useEffect, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { API_URL } from '../config/apiConfig';

export default function ClientDashboard() {
  const [orders, setOrders] = useState([]);
  const fetchOrders = () => {
    fetch(`${API_URL}/escrow/status`).then(res => res.json()).then(setOrders);
  };
  useEffect(fetchOrders, []);

  const handleAction = async (id, approved) => {
    await fetch(`${API_URL}/escrow/release`, {
      method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({transactionId: id, approved})
    });
    fetchOrders();
  };

  return (
    <div className="min-h-screen bg-brand-dark p-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Client Control Panel (Escrow)</h1>
        <div className="space-y-4">
          {orders.map(o => (
            <div key={o.id} className="bg-brand-card p-6 rounded-xl border border-white/10 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-white">{o.title}</h3>
                <p className="text-sm text-brand-muted">Status: {o.status} | Escrow: ₹{o.amount}</p>
              </div>
              {o.status === 'UNDER_REVIEW' ? (
                <div className="flex gap-4">
                  <button onClick={()=>handleAction(o.id, false)} className="px-4 py-2 border border-red-500 text-red-500 rounded-lg">Revision</button>
                  <button onClick={()=>handleAction(o.id, true)} className="px-4 py-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 flex gap-2 items-center"><ShieldCheck className="w-4 h-4"/> Approve & Release</button>
                </div>
              ) : <span className="text-brand-muted italic">Waiting for submission...</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}