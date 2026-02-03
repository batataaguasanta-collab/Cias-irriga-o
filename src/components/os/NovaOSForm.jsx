import React, { useState, useEffect } from 'react';
import { getTalhoes, getOperadores, createOrdem } from '@/lib/supabase';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Save, Send } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export default function NovaOSForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [talhoes, setTalhoes] = useState([]);
  const [operadores, setOperadores] = useState([]);
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    data: format(new Date(), 'yyyy-MM-dd'),
    hora_inicio: format(new Date(), 'HH:mm'),
    talhao_id: '',
    localizacao: 'TOTAL',
    movimentacao: 'Com Água',
    status_operacao: 'Irrigando',
    volume_tipo: 'milimetros',
    volume_valor: '',
    sentido_rotacao: 'Avanço (Horário)',
    aplicar_insumos: false,
    insumos_descricao: '',
    operador_id: '',
    observacoes: '',
  });

  const getCulturaIcon = (nome) => {
    if (!nome) return '🌱';
    const n = nome.toLowerCase();
    if (n.includes('milho')) return '🌽';
    if (n.includes('soja')) return '🌱';
    if (n.includes('trigo')) return '🌾';
    if (n.includes('feijão') || n.includes('feijao')) return '🫘';
    if (n.includes('algodão') || n.includes('algodao')) return '☁️';
    if (n.includes('café') || n.includes('cafe')) return '☕';
    if (n.includes('batata')) return '🥔';
    if (n.includes('tomate')) return '🍅';
    if (n.includes('uva')) return '🍇';
    if (n.includes('cana')) return '🎋';
    return '🌱';
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [talhoesData, operadoresData] = await Promise.all([
        getTalhoes(),
        getOperadores()
      ]);
      setTalhoes(talhoesData);
      setOperadores(operadoresData.filter(o => o.ativo));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      toast.error("Erro ao carregar talhões e operadores");
    }
  };

  const selectedTalhao = talhoes.find(t => t.id === formData.talhao_id);
  const selectedOperador = operadores.find(o => o.id === formData.operador_id);
  // Inferir o pivô a partir do talhão selecionado
  const selectedPivo = selectedTalhao?.pivo;

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateOSNumber = () => {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `OS-${year}${month}${day}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!selectedPivo) {
      toast.error("Erro: O talhão selecionado não tem um pivô associado.");
      setLoading(false);
      return;
    }

    try {
      // Concatenar talhão nas observações se não houver campo específico
      // Concatenar talhão nas observações se não houver campo específico
      const obsComTalhao = `Talhão: ${selectedTalhao.nome}\n${formData.observacoes}`;

      // Preparar dados para o formato do banco de dados
      const osData = {
        data_inicio: formData.data,
        hora_inicio: formData.hora_inicio,
        pivo_id: selectedPivo.id, // ID do pivô vindo do talhão
        operador_id: formData.operador_id,
        parcela: formData.localizacao, // Usar a opção ALTA/BAIXA/TOTAL como 'parcela'
        movimentacao: formData.movimentacao,
        volume_tipo: formData.volume_tipo,
        volume_valor: parseFloat(formData.volume_valor) || 0,
        sentido_rotacao: formData.sentido_rotacao,
        aplicar_insumos: formData.aplicar_insumos,
        insumos_descricao: formData.insumos_descricao,
        observacoes: obsComTalhao,
        solicitante: user?.user_metadata?.full_name || user?.email,

        numero_os: generateOSNumber(),
        pivo_numero: selectedPivo.numero,
        operador_nome: selectedOperador?.nome,
        status: 'Pendente',
      };

      await createOrdem(osData);

      toast.success("Ordem de serviço criada com sucesso!");
      onSuccess?.();
    } catch (error) {
      console.error("Erro ao criar OS:", error);
      toast.error(`Erro: ${error.message || "Falha ao criar OS"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="shadow-lg border-emerald-100">
      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-6">
        <CardTitle className="flex items-center gap-2 text-emerald-800">
          <Send className="w-5 h-5" />
          Dados da Nova Ordem
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Data e Hora de Início</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleChange('data', e.target.value)}
                    required
                    className="h-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
                <div className="w-32 relative">
                  <Input
                    type="time"
                    value={formData.hora_inicio}
                    onChange={(e) => handleChange('hora_inicio', e.target.value)}
                    required
                    className="h-12 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-3 [&::-webkit-calendar-picker-indicator]:cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Operador Responsável</Label>
              <Select
                value={formData.operador_id}
                onValueChange={(v) => handleChange('operador_id', v)}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione o operador" />
                </SelectTrigger>
                <SelectContent>
                  {operadores.map((op) => (
                    <SelectItem key={op.id} value={op.id}>{op.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Talhão</Label>
              <Select
                value={formData.talhao_id}
                onValueChange={(v) => handleChange('talhao_id', v)}
                required
              >
                <SelectTrigger className="h-12 bg-blue-50/50 border-blue-100">
                  <SelectValue placeholder="Selecione o talhão" />
                </SelectTrigger>
                <SelectContent>
                  {talhoes.map((talhao) => (
                    <SelectItem key={talhao.id} value={talhao.id}>
                      <span className="flex items-center gap-2">
                        <span className="text-lg" title={talhao.cultura?.nome}>{getCulturaIcon(talhao.cultura?.nome)}</span>
                        <span>{talhao.nome}</span>
                        {talhao.pivo && <span className="text-slate-400 text-xs ml-1">- Pivô {talhao.pivo.numero}</span>}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedPivo && (
                <p className="text-sm text-emerald-600 font-medium ml-1">
                  Pivô identificado: {selectedPivo.nome} (Pivô {selectedPivo.numero})
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Parcela / Localização</Label>
              <Select
                value={formData.localizacao}
                onValueChange={(v) => handleChange('localizacao', v)}
                required
              >
                <SelectTrigger className="h-12">
                  <SelectValue placeholder="Selecione a opção" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALTA">ALTA</SelectItem>
                  <SelectItem value="BAIXA">BAIXA</SelectItem>
                  <SelectItem value="TOTAL">TOTAL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-xl border border-slate-100 space-y-6">
            <h3 className="font-semibold text-slate-700 flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-blue-500" />
              Parâmetros de Operação
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label>Tipo de Operação</Label>
                <RadioGroup
                  value={formData.movimentacao}
                  onValueChange={(v) => handleChange('movimentacao', v)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2 border p-3 rounded-lg bg-white">
                    <RadioGroupItem value="Com Água" id="r1" />
                    <Label htmlFor="r1" className="cursor-pointer flex-1">Com Água (Irrigando)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg bg-white">
                    <RadioGroupItem value="Sem Água" id="r2" />
                    <Label htmlFor="r2" className="cursor-pointer flex-1">Sem Água (Apenas Movimento)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label>Sentido de Rotação</Label>
                <RadioGroup
                  value={formData.sentido_rotacao}
                  onValueChange={(v) => handleChange('sentido_rotacao', v)}
                  className="flex flex-col gap-2"
                >
                  <div className="flex items-center space-x-2 border p-3 rounded-lg bg-white">
                    <RadioGroupItem value="Avanço (Horário)" id="s1" />
                    <Label htmlFor="s1" className="cursor-pointer flex-1">Avanço (Horário)</Label>
                  </div>
                  <div className="flex items-center space-x-2 border p-3 rounded-lg bg-white">
                    <RadioGroupItem value="Reverso (Anti-horário)" id="s2" />
                    <Label htmlFor="s2" className="cursor-pointer flex-1">Reverso (Anti-horário)</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lâmina / Velocidade</Label>
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    type="number"
                    value={formData.volume_valor}
                    onChange={(e) => handleChange('volume_valor', e.target.value)}
                    placeholder="Valor"
                    className="h-12 text-lg font-mono"
                    step="0.1"
                    required
                  />
                </div>
                <div className="w-40">
                  <Select
                    value={formData.volume_tipo}
                    onValueChange={(v) => handleChange('volume_tipo', v)}
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="milimetros">mm (Lâmina)</SelectItem>
                      <SelectItem value="percentual">% (Velocidade)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-slate-50 transition-colors">
              <div className="space-y-0.5">
                <Label className="text-base">Aplicação de Insumos</Label>
                <p className="text-sm text-slate-500">
                  Ative se houver fertirrigação ou aplicação de defensivos
                </p>
              </div>
              <Switch
                checked={formData.aplicar_insumos}
                onCheckedChange={(v) => handleChange('aplicar_insumos', v)}
              />
            </div>

            {formData.aplicar_insumos && (
              <div className="ml-4 pl-4 border-l-2 border-emerald-200 animate-in slide-in-from-top-2">
                <Label>Descrição dos Produtos / Dosagem</Label>
                <Textarea
                  value={formData.insumos_descricao}
                  onChange={(e) => handleChange('insumos_descricao', e.target.value)}
                  placeholder="Liste os produtos e quantidades..."
                  className="mt-2"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>Observações Gerais</Label>
              <Textarea
                value={formData.observacoes}
                onChange={(e) => handleChange('observacoes', e.target.value)}
                placeholder="Instruções adicionais para o operador..."
                className="h-24 resize-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1 h-14 text-lg"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-[2] h-14 text-lg bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                  Gerando Ordem...
                </>
              ) : (
                <>
                  <Save className="w-6 h-6 mr-2" />
                  Emitir Ordem de Serviço
                </>
              )}
            </Button>
          </div>

        </form>
      </CardContent>
    </Card>
  );
}
