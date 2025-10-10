# 🤖 Agente IA en Tiempo Real - Mejorado

Agente de IA avanzado inspirado en el **Realtime Demo Agent de OpenAI**, con comunicación WebSocket, streaming de respuestas, y consulta de APIs reales.

## ✨ Características Principales

### 🔌 Comunicación en Tiempo Real
- **WebSocket bidireccional** para comunicación instantánea
- **Streaming de respuestas** palabra por palabra
- **Escucha continua** - no espera turnos, siempre listo para responder
- **Reconexión automática** si se pierde la conexión

### 🛠️ Herramientas Inteligentes
- **🌤️ Clima en tiempo real** - Integración con OpenWeatherMap API
  - Consulta el clima de cualquier ciudad del mundo
  - Datos reales actualizados
  - Fallback a datos simulados si no hay API key
- **🧮 Calculadora** - Cálculos matemáticos complejos
- **🔍 Búsqueda web** - (simulada, lista para integración)
- **💱 Conversión de monedas** - (simulada)

### 🎤 Soporte de Audio (Preparado)
- Estructura para **captura de audio** desde micrófono
- Preparado para integración con **Web Audio API**
- Base para **speech-to-text** en tiempo real

### 📊 Métricas en Tiempo Real
- Latencia de respuesta
- Herramientas utilizadas
- Contador de mensajes
- Duración de sesión

## 🚀 Instalación

### Requisitos Previos
- Node.js 18+
- npm o yarn

### Pasos de Instalación

1. **Clonar o navegar al proyecto:**
```bash
cd AgenteAI
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar variables de entorno:**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar .env y agregar tu API key de OpenWeatherMap
# Obtén una clave gratuita en: https://openweathermap.org/api
```

4. **Compilar TypeScript:**
```bash
npm run build
```

5. **Iniciar servidor:**
```bash
# Modo desarrollo (con hot reload)
npm run dev

# Modo producción
npm start
```

6. **Abrir en el navegador:**
```
http://localhost:8080
```

## 📖 Uso

### Interfaz de Usuario

1. **Acceder a la pestaña "Demo Agente IA"**
2. **Escribir un mensaje** en el cuadro de texto
3. **Enviar con Enter** o hacer clic en el botón "Enviar"
4. **Ver respuesta en tiempo real** con streaming

### Ejemplos de Consultas

#### Consultar el Clima
```
¿Qué tiempo hace en Madrid?
¿Cuál es la temperatura en Barcelona?
Clima en Ciudad de México
```

#### Realizar Cálculos
```
Calcula el 15% de propina para una cuenta de 85 euros
¿Cuánto es 250 * 1.21?
```

#### Búsquedas (simuladas)
```
¿Cuál es el precio del Bitcoin hoy?
Busca información sobre TypeScript vs JavaScript
```

## 🏗️ Arquitectura

### Backend (src/server.ts)

```
┌─────────────────────────────────────┐
│       Express HTTP Server           │
├─────────────────────────────────────┤
│    WebSocket Server (ws://...)      │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │  Session Management          │   │
│  │  - Estado de conexión        │   │
│  │  - Configuración por sesión  │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Message Handler             │   │
│  │  - Analiza intención         │   │
│  │  - Ejecuta herramientas      │   │
│  │  - Genera respuesta          │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Tool Executor               │   │
│  │  - OpenWeatherMap API        │   │
│  │  - Calculator                │   │
│  │  - Web Search (simulado)     │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

### Frontend (src/client.ts)

```
┌─────────────────────────────────────┐
│    DemoRealtimeAgent Class          │
├─────────────────────────────────────┤
│  ┌──────────────────────────────┐   │
│  │  WebSocket Client            │   │
│  │  - Conexión bidireccional    │   │
│  │  - Reconexión automática     │   │
│  │  - Manejo de mensajes        │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Streaming Handler           │   │
│  │  - Recibe chunks             │   │
│  │  - Actualiza UI en tiempo    │   │
│  │    real                      │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Audio Manager (preparado)   │   │
│  │  - Web Audio API             │   │
│  │  - MediaStream captura       │   │
│  └──────────────────────────────┘   │
│  ┌──────────────────────────────┐   │
│  │  Fallback Simulator          │   │
│  │  - Modo sin WebSocket        │   │
│  │  - Simulación local          │   │
│  └──────────────────────────────┘   │
└─────────────────────────────────────┘
```

## 🔧 Configuración

### Variables de Entorno

```bash
# .env
PORT=8080                          # Puerto del servidor
NODE_ENV=development               # Modo de ejecución
OPENWEATHER_API_KEY=tu_key_aqui   # API key de OpenWeatherMap
```

### Habilitar/Deshabilitar WebSocket

En `src/client.ts`, línea ~472:
```typescript
private useWebSocket: boolean = true; // Cambiar a false para simulación
```

## 📡 Protocolo WebSocket

### Mensajes del Cliente al Servidor

```typescript
// Mensaje de texto
{
  type: 'message',
  content: 'Tu mensaje aquí'
}

