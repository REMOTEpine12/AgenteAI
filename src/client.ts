// Interfaces para tipado
interface ServerStatusResponse {
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

interface Message {
    id: string;
    sender: string;
    text: string;
    className: string;
    timestamp: Date;
}

// Clase principal de la aplicación
class ChatApp {
    protected serverStatus: HTMLElement | null;
    protected messageInput: HTMLInputElement | null;
    protected sendButton: HTMLButtonElement | null;
    protected chatMessages: HTMLElement | null;
    protected isServerOnline: boolean = false;
    protected messages: Message[] = [];

    constructor() {
        this.serverStatus = document.getElementById('server-status');
        this.messageInput = document.getElementById('message-input') as HTMLInputElement;
        this.sendButton = document.getElementById('send-button') as HTMLButtonElement;
        this.chatMessages = document.getElementById('chat-messages');
        
        this.init();
    }

    protected init(): void {
        this.checkServerStatus();
        this.setupEventListeners();
        
        // Verificar estado del servidor cada 30 segundos
        setInterval(() => this.checkServerStatus(), 30000);
    }

    protected setupEventListeners(): void {
        // Enviar mensaje con botón
        this.sendButton?.addEventListener('click', () => this.sendMessage());
        
        // Enviar mensaje con Enter
        this.messageInput?.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Feedback visual en botones
        this.sendButton?.addEventListener('mousedown', () => {
            if (this.sendButton) {
                this.addVisualFeedback(this.sendButton);
            }
        });
    }

    protected async checkServerStatus(): Promise<void> {
        try {
            const response = await fetch('/api/status');
            const data: ServerStatusResponse = await response.json();
            
            if (data.status === 'success') {
                this.isServerOnline = true;
                this.updateServerStatusUI(true, data.timestamp);
            }
        } catch (error) {
            this.isServerOnline = false;
            this.updateServerStatusUI(false, undefined, error as Error);
        }
    }

    protected updateServerStatusUI(isOnline: boolean, timestamp?: string, error?: Error): void {
        if (!this.serverStatus) return;

        if (isOnline && timestamp) {
            this.serverStatus.innerHTML = `
                <div class="status-online">
                    ✅ Servidor en línea
                </div>
                <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                    Última verificación: ${new Date(timestamp).toLocaleString()}
                </div>
            `;
        } else {
            this.serverStatus.innerHTML = `
                <div class="status-offline">
                    ❌ Servidor desconectado
                </div>
                <div style="font-size: 0.9rem; color: #666; margin-top: 0.5rem;">
                    Error: ${error?.message || 'Conexión perdida'}
                </div>
            `;
        }
    }

    protected async sendMessage(): Promise<void> {
        if (!this.messageInput) return;

        const message = this.messageInput.value.trim();
        
        if (!message) {
            return;
        }
        
        if (!this.isServerOnline) {
            this.addMessage('Sistema', 'El servidor no está disponible. Por favor, intenta más tarde.', 'system-message');
            return;
        }
        
        // Agregar mensaje del usuario
        this.addMessage('Tú', message, 'user-message');
        this.messageInput.value = '';
        
        // Mostrar indicador de escritura
        const typingId = this.addMessage('Agente IA', 'Escribiendo...', 'bot-message');
        
        try {
            const requestBody: ChatRequest = { message };
            
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data: ChatResponse = await response.json();
            
            // Remover indicador de escritura
            this.removeMessage(typingId);
            
            // Agregar respuesta del bot
            this.addMessage('Agente IA', data.response, 'bot-message');
            
        } catch (error) {
            // Remover indicador de escritura
            this.removeMessage(typingId);
            
            const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
            this.addMessage('Sistema', `Error al enviar el mensaje: ${errorMessage}`, 'system-message');
            console.error('Error:', error);
        }
    }

