import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Lock, Mail, AlertCircle, Coffee } from 'lucide-react';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao efetuar login');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (quickEmail: string, quickPass: string) => {
    setEmail(quickEmail);
    setPassword(quickPass);
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-600 shadow-lg shadow-amber-900/50 mb-4">
          <Flame className="w-9 h-9 text-white" />
        </div>
        <h2 className="text-3xl font-extrabold text-stone-100 tracking-tight">
          Roast Master Web
        </h2>
        <p className="mt-2 text-sm text-stone-400">
          Gestão de Produção e Rastreabilidade de Cafés Especiais
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-stone-800 py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-stone-700">
          {error && (
            <div className="mb-6 bg-red-900/50 border border-red-500/50 rounded-xl p-4 flex items-start gap-3 text-red-200">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <div className="text-sm font-medium">{error}</div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                E-mail
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-stone-900/80 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-medium"
                  placeholder="usuario@roastmaster.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-300 uppercase tracking-wider mb-2">
                Senha
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 bg-stone-900/80 border border-stone-700 rounded-xl text-stone-100 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-amber-600 hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Entrando...' : 'Entrar no Sistema'}
              </button>
            </div>
          </form>

          <div className="mt-8 border-t border-stone-700/80 pt-6">
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-3">
              Perfis de Teste Rápidos (Demonstração):
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleQuickLogin('admin@roastmaster.com', 'admin123')}
                className="p-2 text-xs bg-stone-900 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 text-center font-medium transition-colors"
              >
                👑 Admin
              </button>
              <button
                onClick={() => handleQuickLogin('mestre@roastmaster.com', 'roaster123')}
                className="p-2 text-xs bg-stone-900 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 text-center font-medium transition-colors"
              >
                🔥 Mestre
              </button>
              <button
                onClick={() => handleQuickLogin('estoque@roastmaster.com', 'stock123')}
                className="p-2 text-xs bg-stone-900 hover:bg-stone-700 text-stone-300 rounded-lg border border-stone-700 text-center font-medium transition-colors"
              >
                📦 Estoquista
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
