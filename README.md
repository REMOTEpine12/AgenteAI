# AgenteAI

Proyecto para hacer un Agente de IA usando el SDK de ChatGPT

## 📋 Descripción

Este proyecto implementa un agente conversacional inteligente con capacidades de herramientas (tools) simuladas para demostración. El agente puede buscar en web, calcular expresiones matemáticas y consultar información del clima.

## 🚀 Instalación

```bash
# Instalar dependencias
npm install

# Compilar TypeScript
npm run build

# Iniciar servidor
npm start
```

## 🌐 Uso

Una vez iniciado el servidor, accede a `http://localhost:8080` en tu navegador para interactuar con el agente.

### Herramientas disponibles

- **🔍 Búsqueda Web**: Consulta información simulada
- **🧮 Calculadora**: Realiza operaciones matemáticas
- **🌤️ Clima**: Consulta el clima de ciudades predefinidas

## 🏙️ Ciudades disponibles para consulta de clima

### España
- Madrid
- Barcelona
- Valencia

### México
- CDMX / Ciudad de México
- Guadalajara
- Monterrey
- Cancún
- Puebla
- Tijuana
- Mérida

## 🔮 Mejoras Futuras

### 🌍 Integración con API Real de Clima

Actualmente el servicio de clima usa datos simulados. Para integrar una API real de clima como **OpenWeatherMap** y obtener datos en tiempo real de cualquier ciudad del mundo:

#### Pasos para integrar OpenWeatherMap:

1. **Registrarse y obtener API Key**
   - Crear cuenta gratuita en [OpenWeatherMap](https://openweathermap.org/api)
   - Obtener API Key del dashboard

2. **Instalar dependencias**
   ```bash
   npm install axios dotenv
   ```

3. **Crear archivo `.env`**
   ```env
   OPENWEATHER_API_KEY=tu_api_key_aqui
   ```

4. **Modificar el endpoint en `src/server.ts`**
   ```typescript
   import axios from 'axios';
   import dotenv from 'dotenv';
   
   dotenv.config();
   
   app.get('/api/demo/tools/weather/:location', async (req: Request, res: Response): Promise<void> => {
       const { location } = req.params;
       
       try {
           const apiKey = process.env.OPENWEATHER_API_KEY;
           const response = await axios.get(
               `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric&lang=es`
           );
           
           const data = response.data;
           res.json({
               location: data.name,
               temp: Math.round(data.main.temp),
               condition: data.weather[0].description,
               humidity: data.main.humidity,
               windSpeed: data.wind.speed,
               timestamp: new Date().toISOString()
           });
       } catch (error) {
           res.status(404).json({
               error: 'Ciudad no encontrada',
               timestamp: new Date().toISOString()
           });
       }
   });
   ```

5. **Actualizar el cliente para mostrar más datos**
   - Agregar velocidad del viento
   - Mostrar íconos del clima
   - Incluir pronóstico extendido

#### Beneficios de la integración:
- ✅ Datos meteorológicos en tiempo real
- ✅ Cobertura global de +200,000 ciudades
- ✅ Información detallada (presión, visibilidad, UV, etc.)
- ✅ Pronósticos a 5 días
- ✅ Plan gratuito: 1,000 llamadas/día

### Otras mejoras planificadas:
- 🤖 Integración completa con ChatGPT SDK
- 📊 Dashboard de métricas en tiempo real
- 🔐 Sistema de autenticación
- 💾 Persistencia de conversaciones
- 🌐 Traducción multi-idioma
- 📱 Versión móvil responsive

## 📝 Licencia

Este proyecto es de código abierto para fines educativos.
