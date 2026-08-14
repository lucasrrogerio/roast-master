import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GreenBeanBatch, Origin } from '../types';
import { apiFetch } from '../services/api';
import { Sprout, Plus, X, AlertCircle, Award, Scale, DollarSign } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GreenBeansView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    batch_code: '',
    origin_id: '',
    variety: '',
    process_method: 'Natural',
    harvest_year: '2025/2026',
    moisture_pct: '11.0',
    sca_score: '84.0',
    initial_quantity_kg: '',
    cost_per_kg: '',
    notes: '',
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'STOCKIST';

  const {
    data: batches = [],
    isLoading: loadingBatches,
    error: errorBatches,
  } = useQuery<GreenBeanBatch[]>({
    queryKey: ['green-beans'],
    queryFn: () => apiFetch<GreenBeanBatch[]>('/green-beans'),
  });

  const {
    data: origins = [],
    isLoading: loadingOrigins,
  } = useQuery<Origin[]>({
    queryKey: ['origins'],
    queryFn: () => apiFetch<Origin[]>('/origins'),
  });

  const createBatchMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return apiFetch('/green-beans', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
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
    setFormData({
      batch_code: `GV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      origin_id: origins[0]?.id || '',
      variety: 'Bourbon Amarelo',
      process_method: 'Natural',
      harvest_year: '2025/2026',
      moisture_pct: '11.2',
      sca_score: '85.0',
      initial_quantity_kg: '60.0',
      cost_per_kg: '45.00',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    createBatchMutation.mutate(formData);
  };

  const loading = loadingBatches || loadingOrigins;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Estoque de Grão Cru</h2>
          <p className="text-sm text-stone-500">Gestão de sacas e lotes de café verde para abastecimento do torrador.</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-sm shadow-amber-900/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Entrada de Grão
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-stone-500">Carregando estoque de grãos verdes...</div>
      ) : batches.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
          Nenhum lote de grão cru cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {batches.map((batch) => {
            const stockPct = Math.round((batch.current_quantity_kg / batch.initial_quantity_kg) * 100);
            const isLow = batch.current_quantity_kg <= 20;

            return (
              <div
                key={batch.id}
                className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400/50 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg text-sm border border-amber-200/60">
                      {batch.batch_code}
                    </span>
                    {batch.sca_score && (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-800 border border-stone-200">
                        <Award className="w-3.5 h-3.5 text-amber-500" />
                        {batch.sca_score} SCA
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-stone-900 text-lg mt-3">{batch.variety}</h3>
                  <p className="text-xs text-stone-500 font-medium">
                    {batch.origin_name} • {batch.origin_farm_name}
                  </p>

                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                    <div>
                      <span className="text-stone-400 block font-medium">Processo</span>
                      <span className="font-semibold text-stone-700">{batch.process_method}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-medium">Safra</span>
                      <span className="font-semibold text-stone-700">{batch.harvest_year}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-medium">Umidade</span>
                      <span className="font-semibold text-stone-700">{batch.moisture_pct}%</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block font-medium">Custo / Kg</span>
                      <span className="font-semibold text-stone-700">R$ {batch.cost_per_kg.toFixed(2)}</span>
                    </div>
                  </div>

                  {batch.notes && (
                    <p className="mt-3 text-xs text-stone-600 italic bg-amber-50/40 p-2 rounded-lg border border-amber-100/50">
                      "{batch.notes}"
                    </p>
                  )}
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100">
                  <div className="flex justify-between items-end mb-1.5">
                    <div>
                      <span className="text-xs text-stone-400 font-medium block">Saldo Atual em Estoque</span>
                      <span className={`text-xl font-black ${isLow ? 'text-red-600' : 'text-stone-900'}`}>
                        {batch.current_quantity_kg.toFixed(1)} <span className="text-xs font-semibold text-stone-500">/ {batch.initial_quantity_kg} Kg</span>
                      </span>
                    </div>
                    <span className="text-xs font-bold text-stone-500">{stockPct}%</span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${isLow ? 'bg-red-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min(stockPct, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">Entrada de Grão Cru (Saca / Lote)</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(errorMessage || errorBatches) && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || (errorBatches as any)?.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Código do Lote</label>
                  <input
                    type="text"
                    required
                    value={formData.batch_code}
                    onChange={(e) => setFormData({ ...formData, batch_code: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Origem / Fazenda</label>
                  <select
                    required
                    value={formData.origin_id}
                    onChange={(e) => setFormData({ ...formData, origin_id: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    {origins.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.name} ({o.farm_name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Variedade</label>
                  <input
                    type="text"
                    required
                    value={formData.variety}
                    onChange={(e) => setFormData({ ...formData, variety: e.target.value })}
                    placeholder="Ex: Bourbon Amarelo"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Processamento</label>
                  <select
                    value={formData.process_method}
                    onChange={(e) => setFormData({ ...formData, process_method: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Natural">Natural</option>
                    <option value="Lavado (Washed)">Lavado (Washed)</option>
                    <option value="Honey / Cereja Descascado">Honey / CD</option>
                    <option value="Fermentação Anaeróbica">Fermentação Anaeróbica</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Safra</label>
                  <input
                    type="text"
                    required
                    value={formData.harvest_year}
                    onChange={(e) => setFormData({ ...formData, harvest_year: e.target.value })}
                    placeholder="2025/2026"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Umidade (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.moisture_pct}
                    onChange={(e) => setFormData({ ...formData, moisture_pct: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nota SCA</label>
                  <input
                    type="number"
                    step="0.25"
                    value={formData.sca_score}
                    onChange={(e) => setFormData({ ...formData, sca_score: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Quantidade Entrada (Kg)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.initial_quantity_kg}
                    onChange={(e) => setFormData({ ...formData, initial_quantity_kg: e.target.value })}
                    placeholder="60.0"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Custo por Kg (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={formData.cost_per_kg}
                    onChange={(e) => setFormData({ ...formData, cost_per_kg: e.target.value })}
                    placeholder="45.00"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Notas Sensoriais / Observações</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Grão peneira 16 acima, doçura alta, notas de caramelo"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-900/20"
                >
                  Registrar Entrada
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
