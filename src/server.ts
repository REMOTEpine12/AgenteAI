import express, { Request, Response, Application } from 'express';
import path from 'path';

// Interfaces para tipado
interface ApiResponse {
    status: string;
    message: string;
    timestamp: string;
}

interface ChatRequest {
    message: string;
}

interface ChatResponse {
    response: string;
    timestamp: string;
}

const app: Application = express();
const PORT: number = parseInt(process.env.PORT || '8080', 10);

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

app.get('/api/demo/tools/weather/:location', (req: Request, res: Response): void => {
    const { location } = req.params;
    
    // Simular datos del clima
    const weatherData: Record<string, { temp: number; condition: string; humidity: number }> = {
        madrid: { temp: 18, condition: 'Parcialmente nublado', humidity: 65 },
        barcelona: { temp: 22, condition: 'Soleado', humidity: 58 },
        valencia: { temp: 20, condition: 'Despejado', humidity: 62 }
    };
    
    const weather = weatherData[location.toLowerCase()] || { temp: 16, condition: 'Variable', humidity: 60 };
    
    setTimeout(() => {
        res.json({
            location,
            ...weather,
            timestamp: new Date().toISOString()
        });
    }, Math.random() * 800 + 400); // 0.4-1.2s delay
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

// Iniciar servidor
app.listen(PORT, (): void => {
    console.log(`🚀 Servidor ejecutándose en http://localhost:${PORT}`);
    console.log(`📁 Sirviendo archivos desde: ${path.join(__dirname, '../public')}`);
    console.log(`🔧 Modo: ${process.env.NODE_ENV || 'development'}`);
});
