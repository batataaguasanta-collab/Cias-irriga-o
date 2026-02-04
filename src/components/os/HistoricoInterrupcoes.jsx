import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp, Clock, Play } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function HistoricoInterrupcoes({ historico }) {
  const [expandido, setExpandido] = useState(false);

  if (!historico || historico.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-slate-200 pt-4 mt-4">
      <Button
        variant="ghost"
        onClick={() => setExpandido(!expandido)}
        className="w-full justify-between p-0 hover:bg-transparent"
      >
        <h4 className="text-sm font-bold text-slate-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-600" />
          Histórico de Interrupções ({historico.length})
        </h4>
        {expandido ? (
          <ChevronUp className="w-4 h-4 text-slate-500" />
        ) : (
          <ChevronDown className="w-4 h-4 text-slate-500" />
        )}
      </Button>

      {expandido && (
        <div className="mt-3 space-y-3">
          {historico.map((interrupcao, index) => (
            <Card key={index} className="bg-red-50 border-red-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div className="flex-1 space-y-2">
                    <div>
                      <p className="font-bold text-red-900">{interrupcao.motivo}</p>
                      {interrupcao.detalhe && (
                        <p className="text-sm text-red-800 mt-1">{interrupcao.detalhe}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-2 text-red-700">
                        <Clock className="w-3 h-3" />
                        <span className="font-medium">Parada:</span>
                        <span>
                          {format(new Date(interrupcao.data_interrupcao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </span>
                      </div>

                      {interrupcao.data_retomada && (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2 text-emerald-700">
                            <Play className="w-3 h-3" />
                            <span className="font-medium">Retomada:</span>
                            <span>
                              {format(new Date(interrupcao.data_retomada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                            </span>
                          </div>
                          {interrupcao.retomado_por && (
                            <div className="text-xs text-emerald-600 ml-5">
                              Por: {interrupcao.retomado_por}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {!interrupcao.data_retomada && (
                      <div className="bg-amber-100 border border-amber-300 rounded p-2 text-xs text-amber-900">
                        ⚠️ Aguardando retomada
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}