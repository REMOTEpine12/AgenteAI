import express, { Request, Response, Application } from 'express';
import path from 'path';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Interfaz para respuestas de la API REST
 */
interface ApiResponse {
    status: string;
    message: string;
    timestamp: string;
}

/**
 * Interfaz para peticiones de chat
 */
interface ChatRequest {
    message: string;
}

/**
 * Interfaz para respuestas de chat
 */
interface ChatResponse {
    response: string;
    timestamp: string;
}

/**
 * Interfaz para mensajes WebSocket del cliente al servidor
 */
interface WebSocketClientMessage {
    type: 'message' | 'audio' | 'interrupt' | 'config';
    content?: string;
    audioData?: string; // Base64 encoded audio
    sessionId?: string;
    config?: RealtimeConfig;
}

/**
 * Interfaz para mensajes WebSocket del servidor al cliente
 */
interface WebSocketServerMessage {
    type: 'response' | 'chunk' | 'tool_call' | 'tool_result' | 'error' | 'status';
    content?: string;
    chunk?: string;
    toolName?: string;
    toolResult?: any;
    error?: string;
    status?: 'listening' | 'processing' | 'responding' | 'ready';
    metadata?: {
        latency?: number;
        toolsUsed?: string[];
        confidence?: number;
    };
}

/**
 * Configuración del agente en tiempo real
 */
interface RealtimeConfig {
    streamingEnabled: boolean;
    audioEnabled: boolean;
    interruptible: boolean;
    language: 'es' | 'en';
}

/**
 * Interfaz para datos meteorológicos de OpenWeatherMap
 */
interface WeatherData {
    location: string;
    temperature: number;
    condition: string;
    description: string;
    humidity: number;
    wind: number;
    feelsLike: number;
}

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '8080', 10);
const httpServer = createServer(app);

// Configuración de WebSocket Server
const wss = new WebSocketServer({
    server: httpServer,
    path: '/ws'
});

