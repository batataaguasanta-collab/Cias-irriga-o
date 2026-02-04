import React from 'react';
import { Clock, Play, Pause, CheckCircle2, TrendingUp } from 'lucide-react';
import { format, differenceInMinutes } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function EficienciaPanel({ ordem, onInterrupcoesClick }) {
  // Calcular métricas de eficiência
  const calcularEficiencia = () => {
    if (!ordem.data_efetiva_inicio) {
      return null;
    }

    const inicio = new Date(ordem.data_efetiva_inicio);
    const fim = ordem.data_conclusao ? new Date(ordem.data_conclusao) : new Date();
    const tempoTotalMinutos = differenceInMinutes(fim, inicio);

    // Calcular tempo parado
    let tempoParadoMinutos = 0;
    if (ordem.historico_interrupcoes && ordem.historico_interrupcoes.length > 0) {
      ordem.historico_interrupcoes.forEach(interrupcao => {
        const inicioParada = new Date(interrupcao.data_interrupcao);
        const fimParada = interrupcao.data_retomada
          ? new Date(interrupcao.data_retomada)
          : (ordem.status === 'Interrompida' ? new Date() : inicioParada);
        tempoParadoMinutos += differenceInMinutes(fimParada, inicioParada);
      });
    }

    const tempoIrrigandoMinutos = tempoTotalMinutos - tempoParadoMinutos;

    // Fórmula de Eficiência: EI = (TI / (TI + TP)) × 100
    // TI = Tempo Irrigando, TP = Tempo Parado
    const percentualEficiencia = (tempoIrrigandoMinutos + tempoParadoMinutos) > 0
      ? ((tempoIrrigandoMinutos / (tempoIrrigandoMinutos + tempoParadoMinutos)) * 100).toFixed(1)
      : 0;

    const numeroInterrupcoes = ordem.historico_interrupcoes?.length || 0;

    // Tempo médio de retomada
    let tempoMedioRetomada = 0;
    if (numeroInterrupcoes > 0) {
      const temposRetomada = ordem.historico_interrupcoes
        .filter(i => i.data_retomada)
        .map(i => differenceInMinutes(new Date(i.data_retomada), new Date(i.data_interrupcao)));

      if (temposRetomada.length > 0) {
        tempoMedioRetomada = Math.round(
          temposRetomada.reduce((a, b) => a + b, 0) / temposRetomada.length
        );
      }
    }

    return {
      tempoTotal: formatarTempo(tempoTotalMinutos),
      tempoIrrigando: formatarTempo(tempoIrrigandoMinutos),
      tempoParado: formatarTempo(tempoParadoMinutos),
      percentualEficiencia,
      numeroInterrupcoes,
      tempoMedioRetomada: formatarTempo(tempoMedioRetomada),
    };
  };

  const formatarTempo = (minutos) => {
    const totalSegundos = Math.round(minutos * 60);
    const horas = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const segs = totalSegundos % 60;

    if (horas > 0) {
      return `${horas}h ${mins}min ${segs}s`;
    } else if (mins > 0) {
      return `${mins}min ${segs}s`;
    } else {
      return `${segs}s`;
    }
  };

  const eficiencia = calcularEficiencia();

  if (!eficiencia) {
    return null;
  }

  const getCorEficiencia = (percentual) => {
    if (percentual >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (percentual >= 60) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
        <TrendingUp className="w-4 h-4" />
        Índice de Eficiência Operacional
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Horários */}
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Play className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-slate-600">Início Real</span>
          </div>
          <p className="text-sm font-bold text-slate-900">
            {format(new Date(ordem.data_efetiva_inicio), 'HH:mm', { locale: ptBR })}
          </p>
          <p className="text-xs text-slate-500">
            {format(new Date(ordem.data_efetiva_inicio), 'dd/MM/yyyy', { locale: ptBR })}
          </p>
        </div>

        {ordem.data_conclusao && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="text-xs text-slate-600">Conclusão</span>
            </div>
            <p className="text-sm font-bold text-slate-900">
              {format(new Date(ordem.data_conclusao), 'HH:mm', { locale: ptBR })}
            </p>
            <p className="text-xs text-slate-500">
              {format(new Date(ordem.data_conclusao), 'dd/MM/yyyy', { locale: ptBR })}
            </p>
          </div>
        )}

        {/* Tempos */}
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-xs text-blue-600">Tempo Total</span>
          </div>
          <p className="text-sm font-bold text-blue-900">{eficiencia.tempoTotal}</p>
        </div>

        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-emerald-600" />
            <span className="text-xs text-emerald-600">Irrigando</span>
          </div>
          <p className="text-sm font-bold text-emerald-900">{eficiencia.tempoIrrigando}</p>
        </div>

        <div className="bg-red-50 p-3 rounded-lg border border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <Pause className="w-4 h-4 text-red-600" />
            <span className="text-xs text-red-600">Parado</span>
          </div>
          <p className="text-sm font-bold text-red-900">{eficiencia.tempoParado}</p>
        </div>

        {/* Eficiência */}
        <div className={`p-3 rounded-lg border ${getCorEficiencia(parseFloat(eficiencia.percentualEficiencia))}`}>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-xs">Eficiência</span>
          </div>
          <p className="text-2xl font-bold">{eficiencia.percentualEficiencia}%</p>
        </div>
      </div>

      {/* Estatísticas de Interrupções */}
      {eficiencia.numeroInterrupcoes > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onInterrupcoesClick && onInterrupcoesClick()}
            className="bg-amber-50 p-3 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer text-left"
          >
            <span className="text-xs text-amber-600 block">Número de Interrupções</span>
            <p className="text-lg font-bold text-amber-900">{eficiencia.numeroInterrupcoes}</p>
          </button>
          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
            <span className="text-xs text-purple-600 block">Tempo Médio de Retomada</span>
            <p className="text-lg font-bold text-purple-900">{eficiencia.tempoMedioRetomada}</p>
          </div>
        </div>
      )}
    </div>
  );
}