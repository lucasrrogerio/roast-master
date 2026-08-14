import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { RoastProfile } from '../types';
import { apiFetch } from '../services/api';
import { BookOpen, Plus, Edit2, Trash2, X, AlertCircle, Thermometer, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const RoastProfilesView: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<RoastProfile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    target_bean_variety: '',
    charge_temp: '',
    development_time_sec: '',
    drop_temp: '',
    target_agtron: '',
    flavor_notes: '',
  });

  const canManage = user?.role === 'ADMIN' || user?.role === 'ROAST_MASTER';

  const {
    data: profiles = [],
    isLoading: loading,
    error: queryError,
  } = useQuery<RoastProfile[]>({
    queryKey: ['roast-profiles'],
    queryFn: () => apiFetch<RoastProfile[]>('/roast-profiles'),
  });

  const saveProfileMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      if (editingProfile) {
        return apiFetch(`/roast-profiles/${editingProfile.id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      }
      return apiFetch('/roast-profiles', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roast-profiles'] });
      setIsModalOpen(false);
      setEditingProfile(null);
      setErrorMessage(null);
    },
    onError: (err: any) => {
      setErrorMessage(err.message);
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiFetch(`/roast-profiles/${id}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roast-profiles'] });
    },
    onError: (err: any) => {
      alert(`Erro: ${err.message}`);
    },
  });

  const handleOpenModal = (profile?: RoastProfile) => {
    setErrorMessage(null);
    if (profile) {
      setEditingProfile(profile);
      setFormData({
        name: profile.name,
        target_bean_variety: profile.target_bean_variety || '',
        charge_temp: String(profile.charge_temp),
        development_time_sec: String(profile.development_time_sec),
        drop_temp: String(profile.drop_temp),
        target_agtron: profile.target_agtron ? String(profile.target_agtron) : '',
        flavor_notes: profile.flavor_notes || '',
      });
    } else {
      setEditingProfile(null);
      setFormData({
        name: '',
        target_bean_variety: 'Bourbon Amarelo',
        charge_temp: '195.0',
        development_time_sec: '115',
        drop_temp: '206.5',
        target_agtron: '65',
        flavor_notes: 'Frutas amarelas, floral e final doce.',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    saveProfileMutation.mutate(formData);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir esta receita de torra?')) return;
    deleteProfileMutation.mutate(id);
  };

  const formatDevTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Perfis de Torra (Receitas)</h2>
          <p className="text-sm text-stone-500">Parâmetros de controle de curva, temperatura e tempo alvo padronizados.</p>
        </div>
        {canManage && (
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm shadow-sm shadow-amber-900/20 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Novo Perfil
          </button>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-stone-500">Carregando perfis de torra...</div>
      ) : profiles.length === 0 ? (
        <div className="bg-white p-8 rounded-2xl border border-stone-200 text-center text-stone-500">
          Nenhum perfil de torra cadastrado.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {profiles.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-amber-400/50 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <span className="w-10 h-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center font-bold">
                    <BookOpen className="w-5 h-5" />
                  </span>
                  {canManage && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenModal(p)}
                        className="p-1.5 text-stone-400 hover:text-amber-600 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="font-bold text-stone-900 text-lg mt-3">{p.name}</h3>
                {p.target_bean_variety && (
                  <p className="text-xs text-amber-700 font-semibold mt-0.5">Destinado: {p.target_bean_variety}</p>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100">
                  <div>
                    <span className="text-stone-400 flex items-center gap-1 font-medium">
                      <Thermometer className="w-3.5 h-3.5 text-amber-600" /> Carga
                    </span>
                    <span className="font-bold text-stone-800 text-sm">{p.charge_temp}°C</span>
                  </div>
                  <div>
                    <span className="text-stone-400 flex items-center gap-1 font-medium">
                      <Thermometer className="w-3.5 h-3.5 text-red-600" /> Drop (Final)
                    </span>
                    <span className="font-bold text-stone-800 text-sm">{p.drop_temp}°C</span>
                  </div>
                  <div>
                    <span className="text-stone-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5 text-blue-600" /> Tempo DTR
                    </span>
                    <span className="font-bold text-stone-800 text-sm">{formatDevTime(p.development_time_sec)}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 flex items-center gap-1 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Agtron Alvo
                    </span>
                    <span className="font-bold text-stone-800 text-sm">{p.target_agtron || 'N/A'}</span>
                  </div>
                </div>

                {p.flavor_notes && (
                  <div className="mt-3 p-2.5 rounded-xl bg-amber-50/50 border border-amber-100">
                    <p className="text-xs font-semibold text-amber-900 mb-0.5">Notas Esperadas:</p>
                    <p className="text-xs text-stone-600 italic">"{p.flavor_notes}"</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between pb-4 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900">
                {editingProfile ? 'Editar Perfil de Torra' : 'Nova Receita / Perfil'}
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
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Nome do Perfil</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Mantiqueira Filtrado Especial"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Variedade / Blend Destinado</label>
                <input
                  type="text"
                  value={formData.target_bean_variety}
                  onChange={(e) => setFormData({ ...formData, target_bean_variety: e.target.value })}
                  placeholder="Ex: Bourbon Amarelo ou Catuaí"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Temp. Carga (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.charge_temp}
                    onChange={(e) => setFormData({ ...formData, charge_temp: e.target.value })}
                    placeholder="195.0"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Temp. Drop Final (°C)</label>
                  <input
                    type="number"
                    step="0.5"
                    required
                    value={formData.drop_temp}
                    onChange={(e) => setFormData({ ...formData, drop_temp: e.target.value })}
                    placeholder="206.5"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Tempo DTR (segundos)</label>
                  <input
                    type="number"
                    required
                    value={formData.development_time_sec}
                    onChange={(e) => setFormData({ ...formData, development_time_sec: e.target.value })}
                    placeholder="Ex: 110 (1min 50s)"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Cor Agtron Alvo</label>
                  <input
                    type="number"
                    value={formData.target_agtron}
                    onChange={(e) => setFormData({ ...formData, target_agtron: e.target.value })}
                    placeholder="Ex: 65"
                    className="w-full px-3 py-2 border border-stone-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 uppercase mb-1">Notas Sensoriais de Prova</label>
                <textarea
                  rows={2}
                  value={formData.flavor_notes}
                  onChange={(e) => setFormData({ ...formData, flavor_notes: e.target.value })}
                  placeholder="Ex: Caramelo, notas florais, acidez málica equilibrada"
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
                  Salvar Perfil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
