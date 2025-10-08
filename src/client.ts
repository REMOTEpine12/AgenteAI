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
    private serverStatus: HTMLElement | null;
    private messageInput: HTMLInputElement | null;
    private sendButton: HTMLButtonElement | null;
    private chatMessages: HTMLElement | null;
    private isServerOnline: boolean = false;
    private messages: Message[] = [];

    constructor() {
        this.serverStatus = document.getElementById('server-status');
        this.messageInput = document.getElementById('message-input') as HTMLInputElement;
        this.sendButton = document.getElementById('send-button') as HTMLButtonElement;
        this.chatMessages = document.getElementById('chat-messages');
        
        this.init();
    }

    private init(): void {
        this.checkServerStatus();
        this.setupEventListeners();
        
        // Verificar estado del servidor cada 30 segundos
        setInterval(() => this.checkServerStatus(), 30000);
    }

    private setupEventListeners(): void {
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

    private async checkServerStatus(): Promise<void> {
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

    private updateServerStatusUI(isOnline: boolean, timestamp?: string, error?: Error): void {
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

    private async sendMessage(): Promise<void> {
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

    private addMessage(sender: string, text: string, className: string): string {
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

    private removeMessage(messageId: string): void {
        const messageElement = document.getElementById(`message-${messageId}`);
        if (messageElement) {
            messageElement.remove();
        }
        
        // Remover del historial
        this.messages = this.messages.filter(msg => msg.id !== messageId);
    }

    private formatTime(date: Date): string {
        return date.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    private addVisualFeedback(element: HTMLElement): void {
        element.style.transform = 'scale(0.95)';
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 150);
    }

    private escapeHtml(text: string): string {
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

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', (): void => {
    const app = new ChatApp();
    
    // Hacer la instancia disponible globalmente para debugging
    (window as any).chatApp = app;
    
    console.log('✅ ChatApp inicializada correctamente');
});
