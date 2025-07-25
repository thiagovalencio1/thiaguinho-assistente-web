// src/App.tsx
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { ScrollArea } from '@/components/ui/scroll-area.jsx'
import { 
  Car, 
  MessageCircle, 
  Search, 
  Wrench, 
  Fuel, 
  BarChart3, 
  Settings as SettingsIcon,
  Bluetooth,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Activity,
  Gauge,
  Thermometer,
  RotateCcw,
  Send,
  Mic,
  Plus,
  Menu,
  Bell,
  User,
  Shield,
  Database,
  Smartphone
} from 'lucide-react'
import { getGeminiResponse } from './services/GeminiService.js'
import { elm327Service } from './services/ELM327Service.js'
import { vehicleDataService } from './services/VehicleDataService.js'
import { maintenanceService } from './services/MaintenanceService.js'
import { performanceOptimizer } from './services/PerformanceOptimizer.js'
import './App.css'

// Inicializar otimizador de performance
performanceOptimizer.init()

// Componente de Chat
function ChatInterface() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Olá! 👋 Sou seu Copiloto Digital thIAguinho! Como posso ajudar você hoje?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  
  const sendMessage = async () => {
    if (!inputMessage.trim()) return
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    const currentMessage = inputMessage
    setInputMessage('')
    setIsTyping(true)
    try {
      // Obter contexto do veículo para IA mais precisa
      const vehicleContext = vehicleDataService.getVehicleData()
      const aiResponse = await getGeminiResponse(currentMessage, vehicleContext);
      const botResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: aiResponse,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    } catch (error) {
      console.error('Erro na IA:', error)
      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: '🤖 Desculpe, ocorreu um erro. Tente novamente!',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorResponse])
      setIsTyping(false)
    }
  }
  
  return (
    <div className="flex flex-col h-full">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm">
                  {message.content}
                </div>
                <div className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite sua mensagem..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            className="flex-1"
          />
          <Button onClick={sendMessage} size="icon">
            <Send className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon">
            <Mic className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage('Como está meu consumo?')}
          >
            Consumo
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage('Quando trocar o óleo?')}
          >
            Manutenção
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setInputMessage('P0171')}
          >
            Diagnóstico
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente de Dashboard
function Dashboard() {
  const [vehicleData, setVehicleData] = useState(vehicleDataService.getVehicleData())
  
  // Atualizar dados do veículo quando mudarem
  useEffect(() => {
    const updateData = () => {
      setVehicleData(vehicleDataService.getVehicleData())
    }
    
    // Atualizar quando o componente monta
    updateData();
    
    // Simular atualização periódica (em um app real, isso viria de eventos do ELM327)
    const interval = setInterval(updateData, 5000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 space-y-6">
      {/* Header do Veículo */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Car className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {vehicleData.brand} {vehicleData.model}
                </CardTitle>
                <CardDescription>
                  {vehicleData.year} • {vehicleData.fuel}
                </CardDescription>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              {vehicleData.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {vehicleData.currentKm ? vehicleData.currentKm.toLocaleString() : '---'}
              </div>
              <div className="text-sm text-gray-500">Quilometragem</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {vehicleData.avgConsumption || '---'}
              </div>
              <div className="text-sm text-gray-500">km/l médio</div>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Status Cards */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Wrench className="h-5 w-5 text-orange-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Próxima Manutenção</div>
                <div className="text-xs text-gray-500">
                  {vehicleData.nextMaintenanceKm && vehicleData.currentKm ? 
                    (vehicleData.nextMaintenanceKm - vehicleData.currentKm).toLocaleString() : '---'} km
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Fuel className="h-5 w-5 text-blue-500" />
              <div className="flex-1">
                <div className="text-sm font-medium">Consumo Atual</div>
                <div className="text-xs text-gray-500">
                  {vehicleData.avgConsumption || '---'} km/l
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Ações Rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
              <Search className="h-6 w-6 text-blue-500" />
              <span className="text-sm">Diagnóstico</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
              <Fuel className="h-6 w-6 text-green-500" />
              <span className="text-sm">Abastecimento</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
              <Wrench className="h-6 w-6 text-orange-500" />
              <span className="text-sm">Manutenção</span>
            </Button>
            <Button variant="outline" className="h-auto p-4 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6 text-purple-500" />
              <span className="text-sm">Relatórios</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Scanner
function Scanner() {
  const [connectionStatus, setConnectionStatus] = useState(elm327Service.getConnectionStatus())
  const [dtcCodes, setDtcCodes] = useState([])
  const [liveData, setLiveData] = useState({
    rpm: 0,
    speed: 0,
    temp: 0,
    consumption: 0
  })
  const [statusMessage, setStatusMessage] = useState('')

  // Atualizar status da conexão periodicamente
  useEffect(() => {
    const interval = setInterval(() => {
      setConnectionStatus(elm327Service.getConnectionStatus())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const connectBluetooth = async () => {
    try {
      setStatusMessage('Procurando dispositivos ELM327...')
      // Atualizar status imediatamente
      setConnectionStatus(elm327Service.getConnectionStatus())
      
      const result = await elm327Service.connect()
      setStatusMessage(result.message)
      setConnectionStatus(elm327Service.getConnectionStatus())
      
      if (result.success) {
        // Atualizar dados do veículo com informações básicas
        vehicleDataService.updateVehicleData({
          status: 'Conectado',
          id: Date.now()
        });
        
        // Iniciar leitura de dados em tempo real após conexão bem-sucedida
        startLiveDataReading()
      }
    } catch (error) {
      console.error('Erro na conexão:', error)
      setStatusMessage(`Erro na conexão: ${error.message}`)
      setConnectionStatus(elm327Service.getConnectionStatus())
    }
  }

  const disconnectBluetooth = async () => {
    try {
      const result = await elm327Service.disconnect()
      setStatusMessage(result.message)
      setConnectionStatus(elm327Service.getConnectionStatus())
      setDtcCodes([])
      setLiveData({ rpm: 0, speed: 0, temp: 0, consumption: 0 })
      
      // Resetar dados do veículo
      vehicleDataService.resetVehicleData()
    } catch (error) {
      console.error('Erro na desconexão:', error)
      setStatusMessage(`Erro na desconexão: ${error.message}`)
      setConnectionStatus(elm327Service.getConnectionStatus())
    }
  }

  const startScan = async () => {
    if (!connectionStatus.isConnected) {
      setStatusMessage('Conecte o ELM327 primeiro!')
      return
    }
    try {
      setStatusMessage('Escaneando códigos DTC...')
      const result = await elm327Service.readDTCs()
      if (result.success) {
        setDtcCodes(result.dtcs)
        setStatusMessage(`${result.dtcs.length} código(s) encontrado(s)`)
      } else {
        setStatusMessage(`Erro no diagnóstico: ${result.error}`)
      }
    } catch (error) {
      console.error('Erro ao escanear DTCs:', error)
      setStatusMessage(`Erro ao escanear DTCs: ${error.message}`)
    }
  }

  const clearDTCs = async () => {
    if (!connectionStatus.isConnected) {
      setStatusMessage('Conecte o ELM327 primeiro!')
      return
    }
    try {
      setStatusMessage('Limpando códigos DTC...')
      const result = await elm327Service.clearDTCs()
      if (result.success) {
        setDtcCodes([])
        setStatusMessage(result.message)
      } else {
        setStatusMessage(`Erro ao limpar DTCs: ${result.message}`)
      }
    } catch (error) {
      console.error('Erro ao limpar DTCs:', error)
      setStatusMessage(`Erro ao limpar DTCs: ${error.message}`)
    }
  }

  const startLiveDataReading = async () => {
    if (!connectionStatus.isConnected) return
    try {
      const result = await elm327Service.readLiveData()
      if (result.success && result.data) {
        setLiveData(prevData => ({
          ...prevData,
          rpm: result.data.rpm ?? prevData.rpm,
          speed: result.data.speed ?? prevData.speed,
          temp: result.data.temp ?? prevData.temp,
          consumption: result.data.consumption ?? prevData.consumption
        }))
        
        // Atualizar dados do veículo com informações em tempo real
        vehicleDataService.updateVehicleData({
          currentKm: Math.floor(Math.random() * 100000) + 10000, // Simulação - em um app real, isso viria de algum cálculo ou entrada do usuário
          avgConsumption: result.data.consumption ?? vehicleDataService.getVehicleData().avgConsumption,
          status: 'Operando'
        });
      }
    } catch (error) {
      console.warn('Erro na leitura de dados em tempo real:', error)
      // Dados simulados como fallback
       setLiveData({
         rpm: Math.floor(Math.random() * 4000) + 500,
         speed: Math.floor(Math.random() * 180),
         temp: Math.floor(Math.random() * 50) + 60,
         consumption: (Math.random() * 10 + 8).toFixed(1)
       })
    }
  }

  // Atualizar dados em tempo real periodicamente se conectado
  useEffect(() => {
    let intervalId;
    if (connectionStatus.isConnected) {
      // Ler dados imediatamente
      startLiveDataReading()
      // Configurar intervalo para leituras periódicas
      intervalId = setInterval(startLiveDataReading, 3000) // A cada 3 segundos
    }
    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [connectionStatus.isConnected])

  return (
    <div className="p-4 space-y-6">
      {/* Status da Conexão */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bluetooth className="h-5 w-5 mr-2" />
            Scanner ELM327
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${connectionStatus.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm">
                {connectionStatus.isConnected ? 'Conectado' : 'Desconectado'}
                {connectionStatus.deviceName && ` - ${connectionStatus.deviceName}`}
              </span>
            </div>
            <Button 
              onClick={connectionStatus.isConnected ? disconnectBluetooth : connectBluetooth}
              variant={connectionStatus.isConnected ? "outline" : "default"}
              size="sm"
            >
              {connectionStatus.isConnected ? 'Desconectar' : 'Conectar'}
            </Button>
          </div>
          {statusMessage && (
            <div className="text-sm text-gray-600 mt-2">
              {statusMessage}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Controles de Diagnóstico */}
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={startScan}
              disabled={!connectionStatus.isConnected}
              className="w-full"
            >
              <Search className="h-4 w-4 mr-2" />
              Iniciar Diagnóstico
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                size="sm"
                onClick={startLiveDataReading}
                disabled={!connectionStatus.isConnected}
              >
                <Activity className="h-4 w-4 mr-2" />
                Dados ao Vivo
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={clearDTCs}
                disabled={!connectionStatus.isConnected}
              >
                <Database className="h-4 w-4 mr-2" />
                Limpar DTCs
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Resultados do Diagnóstico */}
      {dtcCodes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Códigos Encontrados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dtcCodes.map((dtc, index) => (
                <div key={index} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono font-bold text-lg">{dtc.code}</span>
                    <Badge 
                      variant={dtc.urgency === 'Alto' ? 'destructive' : 'secondary'}
                    >
                      {dtc.urgency || 'Médio'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{dtc.description}</p>
                  <div className="mt-2">
                    <Badge 
                      variant={dtc.status === 'Ativo' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {dtc.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Dados em Tempo Real */}
      <Card>
        <CardHeader>
          <CardTitle>Dados em Tempo Real</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Gauge className="h-6 w-6 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{liveData.rpm}</div>
              <div className="text-sm text-gray-500">RPM</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">{liveData.speed}</div>
              <div className="text-sm text-gray-500">km/h</div>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Thermometer className="h-6 w-6 mx-auto mb-2 text-orange-500" />
              <div className="text-2xl font-bold">{liveData.temp}°C</div>
              <div className="text-sm text-gray-500">Motor</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold">{liveData.consumption}</div>
              <div className="text-sm text-gray-500">km/l</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Manutenção
function Maintenance() {
  const [vehicleData, setVehicleData] = useState(vehicleDataService.getVehicleData())
  const [maintenanceItems, setMaintenanceItems] = useState([])

  // Atualizar dados do veículo e agenda de manutenção
  useEffect(() => {
    const updateData = () => {
      const data = vehicleDataService.getVehicleData()
      setVehicleData(data)
      setMaintenanceItems(maintenanceService.getMaintenanceSchedule(data.currentKm))
    }
    
    updateData()
    // Atualizar quando o componente monta e periodicamente
    const interval = setInterval(updateData, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Wrench className="h-5 w-5 mr-2" />
            Agenda de Manutenção
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {maintenanceItems.map((item) => (
              <div key={item.id} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{item.item}</h3>
                  <Badge 
                    variant={item.status === 'overdue' ? 'destructive' : 'secondary'}
                  >
                    {item.status === 'overdue' ? 'Atrasado' : 'Em breve'}
                  </Badge>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Vence em: {vehicleData.currentKm ? (item.dueKm - vehicleData.currentKm).toLocaleString() : '---'} km
                  </div>
                  <div className="flex items-center">
                    <Gauge className="h-4 w-4 mr-2" />
                    Quilometragem: {item.dueKm.toLocaleString()} km
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    Última vez: {item.lastDone || 'Nunca'}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Button className="w-full mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Agendar Manutenção
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente de Configurações
function Settings() {
  return (
    <div className="p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <SettingsIcon className="h-5 w-5 mr-2" />
            Configurações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-500" />
                <span>Perfil do Usuário</span>
              </div>
              <Button variant="ghost" size="sm">
                Editar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Car className="h-5 w-5 text-gray-500" />
                <span>Meus Veículos</span>
              </div>
              <Button variant="ghost" size="sm">
                Gerenciar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-500" />
                <span>Notificações</span>
              </div>
              <Button variant="ghost" size="sm">
                Configurar
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Shield className="h-5 w-5 text-gray-500" />
                <span>Privacidade</span>
              </div>
              <Button variant="ghost" size="sm">
                Ver
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Smartphone className="h-5 w-5 text-gray-500" />
                <span>Sobre o App</span>
              </div>
              <Button variant="ghost" size="sm">
                Info
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Componente Principal
function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Car },
    { id: 'chat', label: 'Chat', icon: MessageCircle },
    { id: 'scanner', label: 'Scanner', icon: Search },
    { id: 'maintenance', label: 'Manutenção', icon: Wrench },
    { id: 'settings', label: 'Mais', icon: Menu }
  ]
  
  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />
      case 'chat':
        return <ChatInterface />
      case 'scanner':
        return <Scanner />
      case 'maintenance':
        return <Maintenance />
      case 'settings':
        return <Settings />
      default:
        return <Dashboard />
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">
            thIAguinho - Assistente Virtual
          </h1>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
      {/* Content */}
      <div className="pb-20">
        {renderContent()}
      </div>
      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="grid grid-cols-5">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-3 flex flex-col items-center space-y-1 ${
                  activeTab === tab.id
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-500'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs">{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default App
