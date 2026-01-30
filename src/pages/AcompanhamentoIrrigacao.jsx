import React, { useEffect } from 'react';
import { getOrdens } from '@/lib/supabase';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2, Droplets } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function AcompanhamentoIrrigacao() {
  const { data: ordensEmAndamento = [], isLoading, refetch } = useQuery({
    queryKey: ['ordens-em-andamento'],
    queryFn: async () => {
      const data = await getOrdens();
      return data.filter(o => o.status === 'Em Andamento');
    },
    refetchInterval: 10000, // Atualiza a cada 10 segundos
  });

  // Função para determinar posição A (Alta) ou B (Baixa) baseada no ângulo
  const determinarPosicao = (angulo) => {
    if (angulo >= 0 && angulo <= 180) return 'A';
    return 'B';
  };

  // Função para calcular percentual de progresso baseado no ângulo e parcela
  const calcularPercentual = (angulo, parcela) => {
    if (parcela === 'Total') {
      return ((angulo / 360) * 100).toFixed(0);
    } else if (parcela === 'Alta') {
      if (angulo >= 0 && angulo <= 180) {
        return ((angulo / 180) * 100).toFixed(0);
      }
      return 0;
    } else if (parcela === 'Baixa') {
      if (angulo >= 181 && angulo <= 360) {
        return (((angulo - 180) / 180) * 100).toFixed(0);
      }
      return 0;
    }
    return 0;
  };

  // Função para calcular tempo irrigando
  const calcularTempoIrrigando = (ordem) => {
    if (!ordem.data_inicio) return '-';

    const inicio = new Date(ordem.data_inicio);
    const agora = new Date();
    let tempoTotalMinutos = differenceInMinutes(agora, inicio);

    // Descontar tempo parado
    if (ordem.historico_interrupcoes && ordem.historico_interrupcoes.length > 0) {
      ordem.historico_interrupcoes.forEach(interrupcao => {
        const inicioParada = new Date(interrupcao.data_interrupcao);
        const fimParada = interrupcao.data_retomada
          ? new Date(interrupcao.data_retomada)
          : agora;
        tempoTotalMinutos -= differenceInMinutes(fimParada, inicioParada);
      });
    }

    if (tempoTotalMinutos < 60) return `${tempoTotalMinutos}min`;
    const horas = Math.floor(tempoTotalMinutos / 60);
    const mins = tempoTotalMinutos % 60;
    return `${horas}h ${mins}min`;
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
            <div className="flex items-center gap-3">
              <Droplets className="w-8 h-8 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">Acompanhamento de Irrigação</h1>
                <p className="text-emerald-100 text-sm mt-1">Monitoramento em tempo real</p>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 py-6 pb-32">
          <Card className="bg-white/95 backdrop-blur shadow-xl border-emerald-500 border-t-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-emerald-900 flex items-center gap-2">
                  <span className="text-2xl">Ordens em Andamento</span>
                  <span className="bg-blue-100 text-blue-700 text-lg px-3 py-1 rounded-full font-bold">
                    {ordensEmAndamento.length}
                  </span>
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
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
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-emerald-50">
                        <TableHead className="font-bold text-emerald-900">Pivô</TableHead>
                        <TableHead className="font-bold text-emerald-900">Parcela</TableHead>
                        <TableHead className="font-bold text-emerald-900">Ordem</TableHead>
                        <TableHead className="font-bold text-emerald-900 text-center">Ângulo</TableHead>
                        <TableHead className="font-bold text-emerald-900 text-center">Progresso</TableHead>
                        <TableHead className="font-bold text-emerald-900 text-center">Posição</TableHead>
                        <TableHead className="font-bold text-emerald-900">Operador</TableHead>
                        <TableHead className="font-bold text-emerald-900">Tempo Irrigando</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ordensEmAndamento.map((ordem) => {
                        const angulo = ordem.posicao_atual || 0;
                        const posicao = determinarPosicao(angulo);
                        const percentual = calcularPercentual(angulo, ordem.parcela);

                        return (
                          <TableRow key={ordem.id} className="hover:bg-emerald-50 transition-colors">
                            <TableCell className="font-semibold text-emerald-900">
                              Pivô {ordem.pivo_numero}
                            </TableCell>
                            <TableCell>
                              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">
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
                                <span className="font-bold text-emerald-900">{percentual}%</span>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
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
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}