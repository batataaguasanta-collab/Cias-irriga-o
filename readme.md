# 🌱 Sistema de Gestão de Irrigação por Pivô Central

Sistema full-stack para **controle operacional, monitoramento em tempo real e cálculo de eficiência** de irrigação por pivô central.

## 📌 Visão Geral Técnica

O sistema gerencia **ordens de irrigação**, acompanha a **posição angular do pivô**, controla **interrupções e retomadas**, e calcula **indicadores de eficiência operacional** com base em tempo efetivo irrigando.

Arquitetura orientada a eventos de status, com histórico auditável e sincronização entre lógica de negócio e representação gráfica.

---

## 🧱 Arquitetura (Visão Lógica)

**Frontend**

* Web responsivo (dashboard operacional)
* Componentes gráficos (pivô, progresso, arco angular)
* Atualização em tempo real (polling ou websocket)

**Backend**

* API REST
* Motor de regras de negócio (status, tempo, eficiência)
* Persistência relacional

**Banco de Dados**

* Relacional (PostgreSQL / MySQL)
* Histórico normalizado

---

## 📦 Entidades Principais

### Pivô

* id
* nome
* status

### Ordem de Irrigação

* id
* pivot_id
* parcela (TOTAL | ALTA | BAIXA)
* status (EM_ANDAMENTO | INTERROMPIDA | CONCLUIDA)
* angulo_atual
* progresso_percentual
* created_at

### Histórico de Status / Paradas

* id
* ordem_id
* status_anterior
* status_novo
* motivo_parada
* timestamp
* usuario

### Controle de Tempo

* ordem_id
* tempo_irrigando (segundos)
* tempo_parado (segundos)

---

## 🔄 Máquina de Estados da Ordem

```text
CRIADA → EM_ANDAMENTO → INTERROMPIDA → EM_ANDAMENTO → CONCLUIDA
```

Regras:

* Apenas ordens INTERROMPIDAS podem ser retomadas
* Retomar força status EM_ANDAMENTO
* Toda transição gera registro em histórico

---

## 🧭 Regra Angular e Progresso da Parcela

### Referência Angular

* 0° localizado no meio do lado esquerdo do círculo
* 0° = início da Parte Alta

### Segmentação (60° por setor)

| Parte | Faixa Angular | Descrição |
| ----- | ------------- | --------- |
| Alta  | 0–60          | Início    |
| Alta  | 61–120        | Meio      |
| Alta  | 121–180       | Fim       |
| Baixa | 181–240       | Início    |
| Baixa | 241–300       | Meio      |
| Baixa | 301–360       | Fim       |

### Regra Bidirecional

* Ângulo → calcula progresso
* Progresso → calcula ângulo médio da faixa

---

## ▶️ Botão Retomar (Regra de Negócio)

* Visível apenas quando status = INTERROMPIDA
* Ação:

  1. Atualiza status para EM_ANDAMENTO
  2. Registra histórico (data, hora, usuário)
  3. Reativa contadores de tempo

---

## ⏱️ Cálculo de Eficiência de Irrigação

### Contadores

* **Tempo Irrigando (TI):** soma dos períodos EM_ANDAMENTO
* **Tempo Parado (TP):** soma dos períodos INTERROMPIDA

### Fórmula

```text
Eficiência = TI / (TI + TP)
```

Cálculo sempre acumulado e persistido.

---

## 📊 Dashboards

### Acompanhamento de Irrigação

* Exibe apenas ordens EM_ANDAMENTO
* Dados principais:

  * pivô
  * ordem
  * parcela
  * ângulo
  * progresso
  * tempo irrigando

### Histórico do Pivô

* Todas as ordens
* Linha do tempo de status
* Indicadores médios de eficiência

---

## 🧪 Boas Práticas de Implementação

* Persistir tempo em segundos
* Nunca recalcular histórico (somente acumular)
* Separar regra de negócio da camada visual
* Garantir consistência entre gráfico e backend

---

## 🚧 Roadmap Técnico

* WebSocket para tempo real
* Integração com sensores/telemetria
* Alertas automáticos de parada
* Exportação de relatórios

---

## 📄 Licença

Definir conforme política da organização.
