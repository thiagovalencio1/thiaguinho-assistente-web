// src/services/VehicleDataService.js
// Serviço para gerenciar dados do veículo

let vehicleData = {
  id: null,
  brand: 'Desconhecida',
  model: 'Modelo Desconhecido',
  year: '----',
  fuel: 'Combustível Desconhecido',
  currentKm: 0,
  lastMaintenance: null,
  nextMaintenanceKm: 0,
  avgConsumption: 0,
  status: 'Desconectado',
  color: '#6b7280' // gray-500
};

export const vehicleDataService = {
  // Obter dados atuais do veículo
  getVehicleData() {
    return { ...vehicleData };
  },

  // Atualizar dados do veículo
  updateVehicleData(newData) {
    vehicleData = { ...vehicleData, ...newData };
    console.log("🚗 Dados do veículo atualizados:", vehicleData);
  },

  // Resetar dados do veículo
  resetVehicleData() {
    vehicleData = {
      id: null,
      brand: 'Desconhecida',
      model: 'Modelo Desconhecido',
      year: '----',
      fuel: 'Combustível Desconhecido',
      currentKm: 0,
      lastMaintenance: null,
      nextMaintenanceKm: 0,
      avgConsumption: 0,
      status: 'Desconectado',
      color: '#6b7280'
    };
    console.log("🔄 Dados do veículo resetados");
  }
};