    protected addMessage(sender: string, text: string, className: string): string {
        if (!this.chatMessages) return '';

        const messageId = `${Date.now()}-${Math.random()}`;
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${className}`;
        messageDiv.id = `message-${messageId}`;
        messageDiv.innerHTML = `
            <strong>${this.escapeHtml(sender)}:</strong> ${this.escapeHtml(text)}
            <div style="font-size: 0.8rem; color: #999; margin-top: 0.25rem;">
                ${this.formatTime(new Date())}
            </div>
        `;
        
        // Guardar mensaje en el historial
        this.messages.push({
            id: messageId,
            sender,
            text,
            className,
            timestamp: new Date()
        });
        
        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        
        return messageId;
    }

    protected removeMessage(messageId: string): void {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.remove();
        }
        
        // Remover del historial
        this.messages = this.messages.filter(msg => msg.id !== messageId);
    }

    protected formatTime(date: Date): string {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    protected addVisualFeedback(element: HTMLElement): void {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    protected escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Métodos públicos para extensibilidad
    public getMessages(): Message[] {
        return [...this.messages];
    }

    public clearChat(): void {
        if (this.chatMessages) {
            this.chatMessages.innerHTML = `
                <div class="message system-message">
                    <strong>Sistema:</strong> Chat limpiado. ¡Puedes empezar una nueva conversación!
                </div>
            `;
        }
        this.messages = [];
    }

    public getServerStatus(): boolean {
        return this.isServerOnline;
    }
}

// Interfaces para el Demo Agente
interface DemoMessage {
    id: string;
    type: 'user' | 'agent' | 'system' | 'tool';
    content: string;
    timestamp: Date;
    toolsUsed?: string[];
    metadata?: {
        latency?: number;
        confidence?: number;
        sources?: string[];
    };
}

interface DemoTool {
    name: string;
    icon: string;
    status: 'ready' | 'active' | 'error';
    description: string;
}

interface DemoMetrics {
    latency: number;
    toolsCount: number;
    messageCount: number;
    sessionDuration: number;
    toolsUsed: number;
}

// Simulador de herramientas para el demo
class DemoToolSimulator {
    private tools: Map<string, DemoTool> = new Map([
        ['web_search', { name: 'Búsqueda Web', icon: '🔍', status: 'ready', description: 'Busca información en tiempo real' }],
        ['calculator', { name: 'Calculadora', icon: '🧮', status: 'ready', description: 'Realiza cálculos complejos' }],
        ['weather', { name: 'Clima', icon: '🌤️', status: 'ready', description: 'Información meteorológica' }],
        ['currency', { name: 'Divisas', icon: '💱', status: 'ready', description: 'Conversión de monedas' }]
    ]);

    async simulateWebSearch(query: string): Promise<any> {
        await this.delay(800, 1500);
        
        // Simulaciones específicas basadas en la consulta
        if (query.toLowerCase().includes('bitcoin') || query.toLowerCase().includes('btc')) {
            return {
                results: [
                    { title: 'Bitcoin Price Today', url: 'coinmarketcap.com', snippet: 'Bitcoin está cotizando a $43,250 USD (+5.2% en 24h)' },
                    { title: 'Bitcoin Analysis', url: 'coindesk.com', snippet: 'Análisis técnico muestra tendencia alcista' }
                ],
                summary: 'El precio actual de Bitcoin es $43,250 USD, con un aumento del 5.2% en las últimas 24 horas.'
            };
        }
        
        if (query.toLowerCase().includes('tiempo') || query.toLowerCase().includes('clima')) {
            return {
                results: [
                    { title: 'Weather Madrid', url: 'weather.com', snippet: 'Madrid: 18°C, parcialmente nublado' }
                ],
                summary: 'El clima en Madrid es de 18°C con cielos parcialmente nublados.'
            };
        }
        
        if (query.toLowerCase().includes('typescript') || query.toLowerCase().includes('javascript')) {
            return {
                results: [
                    { title: 'TypeScript vs JavaScript', url: 'developer.mozilla.org', snippet: 'TypeScript añade tipado estático a JavaScript' },
                    { title: 'TypeScript Benefits', url: 'typescriptlang.org', snippet: 'Mejor detección de errores y IntelliSense' }
                ],
                summary: 'TypeScript es un superset de JavaScript que añade tipado estático, mejorando la detección de errores y la experiencia de desarrollo.'
            };
        }
        
        return {
            results: [
                { title: 'Resultado de búsqueda', url: 'example.com', snippet: `Información relevante sobre: ${query}` }
            ],
            summary: `He encontrado información relevante sobre "${query}".`
        };
    }

    async simulateCalculator(expression: string): Promise<any> {
        await this.delay(200, 500);
        
        try {
            // Simulaciones específicas
            if (expression.includes('15%') && expression.includes('85')) {
                return {
                    result: '12.75',
                    calculation: '85 × 0.15 = 12.75',
                    explanation: 'El 15% de propina para 85 euros es 12.75 euros. Total con propina: 97.75 euros.'
                };
            }
            
            if (expression.includes('Bitcoin') || expression.includes('43250')) {
                return {
                    result: '39,652.50',
                    calculation: '43,250 × 0.918 = 39,652.50',
                    explanation: 'Conversión de 43,250 USD a EUR (tipo de cambio: 0.918)'
                };
            }
            
            // Evaluación simple para números básicos
            const cleanExpression = expression.replace(/[^0-9+\-*/().% ]/g, '');
            const result = eval(cleanExpression.replace('%', '/100'));
            
            return {
                result: result.toString(),
                calculation: `${cleanExpression} = ${result}`,
                explanation: `Resultado del cálculo: ${result}`
            };
        } catch (error) {
            return {
                result: 'Error',
                calculation: expression,
                explanation: 'No pude procesar este cálculo. Intenta con una expresión matemática válida.'
            };
        }
    }

    async simulateWeather(location: string): Promise<any> {
        await this.delay(600, 1000);
        
        const weatherData: Record<string, { temp: number; condition: string; humidity: number; wind: string }> = {
            // Ciudades españolas
            'madrid': { temp: 18, condition: 'Parcialmente nublado', humidity: 65, wind: '12 km/h' },
            'barcelona': { temp: 22, condition: 'Soleado', humidity: 58, wind: '8 km/h' },
            'valencia': { temp: 20, condition: 'Despejado', humidity: 62, wind: '10 km/h' },
            
            // Ciudades mexicanas
            'cdmx': { temp: 24, condition: 'Parcialmente nublado', humidity: 45, wind: '10 km/h' },
            'ciudad de mexico': { temp: 24, condition: 'Parcialmente nublado', humidity: 45, wind: '10 km/h' },
            'ciudad de méxico': { temp: 24, condition: 'Parcialmente nublado', humidity: 45, wind: '10 km/h' },
            'guadalajara': { temp: 28, condition: 'Soleado', humidity: 40, wind: '8 km/h' },
            'monterrey': { temp: 32, condition: 'Despejado', humidity: 35, wind: '15 km/h' },
            'cancun': { temp: 30, condition: 'Soleado', humidity: 75, wind: '12 km/h' },
            'cancún': { temp: 30, condition: 'Soleado', humidity: 75, wind: '12 km/h' },
            'puebla': { temp: 22, condition: 'Parcialmente nublado', humidity: 50, wind: '9 km/h' },
            'tijuana': { temp: 21, condition: 'Despejado', humidity: 55, wind: '18 km/h' },
            'merida': { temp: 33, condition: 'Soleado', humidity: 70, wind: '7 km/h' },
            'mérida': { temp: 33, condition: 'Soleado', humidity: 70, wind: '7 km/h' }
        };
        
        const city = location.toLowerCase();
        const weather = weatherData[city] || { temp: 16, condition: 'Variable', humidity: 60, wind: '15 km/h' };
        
        return {
            location: location,
            temperature: weather.temp,
            condition: weather.condition,
            humidity: weather.humidity,
            wind: weather.wind,
            summary: `En ${location}: ${weather.temp}°C, ${weather.condition.toLowerCase()}. Humedad: ${weather.humidity}%, Viento: ${weather.wind}.`
        };
    }

    async simulateCurrency(from: string, to: string, amount: number): Promise<any> {
        await this.delay(400, 800);
        
        const rates: Record<string, number> = {
            'USD-EUR': 0.918,
            'EUR-USD': 1.089,
            'USD-MXN': 17.28,
            'MXN-USD': 0.058,
            'EUR-MXN': 18.82,
            'MXN-EUR': 0.053
        };
        
        const rateKey = `${from.toUpperCase()}-${to.toUpperCase()}`;
        const rate = rates[rateKey] || 1;
        const result = amount * rate;
        
        return {
            from,
            to,
            amount,
            rate,
            result: result.toFixed(2),
            summary: `${amount} ${from.toUpperCase()} = ${result.toFixed(2)} ${to.toUpperCase()} (Tipo de cambio: ${rate})`
        };
    }

    private async delay(min: number, max: number): Promise<void> {
        const delay = Math.random() * (max - min) + min;
        return new Promise(resolve => setTimeout(resolve, delay));
    }

    getTool(name: string): DemoTool | undefined {
        return this.tools.get(name);
    }

    getAllTools(): DemoTool[] {
        return Array.from(this.tools.values());
    }

    setToolStatus(name: string, status: 'ready' | 'active' | 'error'): void {
        const tool = this.tools.get(name);
        if (tool) {
            tool.status = status;
        }
    }
}

/**
 * Clase principal del Demo Agente en Tiempo Real
 * Inspirado en el Realtime Demo Agent de OpenAI
 * Características:
 * - WebSocket para comunicación bidireccional
 * - Streaming de respuestas en tiempo real
 * - Soporte para audio (entrada de voz)
 * - Escucha continua (no por turnos)
 */
class DemoRealtimeAgent {
    private messages: DemoMessage[] = [];
    private metrics: DemoMetrics = {
        latency: 0,
        toolsCount: 0,
        messageCount: 0,
        sessionDuration: 0,
        toolsUsed: 0
    };
    private sessionStartTime: Date = new Date();
    private toolSimulator: DemoToolSimulator = new DemoToolSimulator();
    private isProcessing: boolean = false;

    // WebSocket y audio
    private ws: WebSocket | null = null;
    private audioContext: AudioContext | null = null;
    private mediaStream: MediaStream | null = null;
    private isRecording: boolean = false;
    private currentStreamingMessage: string = '';
    private useWebSocket: boolean = true; // Cambia a false para usar simulación
    
    // Reconocimiento de voz
    private recognition: any = null;
    private isVoiceEnabled: boolean = false;
    private speechSynthesis: SpeechSynthesis = window.speechSynthesis;

    // Elementos DOM
    private chatMessages!: HTMLElement;
    private messageInput!: HTMLTextAreaElement;
    private sendButton!: HTMLButtonElement;
    private clearButton!: HTMLButtonElement;
    private voiceButton!: HTMLButtonElement;
    private connectionStatus!: HTMLElement;
    private latencyDisplay!: HTMLElement;
    private toolsCountDisplay!: HTMLElement;
    private messageCountDisplay: HTMLElement | null = null;
    private sessionDurationDisplay: HTMLElement | null = null;
    private toolsUsedDisplay: HTMLElement | null = null;
    private activeToolsDisplay!: HTMLElement;
    private toolItems!: NodeListOf<HTMLElement>;
    private exampleButtons!: NodeListOf<HTMLButtonElement>;

    constructor() {
        this.initializeElements();
        this.setupEventListeners();
        this.initializeVoiceRecognition();
        this.startMetricsUpdater();
        this.showWelcomeMessage();

        // Inicializar WebSocket si está habilitado
        if (this.useWebSocket) {
            this.initializeWebSocket();
        }
    }

    /**
     * Inicializa la conexión WebSocket con el servidor
     */
    private initializeWebSocket(): void {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;

        console.log('🔌 Conectando a WebSocket:', wsUrl);

        try {
            this.ws = new WebSocket(wsUrl);

            this.ws.onopen = () => {
                console.log('✅ WebSocket conectado');
                this.updateConnectionStatus('connected');
            };

            this.ws.onmessage = (event) => {
                this.handleWebSocketMessage(event.data);
            };

            this.ws.onerror = (error) => {
                console.error('❌ Error en WebSocket:', error);
                this.updateConnectionStatus('disconnected');
            };

            this.ws.onclose = () => {
                console.log('🔌 WebSocket desconectado');
                this.updateConnectionStatus('disconnected');

                // Intentar reconectar después de 3 segundos
                setTimeout(() => {
                    if (this.useWebSocket) {
                        this.initializeWebSocket();
                    }
                }, 3000);
            };
        } catch (error) {
            console.error('Error al crear WebSocket:', error);
            this.updateConnectionStatus('disconnected');
            // Fallback a simulación
            this.useWebSocket = false;
        }
    }

    /**
     * Maneja mensajes recibidos del servidor vía WebSocket
     * @param data - Datos recibidos del servidor
     */
    private handleWebSocketMessage(data: string): void {
        try {
            const message = JSON.parse(data);

            switch (message.type) {
                case 'status':
                    // Actualizar estado de conexión
                    if (message.status === 'listening') {
                        this.hideTypingIndicator();
                        // Si hay un mensaje de streaming, finalizarlo
                        if (this.currentStreamingMessage) {
                            this.finalizeStreamingMessage(this.currentStreamingMessage);
                        }
                    } else if (message.status === 'processing') {
                        this.showTypingIndicator();
                    }
                    break;

                case 'chunk':
                    // Streaming: agregar chunk a mensaje actual
                    this.currentStreamingMessage += message.chunk;
                    this.updateStreamingMessage(this.currentStreamingMessage);
                    break;

                case 'response':
                    // Respuesta completa (no se usa con streaming)
                    this.hideTypingIndicator();
                    this.addMessage({
                        id: this.generateId(),
                        type: 'agent',
                        content: message.content,
                        timestamp: new Date(),
                        toolsUsed: message.metadata?.toolsUsed || [],
                        metadata: message.metadata
                    });
                    this.currentStreamingMessage = '';

                    // Actualizar métricas
                    if (message.metadata?.latency) {
                        this.metrics.latency = message.metadata.latency;
                    }
                    if (message.metadata?.toolsUsed?.length) {
                        this.metrics.toolsUsed++;
                    }
                    this.metrics.messageCount++;
                    break;

                case 'tool_call':
                    // Herramienta siendo ejecutada
                    if (message.toolName) {
                        this.setToolActive(message.toolName);
                    }
                    break;

                case 'tool_result':
                    // Resultado de herramienta
                    if (message.toolName) {
                        this.setToolReady(message.toolName);
                    }
                    break;

                case 'error':
                    // Error del servidor
                    this.hideTypingIndicator();

                    const errorMessage: DemoMessage = {
                        id: this.generateId(),
                        type: 'system',
                        content: `Error: ${message.error}`,
                        timestamp: new Date()
                    };

                    this.addMessage(errorMessage);
                    break;
            }

            this.updateMetricsDisplay();
        } catch (error) {
            console.error('Error al procesar mensaje WebSocket:', error);
        }
    }

    /**
     * Actualiza el mensaje que se está recibiendo por streaming
     * @param content - Contenido parcial del mensaje
     */
    private updateStreamingMessage(content: string): void {
        let streamingDiv = document.getElementById('streaming-message');

        if (!streamingDiv) {
            streamingDiv = document.createElement('div');
            streamingDiv.id = 'streaming-message';
            streamingDiv.className = 'message agent-message streaming';

            const timeStr = new Date().toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            streamingDiv.innerHTML = `
                <div class="message-header">
                    <strong>🤖 Agente IA</strong>
                    <span class="message-time">${timeStr}</span>
                </div>
                <div class="message-content"></div>
            `;

            this.chatMessages.appendChild(streamingDiv);
        }

        const contentDiv = streamingDiv.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.textContent = content;
        }

        this.scrollToBottom();
    }

    /**
     * Finaliza el mensaje de streaming y lo convierte en mensaje final
     * @param content - Contenido final del mensaje
     */
    private finalizeStreamingMessage(content: string): void {
        const streamingDiv = document.getElementById('streaming-message');
        if (!streamingDiv) return;

        // Crear mensaje final
        const agentMessage: DemoMessage = {
            id: this.generateId(),
            type: 'agent',
            content: content,
            timestamp: new Date()
        };

        // Agregar el mensaje final al historial
        this.messages.push(agentMessage);

        // Actualizar métricas
        this.metrics.messageCount++;

        // Remover el div de streaming y agregar el mensaje final
        streamingDiv.remove();
        this.currentStreamingMessage = '';

        // Crear el mensaje final con la misma estructura
        const finalDiv = document.createElement('div');
        finalDiv.className = 'message agent-message';
        finalDiv.id = `message-${agentMessage.id}`;

        const timeStr = agentMessage.timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        finalDiv.innerHTML = `
            <div class="message-header">
                <strong>🤖 Agente IA</strong>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-content">${this.formatMessageContent(content)}</div>
        `;

        this.chatMessages.appendChild(finalDiv);
        this.scrollToBottom();

        // Reproducir con voz si está habilitado
        if (this.isVoiceEnabled) {
            const cleanText = content
                .replace(/<[^>]*>/g, '')
                .replace(/\*\*(.*?)\*\*/g, '$1')
                .replace(/\*(.*?)\*/g, '$1')
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
                .trim();
            
            if (cleanText) {
                setTimeout(() => {
                    this.speakText(cleanText);
                }, 500);
            }
        }
    }

    /**
     * Inicializa el reconocimiento de voz
     */
    private initializeVoiceRecognition(): void {
        // Verificar si el navegador soporta reconocimiento de voz
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            
            this.recognition.continuous = false;
            this.recognition.interimResults = false;
            this.recognition.lang = 'es-ES';
            
            this.recognition.onstart = () => {
                console.log('🎤 Reconocimiento de voz iniciado');
                this.voiceButton.classList.add('recording');
                this.voiceButton.textContent = '🔴';
            };
            
            this.recognition.onresult = (event: any) => {
                const transcript = event.results[0][0].transcript;
                console.log('🎤 Texto reconocido:', transcript);
                this.messageInput.value = transcript;
                this.voiceButton.classList.remove('recording');
                this.voiceButton.textContent = '🎤';
                
                // Enviar automáticamente el mensaje
                this.sendMessage();
            };
            
            this.recognition.onerror = (event: any) => {
                console.error('Error en reconocimiento de voz:', event.error);
                this.voiceButton.classList.remove('recording');
                this.voiceButton.textContent = '🎤';
                
                let errorMessage = 'Error en el reconocimiento de voz';
                if (event.error === 'no-speech') {
                    errorMessage = 'No se detectó voz. Intenta de nuevo.';
                } else if (event.error === 'audio-capture') {
                    errorMessage = 'No se pudo acceder al micrófono.';
                } else if (event.error === 'not-allowed') {
                    errorMessage = 'Permisos de micrófono denegados.';
                }
                
                this.addMessage({
                    id: this.generateId(),
                    type: 'system',
                    content: errorMessage,
                    timestamp: new Date()
                });
            };
            
            this.recognition.onend = () => {
                this.voiceButton.classList.remove('recording');
                this.voiceButton.textContent = '🎤';
            };
            
            this.isVoiceEnabled = true;
            console.log('✅ Reconocimiento de voz inicializado');
        } else {
            console.warn('⚠️ Reconocimiento de voz no soportado en este navegador');
            this.voiceButton.style.display = 'none';
        }
    }

    /**
     * Alterna la grabación de voz
     */
    private toggleVoiceRecording(): void {
        if (!this.isVoiceEnabled || !this.recognition) {
            this.addMessage({
                id: this.generateId(),
                type: 'system',
                content: 'Reconocimiento de voz no disponible en este navegador.',
                timestamp: new Date()
            });
            return;
        }

        if (this.isRecording) {
            this.recognition.stop();
        } else {
            this.recognition.start();
        }
    }

    /**
     * Reproduce la respuesta del agente usando síntesis de voz
     */
    private speakText(text: string): void {
        if (!this.speechSynthesis) {
            console.warn('Síntesis de voz no disponible');
            return;
        }

        // Cancelar cualquier síntesis anterior
        this.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'es-ES';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;

        // Buscar una voz en español
        const voices = this.speechSynthesis.getVoices();
        const spanishVoice = voices.find(voice => 
            voice.lang.startsWith('es') || voice.name.includes('Spanish')
        );
        
        if (spanishVoice) {
            utterance.voice = spanishVoice;
        }

        utterance.onstart = () => {
            console.log('🔊 Reproduciendo respuesta...');
        };

        utterance.onend = () => {
            console.log('🔇 Reproducción terminada');
        };

        utterance.onerror = (event) => {
            console.error('Error en síntesis de voz:', event.error);
        };

        this.speechSynthesis.speak(utterance);
    }

    private initializeElements(): void {
        // Chat elements
        this.chatMessages = document.getElementById('demo-chat-messages')!;
        this.messageInput = document.getElementById('demo-message-input') as HTMLTextAreaElement;
        this.sendButton = document.getElementById('demo-send-button') as HTMLButtonElement;
        this.clearButton = document.getElementById('demo-clear-button') as HTMLButtonElement;
        this.voiceButton = document.getElementById('demo-voice-button') as HTMLButtonElement;
        
        // Status elements
        this.connectionStatus = document.getElementById('demo-connection-status')!;
        this.latencyDisplay = document.getElementById('demo-latency')!;
        this.toolsCountDisplay = document.getElementById('demo-tools-count')!;
        this.messageCountDisplay = document.getElementById('demo-message-count');
        this.sessionDurationDisplay = document.getElementById('demo-session-duration');
        this.toolsUsedDisplay = document.getElementById('demo-tools-used');
        this.activeToolsDisplay = document.getElementById('demo-active-tools')!;
        
        // Tool and example elements
        this.toolItems = document.querySelectorAll('.tool-item');
        this.exampleButtons = document.querySelectorAll('.example-button');

        // Set initial connection status
        this.updateConnectionStatus('connected');
    }

    private setupEventListeners(): void {
        // Send message
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Voice button
        this.voiceButton.addEventListener('click', () => this.toggleVoiceRecording());

        // Enter key to send (Shift+Enter for new line)
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Clear chat
        this.clearButton.addEventListener('click', () => this.clearChat());

        // Example buttons
        // Ejemplos (si existen)
        this.exampleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const example = button.getAttribute('data-example');
                if (example) {
                    this.messageInput.value = example;
                    this.sendMessage();
                }
            });
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.messageInput.style.height = 'auto';
            this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
        });
    }

    private startMetricsUpdater(): void {
        setInterval(() => {
            this.updateSessionDuration();
            this.updateMetricsDisplay();
        }, 1000);
    }

    private showWelcomeMessage(): void {
        // El mensaje de bienvenida ya está en el HTML
        this.updateMetricsDisplay();
    }

    /**
     * Envía un mensaje al agente
     * Si WebSocket está disponible, lo usa; de lo contrario, usa simulación
     */
    private async sendMessage(): Promise<void> {
        if (this.isProcessing) return;

        const content = this.messageInput.value.trim();
        if (!content) return;

        this.isProcessing = true;
        this.updateSendButton(true);

        // Add user message
        const userMessage: DemoMessage = {
            id: this.generateId(),
            type: 'user',
            content,
            timestamp: new Date()
        };

        this.addMessage(userMessage);
        this.messageInput.value = '';
        this.messageInput.style.height = 'auto';

        try {
            // Usar WebSocket si está disponible y conectado
            if (this.useWebSocket && this.ws && this.ws.readyState === WebSocket.OPEN) {
                await this.sendMessageViaWebSocket(content);
            } else {
                // Fallback: usar simulación local
                await this.sendMessageViaSimulation(content);
            }
        } catch (error) {
            this.hideTypingIndicator();

            const errorMessage: DemoMessage = {
                id: this.generateId(),
                type: 'system',
                content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo.',
                timestamp: new Date()
            };

            this.addMessage(errorMessage);
        } finally {
            this.isProcessing = false;
            this.updateSendButton(false);
        }
    }

    /**
     * Envía mensaje usando WebSocket
     * @param content - Contenido del mensaje
     */
    private async sendMessageViaWebSocket(content: string): Promise<void> {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
            throw new Error('WebSocket no disponible');
        }

        // Limpiar mensaje de streaming anterior
        const streamingMsg = document.getElementById('streaming-message');
        if (streamingMsg) {
            streamingMsg.remove();
        }
        this.currentStreamingMessage = '';

        // Mostrar indicador de escritura
        this.showTypingIndicator();

        // Enviar mensaje al servidor
        this.ws.send(JSON.stringify({
            type: 'message',
            content: content
        }));

        // El servidor responderá vía WebSocket, manejado en handleWebSocketMessage
    }

    /**
     * Envía mensaje usando simulación local (sin WebSocket)
     * @param content - Contenido del mensaje
     */
    private async sendMessageViaSimulation(content: string): Promise<void> {
        const startTime = Date.now();

        // Show typing indicator
        this.showTypingIndicator();

        // Analyze what tools are needed
        const neededTools = await this.analyzeToolNeeds(content);

        // Execute tools if needed
        let toolResults: any = {};
        if (neededTools.length > 0) {
            toolResults = await this.executeTools(content, neededTools);
        }

        // Generate response
        const response = await this.generateResponse(content, toolResults, neededTools);
        const latency = Date.now() - startTime;

        // Remove typing indicator
        this.hideTypingIndicator();

        // Add agent response
        const agentMessage: DemoMessage = {
            id: this.generateId(),
            type: 'agent',
            content: response,
            timestamp: new Date(),
            toolsUsed: neededTools,
            metadata: {
                latency,
                confidence: 0.95,
                sources: toolResults.sources || []
            }
        };

        this.addMessage(agentMessage);

        // Update metrics
        this.metrics.latency = latency;
        this.metrics.messageCount++;
        if (neededTools.length > 0) {
            this.metrics.toolsUsed++;
        }

        this.clearActiveTools();
    }

    private async analyzeToolNeeds(message: string): Promise<string[]> {
        const tools: string[] = [];
        const lowerMessage = message.toLowerCase();

        // Análisis simple basado en palabras clave
        if (lowerMessage.includes('busca') || lowerMessage.includes('información') || 
            lowerMessage.includes('bitcoin') || lowerMessage.includes('precio') ||
            lowerMessage.includes('typescript') || lowerMessage.includes('javascript')) {
            tools.push('web_search');
        }

        if (lowerMessage.includes('calcula') || lowerMessage.includes('cálculo') ||
            lowerMessage.includes('%') || lowerMessage.includes('propina') ||
            /\d+\s*[\+\-\*\/]\s*\d+/.test(lowerMessage)) {
            tools.push('calculator');
        }

        if (lowerMessage.includes('tiempo') || lowerMessage.includes('clima') ||
            lowerMessage.includes('temperatura') || lowerMessage.includes('madrid') || 
            lowerMessage.includes('cdmx') || lowerMessage.includes('ciudad de mexico') ||
            lowerMessage.includes('méxico') || lowerMessage.includes('mexico') ||
            lowerMessage.includes('guadalajara') || lowerMessage.includes('monterrey') ||
            lowerMessage.includes('cancún') || lowerMessage.includes('cancun')) {
            tools.push('weather');
        }

        if (lowerMessage.includes('euro') || lowerMessage.includes('dólar') ||
            lowerMessage.includes('peso') || lowerMessage.includes('conversión') ||
            lowerMessage.includes('cambio')) {
            tools.push('currency');
        }

        return tools;
    }

    private async executeTools(message: string, tools: string[]): Promise<any> {
        const results: any = {};
        this.showActiveTools(tools);

        for (const toolName of tools) {
            this.setToolActive(toolName);
            
            try {
                switch (toolName) {
                    case 'web_search':
                        results.webSearch = await this.toolSimulator.simulateWebSearch(message);
                        break;
                    case 'calculator':
                        results.calculator = await this.toolSimulator.simulateCalculator(message);
                        break;
                    case 'weather':
                        const location = this.extractLocation(message) || 'Madrid';
                        results.weather = await this.toolSimulator.simulateWeather(location);
                        break;
                    case 'currency':
                        const { from, to, amount } = this.extractCurrencyInfo(message);
                        results.currency = await this.toolSimulator.simulateCurrency(from, to, amount);
                        break;
                }
                
                this.setToolReady(toolName);
            } catch (error) {
                this.setToolError(toolName);
            }
        }

        return results;
    }

    private async generateResponse(message: string, toolResults: any, toolsUsed: string[]): Promise<string> {
        // Simular tiempo de generación de respuesta
        await new Promise(resolve => setTimeout(resolve, 500));

        let response = '';

        // Construir respuesta basada en herramientas usadas
        if (toolResults.webSearch) {
            response += `🔍 **Búsqueda realizada:**\n${toolResults.webSearch.summary}\n\n`;
            if (toolResults.webSearch.results.length > 0) {
                response += `**Fuentes consultadas:**\n`;
                toolResults.webSearch.results.forEach((result: any, index: number) => {
                    response += `${index + 1}. [${result.title}](${result.url})\n`;
                });
                response += '\n';
            }
        }

        if (toolResults.calculator) {
            response += `🧮 **Cálculo realizado:**\n`;
            response += `${toolResults.calculator.calculation}\n`;
            response += `${toolResults.calculator.explanation}\n\n`;
        }

        if (toolResults.weather) {
            response += `🌤️ **Información del clima:**\n`;
            response += `${toolResults.weather.summary}\n\n`;
        }

        if (toolResults.currency) {
            response += `💱 **Conversión de moneda:**\n`;
            response += `${toolResults.currency.summary}\n\n`;
        }

        // Si no se usaron herramientas, generar respuesta conversacional
        if (toolsUsed.length === 0) {
            const responses = [
                "Entiendo tu consulta. ¿Podrías ser más específico sobre lo que necesitas?",
                "Interesante pregunta. ¿Te gustaría que busque información específica sobre esto?",
                "Puedo ayudarte con eso. ¿Necesitas que realice algún cálculo o búsqueda?",
                "¡Por supuesto! ¿Hay algún aspecto particular que te interese más?"
            ];
            response = responses[Math.floor(Math.random() * responses.length)];
        } else {
            response += `¿Hay algo más en lo que pueda ayudarte?`;
        }

        return response;
    }

    private extractLocation(message: string): string | null {
        // Ciudades españolas y mexicanas
        const cities = [
            'madrid', 'barcelona', 'valencia', 'sevilla', 'bilbao',
            'cdmx', 'ciudad de mexico', 'ciudad de méxico', 'guadalajara', 'monterrey', 
            'cancun', 'cancún', 'puebla', 'tijuana', 'merida', 'mérida'
        ];
        const lowerMessage = message.toLowerCase();
        
        // Buscar coincidencias exactas primero (para frases como "Ciudad de México")
        for (const city of cities) {
            if (lowerMessage.includes(city)) {
                // Capitalizar apropiadamente
                if (city === 'cdmx') return 'CDMX';
                if (city === 'ciudad de mexico' || city === 'ciudad de méxico') return 'Ciudad de México';
                return city.charAt(0).toUpperCase() + city.slice(1);
            }
        }
        
        return null;
    }

    private extractCurrencyInfo(message: string): { from: string, to: string, amount: number } {
        const lowerMessage = message.toLowerCase();
        
        // Extraer cantidad
        const amountMatch = message.match(/(\d+(?:\.\d+)?)/);
        const amount = amountMatch ? parseFloat(amountMatch[1]) : 100;
        
        // Determinar monedas
        let from = 'USD', to = 'EUR';
        
        if (lowerMessage.includes('bitcoin') || lowerMessage.includes('btc')) {
            from = 'USD';
            to = 'EUR';
        } else if (lowerMessage.includes('euro') && lowerMessage.includes('dólar')) {
            from = lowerMessage.indexOf('euro') < lowerMessage.indexOf('dólar') ? 'EUR' : 'USD';
            to = from === 'EUR' ? 'USD' : 'EUR';
        } else if (lowerMessage.includes('peso')) {
            from = 'USD';
            to = 'MXN';
        }
        
        return { from, to, amount };
    }

    private addMessage(message: DemoMessage): void {
        this.messages.push(message);
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${message.type}-message`;
        messageDiv.id = `message-${message.id}`;

        const timeStr = message.timestamp.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let senderName = '';
        switch (message.type) {
            case 'user': senderName = '👤 Tú'; break;
            case 'agent': senderName = '🤖 Agente IA'; break;
            case 'system': senderName = '⚙️ Sistema'; break;
            case 'tool': senderName = '🛠️ Herramienta'; break;
        }

        messageDiv.innerHTML = `
            <div class="message-header">
                <strong>${senderName}</strong>
                <span class="message-time">${timeStr}</span>
            </div>
            <div class="message-content">${this.formatMessageContent(message.content)}</div>
            ${message.toolsUsed && message.toolsUsed.length > 0 ? this.createToolsBadges(message.toolsUsed) : ''}
            ${message.metadata?.latency ? `<div class="message-metadata">⚡ ${message.metadata.latency}ms</div>` : ''}
        `;

        this.chatMessages.appendChild(messageDiv);
        this.scrollToBottom();

        // Reproducir con voz las respuestas del agente (excepto mensajes de sistema)
        if (message.type === 'agent' && this.isVoiceEnabled) {
            // Limpiar el contenido de HTML para la síntesis de voz
            const cleanText = message.content
                .replace(/<[^>]*>/g, '') // Remover HTML tags
                .replace(/\*\*(.*?)\*\*/g, '$1') // Remover markdown bold
                .replace(/\*(.*?)\*/g, '$1') // Remover markdown italic
                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remover links markdown
                .trim();
            
            if (cleanText) {
                // Pequeño delay para que el usuario vea el mensaje antes de escucharlo
                setTimeout(() => {
                    this.speakText(cleanText);
                }, 500);
            }
        }
    }

