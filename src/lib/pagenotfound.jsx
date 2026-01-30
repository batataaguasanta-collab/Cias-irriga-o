import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Home, FileQuestion } from 'lucide-react';
import { createPageUrl } from '@/utils';

export default function PageNotFound() {
    const location = useLocation();
    const pageName = location.pathname.substring(1);

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
            <div className="max-w-md w-full text-center">
                <div className="mb-6 flex justify-center">
                    <div className="p-4 bg-slate-100 rounded-full">
                        <FileQuestion className="w-16 h-16 text-slate-400" />
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-slate-800 mb-2">Página não encontrada</h1>
                <p className="text-slate-600 mb-8">
                    A página <span className="font-mono text-emerald-600 bg-emerald-50 px-1 rounded">{pageName}</span> que você tentou acessar não existe ou foi removida.
                </p>

                <Link to="/">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg h-12">
                        <Home className="w-5 h-5 mr-2" />
                        Voltar para o Início
                    </Button>
                </Link>
            </div>
        </div>
    )
}