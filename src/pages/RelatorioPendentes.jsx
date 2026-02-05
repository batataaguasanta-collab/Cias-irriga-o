import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getOrdens } from '@/lib/supabase';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Printer, ArrowLeft, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function RelatorioPendentes() {
    const { data: ordens = [], isLoading, isError } = useQuery({
        queryKey: ['ordens'], // Match Home key for cache sharing
        queryFn: () => getOrdens(100), // Fetch recent orders
    });

    // Filter orders by status
    const ordensPendentes = ordens.filter(ordem => ordem.status === 'Pendente');
    const ordensEmAndamento = ordens.filter(ordem => ordem.status === 'Em Andamento');
    const ordensInterrompidas = ordens.filter(ordem => ordem.status === 'Interrompida');

    // Trigger print automatically when data is loaded
    useEffect(() => {
        if (!isLoading && ordens.length > 0) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isLoading, ordens.length]);

    const renderTable = (listaOrdens, titulo, corBorda = "border-slate-800") => {
        if (listaOrdens.length === 0) return null;

        return (
            <div className="mb-8 break-inside-avoid">
                <h2 className={`text-xl font-bold text-slate-900 uppercase mb-4 pl-4 border-l-4 ${corBorda}`}>
                    {titulo}
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-100 border-y-2 border-slate-300 print:bg-slate-50">
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Pivô</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Data</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Hora</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Parcela</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Lâmina (mm)</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Velocidade (%)</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Sentido</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Operador</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase">Insumo</th>
                                <th className="py-3 px-2 font-bold text-slate-900 uppercase w-48">Observação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {listaOrdens.map((ordem) => (
                                <tr key={ordem.id} className="break-inside-avoid">
                                    <td className="py-3 px-2 font-medium text-slate-900 text-center">{ordem.pivo_numero}</td>
                                    <td className="py-3 px-2 text-slate-700 text-center">
                                        {ordem.data_inicio ? format(new Date(ordem.data_inicio + 'T12:00:00'), 'dd/MM/yyyy') : '-'}
                                    </td>
                                    <td className="py-3 px-2 text-slate-700 text-center">{ordem.hora_inicio || '-'}</td>
                                    <td className="py-3 px-2 text-slate-700">{ordem.parcela}</td>
                                    <td className="py-3 px-2 text-slate-700 text-center">
                                        {ordem.volume_tipo === 'milimetros' ? `${ordem.volume_valor} mm` : '-'}
                                    </td>
                                    <td className="py-3 px-2 text-slate-700 text-center">
                                        {ordem.volume_tipo === 'percentual' ? `${ordem.volume_valor}%` : '-'}
                                    </td>
                                    <td className="py-3 px-2 text-slate-700">{ordem.sentido_rotacao}</td>
                                    <td className="py-3 px-2 text-slate-700">{ordem.operador_nome}</td>
                                    <td className="py-3 px-2 text-slate-700">N/A</td>
                                    <td className="py-3 px-2 text-slate-600 italic text-xs border-l border-slate-100">
                                        {ordem.observacoes ? ordem.observacoes.replace(/^Talhão: .*?\n/g, '') || '-' : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-white p-8 print:p-0">
            {/* Non-printable Header */}
            <div className="print:hidden flex justify-between items-center mb-8">
                <Link to={createPageUrl('Home')}>
                    <Button variant="outline" className="flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Voltar
                    </Button>
                </Link>
                <div className="flex gap-4">
                    <Button onClick={() => window.print()} className="bg-slate-900 text-white flex items-center gap-2">
                        <Printer className="w-4 h-4" />
                        Imprimir Relatório
                    </Button>
                </div>
            </div>

            {/* Report Header */}
            <div className="mb-8 border-b-2 border-slate-800 pb-4">
                <div className="flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-wider">Irriga-CIAS - ORDEM DE IRRIGAÇÃO</h1>
                        <p className="text-slate-600 mt-1">Relatório Geral</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-slate-500">Data de Emissão</p>
                        <p className="font-mono font-bold text-slate-900">
                            {format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                </div>
            ) : isError ? (
                <div className="flex justify-center items-center py-20 text-red-600 gap-2">
                    <AlertCircle className="w-6 h-6" />
                    <p>Erro ao carregar dados.</p>
                </div>
            ) : (
                <>
                    {ordensPendentes.length === 0 && ordensEmAndamento.length === 0 && ordensInterrompidas.length === 0 && (
                        <div className="text-center py-12 border rounded-lg bg-slate-50">
                            <p className="text-slate-500">Nenhuma ordem encontrada nos status: Pendente, Em Andamento ou Interrompida.</p>
                        </div>
                    )}

                    {renderTable(ordensPendentes, "Ordens Pendentes", "border-yellow-500")}
                    {renderTable(ordensEmAndamento, "Ordens Em Andamento", "border-blue-500")}
                    {renderTable(ordensInterrompidas, "Ordens Interrompidas", "border-red-500")}
                </>
            )}

            {/* Footer */}
            <div className="mt-8 pt-4 border-t border-slate-200 text-xs text-slate-400 flex justify-between print:fixed print:bottom-0 print:left-0 print:right-0 print:p-8">
                <span>Sistema Irriga-Cias</span>
                <span>Relatório Gerado Automaticamente</span>
            </div>
        </div>
    );
}
