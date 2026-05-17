import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock, User, Eye, EyeOff, ShieldCheck, AlertCircle,
  CheckCircle2, Loader2, KeyRound
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';

const InputField = ({ label, type, value, onChange, placeholder, icon: Icon, showToggle, onToggle, showValue }) => (
  <div>
    <label className="block text-xs font-black uppercase tracking-widest text-gray-400 mb-2">{label}</label>
    <div className="relative">
      {Icon && <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />}
      <input
        type={showToggle ? (showValue ? 'text' : 'password') : type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full py-4 rounded-2xl text-sm font-semibold text-gray-800 bg-gray-50 border border-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
        style={{ paddingLeft: Icon ? '2.75rem' : '1.5rem', paddingRight: showToggle ? '3rem' : '1.5rem' }}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          {showValue ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      )}
    </div>
  </div>
);

const AdminSettings = () => {
  const { adminId, refreshCredentials } = useAuth();

  const [form, setForm] = useState({
    currentPassword: '',
    newAdminId: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [show, setShow] = useState({
    current: false, new: false, confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const toggleShow = (field) => setShow(p => ({ ...p, [field]: !p[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      return setError('New passwords do not match.');
    }
    if (form.newPassword && form.newPassword.length < 8) {
      return setError('New password must be at least 8 characters.');
    }
    if (!form.newAdminId && !form.newPassword) {
      return setError('Please provide a new Admin ID or a new Password to update.');
    }

    setLoading(true);
    try {
      const res = await api.put('/admin/credentials', {
        currentPassword: form.currentPassword,
        newAdminId: form.newAdminId || undefined,
        newPassword: form.newPassword || undefined,
        confirmPassword: form.confirmPassword || undefined,
      });

      // Refresh token and adminId in context
      refreshCredentials(res.data.token, res.data.adminId);
      setSuccess(res.data.message || 'Credentials updated successfully!');
      setForm({ currentPassword: '', newAdminId: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 text-left">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black tracking-tight text-gray-900">Settings</h2>
        <p className="text-sm text-gray-400 font-medium mt-1">Manage your admin account and security credentials</p>
      </div>

      {/* Current identity card */}
      <div className="flex items-center gap-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-2xl shadow-indigo-100">
        <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-widest opacity-70">Current Admin ID</p>
          <p className="text-2xl font-black tracking-tight mt-0.5">{adminId}</p>
        </div>
      </div>

      {/* Change credentials form */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <KeyRound className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Change Admin Credentials</h3>
            <p className="text-xs text-gray-400 font-medium mt-0.5">Leave new fields empty to keep them unchanged</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Alerts */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 p-4 bg-red-50 border border-red-100 rounded-2xl"
              >
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <p className="text-sm font-semibold text-red-600">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 p-4 bg-green-50 border border-green-100 rounded-2xl"
              >
                <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                <p className="text-sm font-semibold text-green-600">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Separator label */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-start">
              <span className="bg-white pr-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                Verify Identity
              </span>
            </div>
          </div>

          <InputField
            label="Current Password"
            type="password"
            value={form.currentPassword}
            onChange={e => setForm(p => ({ ...p, currentPassword: e.target.value }))}
            placeholder="Enter your current password"
            icon={Lock}
            showToggle
            showValue={show.current}
            onToggle={() => toggleShow('current')}
          />

          {/* Separator label */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100" /></div>
            <div className="relative flex justify-start">
              <span className="bg-white pr-3 text-[10px] font-black uppercase tracking-widest text-gray-400">
                New Credentials (optional)
              </span>
            </div>
          </div>

          <InputField
            label="New Admin ID"
            type="text"
            value={form.newAdminId}
            onChange={e => setForm(p => ({ ...p, newAdminId: e.target.value }))}
            placeholder={`Current: ${adminId}`}
            icon={User}
          />

          <InputField
            label="New Password"
            type="password"
            value={form.newPassword}
            onChange={e => setForm(p => ({ ...p, newPassword: e.target.value }))}
            placeholder="Min. 8 characters"
            icon={Lock}
            showToggle
            showValue={show.new}
            onToggle={() => toggleShow('new')}
          />

          <InputField
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={e => setForm(p => ({ ...p, confirmPassword: e.target.value }))}
            placeholder="Re-enter new password"
            icon={Lock}
            showToggle
            showValue={show.confirm}
            onToggle={() => toggleShow('confirm')}
          />

          <motion.button
            type="submit"
            disabled={loading || !form.currentPassword}
            whileHover={!loading && form.currentPassword ? { scale: 1.02 } : {}}
            whileTap={!loading && form.currentPassword ? { scale: 0.98 } : {}}
            className="w-full py-5 mt-2 rounded-2xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', boxShadow: '0 0 30px rgba(99,102,241,0.25)' }}
          >
            {loading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Updating...</>
            ) : (
              <><ShieldCheck className="w-4 h-4" /> Save Credentials</>
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Security tips */}
      <div className="bg-gray-50 rounded-3xl p-6 space-y-3 border border-gray-100">
        <h4 className="text-xs font-black uppercase tracking-widest text-gray-400">Security Tips</h4>
        {[
          'Use a unique Admin ID that is hard to guess.',
          'Choose a password with 12+ characters, numbers and symbols.',
          'Never share your admin credentials with anyone.',
          'Change your password periodically.'
        ].map((tip, i) => (
          <div key={i} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <p className="text-sm text-gray-500 font-medium">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettings;
