import React, { useState } from 'react';
import {
  getPivos, createPivo, updatePivo, deletePivo,
  getOperadores, createOperador, updateOperador, deleteOperador
} from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  Droplets,
  User,
  Loader2,
  Phone
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cadastros() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('pivos');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Pivo form
  const [pivoForm, setPivoForm] = useState({ numero: '', nome: '', area_hectares: '', ativo: true });

  // Operador form
  const [operadorForm, setOperadorForm] = useState({ nome: '', telefone: '', ativo: true });

  const { data: pivos = [], isLoading: loadingPivos } = useQuery({
    queryKey: ['pivos'],
    queryFn: () => getPivos(),
  });

  const { data: operadores = [], isLoading: loadingOperadores } = useQuery({
    queryKey: ['operadores'],
    queryFn: () => getOperadores(),
  });

  const createPivoMutation = useMutation({
    mutationFn: (data) => createPivo(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pivos']);
      resetForm();
    },
  });

  const updatePivoMutation = useMutation({
    mutationFn: ({ id, data }) => updatePivo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['pivos']);
      resetForm();
    },
  });

  const deletePivoMutation = useMutation({
    mutationFn: (id) => deletePivo(id),
    onSuccess: () => queryClient.invalidateQueries(['pivos']),
  });

  const createOperadorMutation = useMutation({
    mutationFn: (data) => createOperador(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['operadores']);
      resetForm();
    },
  });

  const updateOperadorMutation = useMutation({
    mutationFn: ({ id, data }) => updateOperador(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['operadores']);
      resetForm();
    },
  });

  const deleteOperadorMutation = useMutation({
    mutationFn: (id) => deleteOperador(id),
    onSuccess: () => queryClient.invalidateQueries(['operadores']),
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setPivoForm({ numero: '', nome: '', area_hectares: '', ativo: true });
    setOperadorForm({ nome: '', telefone: '', ativo: true });
  };

  const handleEditPivo = (pivo) => {
    setEditingItem(pivo);
    setPivoForm({
      numero: pivo.numero || '',
      nome: pivo.nome || '',
      area_hectares: pivo.area_hectares || '',
      ativo: pivo.ativo ?? true
    });
    setDialogOpen(true);
  };

  const handleEditOperador = (operador) => {
    setEditingItem(operador);
    setOperadorForm({
      nome: operador.nome || '',
      telefone: operador.telefone || '',
      ativo: operador.ativo ?? true
    });
    setDialogOpen(true);
  };

  const handleSubmitPivo = (e) => {
    e.preventDefault();
    const data = {
      ...pivoForm,
      area_hectares: pivoForm.area_hectares ? parseFloat(pivoForm.area_hectares) : null
    };

    if (editingItem) {
      updatePivoMutation.mutate({ id: editingItem.id, data });
    } else {
      createPivoMutation.mutate(data);
    }
  };

  const handleSubmitOperador = (e) => {
    e.preventDefault();
    if (editingItem) {
      updateOperadorMutation.mutate({ id: editingItem.id, data: operadorForm });
    } else {
      createOperadorMutation.mutate(operadorForm);
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
              <h1 className="text-xl font-bold text-slate-800">Cadastros</h1>
              <p className="text-slate-500 text-sm">Gerencie pivôs e operadores</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-14">
            <TabsTrigger value="pivos" className="text-lg data-[state=active]:bg-blue-100">
              <Droplets className="w-5 h-5 mr-2" />
              Pivôs
            </TabsTrigger>
            <TabsTrigger value="operadores" className="text-lg data-[state=active]:bg-emerald-100">
              <User className="w-5 h-5 mr-2" />
              Operadores
            </TabsTrigger>
          </TabsList>

          {/* Pivôs Tab */}
          <TabsContent value="pivos" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Pivôs Cadastrados</CardTitle>
                <Dialog open={dialogOpen && activeTab === 'pivos'} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-5 h-5 mr-2" />
                      Novo Pivô
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Editar' : 'Novo'} Pivô</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitPivo} className="space-y-4 mt-4">
                      <div>
                        <Label>Número do Pivô *</Label>
                        <Input
                          value={pivoForm.numero}
                          onChange={(e) => setPivoForm(p => ({ ...p, numero: e.target.value }))}
                          placeholder="Ex: 01"
                          className="h-12 text-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label>Nome/Descrição *</Label>
                        <Input
                          value={pivoForm.nome}
                          onChange={(e) => setPivoForm(p => ({ ...p, nome: e.target.value }))}
                          placeholder="Ex: Área Norte"
                          className="h-12 text-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label>Área (hectares)</Label>
                        <Input
                          type="number"
                          value={pivoForm.area_hectares}
                          onChange={(e) => setPivoForm(p => ({ ...p, area_hectares: e.target.value }))}
                          placeholder="Ex: 50"
                          className="h-12 text-lg"
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <Label>Ativo</Label>
                        <Switch
                          checked={pivoForm.ativo}
                          onCheckedChange={(v) => setPivoForm(p => ({ ...p, ativo: v }))}
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-12">
                          Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 h-12 bg-blue-600 hover:bg-blue-700"
                          disabled={createPivoMutation.isPending || updatePivoMutation.isPending}>
                          {(createPivoMutation.isPending || updatePivoMutation.isPending) ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : editingItem ? 'Salvar' : 'Criar'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingPivos ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  </div>
                ) : pivos.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Nenhum pivô cadastrado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Número</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Área (ha)</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {pivos.map((pivo) => (
                          <motion.tr
                            key={pivo.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b"
                          >
                            <TableCell className="font-semibold">{pivo.numero}</TableCell>
                            <TableCell>{pivo.nome}</TableCell>
                            <TableCell>{pivo.area_hectares || '-'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-sm ${pivo.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {pivo.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditPivo(pivo)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deletePivoMutation.mutate(pivo.id)}
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

          {/* Operadores Tab */}
          <TabsContent value="operadores" className="mt-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Operadores Cadastrados</CardTitle>
                <Dialog open={dialogOpen && activeTab === 'operadores'} onOpenChange={(open) => {
                  setDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="w-5 h-5 mr-2" />
                      Novo Operador
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingItem ? 'Editar' : 'Novo'} Operador</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmitOperador} className="space-y-4 mt-4">
                      <div>
                        <Label>Nome Completo *</Label>
                        <Input
                          value={operadorForm.nome}
                          onChange={(e) => setOperadorForm(p => ({ ...p, nome: e.target.value }))}
                          placeholder="Ex: João Silva"
                          className="h-12 text-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label>Telefone (WhatsApp) *</Label>
                        <Input
                          value={operadorForm.telefone}
                          onChange={(e) => setOperadorForm(p => ({ ...p, telefone: e.target.value }))}
                          placeholder="Ex: (11) 99999-9999"
                          className="h-12 text-lg"
                          required
                        />
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <Label>Ativo</Label>
                        <Switch
                          checked={operadorForm.ativo}
                          onCheckedChange={(v) => setOperadorForm(p => ({ ...p, ativo: v }))}
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={resetForm} className="flex-1 h-12">
                          Cancelar
                        </Button>
                        <Button type="submit" className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700"
                          disabled={createOperadorMutation.isPending || updateOperadorMutation.isPending}>
                          {(createOperadorMutation.isPending || updateOperadorMutation.isPending) ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : editingItem ? 'Salvar' : 'Criar'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {loadingOperadores ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                  </div>
                ) : operadores.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">
                    Nenhum operador cadastrado
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Telefone</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <AnimatePresence>
                        {operadores.map((operador) => (
                          <motion.tr
                            key={operador.id}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="border-b"
                          >
                            <TableCell className="font-semibold">{operador.nome}</TableCell>
                            <TableCell>
                              <span className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-emerald-500" />
                                {operador.telefone}
                              </span>
                            </TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded-full text-sm ${operador.ativo ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                }`}>
                                {operador.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </TableCell>
                            <TableCell className="text-right space-x-2">
                              <Button variant="ghost" size="icon" onClick={() => handleEditOperador(operador)}>
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteOperadorMutation.mutate(operador.id)}
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