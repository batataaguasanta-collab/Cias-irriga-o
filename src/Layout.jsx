import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Settings, History, Activity } from 'lucide-react';

export default function Layout({ children, currentPageName }) {
  // Pages that don't need navigation (have their own back buttons)
  const pagesWithoutNav = ['NovaOrdem', 'OperadorDashboard', 'Cadastros'];
  const showNav = !pagesWithoutNav.includes(currentPageName);

  return (
    <div className="min-h-screen bg-slate-50">
      {children}

      {/* Bottom Navigation */}
      {(currentPageName === 'Home' || currentPageName === 'HistoricoPivo' || currentPageName === 'AcompanhamentoIrrigacao') && (
        <nav className="fixed bottom-0 left-0 right-0 bg-emerald-700 border-t-4 border-emerald-600 shadow-2xl z-50">
          <div className="max-w-4xl mx-auto flex justify-around py-3">
            <Link
              to={createPageUrl('Home')}
              className={`flex flex-col items-center py-2 px-4 ${currentPageName === 'Home' ? 'text-white' : 'text-emerald-200 hover:text-white'
                }`}
            >
              <Home className="w-6 h-6" />
              <span className="text-xs mt-1 font-bold">Início</span>
            </Link>
            <Link
              to={createPageUrl('AcompanhamentoIrrigacao')}
              className={`flex flex-col items-center py-2 px-4 ${currentPageName === 'AcompanhamentoIrrigacao' ? 'text-white' : 'text-emerald-200 hover:text-white'
                }`}
            >
              <Activity className="w-6 h-6" />
              <span className="text-xs mt-1 font-semibold">Acompanhamento</span>
            </Link>
            <Link
              to={createPageUrl('HistoricoPivo')}
              className={`flex flex-col items-center py-2 px-4 ${currentPageName === 'HistoricoPivo' ? 'text-white' : 'text-emerald-200 hover:text-white'
                }`}
            >
              <History className="w-6 h-6" />
              <span className="text-xs mt-1 font-semibold">Histórico</span>
            </Link>
            <Link
              to={createPageUrl('Cadastros')}
              className="flex flex-col items-center py-2 px-4 text-emerald-200 hover:text-white"
            >
              <Settings className="w-6 h-6" />
              <span className="text-xs mt-1 font-semibold">Cadastros</span>
            </Link>
          </div>
        </nav>
      )}
    </div>
  );
}