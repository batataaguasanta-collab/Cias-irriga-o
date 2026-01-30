import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function OSCard({ ordem }) {
  return (
    <Card className="hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
      <CardContent className="p-5">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h3 className="text-lg font-bold text-slate-900">
                Pivô {ordem.pivo_numero}
              </h3>
              <StatusBadge status={ordem.status} />
            </div>

            <p className="text-sm font-medium text-slate-500">
              OS: <span className="text-slate-700">{ordem.numero_os}</span>
            </p>

            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <User className="w-4 h-4 text-emerald-600" />
                {ordem.operador_nome}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Droplets className="w-4 h-4 text-blue-600" />
                {ordem.parcela}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Clock className="w-4 h-4 text-amber-600" />
                {format(new Date(ordem.created_date), "dd/MM/yyyy HH:mm", { locale: ptBR })}
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <Link to={`/OperadorDashboard?os_id=${ordem.id}`} className="w-full md:w-auto">
              <Button className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200">
                Acessar Painel
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}