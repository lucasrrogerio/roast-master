import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TraceabilityResult } from '../types';
import { apiFetch } from '../services/api';
import { Search, MapPin, Flame, Package, Award, ArrowDown, User, Calendar, Thermometer, Clock, Sparkles } from 'lucide-react';

export const TraceabilityView: React.FC = () => {
  const [inputVal, setInputVal] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const {
    data: result,
    isLoading: loading,
    error,
  } = useQuery<TraceabilityResult>({
    queryKey: ['traceability', searchTerm],
    queryFn: () => apiFetch<TraceabilityResult>(`/traceability/${encodeURIComponent(searchTerm.trim())}`),
    enabled: searchTerm.trim().length > 0,
    retry: false,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    setSearchTerm(inputVal.trim());
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Rastreabilidade Completa</h2>
        <p className="text-sm text-stone-500">
          Pesquise pelo código impresso no pacote final e descubra toda a árvore genealógica: Torra, Grão Verde e Produtor.
        </p>
      </div>

      {/* Search Input Box */}
      <form onSubmit={handleSearch} className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Digite o código do lote do pacote (Ex: LOTE-PAC-2026-001)"
              className="w-full pl-11 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:outline-none text-stone-900 font-mono text-base font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold text-sm rounded-xl shadow-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Buscando...' : 'Rastrear Lote'}
          </button>
        </div>
      </form>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-sm font-semibold">
          ❌ {(error as any)?.message || 'Lote não localizado'}
        </div>
      )}

      {/* Timeline Flowchart Display */}
      {result && (
        <div className="space-y-4">
          {/* Step 1: Pacote Final (Prateleira) */}
          <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-amber-700 uppercase tracking-wider">Etapa 1: Pacote Final na Gôndola</span>
                <h3 className="text-xl font-black text-stone-900">{result.package.sku.name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
              <div>
                <span className="text-stone-400 block font-medium">Lote Pacote</span>
                <span className="font-mono font-bold text-stone-800 text-sm">{result.package.package_batch_code}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Peso Unitário</span>
                <span className="font-bold text-stone-800 text-sm">{result.package.sku.package_weight_g}g</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Unidades no Lote</span>
                <span className="font-bold text-stone-800 text-sm">{result.package.units_produced} un.</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Data Embalado</span>
                <span className="font-bold text-stone-800 text-sm">
                  {new Date(result.package.packaged_at).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
              <ArrowDown className="w-5 h-5" />
            </div>
          </div>

          {/* Step 2: Batida de Torra */}
          <div className="bg-white p-6 rounded-3xl border-2 border-stone-200 shadow-sm relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-800 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-orange-700 uppercase tracking-wider">Etapa 2: Batida de Torra</span>
                <h3 className="text-xl font-black text-stone-900">Torra: {result.roast.batch_code}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-100 mb-3">
              <div>
                <span className="text-stone-400 block font-medium">Perfil Aplicado</span>
                <span className="font-bold text-stone-800 text-sm">{result.roast.profile.name}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Mestre de Torra</span>
                <span className="font-bold text-stone-800 text-sm">{result.roast.roast_master.name}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Peso Inicial &rarr; Final</span>
                <span className="font-bold text-stone-800 text-sm">
                  {result.roast.initial_weight_kg}kg &rarr; {result.roast.final_weight_kg}kg
                </span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Quebra (%)</span>
                <span className="font-black text-emerald-700 text-sm">{result.roast.weight_loss_pct}%</span>
              </div>
            </div>

            {result.roast.profile.flavor_notes && (
              <p className="text-xs text-stone-600 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                <span className="font-bold text-amber-900">Notas de Prova da Receita:</span> {result.roast.profile.flavor_notes}
              </p>
            )}
          </div>

          {/* Connector Arrow */}
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-md">
              <ArrowDown className="w-5 h-5" />
            </div>
          </div>

          {/* Step 3: Grão Verde & Origem na Fazenda */}
          <div className="bg-white p-6 rounded-3xl border-2 border-emerald-300 shadow-sm relative bg-gradient-to-b from-white to-emerald-50/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black text-emerald-700 uppercase tracking-wider">Etapa 3: Origem & Fazenda Produtora</span>
                <h3 className="text-xl font-black text-stone-900">{result.greenBean.origin.farm_name}</h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
              <div>
                <span className="text-stone-400 block font-medium">Produtor Responsável</span>
                <span className="font-bold text-stone-800 text-sm">{result.greenBean.origin.producer}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Região / Terroir</span>
                <span className="font-bold text-stone-800 text-sm">{result.greenBean.origin.region}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Altitude</span>
                <span className="font-bold text-stone-800 text-sm">{result.greenBean.origin.altitude || 'N/A'} m</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Variedade Botânica</span>
                <span className="font-bold text-stone-800 text-sm">{result.greenBean.variety}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Processamento</span>
                <span className="font-bold text-stone-800 text-sm">{result.greenBean.process_method}</span>
              </div>
              <div>
                <span className="text-stone-400 block font-medium">Pontuação SCA</span>
                <span className="font-black text-amber-700 text-sm">{result.greenBean.sca_score || 'N/A'} pts</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
