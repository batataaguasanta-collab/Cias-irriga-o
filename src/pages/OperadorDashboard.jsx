import React, { useState } from 'react';
import { getOrdemById, updateOrdem, getTalhoes } from '@/lib/supabase';
import { getCulturaIcon } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  MapPin,
  RotateCw,
  User,
  Calendar,
  Loader2,
  MessageSquare,
  Clock,
  Home,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import StatusBadge from '@/components/os/StatusBadge';
import PivotPositionIndicator from '@/components/os/PivoPositionsIndicator';
import ProgressoParcelaSelector from '@/components/os/ProgressoParcelaSelector';
import EficienciaPanel from '@/components/os/EficienciaPainel';
import { motion } from 'framer-motion';
import bgImage from '../assets/bg-irrigation.jpg';

export default function OperadorDashboard() {
  const urlParams = new URLSearchParams(window.location.search);
  const osId = urlParams.get('os_id') || urlParams.get('ordem'); // Aceita tanto os_id quanto ordem
  const { user } = useAuth();

  const queryClient = useQueryClient();
  const [showStopDialog, setShowStopDialog] = useState(false);
  const [motivoParada, setMotivoParada] = useState('');
  const [motivoParadaDetalhe, setMotivoParadaDetalhe] = useState('');
  const [saving, setSaving] = useState(false);
  const [interrupcoesModalOpen, setInterrupcoesModalOpen] = useState(false);

  const { data: ordem, isLoading } = useQuery({
    queryKey: ['ordem', osId],
    queryFn: async () => {
      if (!osId) return null;
      return await getOrdemById(osId);
    },
    enabled: !!osId,
  });

  const { data: talhoes } = useQuery({
    queryKey: ['talhoes'],
    queryFn: getTalhoes,
    enabled: !!ordem,
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updateOrdem(osId, data),
    onSuccess: () => queryClient.invalidateQueries(['ordem', osId]),
  });

  // Função para calcular progresso baseado no ângulo e parcela
  // Lógica solicitada: Setores de 60 graus
  const calculateProgressFromAngle = (angle, parcela) => {
    const p = parcela ? parcela.toUpperCase() : 'ALTA';

    // Ranges definidos pelo usuário
    if (p === 'ALTA' || p === 'TOTAL') {
      if (angle >= 0 && angle <= 60) return 'Início';
      if (angle >= 61 && angle <= 120) return 'Meio';
      if (angle >= 121 && angle <= 180) return 'Fim';
    }

    if (p === 'BAIXA' || p === 'TOTAL') {
      if (angle >= 181 && angle <= 240) return 'Início';
      if (angle >= 241 && angle <= 300) return 'Meio';
      if (angle >= 301 && angle <= 360) return 'Fim';
    }

    return null;
  };

  const handleUpdatePosition = (position) => {
    // Calcular progresso baseado no ângulo e parcela atual
    const newProgress = calculateProgressFromAngle(position, ordem.parcela);

    // Atualizar posição e progresso automaticamente
    updateMutation.mutate({
      posicao_atual: position,
      ...(newProgress && { progresso_parcela: newProgress })
    });
  };

  // Função para calcular ângulo central baseado no progresso e parcela
  // Considera a posição atual para decidir qual setor usar no caso de 'TOTAL'
  const calculateAngleFromProgress = (progresso, parcela, currentAngle = 0) => {
    const p = parcela ? parcela.toUpperCase() : 'ALTA';
    const isBaixa = currentAngle > 180;

    // Se for TOTAL, decide baseado na posição atual (se está na alta ou baixa)
    // Se for específico (ALTA ou BAIXA), força o setor correto
    const targetSector = p === 'TOTAL' ? (isBaixa ? 'BAIXA' : 'ALTA') : p;

    if (targetSector === 'ALTA') {
      if (progresso === 'Início') return 30;  // Centro: 0-60°
      if (progresso === 'Meio') return 90;    // Centro: 61-120°
      if (progresso === 'Fim') return 150;    // Centro: 121-180°
    } else if (targetSector === 'BAIXA') {
      if (progresso === 'Início') return 210; // Centro: 181-240°
      if (progresso === 'Meio') return 270;   // Centro: 241-300°
      if (progresso === 'Fim') return 330;    // Centro: 301-360°
    }
    return null;
  };

  const handleUpdateProgresso = (progresso) => {
    // Calcular ângulo baseado no progresso, parcela atual e posição atual
    const newAngle = calculateAngleFromProgress(progresso, ordem.parcela, ordem.posicao_atual);

    // Atualizar progresso e ângulo automaticamente
    updateMutation.mutate({
      progresso_parcela: progresso,
      ...(newAngle !== null && { posicao_atual: newAngle })
    });
  };

  const handleIniciar = async () => {
    setSaving(true);
    await updateMutation.mutateAsync({
      status: 'Em Andamento',
      data_efetiva_inicio: new Date().toISOString() // Mudança aqui: salva a data de start real
      // Não sobrescrevemos mais a data_inicio original (programada)
    });
    setSaving(false);
  };

  const handleConcluir = async () => {
    setSaving(true);
    await updateMutation.mutateAsync({
      status: 'Concluída',
      data_conclusao: new Date().toISOString()
    });
    setSaving(false);
  };

  const handleInterromper = () => {
    if (!motivoParada) {
      return;
    }

    // Adicionar ao histórico de interrupções
    const novaInterrupcao = {
      data_interrupcao: new Date().toISOString(),
      motivo: motivoParada,
      detalhe: motivoParadaDetalhe,
      data_retomada: null
    };

    const historicoAtual = ordem.historico_interrupcoes || [];

    updateMutation.mutate({
      status: 'Interrompida',
      motivo_parada: motivoParada,
      motivo_parada_detalhe: motivoParadaDetalhe,
      data_interrupcao: new Date().toISOString(),
      historico_interrupcoes: [...historicoAtual, novaInterrupcao]
    });

    setShowStopDialog(false);
    setMotivoParada('');
    setMotivoParadaDetalhe('');
  };

  const handleRetomar = async () => {
    setSaving(true);

    // Atualizar o último item do histórico com a data de retomada
    const historicoAtual = ordem.historico_interrupcoes || [];
    if (historicoAtual.length > 0) {
      const ultimaInterrupcao = historicoAtual[historicoAtual.length - 1];
      ultimaInterrupcao.data_retomada = new Date().toISOString();
      ultimaInterrupcao.retomado_por = user?.user_metadata?.full_name || user?.email;
      historicoAtual[historicoAtual.length - 1] = ultimaInterrupcao;
    }

    await updateMutation.mutateAsync({
      status: 'Em Andamento',
      data_retomada: new Date().toISOString(),
      historico_interrupcoes: historicoAtual
    });
    setSaving(false);
  };

  if (isLoading || !ordem) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  const isReadonly = ordem.status === 'Concluída';

  return (
    <div className="min-h-screen bg-slate-900 text-white" style={{
      backgroundImage: `url(${bgImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="min-h-screen bg-gradient-to-b from-emerald-900/60 via-emerald-800/50 to-slate-900/70">
        {/* Header - high visibility */}
        <header className="bg-emerald-700 border-b border-emerald-600 sticky top-0 z-50 shadow-lg">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <Link to={createPageUrl('Home')}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:bg-emerald-600" title="Início">
                    <Home className="w-6 h-6" />
                  </Button>
                </Link>
                <Link to={createPageUrl('AcompanhamentoIrrigacao')}>
                  <Button variant="ghost" size="icon" className="h-12 w-12 text-white hover:bg-emerald-600" title="Acompanhamento">
                    <Activity className="w-6 h-6" />
                  </Button>
                </Link>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white">Ordem de Irrigação</h1>
              </div>
              <StatusBadge status={ordem.status} size="large" />
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-40">
          {/* Order Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="bg-white/95 backdrop-blur border-emerald-500 border-t-4 shadow-2xl">
              <CardHeader className="border-b border-emerald-100 bg-gradient-to-r from-emerald-50 to-white">
                <CardTitle className="text-2xl text-emerald-900 flex items-center gap-3 font-bold">
                  <Droplets className="w-8 h-8 text-emerald-600" />
                  Pivô {ordem.pivo_numero}
                </CardTitle>
                <p className="text-emerald-700 text-sm font-semibold">OS: {ordem.numero_os}</p>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4 text-lg">
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl border border-indigo-200 col-span-2 sm:col-span-1">
                    <Calendar className="w-6 h-6 text-indigo-600" />
                    <div>
                      <span className="text-indigo-600 text-xs block font-medium">Início Programado</span>
                      <span className="font-bold text-indigo-900 text-sm">
                        {ordem.data_inicio ? format(new Date(ordem.data_inicio), 'dd/MM/yyyy') : '--/--/--'}
                        {ordem.hora_inicio ? ` às ${ordem.hora_inicio}` : ''}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl border border-emerald-200">
                    <MapPin className="w-6 h-6 text-emerald-600" />
                    <div>
                      <span className="text-emerald-600 text-xs block font-medium">Parcela</span>
                      <span className="font-bold text-emerald-900">{ordem.parcela}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                    <Droplets className="w-6 h-6 text-blue-600" />
                    <div>
                      <span className="text-blue-600 text-xs block font-medium">Volume</span>
                      <span className="font-bold text-blue-900">
                        {ordem.volume_valor}{ordem.volume_tipo === 'percentual' ? '%' : 'mm'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                    <RotateCw className="w-6 h-6 text-purple-600" />
                    <div>
                      <span className="text-purple-600 text-xs block font-medium">Sentido</span>
                      <span className="font-bold text-purple-900 text-sm">
                        {ordem.sentido_rotacao?.includes('Horário') ? 'Horário' : 'Anti-horário'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl border border-amber-200">
                    <User className="w-6 h-6 text-amber-600" />
                    <div>
                      <span className="text-amber-600 text-xs block font-medium">Operador</span>
                      <span className="font-bold text-amber-900 text-sm">{ordem.operador_nome}</span>
                    </div>
                  </div>

                  {/* Cultura Card */}
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-rose-50 to-rose-100 rounded-xl border border-rose-200">
                    <div className="text-2xl">
                      {(() => {
                        const talhao = talhoes?.find(t => t.pivo?.id === ordem.pivo_id); // Tenta achar talhão atual do pivô
                        return getCulturaIcon(talhao?.cultura?.nome);
                      })()}
                    </div>
                    <div>
                      <span className="text-rose-600 text-xs block font-medium">Cultura</span>
                      <span className="font-bold text-rose-900 text-sm">
                        {(() => {
                          const talhao = talhoes?.find(t => t.pivo?.id === ordem.pivo_id);
                          return talhao?.cultura?.nome || 'Não identificada';
                        })()}
                      </span>
                    </div>
                  </div>
                </div>

                {ordem.aplicar_insumos && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-500 rounded-lg">
                    <span className="text-purple-700 font-bold flex items-center gap-2">
                      🧪 Insumos Aplicados
                    </span>
                    <p className="text-purple-900 mt-2 font-medium">{ordem.insumos_descricao}</p>
                  </div>
                )}

                {ordem.observacoes && (
                  <div className="mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-slate-400 rounded-lg">
                    <span className="text-slate-700 font-bold flex items-center gap-2">
                      <MessageSquare className="w-5 h-5" /> Observações
                    </span>
                    <p className="text-slate-900 mt-2">{ordem.observacoes}</p>
                  </div>
                )}

                {/* Painel de Eficiência - Só mostra após clicar em Iniciar */}
                {ordem.data_efetiva_inicio && (
                  <EficienciaPanel
                    ordem={ordem}
                    onInterrupcoesClick={() => setInterrupcoesModalOpen(true)}
                  />
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Position Indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PivotPositionIndicator
              position={ordem.posicao_atual || 0}
              onChange={handleUpdatePosition}
              readonly={isReadonly}
              parcela={ordem.parcela}
            />
          </motion.div>

          {/* Progress Selector */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <ProgressoParcelaSelector
              value={ordem.progresso_parcela || 'Início'}
              onChange={handleUpdateProgresso}
              readonly={isReadonly}
              currentAngle={ordem.posicao_atual || 0}
              parcela={ordem.parcela}
            />
          </motion.div>

          {/* Alert Info (if interrupted) */}
          {ordem.status === 'Interrompida' && ordem.motivo_parada && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="bg-amber-50 border-amber-500 border-l-4 shadow-lg">
                <CardContent className="p-5">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-7 h-7 text-amber-600 mt-1" />
                    <div className="flex-1">
                      <h4 className="font-bold text-amber-800 text-lg">Operação Interrompida</h4>
                      <p className="text-amber-900 mt-2 font-bold text-base">{ordem.motivo_parada}</p>
                      {ordem.motivo_parada_detalhe && (
                        <p className="text-amber-800 mt-2 text-sm border-t border-amber-200 pt-2">
                          {ordem.motivo_parada_detalhe}
                        </p>
                      )}
                      {ordem.data_interrupcao && (
                        <p className="text-amber-600 text-xs mt-2">
                          Interrompida em: {format(new Date(ordem.data_interrupcao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </main>

        {/* Action Buttons - Fixed bottom */}
        {ordem.status !== 'Concluída' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t-4 border-emerald-500 p-4 shadow-2xl">
            <div className="max-w-2xl mx-auto">
              {ordem.status === 'Pendente' ? (
                <Button
                  onClick={handleIniciar}
                  disabled={saving}
                  className="w-full h-20 text-xl bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold shadow-xl"
                >
                  {saving ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-8 h-8 mr-3" />
                      INICIAR IRRIGAÇÃO
                    </>
                  )}
                </Button>
              ) : ordem.status === 'Interrompida' ? (
                <Button
                  onClick={handleRetomar}
                  disabled={saving}
                  className="w-full h-20 text-xl bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold shadow-xl"
                >
                  {saving ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : (
                    <>
                      <Play className="w-8 h-8 mr-3" />
                      RETOMAR IRRIGAÇÃO
                    </>
                  )}
                </Button>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => setShowStopDialog(true)}
                    disabled={saving}
                    className="h-20 text-lg bg-red-600 hover:bg-red-700 rounded-2xl font-bold shadow-xl"
                  >
                    <AlertTriangle className="w-7 h-7 mr-2" />
                    INTERROMPER
                  </Button>
                  <Button
                    onClick={handleConcluir}
                    disabled={saving}
                    className="h-20 text-lg bg-emerald-600 hover:bg-emerald-700 rounded-2xl font-bold shadow-xl"
                  >
                    {saving ? (
                      <Loader2 className="w-7 h-7 animate-spin" />
                    ) : (
                      <>
                        <CheckCircle2 className="w-7 h-7 mr-2" />
                        FINALIZAR
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stop Dialog */}
        <Dialog open={showStopDialog} onOpenChange={setShowStopDialog}>
          <DialogContent className="max-w-md bg-white">
            <DialogHeader>
              <DialogTitle className="text-xl">Interromper Operação</DialogTitle>
              <DialogDescription>
                Informe o motivo da interrupção da irrigação. Essas informações ficarão registradas no histórico.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="motivo">Motivo da Parada *</Label>
                <Select
                  value={motivoParada}
                  onValueChange={setMotivoParada}
                >
                  <SelectTrigger id="motivo" className="h-12 text-base">
                    <SelectValue placeholder="Selecione o motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Falta de energia">Falta de energia</SelectItem>
                    <SelectItem value="Falha mecânica">Falha mecânica</SelectItem>
                    <SelectItem value="Falta de água">Falta de água</SelectItem>
                    <SelectItem value="Condições climáticas">Condições climáticas</SelectItem>
                    <SelectItem value="Manutenção programada">Manutenção programada</SelectItem>
                    <SelectItem value="Emergência">Emergência</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {motivoParada && (
                <div>
                  <Label htmlFor="detalhe">Detalhes Adicionais (Opcional)</Label>
                  <Textarea
                    id="detalhe"
                    placeholder="Adicione informações complementares..."
                    value={motivoParadaDetalhe}
                    onChange={(e) => setMotivoParadaDetalhe(e.target.value)}
                    className="h-24 text-base"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowStopDialog(false);
                  setMotivoParada('');
                  setMotivoParadaDetalhe('');
                }}
                className="flex-1 h-12"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleInterromper}
                className="flex-1 h-12 bg-red-600 hover:bg-red-700 font-semibold"
              >
                Confirmar Interrupção
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Detalhes das Interrupções */}
        <Dialog open={interrupcoesModalOpen} onOpenChange={setInterrupcoesModalOpen}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-emerald-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                Detalhes das Interrupções - OS: {ordem?.numero_os}
              </DialogTitle>
              <DialogDescription className="text-slate-600">
                Visualize todas as interrupções registradas para esta ordem de serviço
              </DialogDescription>
            </DialogHeader>

            {ordem?.historico_interrupcoes && ordem.historico_interrupcoes.length > 0 ? (
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
                      {ordem.historico_interrupcoes.map((interrupcao, index) => {
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
                        const totalSegundos = ordem.historico_interrupcoes.reduce((acc, int) => {
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
    </div>
  );
}