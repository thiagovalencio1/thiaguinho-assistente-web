// Motor de IA Avançado para Assistente Virtual Automotivo
export class AIEngine {
  constructor() {
    this.dtcDatabase = new Map()
    this.maintenanceRules = new Map()
    this.conversationHistory = []
    this.userProfile = {}
    this.vehicleData = {}
    this.initializeDatabases()
  }

  initializeDatabases() {
    // Base de dados de DTCs expandida
    this.dtcDatabase.set('P0171', {
      description: 'Sistema muito pobre (Banco 1)',
      causes: [
        'Vazamento de vácuo',
        'Filtro de ar sujo',
        'Sensor MAF defeituoso',
        'Injetores entupidos',
        'Bomba de combustível fraca'
      ],
      solutions: [
        'Verificar mangueiras de vácuo',
        'Substituir filtro de ar',
        'Limpar sensor MAF',
        'Limpeza de injetores',
        'Testar pressão da bomba'
      ],
      urgency: 'Médio',
      estimatedCost: { min: 50, max: 300 },
      difficulty: 'Médio'
    })

    this.dtcDatabase.set('P0301', {
      description: 'Falha de ignição no cilindro 1',
      causes: [
        'Vela de ignição defeituosa',
        'Bobina de ignição com problema',
        'Cabo de vela danificado',
        'Compressão baixa no cilindro',
        'Injetor entupido'
      ],
      solutions: [
        'Substituir vela de ignição',
        'Testar/substituir bobina',
        'Verificar cabos de vela',
        'Teste de compressão',
        'Limpeza de injetores'
      ],
      urgency: 'Alto',
      estimatedCost: { min: 80, max: 500 },
      difficulty: 'Médio'
    })

    this.dtcDatabase.set('P0420', {
      description: 'Eficiência do catalisador abaixo do limite',
      causes: [
        'Catalisador danificado',
        'Sonda lambda defeituosa',
        'Vazamento no escapamento',
        'Combustível de má qualidade'
      ],
      solutions: [
        'Substituir catalisador',
        'Verificar sondas lambda',
        'Reparar vazamentos',
        'Usar combustível de qualidade'
      ],
      urgency: 'Médio',
      estimatedCost: { min: 200, max: 1500 },
      difficulty: 'Alto'
    })

    // Regras de manutenção preventiva
    this.maintenanceRules.set('oil_change', {
      interval: 10000, // km
      timeInterval: 6, // meses
      description: 'Troca de óleo e filtro',
      importance: 'Crítico',
      estimatedCost: { min: 80, max: 150 }
    })

    this.maintenanceRules.set('air_filter', {
      interval: 15000,
      timeInterval: 12,
      description: 'Substituição do filtro de ar',
      importance: 'Médio',
      estimatedCost: { min: 30, max: 80 }
    })

    this.maintenanceRules.set('brake_pads', {
      interval: 30000,
      timeInterval: 24,
      description: 'Verificação/troca de pastilhas de freio',
      importance: 'Crítico',
      estimatedCost: { min: 150, max: 400 }
    })
  }

  // Processamento de linguagem natural
  processMessage(message, context = {}) {
    const lowerMessage = message.toLowerCase()
    const intent = this.detectIntent(lowerMessage)
    const entities = this.extractEntities(lowerMessage)
    
    this.conversationHistory.push({
      message,
      intent,
      entities,
      timestamp: new Date(),
      context
    })

    return this.generateResponse(intent, entities, context)
  }

