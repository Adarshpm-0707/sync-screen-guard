import React, { useEffect, useState } from 'react';
import { 
  RefreshCw, 
  Save, 
  Key, 
  ShieldCheck, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  KeyRound,
  Settings as SettingsIcon
} from 'lucide-react';
import AdminButton from '../components/common/AdminButton';
import useAdminAuth from '../hooks/useAdminAuth';
import { supabase } from '../../supabaseClient';
import { fetchStoreSettings, saveStoreSettings } from '../../utils/settingsStore';

export default function Settings() {
  const { adminUser, updateProfile, updatePassword } = useAdminAuth();
  
  const [loading, setLoading] = useState(true);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  // Profile State
  const [displayName, setDisplayName] = useState('');
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  // Payment Settings State
  const [paymentMessage, setPaymentMessage] = useState({ type: '', text: '' });
  const [settings, setSettings] = useState({
    cod_fee: 50,
    cod_enabled: true,
    razorpay_key_id: '',
  });

  useEffect(() => {
    fetchSettings();
    if (adminUser) {
      setDisplayName(adminUser?.user_metadata?.name || adminUser?.user_metadata?.display_name || 'Admin User');
    }
  }, [adminUser]);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const data = await fetchStoreSettings();
      if (data) {
        setSettings(data);
      }
    } catch (err) {
      console.warn('Error fetching settings:', err);
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

  // 1. Profile Update Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMessage({ type: '', text: '' });

    if (!displayName.trim()) {
      setProfileMessage({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }

    setIsSavingProfile(true);
    try {
      await updateProfile({ name: displayName.trim(), display_name: displayName.trim() });
      setProfileMessage({ type: 'success', text: 'Admin profile updated successfully!' });
      setTimeout(() => setProfileMessage({ type: '', text: '' }), 4000);
    } catch (err) {
      setProfileMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 2. Password Update Handler
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
      setPasswordMessage({ type: 'error', text: 'Please fill in all password fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    setIsSavingPassword(true);
    try {
      const res = await updatePassword({
        currentPassword: currentPassword.trim(),
        newPassword: newPassword.trim(),
      });

      if (res.success) {
        setPasswordMessage({ type: 'success', text: 'Password changed successfully!' });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordMessage({ type: '', text: '' }), 4000);
      } else {
        setPasswordMessage({ type: 'error', text: res.error || 'Failed to update password.' });
      }
    } catch (err) {
      setPasswordMessage({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setIsSavingPassword(false);
    }
  };

  // 3. Payment Config Update Handler
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setPaymentMessage({ type: '', text: '' });
    try {
      const updated = await saveStoreSettings({
        cod_fee: parseFloat(settings.cod_fee) >= 0 ? parseFloat(settings.cod_fee) : 0,
        cod_enabled: settings.cod_enabled,
        razorpay_key_id: settings.razorpay_key_id || '',
      });
      setSettings(updated);
      setPaymentMessage({
        type: 'success',
        text: `Payment configurations saved! COD fee is now ₹${updated.cod_fee}. Customer checkout and payout page are updated live.`
      });
      setTimeout(() => setPaymentMessage({ type: '', text: '' }), 5000);
    } catch (err) {
      console.error('Error updating settings:', err);
      setPaymentMessage({
        type: 'error',
        text: 'Failed to update payment settings.'
      });
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 text-left max-w-4xl mx-auto">
      {/* Control Box Header */}
      <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-500 shadow-md">
              <SettingsIcon className="h-5 w-5 text-white" />
            </div>
            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase">
              Security & Store Settings
            </h1>
          </div>
          <p className="text-[11px] text-slate-400 font-semibold tracking-wider uppercase mt-1 sm:ml-11">
            Manage your admin profile, secret password, and customer checkout gateway fees
          </p>
        </div>

        <button
          onClick={fetchSettings}
          disabled={loading}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white rounded-xl transition-all self-start md:self-center cursor-pointer shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
          <span>Reload Config</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3 bg-[#0E1322]/80 border border-slate-800 rounded-3xl">
          <div className="animate-spin h-8 w-8 rounded-full border-2 border-indigo-500 border-t-transparent"></div>
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Loading admin security configurations...</span>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          
          {/* 👤 1. ADMIN PROFILE SECTION */}
          <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center shadow-lg text-white">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight">Admin Profile Identity</h2>
                  <p className="text-[10px] text-slate-400 font-semibold">Update your administrator display name and public signature</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[9px] font-black uppercase tracking-wider">
                Superadmin
              </span>
            </div>

            {profileMessage.text && (
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                profileMessage.type === 'error' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {profileMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{profileMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Admin Display Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-bold"
                    placeholder="e.g. Sync Administrator"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Admin Email (Account ID)
                  </label>
                  <input
                    type="email"
                    disabled
                    value={adminUser?.email || 'admin@syncarmor.in'}
                    className="w-full rounded-xl border border-slate-800/60 bg-slate-900/40 p-3 text-xs text-slate-500 focus:outline-none cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <AdminButton type="submit" isLoading={isSavingProfile} className="px-5 py-2.5">
                  <Save className="h-3.5 w-3.5 mr-2" /> Save Profile Details
                </AdminButton>
              </div>
            </form>
          </div>

          {/* 🔐 2. CHANGE ADMIN PASSWORD */}
          <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
            <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-orange-600 flex items-center justify-center shadow-lg text-white">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-black text-white uppercase tracking-tight">Security Credentials</h2>
                <p className="text-[10px] text-slate-400 font-semibold">Change your secret authentication password used to sign into the console</p>
              </div>
            </div>

            {passwordMessage.text && (
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                passwordMessage.type === 'error' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              }`}>
                {passwordMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                <span>{passwordMessage.text}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 pr-10 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                    placeholder="Enter existing password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    New Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPass ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 pr-10 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPass(!showNewPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors cursor-pointer"
                    >
                      {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm New Password *
                  </label>
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-mono"
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <AdminButton type="submit" isLoading={isSavingPassword} className="px-5 py-2.5">
                  <Lock className="h-3.5 w-3.5 mr-2" /> Update Admin Password
                </AdminButton>
              </div>
            </form>
          </div>

          {/* 💳 3. PAYMENT & GATEWAY CONFIGURATION */}
          <form onSubmit={handleSaveSettings} className="space-y-6">
            <div className="bg-[#0E1322]/90 border border-slate-800/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
              <div className="flex items-center space-x-3 border-b border-slate-800/80 pb-4">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center shadow-lg text-white">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-black text-white uppercase tracking-tight">Cash on Delivery (COD) Options</h2>
                  <p className="text-[10px] text-slate-400 font-semibold">Enable or disable cash on delivery and configure handling fee</p>
                </div>
              </div>

              {paymentMessage.text && (
                <div className={`p-3.5 rounded-xl border flex items-center gap-3 text-xs font-semibold ${
                  paymentMessage.type === 'error' 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300' 
                    : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                }`}>
                  {paymentMessage.type === 'error' ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
                  <span>{paymentMessage.text}</span>
                </div>
              )}

              <div className="flex items-center justify-between py-2 text-xs">
                <div>
                  <span className="font-bold text-white block">Enable Cash on Delivery checkout</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Toggle customer ability to place orders without pre-payment</span>
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
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  COD Handling Charge (₹)
                </label>
                <input
                  type="number"
                  name="cod_fee"
                  value={settings.cod_fee}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-slate-800 bg-[#090D16]/90 p-3 text-xs text-white focus:border-indigo-500 focus:outline-none transition-colors font-bold"
                  placeholder="50"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <AdminButton type="submit" isLoading={isSavingSettings} className="px-6 py-3">
                <Save className="h-4 w-4 mr-2" /> Save Payment Configuration
              </AdminButton>
            </div>
          </form>

        </div>
      )}
    </div>
  );
}
