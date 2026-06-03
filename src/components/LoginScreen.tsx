/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { Phone, Lock, Sparkles, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSendCode = () => {
    if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的11位手机号码');
      return;
    }
    setError('');
    setCountdown(60);
    // Simulate SMS delivery
    setInfo('【开发测试提示】验证码已模拟发送！请输入 123456 或 888888 快速登录。');
    setTimeout(() => setInfo(''), 8000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) {
      setError('请输入手机号');
      return;
    }
    if (!code) {
      setError('请输入验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '登录失败');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setError(err.message || '网络连接失败，请确认后端服务器正常运行');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-bg flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-warm border border-neutral-100 flex flex-col items-center">
        {/* Brand Icon or Logo */}
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <div className="w-10 h-10 bg-primary text-white font-serif rounded-full flex items-center justify-center text-xl font-bold">
            T
          </div>
        </div>

        <h1 className="text-3xl font-serif text-neutral-800 font-bold mb-1">Terra 简历</h1>
        <p className="text-neutral-500 text-sm mb-6 font-sans">专业简历智能生成、评估与优化工具</p>

        {error && (
          <div className="w-full bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-lg text-xs mb-4">
            {error}
          </div>
        )}

        {info && (
          <div className="w-full bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-lg text-xs mb-4">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1 font-sans">手机号码</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入手机号"
                className="w-full bg-warm-bg/50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-neutral-400 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-500 mb-1 font-sans">验证码</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="六位数字验证码"
                  maxLength={6}
                  className="w-full bg-warm-bg/50 border border-neutral-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-neutral-400 font-mono tracking-widest"
                />
              </div>
              <button
                type="button"
                onClick={handleSendCode}
                disabled={countdown > 0}
                className="px-4 text-xs font-medium border border-primary/20 text-primary bg-primary/5 rounded-xl hover:bg-primary/10 disabled:opacity-50 transition-colors shrink-0"
              >
                {countdown > 0 ? `${countdown}s 后重发` : '获取验证码'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white font-medium py-3 rounded-xl hover:bg-primary-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-sm shadow-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                正在校验登录...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                安全登录进入工作台
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center text-xs text-neutral-400">
          首次登录手机号将自动创建角色 • 测试无需真实卡费
        </div>
      </div>
    </div>
  );
}
