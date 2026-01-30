import React, { useState } from 'react';
import { getPivos, getOrdensByPivo } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Loader2, TrendingUp, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusBadge from '@/components/os/StatusBadge';
import EficienciaPanel from '@/components/os/EficienciaPainel';
import HistoricoInterrupcoes from '@/components/os/HistoricoInterrupcoes';

export default function HistoricoPivo() {
  const [selectedPivoId, setSelectedPivoId] = useState('');

  const { data: pivos = [] } = useQuery({
    queryKey: ['pivos'],
    queryFn: async () => {
      const data = await getPivos();
      return data.filter(p => p.ativo);
    },
  });

  const { data: ordens = [], isLoading } = useQuery({
    queryKey: ['ordens-pivo', selectedPivoId],
    queryFn: () => getOrdensByPivo(selectedPivoId),
    enabled: !!selectedPivoId,
  });

  const selectedPivo = pivos.find(p => p.id === selectedPivoId);

  // Calcular estatísticas gerais
  const stats = {
    total: ordens.length,
    concluidas: ordens.filter(o => o.status === 'Concluída').length,
    emAndamento: ordens.filter(o => o.status === 'Em Andamento').length,
    interrompidas: ordens.filter(o => o.status === 'Interrompida').length,
    totalInterrupcoes: ordens.reduce((acc, o) => acc + (o.historico_interrupcoes?.length || 0), 0),
  };

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
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:bg-emerald-600">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-white">Histórico do Pivô</h1>
                <p className="text-emerald-100 text-sm mt-1">Análise de desempenho e rastreabilidade</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-32">
          {/* Seletor de Pivô */}
          <Card className="bg-white/95 backdrop-blur shadow-xl border-emerald-500 border-t-4">
            <CardHeader>
              <CardTitle className="text-emerald-900">Selecionar Pivô</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedPivoId} onValueChange={setSelectedPivoId}>
                <SelectTrigger className="h-14 text-lg">
                  <SelectValue placeholder="Escolha um pivô para ver o histórico" />
                </SelectTrigger>
                <SelectContent>
                  {pivos.map((pivo) => (
                    <SelectItem key={pivo.id} value={pivo.id} className="text-lg py-3">
                      Pivô {pivo.numero} - {pivo.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {selectedPivoId && (
            <>
              {/* Estatísticas Gerais */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <Card className="bg-white/95 backdrop-blur border-none shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center">
                      <TrendingUp className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-sm text-slate-600">Total de Ordens</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur border-none shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mb-2" />
                      <p className="text-sm text-slate-600">Concluídas</p>
                      <p className="text-3xl font-bold text-emerald-600">{stats.concluidas}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur border-none shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center">
                      <Clock className="w-8 h-8 text-blue-600 mb-2" />
                      <p className="text-sm text-slate-600">Em Andamento</p>
                      <p className="text-3xl font-bold text-blue-600">{stats.emAndamento}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur border-none shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="w-8 h-8 text-red-600 mb-2" />
                      <p className="text-sm text-slate-600">Interrompidas</p>
                      <p className="text-3xl font-bold text-red-600">{stats.interrompidas}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/95 backdrop-blur border-none shadow-lg">
                  <CardContent className="p-5">
                    <div className="flex flex-col items-center">
                      <AlertTriangle className="w-8 h-8 text-amber-600 mb-2" />
                      <p className="text-sm text-slate-600">Interrupções</p>
                      <p className="text-3xl font-bold text-amber-600">{stats.totalInterrupcoes}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Lista de Ordens */}
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                </div>
              ) : ordens.length === 0 ? (
                <Card className="bg-white/95 backdrop-blur shadow-xl">
                  <CardContent className="py-16 text-center">
                    <p className="text-slate-600 text-lg">Nenhuma ordem encontrada para este pivô</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {ordens.map((ordem) => (
                    <Card key={ordem.id} className="bg-white/95 backdrop-blur shadow-xl border-l-4 border-emerald-500">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-xl text-emerald-900 font-bold">
                              OS: {ordem.numero_os}
                            </CardTitle>
                            <p className="text-slate-600 text-sm mt-1">
                              {format(new Date(ordem.created_date), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </p>
                          </div>
                          <StatusBadge status={ordem.status} />
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-slate-500 block">Parcela</span>
                            <span className="font-semibold text-slate-900">{ordem.parcela}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Volume</span>
                            <span className="font-semibold text-slate-900">
                              {ordem.volume_valor}{ordem.volume_tipo === 'percentual' ? '%' : 'mm'}
                            </span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Operador</span>
                            <span className="font-semibold text-slate-900">{ordem.operador_nome}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Movimentação</span>
                            <span className="font-semibold text-slate-900">{ordem.movimentacao}</span>
                          </div>
                        </div>

                        {/* Painel de Eficiência */}
                        <EficienciaPanel ordem={ordem} />

                        {/* Histórico de Interrupções */}
                        {ordem.historico_interrupcoes && ordem.historico_interrupcoes.length > 0 && (
                          <HistoricoInterrupcoes historico={ordem.historico_interrupcoes} />
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}