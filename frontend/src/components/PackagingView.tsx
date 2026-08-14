import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PackagingBatch, ProductSKU, RoastBatch } from '../types';
import { apiFetch } from '../services/api';
import { PackagePlus, Plus, X, AlertCircle, Sparkles, Scale, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const PackagingView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    package_batch_code: '',
    roast_batch_id: '',
    product_sku_id: '',
    units_produced: '30',
    notes: '',
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'STOCKIST';

  const {
    data: packages = [],
    isLoading: loadingPackages,
    error: errorPackages,
  } = useQuery<PackagingBatch[]>({
    queryKey: ['packaging-batches'],
    queryFn: () => apiFetch<PackagingBatch[]>('/packaging-batches'),
  });

  const {
    data: roasts = [],
    isLoading: loadingRoasts,
  } = useQuery<RoastBatch[]>({
    queryKey: ['roast-batches'],
    queryFn: () => apiFetch<RoastBatch[]>('/roast-batches'),
  });

  const {
    data: skus = [],
    isLoading: loadingSkus,
  } = useQuery<ProductSKU[]>({
    queryKey: ['products'],
    queryFn: () => apiFetch<ProductSKU[]>('/products'),
  });

  const createPackagingMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      return apiFetch('/packaging-batches', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['packaging-batches'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
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
      package_batch_code: `PAC-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      roast_batch_id: roasts[0]?.id || '',
      product_sku_id: skus[0]?.id || '',
      units_produced: '30',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const selectedSku = skus.find((s) => s.id === formData.product_sku_id);
  const unitsNum = Number(formData.units_produced) || 0;
  const estimatedKgUsed = selectedSku ? ((selectedSku.package_weight_g * unitsNum) / 1000).toFixed(2) : '0.00';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    createPackagingMutation.mutate(formData);
  };

  const loading = loadingPackages || loadingRoasts || loadingSkus;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Empacotamento de Lotes</h2>
          <p className="text-sm text-stone-500">Transformação do café torrado em pacotes físicos fracionados com rastreabilidade.</p>
        </div>
        {canManage && (
          <button
            onClick={handleOpenModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-sm shadow-amber-900/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Empacotamento
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-stone-500">Carregando registros de empacotamento...</div>
      ) : packages.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
          Nenhum lote empacotado registrado.
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Lote do Pacote</th>
                  <th className="py-3.5 px-4">Origem da Torra (Lote)</th>
                  <th className="py-3.5 px-4">Produto (SKU)</th>
                  <th className="py-3.5 px-4 text-center">Unidades Produzidas</th>
                  <th className="py-3.5 px-4 text-right">Café Torrado Utilizado</th>
                  <th className="py-3.5 px-4 text-right">Data/Hora</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-sm">
                {packages.map((p) => (
                  <tr key={p.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      {p.package_batch_code}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-stone-600">
                      {p.roast_batch_code}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-stone-800">{p.sku_name}</span>
                      <span className="text-xs text-stone-400 block">({p.sku_code} - {p.package_weight_g}g)</span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold text-xs border border-emerald-200">
                        {p.units_produced} un.
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-stone-700">
                      {p.total_roasted_used_kg.toFixed(2)} Kg
                    </td>
                    <td className="py-3.5 px-4 text-right text-xs text-stone-500">
                      {new Date(p.packaged_at).toLocaleString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">Registrar Empacotamento</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(errorMessage || errorPackages) && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || (errorPackages as any)?.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Código do Lote no Pacote</label>
                <input
                  type="text"
                  required
                  value={formData.package_batch_code}
                  onChange={(e) => setFormData({ ...formData, package_batch_code: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Batida de Torra Utilizada</label>
                <select
                  required
                  value={formData.roast_batch_id}
                  onChange={(e) => setFormData({ ...formData, roast_batch_id: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {roasts.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.batch_code} - {r.green_variety} ({r.final_weight_kg.toFixed(2)} Kg torrado)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tipo de Pacote / SKU</label>
                <select
                  required
                  value={formData.product_sku_id}
                  onChange={(e) => setFormData({ ...formData, product_sku_id: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  {skus.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.package_weight_g}g)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Quantidade de Unidades Produzidas</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={formData.units_produced}
                  onChange={(e) => setFormData({ ...formData, units_produced: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center justify-between">
                <span>Café Torrado Estimado:</span>
                <span className="font-extrabold text-sm">{estimatedKgUsed} Kg</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Observações</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Ex: Embalado na máquina seladora 01"
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
                  Concluir Empacotamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
