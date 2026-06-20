import { useState, useRef, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    { role: 'concierge', text: 'Welcome to the Elite Academic & Career Concierge Terminal! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    // Placeholder for new message from concierge
    setMessages(prev => [...prev, { role: 'concierge', text: '' }]);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        
        // Parse SSE chunks: "data: {"text": "..."}\n\n"
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6);
            if (dataStr.trim()) {
              try {
                const parsed = JSON.parse(dataStr);
                if (parsed.text) {
                  setMessages(prev => {
                    const newMessages = [...prev];
                    const lastMsgIndex = newMessages.length - 1;
                    newMessages[lastMsgIndex] = {
                      ...newMessages[lastMsgIndex],
                      text: newMessages[lastMsgIndex].text + parsed.text
                    };
                    return newMessages;
                  });
                } else if (parsed.error) {
                    setMessages(prev => {
                      const newMessages = [...prev];
                      const lastMsgIndex = newMessages.length - 1;
                      newMessages[lastMsgIndex] = {
                        ...newMessages[lastMsgIndex],
                        text: newMessages[lastMsgIndex].text + `\n[Error: ${parsed.error}]`
                      };
                      return newMessages;
                    });
                }
              } catch (e) {
                console.error("Error parsing JSON chunk", e, dataStr);
              }
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching chat:', error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMsgIndex = newMessages.length - 1;
        newMessages[lastMsgIndex] = {
          ...newMessages[lastMsgIndex],
          text: newMessages[lastMsgIndex].text + "\n[Connection Error: Could not reach the backend.]"
        };
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-sans">
      {/* Header */}
      <header className="bg-surface border-b border-gray-800 p-4 shadow-md flex items-center justify-between z-10">
        <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          Academic Concierge
        </h1>
        <div className="text-sm text-textMuted flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          Online
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] md:max-w-[70%] rounded-2xl p-4 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-tr-sm' 
                  : 'bg-surface border border-gray-700/50 text-textMain rounded-tl-sm'
              }`}
            >
              <div className="text-sm font-semibold mb-1 opacity-70">
                {msg.role === 'user' ? 'You' : 'Concierge'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                {msg.text || (isLoading && idx === messages.length - 1 ? (
                  <span className="flex gap-1 items-center h-5">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></span>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></span>
                  </span>
                ) : '')}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      {/* Input Area */}
      <footer className="p-4 bg-background border-t border-gray-800">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            placeholder={isLoading ? "Concierge is typing..." : "Type your message..."}
            className="w-full bg-surface border border-gray-700 rounded-full py-4 pl-6 pr-16 text-textMain focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all placeholder-gray-500 shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-2 bottom-2 aspect-square bg-primary hover:bg-secondary text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:hover:bg-primary shadow-md"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <path d="M3.478 2.404a.75.75 0 00-.926.941l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.404z" />
            </svg>
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
