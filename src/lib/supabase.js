import { supabase } from './supabaseClient'

// ============================================
// OPERADORES
// ============================================

export const getOperadores = async () => {
    const { data, error } = await supabase
        .from('operadores')
        .select('*')
        .order('nome', { ascending: true })

    if (error) throw error
    return data
}

export const createOperador = async (operador) => {
    const { data, error } = await supabase
        .from('operadores')
        .insert([operador])
        .select()
        .single()

    if (error) throw error
    return data
}

export const updateOperador = async (id, updates) => {
    const { data, error } = await supabase
        .from('operadores')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export const deleteOperador = async (id) => {
    const { error } = await supabase
        .from('operadores')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// ============================================
// PIVÔS
// ============================================

export const getPivos = async () => {
    const { data, error } = await supabase
        .from('pivos')
        .select('*')
        .order('numero', { ascending: true })

    if (error) throw error
    return data
}

export const createPivo = async (pivo) => {
    const { data, error } = await supabase
        .from('pivos')
        .insert([pivo])
        .select()
        .single()

    if (error) throw error
    return data
}

export const updatePivo = async (id, updates) => {
    const { data, error } = await supabase
        .from('pivos')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error
    return data
}

export const deletePivo = async (id) => {
    const { error } = await supabase
        .from('pivos')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// ============================================
// ORDENS DE SERVIÇO
// ============================================

export const getOrdens = async (limit = 100) => {
    const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .order('created_date', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

export const getOrdensByPivo = async (pivoId) => {
    const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .eq('pivo_id', pivoId)
        .order('created_date', { ascending: false })

    if (error) throw error
    return data
}

export const getOrdemById = async (id) => {
    const { data, error } = await supabase
        .from('ordens_servico')
        .select('*')
        .eq('id', id)
        .single()

    if (error) throw error
    return data
}

export const createOrdem = async (ordem) => {
    // Gerar número da OS se não fornecido
    if (!ordem.numero_os) {
        const timestamp = Date.now().toString().slice(-6)
        ordem.numero_os = `OS-${timestamp}`
    }

    const { data, error } = await supabase
        .from('ordens_servico')
        .insert([ordem])
        .select()
        .single()

    if (error) throw error

    // Criar registro no histórico
    await createHistoricoStatus(data.id, null, data.status, 'Ordem criada')

    return data
}

export const updateOrdem = async (id, updates) => {
    // Buscar status anterior
    const ordemAtual = await getOrdemById(id)

    const { data, error } = await supabase
        .from('ordens_servico')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

    if (error) throw error

    // Se status mudou, registrar no histórico
    if (updates.status && updates.status !== ordemAtual.status) {
        await createHistoricoStatus(
            id,
            ordemAtual.status,
            updates.status,
            updates.motivo_parada || 'Mudança de status'
        )
    }

    return data
}

export const deleteOrdem = async (id) => {
    const { error } = await supabase
        .from('ordens_servico')
        .delete()
        .eq('id', id)

    if (error) throw error
}

// ============================================
// HISTÓRICO DE STATUS
// ============================================

export const getHistoricoOrdem = async (ordemId) => {
    const { data, error } = await supabase
        .from('historico_status')
        .select('*')
        .eq('ordem_id', ordemId)
        .order('timestamp', { ascending: false })

    if (error) throw error
    return data
}

export const createHistoricoStatus = async (ordemId, statusAnterior, statusNovo, motivo = '', usuario = 'Sistema') => {
    const { data, error } = await supabase
        .from('historico_status')
        .insert([{
            ordem_id: ordemId,
            status_anterior: statusAnterior,
            status_novo: statusNovo,
            motivo_parada: motivo,
            usuario: usuario
        }])
        .select()
        .single()

    if (error) throw error
    return data
}

// ============================================
// CÁLCULOS DE IRRIGAÇÃO
// ============================================

/**
 * Calcula o ângulo baseado no progresso percentual e na parcela
 * @param {number} progresso - Progresso em percentual (0-100)
 * @param {string} parcela - 'TOTAL', 'ALTA' ou 'BAIXA'
 * @returns {number} Ângulo calculado (0-360)
 */
export const calcularAnguloPorProgresso = (progresso, parcela) => {
    if (parcela === 'TOTAL') {
        return (progresso / 100) * 360
    } else if (parcela === 'ALTA') {
        return (progresso / 100) * 180
    } else if (parcela === 'BAIXA') {
        return 180 + ((progresso / 100) * 180)
    }
    return 0
}

/**
 * Calcula o progresso percentual baseado no ângulo e na parcela
 * @param {number} angulo - Ângulo atual (0-360)
 * @param {string} parcela - 'TOTAL', 'ALTA' ou 'BAIXA'
 * @returns {number} Progresso em percentual (0-100)
 */
export const calcularProgressoPorAngulo = (angulo, parcela) => {
    if (parcela === 'TOTAL') {
        return (angulo / 360) * 100
    } else if (parcela === 'ALTA') {
        return (angulo / 180) * 100
    } else if (parcela === 'BAIXA') {
        return ((angulo - 180) / 180) * 100
    }
    return 0
}

/**
 * Calcula a eficiência de irrigação
 * @param {number} tempoIrrigando - Tempo irrigando em segundos
 * @param {number} tempoParado - Tempo parado em segundos
 * @returns {number} Eficiência em percentual (0-100)
 */
export const calcularEficiencia = (tempoIrrigando, tempoParado) => {
    const tempoTotal = tempoIrrigando + tempoParado
    if (tempoTotal === 0) return 0
    return (tempoIrrigando / tempoTotal) * 100
}
