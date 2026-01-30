import React from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import NovaOSForm from '@/components/os/NovaOSForm';

export default function NovaOrdem() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="min-h-screen bg-gradient-to-b from-emerald-900/70 via-emerald-800/60 to-emerald-900/80">
        {/* Header */}
        <header className="bg-emerald-700 border-b border-emerald-600 sticky top-0 z-50 shadow-lg">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:bg-emerald-600">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                  <Droplets className="w-6 h-6 text-emerald-200" />
                  Nova Ordem de Serviço
                </h1>
                <p className="text-emerald-100 text-sm">Preencha os dados da irrigação</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-3xl mx-auto px-4 py-6 pb-32">
          <NovaOSForm 
            onSuccess={() => navigate(createPageUrl('Home'))}
            onCancel={() => navigate(createPageUrl('Home'))}
          />
        </main>
      </div>
    </div>
  );
}