import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    getCulturas, createCultura, updateCultura, deleteCultura,
    getFazendas, createFazenda, updateFazenda, deleteFazenda
} from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    Sprout,
    MapPin,
    Loader2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function CadastrosCulturaFazenda() {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get('tab');
    const [activeTab, setActiveTab] = useState(tabFromUrl === 'fazendas' ? 'fazendas' : 'culturas');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Cultura form
    const [culturaForm, setCulturaForm] = useState({
        nome: '',
        variedade_cultivar: '',
        ciclo: ''
    });

    // Fazenda form
    const [fazendaForm, setFazendaForm] = useState({
        nome: '',
        localizacao: ''
    });

    const { data: culturas = [], isLoading: loadingCulturas } = useQuery({
        queryKey: ['culturas'],
        queryFn: () => getCulturas(),
    });

    const { data: fazendas = [], isLoading: loadingFazendas } = useQuery({
        queryKey: ['fazendas'],
        queryFn: () => getFazendas(),
    });

    const createCulturaMutation = useMutation({
        mutationFn: (data) => createCultura(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['culturas'] });
            resetForm();
            toast.success('Cultura criada com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar cultura:', error);
            toast.error(`Erro ao criar cultura: ${error.message}`);
        },
    });

    const updateCulturaMutation = useMutation({
        mutationFn: ({ id, data }) => updateCultura(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['culturas'] });
            resetForm();
            toast.success('Cultura atualizada com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar cultura:', error);
            toast.error(`Erro ao atualizar cultura: ${error.message}`);
        },
    });

    const deleteCulturaMutation = useMutation({
        mutationFn: (id) => deleteCultura(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['culturas'] }),
    });

    const createFazendaMutation = useMutation({
        mutationFn: (data) => createFazenda(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fazendas'] });
            resetForm();
            toast.success('Fazenda criada com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao criar fazenda:', error);
            toast.error(`Erro ao criar fazenda: ${error.message}`);
        },
    });

    const updateFazendaMutation = useMutation({
        mutationFn: ({ id, data }) => updateFazenda(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['fazendas'] });
            resetForm();
            toast.success('Fazenda atualizada com sucesso!');
        },
        onError: (error) => {
            console.error('Erro ao atualizar fazenda:', error);
            toast.error(`Erro ao atualizar fazenda: ${error.message}`);
        },
    });

    const deleteFazendaMutation = useMutation({
        mutationFn: (id) => deleteFazenda(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['fazendas'] }),
    });

    const resetForm = () => {
        setDialogOpen(false);
        setEditingItem(null);
        setCulturaForm({ nome: '', variedade_cultivar: '', ciclo: '' });
        setFazendaForm({ nome: '', localizacao: '' });
    };

    const handleEditCultura = (cultura) => {
        setEditingItem(cultura);
        setCulturaForm({
            nome: cultura.nome || '',
            variedade_cultivar: cultura.variedade_cultivar || '',
            ciclo: cultura.ciclo || ''
        });
        setDialogOpen(true);
    };

    const handleEditFazenda = (fazenda) => {
        setEditingItem(fazenda);
        setFazendaForm({
            nome: fazenda.nome || '',
            localizacao: fazenda.localizacao || ''
        });
        setDialogOpen(true);
    };

    const handleSubmitCultura = (e) => {
        e.preventDefault();
        const data = {
            nome: culturaForm.nome,
            variedade_cultivar: culturaForm.variedade_cultivar,
            ciclo: culturaForm.ciclo ? parseInt(culturaForm.ciclo) : null,
        };

        if (editingItem) {
            updateCulturaMutation.mutate({ id: editingItem.id, data });
        } else {
            createCulturaMutation.mutate(data);
        }
    };

    const handleSubmitFazenda = (e) => {
        e.preventDefault();
        if (editingItem) {
            updateFazendaMutation.mutate({ id: editingItem.id, data: fazendaForm });
        } else {
            createFazendaMutation.mutate(fazendaForm);
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
                            <h1 className="text-xl font-bold text-slate-800">Culturas e Fazendas</h1>
                            <p className="text-slate-500 text-sm">Gerencie culturas e fazendas</p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="grid w-full grid-cols-2 h-14">
                        <TabsTrigger value="culturas" className="text-lg data-[state=active]:bg-green-100">
                            <Sprout className="w-5 h-5 mr-2" />
                            Culturas
                        </TabsTrigger>
                        <TabsTrigger value="fazendas" className="text-lg data-[state=active]:bg-amber-100">
                            <MapPin className="w-5 h-5 mr-2" />
                            Fazendas
                        </TabsTrigger>
                    </TabsList>

                    {/* Culturas Tab */}
                    <TabsContent value="culturas" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Culturas Cadastradas</CardTitle>
                                <Dialog open={dialogOpen && activeTab === 'culturas'} onOpenChange={(open) => {
                                    setDialogOpen(open);
                                    if (!open) resetForm();
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-green-600 hover:bg-green-700">
                                            <Plus className="w-5 h-5 mr-2" />
                                            Nova Cultura
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="max-h-[80vh] overflow-y-auto">
                                        <DialogHeader>
                                            <DialogTitle>{editingItem ? 'Editar' : 'Nova'} Cultura</DialogTitle>
                                            <DialogDescription>
                                                Preencha as informações abaixo para {editingItem ? 'editar' : 'criar'} uma cultura.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmitCultura} className="space-y-4 mt-4">
                                            <div>
                                                <Label>Nome da Cultura *</Label>
                                                <Input
                                                    value={culturaForm.nome}
                                                    onChange={(e) => setCulturaForm(p => ({ ...p, nome: e.target.value }))}
                                                    placeholder="Ex: Batata"
                                                    className="h-12 text-lg"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Variedade/Cultivar</Label>
                                                <Input
                                                    value={culturaForm.variedade_cultivar}
                                                    onChange={(e) => setCulturaForm(p => ({ ...p, variedade_cultivar: e.target.value }))}
                                                    placeholder="Ex: Ágata, Atlantic"
                                                    className="h-12 text-lg"
                                                />
                                            </div>

                                            <div>
                                                <Label>Ciclo (dias)</Label>
                                                <Input
                                                    type="number"
                                                    value={culturaForm.ciclo}
                                                    onChange={(e) => setCulturaForm(p => ({ ...p, ciclo: e.target.value }))}
                                                    placeholder="Ex: 120"
                                                    className="h-12 text-lg"
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-12">
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" className="flex-1 h-12 bg-green-600 hover:bg-green-700"
                                                    disabled={createCulturaMutation.isPending || updateCulturaMutation.isPending}>
                                                    {(createCulturaMutation.isPending || updateCulturaMutation.isPending) ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : editingItem ? 'Salvar' : 'Criar'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {loadingCulturas ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                                    </div>
                                ) : culturas.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">
                                        Nenhuma cultura cadastrada
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Variedade/Cultivar</TableHead>
                                                <TableHead>Ciclo (dias)</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {culturas.map((cultura) => (
                                                    <motion.tr
                                                        key={cultura.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="border-b"
                                                    >
                                                        <TableCell className="font-semibold">{cultura.nome}</TableCell>
                                                        <TableCell>{cultura.variedade_cultivar || '-'}</TableCell>
                                                        <TableCell>{cultura.ciclo || '-'}</TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEditCultura(cultura)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => deleteCulturaMutation.mutate(cultura.id)}
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
                    </TabsContent>

                    {/* Fazendas Tab */}
                    <TabsContent value="fazendas" className="mt-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg">Fazendas Cadastradas</CardTitle>
                                <Dialog open={dialogOpen && activeTab === 'fazendas'} onOpenChange={(open) => {
                                    setDialogOpen(open);
                                    if (!open) resetForm();
                                }}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-amber-600 hover:bg-amber-700">
                                            <Plus className="w-5 h-5 mr-2" />
                                            Nova Fazenda
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                        <DialogHeader>
                                            <DialogTitle>{editingItem ? 'Editar' : 'Nova'} Fazenda</DialogTitle>
                                            <DialogDescription>
                                                Preencha as informações abaixo para {editingItem ? 'editar' : 'criar'} uma fazenda.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmitFazenda} className="space-y-4 mt-4">
                                            <div>
                                                <Label>Nome da Fazenda *</Label>
                                                <Input
                                                    value={fazendaForm.nome}
                                                    onChange={(e) => setFazendaForm(p => ({ ...p, nome: e.target.value }))}
                                                    placeholder="Ex: Fazenda Santa Maria"
                                                    className="h-12 text-lg"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <Label>Localização</Label>
                                                <Input
                                                    value={fazendaForm.localizacao}
                                                    onChange={(e) => setFazendaForm(p => ({ ...p, localizacao: e.target.value }))}
                                                    placeholder="Ex: Cristalina - GO"
                                                    className="h-12 text-lg"
                                                />
                                            </div>
                                            <div className="flex gap-3 pt-4">
                                                <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-12">
                                                    Cancelar
                                                </Button>
                                                <Button type="submit" className="flex-1 h-12 bg-amber-600 hover:bg-amber-700"
                                                    disabled={createFazendaMutation.isPending || updateFazendaMutation.isPending}>
                                                    {(createFazendaMutation.isPending || updateFazendaMutation.isPending) ? (
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                    ) : editingItem ? 'Salvar' : 'Criar'}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>
                            </CardHeader>
                            <CardContent>
                                {loadingFazendas ? (
                                    <div className="flex justify-center py-10">
                                        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                                    </div>
                                ) : fazendas.length === 0 ? (
                                    <div className="text-center py-10 text-slate-500">
                                        Nenhuma fazenda cadastrada
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Nome</TableHead>
                                                <TableHead>Localização</TableHead>
                                                <TableHead className="text-right">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            <AnimatePresence>
                                                {fazendas.map((fazenda) => (
                                                    <motion.tr
                                                        key={fazenda.id}
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        exit={{ opacity: 0 }}
                                                        className="border-b"
                                                    >
                                                        <TableCell className="font-semibold">{fazenda.nome}</TableCell>
                                                        <TableCell>{fazenda.localizacao || '-'}</TableCell>
                                                        <TableCell className="text-right space-x-2">
                                                            <Button variant="ghost" size="icon" onClick={() => handleEditFazenda(fazenda)}>
                                                                <Pencil className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                onClick={() => deleteFazendaMutation.mutate(fazenda.id)}
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
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
