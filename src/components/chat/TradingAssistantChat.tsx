import React, { useState, useRef, useEffect } from 'react';
import { useNodesState, useEdgesState, Node, Edge } from 'reactflow';
import { TradingAssistantService, Message } from '@/services/tradingAssistantService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { NodeData } from '@/types/nodes';
import { Bot, Send, User, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface TradingAssistantChatProps {
  nodes: Node<NodeData>[];
  edges: Edge[];
  onUpdateNodes?: (nodes: Node<NodeData>[]) => void;
  onUpdateEdges?: (edges: Edge[]) => void;
}

export function TradingAssistantChat({
  nodes,
  edges,
  onUpdateNodes,
  onUpdateEdges
}: TradingAssistantChatProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>(TradingAssistantService.getConversationHistory());
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages when messages change
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Keep messages in sync with the service's conversation history
  useEffect(() => {
    setMessages(TradingAssistantService.getConversationHistory());
  }, []);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    setIsLoading(true);
    
    try {
      // Update local messages state immediately for UI responsiveness
      const userMessage = { role: 'user' as const, content: message };
      setMessages(prev => [...prev, userMessage]);
      
      // Clear the input field
      setMessage('');
      
      // Get response from assistant
      const response = await TradingAssistantService.getAssistantResponse(message, nodes, edges);
      
      // Update messages with assistant response
      setMessages(TradingAssistantService.getConversationHistory());
      
      // Here we would parse the response and update the nodes/edges if needed
      // For now, this is left as a placeholder for future implementation
      // updateAlgorithmFromResponse(response);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = () => {
    TradingAssistantService.clearConversationHistory();
    setMessages([]);
  };

  return (
    <div className={`fixed right-6 bottom-6 z-50 ${isOpen ? 'w-96' : 'w-auto'}`}>
      {/* Chat toggle button */}
      <Button 
        className="rounded-full h-14 w-14 shadow-lg" 
        onClick={() => setIsOpen(prev => !prev)}
      >
        {isOpen ? <X size={20} /> : <Bot size={20} />}
      </Button>
      
      {/* Chat panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-full bg-background border rounded-lg shadow-xl flex flex-col h-[500px] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-3 border-b">
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <Bot className="h-4 w-4 text-primary" />
              </Avatar>
              <div>
                <h3 className="text-sm font-medium">Trading Assistant</h3>
                <p className="text-xs text-muted-foreground">Powered by GPT</p>
              </div>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearChat}
              className="h-8 px-2 text-xs"
            >
              Clear Chat
            </Button>
          </div>
          
          {/* Message area */}
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                <p>Ask me anything about building or modifying your trading algorithm.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, i) => (
                  <div 
                    key={i} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'bg-primary/10 text-primary-foreground' : 'bg-muted'} rounded-lg p-3`}>
                      <div className="flex items-center space-x-2 mb-1">
                        {msg.role === 'assistant' ? (
                          <Bot className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                        <span className="text-xs font-medium">
                          {msg.role === 'assistant' ? 'Assistant' : 'You'}
                        </span>
                      </div>
                      <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                <div ref={messageEndRef} />
              </div>
            )}
          </ScrollArea>
          
          {/* Input area */}
          <form onSubmit={handleSendMessage} className="border-t p-3 flex items-center">
            <Input
              className="flex-1"
              placeholder="Ask about your trading algorithm..."
              value={message}
              onChange={e => setMessage(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              type="submit" 
              size="icon" 
              className="ml-2" 
              disabled={isLoading || !message.trim()}
            >
              <Send size={16} />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
}
