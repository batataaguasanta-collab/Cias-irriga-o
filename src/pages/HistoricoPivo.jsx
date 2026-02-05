import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { getPivos, getOrdensByPivo } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ArrowLeft, Loader2, TrendingUp, Clock, AlertTriangle, CheckCircle2, Eye, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusBadge from '@/components/os/StatusBadge';
import bgImage from '../assets/bg-irrigation.jpg';

export default function HistoricoPivo() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [selectedPivoId, setSelectedPivoId] = useState('');
  const [interrupcoesModal, setInterrupcoesModal] = useState({ open: false, ordem: null });

  const { data: pivos = [], isLoading: isLoadingPivos, error: errorPivos } = useQuery({
    queryKey: ['pivos'],
    queryFn: async () => {
      const data = await getPivos();
      console.log('Pivôs carregados:', data);
      // Filtrar apenas pivôs com status 'Ativo'
      return data.filter(p => p.status === 'Ativo');
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
      backgroundImage: `url(${bgImage})`,
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
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto text-red-100 hover:bg-red-600 hover:text-white"
                onClick={async () => {
                  try {
                    await logout();
                    toast.success('Você saiu do sistema.');
                    navigate('/login');
                  } catch (error) {
                    console.error('Logout failed', error);
                    toast.error('Erro ao sair.');
                  }
                }}
                title="Sair do Sistema"
              >
                <LogOut className="w-6 h-6" />
              </Button>
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
              {isLoadingPivos ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-600 mr-2" />
                  <span className="text-slate-600">Carregando pivôs...</span>
                </div>
              ) : errorPivos ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-red-600 font-medium">Erro ao carregar pivôs</p>
                  <p className="text-sm text-slate-500 mt-1">Verifique a conexão com o banco de dados</p>
                </div>
              ) : pivos.length === 0 ? (
                <div className="px-4 py-6 text-center">
                  <p className="text-slate-700 font-medium">Nenhum pivô ativo cadastrado</p>
                  <p className="text-sm text-slate-500 mt-1">Cadastre um pivô primeiro na página de Cadastros</p>
                </div>
              ) : (
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
              )}
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

              {/* Tabela de Ordens */}
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
                <Card className="bg-white/95 backdrop-blur shadow-xl border-emerald-500 border-t-4">
                  <CardHeader>
                    <CardTitle className="text-emerald-900">Histórico de Irrigações</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-emerald-50 border-b-2 border-emerald-200">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">OS</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Data/Hora</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Parcela</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Volume</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Operador</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-emerald-900 uppercase tracking-wider">Movimentação</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-900 uppercase tracking-wider">Eficiência</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-900 uppercase tracking-wider">Interrupções</th>
                            <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-900 uppercase tracking-wider">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {ordens.map((ordem, index) => {
                            const eficiencia = ordem.data_efetiva_inicio ? (() => {
                              const inicio = new Date(ordem.data_efetiva_inicio);
                              const fim = ordem.data_conclusao ? new Date(ordem.data_conclusao) : new Date();
                              const tempoTotal = Math.floor((fim - inicio) / 1000);
                              const tempoParado = ordem.historico_interrupcoes?.reduce((acc, int) => {
                                const inicioInt = new Date(int.data_interrupcao);
                                const fimInt = int.data_retomada ? new Date(int.data_retomada) : new Date();
                                return acc + Math.floor((fimInt - inicioInt) / 1000);
                              }, 0) || 0;
                              const tempoIrrigando = tempoTotal - tempoParado;
                              return tempoTotal > 0 ? Math.round((tempoIrrigando / tempoTotal) * 100) : 0;
                            })() : null;

                            return (
                              <tr key={ordem.id} className={`hover:bg-emerald-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                <td className="px-4 py-3 text-sm font-semibold text-emerald-900">{ordem.numero_os}</td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {format(new Date(ordem.created_date), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                                </td>
                                <td className="px-4 py-3">
                                  <StatusBadge status={ordem.status} />
                                </td>
                                <td className="px-4 py-3 text-sm font-medium text-slate-900">{ordem.parcela}</td>
                                <td className="px-4 py-3 text-sm text-slate-700">
                                  {ordem.volume_valor}{ordem.volume_tipo === 'percentual' ? '%' : 'mm'}
                                </td>
                                <td className="px-4 py-3 text-sm text-slate-700">{ordem.operador_nome}</td>
                                <td className="px-4 py-3 text-sm text-slate-700">{ordem.movimentacao}</td>
                                <td className="px-4 py-3 text-center">
                                  {eficiencia !== null ? (
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${eficiencia >= 80 ? 'bg-emerald-100 text-emerald-800' :
                                      eficiencia >= 60 ? 'bg-amber-100 text-amber-800' :
                                        'bg-red-100 text-red-800'
                                      }`}>
                                      {eficiencia}%
                                    </span>
                                  ) : (
                                    <span className="text-xs text-slate-400">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  {ordem.historico_interrupcoes && ordem.historico_interrupcoes.length > 0 ? (
                                    <div className="flex items-center justify-center gap-2">
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                                        {ordem.historico_interrupcoes.length}
                                      </span>
                                      <button
                                        type="button"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          console.log('Clicou em interrupções:', ordem);
                                          setInterrupcoesModal({ open: true, ordem });
                                        }}
                                        className="p-1 hover:bg-amber-100 rounded transition-colors"
                                        title="Ver detalhes das interrupções"
                                      >
                                        <Eye className="w-4 h-4 text-amber-700" />
                                      </button>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-slate-400">0</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <Link
                                    to={`/OperadorDashboard?ordem=${ordem.id}`}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Ver Detalhes
                                  </Link>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </main>
      </div>

      {/* Modal de Detalhes das Interrupções */}
      <Dialog open={interrupcoesModal.open} onOpenChange={(open) => setInterrupcoesModal({ open, ordem: null })}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-emerald-900 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              Detalhes das Interrupções - OS: {interrupcoesModal.ordem?.numero_os}
            </DialogTitle>
            <DialogDescription className="text-slate-600">
              Visualize todas as interrupções registradas para esta ordem de serviço
            </DialogDescription>
          </DialogHeader>

          {interrupcoesModal.ordem?.historico_interrupcoes && interrupcoesModal.ordem.historico_interrupcoes.length > 0 ? (
            <div className="mt-4">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-amber-50 border-b-2 border-amber-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">Motivo</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">Observação</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">Início da Interrupção</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-amber-900 uppercase tracking-wider">Retomada</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-amber-900 uppercase tracking-wider">Tempo Parado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {interrupcoesModal.ordem.historico_interrupcoes.map((interrupcao, index) => {
                      const inicio = new Date(interrupcao.data_interrupcao);
                      const fim = interrupcao.data_retomada ? new Date(interrupcao.data_retomada) : null;
                      const tempoParado = fim ? Math.floor((fim - inicio) / 1000) : null;

                      const formatarTempo = (segundos) => {
                        if (!segundos) return '-';
                        const horas = Math.floor(segundos / 3600);
                        const minutos = Math.floor((segundos % 3600) / 60);
                        const segs = segundos % 60;
                        return `${horas}h ${minutos}m ${segs}s`;
                      };

                      return (
                        <tr key={index} className={`hover:bg-amber-50/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-700">{index + 1}</td>
                          <td className="px-4 py-3 text-sm text-slate-900 font-medium">
                            {interrupcao.motivo}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600 italic">
                            {interrupcao.detalhes || '-'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {format(inicio, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {fim ? (
                              format(fim, "dd/MM/yyyy 'às' HH:mm:ss", { locale: ptBR })
                            ) : (
                              <span className="text-amber-600 font-medium">Em andamento</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${tempoParado ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                              }`}>
                              {formatarTempo(tempoParado)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Resumo Total */}
              <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-700" />
                    <span className="font-semibold text-amber-900">Tempo Total Parado:</span>
                  </div>
                  <span className="text-lg font-bold text-amber-800">
                    {(() => {
                      const totalSegundos = interrupcoesModal.ordem.historico_interrupcoes.reduce((acc, int) => {
                        const inicio = new Date(int.data_interrupcao);
                        const fim = int.data_retomada ? new Date(int.data_retomada) : new Date();
                        return acc + Math.floor((fim - inicio) / 1000);
                      }, 0);
                      const horas = Math.floor(totalSegundos / 3600);
                      const minutos = Math.floor((totalSegundos % 3600) / 60);
                      const segs = totalSegundos % 60;
                      return `${horas}h ${minutos}m ${segs}s`;
                    })()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center text-slate-500">
              Nenhuma interrupção registrada para esta ordem.
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}