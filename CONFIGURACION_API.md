# 🔑 Configuración de API Key de OpenWeatherMap

## Pasos para configurar la API key:

### 1. Crear archivo .env
Crea un archivo llamado `.env` en la raíz del proyecto (mismo nivel que `package.json`)

### 2. Agregar tu API key
Agrega el siguiente contenido al archivo `.env`:

```env
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=tu_api_key_real_aqui

# Puerto del servidor (opcional)
PORT=8080

# Modo de desarrollo (opcional)
NODE_ENV=development
```

### 3. Obtener API key gratuita
Si no tienes una API key, puedes obtener una gratuita en:
- 🌐 **OpenWeatherMap**: https://openweathermap.org/api
- 📝 **Registro**: https://openweathermap.org/appid

### 4. Reiniciar el servidor
Después de crear el archivo `.env`, reinicia el servidor:
```bash
npm start
```

## ⚠️ Importante
- **NUNCA** subas el archivo `.env` a git (ya está en .gitignore)
- **Mantén** tu API key privada y segura
- **Usa** diferentes API keys para desarrollo y producción

## ✅ Verificación
Si está configurado correctamente, verás en la consola:
```
🚀 Servidor ejecutándose en http://localhost:8080
🔌 WebSocket disponible en ws://localhost:8080/ws
📁 Sirviendo archivos desde: /ruta/al/proyecto/public
🔧 Modo: development
```

**Sin** el mensaje de advertencia sobre API key no configurada.
