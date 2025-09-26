import React, { useState } from 'react';
import axios from 'axios';

// Enviar cookies en peticiones cross-site
axios.defaults.withCredentials = true;

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    // Comprobar sesión en el servidor mediante cookie
    (async () => {
      try {
        const r = await axios.get('/api/admin/me');
        if (r.data?.user) window.location.href = '/admin/dashboard';
      } catch (e) {
        // no logged
      }
    })();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setEmailError(null);

    // Validación de email (copiada de Footer)
    const validateEmailDomain = (email: string): { isValid: boolean; suggestion?: string } => {
      const blockedDomains = [
        '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'tempmail.org',
        'yopmail.com', 'temp-mail.org', 'throwaway.email', 'getnada.com',
        'maildrop.cc', 'mailnesia.com', 'trashmail.com', '33mail.com',
        'dispostable.com', 'fake-mail.ml', 'mohmal.com', 'emailfake.com'
      ];
      const trustedDomains = [
        'gmail.com','googlemail.com','google.com','outlook.com','outlook.es','hotmail.com','hotmail.es','live.com','live.es','msn.com','yahoo.com','yahoo.es','icloud.com','me.com','mac.com','aol.com','protonmail.com','proton.me','tutanota.com'
      ];

      const emailParts = email.toLowerCase().split('@');
      if (emailParts.length !== 2) return { isValid: false };
      const [localPart, emailDomain] = emailParts;
      if (!localPart || localPart.length < 1 || localPart.length > 64) return { isValid: false };
      if (!emailDomain || emailDomain.length < 3 || emailDomain.length > 255) return { isValid: false };
      const domainParts = emailDomain.split('.');
      if (domainParts.length < 2) return { isValid: false };
      const extension = domainParts[domainParts.length - 1];
      if (extension.length < 2 || extension.length > 6) return { isValid: false };
      if (!/^[a-zA-Z]+$/.test(extension)) return { isValid: false };
      for (const part of domainParts) {
        if (!part || part.length < 1 || !/^[a-zA-Z0-9-]+$/.test(part)) return { isValid: false };
      }
      if (blockedDomains.includes(emailDomain)) return { isValid: false };
      if (!trustedDomains.includes(emailDomain)) {
        const commonDomains: Record<string, string> = {
          'gmial.com': 'gmail.com','gmai.com': 'gmail.com','hotmial.com': 'hotmail.com','yaho.com': 'yahoo.com','outlok.com':'outlook.com'
        };
        if (commonDomains[emailDomain]) return { isValid: false, suggestion: email.replace(emailDomain, commonDomains[emailDomain]) };
        return { isValid: false };
      }
      return { isValid: true };
    };

    // Basic regex check
    const emailRegex = /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z]{2,})+$/;
    if (!email || !emailRegex.test(email.trim()) || email.length > 100) {
      setEmailError('El formato del email no es válido');
      return;
    }
    const domainValidation = validateEmailDomain(email.trim());
    if (!domainValidation.isValid) {
      if (domainValidation.suggestion) setEmailError(`¿Quisiste decir ${domainValidation.suggestion}?`);
      else setEmailError('Por favor usa un proveedor de email conocido (Gmail, Outlook, Yahoo, etc.)');
      return;
    }
    try {
      setLoading(true);
  // El servidor setea cookies (adminToken HttpOnly y csrfToken no-HttpOnly)
  await axios.post('/api/admin/login', { email, password });
  // Redirigir al dashboard
  window.location.href = '/admin/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error en login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-3xl font-serif font-bold mb-6 text-white">Admin login</h2>
      <form onSubmit={submit} className="flex flex-col gap-4 bg-slate-900 p-6 rounded-lg border border-slate-700">
        <label className="text-sm text-slate-300">Email</label>
        <input
          value={email}
          onChange={e => { setEmail(e.target.value); if (emailError) setEmailError(null); }}
          placeholder="admin@ejemplo.com"
          className={`px-3 py-2 bg-slate-700 border text-white placeholder-slate-400 rounded-md focus:outline-none transition-colors ${emailError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-slate-600 focus:ring-spanish-yellow focus:border-spanish-yellow'}`}
        />
        <label className="text-sm text-slate-300">Contraseña</label>
        <input
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Password"
          type="password"
          className={`px-3 py-2 bg-slate-700 border text-white placeholder-slate-400 rounded-md focus:outline-none transition-colors border-slate-600 focus:ring-spanish-yellow focus:border-spanish-yellow`}
        />
        <button type="submit" disabled={loading} className="bg-yellow-400 text-slate-900 px-4 py-2 rounded font-bold flex items-center justify-center gap-3">
          {loading ? (<span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />) : null}
          Entrar
        </button>
        {emailError && <div className="text-red-400 text-sm">{emailError}</div>}
        {error && <div className="text-red-500 text-sm">{error}</div>}
      </form>
    </div>
  );
}
