# Instrucciones para ejecutar la aplicación TypeScript

## Instalación
1. Asegúrate de tener Node.js (versión 16 o superior) instalado en tu sistema
2. Abre una terminal en la carpeta del proyecto
3. Ejecuta: `npm install`

## Compilación y Ejecución

### Para desarrollo (recomendado):
```bash
npm run dev
```
- Inicia el servidor con auto-reload usando ts-node-dev
- Los cambios se reflejan automáticamente sin reiniciar

### Para producción:
```bash
npm run build    # Compila TypeScript a JavaScript
npm start        # Ejecuta la versión compilada
```

### Comandos adicionales:
```bash
npm run build:watch  # Compila en modo watch (recompila automáticamente)
npm run clean        # Limpia la carpeta dist/
```

## Acceso
- Abre tu navegador en: http://localhost:3000

## Estructura del proyecto
```
AgenteAI/
├── src/
│   ├── server.ts          # Servidor Express con TypeScript
│   └── client.ts          # Cliente TypeScript (compilado a dist/client.js)
├── public/
│   ├── index.html         # Página principal
│   └── styles.css         # Estilos CSS
├── dist/                  # Archivos compilados (generados)
│   ├── server.js          # Servidor compilado
│   └── client.js          # Cliente compilado (servido como /script.js)
├── package.json           # Dependencias y scripts
└── tsconfig.json          # Configuración TypeScript
```

## Características
- ✅ **TypeScript** con tipado estático completo
- ✅ **Servidor Express.js** con interfaces tipadas
- ✅ **Cliente TypeScript** con clases y tipos
- ✅ **Interfaz web moderna** y responsiva
- ✅ **API REST** con validación de tipos
- ✅ **Preparado para integración** con ChatGPT SDK
- ✅ **Chat interactivo** con manejo de errores robusto
- ✅ **Verificación de estado** del servidor en tiempo real
- ✅ **Compilación automática** en desarrollo
- ✅ **Manejo de errores** tipado y consistente

## Ventajas del TypeScript
- **Detección temprana de errores** durante el desarrollo
- **IntelliSense mejorado** en editores compatibles
- **Refactoring seguro** con análisis estático
- **Documentación automática** a través de tipos
- **Mejor mantenibilidad** del código a largo plazo
