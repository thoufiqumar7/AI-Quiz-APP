import { useState, useEffect } from 'react';
import aiService from '../../services/aiService';
import Loader from '../common/Loader';
import { ServerIcon, CpuChipIcon, BoltIcon, CloudIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';

export default function AIMonitoringDashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await aiService.getStatus();
      setStatus(res.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load AI status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !status) return <Loader text="Loading AI Telemetry..." />;
  if (error) return <div className="text-red-500 bg-red-50 p-4 rounded-xl">{error}</div>;
  if (!status) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">AI Gateway Monitoring</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Real-time telemetry and health status of AI providers.</p>
        </div>
        <button onClick={fetchStatus} className="btn-secondary flex items-center gap-2">
          <BoltIcon className="h-5 w-5" /> Refresh
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30">
              <CloudIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Primary Provider</p>
              <p className="text-xl font-bold capitalize text-slate-800 dark:text-white">{status.activeProvider}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg dark:bg-amber-900/30">
              <CpuChipIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Active Models</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">{status.models.filter(m => m.healthy).length} / {status.models.length}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30">
              <ServerIcon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Local Intelligence</p>
              <p className="text-xl font-bold text-slate-800 dark:text-white">Standby</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
            <CloudArrowDownIcon className="h-5 w-5 text-emerald-500" />
            Provider Models
          </h2>
          <div className="space-y-3">
            {status.models.map(m => (
              <div key={m.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200 truncate pr-4">{m.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${m.healthy ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {m.healthy ? 'Healthy' : 'Cooldown'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Live Metrics</h2>
          {Object.keys(status.metrics).length === 0 ? (
            <p className="text-slate-500 text-sm italic">No requests in current window.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(status.metrics).map(([key, metric]) => (
                <div key={key} className="border-b border-slate-100 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                  <p className="font-semibold text-slate-700 dark:text-slate-200 mb-2 truncate">{key}</p>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Requests</span>
                      <span className="font-medium text-emerald-600">{metric.successfulRequests}</span> / {metric.requests}
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Total Tokens</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{metric.totalTokens.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Avg Latency</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">
                        {metric.requests > 0 ? Math.round(metric.totalLatency / metric.requests) : 0}ms
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 dark:text-slate-400 block">Fallbacks</span>
                      <span className="font-medium text-amber-600">{metric.fallbackCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
