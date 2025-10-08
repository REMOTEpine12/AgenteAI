# 🚀 Demo Agente IA - Guía de Uso

## 📋 Descripción

El **Demo Agente IA** es una implementación completa de un agente de inteligencia artificial en tiempo real que simula las capacidades descritas en la especificación técnica. Esta demo incluye:

- ✅ **Respuestas en tiempo real** con indicadores de escritura
- ✅ **Sistema de herramientas** simuladas (búsqueda web, calculadora, clima, divisas)
- ✅ **Contexto persistente** durante la sesión
- ✅ **Métricas en tiempo real** (latencia, herramientas usadas, duración)
- ✅ **Interfaz moderna** con feedback visual
- ✅ **Ejemplos interactivos** para probar funcionalidades

## 🎯 Cómo Usar el Demo

### 1. **Acceder al Demo**
- Navega a la pestaña **"Demo Agente IA"** en la interfaz web
- El agente se inicializa automáticamente al cambiar de pestaña

### 2. **Probar Herramientas**

#### 🔍 **Búsqueda Web**
Ejemplos de consultas que activan la búsqueda:
```
- "¿Cuál es el precio actual del Bitcoin?"
- "Busca información sobre TypeScript vs JavaScript"
- "¿Qué información hay sobre inteligencia artificial?"
```

#### 🧮 **Calculadora**
Ejemplos de cálculos que se procesan:
```
- "Calcula el 15% de propina para una cuenta de 85 euros"
- "¿Cuánto es 250 * 1.21?"
- "Calcula 1500 / 12"
```

#### 🌤️ **Información del Clima**
Consultas sobre el tiempo:
```
- "¿Qué tiempo hace en Madrid hoy?"
- "¿Cuál es la temperatura en Barcelona?"
- "Clima en Valencia"
```

#### 💱 **Conversión de Monedas**
Conversiones de divisas:
```
- "Convierte 100 dólares a euros"
- "¿Cuántos pesos mexicanos son 50 euros?"
- "Cambio de euro a dólar"
```

### 3. **Ejemplos Rápidos**
Usa los botones de ejemplo en el panel lateral para probar rápidamente:
- 💰 Precio de Bitcoin
- 🌤️ Clima en Madrid  
- 🧮 Calcular propina
- 🔍 Comparar tecnologías

## 📊 Métricas y Monitoreo

### **Panel de Estado**
- **Latencia**: Tiempo de respuesta en milisegundos
- **Herramientas**: Número de herramientas utilizadas
- **Mensajes**: Contador de mensajes intercambiados
- **Duración**: Tiempo total de la sesión
- **Herramientas usadas**: Número de veces que se ejecutaron herramientas

### **Indicadores Visuales**
- 🟢 **Conectado**: Agente funcionando correctamente
- 🟡 **Procesando**: Ejecutando herramientas o generando respuesta
- 🔴 **Error**: Problema en la conexión o procesamiento

## 🛠️ Herramientas Disponibles

### **Estado de Herramientas**
- **Listo**: Herramienta disponible para usar
- **Ejecutando...**: Herramienta procesando solicitud
- **Completado**: Herramienta terminó exitosamente
- **Error**: Problema durante la ejecución

### **Herramientas Activas**
Durante el procesamiento, verás qué herramientas están siendo utilizadas en tiempo real.

## 💡 Funcionalidades Avanzadas

### **Chat Inteligente**
- **Análisis automático**: El agente determina qué herramientas necesita
- **Ejecución paralela**: Múltiples herramientas pueden ejecutarse simultáneamente
- **Respuestas contextuales**: Integra resultados de herramientas en respuestas naturales

### **Interfaz Interactiva**
- **Textarea expandible**: Se ajusta automáticamente al contenido
- **Shortcuts de teclado**: Enter para enviar, Shift+Enter para nueva línea
- **Limpiar chat**: Botón para reiniciar la conversación
- **Scroll automático**: Se mantiene al final de la conversación

### **Feedback Visual**
- **Indicador de escritura**: Puntos animados mientras el agente responde
- **Badges de herramientas**: Muestra qué herramientas se usaron en cada mensaje
- **Métricas de latencia**: Tiempo de respuesta mostrado en cada mensaje
- **Estados de herramientas**: Cambios visuales durante la ejecución

## 🎨 Personalización

### **Temas Visuales**
- Gradientes modernos con efectos glassmorphism
- Animaciones suaves en hover y click
- Indicadores de estado con colores semánticos
- Tipografía optimizada para legibilidad

### **Responsive Design**
- Adaptado para dispositivos móviles
- Layout flexible que se reorganiza en pantallas pequeñas
- Controles táctiles optimizados

## 🔧 Aspectos Técnicos

### **Simulación Realista**
- **Latencias variables**: Simula tiempos reales de APIs externas
- **Datos contextuales**: Respuestas específicas según la consulta
- **Manejo de errores**: Simulación de fallos y recuperación

### **Arquitectura del Demo**
```
DemoRealtimeAgent
├── DemoToolSimulator (Simulador de herramientas)
├── Gestión de estado y métricas
├── Procesamiento de mensajes
├── Análisis de intenciones
└── Generación de respuestas
```

### **Flujo de Procesamiento**
1. **Recepción** del mensaje del usuario
2. **Análisis** de qué herramientas necesita
3. **Ejecución** de herramientas en paralelo
4. **Síntesis** de resultados
5. **Generación** de respuesta natural
6. **Actualización** de métricas y estado

## 🚀 Próximos Pasos

Este demo simula las capacidades del agente real. Para implementar la versión completa:

1. **Integrar APIs reales** (OpenAI, búsqueda web, clima, etc.)
2. **Implementar WebSockets** para comunicación bidireccional
3. **Agregar persistencia** con Redis/PostgreSQL
4. **Implementar filtros de seguridad** 
5. **Añadir más herramientas** especializadas
6. **Optimizar performance** con cache y batching

## 🎯 Casos de Uso Demostrados

### **Consulta Compleja**
```
Usuario: "¿Cuál es el precio del Bitcoin en euros y cuánto sería el 15% de ganancia sobre 1000 euros?"

Agente: 
🔍 Búsqueda realizada: Bitcoin cotiza a $43,250 USD
💱 Conversión: $43,250 = €39,652.50
🧮 Cálculo: 15% de €1,000 = €150
```

### **Planificación de Viaje**
```
Usuario: "¿Qué tiempo hace en Madrid y cuántos euros son 100 dólares?"

Agente:
🌤️ Clima en Madrid: 18°C, parcialmente nublado
💱 Conversión: $100 = €91.80
```

Este demo proporciona una experiencia completa de lo que sería un agente de IA en producción, con todas las capacidades técnicas simuladas de forma realista.