  detectIntent(message) {
    const intents = {
      dtc_inquiry: ['dtc', 'código', 'erro', 'falha', 'problema', 'p0', 'diagnóstico'],
      maintenance_inquiry: ['manutenção', 'troca', 'óleo', 'filtro', 'revisão', 'quando'],
      fuel_inquiry: ['consumo', 'combustível', 'gasolina', 'álcool', 'economia', 'km/l'],
      performance_inquiry: ['desempenho', 'potência', 'aceleração', 'velocidade'],
      cost_inquiry: ['custo', 'preço', 'valor', 'quanto custa', 'orçamento'],
      emergency: ['emergência', 'urgente', 'parou', 'não liga', 'socorro'],
      greeting: ['olá', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
      help: ['ajuda', 'como', 'o que', 'posso', 'funciona']
    }

    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => message.includes(keyword))) {
        return intent
      }
    }

    return 'general'
  }

  extractEntities(message) {
    const entities = {}
    
    // Extração de códigos DTC
    const dtcMatch = message.match(/p\d{4}/gi)
    if (dtcMatch) {
      entities.dtc_codes = dtcMatch.map(code => code.toUpperCase())
    }

    // Extração de números (quilometragem, valores)
    const numberMatch = message.match(/\d+(?:\.\d+)?/g)
    if (numberMatch) {
      entities.numbers = numberMatch.map(num => parseFloat(num))
    }

    // Extração de componentes do veículo
    const components = ['óleo', 'filtro', 'vela', 'freio', 'pneu', 'bateria', 'motor']
    entities.components = components.filter(comp => message.includes(comp))

    return entities
  }

  generateResponse(intent, entities, context) {
    switch (intent) {
      case 'dtc_inquiry':
        return this.handleDTCInquiry(entities, context)
      
      case 'maintenance_inquiry':
        return this.handleMaintenanceInquiry(entities, context)
      
      case 'fuel_inquiry':
        return this.handleFuelInquiry(entities, context)
      
      case 'performance_inquiry':
        return this.handlePerformanceInquiry(entities, context)
      
      case 'cost_inquiry':
        return this.handleCostInquiry(entities, context)
      
      case 'emergency':
        return this.handleEmergency(entities, context)
      
      case 'greeting':
        return this.handleGreeting(context)
      
      case 'help':
        return this.handleHelp(context)
      
      default:
        return this.handleGeneral(entities, context)
    }
  }

  handleDTCInquiry(entities, context) {
    if (entities.dtc_codes && entities.dtc_codes.length > 0) {
      const code = entities.dtc_codes[0]
      const dtcInfo = this.dtcDatabase.get(code)
      
      if (dtcInfo) {
        return `🔍 **Código ${code} - ${dtcInfo.description}**\n\n` +
               `**Possíveis causas:**\n${dtcInfo.causes.map(cause => `• ${cause}`).join('\n')}\n\n` +
               `**Soluções recomendadas:**\n${dtcInfo.solutions.map(sol => `• ${sol}`).join('\n')}\n\n` +
               `**Urgência:** ${dtcInfo.urgency}\n` +
               `**Custo estimado:** R$ ${dtcInfo.estimatedCost.min}-${dtcInfo.estimatedCost.max}\n` +
               `**Dificuldade:** ${dtcInfo.difficulty}`
      } else {
        return `🔍 **Código ${code}**\n\nEste código não está na minha base de dados atual. Recomendo consultar um mecânico especializado para diagnóstico preciso.\n\n💡 **Dica:** Códigos que começam com P são relacionados ao motor e transmissão.`
      }
    }
    
    return '🔍 **Diagnóstico Automotivo**\n\nPosso ajudar com códigos DTC! Digite o código (ex: P0171) ou conecte seu scanner ELM327 para diagnóstico automático.\n\n**Funcionalidades disponíveis:**\n• Análise de códigos DTC\n• Diagnóstico de problemas\n• Estimativas de custo\n• Orientações de reparo'
  }

  handleMaintenanceInquiry(entities, context) {
    const vehicleKm = context.currentKm || 45230
    const lastOilChange = context.lastOilChange || '2024-01-15'
    
    if (entities.components && entities.components.includes('óleo')) {
      const nextOilChange = vehicleKm + (10000 - (vehicleKm % 10000))
      const kmUntilOil = nextOilChange - vehicleKm
      
      return `🛢️ **Troca de Óleo**\n\n` +
             `**Status atual:**\n` +
             `• Quilometragem: ${vehicleKm.toLocaleString()} km\n` +
             `• Última troca: ${lastOilChange}\n` +
             `• Próxima troca: ${nextOilChange.toLocaleString()} km\n` +
             `• Faltam: ${kmUntilOil.toLocaleString()} km\n\n` +
             `**Recomendações:**\n` +
             `• Óleo sintético 5W-30\n` +
             `• Trocar filtro junto\n` +
             `• Custo estimado: R$ 80-150\n\n` +
             `${kmUntilOil < 1000 ? '⚠️ **Atenção:** Troca próxima!' : '✅ **Status:** Em dia'}`
    }
    
    return `🔧 **Manutenção Preventiva**\n\n` +
           `**Próximas manutenções:**\n` +
           `• Troca de óleo: ${Math.max(0, 50000 - vehicleKm)} km\n` +
           `• Filtro de ar: ${Math.max(0, 47000 - vehicleKm)} km\n` +
           `• Pastilhas de freio: ${Math.max(0, 60000 - vehicleKm)} km\n\n` +
           `💡 **Dica:** Manutenção preventiva evita problemas maiores e economiza dinheiro!`
  }

  handleFuelInquiry(entities, context) {
    const avgConsumption = context.avgConsumption || 14.2
    const recentTrips = [
      { date: '10/03', liters: 35.2, consumption: 14.5 },
      { date: '25/02', liters: 38.1, consumption: 13.8 },
      { date: '15/02', liters: 42.0, consumption: 14.1 }
    ]
    
    const trend = this.calculateConsumptionTrend(recentTrips)
    
    return `⛽ **Análise de Consumo**\n\n` +
           `**Consumo atual:** ${avgConsumption} km/l\n` +
           `**Tendência:** ${trend.direction} ${trend.emoji}\n\n` +
           `**Últimos abastecimentos:**\n` +
           `${recentTrips.map(trip => `• ${trip.date}: ${trip.liters}L - ${trip.consumption} km/l`).join('\n')}\n\n` +
           `**Dicas para economia:**\n` +
           `• Mantenha pneus calibrados\n` +
           `• Evite acelerações bruscas\n` +
           `• Faça manutenção em dia\n` +
           `• Use ar condicionado com moderação`
  }

  handlePerformanceInquiry(entities, context) {
    return `🏁 **Análise de Desempenho**\n\n` +
           `**Dados atuais:**\n` +
           `• Potência estimada: 85% do nominal\n` +
           `• Torque: Normal\n` +
           `• Resposta do acelerador: Boa\n\n` +
           `**Para melhorar o desempenho:**\n` +
           `• Limpeza de injetores\n` +
           `• Troca de velas\n` +
           `• Filtro de ar limpo\n` +
           `• Combustível de qualidade\n\n` +
           `💡 **Dica:** Manutenção regular mantém o desempenho ideal!`
  }

  handleCostInquiry(entities, context) {
    return `💰 **Estimativas de Custo**\n\n` +
           `**Manutenções básicas:**\n` +
           `• Troca de óleo: R$ 80-150\n` +
           `• Filtro de ar: R$ 30-80\n` +
           `• Velas: R$ 120-300\n` +
           `• Pastilhas de freio: R$ 150-400\n\n` +
           `**Reparos comuns:**\n` +
           `• Limpeza de injetores: R$ 150-250\n` +
           `• Troca de bateria: R$ 200-400\n` +
           `• Alinhamento: R$ 50-100\n\n` +
           `💡 **Dica:** Preços podem variar por região e marca das peças.`
  }

  handleEmergency(entities, context) {
    return `🚨 **Emergência Automotiva**\n\n` +
           `**Passos imediatos:**\n` +
           `1. Mantenha a calma\n` +
           `2. Ligue o pisca-alerta\n` +
           `3. Pare em local seguro\n` +
           `4. Avalie a situação\n\n` +
           `**Contatos de emergência:**\n` +
           `• Guincho: 193\n` +
           `• Seguro auto: Verifique sua apólice\n` +
           `• Mecânico de confiança\n\n` +
           `**Descreva o problema para ajuda específica!**`
  }

  handleGreeting(context) {
    const hour = new Date().getHours()
    let greeting = 'Olá'
    
    if (hour < 12) greeting = 'Bom dia'
    else if (hour < 18) greeting = 'Boa tarde'
    else greeting = 'Boa noite'
    
    return `${greeting}! 👋 Sou seu Copiloto Digital!\n\n` +
           `**Como posso ajudar hoje?**\n` +
           `• Diagnóstico de problemas\n` +
           `• Informações de manutenção\n` +
           `• Análise de consumo\n` +
           `• Estimativas de custo\n` +
           `• Dicas de economia\n\n` +
           `Digite sua dúvida ou use os botões de atalho! 😊`
  }

  handleHelp(context) {
    return `❓ **Central de Ajuda**\n\n` +
           `**Comandos úteis:**\n` +
           `• "P0171" - Consultar código DTC\n` +
           `• "Quando trocar óleo?" - Manutenção\n` +
           `• "Como está meu consumo?" - Combustível\n` +
           `• "Quanto custa?" - Estimativas\n\n` +
           `**Funcionalidades:**\n` +
           `• Scanner ELM327 integrado\n` +
           `• Diagnóstico inteligente\n` +
           `• Lembretes automáticos\n` +
           `• Relatórios detalhados\n\n` +
           `**Precisa de algo específico? Só perguntar!** 🚗`
  }

  handleGeneral(entities, context) {
    return `🤖 **Assistente Virtual Automotivo**\n\n` +
           `Entendi sua mensagem! Posso ajudar com:\n\n` +
           `• **Diagnóstico:** Códigos DTC e problemas\n` +
           `• **Manutenção:** Quando fazer e custos\n` +
           `• **Consumo:** Análise e dicas de economia\n` +
           `• **Desempenho:** Otimização do veículo\n\n` +
           `Seja mais específico para uma resposta detalhada! 😊\n\n` +
           `**Exemplo:** "P0171", "Quando trocar óleo?", "Como melhorar consumo?"`
  }

  calculateConsumptionTrend(trips) {
    if (trips.length < 2) return { direction: 'Estável', emoji: '📊' }
    
    const recent = trips[0].consumption
    const previous = trips[1].consumption
    const diff = recent - previous
    
    if (diff > 0.3) return { direction: 'Melhorando', emoji: '📈' }
    if (diff < -0.3) return { direction: 'Piorando', emoji: '📉' }
    return { direction: 'Estável', emoji: '📊' }
  }

  // Análise preditiva
  predictMaintenance(vehicleData) {
    const predictions = []
    const currentKm = vehicleData.currentKm || 45230
    
    // Predição baseada em quilometragem
    for (const [key, rule] of this.maintenanceRules) {
      const nextDue = Math.ceil(currentKm / rule.interval) * rule.interval
      const kmUntil = nextDue - currentKm
      
      if (kmUntil <= 2000) {
        predictions.push({
          type: key,
          description: rule.description,
          dueKm: nextDue,
          kmUntil,
          urgency: kmUntil <= 500 ? 'Alto' : 'Médio',
          estimatedCost: rule.estimatedCost
        })
      }
    }
    
    return predictions.sort((a, b) => a.kmUntil - b.kmUntil)
  }

  // Análise de sentimento e urgência
  analyzeSentiment(message) {
    const urgentWords = ['urgente', 'emergência', 'parou', 'não liga', 'socorro', 'ajuda']
    const negativeWords = ['problema', 'erro', 'falha', 'ruim', 'estranho', 'barulho']
    const positiveWords = ['bom', 'ótimo', 'funcionando', 'normal', 'ok']
    
    const isUrgent = urgentWords.some(word => message.toLowerCase().includes(word))
    const isNegative = negativeWords.some(word => message.toLowerCase().includes(word))
    const isPositive = positiveWords.some(word => message.toLowerCase().includes(word))
    
    return {
      urgency: isUrgent ? 'high' : 'normal',
      sentiment: isPositive ? 'positive' : isNegative ? 'negative' : 'neutral'
    }
  }

  // Recomendações personalizadas
  generateRecommendations(vehicleData, userProfile) {
    const recommendations = []
    const currentKm = vehicleData.currentKm || 45230
    const avgConsumption = vehicleData.avgConsumption || 14.2
    
    // Recomendações baseadas em quilometragem
    if (currentKm > 40000 && currentKm < 60000) {
      recommendations.push({
        type: 'maintenance',
        title: 'Manutenção Preventiva',
        description: 'Seu veículo está na faixa ideal para revisão completa',
        priority: 'medium'
      })
    }
    
    // Recomendações baseadas em consumo
    if (avgConsumption < 12) {
      recommendations.push({
        type: 'fuel',
        title: 'Otimização de Consumo',
        description: 'Consumo abaixo do esperado. Verifique filtros e injetores',
        priority: 'medium'
      })
    }
    
    return recommendations
  }
}

// Instância global do motor de IA
export const aiEngine = new AIEngine()

