
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

                {/* Seção 1: Identificação */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Data de Início</Label>
                        <Input
                            type="date"
                            value={formData.data}
                            onChange={(e) => handleChange('data', e.target.value)}
                            required
                            className="h-12"
                        />
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
                        <Label>Pivô</Label>
                        <Select
                            value={formData.pivo_id}
                            onValueChange={(v) => handleChange('pivo_id', v)}
                            required
                        >
                            <SelectTrigger className="h-12 bg-blue-50/50 border-blue-100">
                                <SelectValue placeholder="Selecione o pivô" />
                            </SelectTrigger>
                            <SelectContent>
                                {pivos.map((pivo) => (
                                    <SelectItem key={pivo.id} value={pivo.id}>
                                        {pivo.numero} - {pivo.nome} ({pivo.area_hectares}ha)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Parcela / Localização</Label>
                        <Input
                            value={formData.parcela}
                            onChange={(e) => handleChange('parcela', e.target.value)}
                            placeholder="Ex: Todas, Setor A, 0-180 graus"
                            className="h-12"
                            required
                        />
                    </div>
                </div>

                {/* Seção 2: Parâmetros de Irrigação */}
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

                {/* Seção 3: Opcionais */}
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
