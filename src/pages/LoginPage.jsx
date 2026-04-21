import { useState } from 'react';
import { useStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, Lock, Mail, AlertCircle } from 'lucide-react';

export function LoginPage() {
  const login = useStore((s) => s.login);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message === 'Invalid login credentials'
        ? 'Credenciales incorrectas. Revisa tu email y contraseña.'
        : 'Error al iniciar sesión. Intenta de nuevo.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] flex flex-col items-center justify-center p-6 sm:p-12 animate-in fade-in duration-500">
      <div className="w-full max-w-[400px] flex flex-col items-center">
        {/* Logo Section */}
        <div className="mb-10 text-center animate-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 flex items-center justify-center mb-6 mx-auto overflow-hidden">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#1d1d1f]">Panel de Administración</h1>
          <p className="text-muted-foreground text-sm mt-2">Complejo Angostura · Gestión de Reservas</p>
        </div>

        {/* Card Section */}
        <div className="w-full bg-white/80 backdrop-blur-xl rounded-[28px] border border-white shadow-apple-xl p-8 animate-in slide-in-from-bottom-8 duration-1000">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Mail size={16} />
                  </div>
                  <Input
                    type="email"
                    placeholder="admin@complejo.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 bg-secondary/50 border-border focus:bg-white transition-all rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Contraseña</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Lock size={16} />
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 h-12 bg-secondary/50 border-border focus:bg-white transition-all rounded-xl"
                    required
                  />
                </div>
              </div>
            </div>

            {error && (
              <div className="bg-[#FFECEA] border border-[#FFD2D0] p-3 rounded-xl flex items-center gap-3 animate-in shake duration-300">
                <AlertCircle size={16} className="text-[#FF3B30] shrink-0" />
                <p className="text-[12px] font-semibold text-[#FF3B30]">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 bg-primary text-white font-bold rounded-xl shadow-apple-md hover:bg-primary/90 transition-all active:scale-[0.98]"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Iniciando sesión...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <LogIn size={18} />
                  <span>Entrar al Panel</span>
                </div>
              )}
            </Button>
          </form>
        </div>

        <p className="mt-8 text-xs text-muted-foreground font-medium text-center opacity-60">
          Protegido por Supabase Auth & Complejo Angostura Security.
        </p>
      </div>
    </div>
  );
}
