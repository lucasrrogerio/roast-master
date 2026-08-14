import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductSKU } from '../types';
import { apiFetch } from '../services/api';
import { Boxes, Plus, Edit2, X, AlertCircle, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProductsView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSku, setEditingSku] = useState<ProductSKU | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    sku_code: '',
    name: '',
    package_weight_g: '250',
    description: '',
    price: '35.00',
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'STOCKIST';

  const {
    data: products = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<ProductSKU[]>({
    queryKey: ['products'],
    queryFn: () => apiFetch<ProductSKU[]>('/products'),
  });

  const saveProductMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      if (editingSku) {
        return apiFetch(`/products/${editingSku.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
      return apiFetch('/products', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      setIsModalOpen(false);
      setEditingSku(null);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message);
    },
  });

  const handleOpenModal = (sku?: ProductSKU) => {
    setErrorMessage(null);
    if (sku) {
      setEditingSku(sku);
      setFormData({
        sku_code: sku.sku_code,
        name: sku.name,
        package_weight_g: String(sku.package_weight_g),
        description: sku.description || '',
        price: String(sku.price),
      });
    } else {
      setEditingSku(null);
      setFormData({
        sku_code: `SKU-${Math.floor(1000 + Math.random() * 9000)}`,
        name: '',
        package_weight_g: '250',
        description: 'Pacote especial com válvula desgaseificadora',
        price: '38.00',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    saveProductMutation.mutate(formData);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Produtos & SKUs</h2>
          <p className="text-sm text-stone-500">Cadastro de produtos acabados para comercialização (pacotes de 250g, 500g, 1Kg).</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-sm shadow-amber-900/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo SKU
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-stone-500">Carregando produtos...</div>
      ) : products.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
          Nenhum produto (SKU) cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((sku) => (
            <div
              key={sku.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
                    {sku.sku_code}
                  </span>
                  {canManage && (
                    <button
                      onClick={() => handleOpenModal(sku)}
                      className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <h3 className="font-bold text-stone-900 text-lg mt-3">{sku.name}</h3>
                {sku.description && (
                  <p className="text-xs text-stone-500 mt-1">{sku.description}</p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 block font-medium">Peso Pacote</span>
                    <span className="font-bold text-stone-800 text-sm">{sku.package_weight_g}g</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block font-medium">Preço Venda</span>
                    <span className="font-bold text-stone-800 text-sm">R$ {sku.price.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between">
                <span className="text-xs text-stone-400 font-medium">Estoque Pronto para Venda</span>
                <span className={`text-lg font-black ${sku.current_stock_units <= 10 ? 'text-red-600' : 'text-emerald-700'}`}>
                  {sku.current_stock_units} un.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                {editingSku ? 'Editar Produto (SKU)' : 'Novo Produto (SKU)'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-stone-400 hover:text-stone-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {(errorMessage || queryError) && (
              <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage || (queryError as any)?.message}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Código SKU</label>
                <input
                  type="text"
                  required
                  value={formData.sku_code}
                  onChange={(e) => setFormData({ ...formData, sku_code: e.target.value })}
                  placeholder="Ex: PROD-250G-BOURBON"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl font-mono text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nome do Produto</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Café Especial Bourbon 250g"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Peso Unitário (g)</label>
                  <input
                    type="number"
                    step="10"
                    required
                    value={formData.package_weight_g}
                    onChange={(e) => setFormData({ ...formData, package_weight_g: e.target.value })}
                    placeholder="250"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="38.00"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Descrição</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: Embalagem com zip lock e desgaseificação"
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
                  Salvar SKU
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
