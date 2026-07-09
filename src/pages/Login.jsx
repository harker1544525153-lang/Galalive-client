import { useState, useEffect } from 'react';
import {
  Eye, EyeOff, Lock, Phone, Clock, ChevronRight,
  Globe, Share2, MessageCircle,
  CheckCircle, AlertCircle, X,
} from 'lucide-react';
import { authAPI } from '../api';

const Login = ({ onLogin, onNavigate }) => {
  const [mode, setMode] = useState('password');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    code: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    document.title = 'Gala Live - 登录';
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const showToast = (type, message) => setToast({ type, message });

  const validatePhone = (phone) => /^1[3-9]\d{9}$/.test(phone);

  const validateForm = () => {
    const next = {};

    if (!formData.phone) {
      next.phone = '请输入手机号';
    } else if (!validatePhone(formData.phone)) {
      next.phone = '请输入正确的手机号';
    }

    if (mode === 'password') {
      if (!formData.password) {
        next.password = '请输入密码';
      } else if (formData.password.length < 6) {
        next.password = '密码至少 6 位';
      }
    } else if (mode === 'code') {
      if (!formData.code) {
        next.code = '请输入验证码';
      } else if (formData.code.length < 4) {
        next.code = '验证码格式不正确';
      }
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSendCode = async () => {
    if (!formData.phone) {
      setErrors({ ...errors, phone: '请输入手机号' });
      return;
    }
    if (!validatePhone(formData.phone)) {
      setErrors({ ...errors, phone: '请输入正确的手机号' });
      return;
    }

    setCodeLoading(true);
    try {
      await authAPI.sendSms({ phone: formData.phone });
      setCountdown(60);
      showToast('success', '验证码已发送，请注意查收');
    } catch (err) {
      const msg = err.response?.data?.error || '验证码发送失败，请稍后重试';
      showToast('error', msg);
    } finally {
      setCodeLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      if (mode === 'password') {
        response = await authAPI.login({
          phone: formData.phone,
          password: formData.password,
        });
      } else {
        response = await authAPI.login({
          phone: formData.phone,
          code: formData.code,
        });
      }

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));

      showToast('success', '登录成功，正在进入...');

      if (onLogin) onLogin(response.data.user);

      setTimeout(() => {
        const path = window.location.pathname;
        const base = path.startsWith('/Galalive-client') ? '/Galalive-client' : '';
        window.location.href = base + '/';
      }, 600);
    } catch (error) {
      const msg =
        error.response?.data?.error ||
        error.response?.data?.message ||
        '操作失败，请稍后重试';
      showToast('error', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider) => {
    showToast('success', `${provider} 登录功能即将上线`);
  };

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
  };

  const modeTabs = [
    { key: 'password', label: '密码登录' },
    { key: 'code', label: '验证码登录' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/60 to-pink-900/50" />
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-10 left-10 w-72 h-72 bg-pink-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-600 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500 rounded-full blur-3xl opacity-60" />
      </div>

      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-[fadeInDown_0.3s_ease-out]">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-xl border ${
              toast.type === 'success'
                ? 'bg-green-500/20 border-green-400/30 text-green-100'
                : 'bg-red-500/20 border-red-400/30 text-red-100'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => setToast(null)}
              className="ml-2 hover:opacity-70 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl mb-4 shadow-lg shadow-pink-500/30">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-1">
              Gala Live
            </h1>
            <p className="text-gray-300 text-sm">开启你的直播之旅</p>
          </div>

          <div className="flex mb-6 bg-white/5 rounded-xl p-1.5 border border-white/10">
            {modeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => switchMode(tab.key)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-300 ${
                  mode === tab.key
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <FieldGroup
              icon={<Phone className="w-5 h-5" />}
              label="手机号"
              error={errors.phone}
            >
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
                placeholder="请输入手机号"
                maxLength={11}
                inputMode="numeric"
              />
            </FieldGroup>

            {mode === 'code' && (
              <FieldGroup
                icon={<Clock className="w-5 h-5" />}
                label="验证码"
                error={errors.code}
              >
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => handleChange('code', e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
                  placeholder="请输入验证码"
                  maxLength={6}
                  inputMode="numeric"
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0 || codeLoading}
                  className="px-3 py-1.5 bg-gradient-to-r from-pink-500 to-purple-600 text-white text-xs font-medium rounded-lg hover:from-pink-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 whitespace-nowrap"
                >
                  {codeLoading ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      发送中
                    </>
                  ) : countdown > 0 ? (
                    `${countdown}s 后重试`
                  ) : (
                    '获取验证码'
                  )}
                </button>
              </FieldGroup>
            )}

            {mode === 'password' && (
              <FieldGroup
                icon={<Lock className="w-5 h-5" />}
                label="密码"
                error={errors.password}
              >
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
                  placeholder="请输入密码"
                  maxLength={32}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                </button>
              </FieldGroup>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-pink-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  请稍候...
                </>
              ) : (
                <>
                  登录
                  <ChevronRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-5 text-center text-sm">
            <span className="text-gray-400">还没有账号？</span>
            <button
              onClick={() => onNavigate && onNavigate('register')}
              className="text-pink-400 hover:text-pink-300 ml-1 font-semibold inline-flex items-center gap-1 transition-colors"
            >
              立即注册
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-7 flex items-center justify-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <span className="text-gray-500 text-xs">其他登录方式</span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <div className="mt-6 flex justify-center gap-5">
            <SocialButton
              icon={<Globe className="w-6 h-6" />}
              label="Google"
              onClick={() => handleSocialLogin('Google')}
              hoverClass="hover:bg-red-500/20 hover:text-red-300"
            />
            <SocialButton
              icon={<Share2 className="w-6 h-6" />}
              label="Facebook"
              onClick={() => handleSocialLogin('Facebook')}
              hoverClass="hover:bg-blue-500/20 hover:text-blue-300"
            />
          </div>

          <p className="mt-6 text-center text-xs text-gray-500 leading-relaxed">
            登录即表示同意
            <span className="text-gray-400 mx-1">《用户协议》</span>
            和
            <span className="text-gray-400 mx-1">《隐私政策》</span>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInDown {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        input[type="password"]::-webkit-credentials-auto-fill-button,
        input[type="password"]::-webkit-contacts-auto-fill-button {
          display: none !important;
          visibility: hidden !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        input[type="password"]::-webkit-textfield-decoration-container {
          display: none !important;
          visibility: hidden !important;
        }
        input[type="password"]::-ms-reveal,
        input[type="password"]::-ms-clear {
          display: none !important;
          visibility: hidden !important;
          width: 0 !important;
          height: 0 !important;
        }
        input[type="password"]::-webkit-inner-spin-button,
        input[type="password"]::-webkit-outer-spin-button {
          -webkit-appearance: none !important;
          margin: 0 !important;
        }
        input[type="password"] {
          -webkit-appearance: none !important;
          appearance: none !important;
        }
      `}</style>
    </div>
  );
};

const FieldGroup = ({ icon, label, error, children }) => (
  <div className="relative group">
    <div
      className={`relative bg-white/5 border rounded-xl px-4 py-3 transition-all duration-300 ${
        error
          ? 'border-red-400/50'
          : 'border-white/10 group-focus-within:border-pink-500/50'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className={error ? 'text-red-400' : 'text-gray-400'}>{icon}</span>
        <label className="text-gray-300 text-xs font-medium">{label}</label>
      </div>
      <div className="flex items-center gap-3">{children}</div>
    </div>
    {error && (
      <p className="mt-1.5 ml-1 text-xs text-red-400 flex items-center gap-1 animate-[fadeIn_0.2s_ease-out]">
        <AlertCircle className="w-3 h-3" />
        {error}
      </p>
    )}
  </div>
);

const SocialButton = ({ icon, label, onClick, hoverClass }) => (
  <button
    type="button"
    onClick={onClick}
    title={`使用 ${label} 登录`}
    className={`w-14 h-14 bg-white/10 rounded-full flex items-center justify-center transition-all duration-300 hover:scale-110 text-white ${hoverClass}`}
  >
    {icon}
  </button>
);

export default Login;
