import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, CheckCircle, XCircle, Clock, ChevronDown, ChevronUp, RefreshCw, Unlock } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const RULE_DESCRIPTIONS = {
  r1:  { name: 'Self-Dealing IP',         desc: 'Client & freelancer share the same IP address (same machine/network).',      severity: 'CRITICAL', color: 'red' },
  r2:  { name: 'Rating Velocity',          desc: 'Freelancer received 5+ five-star ratings within 24 hours.',                  severity: 'HIGH',     color: 'orange' },
  r3:  { name: 'Serial Refund',            desc: 'Client has 3+ lifetime refund requests across all transactions.',            severity: 'HIGH',     color: 'orange' },
  r4:  { name: 'New Account Rush',         desc: 'Account <7 days old but already has 5+ jobs.',                              severity: 'HIGH',     color: 'orange' },
  r5:  { name: 'Bilateral Collusion',      desc: 'Client and freelancer gave each other 3+ mutual 5-star ratings.',           severity: 'MODERATE', color: 'yellow' },
  r6:  { name: 'Zero Chat Completion',     desc: 'Job completed with zero messages exchanged between parties.',                severity: 'HIGH',     color: 'orange' },
  r7:  { name: 'Lightning Fast Completion',desc: 'Technical job completed in under 30 minutes of hire.',                      severity: 'HIGH',     color: 'orange' },
  r8:  { name: 'Suspicious Price',         desc: 'Job price is below 10% of the category average price.',                     severity: 'MEDIUM',   color: 'yellow' },
  r9:  { name: 'Same-Week Accounts',       desc: 'Client and freelancer registered within 7 days of each other.',             severity: 'MEDIUM',   color: 'yellow' },
  r10: { name: 'Instant Escrow Release',   desc: 'Escrow released within 10 minutes of submission, no revisions.',           severity: 'MEDIUM',   color: 'yellow' },
  r11: { name: 'Device Fingerprint Match', desc: 'Client & freelancer share the same browser/device fingerprint (same device).', severity: 'CRITICAL', color: 'red' },
  r12: { name: 'Zero Skill Match',         desc: 'Freelancer accepted a job with zero overlap with their skill set.',         severity: 'MEDIUM',   color: 'yellow' },
  r13: { name: 'Burst Job Posting',        desc: 'Client posted 5+ jobs within a single 60-minute window.',                  severity: 'MEDIUM',   color: 'yellow' },
};

const severityColors = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/40',
  HIGH:     'bg-orange-500/20 text-orange-400 border-orange-500/40',
  MODERATE: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
  MEDIUM:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
};

