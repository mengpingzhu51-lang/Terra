/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { User } from '../types';
import { Sparkles, Loader2 } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (user: User) => void;
}

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const buttonRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const renderButton = () => {
      if (!window.google?.accounts?.id || !buttonRef.current) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!,
        callback: handleCredentialResponse,
        auto_select: false,
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: buttonRef.current.offsetWidth,
        text: 'signin_with',
        logo_alignment: 'center',
      });
    };

    // GIS SDK may already be loaded or needs to wait
    if (window.google?.accounts?.id) {
      renderButton();
    } else {
      const interval = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(interval);
          renderButton();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, []);

  const handleCredentialResponse = async (response: { credential: string }) => {
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.credential }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google 登录失败');
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

        {loading ? (
          <div className="w-full flex items-center justify-center gap-2 py-3 text-sm text-neutral-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            正在验证 Google 账号...
          </div>
        ) : (
          <div className="w-full flex flex-col items-center gap-4">
            <div ref={buttonRef} className="w-full flex justify-center" />
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Sparkles className="w-3 h-3" />
              使用 Google 账号安全登录
            </div>
          </div>
        )}

        <div className="mt-8 text-center text-xs text-neutral-400">
          首次登录将自动创建角色 • 数据安全加密存储
        </div>
      </div>
    </div>
  );
}
