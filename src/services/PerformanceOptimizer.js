// Otimizador de Performance para Aplicativo Mobile
export class PerformanceOptimizer {
  constructor() {
    this.cache = new Map()
    this.debounceTimers = new Map()
    this.observers = new Map()
    this.isOnline = navigator.onLine
    this.setupNetworkMonitoring()
  }

  // Monitoramento de rede
  setupNetworkMonitoring() {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.syncOfflineData()
    })
    
    window.addEventListener('offline', () => {
      this.isOnline = false
    })
  }

  // Cache inteligente
  setCache(key, data, ttl = 300000) { // 5 minutos por padrão
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  getCache(key) {
    const cached = this.cache.get(key)
    if (!cached) return null
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }
    
    return cached.data
  }

  clearCache() {
    this.cache.clear()
  }

  // Debounce para otimizar chamadas
  debounce(key, func, delay = 300) {
    if (this.debounceTimers.has(key)) {
      clearTimeout(this.debounceTimers.get(key))
    }
    
    const timer = setTimeout(() => {
      func()
      this.debounceTimers.delete(key)
    }, delay)
    
    this.debounceTimers.set(key, timer)
  }

  // Lazy loading para componentes
  createIntersectionObserver(callback, options = {}) {
    const defaultOptions = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    }
    
    return new IntersectionObserver(callback, { ...defaultOptions, ...options })
  }

  // Otimização de imagens
  optimizeImage(src, width = 300, quality = 0.8) {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        const ratio = Math.min(width / img.width, width / img.height)
        canvas.width = img.width * ratio
        canvas.height = img.height * ratio
        
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
        
        canvas.toBlob(resolve, 'image/jpeg', quality)
      }
      img.src = src
    })
  }

  // Compressão de dados
  compressData(data) {
    try {
      return JSON.stringify(data)
    } catch (error) {
      console.warn('Erro na compressão:', error)
      return data
    }
  }

  decompressData(compressedData) {
    try {
      return JSON.parse(compressedData)
    } catch (error) {
      console.warn('Erro na descompressão:', error)
      return compressedData
    }
  }

  // Armazenamento local otimizado
  setLocalStorage(key, data, compress = true) {
    try {
      const dataToStore = compress ? this.compressData(data) : data
      localStorage.setItem(key, JSON.stringify({
        data: dataToStore,
        timestamp: Date.now(),
        compressed: compress
      }))
    } catch (error) {
      console.warn('Erro ao salvar no localStorage:', error)
    }
  }

  getLocalStorage(key) {
    try {
      const stored = localStorage.getItem(key)
      if (!stored) return null
      
      const parsed = JSON.parse(stored)
      return parsed.compressed ? this.decompressData(parsed.data) : parsed.data
    } catch (error) {
      console.warn('Erro ao ler do localStorage:', error)
      return null
    }
  }

  // Sincronização offline
  addToOfflineQueue(action) {
    const queue = this.getLocalStorage('offline_queue') || []
    queue.push({
      ...action,
      timestamp: Date.now()
    })
    this.setLocalStorage('offline_queue', queue)
  }

  async syncOfflineData() {
    if (!this.isOnline) return
    
    const queue = this.getLocalStorage('offline_queue') || []
    if (queue.length === 0) return
    
    console.log(`Sincronizando ${queue.length} ações offline...`)
    
    for (const action of queue) {
      try {
        await this.executeOfflineAction(action)
      } catch (error) {
        console.warn('Erro na sincronização:', error)
      }
    }
    
    // Limpar fila após sincronização
    localStorage.removeItem('offline_queue')
  }

  async executeOfflineAction(action) {
    // Implementar lógica específica para cada tipo de ação
    switch (action.type) {
      case 'save_vehicle_data':
        // Sincronizar dados do veículo
        break
      case 'save_maintenance_record':
        // Sincronizar registros de manutenção
        break
      case 'save_fuel_record':
        // Sincronizar registros de combustível
        break
      default:
        console.warn('Tipo de ação offline desconhecido:', action.type)
    }
  }

  // Monitoramento de performance
  measurePerformance(name, func) {
    const start = performance.now()
    const result = func()
    const end = performance.now()
    
    console.log(`Performance [${name}]: ${(end - start).toFixed(2)}ms`)
    
    return result
  }

  async measureAsyncPerformance(name, asyncFunc) {
    const start = performance.now()
    const result = await asyncFunc()
    const end = performance.now()
    
    console.log(`Async Performance [${name}]: ${(end - start).toFixed(2)}ms`)
    
    return result
  }

  // Otimização de bateria
  optimizeBattery() {
    // Reduzir frequência de atualizações quando bateria baixa
    if ('getBattery' in navigator) {
      navigator.getBattery().then((battery) => {
        if (battery.level < 0.2) {
          console.log('Bateria baixa - otimizando performance')
          this.enablePowerSaveMode()
        }
        
        battery.addEventListener('levelchange', () => {
          if (battery.level < 0.2) {
            this.enablePowerSaveMode()
          } else {
            this.disablePowerSaveMode()
          }
        })
      })
    }
  }

  enablePowerSaveMode() {
    // Reduzir animações
    document.documentElement.style.setProperty('--animation-duration', '0s')
    
    // Reduzir frequência de atualizações
    this.powerSaveMode = true
    
    console.log('Modo economia de energia ativado')
  }

  disablePowerSaveMode() {
    // Restaurar animações
    document.documentElement.style.removeProperty('--animation-duration')
    
    // Restaurar frequência normal
    this.powerSaveMode = false
    
    console.log('Modo economia de energia desativado')
  }

  // Preload de recursos críticos
  preloadCriticalResources() {
    const criticalResources = [
      '/src/services/AIEngine.js',
      '/src/services/ELM327Service.js'
    ]
    
    criticalResources.forEach(resource => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.href = resource
      link.as = 'script'
      document.head.appendChild(link)
    })
  }

  // Limpeza de memória
  cleanup() {
    // Limpar timers
    this.debounceTimers.forEach(timer => clearTimeout(timer))
    this.debounceTimers.clear()
    
    // Limpar observers
    this.observers.forEach(observer => observer.disconnect())
    this.observers.clear()
    
    // Limpar cache antigo
    const now = Date.now()
    for (const [key, cached] of this.cache.entries()) {
      if (now - cached.timestamp > cached.ttl) {
        this.cache.delete(key)
      }
    }
  }

  // Inicialização
  init() {
    this.optimizeBattery()
    this.preloadCriticalResources()
    
    // Limpeza periódica
    setInterval(() => {
      this.cleanup()
    }, 300000) // 5 minutos
    
    console.log('PerformanceOptimizer inicializado')
  }
}

// Instância global do otimizador
export const performanceOptimizer = new PerformanceOptimizer()