const verdictStyle = {
  BLOCK:  { border: 'border-l-red-500',   bg: 'bg-red-500/5',    badge: 'bg-red-500/20 text-red-400 border border-red-500/40' },
  REVIEW: { border: 'border-l-amber-500', bg: 'bg-amber-500/5',  badge: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
  ALLOW:  { border: 'border-l-green-500', bg: 'bg-green-500/5',  badge: 'bg-green-500/20 text-green-400 border border-green-500/40' },
};

function RuleBadge({ ruleKey }) {
  const info = RULE_DESCRIPTIONS[ruleKey] || { name: ruleKey.toUpperCase(), severity: 'MEDIUM', color: 'yellow' };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold ${severityColors[info.severity]}`}>
      {info.name}
    </span>
  );
}

function AlertCard({ alert, onAction }) {
  const [expanded, setExpanded] = useState(false);
  const vs = verdictStyle[alert.verdict] || verdictStyle.REVIEW;

  return (
    <div className={`border-l-4 ${vs.border} ${vs.bg} bg-gray-900 rounded-xl border border-gray-800 overflow-hidden`}>
      {/* Header */}
      <div className="p-5">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className={`text-xs font-black px-3 py-1 rounded-full ${vs.badge}`}>
                {alert.verdict}
              </span>
              <span className="text-gray-400 text-sm">Score: <span className="text-white font-bold">{alert.fraudScore}</span></span>
              <span className="text-gray-600 text-xs">{new Date(alert.createdAt).toLocaleString()}</span>
            </div>

            {/* Users */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
              <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Client (Buyer)</p>
                <p className="text-white font-semibold text-sm">{alert.clientId?.name || 'Unknown'}</p>
                <p className="text-gray-400 text-xs">{alert.clientId?.email || alert.clientId}</p>
              </div>
              <div className="bg-gray-800/60 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-500 mb-0.5">Freelancer (Seller)</p>
                <p className="text-white font-semibold text-sm">{alert.freelancerId?.name || 'Unknown'}</p>
                <p className="text-gray-400 text-xs">{alert.freelancerId?.email || alert.freelancerId}</p>
              </div>
            </div>

            {/* Rules triggered */}
            <div className="flex flex-wrap gap-2 mb-1">
              {alert.triggeredRules?.map((r, i) => (
                <RuleBadge key={i} ruleKey={r.rule} />
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {alert.verdict === 'BLOCK' && (
              <button
                onClick={() => onAction(alert._id, 'cleared')}
                className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
              >
                <Unlock className="w-4 h-4" /> Unblock User
              </button>
            )}
            <button
              onClick={() => onAction(alert._id, 'cleared')}
              className="flex items-center gap-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              <CheckCircle className="w-4 h-4" /> Clear Alert
            </button>
            <button
              onClick={() => onAction(alert._id, 'confirmed_fraud')}
              className="flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            >
              <XCircle className="w-4 h-4" /> Confirm Fraud
            </button>
          </div>
        </div>

        {/* Expand toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Hide' : 'Show'} rule details & evidence
        </button>
      </div>

      {/* Expanded: rule breakdown */}
      {expanded && (
        <div className="border-t border-gray-800 p-5 space-y-3">
          <h4 className="text-sm font-bold text-gray-300 mb-3">Triggered Rules — Detailed Evidence</h4>
          {alert.triggeredRules?.map((r, i) => {
            const info = RULE_DESCRIPTIONS[r.rule] || { name: r.rule, desc: 'Rule triggered.', severity: r.severity };
            return (
              <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${severityColors[r.severity] || severityColors.MEDIUM}`}>
                    {r.severity}
                  </span>
                  <span className="text-white font-semibold text-sm">{info.name}</span>
                  <span className="text-gray-500 text-xs ml-auto font-mono">{r.rule.toUpperCase()}</span>
                </div>
                <p className="text-gray-400 text-xs mb-2">{info.desc}</p>
                {r.evidence && Object.keys(r.evidence).length > 0 && (
                  <div className="bg-gray-900/60 rounded-lg p-3 font-mono text-xs space-y-1">
                    {Object.entries(r.evidence).map(([k, v]) => (
                      <div key={k} className="flex gap-2">
                        <span className="text-blue-400">{k}:</span>
                        <span className="text-green-400">{JSON.stringify(v)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* LLM Explanation */}
          {alert.llmExplanation && (
            <div className="mt-3 bg-blue-500/5 border border-blue-500/20 rounded-xl p-4">
              <p className="text-xs font-bold text-blue-400 mb-1">🤖 AI Analysis</p>
              <p className="text-gray-300 text-sm leading-relaxed">{alert.llmExplanation}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function FraudAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [refreshing, setRefreshing] = useState(false);

  const fetchAlerts = async () => {
    try {
      setRefreshing(true);
      const res = await fetch(`${API_URL}/admin/fraud-alerts`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) setAlerts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAlerts(); }, []);

  const handleAction = async (id, status) => {
    try {
      await fetch(`${API_URL}/admin/fraud-alerts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ reviewStatus: status })
      });
      setAlerts(prev => prev.filter(a => a._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = filter === 'ALL' ? alerts : alerts.filter(a => a.verdict === filter);
  const counts = {
    ALL: alerts.length,
    BLOCK: alerts.filter(a => a.verdict === 'BLOCK').length,
    REVIEW: alerts.filter(a => a.verdict === 'REVIEW').length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-400" />
            Fraud Detection
          </h1>
          <p className="text-gray-400 mt-1">Review flagged users · unblock legitimate accounts · confirm fraud</p>
        </div>
        <button
          onClick={fetchAlerts}
          disabled={refreshing}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Pending', count: counts.ALL, color: 'text-white', bg: 'bg-gray-800' },
          { label: 'BLOCKED', count: counts.BLOCK, color: 'text-red-400', bg: 'bg-red-500/10 border border-red-500/20' },
          { label: 'REVIEW', count: counts.REVIEW, color: 'text-amber-400', bg: 'bg-amber-500/10 border border-amber-500/20' },
        ].map(({ label, count, color, bg }) => (
          <div key={label} className={`${bg} rounded-xl p-4`}>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{label}</p>
            <p className={`text-4xl font-black mt-1 ${color}`}>{count}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {['ALL', 'BLOCK', 'REVIEW'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-sm font-bold transition-all border ${
              filter === f
                ? f === 'BLOCK' ? 'bg-red-500/20 text-red-400 border-red-500/40'
                  : f === 'REVIEW' ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                  : 'bg-white/10 text-white border-white/20'
                : 'bg-gray-800 text-gray-400 border-gray-700 hover:border-gray-600'
            }`}
          >
            {f} ({counts[f] ?? alerts.length})
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400">Loading fraud alerts...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 border border-gray-800 rounded-2xl bg-gray-900/50">
          <Shield className="w-16 h-16 text-green-400 mx-auto mb-4 opacity-60" />
          <p className="text-white text-xl font-bold mb-1">All Clear!</p>
          <p className="text-gray-500">No pending {filter !== 'ALL' ? filter : ''} fraud alerts.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map(alert => (
            <AlertCard key={alert._id} alert={alert} onAction={handleAction} />
          ))}
        </div>
      )}
    </div>
  );
}
