import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';
import { getOrdens } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link, useNavigate } from 'react-router-dom';
import { Loader2, Droplets, Eye, AlertTriangle, ArrowLeft, LogOut } from 'lucide-react';
import { differenceInMinutes } from 'date-fns';
import bgImage from '../assets/bg-irrigation.jpg';
import { createPageUrl } from '../utils';
import { Button } from "@/components/ui/button";

export default function AcompanhamentoIrrigacao() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { data: todasOrdens = [], isLoading, refetch } = useQuery({
    queryKey: ['todas-ordens'],
    queryFn: async () => {
      const data = await getOrdens();
      return data;
    },
    refetchInterval: 10000,
  });

  const ordensEmAndamento = todasOrdens.filter(o => o.status === 'Em Andamento');
  const ordensInterrompidas = todasOrdens.filter(o => o.status === 'Interrompida');

  // Função para determinar posição A (Alta) ou B (Baixa) baseada no ângulo
  const determinarPosicao = (angulo) => {
    if (angulo >= 0 && angulo <= 180) return 'A';
    return 'B';
  };

  // Função para calcular percentual de progresso
  const calcularPercentual = (angulo, parcela) => {
    const parcelaUpper = parcela?.toUpperCase() || '';

    if (parcelaUpper === 'TOTAL') {
      return ((angulo / 360) * 100).toFixed(0);
    } else if (parcelaUpper === 'ALTA') {
      if (angulo >= 0 && angulo <= 180) {
        return ((angulo / 180) * 100).toFixed(0);
      }
      return '100';
    } else if (parcelaUpper === 'BAIXA') {
      if (angulo > 180 && angulo <= 360) {
        return (((angulo - 180) / 180) * 100).toFixed(0);
      }
      if (angulo <= 180) return '0';
      return '100';
    }
    return 0;
  };

  // Função para calcular tempo irrigando com desconto de paradas
  const calcularTempoIrrigando = (ordem) => {
    if (!ordem.data_inicio) return '-';

    const inicio = new Date(ordem.data_inicio);
    const agora = new Date();
    let tempoTotalMinutos = differenceInMinutes(agora, inicio);

    // Descontar tempo parado para todas as interrupções (inclusive a atual se estiver parada)
    if (ordem.historico_interrupcoes && ordem.historico_interrupcoes.length > 0) {
      ordem.historico_interrupcoes.forEach(interrupcao => {
        const inicioParada = new Date(interrupcao.data_interrupcao);
        const fimParada = interrupcao.data_retomada
          ? new Date(interrupcao.data_retomada)
          : agora; // Se não tem retomada, conta até agora
        tempoTotalMinutos -= differenceInMinutes(fimParada, inicioParada);
      });
    }

    if (tempoTotalMinutos < 0) tempoTotalMinutos = 0; // Evitar negativo se relógio variar

    if (tempoTotalMinutos < 60) return `${tempoTotalMinutos}min`;
    const horas = Math.floor(tempoTotalMinutos / 60);
    const mins = tempoTotalMinutos % 60;
    return `${horas}h ${mins}min`;
  };

  const renderTable = (ordens, type) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className={`${type === 'interrompida' ? 'bg-amber-50' : 'bg-emerald-50'}`}>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'}`}>Pivô</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'}`}>Parcela</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'}`}>Ordem</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'} text-center`}>Ângulo</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'} text-center`}>Progresso</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'} text-center`}>Posição</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'}`}>Operador</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'}`}>Tempo Líquido</TableHead>
            <TableHead className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'} text-center`}>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {ordens.map((ordem) => {
            const angulo = ordem.posicao_atual || 0;
            const posicao = determinarPosicao(angulo);
            const percentual = calcularPercentual(angulo, ordem.parcela);

            return (
              <TableRow key={ordem.id} className={`${type === 'interrompida' ? 'hover:bg-amber-50' : 'hover:bg-emerald-50'} transition-colors`}>
                <TableCell className={`font-semibold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'}`}>
                  Pivô {ordem.pivo_numero}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${type === 'interrompida' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {ordem.parcela}
                  </span>
                </TableCell>
                <TableCell className="font-mono text-sm text-slate-700">
                  {ordem.numero_os}
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-bold text-purple-900">{angulo}°</span>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    <span className={`font-bold ${type === 'interrompida' ? 'text-amber-900' : 'text-emerald-900'}`}>{percentual}%</span>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-300 ${type === 'interrompida' ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${percentual}%` }}
                      />
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className={`inline-flex items-center justify-center w-10 h-10 rounded-full text-xl font-bold ${posicao === 'A'
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                    : 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                    }`}>
                    {posicao}
                  </span>
                </TableCell>
                <TableCell className="text-slate-700">
                  {ordem.operador_nome}
                </TableCell>
                <TableCell>
                  <span className="font-semibold text-blue-900">
                    {calcularTempoIrrigando(ordem)}
                  </span>
                </TableCell>
                <TableCell className="text-center">
                  <Link
                    to={`${createPageUrl('OperadorDashboard')}?os_id=${ordem.id}`}
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full transition-colors ${type === 'interrompida' ? 'bg-amber-100 text-amber-600 hover:bg-amber-200 hover:text-amber-800' : 'bg-emerald-100 text-emerald-600 hover:bg-emerald-200 hover:text-emerald-800'}`}
                    title="Ver Detalhes"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );

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
                <Button variant="ghost" size="icon" className="text-white hover:bg-emerald-600/50 hover:text-white">
                  <ArrowLeft className="w-6 h-6" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <Droplets className="w-8 h-8 text-white" />
                <div>
                  <h1 className="text-3xl font-bold text-white">Acompanhamento de Irrigação</h1>
                  <p className="text-emerald-100 text-sm mt-1">Monitoramento em tempo real</p>
                </div>
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

        <main className="max-w-7xl mx-auto px-4 py-6 pb-32 space-y-6">
          {/* Ordens em Andamento */}
          <Card className="bg-white/95 backdrop-blur shadow-xl border-emerald-500 border-t-4 max-h-[45vh] flex flex-col">
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <span className="text-2xl">Ordens em Andamento</span>
                  <span className="bg-blue-100 text-blue-700 text-lg px-3 py-1 rounded-full font-bold">
                    {ordensEmAndamento.length}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                </div>
              ) : ordensEmAndamento.length === 0 ? (
                <div className="text-center py-16">
                  <Droplets className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">Nenhuma irrigação em andamento no momento</p>
                </div>
              ) : (
                renderTable(ordensEmAndamento, 'andamento')
              )}
            </CardContent>
          </Card>

          {/* Ordens Interrompidas */}
          <Card className="bg-white/95 backdrop-blur shadow-xl border-amber-500 border-t-4 max-h-[45vh] flex flex-col">
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-amber-900 flex items-center gap-2">
                  <span className="text-2xl">Ordens Interrompidas</span>
                  <span className="bg-amber-100 text-amber-700 text-lg px-3 py-1 rounded-full font-bold">
                    {ordensInterrompidas.length}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="overflow-y-auto flex-1 p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
                </div>
              ) : ordensInterrompidas.length === 0 ? (
                <div className="text-center py-16">
                  <AlertTriangle className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-600 text-lg">Nenhuma ordem interrompida no momento</p>
                </div>
              ) : (
                renderTable(ordensInterrompidas, 'interrompida')
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}