// API Key de OpenWeatherMap (debe configurarse como variable de entorno)
const OPENWEATHER_API_KEY: string = process.env.OPENWEATHER_API_KEY || '';

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Servir el archivo JavaScript compilado del cliente
app.use('/script.js', express.static(path.join(__dirname, 'client.js')));

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal
app.get('/', (req: Request, res: Response): void => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Ruta API de ejemplo
app.get('/api/status', (req: Request, res: Response): void => {
    const response: ApiResponse = {
        status: 'success',
        message: 'Servidor funcionando correctamente',
        timestamp: new Date().toISOString()
    };
    res.json(response);
});

// Ruta para el agente AI (placeholder)
app.post('/api/chat', (req: Request<{}, ChatResponse, ChatRequest>, res: Response<ChatResponse>): void => {
    const { message } = req.body;
    
    // Validación básica
    if (!message || typeof message !== 'string') {
        res.status(400).json({
            response: 'Error: El mensaje es requerido y debe ser una cadena de texto.',
            timestamp: new Date().toISOString()
        });
        return;
    }
    
    // Aquí se integrará el SDK de ChatGPT en el futuro
    const response: ChatResponse = {
        response: `Recibí tu mensaje: "${message}". La integración con ChatGPT se implementará próximamente.`,
        timestamp: new Date().toISOString()
    };
    
    res.json(response);
});

// Endpoints adicionales para el demo agente
app.post('/api/demo/tools/web-search', (req: Request, res: Response): void => {
    const { query } = req.body;
    
    // Simular búsqueda web
    setTimeout(() => {
        res.json({
            query,
            results: [
                { title: 'Resultado simulado 1', url: 'https://example.com/1', snippet: `Información sobre ${query}` },
                { title: 'Resultado simulado 2', url: 'https://example.com/2', snippet: `Más datos sobre ${query}` }
            ],
            timestamp: new Date().toISOString()
        });
    }, Math.random() * 1000 + 500); // 0.5-1.5s delay
});

app.post('/api/demo/tools/calculator', (req: Request, res: Response): void => {
    const { expression } = req.body;
    
    try {
        // Evaluación simple (en producción usar una librería más segura)
        const result = eval(expression.replace(/[^0-9+\-*/().% ]/g, ''));
        
        res.json({
            expression,
            result,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(400).json({
            error: 'Expresión matemática inválida',
            timestamp: new Date().toISOString()
        });
    }
});

/**
 * Obtiene datos meteorológicos reales desde OpenWeatherMap API
 * @param location - Nombre de la ciudad
 * @returns Promise con datos del clima
 */
async function fetchWeatherData(location: string): Promise<WeatherData> {
    try {
        // Si no hay API key, retornar datos simulados
        if (!OPENWEATHER_API_KEY) {
            console.warn('⚠️ OPENWEATHER_API_KEY no configurada. Usando datos simulados.');
            return getSimulatedWeather(location);
        }

        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`;

        const response = await fetch(url);

        if (!response.ok) {
            console.error(`Error fetching weather: ${response.status}`);
            return getSimulatedWeather(location);
        }

        const data: any = await response.json();

        return {
            location: data.name,
            temperature: Math.round(data.main.temp),
            condition: data.weather[0].main,
            description: data.weather[0].description,
            humidity: data.main.humidity,
            wind: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
            feelsLike: Math.round(data.main.feels_like)
        };
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return getSimulatedWeather(location);
    }
}

/**
 * Retorna datos meteorológicos simulados como fallback
 * @param location - Nombre de la ciudad
 * @returns Datos del clima simulados
 */
function getSimulatedWeather(location: string): WeatherData {
    const weatherData: Record<string, WeatherData> = {
        'madrid': { location: 'Madrid', temperature: 18, condition: 'Clouds', description: 'parcialmente nublado', humidity: 65, wind: 12, feelsLike: 17 },
        'barcelona': { location: 'Barcelona', temperature: 22, condition: 'Clear', description: 'cielo despejado', humidity: 58, wind: 8, feelsLike: 21 },
        'valencia': { location: 'Valencia', temperature: 20, condition: 'Clear', description: 'cielo despejado', humidity: 62, wind: 10, feelsLike: 19 },
        'cdmx': { location: 'Ciudad de México', temperature: 24, condition: 'Clouds', description: 'parcialmente nublado', humidity: 45, wind: 10, feelsLike: 23 },
        'ciudad de mexico': { location: 'Ciudad de México', temperature: 24, condition: 'Clouds', description: 'parcialmente nublado', humidity: 45, wind: 10, feelsLike: 23 },
    };

    return weatherData[location.toLowerCase()] || {
        location: location,
        temperature: 16,
        condition: 'Clear',
        description: 'condiciones variables',
        humidity: 60,
        wind: 15,
        feelsLike: 15
    };
}

app.get('/api/demo/tools/weather/:location', async (req: Request, res: Response): Promise<void> => {
    const { location } = req.params;

    try {
        const weather = await fetchWeatherData(location);

        res.json({
            ...weather,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            error: 'Error al obtener datos del clima',
            timestamp: new Date().toISOString()
        });
    }
});

app.get('/api/demo/metrics', (req: Request, res: Response): void => {
    res.json({
        serverUptime: process.uptime(),
        memoryUsage: process.memoryUsage(),
        timestamp: new Date().toISOString(),
        activeConnections: 1 // Placeholder
    });
});

// Manejo de errores 404
app.use('*', (req: Request, res: Response): void => {
    res.status(404).json({
        status: 'error',
        message: 'Ruta no encontrada',
        timestamp: new Date().toISOString()
    });
});

// Manejo de errores globales
app.use((err: Error, req: Request, res: Response, next: Function): void => {
    console.error('Error:', err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        timestamp: new Date().toISOString()
    });
});

/**
 * Manejador de conexiones WebSocket para comunicación en tiempo real
 * Inspirado en el Realtime Demo Agent de OpenAI
 */
wss.on('connection', (ws: WebSocket) => {
    console.log('✅ Nueva conexión WebSocket establecida');

    // Estado de la sesión
    let sessionId = generateSessionId();
    let config: RealtimeConfig = {
        streamingEnabled: true,
        audioEnabled: false,
        interruptible: true,
        language: 'es'
    };

    // Enviar mensaje de bienvenida
    sendMessage(ws, {
        type: 'status',
        status: 'ready',
        content: 'Conexión establecida. Escuchando...'
    });

    /**
     * Procesa mensajes del cliente
     */
    ws.on('message', async (data: Buffer) => {
        try {
            const message: WebSocketClientMessage = JSON.parse(data.toString());

            switch (message.type) {
                case 'message':
                    await handleTextMessage(ws, message.content || '', config);
                    break;

                case 'audio':
                    // TODO: Implementar procesamiento de audio
                    sendMessage(ws, {
                        type: 'error',
                        error: 'Procesamiento de audio no implementado aún'
                    });
                    break;

                case 'interrupt':
                    // Interrumpir procesamiento actual
                    sendMessage(ws, {
                        type: 'status',
                        status: 'ready',
                        content: 'Procesamiento interrumpido'
                    });
                    break;

                case 'config':
                    // Actualizar configuración
                    if (message.config) {
                        config = { ...config, ...message.config };
                    }
                    break;

                default:
                    sendMessage(ws, {
                        type: 'error',
                        error: `Tipo de mensaje no reconocido: ${message.type}`
                    });
            }
        } catch (error) {
            console.error('Error procesando mensaje:', error);
            sendMessage(ws, {
                type: 'error',
                error: 'Error al procesar el mensaje'
            });
        }
    });

    ws.on('close', () => {
        console.log('❌ Conexión WebSocket cerrada');
    });

    ws.on('error', (error) => {
        console.error('Error en WebSocket:', error);
    });
});

/**
 * Maneja mensajes de texto del cliente
 * @param ws - WebSocket connection
 * @param content - Contenido del mensaje
 * @param config - Configuración del agente
 */
async function handleTextMessage(ws: WebSocket, content: string, config: RealtimeConfig): Promise<void> {
    const startTime = Date.now();

    // Notificar que está procesando
    sendMessage(ws, {
        type: 'status',
        status: 'processing',
        content: 'Analizando mensaje...'
    });

    try {
        // Analizar qué herramientas se necesitan
        const toolsNeeded = analyzeToolNeeds(content);

        // Ejecutar herramientas si es necesario
        const toolResults: any = {};
        for (const tool of toolsNeeded) {
            sendMessage(ws, {
                type: 'tool_call',
                toolName: tool,
                content: `Ejecutando ${tool}...`
            });

            const result = await executeTool(tool, content);
            toolResults[tool] = result;

            sendMessage(ws, {
                type: 'tool_result',
                toolName: tool,
                toolResult: result
            });
        }

        // Generar respuesta
        sendMessage(ws, {
            type: 'status',
            status: 'responding',
            content: 'Generando respuesta...'
        });

        const response = generateResponse(content, toolResults, toolsNeeded);

        // Si streaming está habilitado, enviar en chunks
        if (config.streamingEnabled) {
            await streamResponse(ws, response);
        } else {
            sendMessage(ws, {
                type: 'response',
                content: response,
                metadata: {
                    latency: Date.now() - startTime,
                    toolsUsed: toolsNeeded,
                    confidence: 0.95
                }
            });
        }

        // Volver al estado de escucha
        sendMessage(ws, {
            type: 'status',
            status: 'listening',
            content: 'Escuchando...'
        });

    } catch (error) {
        console.error('Error manejando mensaje:', error);
        sendMessage(ws, {
            type: 'error',
            error: 'Error procesando tu mensaje'
        });

        sendMessage(ws, {
            type: 'status',
            status: 'ready'
        });
    }
}

/**
 * Analiza qué herramientas son necesarias para responder el mensaje
 * @param message - Mensaje del usuario
 * @returns Array de nombres de herramientas necesarias
 */
function analyzeToolNeeds(message: string): string[] {
    const tools: string[] = [];
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('tiempo') || lowerMessage.includes('clima') || lowerMessage.includes('temperatura')) {
        tools.push('weather');
    }

    if (lowerMessage.includes('calcula') || lowerMessage.includes('%') || /\d+\s*[\+\-\*\/]\s*\d+/.test(message)) {
        tools.push('calculator');
    }

    if (lowerMessage.includes('busca') || lowerMessage.includes('información') || lowerMessage.includes('precio')) {
        tools.push('web_search');
    }

    return tools;
}

/**
 * Ejecuta una herramienta específica
 * @param toolName - Nombre de la herramienta
 * @param message - Mensaje del usuario
 * @returns Resultado de la herramienta
 */
async function executeTool(toolName: string, message: string): Promise<any> {
    switch (toolName) {
        case 'weather':
            const location = extractLocation(message) || 'Madrid';
            return await fetchWeatherData(location);

        case 'calculator':
            // Simulación simple
            return {
                result: 'Resultado del cálculo',
                explanation: 'Cálculo realizado'
            };

        case 'web_search':
            // Simulación simple
            return {
                results: ['Resultado 1', 'Resultado 2'],
                summary: 'Búsqueda realizada'
            };

        default:
            return null;
    }
}

/**
 * Extrae ubicación del mensaje
 */
function extractLocation(message: string): string | null {
    const cities = ['madrid', 'barcelona', 'valencia', 'cdmx', 'ciudad de méxico', 'guadalajara', 'monterrey'];
    const lowerMessage = message.toLowerCase();

    for (const city of cities) {
        if (lowerMessage.includes(city)) {
            return city;
        }
    }

    return null;
}

/**
 * Genera una respuesta basada en el mensaje y resultados de herramientas
 * @param message - Mensaje del usuario
 * @param toolResults - Resultados de las herramientas ejecutadas
 * @param toolsUsed - Lista de herramientas usadas
 * @returns Respuesta generada
 */
function generateResponse(message: string, toolResults: any, toolsUsed: string[]): string {
    let response = '';

    if (toolResults.weather) {
        const w = toolResults.weather;
        response += `🌤️ En ${w.location} está ${w.description} con ${w.temperature}°C (sensación térmica: ${w.feelsLike}°C). `;
        response += `Humedad: ${w.humidity}%, Viento: ${w.wind} km/h. `;
    }

    if (toolResults.calculator) {
        response += `🧮 ${toolResults.calculator.explanation} `;
    }

    if (toolResults.web_search) {
        response += `🔍 ${toolResults.web_search.summary} `;
    }

    if (response === '') {
        response = 'He recibido tu mensaje. ¿En qué más puedo ayudarte?';
    }

    return response.trim();
}

/**
 * Envía la respuesta en modo streaming (chunk por chunk)
 * @param ws - WebSocket connection
 * @param response - Respuesta completa a enviar
 */
async function streamResponse(ws: WebSocket, response: string): Promise<void> {
    const words = response.split(' ');

    for (let i = 0; i < words.length; i++) {
        const chunk = words[i] + (i < words.length - 1 ? ' ' : '');

        sendMessage(ws, {
            type: 'chunk',
            chunk: chunk
        });

        // Simular latencia natural
        await new Promise(resolve => setTimeout(resolve, 50 + Math.random() * 50));
    }

    // Señal de finalización - solo notificar que terminó el streaming
    sendMessage(ws, {
        type: 'status',
        status: 'listening',
        content: 'Listo'
    });
}

/**
 * Envía un mensaje al cliente a través de WebSocket
 * @param ws - WebSocket connection
 * @param message - Mensaje a enviar
 */
function sendMessage(ws: WebSocket, message: WebSocketServerMessage): void {
    if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
    }
}

/**
 * Genera un ID de sesión único
 * @returns ID de sesión
 */
function generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Iniciar servidor HTTP (que también maneja WebSocket)
httpServer.listen(PORT, (): void => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`🔌 WebSocket disponible en ws://localhost:${PORT}/ws`);
    console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
    console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
    if (!OPENWEATHER_API_KEY) {
        console.log(`⚠️  OPENWEATHER_API_KEY no configurada - usando datos simulados`);
    }
});
