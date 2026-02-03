import React, { useState } from 'react';
import { toast } from 'sonner';
import {
  getPivos, createPivo, updatePivo, deletePivo,
  getOperadores, createOperador, updateOperador, deleteOperador,
  getCulturas,
  getFazendas,
  getTalhoes
} from '@/lib/supabase';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
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
  Droplets,
  User,
  Loader2,
  Phone,
  Sprout,
  MapPin,
  Grid3x3,
  Warehouse,
  LayoutDashboard
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { motion, AnimatePresence } from 'framer-motion';

export default function Cadastros() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard'); // Default to dashboard
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Queries for stats
  const { data: pivos = [], isLoading: loadingPivos } = useQuery({
    queryKey: ['pivos'],
    queryFn: () => getPivos(),
  });

  const { data: operadores = [], isLoading: loadingOperadores } = useQuery({
    queryKey: ['operadores'],
    queryFn: () => getOperadores(),
  });

  const { data: culturas = [] } = useQuery({
    queryKey: ['culturas'],
    queryFn: () => getCulturas(),
  });

  const { data: fazendas = [] } = useQuery({
    queryKey: ['fazendas'],
    queryFn: () => getFazendas(),
  });

  const { data: talhoes = [] } = useQuery({
    queryKey: ['talhoes'],
    queryFn: () => getTalhoes(),
  });

  // Handle navigation
  const handleNavigate = (path, tabParam) => {
    if (path) {
      let url = createPageUrl(path);
      if (tabParam) url += `?tab=${tabParam}`;
      navigate(url);
    } else {
      // Internal navigation
      setActiveTab(tabParam);
    }
  };

  // Card Configuration
  const cards = [
    {
      entity: "fazenda",
      title: "Minhas Fazendas",
      description: "Gerencie as propriedades rurais e sedes.",
      icon: Warehouse,
      theme_color: "text-amber-600",
      bg_color: "bg-amber-100",
      btn_color: "bg-amber-600 hover:bg-amber-700",
      stats: { count: fazendas.length, label: "Fazendas ativas" },
      actions: {
        primary: { label: "Nova Fazenda", onClick: () => handleNavigate('CadastrosCulturaFazenda', 'fazendas') },
        secondary: { label: "Ver todas", onClick: () => handleNavigate('CadastrosCulturaFazenda', 'fazendas') }
      }
    },
    {
      entity: "pivo",
      title: "Pivôs Centrais",
      description: "Cadastre equipamentos e monitore a irrigação.",
      icon: Droplets,
      theme_color: "text-blue-600",
      bg_color: "bg-blue-100",
      btn_color: "bg-blue-600 hover:bg-blue-700",
      stats: { count: pivos.length, label: "Pivôs totais" },
      actions: {
        primary: { label: "Novo Pivô", onClick: () => { setActiveTab('pivos'); setDialogOpen(true); } },
        secondary: { label: "Ver todos", onClick: () => setActiveTab('pivos') }
      }
    },
    {
      entity: "cultura",
      title: "Culturas",
      description: "Gerencie os tipos de culturas plantadas.",
      icon: Sprout,
      theme_color: "text-green-600",
      bg_color: "bg-green-100",
      btn_color: "bg-green-600 hover:bg-green-700",
      stats: { count: culturas.length, label: "Culturas cadastradas" },
      actions: {
        primary: { label: "Nova Cultura", onClick: () => handleNavigate('CadastrosCulturaFazenda', 'culturas') },
        secondary: { label: "Ver todas", onClick: () => handleNavigate('CadastrosCulturaFazenda', 'culturas') }
      }
    },
    {
      id: 'talhoes',
      entity: "talhoes",
      title: "Talhões",
      description: "Gerencie os talhões de plantio da fazenda.",
      icon: Grid3x3,
      theme_color: "text-indigo-600",
      bg_color: "bg-indigo-100",
      btn_color: "bg-indigo-600 hover:bg-indigo-700",
      stats: { count: talhoes.length, label: "Talhões definidos" },
      actions: {
        primary: { label: "Novo Talhão", onClick: () => handleNavigate('CadastroTalhoes') },
        secondary: { label: "Ver todos", onClick: () => handleNavigate('CadastroTalhoes') }
      }
    },
    {
      entity: "operador",
      title: "Operadores",
      description: "Gerencie a equipe de operação.",
      icon: User,
      theme_color: "text-emerald-600",
      bg_color: "bg-emerald-100",
      btn_color: "bg-emerald-600 hover:bg-emerald-700",
      stats: { count: operadores.length, label: "Operadores ativos" },
      actions: {
        primary: { label: "Novo Operador", onClick: () => { setActiveTab('operadores'); setDialogOpen(true); } },
        secondary: { label: "Ver todos", onClick: () => setActiveTab('operadores') }
      }
    },
    {
      entity: "home",
      title: "Voltar ao Início",
      description: "Retornar para a tela inicial do sistema.",
      icon: LayoutDashboard,
      theme_color: "text-slate-600",
      bg_color: "bg-slate-100",
      btn_color: "bg-slate-600 hover:bg-slate-700",
      stats: { count: "", label: "Acesso Rápido" },
      actions: {
        primary: { label: "Ir para Início", onClick: () => handleNavigate('Home') },
        secondary: null
      }
    }
  ];

  // Rest of the forms state and mutation logic...
  // Pivo form
  const [pivoForm, setPivoForm] = useState({
    numero: '',
    nome: '',
    status: 'Ativo',
    area_ha: '',
    velocidade_100: '',
    vazao_m3h: '',
    pressao_servico: '',
    raio_ultima_torre: '',
    vao_apos_ultima_torre: '',
    tempo_maximo_diario: '',
    coef_uniformidade: '',
    diametro_maior_bocal: '',
    diametro_menor_bocal: ''
  });

  // Operador form
  const [operadorForm, setOperadorForm] = useState({ nome: '', telefone: '', ativo: true });

  const createPivoMutation = useMutation({
    mutationFn: (data) => createPivo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pivos'] });
      resetForm();
      toast.success('Pivô criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar pivô:', error);
      toast.error(`Erro ao criar pivô: ${error.message}`);
    },
  });

  const updatePivoMutation = useMutation({
    mutationFn: ({ id, data }) => updatePivo(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pivos'] });
      resetForm();
      toast.success('Pivô atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar pivô:', error);
      toast.error(`Erro ao atualizar pivô: ${error.message}`);
    },
  });

  const deletePivoMutation = useMutation({
    mutationFn: (id) => deletePivo(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['pivos'] }),
  });

  const createOperadorMutation = useMutation({
    mutationFn: (data) => createOperador(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operadores'] });
      resetForm();
      toast.success('Operador criado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao criar operador:', error);
      toast.error(`Erro ao criar operador: ${error.message}`);
    },
  });

  const updateOperadorMutation = useMutation({
    mutationFn: ({ id, data }) => updateOperador(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operadores'] });
      resetForm();
      toast.success('Operador atualizado com sucesso!');
    },
    onError: (error) => {
      console.error('Erro ao atualizar operador:', error);
      toast.error(`Erro ao atualizar operador: ${error.message}`);
    },
  });

  const deleteOperadorMutation = useMutation({
    mutationFn: (id) => deleteOperador(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operadores'] }),
  });

  const resetForm = () => {
    setDialogOpen(false);
    setEditingItem(null);
    setPivoForm({ numero: '', nome: '', status: 'Ativo', area_ha: '', velocidade_100: '', vazao_m3h: '', pressao_servico: '', raio_ultima_torre: '', vao_apos_ultima_torre: '', tempo_maximo_diario: '', coef_uniformidade: '', diametro_maior_bocal: '', diametro_menor_bocal: '' });
    setOperadorForm({ nome: '', telefone: '', ativo: true });
  };

  const handleEditPivo = (pivo) => {
    setEditingItem(pivo);
    setPivoForm({
      numero: pivo.numero || '',
      nome: pivo.nome || '',
      status: pivo.status || 'Ativo',
      area_ha: pivo.area_ha || '',
      velocidade_100: pivo.velocidade_100 || '',
      vazao_m3h: pivo.vazao_m3h || '',
      pressao_servico: pivo.pressao_servico || '',
      raio_ultima_torre: pivo.raio_ultima_torre || '',
      vao_apos_ultima_torre: pivo.vao_apos_ultima_torre || '',
      tempo_maximo_diario: pivo.tempo_maximo_diario || '',
      coef_uniformidade: pivo.coef_uniformidade || '',
      diametro_maior_bocal: pivo.diametro_maior_bocal || '',
      diametro_menor_bocal: pivo.diametro_menor_bocal || ''
    });
    setDialogOpen(true);
  };

  const handleEditOperador = (operador) => {
    setEditingItem(operador);
    setOperadorForm({
      nome: operador.nome || '',
      telefone: operador.telefone || '',
      ativo: operador.ativo !== undefined ? operador.ativo : true
    });
    setDialogOpen(true);
  };

  const handleSubmitPivo = (e) => {
    e.preventDefault();
    const data = {
      numero: pivoForm.numero,
      nome: pivoForm.nome,
      status: pivoForm.status,
      localizacao: '',
      area_ha: pivoForm.area_ha ? parseFloat(pivoForm.area_ha) : null,
      velocidade_100: pivoForm.velocidade_100 ? parseFloat(pivoForm.velocidade_100) : null,
      vazao_m3h: pivoForm.vazao_m3h ? parseFloat(pivoForm.vazao_m3h) : null,
      pressao_servico: pivoForm.pressao_servico ? parseFloat(pivoForm.pressao_servico) : null,
      raio_ultima_torre: pivoForm.raio_ultima_torre ? parseFloat(pivoForm.raio_ultima_torre) : null,
      vao_apos_ultima_torre: pivoForm.vao_apos_ultima_torre ? parseFloat(pivoForm.vao_apos_ultima_torre) : null,
      tempo_maximo_diario: pivoForm.tempo_maximo_diario ? parseFloat(pivoForm.tempo_maximo_diario) : null,
      coef_uniformidade: pivoForm.coef_uniformidade ? parseFloat(pivoForm.coef_uniformidade) : null,
      diametro_maior_bocal: pivoForm.diametro_maior_bocal ? parseFloat(pivoForm.diametro_maior_bocal) : null,
      diametro_menor_bocal: pivoForm.diametro_menor_bocal ? parseFloat(pivoForm.diametro_menor_bocal) : null,
    };

    if (editingItem) {
      updatePivoMutation.mutate({ id: editingItem.id, data });
    } else {
      createPivoMutation.mutate(data);
    }
  };

  // Format phone number to (XX)XXXXX-XXXX
  const formatPhoneNumber = (value) => {
    // Remove all non-digits
    const numbers = value.replace(/\D/g, '');

    // Apply mask based on length
    if (numbers.length <= 2) {
      return numbers;
    } else if (numbers.length <= 7) {
      return `(${numbers.slice(0, 2)})${numbers.slice(2)}`;
    } else if (numbers.length <= 11) {
      return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    }

    // Limit to 11 digits
    return `(${numbers.slice(0, 2)})${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  };

  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setOperadorForm(p => ({ ...p, telefone: formatted }));
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
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl('Home')}>
              <Button variant="ghost" size="icon" className="h-12 w-12">
                <ArrowLeft className="w-6 h-6" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {activeTab === 'dashboard' ? 'Central de Cadastros' :
                  activeTab === 'pivos' ? 'Gerenciar Pivôs' :
                    activeTab === 'operadores' ? 'Gerenciar Operadores' : 'Cadastros'}
              </h1>
              <p className="text-slate-500 text-sm">
                {activeTab === 'dashboard' ? 'Gerencie todos os recursos do sistema' :
                  activeTab === 'pivos' ? 'Cadastre e edite seus pivôs centrais' :
                    activeTab === 'operadores' ? 'Cadastre e edite os operadores do sistema' : ''}
              </p>
            </div>
            {activeTab !== 'dashboard' && (
              <Button
                variant="outline"
                className="ml-auto"
                onClick={() => setActiveTab('dashboard')}
              >
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Voltar ao Menu
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {cards.map((card, index) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.entity}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200 border-none shadow-md overflow-hidden flex flex-col">
                    <div className={`h-2 w-full ${card.bg_color.replace('bg-', 'bg-opacity-50 ')}`}></div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className={`p-3 rounded-xl ${card.bg_color} ${card.theme_color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-right">
                          <span className="text-3xl font-bold text-slate-800 block">
                            {card.stats.count}
                          </span>
                          <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">
                            {card.stats.label}
                          </span>
                        </div>
                      </div>
                      <CardTitle className={`mt-4 text-lg ${card.theme_color}`}>
                        {card.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2 min-h-[40px]">
                        {card.description}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-4 mt-auto grid grid-cols-2 gap-3">
                      <Button
                        onClick={card.actions.primary.onClick}
                        className={`w-full ${card.btn_color} text-white shadow-sm ${!card.actions.secondary ? 'col-span-2' : ''}`}
                        size="sm"
                      >
                        {card.entity !== 'home' && <Plus className="w-4 h-4 mr-1" />}
                        {card.actions.primary.label}
                      </Button>
                      {card.actions.secondary && (
                        <Button
                          variant="outline"
                          onClick={card.actions.secondary.onClick}
                          className="w-full hover:bg-slate-50"
                          size="sm"
                        >
                          {card.actions.secondary.label}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* PIVÔS VIEW */}
        {activeTab === 'pivos' && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pivôs Cadastrados</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}>
                <DialogTrigger asChild>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Plus className="w-5 h-5 mr-2" />
                    Novo Pivô
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? 'Editar' : 'Novo'} Pivô</DialogTitle>
                    <DialogDescription>
                      Preencha as informações abaixo para {editingItem ? 'editar' : 'criar'} um pivô.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitPivo} className="space-y-4 mt-4">
                    {/* Pivo form fields... same as before */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label>Nome/Identificação *</Label>
                        <Input
                          value={pivoForm.nome}
                          onChange={(e) => setPivoForm(p => ({ ...p, nome: e.target.value }))}
                          placeholder="Ex: Pivô Central 01"
                          className="h-12 text-lg"
                          required
                        />
                      </div>
                      <div>
                        <Label>Número</Label>
                        <Input
                          value={pivoForm.numero}
                          onChange={(e) => setPivoForm(p => ({ ...p, numero: e.target.value }))}
                          placeholder="Ex: 01"
                          className="h-12 text-lg"
                        />
                      </div>
                      <div>
                        <Label>Status</Label>
                        <div className="flex items-center space-x-2 h-12">
                          <Switch
                            checked={pivoForm.status === 'Ativo'}
                            onCheckedChange={(checked) => setPivoForm(p => ({ ...p, status: checked ? 'Ativo' : 'Inativo' }))}
                          />
                          <span className={pivoForm.status === 'Ativo' ? 'text-green-600 font-medium' : 'text-slate-500'}>
                            {pivoForm.status}
                          </span>
                        </div>
                      </div>
                      {/* Other technical fields... */}
                      <div>
                        <Label>Área (ha)</Label>
                        <Input
                          type="number"
                          value={pivoForm.area_ha}
                          onChange={(e) => setPivoForm(p => ({ ...p, area_ha: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Vazão (m³/h)</Label>
                        <Input
                          type="number"
                          value={pivoForm.vazao_m3h}
                          onChange={(e) => setPivoForm(p => ({ ...p, vazao_m3h: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div className="border rounded-md px-3 py-2">
                      <details className="group">
                        <summary className="flex justify-between items-center font-medium cursor-pointer list-none">
                          <span className="text-sm font-semibold text-slate-700">Dados Técnicos</span>
                          <span className="transition group-open:rotate-180">
                            <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                          </span>
                        </summary>
                        <div className="text-neutral-600 mt-3 group-open:animate-fadeIn">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-xs">Velocidade a 100% (m/h)</Label>
                              <Input
                                type="number"
                                value={pivoForm.velocidade_100}
                                onChange={(e) => setPivoForm(p => ({ ...p, velocidade_100: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Tempo Máximo Diário (h)</Label>
                              <Input
                                type="number"
                                value={pivoForm.tempo_maximo_diario}
                                onChange={(e) => setPivoForm(p => ({ ...p, tempo_maximo_diario: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Pressão de Serviço (mca)</Label>
                              <Input
                                type="number"
                                value={pivoForm.pressao_servico}
                                onChange={(e) => setPivoForm(p => ({ ...p, pressao_servico: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Raio da Última Torre (m)</Label>
                              <Input
                                type="number"
                                value={pivoForm.raio_ultima_torre}
                                onChange={(e) => setPivoForm(p => ({ ...p, raio_ultima_torre: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Vão Após Última Torre (m)</Label>
                              <Input
                                type="number"
                                value={pivoForm.vao_apos_ultima_torre}
                                onChange={(e) => setPivoForm(p => ({ ...p, vao_apos_ultima_torre: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Coef. Uniformidade (%)</Label>
                              <Input
                                type="number"
                                value={pivoForm.coef_uniformidade}
                                onChange={(e) => setPivoForm(p => ({ ...p, coef_uniformidade: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Diâmetro Maior Bocal (mm)</Label>
                              <Input
                                type="number"
                                value={pivoForm.diametro_maior_bocal}
                                onChange={(e) => setPivoForm(p => ({ ...p, diametro_maior_bocal: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                            <div>
                              <Label className="text-xs">Diâmetro Menor Bocal (mm)</Label>
                              <Input
                                type="number"
                                value={pivoForm.diametro_menor_bocal}
                                onChange={(e) => setPivoForm(p => ({ ...p, diametro_menor_bocal: e.target.value }))}
                                className="h-10"
                              />
                            </div>
                          </div>
                        </div>
                      </details>
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
                      <TableHead>Status</TableHead>
                      <TableHead>Área (ha)</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pivos.map((pivo) => (
                      <TableRow key={pivo.id}>
                        <TableCell>{pivo.numero}</TableCell>
                        <TableCell className="font-medium">{pivo.nome}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${pivo.status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                            }`}>
                            {pivo.status}
                          </span>
                        </TableCell>
                        <TableCell>{pivo.area_ha || '-'}</TableCell>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

        {/* OPERADORES VIEW */}
        {activeTab === 'operadores' && (
          <Card className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Operadores Cadastrados</CardTitle>
              <Dialog open={dialogOpen} onOpenChange={(open) => {
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
                    <DialogDescription>
                      Preencha as informações abaixo para {editingItem ? 'editar' : 'criar'} um operador.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmitOperador} className="space-y-4 mt-4">
                    <div>
                      <Label>Nome Completo *</Label>
                      <Input
                        value={operadorForm.nome}
                        onChange={(e) => setOperadorForm(p => ({ ...p, nome: e.target.value }))}
                        placeholder="Ex: João da Silva"
                        className="h-12 text-lg"
                        required
                      />
                    </div>
                    <div>
                      <Label>Telefone / WhatsApp</Label>
                      <Input
                        value={operadorForm.telefone}
                        onChange={handlePhoneChange}
                        placeholder="Ex: (62) 99999-9999"
                        className="h-12 text-lg"
                        maxLength={14}
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
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {operadores.map((operador) => (
                      <TableRow key={operador.id}>
                        <TableCell className="font-medium">{operador.nome}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {operador.telefone || '-'}
                          </div>
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
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        )}

      </main>
    </div>
  );
}