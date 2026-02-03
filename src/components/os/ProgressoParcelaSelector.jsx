import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ProgressoParcelaSelector({ value, onChange, readonly, parcela, currentAngle = 0 }) {
  const options = ['Início', 'Meio', 'Fim'];
  const parcelaNorm = parcela ? parcela.toUpperCase() : 'ALTA';

  // Determinar zona atual para TOTAL
  let zonaAtual = null;
  if (parcelaNorm === 'TOTAL') {
    zonaAtual = currentAngle > 180 ? 'BAIXA' : 'ALTA';
  }

  return (
    <Card className="bg-white/95 backdrop-blur border-blue-500 border-t-4 shadow-xl">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-white">
        <CardTitle className="text-blue-900 text-lg font-bold text-center flex items-center justify-center gap-2">
          Progresso da Parcela
          {zonaAtual && (
            <span className={`text-xs px-2 py-1 rounded-full border ${zonaAtual === 'ALTA'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-purple-100 text-purple-700 border-purple-200'
              }`}>
              {zonaAtual === 'ALTA' ? 'Setor ALTA' : 'Setor BAIXA'}
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="flex gap-2">
          {options.map((opt) => (
            <Button
              key={opt}
              variant={value === opt ? "default" : "outline"}
              className={`flex-1 h-12 text-lg font-semibold ${value === opt
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'text-slate-600 hover:text-blue-600'
                }`}
              onClick={() => !readonly && onChange(opt)}
              disabled={readonly}
            >
              {opt}
            </Button>
          ))}
        </div>
        <p className="text-center text-sm text-slate-500 mt-2">
          Atualize o progresso manualmente se necessário
        </p>
      </CardContent>
    </Card>
  );
}