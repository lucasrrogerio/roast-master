import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GreenBeanBatch, RoastBatch, RoastProfile } from '../types';
import { apiFetch } from '../services/api';
import { Flame, Plus, X, AlertCircle, TrendingDown, Scale, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RoastingView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form state optimized for factory tablets (mobile first & big buttons)
  const [formData, setFormData] = useState({
    batch_code: '',
    green_bean_batch_id: '',
    roast_profile_id: '',
    initial_weight_kg: '10.0',
    final_weight_kg: '8.5',
    notes: '',
  });

  const canRoast = user?.role === 'ADMIN' || user?.role === 'ROAST_MASTER';

  const {
    data: roasts = [],
    isLoading: loadingRoasts,
    error: errorRoasts,
  } = useQuery<RoastBatch[]>({
    queryKey: ['roast-batches'],
    queryFn: () => apiFetch<RoastBatch[]>('/roast-batches'),
  });

  const {
    data: greenBeans = [],
    isLoading: loadingGreen,
  } = useQuery<GreenBeanBatch[]>({
    queryKey: ['green-beans'],
    queryFn: () => apiFetch<GreenBeanBatch[]>('/green-beans'),
  });

  const {
    data: profiles = [],
    isLoading: loadingProfiles,
  } = useQuery<RoastProfile[]>({
    queryKey: ['roast-profiles'],
    queryFn: () => apiFetch<RoastProfile[]>('/roast-profiles'),
  });

  const createRoastMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return apiFetch('/roast-batches', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roast-batches'] });
      queryClient.invalidateQueries({ queryKey: ['green-beans'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message);
    },
  });

  const handleOpenModal = () => {
    setErrorMessage(null);
    const defaultGreen = greenBeans.find((g) => g.current_quantity_kg > 0) || greenBeans[0];
    setFormData({
      batch_code: `TORRA-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`,
      green_bean_batch_id: defaultGreen?.id || '',
      roast_profile_id: profiles[0]?.id || '',
      initial_weight_kg: '10.0',
      final_weight_kg: '8.5',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const selectedGreen = greenBeans.find((g) => g.id === formData.green_bean_batch_id);
  const initialNum = Number(formData.initial_weight_kg) || 0;
  const finalNum = Number(formData.final_weight_kg) || 0;
  const liveLossPct = initialNum > 0 && finalNum > 0 && finalNum <= initialNum
    ? Number((((initialNum - finalNum) / initialNum) * 100).toFixed(2))
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    createRoastMutation.mutate(formData);
  };

  const loading = loadingRoasts || loadingGreen || loadingProfiles;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Batidas de Torra (Roast Batches)</h2>
          <p className="text-sm text-stone-500">Registro operacional do chão de fábrica, cálculo de quebra e baixa automática.</p>
        </div>
        {canRoast && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-base shadow-md shadow-amber-900/30 transition-transform active:scale-95"
          >
            <Flame className="w-6 h-6" />
            Nova Batida de Torra
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-stone-500">Carregando batidas de torra...</div>
      ) : roasts.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
          Nenhuma batida de torra registrada.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Lote Torra</th>
                  <th className="py-3.5 px-4">Grão Cru Utilizado</th>
                  <th className="py-3.5 px-4">Perfil Aplicado</th>
                  <th className="py-3.5 px-4">Mestre Responsável</th>
                  <th className="py-3.5 px-4 text-right">Peso Inicial</th>
                  <th className="py-3.5 px-4 text-right">Peso Final</th>
                  <th className="py-3.5 px-4 text-center">Quebra (%)</th>
                  <th className="py-3.5 px-4 text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {roasts.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {r.batch_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-semibold text-stone-800">{r.green_variety}</p>
                      <p className="text-xs text-stone-400 font-mono">{r.green_batch_code} • {r.farm_name}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-1 rounded-md bg-stone-100 text-stone-700 font-medium text-xs">
                        {r.profile_name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600 font-medium">
                      {r.user_name}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-stone-600">
                      {r.initial_weight_kg.toFixed(2)} Kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-stone-900">
                      {r.final_weight_kg.toFixed(2)} Kg
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {r.weight_loss_pct}%
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-stone-500 font-medium">
                      {new Date(r.roasted_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roasting Modal (Mobile-first, Factory-friendly touch targets) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center">
                  <Flame className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-stone-900">Nova Batida de Torra</h3>
                  <p className="text-xs text-stone-500">Chão de fábrica - Registro com baixa atômica de estoque</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 rounded-xl">
                <X className="w-6 h-6" />
              </button>
            </div>

            {(errorMessage || errorRoasts) && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm flex items-center gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                <span className="font-semibold">{errorMessage || (errorRoasts as any)?.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  Código da Torra
                </label>
                <input
                  type="text"
                  required
                  value={formData.batch_code}
                  onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl font-mono text-base font-bold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  1. Selecionar Grão Cru (Matéria-prima)
                </label>
                <select
                  required
                  value={formData.green_bean_batch_id}
                  onChange={(e) => setFormData({ ...formData, green_bean_batch_id: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl text-base font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50"
                >
                  {greenBeans.map((g) => (
                    <option key={g.id} value={g.id} disabled={g.current_quantity_kg <= 0}>
                      {g.batch_code} - {g.variety} ({g.origin_name}) [Saldo: {g.current_quantity_kg.toFixed(1)} Kg]
                    </option>
                  ))}
                </select>
                {selectedGreen && (
                  <p className="text-xs text-stone-500 mt-1 font-medium">
                    Saldo disponível no lote: <span className="font-bold text-stone-800">{selectedGreen.current_quantity_kg.toFixed(2)} Kg</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                  2. Perfil de Torra (Receita)
                </label>
                <select
                  required
                  value={formData.roast_profile_id}
                  onChange={(e) => setFormData({ ...formData, roast_profile_id: e.target.value })}
                  className="w-full px-4 py-3 border border-stone-300 rounded-xl text-base font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none bg-stone-50"
                >
                  {profiles.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Carga: {p.charge_temp}°C / Drop: {p.drop_temp}°C)
                    </option>
                  ))}
                </select>
              </div>

              {/* High Contrast Weight Inputs for Mobile & Tablet */}
              <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-2xl border border-amber-200/60">
                <div>
                  <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">
                    Peso Inicial Verde (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={formData.initial_weight_kg}
                    onChange={(e) => setFormData({ ...formData, initial_weight_kg: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white border-2 border-amber-400 rounded-xl text-xl font-black text-stone-900 focus:outline-none focus:border-amber-600 text-center shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-extrabold text-amber-900 uppercase mb-1">
                    Peso Final Torrado (Kg)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    required
                    value={formData.final_weight_kg}
                    onChange={(e) => setFormData({ ...formData, final_weight_kg: e.target.value })}
                    className="w-full px-4 py-3.5 bg-white border-2 border-amber-400 rounded-xl text-xl font-black text-stone-900 focus:outline-none focus:border-amber-600 text-center shadow-inner"
                  />
                </div>
              </div>

              {/* Automatic Weight Loss Preview Card */}
              <div className="flex items-center justify-between p-4 bg-stone-900 rounded-2xl text-white">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-600">
                    <TrendingDown className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-xs text-stone-400 font-bold uppercase">Cálculo de Quebra</p>
                    <p className="text-xs text-stone-300">Perda de massa e umidade</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400">{liveLossPct}%</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Observações do Mestre</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Curva seguiu padrão estável, primeiro crack aos 9m15s"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-3 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-7 py-3.5 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-black text-base shadow-lg shadow-amber-900/30"
                >
                  Concluir & Debitar Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
