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
const PORT: number = parseInt(process.env.PORT || '3000', 10);

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
