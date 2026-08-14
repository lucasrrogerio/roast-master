import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { OriginsView } from './components/OriginsView';
import { GreenBeansView } from './components/GreenBeansView';
import { RoastProfilesView } from './components/RoastProfilesView';
import { RoastingView } from './components/RoastingView';
import { ProductsView } from './components/ProductsView';
import { PackagingView } from './components/PackagingView';
import { TraceabilityView } from './components/TraceabilityView';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [currentTab, setCurrentTab] = useState('dashboard');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center text-amber-500 font-bold text-lg">
        Carregando Roast Master Web...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="flex h-screen bg-stone-100 font-sans antialiased overflow-hidden">
      <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {currentTab === 'dashboard' && <DashboardView />}
          {currentTab === 'origins' && <OriginsView />}
          {currentTab === 'green-beans' && <GreenBeansView />}
          {currentTab === 'profiles' && <RoastProfilesView />}
          {currentTab === 'roasting' && <RoastingView />}
          {currentTab === 'products' && <ProductsView />}
          {currentTab === 'packaging' && <PackagingView />}
          {currentTab === 'traceability' && <TraceabilityView />}
        </div>
      </main>
    </div>
  );
};
