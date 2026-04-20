import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FEATURES = [
  { icon: '📄', label: 'PDF Viewer' },
  { icon: '🔍', label: 'Zoom & Nav' },
  { icon: '🤖', label: 'AI Assistant' },
  { icon: '💾', label: 'Auto Save' },
];

const GOOGLE_LOGO = `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgdHJhbnNmb3JtPSJtYXRyaXgoMSwgMCwgMCwgMSwgMjcsIDE0KSI+PHBhdGggZmlsbD0iI2ZmZmZmZiIgZD0ibS0zLDE0YTkuMDUsOS4wNSwwLDAsMCwuMzgsMi42MmwzLjgzLTIuOTlhMy4zNywzLjM3LDAsMCwxLS4yMS0xLjE1QTMuNTMsMy41MywwLDAsMSwxLDExLjQybDIuNDksMi41TDcuNjksMTFhOS4xMiw5LjEyLDAsMCwwLTEwLjY5LDNaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjcgLTE0KSIvPjxwYXRoIGZpbGw9IiNmZmZmZmYiIGQ9Im0tMy0xNHYwYTkuMDUsOS4wNSwwLDAsMSwuMzgtMi42MmwzLjgzLDIuOTlhMy4zNywzLjM3LDAsMCwwLS4yMSwxLjE1QTMuNTMsMy41MywwLDAsMCwxLDE2LjU4bDIuNDktMi41TDcuNjksMTdhOS4xMiw5LjEyLDAsMCwxLTEwLjY5LTNaIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjcgLTE0KSIvPjwvZz48L3N2Zz4=`;

export const LoginPage = () => {
  const { signInWithGoogle, error } = useAuth();
  const [signing, setSigning] = useState(false);

  const handleGoogleSignIn = async () => {
    setSigning(true);
    try {
      await signInWithGoogle();
    } catch {
      // error handled in context
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="login-page">
      {/* Background Orbs */}
      <div className="login-bg-orb" style={{
        width: 500, height: 500,
        background: 'radial-gradient(circle, rgba(124,106,247,0.15), transparent 70%)',
        top: -100, left: -100,
      }} />
      <div className="login-bg-orb" style={{
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(78,205,196,0.12), transparent 70%)',
        bottom: -80, right: -80,
      }} />
      <div className="login-bg-orb" style={{
        width: 200, height: 200,
        background: 'radial-gradient(circle, rgba(124,106,247,0.08), transparent 70%)',
        top: '60%', left: '40%',
      }} />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div style={{ fontSize: 48, marginBottom: 8 }}>📚</div>
          <h1>BookReader</h1>
          <p>Your intelligent reading companion</p>
        </div>

        {/* Sign In */}
        <button className="google-btn" onClick={handleGoogleSignIn} disabled={signing}>
          {signing ? (
            <div className="loading-spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          {signing ? 'Signing in…' : 'Continue with Google'}
        </button>

        {error && (
          <div style={{
            marginTop: 12, padding: '8px 12px',
            background: 'rgba(255,107,107,0.12)', border: '1px solid rgba(255,107,107,0.3)',
            borderRadius: 8, fontSize: 13, color: '#ff6b6b',
          }}>
            {error}
          </div>
        )}

        {/* Features */}
        <div className="login-features">
          {FEATURES.map((f) => (
            <div key={f.label} className="feature-chip">
              <span>{f.icon}</span>
              <span>{f.label}</span>
            </div>
          ))}
        </div>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-disabled)', marginTop: 20 }}>
          By signing in you agree to our terms of service
        </p>
      </div>
    </div>
  );
};
