import React, { useState, useEffect } from 'react';
import { getOrdens } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Droplets,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Filter,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import OSCard from '@/components/os/OSCard';
import { motion, AnimatePresence } from 'framer-motion';

export default function Home() {
  const [statusFilter, setStatusFilter] = useState('todas');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: ordens = [], isLoading, refetch } = useQuery({
    queryKey: ['ordens'],
    queryFn: () => getOrdens(100),
  });

  const stats = {
    total: ordens.length,
    pendentes: ordens.filter(o => o.status === 'Pendente').length,
    emAndamento: ordens.filter(o => o.status === 'Em Andamento').length,
    concluidas: ordens.filter(o => o.status === 'Concluída').length,
    interrompidas: ordens.filter(o => o.status === 'Interrompida').length,
  };

  const filteredOrdens = ordens.filter(ordem => {
    const matchStatus = statusFilter === 'todas' || ordem.status === statusFilter;
    const matchSearch = !searchTerm ||
      ordem.pivo_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.operador_nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.numero_os?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  const StatCard = ({ title, value, icon: Icon, color, bgColor }) => (
    <Card className={`${bgColor} border-none shadow-lg`}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-600">{title}</p>
            <p className={`text-3xl font-bold mt-1 ${color}`}>{value}</p>
          </div>
          <div className={`p-3 rounded-xl bg-white/50`}>
            <Icon className={`w-6 h-6 ${color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="min-h-screen bg-gradient-to-b from-emerald-900/60 via-emerald-800/50 to-emerald-900/70 backdrop-blur-[2px]">
        {/* Header */}
        <header className="bg-emerald-700 border-b border-emerald-600 sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 py-5">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-2">
                  CIAS
                </h1>
                <p className="text-emerald-100 text-sm mt-1">Sistema de Irrigação</p>
              </div>
              <Link to={createPageUrl('NovaOrdem')}>
                <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 h-14 px-8 text-lg shadow-xl font-bold">
                  <Plus className="w-6 h-6 mr-2" />
                  Nova Ordem
                </Button>
              </Link>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Pendentes"
              value={stats.pendentes}
              icon={Clock}
              color="text-amber-600"
              bgColor="bg-white/95 backdrop-blur"
            />
            <StatCard
              title="Em Andamento"
              value={stats.emAndamento}
              icon={RefreshCw}
              color="text-blue-600"
              bgColor="bg-white/95 backdrop-blur"
            />
            <StatCard
              title="Concluídas"
              value={stats.concluidas}
              icon={CheckCircle2}
              color="text-emerald-600"
              bgColor="bg-white/95 backdrop-blur"
            />
            <StatCard
              title="Interrompidas"
              value={stats.interrompidas}
              icon={AlertTriangle}
              color="text-red-600"
              bgColor="bg-white/95 backdrop-blur"
            />
          </div>

          {/* Filters */}
          <Card className="border-none shadow-xl bg-white/95 backdrop-blur">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <Input
                    placeholder="Buscar por pivô, operador ou número da OS..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                <Button variant="outline" size="lg" onClick={() => refetch()} className="h-12 bg-white">
                  <RefreshCw className="w-5 h-5" />
                </Button>
              </div>

              <div className="mt-4 overflow-x-auto">
                <Tabs value={statusFilter} onValueChange={setStatusFilter}>
                  <TabsList className="bg-emerald-100 p-1 h-auto flex-wrap">
                    <TabsTrigger value="todas" className="text-base py-2 px-4 data-[state=active]:bg-emerald-600 data-[state=active]:text-white">
                      Todas ({stats.total})
                    </TabsTrigger>
                    <TabsTrigger value="Pendente" className="text-base py-2 px-4 data-[state=active]:bg-amber-500 data-[state=active]:text-white">
                      Pendentes ({stats.pendentes})
                    </TabsTrigger>
                    <TabsTrigger value="Em Andamento" className="text-base py-2 px-4 data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                      Em Andamento ({stats.emAndamento})
                    </TabsTrigger>
                    <TabsTrigger value="Concluída" className="text-base py-2 px-4 data-[state=active]:bg-emerald-500 data-[state=active]:text-white">
                      Concluídas ({stats.concluidas})
                    </TabsTrigger>
                    <TabsTrigger value="Interrompida" className="text-base py-2 px-4 data-[state=active]:bg-red-500 data-[state=active]:text-white">
                      Interrompidas ({stats.interrompidas})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardContent>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <RefreshCw className="w-10 h-10 text-blue-500 animate-spin" />
                <p className="text-slate-500 mt-4 text-lg">Carregando ordens...</p>
              </div>
            ) : filteredOrdens.length === 0 ? (
              <Card className="border-dashed border-2 border-white/30 bg-white/95 backdrop-blur">
                <CardContent className="py-16 text-center">
                  <Droplets className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-slate-700 mb-2">
                    Nenhuma ordem encontrada
                  </h3>
                  <p className="text-slate-600 mb-6">
                    {searchTerm || statusFilter !== 'todas'
                      ? 'Tente ajustar os filtros de busca'
                      : 'Comece criando uma nova ordem de serviço'}
                  </p>
                  <Link to={createPageUrl('NovaOrdem')}>
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Plus className="w-5 h-5 mr-2" />
                      Criar Primeira Ordem
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {filteredOrdens.map((ordem, index) => (
                  <motion.div
                    key={ordem.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <OSCard ordem={ordem} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}