import React, { useEffect, useState } from 'react';
import { RefreshCw, Save, Key, ShieldCheck } from 'lucide-react';
import AdminButton from '../components/common/AdminButton';
import { supabase } from '../../supabaseClient';

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    cod_fee: 50,
    cod_enabled: true,
    razorpay_key_id: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('http://localhost:5000/api/admin/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setSettings(data);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCOD = () => {
    setSettings((prev) => ({ ...prev, cod_enabled: !prev.cod_enabled }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const res = await fetch('http://localhost:5000/api/admin/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          cod_fee: parseFloat(settings.cod_fee),
          cod_enabled: settings.cod_enabled,
        })
      });

      if (res.ok) {
        alert('Payment settings updated successfully!');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      alert('Failed to save settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 text-left max-w-3xl">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Payment Configuration</h1>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Configure transaction gateways and handling charges</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center space-x-2 px-4 py-2 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white rounded-xl transition-all cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Reload Config</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-slate-900 border border-slate-800 rounded-3xl">
          <svg className="animate-spin h-6 w-6 text-primary-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span className="font-semibold text-slate-500 uppercase tracking-widest text-[9px]">Decrypting portal settings...</span>
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6">
          {/* COD Settings Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
            <div className="flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-3">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-400" />
              <span>Cash On Delivery Options</span>
            </div>

            <div className="flex items-center justify-between py-2 text-xs">
              <div>
                <span className="font-bold text-white block">Enable Cash On Delivery checkout</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Toggle guest capability to checkout without pre-payment</span>
              </div>
              <button
                type="button"
                onClick={handleToggleCOD}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  settings.cod_enabled ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.cod_enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div className="max-w-xs">
              <label className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">COD Handling Fee (₹)</label>
              <input
                type="number"
                name="cod_fee"
                value={settings.cod_fee}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-slate-800 bg-slate-950/60 p-3 text-xs text-white focus:border-primary-500 focus:outline-none transition-colors"
                placeholder="50"
              />
            </div>
          </div>

          {/* Razorpay Masked Info Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
            <div className="flex items-center space-x-2.5 text-xs font-bold uppercase tracking-wider text-slate-350 border-b border-slate-800 pb-3">
              <Key className="h-4.5 w-4.5 text-indigo-400" />
              <span>Razorpay API Keys</span>
            </div>
            
            <div className="space-y-1">
              <span className="block text-[9px] font-extrabold uppercase tracking-widest text-slate-400 mb-2">Merchant Key ID</span>
              <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-xl text-xs font-mono text-slate-500">
                {settings.razorpay_key_id ? `${settings.razorpay_key_id.slice(0, 8)}••••••••••••••••` : 'rzp_test_••••••••••••••'}
              </div>
              <span className="block text-[8px] font-bold text-slate-600 uppercase tracking-widest pt-1.5">
                Managed securely in server environment variables
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <AdminButton type="submit" isLoading={isSaving} className="px-6 py-3">
              <Save className="h-4 w-4 mr-2" /> Save Settings Configuration
            </AdminButton>
          </div>
        </form>
      )}
    </div>
  );
}