// Audio (preparado)
{
  type: 'audio',
  audioData: 'base64_encoded_audio'
}

// Interrumpir procesamiento
{
  type: 'interrupt'
}

// Actualizar configuración
{
  type: 'config',
  config: {
    streamingEnabled: true,
    audioEnabled: false,
    language: 'es'
  }
}
```

### Mensajes del Servidor al Cliente

```typescript
// Estado del agente
{
  type: 'status',
  status: 'listening' | 'processing' | 'responding' | 'ready',
  content: 'Mensaje de estado'
}

// Chunk de respuesta (streaming)
{
  type: 'chunk',
  chunk: 'palabra '
}

// Respuesta completa
{
  type: 'response',
  content: 'Respuesta completa',
  metadata: {
    latency: 1200,
    toolsUsed: ['weather'],
    confidence: 0.95
  }
}

// Llamada a herramienta
{
  type: 'tool_call',
  toolName: 'weather',
  content: 'Ejecutando weather...'
}

// Resultado de herramienta
{
  type: 'tool_result',
  toolName: 'weather',
  toolResult: { /* datos */ }
}

// Error
{
  type: 'error',
  error: 'Mensaje de error'
}
```

## 🔌 Integración de APIs

### OpenWeatherMap

1. **Obtener API Key:**
   - Visita: https://openweathermap.org/api
   - Crea una cuenta gratuita
   - Genera tu API key

2. **Configurar:**
   ```bash
   # En .env
   OPENWEATHER_API_KEY=tu_api_key_real
   ```

3. **Uso en el código:**
   ```typescript
   // src/server.ts:184
   async function fetchWeatherData(location: string): Promise<WeatherData> {
     // Consulta API real si hay key configurada
     // Fallback a simulación si no hay key
   }
   ```

### Agregar Nuevas Herramientas

1. **En el servidor (src/server.ts):**
```typescript
// Agregar análisis de intención
function analyzeToolNeeds(message: string): string[] {
  // ...
  if (message.includes('nueva_funcionalidad')) {
    tools.push('nueva_tool');
  }
  return tools;
}

// Implementar ejecución
async function executeTool(toolName: string, message: string): Promise<any> {
  switch (toolName) {
    case 'nueva_tool':
      return await ejecutarNuevaTool(message);
    // ...
  }
}
```

2. **En el cliente (src/client.ts):**
```typescript
// Actualizar simulador si es necesario
private toolSimulator: DemoToolSimulator = new DemoToolSimulator();
```

## 🧪 Testing

### Probar WebSocket

```bash
# Instalar wscat globalmente
npm install -g wscat

# Conectar al WebSocket
wscat -c ws://localhost:8080/ws

# Enviar mensaje
> {"type":"message","content":"¿Qué tiempo hace en Madrid?"}
```

### Probar API REST

```bash
# Estado del servidor
curl http://localhost:8080/api/status

# Clima (REST)
curl http://localhost:8080/api/demo/tools/weather/Madrid

# Métricas
curl http://localhost:8080/api/demo/metrics
```

## 📊 Métricas y Monitoreo

El agente expone métricas en tiempo real:

- **Latencia de respuesta**: Tiempo desde mensaje hasta respuesta
- **Herramientas usadas**: Contador de ejecuciones de herramientas
- **Mensajes totales**: Número de intercambios
- **Duración de sesión**: Tiempo desde inicio

## 🚧 Próximas Mejoras

- [ ] Integrar OpenAI Realtime API real
- [ ] Implementar speech-to-text completo
- [ ] Agregar text-to-speech para respuestas
- [ ] Persistencia de conversaciones (Redis/PostgreSQL)
- [ ] Autenticación y sesiones de usuario
- [ ] Más herramientas (búsqueda web real, APIs financieras, etc.)
- [ ] Dashboard de métricas con visualizaciones
- [ ] Tests unitarios y de integración

## 📝 Notas Técnicas

### TypeScript
Todo el código está completamente tipado con interfaces y tipos explícitos.

### Comentarios JSDoc
Todas las funciones importantes tienen documentación JSDoc completa.

### Manejo de Errores
- Reconexión automática de WebSocket
- Fallback a simulación si WebSocket falla
- Fallback a datos simulados si API externa falla

### Performance
- Streaming de respuestas reduce latencia percibida
- Ejecución de herramientas en paralelo (cuando sea posible)
- Latencias simuladas realistas

## 🤝 Contribuir

Este es un proyecto educativo. Siéntete libre de:
- Reportar bugs
- Sugerir nuevas características
- Mejorar la documentación
- Agregar nuevas herramientas

## 📄 Licencia

MIT License - Ver LICENSE file para más detalles.

## 🙏 Agradecimientos

- Inspirado en el **OpenAI Realtime Demo Agent**
- Basado en las especificaciones de **REALTIME_AGENT_SPEC.md**
- Construido con TypeScript, Express, y WebSocket

---

**Desarrollado con ❤️ para aprendizaje de IA en tiempo real**
