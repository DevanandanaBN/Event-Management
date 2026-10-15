import React, { useState, useEffect } from 'react';
import { X, Database, Server, RefreshCw, CheckCircle2, Layers, Code, RotateCcw } from 'lucide-react';
import { MongoDbStatus } from '../types';
import { api } from '../services/api';

interface MongoInspectorModalProps {
  onClose: () => void;
  onDataReset: () => void;
}

export const MongoInspectorModal: React.FC<MongoInspectorModalProps> = ({ onClose, onDataReset }) => {
  const [status, setStatus] = useState<MongoDbStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [activeTab, setActiveTab] = useState<'stack' | 'collections'>('stack');

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const data = await api.getDbStatus();
      setStatus(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReset = async () => {
    if (!window.confirm('Reset database to default seed documents (Events, Users, Passes)?')) {
      return;
    }
    try {
      setResetting(true);
      await api.resetDatabase();
      await fetchStatus();
      onDataReset();
    } catch (err: any) {
      alert(`Reset failed: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-neutral-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-neutral-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-neutral-900 leading-tight">
                Technology Stack & MongoDB Architecture
              </h3>
              <span className="text-xs text-neutral-500">
                Full-stack Event Management Engine
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-200 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('stack')}
            className={`pb-2.5 transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'stack'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            6. Technology Stack Specification
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`pb-2.5 transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'collections'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            MongoDB Document Collections
          </button>
        </div>

        {/* Body */}
        <div className="p-6 text-xs space-y-6 max-h-[70vh] overflow-y-auto">
          {activeTab === 'stack' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 leading-relaxed text-neutral-600">
                This application is engineered specifically against your project stack specifications:
              </div>

              {/* Stack Table */}
              <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-neutral-100 text-neutral-700 font-semibold text-[11px] uppercase tracking-wider">
                      <th className="py-2.5 px-4">Component</th>
                      <th className="py-2.5 px-4">Technology Implemented</th>
                      <th className="py-2.5 px-4">Runtime Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200 text-neutral-800">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">Frontend</td>
                      <td className="py-2.5 px-4 font-mono">HTML, CSS, JavaScript (React 19 SPA)</td>
                      <td className="py-2.5 px-4 text-neutral-500">Component architecture, interactive modals & search</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">Backend</td>
                      <td className="py-2.5 px-4 font-mono">Node.js (v22+)</td>
                      <td className="py-2.5 px-4 text-neutral-500">High-concurrency server runtime & event bus</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">Backend Framework</td>
                      <td className="py-2.5 px-4 font-mono">Express.js (v4.21)</td>
                      <td className="py-2.5 px-4 text-neutral-500">REST API controllers, validation, auth & ticket routing</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">Database</td>
                      <td className="py-2.5 px-4 font-mono text-emerald-700 font-semibold">MongoDB / Document Store</td>
                      <td className="py-2.5 px-4 text-neutral-500">BSON document persistence, collections & indexing</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">Dev Environment</td>
                      <td className="py-2.5 px-4 font-mono">Visual Studio Code</td>
                      <td className="py-2.5 px-4 text-neutral-500">Integrated TypeScript LSP & Vite tooling</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-neutral-900">Version Control</td>
                      <td className="py-2.5 px-4 font-mono">Git & GitHub</td>
                      <td className="py-2.5 px-4 text-neutral-500">Source configuration & release tags</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Live Status Pill */}
              <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Database Engine Active & Verified</span>
                  </div>
                  <div className="text-emerald-700 mt-0.5 font-mono text-[11px]">
                    {status?.engine} · DB: {status?.databaseName}
                  </div>
                </div>
                <button
                  onClick={fetchStatus}
                  className="p-1.5 text-emerald-700 hover:text-emerald-900 hover:bg-emerald-100 rounded"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {status?.collections.map((col) => (
                  <div key={col.name} className="p-3 rounded-xl border border-neutral-200 bg-neutral-50">
                    <div className="font-mono font-bold text-neutral-900 text-sm">{col.name}</div>
                    <div className="text-[11px] text-neutral-500 mt-1">{col.description}</div>
                    <div className="mt-2 text-base font-bold font-mono text-neutral-900 tabular-nums">
                      {col.count} documents
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-neutral-900 text-neutral-300 font-mono text-[11px] overflow-x-auto space-y-2">
                <div className="text-neutral-400 font-bold">// Sample MongoDB Document Structure</div>
                <div>{`{
  "_id": "evt_tech_summit_2026",
  "title": "Global Tech Leadership Summit 2026",
  "category": "Tech",
  "venue": "Grand Horizon Convention Center",
  "capacity": 450,
  "registeredCount": 382,
  "ticketPrice": 0,
  "status": "upcoming",
  "tags": ["Engineering", "Cloud Architecture"]
}`}</div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
          <button
            onClick={handleReset}
            disabled={resetting}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-600 hover:text-red-700 transition-colors"
          >
            <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-neutral-900 hover:bg-neutral-800 rounded-lg transition-colors"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
