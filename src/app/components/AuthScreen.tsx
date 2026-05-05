"use client";

import { useState } from "react";

type AuthScreenProps = {
  onLogin: (username: string, password: string) => boolean;
};

export default function LoginPage({ onLogin }: AuthScreenProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = () => {
    setError("");
    setLoading(true);
    const ok = onLogin(username.trim(), password);
    if (!ok) {
      setError("Invalid username or password.");
      setLoading(false);
      return;
    }
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          font-family: 'DM Sans', sans-serif;
          background: #f0f2f8;
          min-height: 100vh;
        }

        .page {
          min-height: 100vh;
          display: flex;
          background: #f0f2f8;
        }

        /* LEFT PANEL */
        .left {
          width: 420px;
          min-width: 420px;
          background: #1a1f2e;
          display: flex;
          flex-direction: column;
          padding: 48px 44px;
          position: relative;
          overflow: hidden;
        }

        .left::before {
          content: '';
          position: absolute;
          top: -120px; left: -120px;
          width: 400px; height: 400px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
          pointer-events: none;
        }

        .left::after {
          content: '';
          position: absolute;
          bottom: -80px; right: -80px;
          width: 300px; height: 300px;
          background: radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          z-index: 1;
        }

        .logo-icon {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .logo-name {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          letter-spacing: 0.08em;
        }

        .left-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          z-index: 1;
        }

        .left-tag {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          color: #6366f1;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .left-headline {
          font-size: 36px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 20px;
        }

        .left-headline span {
          background: linear-gradient(90deg, #818cf8, #c4b5fd);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .left-desc {
          font-size: 15px;
          color: #94a3b8;
          line-height: 1.7;
          margin-bottom: 44px;
        }

        .stats {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .stat-card {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 18px 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon {
          width: 40px; height: 40px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          flex-shrink: 0;
        }

        .stat-icon.green { background: rgba(34,197,94,0.15); }
        .stat-icon.blue  { background: rgba(99,102,241,0.2); }
        .stat-icon.amber { background: rgba(251,191,36,0.15); }

        .stat-label {
          font-size: 11px;
          color: #64748b;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 3px;
          font-family: 'DM Mono', monospace;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 700;
          color: #fff;
        }

        .left-footer {
          z-index: 1;
          font-size: 12px;
          color: #475569;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        /* RIGHT PANEL */
        .right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          position: relative;
        }

        .right::before {
          content: '';
          position: absolute;
          top: 60px; right: 60px;
          width: 260px; height: 260px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .form-card {
          width: 100%;
          max-width: 420px;
          background: #fff;
          border-radius: 24px;
          padding: 44px 40px;
          box-shadow: 0 4px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05);
          position: relative;
          z-index: 1;
          animation: cardIn 0.5s cubic-bezier(0.22,1,0.36,1) both;
        }

        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-title {
          font-size: 26px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 6px;
        }

        .form-subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin-bottom: 36px;
        }

        .field-group {
          margin-bottom: 20px;
        }

        .field-label {
          display: block;
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 8px;
          font-family: 'DM Mono', monospace;
        }

        .field-wrap {
          position: relative;
        }

        .field-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
          pointer-events: none;
          transition: color 0.2s;
          display: flex; align-items: center;
        }

        .field-wrap:focus-within .field-icon {
          color: #6366f1;
        }

        .field-input {
          width: 100%;
          height: 48px;
          padding: 0 44px 0 42px;
          background: #f8fafc;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          color: #0f172a;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }

        .field-input:focus {
          border-color: #6366f1;
          background: #fff;
          box-shadow: 0 0 0 4px rgba(99,102,241,0.1);
        }

        .field-input::placeholder { color: #cbd5e1; }

        .toggle-pw {
          position: absolute;
          right: 14px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #94a3b8;
          display: flex; align-items: center;
          padding: 4px;
          transition: color 0.2s;
        }

        .toggle-pw:hover { color: #6366f1; }

        .forgot {
          display: flex;
          justify-content: flex-end;
          margin-top: 8px;
        }

        .forgot a {
          font-size: 12px;
          color: #6366f1;
          text-decoration: none;
          font-weight: 500;
        }

        .forgot a:hover { text-decoration: underline; }

        .btn-primary {
          width: 100%;
          height: 50px;
          background: linear-gradient(135deg, #6366f1, #818cf8);
          border: none;
          border-radius: 12px;
          font-size: 15px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          color: #fff;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: transform 0.15s, box-shadow 0.15s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(99,102,241,0.35);
        }

        .btn-primary:active { transform: translateY(0); }

        .btn-primary::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.12), transparent);
          pointer-events: none;
        }

        .spinner {
          width: 18px; height: 18px;
          border: 2px solid rgba(255,255,255,0.4);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .error-msg {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
          font-size: 13px;
          border-radius: 10px;
          padding: 10px 14px;
          margin-bottom: 18px;
          display: flex; align-items: center; gap: 8px;
        }

        .dots {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background-image: radial-gradient(circle, #cbd5e1 1px, transparent 1px);
          background-size: 28px 28px;
          opacity: 0.35;
          pointer-events: none;
        }

        @media (max-width: 860px) {
          .left { display: none; }
          .right { padding: 24px; }
        }
      `}</style>

      <div className="page">
        {/* LEFT */}
        <div className="left">
          <div className="logo">
            <div className="logo-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="logo-name">INVENTRA</span>
          </div>

          <div className="left-body">
            <div className="left-tag">Inventory Intelligence</div>
            <h1 className="left-headline">
              Control your stock.<br />
              <span>Grow your revenue.</span>
            </h1>
            <p className="left-desc">
              Real-time inventory tracking, automated restocking alerts, and powerful sales analytics — all in one place.
            </p>

            <div className="stats">
              <div className="stat-card">
                <div className="stat-icon green">📦</div>
                <div>
                  <div className="stat-label">This Week</div>
                  <div className="stat-value">57 units sold</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon blue">💰</div>
                <div>
                  <div className="stat-label">Revenue</div>
                  <div className="stat-value">Rs. 2,950</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon amber">⚡</div>
                <div>
                  <div className="stat-label">Net Profit</div>
                  <div className="stat-value">Rs. 904</div>
                </div>
              </div>
            </div>
          </div>

          <div className="left-footer">
            © 2026 INVENTRA. All rights reserved.
          </div>
        </div>

        {/* RIGHT */}
        <div className="right">
          <div className="dots" />

          <div className="form-card">
            <h2 className="form-title">Welcome back</h2>
            <p className="form-subtitle">Sign in to your INVENTRA dashboard</p>

            {/* Username */}
            <div className="field-group">
              <label className="field-label">Username</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                </span>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Enter your username"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-wrap">
                <span className="field-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  className="field-input"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSubmit()}
                />
                <button className="toggle-pw" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  }
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="error-msg">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            {/* Sign In */}
            <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
              {loading
                ? <><div className="spinner" /> Signing in...</>
                : <>Sign In <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>
              }
            </button>
          </div>
        </div>
      </div>
    </>
  );
}