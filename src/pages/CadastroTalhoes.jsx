import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    getTalhoes, createTalhao, updateTalhao, deleteTalhao,
    getFazendas, getCulturas, getPivos
} from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Plus,
    Pencil,
    Trash2,
    ArrowLeft,
    Loader2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CadastroTalhoes() {
    const queryClient = useQueryClient();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Talhão form
    const [talhaoForm, setTalhaoForm] = useState({
        nome: '',
        fazenda_id: '',
        cultura_id: '',
        pivo_id: '',
        data_plantio: ''
    });

    const { data: talhoes = [], isLoading: loadingTalhoes } = useQuery({
        queryKey: ['talhoes'],
        queryFn: () => getTalhoes(),
    });

    const { data: fazendas = [] } = useQuery({
        queryKey: ['fazendas'],
        queryFn: () => getFazendas(),
    });

    const { data: culturas = [] } = useQuery({
        queryKey: ['culturas'],
        queryFn: () => getCulturas(),
    });

    const { data: pivos = [] } = useQuery({
        queryKey: ['pivos'],
        queryFn: () => getPivos(),
    });

    const createTalhaoMutation = useMutation({
        mutationFn: (data) => createTalhao(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['talhoes'] });
            resetForm();
            toast.success('Talhão criado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar talhão:', error);
            toast.error(`Erro ao criar talhão: ${error.message}`);
        },
    });

    const updateTalhaoMutation = useMutation({
        mutationFn: ({ id, data }) => updateTalhao(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['talhoes'] });
            resetForm();
            toast.success('Talhão atualizado com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar talhão:', error);
            toast.error(`Erro ao atualizar talhão: ${error.message}`);
        },
    });

    const deleteTalhaoMutation = useMutation({
        mutationFn: (id) => deleteTalhao(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['talhoes'] });
            toast.success('Talhão excluído com sucesso!');
        },
    });

    const resetForm = () => {
        setDialogOpen(false);
        setEditingItem(null);
        setTalhaoForm({ nome: '', fazenda_id: '', cultura_id: '', pivo_id: '', data_plantio: '' });
    };

    const handleEdit = (talhao) => {
        setEditingItem(talhao);
        setTalhaoForm({
            nome: talhao.nome || '',
            fazenda_id: talhao.fazenda_id || '',
            cultura_id: talhao.cultura_id || '',
            pivo_id: talhao.pivo_id || '',
            data_plantio: talhao.data_plantio || ''
        });
        setDialogOpen(true);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const data = {
            nome: talhaoForm.nome,
            fazenda_id: talhaoForm.fazenda_id || null,
            cultura_id: talhaoForm.cultura_id || null,
            pivo_id: talhaoForm.pivo_id || null,
            data_plantio: talhaoForm.data_plantio || null,
        };

        if (editingItem) {
            updateTalhaoMutation.mutate({ id: editingItem.id, data });
        } else {
            createTalhaoMutation.mutate(data);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
            {/* Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link to={createPageUrl('Home')}>
                            <Button variant="ghost" size="icon" className="h-12 w-12">
                                <ArrowLeft className="w-6 h-6" />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Talhões</h1>
                            <p className="text-slate-500 text-sm">Gerencie os talhões de cultivo</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-lg">Talhões Cadastrados</CardTitle>
                        <Dialog open={dialogOpen} onOpenChange={(open) => {
                            setDialogOpen(open);
                            if (!open) resetForm();
                        }}>
                            <DialogTrigger asChild>
                                <Button className="bg-indigo-600 hover:bg-indigo-700">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Novo Talhão
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>{editingItem ? 'Editar' : 'Novo'} Talhão</DialogTitle>
                                    <DialogDescription>
                                        Preencha as informações abaixo para {editingItem ? 'editar' : 'criar'} um talhão.
                                    </DialogDescription>
                                </DialogHeader>
                                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                    <div>
                                        <Label>Nome do Talhão *</Label>
                                        <Input
                                            value={talhaoForm.nome}
                                            onChange={(e) => setTalhaoForm(p => ({ ...p, nome: e.target.value }))}
                                            placeholder="Ex: Talhão A1"
                                            className="h-12 text-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <Label>Fazenda</Label>
                                        <Select value={talhaoForm.fazenda_id} onValueChange={(value) => setTalhaoForm(p => ({ ...p, fazenda_id: value }))}>
                                            <SelectTrigger className="h-12 text-lg">
                                                <SelectValue placeholder="Selecione uma fazenda" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {fazendas.map((fazenda) => (
                                                    <SelectItem key={fazenda.id} value={fazenda.id}>
                                                        {fazenda.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Cultura</Label>
                                        <Select value={talhaoForm.cultura_id} onValueChange={(value) => setTalhaoForm(p => ({ ...p, cultura_id: value }))}>
                                            <SelectTrigger className="h-12 text-lg">
                                                <SelectValue placeholder="Selecione uma cultura" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {culturas.map((cultura) => (
                                                    <SelectItem key={cultura.id} value={cultura.id}>
                                                        {cultura.nome} {cultura.variedade_cultivar ? `(${cultura.variedade_cultivar})` : ''}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Pivô</Label>
                                        <Select value={talhaoForm.pivo_id} onValueChange={(value) => setTalhaoForm(p => ({ ...p, pivo_id: value }))}>
                                            <SelectTrigger className="h-12 text-lg">
                                                <SelectValue placeholder="Selecione um pivô" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {pivos.map((pivo) => (
                                                    <SelectItem key={pivo.id} value={pivo.id}>
                                                        Pivô {pivo.numero} - {pivo.nome}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <Label>Data de Plantio</Label>
                                        <Input
                                            type="date"
                                            value={talhaoForm.data_plantio}
                                            onChange={(e) => setTalhaoForm(p => ({ ...p, data_plantio: e.target.value }))}
                                            className="h-12 text-lg"
                                        />
                                    </div>
                                    <div className="flex gap-3 pt-4">
                                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-12">
                                            Cancelar
                                        </Button>
                                        <Button type="submit" className="flex-1 h-12 bg-indigo-600 hover:bg-indigo-700"
                                            disabled={createTalhaoMutation.isPending || updateTalhaoMutation.isPending}>
                                            {(createTalhaoMutation.isPending || updateTalhaoMutation.isPending) ? (
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                            ) : editingItem ? 'Salvar' : 'Criar'}
                                        </Button>
                                    </div>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </CardHeader>
                    <CardContent>
                        {loadingTalhoes ? (
                            <div className="flex justify-center py-10">
                                <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                            </div>
                        ) : talhoes.length === 0 ? (
                            <div className="text-center py-10 text-slate-500">
                                Nenhum talhão cadastrado
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Nome</TableHead>
                                        <TableHead>Fazenda</TableHead>
                                        <TableHead>Cultura</TableHead>
                                        <TableHead>Pivô</TableHead>
                                        <TableHead>Área (ha)</TableHead>
                                        <TableHead>Data Plantio</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {talhoes.map((talhao) => (
                                            <motion.tr
                                                key={talhao.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b"
                                            >
                                                <TableCell className="font-semibold">{talhao.nome}</TableCell>
                                                <TableCell>{talhao.fazenda?.nome || '-'}</TableCell>
                                                <TableCell>
                                                    {talhao.cultura ? (
                                                        <div>
                                                            <div className="font-medium">{talhao.cultura.nome}</div>
                                                            {talhao.cultura.variedade_cultivar && (
                                                                <div className="text-xs text-slate-500">{talhao.cultura.variedade_cultivar}</div>
                                                            )}
                                                        </div>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {talhao.pivo ? `Pivô ${talhao.pivo.numero}` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {talhao.pivo?.area_ha ? `${talhao.pivo.area_ha} ha` : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {talhao.data_plantio ? new Date(talhao.data_plantio).toLocaleDateString('pt-BR') : '-'}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="ghost" size="icon" onClick={() => handleEdit(talhao)}>
                                                        <Pencil className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => deleteTalhaoMutation.mutate(talhao.id)}
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
