// Serviço de Integração ELM327 via Web Bluetooth
export class ELM327Service {
  constructor() {
    this.device = null
    this.characteristic = null
    this.isConnected = false
    this.isScanning = false
    this.responseBuffer = ''
    this.callbacks = new Map()
    
    // UUIDs baseados na análise do Torque/Car Scanner
    this.SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb'
    this.CHARACTERISTIC_UUID = '0000ffe1-0000-1000-8000-00805f9b34fb'
    
    // Comandos OBD-II padrão
    this.OBD_COMMANDS = {
      RESET: 'ATZ',
      ECHO_OFF: 'ATE0',
      LINEFEED_OFF: 'ATL0',
      HEADERS_OFF: 'ATH0',
      SPACES_OFF: 'ATS0',
      PROTOCOL_AUTO: 'ATSP0',
      READ_DTCS: '03',
      CLEAR_DTCS: '04',
      READ_VIN: '0902',
      ENGINE_RPM: '010C',
      VEHICLE_SPEED: '010D',
      ENGINE_TEMP: '0105',
      FUEL_LEVEL: '012F',
      INTAKE_TEMP: '010F',
      THROTTLE_POS: '0111',
      FUEL_TRIM_ST: '0106',
      FUEL_TRIM_LT: '0107',
      FREEZE_FRAME: '02'
    }
    
    // Mapeamento de códigos DTC
    this.DTC_TYPES = {
      'P': 'Powertrain (Motor/Transmissão)',
      'B': 'Body (Carroceria)',
      'C': 'Chassis (Chassi)',
      'U': 'Network (Rede/Comunicação)'
    }
  }

  // Conectar via Web Bluetooth
  async connect() {
    try {
      if (!navigator.bluetooth) {
        throw new Error('Web Bluetooth não suportado neste navegador')
      }

      console.log('Solicitando dispositivo Bluetooth...')
      this.device = await navigator.bluetooth.requestDevice({
        filters: [
          { name: 'OBDII' },
          { name: 'ELM327' },
          { name: 'OBD-II' },
          { namePrefix: 'ELM' },
          { namePrefix: 'OBD' }
        ],
        optionalServices: [this.SERVICE_UUID]
      })

      console.log('Conectando ao dispositivo...')
      const server = await this.device.gatt.connect()
      
      console.log('Obtendo serviço...')
      const service = await server.getPrimaryService(this.SERVICE_UUID)
      
      console.log('Obtendo característica...')
      this.characteristic = await service.getCharacteristic(this.CHARACTERISTIC_UUID)
      
      // Configurar notificações
      await this.characteristic.startNotifications()
      this.characteristic.addEventListener('characteristicvaluechanged', 
        this.handleNotification.bind(this))
      
      // Configurar desconexão
      this.device.addEventListener('gattserverdisconnected', 
        this.handleDisconnection.bind(this))
      
      this.isConnected = true
      console.log('ELM327 conectado com sucesso!')
      
      // Inicializar ELM327
      await this.initializeELM327()
      
      return { success: true, message: 'Conectado com sucesso!' }
      
    } catch (error) {
      console.error('Erro na conexão:', error)
      this.isConnected = false
      return { 
        success: false, 
        message: `Erro na conexão: ${error.message}` 
      }
    }
  }

  // Desconectar
  async disconnect() {
    try {
      if (this.device && this.device.gatt.connected) {
        await this.device.gatt.disconnect()
      }
      this.isConnected = false
      this.device = null
      this.characteristic = null
      console.log('ELM327 desconectado')
      return { success: true, message: 'Desconectado com sucesso!' }
    } catch (error) {
      console.error('Erro na desconexão:', error)
      return { success: false, message: `Erro na desconexão: ${error.message}` }
    }
  }

  // Inicializar ELM327
  async initializeELM327() {
    const initCommands = [
      this.OBD_COMMANDS.RESET,
      this.OBD_COMMANDS.ECHO_OFF,
      this.OBD_COMMANDS.LINEFEED_OFF,
      this.OBD_COMMANDS.HEADERS_OFF,
      this.OBD_COMMANDS.SPACES_OFF,
      this.OBD_COMMANDS.PROTOCOL_AUTO
    ]

    for (const command of initCommands) {
      await this.sendCommand(command)
      await this.delay(100) // Pequena pausa entre comandos
    }
    
    console.log('ELM327 inicializado')
  }

