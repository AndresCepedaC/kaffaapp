import { useState, useRef, useCallback, memo } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

const FAQ_ANSWERS = {
  envio: {
    question: '¿Hacen domicilios?',
    answer: 'Sí, realizamos envíos dentro de la zona. El tiempo estimado es de 20-40 minutos dependiendo de la ubicación. ¡Consulta disponibilidad!',
  },
  horario: {
    question: '¿Cuál es el horario?',
    answer: 'Nuestro horario es de Lunes a Sábado de 8:00 AM a 10:00 PM, y Domingos de 9:00 AM a 8:00 PM.',
  },
  pago: {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos efectivo, tarjetas débito/crédito, Nequi y Daviplata. ¡Elige el que prefieras!',
  },
  pedido: {
    question: '¿Cómo hago un pedido?',
    answer: 'Navega nuestro menú, agrega productos al carrito y presiona "Confirmar". Tu pedido se enviará directamente a nuestro WhatsApp para confirmación.',
  },
  alergias: {
    question: '¿Tienen opciones sin gluten o veganas?',
    answer: 'Tenemos opciones para diferentes dietas. Consulta directamente con nosotros sobre ingredientes específicos para alergias o restricciones alimentarias.',
  },
  reservas: {
    question: '¿Puedo reservar mesa?',
    answer: 'Sí, puedes reservar mesa contactándonos directamente por WhatsApp. Te recomendamos reservar con al menos 2 horas de anticipación.',
  }
};

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: 'bot',
      text: '¡Hola! 👋 Soy el asistente de Kaffa La Aldea. ¿En qué puedo ayudarte? Selecciona una pregunta frecuente o escríbeme.',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }, []);

  const handleFAQ = useCallback((key) => {
    const faq = FAQ_ANSWERS[key];
    setMessages(prev => [
      ...prev,
      { from: 'user', text: faq.question },
      { from: 'bot', text: faq.answer },
    ]);
    scrollToBottom();
  }, [scrollToBottom]);

  const handleSend = useCallback(() => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');

    // Simple keyword matching
    const lowerMsg = userMsg.toLowerCase();
    let botReply = 'Gracias por tu mensaje. Para una atención más personalizada, te invitamos a contactarnos directamente por WhatsApp. ¡Estamos para servirte! ☕';

    if (lowerMsg.includes('envío') || lowerMsg.includes('domicilio') || lowerMsg.includes('envio')) {
      botReply = FAQ_ANSWERS.envio.answer;
    } else if (lowerMsg.includes('horario') || lowerMsg.includes('hora') || lowerMsg.includes('abren')) {
      botReply = FAQ_ANSWERS.horario.answer;
    } else if (lowerMsg.includes('pago') || lowerMsg.includes('nequi') || lowerMsg.includes('tarjeta')) {
      botReply = FAQ_ANSWERS.pago.answer;
    } else if (lowerMsg.includes('pedido') || lowerMsg.includes('ordenar') || lowerMsg.includes('pedir')) {
      botReply = FAQ_ANSWERS.pedido.answer;
    } else if (lowerMsg.includes('vegano') || lowerMsg.includes('gluten') || lowerMsg.includes('alergia')) {
      botReply = FAQ_ANSWERS.alergias.answer;
    } else if (lowerMsg.includes('reserva') || lowerMsg.includes('mesa')) {
      botReply = FAQ_ANSWERS.reservas.answer;
    }

    setMessages(prev => [
      ...prev,
      { from: 'user', text: userMsg },
      { from: 'bot', text: botReply },
    ]);
    scrollToBottom();
  }, [input, scrollToBottom]);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        id="chatbot-toggle"
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl transition-all duration-300 ${
          isOpen
            ? 'bg-[#3a3024] rotate-0'
            : 'bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] hover:shadow-[#8b5e35]/40 pulse-glow'
        }`}
        style={{ boxShadow: isOpen ? 'none' : '0 8px 32px rgba(139,94,53,0.4)' }}
        aria-label="Abrir chat de asistencia"
      >
        {isOpen ? (
          <X className="w-6 h-6 text-[#c9a96e]" />
        ) : (
          <MessageCircle className="w-6 h-6 text-[#0f0c08]" />
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[340px] max-h-[500px] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(180deg, #1a1610 0%, #0f0c08 100%)',
            border: '1px solid rgba(201,169,110,0.2)',
            boxShadow: '0 16px 48px rgba(0,0,0,0.5), 0 0 30px rgba(201,169,110,0.05)',
          }}
        >
          {/* Chat Header */}
          <div
            className="p-4 flex items-center gap-3"
            style={{ background: 'linear-gradient(135deg, #1e1a14 0%, #171310 100%)', borderBottom: '1px solid rgba(201,169,110,0.1)' }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a96e] to-[#8b5e35] flex items-center justify-center shadow-md shadow-[#8b5e35]/30">
              <span className="text-sm">☕</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#f0e6d2] hero-title">Asistente Kaffa</h3>
              <p className="text-[10px] text-[#7a6e5d]">Responde al instante</p>
            </div>
            <div className="ml-auto w-2 h-2 rounded-full bg-[#4d8b5d] animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-hide" style={{ maxHeight: '300px' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-2.5 rounded-xl text-xs leading-relaxed ${
                    msg.from === 'user'
                      ? 'bg-gradient-to-r from-[#6b4d2d] to-[#8b5e35] text-[#f0e6d2] rounded-br-sm'
                      : 'bg-[#1e1a14] text-[#d4c4a8] border border-[#3a3024]/30 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* FAQ Quick Buttons */}
          <div className="px-3 py-2 border-t border-[#3a3024]/15 overflow-x-auto scrollbar-hide">
            <div className="flex gap-1.5 flex-wrap">
              {Object.entries(FAQ_ANSWERS).map(([key, faq]) => (
                <button
                  key={key}
                  onClick={() => handleFAQ(key)}
                  className="px-2.5 py-1 rounded-lg bg-[#1e1a14] border border-[#3a3024]/30 text-[#c9a96e]/70 text-[10px] font-medium hover:border-[#c9a96e]/40 hover:text-[#e8c87a] transition-all whitespace-nowrap"
                >
                  {faq.question}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-3 border-t border-[#3a3024]/15 flex gap-2" style={{ background: '#151110' }}>
            <input
              id="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe tu pregunta..."
              className="flex-1 bg-[#1e1a14] border border-[#3a3024]/30 rounded-xl px-3 py-2 text-xs text-[#f0e6d2] placeholder-[#5a4835] focus:outline-none focus:border-[#c9a96e]/30 transition-all body-font"
            />
            <button
              onClick={handleSend}
              className="p-2 rounded-xl bg-gradient-to-r from-[#c9a96e] to-[#8b5e35] text-[#0f0c08] hover:shadow-lg hover:shadow-[#8b5e35]/20 transition-all active:scale-95"
              aria-label="Enviar mensaje"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(Chatbot);