    private formatMessageContent(content: string): string {
        // Convertir markdown básico a HTML
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>')
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    }

    private createToolsBadges(tools: string[]): string {
        const badges = tools.map(tool => {
            const toolInfo = this.toolSimulator.getTool(tool);
            return `<span class="tool-badge">${toolInfo?.icon || '🔧'} ${toolInfo?.name || tool}</span>`;
        }).join('');
        
        return `<div class="tools-used">${badges}</div>`;
    }

    private showTypingIndicator(): void {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <span>🤖 Agente IA está escribiendo</span>
            <div class="typing-dots">
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
                <span class="typing-dot"></span>
            </div>
        `;
        
        this.chatMessages.appendChild(typingDiv);
        this.scrollToBottom();
    }

    private hideTypingIndicator(): void {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    private showActiveTools(tools: string[]): void {
        this.activeToolsDisplay.innerHTML = '';
        
        tools.forEach(toolName => {
            const tool = this.toolSimulator.getTool(toolName);
            if (tool) {
                const activeToolDiv = document.createElement('div');
                activeToolDiv.className = 'active-tool';
                activeToolDiv.innerHTML = `${tool.icon} ${tool.name}`;
                this.activeToolsDisplay.appendChild(activeToolDiv);
            }
        });
    }

    private clearActiveTools(): void {
        this.activeToolsDisplay.innerHTML = '';
        
        // Reset all tools to ready status
        this.toolItems.forEach(item => {
            item.classList.remove('active');
            const statusElement = item.querySelector('.tool-status') as HTMLElement;
            if (statusElement) {
                statusElement.textContent = 'Listo';
                statusElement.classList.remove('active');
            }
        });
    }

    private setToolActive(toolName: string): void {
        this.toolSimulator.setToolStatus(toolName, 'active');
        this.updateToolDisplay(toolName, 'Ejecutando...', 'active');
    }

    private setToolReady(toolName: string): void {
        this.toolSimulator.setToolStatus(toolName, 'ready');
        this.updateToolDisplay(toolName, 'Completado', 'active');
    }

    private setToolError(toolName: string): void {
        this.toolSimulator.setToolStatus(toolName, 'error');
        this.updateToolDisplay(toolName, 'Error', 'error');
    }

    private updateToolDisplay(toolName: string, status: string, className: string): void {
        const toolItem = document.querySelector(`[data-tool="${toolName}"]`) as HTMLElement;
        if (toolItem) {
            toolItem.classList.add('active');
            const statusElement = toolItem.querySelector('.tool-status') as HTMLElement;
            if (statusElement) {
                statusElement.textContent = status;
                statusElement.className = `tool-status ${className}`;
            }
        }
    }

    private updateSendButton(sending: boolean): void {
        this.sendButton.disabled = sending;
        this.sendButton.classList.toggle('sending', sending);
        
        const buttonText = this.sendButton.querySelector('.button-text') as HTMLElement;
        const buttonIcon = this.sendButton.querySelector('.button-icon') as HTMLElement;
        
        if (sending) {
            buttonText.style.display = 'none';
            buttonIcon.textContent = '⏳';
        } else {
            buttonText.style.display = 'inline';
            buttonIcon.textContent = '🚀';
        }
    }

    private updateConnectionStatus(status: 'connecting' | 'connected' | 'disconnected'): void {
        const indicator = this.connectionStatus.querySelector('.status-indicator') as HTMLElement;
        const text = this.connectionStatus.querySelector('.status-text') as HTMLElement;
        
        indicator.className = `status-indicator ${status}`;
        
        switch (status) {
            case 'connecting':
                text.textContent = 'Conectando...';
                break;
            case 'connected':
                text.textContent = 'Conectado';
                break;
            case 'disconnected':
                text.textContent = 'Desconectado';
                break;
        }
    }

    private updateSessionDuration(): void {
        const now = new Date();
        const duration = Math.floor((now.getTime() - this.sessionStartTime.getTime()) / 1000);
        this.metrics.sessionDuration = duration;
    }

    private updateMetricsDisplay(): void {
        this.latencyDisplay.textContent = `${this.metrics.latency} ms`;
        this.toolsCountDisplay.textContent = this.metrics.toolsCount.toString();
        if (this.messageCountDisplay) this.messageCountDisplay.textContent = this.metrics.messageCount.toString();
        if (this.toolsUsedDisplay) this.toolsUsedDisplay.textContent = this.metrics.toolsUsed.toString();
        
        const duration = this.metrics.sessionDuration;
        const minutes = Math.floor(duration / 60);
        const seconds = duration % 60;
        if (this.sessionDurationDisplay) this.sessionDurationDisplay.textContent = `${minutes}m ${seconds}s`;
    }

    private clearChat(): void {
        this.messages = [];
        this.chatMessages.innerHTML = `
            <div class="message system-message">
                <div class="message-header">
                    <strong>🤖 Agente IA</strong>
                    <span class="message-time">Ahora</span>
                </div>
                <div class="message-content">
                    Chat limpiado. ¡Puedes empezar una nueva conversación!<br>
                    ¿En qué puedo ayudarte hoy?
                </div>
            </div>
        `;
        
        this.metrics.messageCount = 0;
        this.metrics.toolsUsed = 0;
        this.sessionStartTime = new Date();
        this.updateMetricsDisplay();
    }

    private scrollToBottom(): void {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    private generateId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
}

// Extensión de la clase principal del chat para manejar pestañas
class ExtendedChatApp extends ChatApp {
    private demoAgent: DemoRealtimeAgent | null = null;

    constructor() {
        super();
        this.setupTabNavigation();
    }

    private setupTabNavigation(): void {
        const tabButtons = document.querySelectorAll('.tab-button');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                
                // Update button states
                tabButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                
                // Update content visibility
                tabContents.forEach(content => {
                    content.classList.remove('active');
                    if (content.id === `${targetTab}-tab`) {
                        content.classList.add('active');
                    }
                });

                // Initialize demo agent when switching to demo tab
                if (targetTab === 'demo_agente' && !this.demoAgent) {
                    this.demoAgent = new DemoRealtimeAgent();
                }
            });
        });
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', (): void => {
    const app = new ExtendedChatApp();
    
    // Hacer la instancia disponible globalmente para debugging
    (window as any).chatApp = app;
    
    console.log('✅ Extended ChatApp with Demo Agent initialized');
});
