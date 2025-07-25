// src/services/MaintenanceService.js
// Serviço para gerenciar agenda de manutenção

const maintenanceItems = [
  {
    id: 1,
    item: 'Troca de óleo',
    intervalKm: 10000,
    lastDoneKm: 0,
    dueKm: 10000,
    dueDate: null,
    status: 'pending',
    lastDone: null,
    description: 'Troca de óleo e filtro'
  },
  {
    id: 2,
    item: 'Filtro de ar',
    intervalKm: 20000,
    lastDoneKm: 0,
    dueKm: 20000,
    dueDate: null,
    status: 'pending',
    lastDone: null,
    description: 'Substituição do filtro de ar do motor'
  },
  {
    id: 3,
    item: 'Filtro de combustível',
    intervalKm: 40000,
    lastDoneKm: 0,
    dueKm: 40000,
    dueDate: null,
    status: 'pending',
    lastDone: null,
    description: 'Substituição do filtro de combustível'
  },
  {
    id: 4,
    item: 'Velas de ignição',
    intervalKm: 60000,
    lastDoneKm: 0,
    dueKm: 60000,
    dueDate: null,
    status: 'pending',
    lastDone: null,
    description: 'Substituição das velas de ignição'
  }
];

export const maintenanceService = {
  // Obter agenda de manutenção
  getMaintenanceSchedule(currentKm = 0) {
    return maintenanceItems.map(item => {
      let status = 'pending';
      if (currentKm >= item.dueKm) {
        status = 'overdue';
      } else if (currentKm >= item.dueKm - 1000) { // 1000km de antecedência
        status = 'due-soon';
      }
      
      return {
        ...item,
        status
      };
    });
  },

  // Agendar manutenção
  scheduleMaintenance(itemId, kmDone) {
    const item = maintenanceItems.find(i => i.id === itemId);
    if (item) {
      item.lastDoneKm = kmDone;
      item.lastDone = new Date().toISOString().split('T')[0];
      item.dueKm = kmDone + item.intervalKm;
      item.status = 'completed';
      console.log(`🔧 Manutenção agendada: ${item.item} em ${kmDone} km`);
      return { success: true, message: 'Manutenção atualizada com sucesso!' };
    }
    return { success: false, message: 'Item de manutenção não encontrado.' };
  },

  // Adicionar novo item de manutenção
  addMaintenanceItem(item) {
    const newItem = {
      id: Math.max(...maintenanceItems.map(i => i.id), 0) + 1,
      ...item,
      status: 'pending'
    };
    maintenanceItems.push(newItem);
    console.log(`➕ Novo item de manutenção adicionado: ${item.item}`);
    return { success: true, item: newItem };
  }
};
