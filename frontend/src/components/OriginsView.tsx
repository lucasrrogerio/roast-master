import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Origin } from '../types';
import { apiFetch } from '../services/api';
import { MapPin, Plus, Edit2, Trash2, X, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const OriginsView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrigin, setEditingOrigin] = useState<Origin | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    producer: '',
    region: '',
    farm_name: '',
    altitude: '',
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'STOCKIST';

  const {
    data: origins = [],
    isLoading,
    error: queryError,
  } = useQuery<Origin[]>({
    queryKey: ['origins'],
    queryFn: () => apiFetch<Origin[]>('/origins'),
  });

  const saveMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      if (editingOrigin) {
        return apiFetch(`/origins/${editingOrigin.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
      return apiFetch('/origins', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['origins'] });
      handleCloseModal();
    },
    onError: (err: any) => {
      setErrorMessage(err.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/origins/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['origins'] });
    },
    onError: (err: any) => {
      alert(`Erro: ${err.message}`);
    },
  });

  const handleOpenModal = (origin?: Origin) => {
    setErrorMessage(null);
    if (origin) {
      setEditingOrigin(origin);
      setFormData({
        name: origin.name,
        producer: origin.producer,
        region: origin.region,
        farm_name: origin.farm_name,
        altitude: origin.altitude ? String(origin.altitude) : '',
      });
    } else {
      setEditingOrigin(null);
      setFormData({
        name: '',
        producer: '',
        region: '',
        farm_name: '',
        altitude: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingOrigin(null);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    saveMutation.mutate(formData);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir esta origem?')) return;
    deleteMutation.mutate(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Origens & Produtores</h2>
          <p className="text-sm text-stone-500">Cadastro de fazendas parceiras e fornecedores de café verde.</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-sm shadow-amber-900/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nova Origem
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="p-8 text-stone-500">Carregando origens...</div>
      ) : origins.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
          Nenhuma origem cadastrada ainda.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {origins.map((origin) => (
            <div
              key={origin.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <MapPin className="w-5 h-5" />
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(origin)}
                        className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(origin.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-stone-900 text-lg mt-3">{origin.name}</h3>
                <div className="mt-2 space-y-1 text-sm text-stone-600">
                  <p><span className="font-medium text-stone-400">Produtor:</span> {origin.producer}</p>
                  <p><span className="font-medium text-stone-400">Fazenda:</span> {origin.farm_name}</p>
                  <p><span className="font-medium text-stone-400">Região:</span> {origin.region}</p>
                  {origin.altitude && (
                    <p><span className="font-medium text-stone-400">Altitude:</span> {origin.altitude}m</p>
                  )}
                </div>
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
                {editingOrigin ? 'Editar Origem' : 'Cadastrar Nova Origem'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-stone-400 hover:text-stone-700 rounded-lg">
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
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Título de Identificação</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Fazenda Sertão - Sul de Minas"
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Produtor</label>
                  <input
                    type="text"
                    required
                    value={formData.producer}
                    onChange={(e) => setFormData({ ...formData, producer: e.target.value })}
                    placeholder="Ex: Nazareth Dias"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Fazenda/Sítio</label>
                  <input
                    type="text"
                    required
                    value={formData.farm_name}
                    onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                    placeholder="Ex: Fazenda Sertão"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Região / Cidade</label>
                  <input
                    type="text"
                    required
                    value={formData.region}
                    onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    placeholder="Ex: Carmo de Minas, MG"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Altitude (m)</label>
                  <input
                    type="number"
                    value={formData.altitude}
                    onChange={(e) => setFormData({ ...formData, altitude: e.target.value })}
                    placeholder="Ex: 1250"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-sm hover:bg-stone-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-md shadow-amber-900/20"
                >
                  {editingOrigin ? 'Salvar Alterações' : 'Cadastrar Origem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