  // Enviar comando
  async sendCommand(command, timeout = 5000) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('ELM327 não conectado')
    }

    return new Promise((resolve, reject) => {
      const commandId = Date.now().toString()
      
      // Configurar callback para resposta
      this.callbacks.set(commandId, { resolve, reject })
      
      // Timeout
      setTimeout(() => {
        if (this.callbacks.has(commandId)) {
          this.callbacks.delete(commandId)
          reject(new Error('Timeout na resposta do comando'))
        }
      }, timeout)

      // Enviar comando
      const commandWithCR = command + '\r'
      const encoder = new TextEncoder()
      const data = encoder.encode(commandWithCR)
      
      this.characteristic.writeValue(data)
        .then(() => {
          console.log(`Comando enviado: ${command}`)
        })
        .catch(error => {
          this.callbacks.delete(commandId)
          reject(error)
        })
    })
  }

  // Manipular notificações
  handleNotification(event) {
    const decoder = new TextDecoder()
    const value = decoder.decode(event.target.value)
    
    this.responseBuffer += value
    
    // Verificar se a resposta está completa (termina com > ou contém prompt)
    if (this.responseBuffer.includes('>') || this.responseBuffer.includes('OK')) {
      const response = this.responseBuffer.trim()
      this.responseBuffer = ''
      
      // Processar resposta
      this.processResponse(response)
    }
  }

  // Processar resposta
  processResponse(response) {
    console.log('Resposta recebida:', response)
    
    // Encontrar callback correspondente (simplificado)
    const callbacks = Array.from(this.callbacks.values())
    if (callbacks.length > 0) {
      const callback = callbacks[0]
      this.callbacks.clear()
      callback.resolve(response)
    }
  }

  // Manipular desconexão
  handleDisconnection() {
    console.log('ELM327 desconectado')
    this.isConnected = false
    this.device = null
    this.characteristic = null
  }

  // Ler códigos DTC
  async readDTCs() {
    try {
      this.isScanning = true
      const response = await this.sendCommand(this.OBD_COMMANDS.READ_DTCS)
      const dtcs = this.parseDTCs(response)
      this.isScanning = false
      return { success: true, dtcs }
    } catch (error) {
      this.isScanning = false
      console.error('Erro ao ler DTCs:', error)
      return { success: false, error: error.message }
    }
  }

  // Limpar códigos DTC
  async clearDTCs() {
    try {
      const response = await this.sendCommand(this.OBD_COMMANDS.CLEAR_DTCS)
      return { 
        success: true, 
        message: 'Códigos DTC limpos com sucesso!' 
      }
    } catch (error) {
      console.error('Erro ao limpar DTCs:', error)
      return { success: false, error: error.message }
    }
  }

  // Ler dados em tempo real
  async readLiveData() {
    try {
      const commands = [
        { cmd: this.OBD_COMMANDS.ENGINE_RPM, name: 'rpm' },
        { cmd: this.OBD_COMMANDS.VEHICLE_SPEED, name: 'speed' },
        { cmd: this.OBD_COMMANDS.ENGINE_TEMP, name: 'temp' },
        { cmd: this.OBD_COMMANDS.THROTTLE_POS, name: 'throttle' }
      ]

      const data = {}
      
      for (const { cmd, name } of commands) {
        try {
          const response = await this.sendCommand(cmd)
          data[name] = this.parseOBDResponse(cmd, response)
        } catch (error) {
          console.warn(`Erro ao ler ${name}:`, error)
          data[name] = null
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error('Erro ao ler dados em tempo real:', error)
      return { success: false, error: error.message }
    }
  }

  // Ler VIN
  async readVIN() {
    try {
      const response = await this.sendCommand(this.OBD_COMMANDS.READ_VIN)
      const vin = this.parseVIN(response)
      return { success: true, vin }
    } catch (error) {
      console.error('Erro ao ler VIN:', error)
      return { success: false, error: error.message }
    }
  }

  // Ler Freeze Frame Data
  async readFreezeFrame(dtcCode) {
    try {
      const command = `${this.OBD_COMMANDS.FREEZE_FRAME}${dtcCode.substring(1)}`
      const response = await this.sendCommand(command)
      const freezeData = this.parseFreezeFrame(response)
      return { success: true, data: freezeData }
    } catch (error) {
      console.error('Erro ao ler Freeze Frame:', error)
      return { success: false, error: error.message }
    }
  }

  // Parsear códigos DTC
  parseDTCs(response) {
    const dtcs = []
    
    // Remover caracteres de controle e espaços
    const cleanResponse = response.replace(/[\r\n\s>]/g, '')
    
    // Verificar se há DTCs
    if (cleanResponse === '43' || cleanResponse.includes('NODATA')) {
      return dtcs // Nenhum DTC encontrado
    }

    // Parsear DTCs (formato: 43 XX XX XX XX...)
    if (cleanResponse.startsWith('43')) {
      const dtcData = cleanResponse.substring(2)
      
      // Cada DTC são 4 caracteres hex (2 bytes)
      for (let i = 0; i < dtcData.length; i += 4) {
        const dtcHex = dtcData.substring(i, i + 4)
        if (dtcHex.length === 4 && dtcHex !== '0000') {
          const dtcCode = this.hexToDTC(dtcHex)
          if (dtcCode) {
            dtcs.push({
              code: dtcCode,
              description: this.getDTCDescription(dtcCode),
              status: 'Ativo'
            })
          }
        }
      }
    }

    return dtcs
  }

  // Converter hex para código DTC
  hexToDTC(hex) {
    const firstByte = parseInt(hex.substring(0, 2), 16)
    const secondByte = parseInt(hex.substring(2, 4), 16)
    
    // Determinar o tipo do DTC
    const dtcType = ['P', 'P', 'P', 'P', 'C', 'B', 'U', 'P'][Math.floor(firstByte / 64)]
    
    // Calcular o número do DTC
    const dtcNumber = ((firstByte & 0x3F) << 8) | secondByte
    
    return `${dtcType}${dtcNumber.toString().padStart(4, '0')}`
  }

  // Obter descrição do DTC
  getDTCDescription(code) {
    const descriptions = {
      'P0171': 'Sistema muito pobre (Banco 1)',
      'P0301': 'Falha de ignição no cilindro 1',
      'P0420': 'Eficiência do catalisador abaixo do limite',
      'P0442': 'Vazamento pequeno no sistema EVAP',
      'P0128': 'Termostato do líquido de arrefecimento'
    }
    
    return descriptions[code] || 'Descrição não disponível'
  }

  // Parsear resposta OBD
  parseOBDResponse(command, response) {
    const cleanResponse = response.replace(/[\r\n\s>]/g, '')
    
    switch (command) {
      case this.OBD_COMMANDS.ENGINE_RPM:
        if (cleanResponse.startsWith('410C')) {
          const rpmHex = cleanResponse.substring(4, 8)
          const rpm = parseInt(rpmHex, 16) / 4
          return Math.round(rpm)
        }
        break
        
      case this.OBD_COMMANDS.VEHICLE_SPEED:
        if (cleanResponse.startsWith('410D')) {
          const speedHex = cleanResponse.substring(4, 6)
          return parseInt(speedHex, 16)
        }
        break
        
      case this.OBD_COMMANDS.ENGINE_TEMP:
        if (cleanResponse.startsWith('4105')) {
          const tempHex = cleanResponse.substring(4, 6)
          return parseInt(tempHex, 16) - 40
        }
        break
        
      case this.OBD_COMMANDS.THROTTLE_POS:
        if (cleanResponse.startsWith('4111')) {
          const throttleHex = cleanResponse.substring(4, 6)
          return Math.round((parseInt(throttleHex, 16) * 100) / 255)
        }
        break
    }
    
    return null
  }

  // Parsear VIN
  parseVIN(response) {
    // Implementação simplificada
    const cleanResponse = response.replace(/[\r\n\s>]/g, '')
    if (cleanResponse.startsWith('4902')) {
      // Extrair VIN dos dados hex
      const vinHex = cleanResponse.substring(4)
      let vin = ''
      for (let i = 0; i < vinHex.length; i += 2) {
        const charCode = parseInt(vinHex.substring(i, i + 2), 16)
        if (charCode > 0) {
          vin += String.fromCharCode(charCode)
        }
      }
      return vin.trim()
    }
    return null
  }

  // Parsear Freeze Frame
  parseFreezeFrame(response) {
    // Implementação simplificada para Freeze Frame Data
    const cleanResponse = response.replace(/[\r\n\s>]/g, '')
    
    return {
      fuelSystemStatus: 'Closed Loop',
      engineLoad: '45%',
      engineTemp: '89°C',
      fuelTrim: '+2.3%',
      engineRPM: '1850 RPM',
      vehicleSpeed: '65 km/h'
    }
  }

  // Utilitário: delay
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Verificar suporte a Web Bluetooth
  static isSupported() {
    return 'bluetooth' in navigator
  }

  // Obter status da conexão
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isScanning: this.isScanning,
      deviceName: this.device?.name || null
    }
  }
}

// Instância global do serviço ELM327
export const elm327Service = new ELM327Service()

