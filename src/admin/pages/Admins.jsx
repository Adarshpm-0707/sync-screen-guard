import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Shield, 
  UserPlus, 
  Users, 
  UserCheck, 
  Sparkles, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  Eye, 
  Copy, 
  Check, 
  Mail, 
  Lock, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Calendar, 
  Clock, 
  User, 
  KeyRound,
  ChevronRight,
  X,
  SlidersHorizontal,
  Briefcase
} from 'lucide-react';
import useAdmins from '../hooks/useAdmins';
import useAdminAuth from '../hooks/useAdminAuth';
import StatCard from '../components/dashboard/StatCard';
import AdminTable from '../components/common/AdminTable';
import AdminModal from '../components/common/AdminModal';
import ConfirmDialog from '../components/common/ConfirmDialog';

export default function Admins() {
  const { adminUser } = useAdminAuth();
  const {
    admins,
    allAdmins,
    stats,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    roleFilter,
    setRoleFilter,
    statusFilter,
    setStatusFilter,
    createAdmin,
    updateAdmin,
    deleteAdmin,
    refresh
  } = useAdmins();

  // Modal & Drawer State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  // Form State for Add Admin
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'admin',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Role Badge Styling Helper
  const getRoleBadge = (role, isRoot) => {
    if (isRoot || role === 'superadmin') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-violet-500/20 to-indigo-500/20 text-violet-300 border border-violet-500/30 text-[10px] font-black uppercase tracking-wider">
          <Sparkles className="h-3 w-3 text-violet-400" />
          Super Admin
        </span>
      );
    }
    if (role === 'manager') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/25 text-[10px] font-black uppercase tracking-wider">
          <Briefcase className="h-3 w-3 text-amber-400" />
          Store Manager
        </span>
      );
    }
    if (role === 'moderator') {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-teal-500/15 text-teal-300 border border-teal-500/25 text-[10px] font-black uppercase tracking-wider">
          <Shield className="h-3 w-3 text-teal-400" />
          Moderator
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/15 text-indigo-300 border border-indigo-500/25 text-[10px] font-black uppercase tracking-wider">
        <ShieldCheck className="h-3 w-3 text-indigo-400" />
        Store Admin
      </span>
    );
  };

  // Copy Email Handler
  const handleCopyEmail = (email, id) => {
    navigator.clipboard.writeText(email);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Submit Add Admin
  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess(false);

    if (!formData.email.trim() || !formData.password.trim()) {
      setFormError('Email and password are required.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setFormError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      await createAdmin({
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        password: formData.password.trim(),
      });

      setFormSuccess(true);
      setTimeout(() => {
        setIsAddModalOpen(false);
        setFormData({
          name: '',
          email: '',
          role: 'admin',
          password: '',
          confirmPassword: '',
        });
        setFormSuccess(false);
      }, 1200);
    } catch (err) {
      setFormError(err.message || 'Failed to create administrator.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);
    try {
      await deleteAdmin(adminToDelete);
      setIsDeleteDialogOpen(false);
      setAdminToDelete(null);
      if (selectedAdmin?.id === adminToDelete.id) {
        setIsDetailDrawerOpen(false);
        setSelectedAdmin(null);
      }
      setActionSuccessMsg('Administrator account removed successfully.');
      setTimeout(() => setActionSuccessMsg(''), 4000);
    } catch (err) {
      alert(err.message || 'Failed to delete administrator account.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (admin) => {
    const newStatus = admin.status === 'suspended' ? 'active' : 'suspended';
    try {
      await updateAdmin(admin.id, { status: newStatus });
      if (selectedAdmin?.id === admin.id) {
        setSelectedAdmin(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.warn('Status toggle error:', err);
    }
  };

  const tableHeaders = [
    'Administrator',
    'Role & Scope',
    'Access Status',
    'Date Added',
    'Last Sign-in',
    'Actions'
  ];

  return (
    <div className="space-y-6 text-slate-100 font-sans pb-12">
      {/* Top Banner Notice if any */}
      {actionSuccessMsg && (
        <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-300 animate-in fade-in duration-200">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button 
            onClick={() => setActionSuccessMsg('')}
            className="text-emerald-400 hover:text-emerald-200"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4" />
            <span>System Access Control</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white font-display">
            Admin Personnel
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium mt-0.5">
            Manage authorized administrators, console credentials, and privilege scopes
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={refresh}
            disabled={loading}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition-all text-xs font-bold cursor-pointer disabled:opacity-50"
            title="Refresh list"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Administrator</span>
          </button>
        </div>
      </div>

      {/* Stat Cards KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
        <StatCard
          title="Total Admins"
          value={stats.totalAdmins}
          icon={Users}
          description="Registered console personnel"
        />
        <StatCard
          title="Active Personnel"
          value={stats.activeAdmins}
          icon={UserCheck}
          badge={{ text: 'Verified', variant: 'success' }}
          description="Operational admin accounts"
        />
        <StatCard
          title="Superadmins"
          value={stats.superAdminsCount}
          icon={Sparkles}
          badge={{ text: 'Root Access', variant: 'primary' }}
          description="Full console privilege level"
        />
        <StatCard
          title="Security Enforcement"
          value="100%"
          icon={KeyRound}
          badge={{ text: 'Enforced', variant: 'success' }}
          description="JWT session validation"
        />
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-[#0E1322]/80 border border-slate-800/90 shadow-xl backdrop-blur-xl flex flex-col md:flex-row gap-3 md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5">
            <Filter className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0E1322] text-slate-200">All Roles</option>
              <option value="superadmin" className="bg-[#0E1322] text-slate-200">Super Admin</option>
              <option value="admin" className="bg-[#0E1322] text-slate-200">Store Admin</option>
              <option value="manager" className="bg-[#0E1322] text-slate-200">Store Manager</option>
              <option value="moderator" className="bg-[#0E1322] text-slate-200">Moderator</option>
            </select>
          </div>

          <div className="flex items-center gap-2 bg-slate-950/70 border border-slate-800 rounded-xl px-3 py-1.5">
            <SlidersHorizontal className="h-3.5 w-3.5 text-slate-500" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="all" className="bg-[#0E1322] text-slate-200">All Status</option>
              <option value="active" className="bg-[#0E1322] text-slate-200">Active</option>
              <option value="suspended" className="bg-[#0E1322] text-slate-200">Suspended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <AdminTable
        headers={tableHeaders}
        isLoading={loading}
        emptyMessage="No administrators found"
      >
        {admins.map((admin) => {
          const isCurrentUser = adminUser?.email && admin.email.toLowerCase() === adminUser.email.toLowerCase();
          const isRoot = admin.is_root || admin.email === 'admin@syncarmor.in';
          const isActive = admin.status !== 'suspended';

          return (
            <tr 
              key={admin.id || admin.email} 
              className="hover:bg-slate-850/40 transition-colors group cursor-pointer"
              onClick={() => {
                setSelectedAdmin(admin);
                setIsDetailDrawerOpen(true);
              }}
            >
              {/* Profile */}
              <td className="px-4 sm:px-5 py-3.5">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600/30 to-violet-600/30 border border-indigo-500/30 text-indigo-300 font-black text-xs uppercase shadow-sm">
                      {(admin.name?.[0] || admin.email?.[0] || 'A').toUpperCase()}
                    </div>
                    <span 
                      className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-[#0E1322] ${
                        isActive ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} 
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-white text-xs">
                        {admin.name || admin.email.split('@')[0]}
                      </span>
                      {isCurrentUser && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          You
                        </span>
                      )}
                      {isRoot && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded bg-violet-500/20 text-violet-300 border border-violet-500/40">
                          Root
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5 text-slate-400 text-[11px]">
                      <span>{admin.email}</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyEmail(admin.email, admin.id);
                        }}
                        className="hover:text-white transition-colors"
                        title="Copy email"
                      >
                        {copiedId === admin.id ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3 opacity-60 hover:opacity-100" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </td>

              {/* Role */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                {getRoleBadge(admin.role, isRoot)}
              </td>

              {/* Status */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  isActive 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                  {isActive ? 'Active' : 'Suspended'}
                </span>
              </td>

              {/* Date Added */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-slate-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    }) : 'Preconfigured'}
                  </span>
                </div>
              </td>

              {/* Last Sign-in */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-slate-400 text-xs">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  <span>
                    {admin.last_sign_in_at ? new Date(admin.last_sign_in_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric'
                    }) : 'Never'}
                  </span>
                </div>
              </td>

              {/* Actions */}
              <td className="px-4 sm:px-5 py-3.5 whitespace-nowrap text-right">
                <div className="flex items-center justify-end space-x-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => {
                      setSelectedAdmin(admin);
                      setIsDetailDrawerOpen(true);
                    }}
                    className="p-1.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                    title="View admin profile"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      setAdminToDelete(admin);
                      setIsDeleteDialogOpen(true);
                    }}
                    disabled={isCurrentUser || isRoot}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      isCurrentUser || isRoot
                        ? 'opacity-30 border-slate-800/40 text-slate-600 cursor-not-allowed'
                        : 'border-slate-800 bg-slate-900/60 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-300'
                    }`}
                    title={
                      isCurrentUser 
                        ? 'You cannot delete yourself' 
                        : isRoot 
                        ? 'Root administrator cannot be deleted' 
                        : 'Delete administrator'
                    }
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </AdminTable>

      {/* ADD NEW ADMIN MODAL */}
      <AdminModal
        isOpen={isAddModalOpen}
        onClose={() => {
          if (!isSubmitting) {
            setIsAddModalOpen(false);
            setFormError('');
          }
        }}
        title="Add New Administrator"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleAddAdminSubmit} className="space-y-4">
          <p className="text-xs text-slate-400">
            Grant console access privileges to a new team member. The administrator can sign in at <span className="text-indigo-400 font-mono">/admin/login</span>.
          </p>

          {/* Success Message */}
          {formSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>Administrator account created successfully!</span>
            </div>
          )}

          {/* Error Message */}
          {formError && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Full Name / Display Name
            </label>
            <div className="relative">
              <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Administrator Email <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type="email"
                required
                placeholder="name@syncarmor.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Role & Privilege Scope
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white focus:outline-none focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="admin" className="bg-[#0E1322]">Store Admin (Products, Orders & Inventory)</option>
              <option value="manager" className="bg-[#0E1322]">Store Manager (Orders & Logistics)</option>
              <option value="moderator" className="bg-[#0E1322]">Moderator (Reviews & Inquiries)</option>
              <option value="superadmin" className="bg-[#0E1322]">Super Admin (Full Console Access)</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Temporary Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5">
              Confirm Password <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/25 border border-indigo-400/30 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      </AdminModal>

      {/* ADMIN DETAIL DRAWER */}
      {isDetailDrawerOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDetailDrawerOpen(false)}
          />
          <div className="relative w-full max-w-md bg-[#0E1322] border-l border-slate-800 shadow-2xl p-6 overflow-y-auto flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-indigo-400" />
                  <h3 className="font-display font-extrabold text-base text-white uppercase tracking-wider">
                    Admin Personnel File
                  </h3>
                </div>
                <button
                  onClick={() => setIsDetailDrawerOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Profile Card */}
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 my-5 text-center flex flex-col items-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-600/30 ring-4 ring-indigo-500/20 mb-3">
                  {(selectedAdmin.name?.[0] || selectedAdmin.email?.[0] || 'A').toUpperCase()}
                </div>
                <h4 className="font-bold text-white text-base">
                  {selectedAdmin.name || selectedAdmin.email.split('@')[0]}
                </h4>
                <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedAdmin.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  {getRoleBadge(selectedAdmin.role, selectedAdmin.is_root)}
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                    selectedAdmin.status !== 'suspended'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}>
                    {selectedAdmin.status !== 'suspended' ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Permissions & Scopes */}
              <div className="space-y-3">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Role Capabilities & Scopes
                </h5>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300 font-semibold">Store Analytics & Dashboard</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300 font-semibold">Orders & Fulfillment Dispatch</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300 font-semibold">Catalog, Products & Inventory</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300 font-semibold">Customer Records & Reviews</span>
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-300 font-semibold">Security Settings & Personnel Admin</span>
                    {selectedAdmin.role === 'superadmin' || selectedAdmin.is_root ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] uppercase font-bold text-slate-500">Restricted</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Metadata */}
              <div className="mt-5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Identifier:</span>
                  <span className="font-mono text-slate-300 text-[11px] truncate max-w-[180px]">{selectedAdmin.id}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registered:</span>
                  <span className="text-slate-300">
                    {selectedAdmin.created_at ? new Date(selectedAdmin.created_at).toLocaleString() : 'System default'}
                  </span>
                </div>
              </div>
            </div>

            {/* Bottom Actions in Drawer */}
            <div className="pt-6 border-t border-slate-800 space-y-2.5">
              {!(selectedAdmin.is_root || selectedAdmin.email === 'admin@syncarmor.in' || selectedAdmin.email === adminUser?.email) && (
                <>
                  <button
                    onClick={() => handleToggleStatus(selectedAdmin)}
                    className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      selectedAdmin.status === 'suspended'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                    }`}
                  >
                    {selectedAdmin.status === 'suspended' ? 'Reactivate Account' : 'Suspend Account Privileges'}
                  </button>

                  <button
                    onClick={() => {
                      setAdminToDelete(selectedAdmin);
                      setIsDeleteDialogOpen(true);
                    }}
                    className="w-full py-2.5 px-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-bold transition-all cursor-pointer"
                  >
                    Remove Administrator
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          if (!isDeleting) {
            setIsDeleteDialogOpen(false);
            setAdminToDelete(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        title="Revoke Admin Access"
        message={`Are you sure you want to remove administrator ${adminToDelete?.email}? They will immediately lose access to the Sync Admin Console.`}
        confirmText="Yes, Remove Admin"
        cancelText="Cancel"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
