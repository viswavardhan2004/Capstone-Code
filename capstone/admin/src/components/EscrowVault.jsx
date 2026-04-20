import React, { useState } from 'react';
import { Lock, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react';

export default function EscrowVault() {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('');

  const steps = [
    {
      number: 1,
      title: 'Client Deposits',
      description: 'Client securely deposits payment into the vault',
      icon: '💰',
      status: 'complete'
    },
    {
      number: 2,
      title: 'Payment Locked',
      description: 'Funds are held safely by Micro-Job (escrow)',
      icon: '🔒',
      status: 'in-progress'
    },
    {
      number: 3,
      title: 'Student Works',
      description: 'Student delivers the completed work',
      icon: '✏️',
      status: 'pending'
    },
    {
      number: 4,
      title: 'Client Reviews',
      description: 'Client approves quality and submits feedback',
      icon: '👀',
      status: 'pending'
    },
    {
      number: 5,
      title: 'Payment Released',
      description: 'Funds instantly transfer to student wallet',
      icon: '✅',
      status: 'pending'
    }
  ];

  return (
    <div className="bg-brand-card rounded-2xl p-8 border border-white/10">
      <h2 className="text-3xl font-bold text-white mb-8 flex items-center gap-2">
        <Lock className="w-8 h-8 text-brand-orange" /> Micro-Job Escrow Vault
      </h2>

      {/* Process Flow */}
      <div className="mb-12">
        <div className="space-y-4">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-start gap-4">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-lg ${
                  step.status === 'complete'
                    ? 'bg-green-500/20 text-green-400'
                    : step.status === 'in-progress'
                    ? 'bg-brand-orange/20 text-brand-orange'
                    : 'bg-white/5 text-brand-muted'
                }`}
              >
                {step.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold">{step.number}. {step.title}</h3>
                <p className="text-brand-muted text-sm">{step.description}</p>
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className={`w-5 h-5 mt-1 ${step.status === 'complete' ? 'text-green-500' : 'text-brand-muted'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" /> Trust & Security
          </h4>
          <p className="text-brand-muted text-sm">
            Micro-Job acts as a neutral third party, protecting both students and clients from scams
          </p>
        </div>

        <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <Lock className="w-5 h-5 text-brand-orange" /> Secure Payments
          </h4>
          <p className="text-brand-muted text-sm">
            Funds are locked and only released when both parties are satisfied
          </p>
        </div>

        <div className="bg-brand-dark rounded-lg p-4 border border-white/10">
          <h4 className="text-white font-bold mb-2 flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-500" /> Dispute Support
          </h4>
          <p className="text-brand-muted text-sm">
            If disputes arise, admins can investigate and force-release or refund money fairly
          </p>
        </div>
      </div>

      {/* Protection Info */}
      <div className="mt-8 p-4 bg-brand-orange/10 border border-brand-orange/50 rounded-lg">
        <p className="text-brand-orange text-sm">
          <strong>How Micro-Job protects you:</strong> All transactions happen through our secure vault system. Neither party can access funds until the transaction completes successfully.
        </p>
      </div>
    </div>
  );
}
