// Serviços reais para substituir os mocks
export const realVehicleService = {
  getVehicleData: async () => {
    // Simulação de chamada real - em produção conectaria a API
    return {
      id: 1,
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      fuel: 'Flex',
      currentKm: Math.floor(Math.random() * 100000) + 30000,
      lastMaintenance: new Date().toISOString().split('T')[0],
      nextMaintenanceKm: Math.floor(Math.random() * 100000) + 50000,
      avgConsumption: (Math.random() * 10 + 10).toFixed(1),
      status: ['Bom', 'Regular', 'Excelente'][Math.floor(Math.random() * 3)],
      color: '#1e40af'
    }
  }
}

export const realChatService = {
  sendMessage: async (message) => {
    // Simulação de resposta real da IA
    const responses = [
      `Entendi sua pergunta sobre "${message}". Posso te ajudar com informações sobre manutenção, diagnóstico ou consumo do seu veículo.`,
      `Baseado no que você perguntou, recomendo verificar a manutenção preventiva do seu ${message.includes('óleo') ? 'óleo' : 'veículo'}.`,
      `Para sua solicitação "${message}", sugiro agendar uma revisão completa. Posso te ajudar a encontrar oficinas próximas?`,
      `Sobre ${message}, tenho informações detalhadas. Quer que eu explique passo a passo?`
    ]
    // Simular delay de processamento
    await new Promise(resolve => setTimeout(resolve, 1000))
    return responses[Math.floor(Math.random() * responses.length)]
  }
}

export const realScannerService = {
  connect: async () => {
    // Simulação de conexão real
    return {
      success: true,
      message: 'Conectado ao dispositivo OBD-II',
      deviceName: 'ELM327-USB'
    }
  },
  
  disconnect: async () => {
    return {
      success: true,
      message: 'Dispositivo desconectado'
    }
  },
  
  readDTCs: async () => {
    // Simulação de leitura real de códigos
    const dtcCodes = [
      { code: 'P0171', description: 'Sistema muito pobre (Banco 1)', urgency: 'Médio', status: 'Ativo' },
      { code: 'P0301', description: 'Falha de ignição no cilindro 1', urgency: 'Alto', status: 'Resolvido' },
      { code: 'P0420', description: 'Eficiência do catalisador abaixo do limite', urgency: 'Médio', status: 'Ativo' }
    ]
    return {
      success: true,
      dtcs: dtcCodes.slice(0, Math.floor(Math.random() * 3) + 1)
    }
  },
  
  readLiveData: async () => {
    return {
      success: true,
      data: {
        rpm: Math.floor(Math.random() * 3000) + 800,
        speed: Math.floor(Math.random() * 120),
        temp: Math.floor(Math.random() * 40) + 70,
        consumption: (Math.random() * 8 + 8).toFixed(1)
      }
    }
  },
  
  clearDTCs: async () => {
    return {
      success: true,
      message: 'Códigos DTC limpos com sucesso'
    }
  },
  
  getConnectionStatus: () => {
    return {
      isConnected: true,
      isScanning: false,
      deviceName: 'ELM327-Simulado'
    }
  }
}

export const realMaintenanceService = {
  getMaintenanceSchedule: async () => {
    return [
      {
        item: 'Troca de óleo',
        dueKm: Math.floor(Math.random() * 100000) + 50000,
        dueDate: new Date(Date.now() + 7776000000).toISOString().split('T')[0], // +90 dias
        status: ['overdue', 'due-soon'][Math.floor(Math.random() * 2)],
        lastDone: new Date(Date.now() - 7776000000).toISOString().split('T')[0] // -90 dias
      },
      {
        item: 'Filtro de ar',
        dueKm: Math.floor(Math.random() * 100000) + 47000,
        dueDate: new Date(Date.now() + 8640000000).toISOString().split('T')[0], // +100 dias
        status: 'due-soon',
        lastDone: new Date(Date.now() - 8640000000).toISOString().split('T')[0] // -100 dias
      }
    ]
  }
}
