import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export default function PivotPositionIndicator({ position = 0, onChange, readonly = false, parcela = 'Alta' }) {
  const radius = 100;
  const center = 120;
  const strokeWidth = 20;

  // Determinar ranges de parcela
  const parcelaRanges = {
    'Alta': { start: 0, end: 180, color: '#3b82f6' },
    'Baixa': { start: 181, end: 360, color: '#8b5cf6' },
    'Total': { start: 0, end: 360, color: '#10b981' }
  };

  // Convert position (0-360) to radians, starting from left (9 o'clock)
  const angleRad = ((position - 180) * Math.PI) / 180;
  const indicatorX = center + radius * Math.cos(angleRad);
  const indicatorY = center + radius * Math.sin(angleRad);

  const handleClick = (e) => {
    if (readonly) return;

    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const x = e.clientX - rect.left - center;
    const y = e.clientY - rect.top - center;

    // Calcular ângulo com 0° à esquerda
    let angle = Math.atan2(y, x) * (180 / Math.PI) + 180;
    if (angle < 0) angle += 360;
    if (angle >= 360) angle -= 360;

    onChange(Math.round(angle));
  };

  const ticks = [0, 90, 180, 240];

  const isInCorrectParcela = parcela === 'Total'
    ? true
    : parcela === 'Alta'
      ? (position >= 0 && position <= 180)
      : (position >= 181 && position <= 360);

  return (
    <Card className="bg-white/95 backdrop-blur border-emerald-500 border-t-4 shadow-2xl">
      <CardHeader className="pb-3 bg-gradient-to-r from-emerald-50 to-white border-b border-emerald-100">
        <div className="text-center">
          <CardTitle className="text-emerald-900 text-xl font-bold">
            Posição do Pivô - Parcela {parcela}
          </CardTitle>
          <div className="mt-2">
            <div className={cn(
              "inline-block px-4 py-2 rounded-lg text-sm font-bold",
              parcela === 'Total' ? "bg-emerald-100 text-emerald-700" :
                parcela === 'Alta' ? "bg-blue-100 text-blue-700" :
                  "bg-purple-100 text-purple-700"
            )}>
              {parcela === 'Total' && '✓ Cobertura Completa (0° - 360°)'}
              {parcela === 'Alta' && '✓ Parte Alta (0° - 180°)'}
              {parcela === 'Baixa' && '✓ Parte Baixa (180° - 360°)'}
            </div>
          </div>
          {!isInCorrectParcela && parcela !== 'Total' && (
            <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg p-2 text-amber-700 text-xs font-medium">
              ⚠️ Atenção: Pivô está na parcela {parcela === 'Alta' ? 'Baixa' : 'Alta'}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-6">
        <svg
          width="240"
          height="240"
          className={readonly ? "" : "cursor-pointer"}
          onClick={handleClick}
        >
          {parcela === 'Total' ? (
            <circle cx={center} cy={center} r={radius} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          ) : parcela === 'Alta' ? (
            <path d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          ) : (
            <path d={`M ${center + radius} ${center} A ${radius} ${radius} 0 0 1 ${center - radius} ${center}`} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth} />
          )}

          {ticks.map(tick => {
            const tickRad = ((tick - 180) * Math.PI) / 180;
            const x1 = center + (radius - 10) * Math.cos(tickRad);
            const y1 = center + (radius - 10) * Math.sin(tickRad);
            const x2 = center + (radius + 10) * Math.cos(tickRad);
            const y2 = center + (radius + 10) * Math.sin(tickRad);
            return (
              <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#cbd5e1" strokeWidth="2" />
            );
          })}

          <line x1={center} y1={center} x2={indicatorX} y2={indicatorY} stroke="#059669" strokeWidth="4" />
          <circle cx={indicatorX} cy={indicatorY} r="8" fill="#059669" stroke="white" strokeWidth="2" />
          <circle cx={center} cy={center} r="6" fill="#059669" />

        </svg>
        <div className="mt-4 text-center">
          <span className="text-3xl font-bold text-emerald-900">{position}°</span>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Ângulo Atual
          </p>
        </div>
      </CardContent>
    </Card>
  );
}