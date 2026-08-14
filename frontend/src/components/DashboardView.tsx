import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { DashboardStats } from '../types';
import { apiFetch } from '../services/api';
import { Flame, Scale, TrendingDown, AlertTriangle, Sprout, PackageCheck, Clock } from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    data: stats,
    isLoading: loading,
    error,
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: () => apiFetch<DashboardStats>('/dashboard/stats'),
    refetchInterval: 1000 * 30, // Auto refresh every 30s
  });

  if (loading) {
    return <div className="p-8 text-stone-500">Carregando painel de indicadores...</div>;
  }

  if (error || !stats) {
    return <div className="p-8 text-red-500">Erro: {(error as any)?.message || 'Sem dados disponíveis'}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-800 tracking-tight">Dashboard Gerencial</h2>
        <p className="text-sm text-stone-500">Acompanhamento da produção de torra e níveis de estoque.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Volume Torrado (Mês)</p>
            <p className="text-2xl font-black text-stone-800 mt-1">
              {stats.kpis.total_roasted_month_kg.toLocaleString('pt-BR')} <span className="text-sm font-medium text-stone-500">Kg</span>
            </p>
            <p className="text-xs text-stone-400 mt-1">Matéria-prima: {stats.kpis.total_initial_month_kg} Kg</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Batidas no Mês</p>
            <p className="text-2xl font-black text-stone-800 mt-1">
              {stats.kpis.total_roast_count_month}{' '}
              <span className="text-sm font-medium text-stone-500">execuções</span>
            </p>
            <p className="text-xs text-stone-400 mt-1">Torras concluídas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
            <Scale className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Perda Média (Quebra)</p>
            <p className="text-2xl font-black text-amber-700 mt-1">
              {stats.kpis.avg_weight_loss_pct}%
            </p>
            <p className="text-xs text-stone-400 mt-1">Perda esperada: 14% a 17%</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingDown className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider">Estoque Grão Verde</p>
            <p className="text-2xl font-black text-stone-800 mt-1">
              {stats.kpis.total_green_stock_kg.toLocaleString('pt-BR')} <span className="text-sm font-medium text-stone-500">Kg</span>
            </p>
            <p className="text-xs text-stone-400 mt-1">Disponível para torra</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
            <Sprout className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Green Beans */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-bold text-stone-800 text-base">Alerta: Grão Cru com Estoque Baixo (&le; 20kg)</h3>
          </div>
          {stats.alerts.low_green_beans.length === 0 ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium">
              ✅ Todos os lotes de grão cru estão com níveis saudáveis de estoque.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.alerts.low_green_beans.map((b) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <span className="font-bold text-stone-800 text-sm">{b.batch_code}</span>
                    <span className="text-xs text-stone-500 ml-2">({b.variety} - {b.origin_name})</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800 font-bold text-xs">
                    {b.current_quantity_kg} Kg restantes
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Low SKUs */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <PackageCheck className="w-5 h-5 text-red-500" />
            <h3 className="font-bold text-stone-800 text-base">Alerta: Pacotes para Venda Baixos (&le; 10 un)</h3>
          </div>
          {stats.alerts.low_product_skus.length === 0 ? (
            <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-sm font-medium">
              ✅ Prateleiras abastecidas! Nenhum SKU abaixo do nível de alerta.
            </div>
          ) : (
            <div className="space-y-2">
              {stats.alerts.low_product_skus.map((sku) => (
                <div key={sku.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-100">
                  <div>
                    <span className="font-bold text-stone-800 text-sm">{sku.name}</span>
                    <span className="text-xs text-stone-500 ml-2">({sku.sku_code})</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 font-bold text-xs">
                    {sku.current_stock_units} un. em estoque
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Breakdown by variety and recent roasts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Loss by variety */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="font-bold text-stone-800 text-base mb-4">Média de Quebra por Variedade de Grão</h3>
          <div className="space-y-3">
            {stats.loss_by_variety.length === 0 ? (
              <p className="text-sm text-stone-400">Nenhum dado de torra registrado ainda.</p>
            ) : (
              stats.loss_by_variety.map((item, idx) => (
                <div key={idx} className="p-3 bg-stone-50 rounded-xl">
                  <div className="flex justify-between items-center mb-1 text-sm">
                    <span className="font-semibold text-stone-800">{item.variety}</span>
                    <span className="font-bold text-amber-700">{item.avg_loss_pct}% perda</span>
                  </div>
                  <div className="w-full bg-stone-200 rounded-full h-2">
                    <div
                      className="bg-amber-600 h-2 rounded-full"
                      style={{ width: `${Math.min(item.avg_loss_pct * 4, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-stone-500 mt-1">
                    <span>{item.roasts_count} torras realizadas</span>
                    <span>{item.total_roasted_kg} Kg produzidos</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Roasts */}
        <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-sm">
          <h3 className="font-bold text-stone-800 text-base mb-4">Últimas Batidas de Torra</h3>
          <div className="space-y-3">
            {stats.recent_roasts.length === 0 ? (
              <p className="text-sm text-stone-400">Nenhuma torra recente.</p>
            ) : (
              stats.recent_roasts.map((r) => (
                <div key={r.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-stone-800 text-sm">{r.batch_code}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold">
                        {r.profile_name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-stone-500 mt-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(r.roasted_at).toLocaleDateString('pt-BR')}</span>
                      <span>• Mestre: {r.roast_master_name}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-stone-800 text-sm">{r.final_weight_kg} Kg</p>
                    <p className="text-xs font-semibold text-emerald-600">-{r.weight_loss_pct}% quebra</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
