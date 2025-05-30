
import React, { useState, useRef, useEffect } from 'react';
import { Node, Edge } from 'reactflow';
import { TradingAssistantService, Message } from '@/services/tradingAssistantService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { NodeData } from '@/types/nodes';
import { Bot, Send, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from '@/hooks/use-toast';

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
  const [isCollapsed, setIsCollapsed] = useState(false);
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
    
    console.log('TradingAssistantChat - Sending message:', message);
    console.log('TradingAssistantChat - Current nodes count:', nodes.length);
    console.log('TradingAssistantChat - Current edges count:', edges.length);
    
    setIsLoading(true);
    
    try {
      // Update local messages state immediately for UI responsiveness
      const userMessage = { role: 'user' as const, content: message };
      setMessages(prev => [...prev, userMessage]);
      
      // Clear the input field
      setMessage('');
      
      console.log('TradingAssistantChat - Calling getAssistantResponse');
      // Get response from assistant and any node/edge updates
      const response = await TradingAssistantService.getAssistantResponse(message, nodes, edges);
      console.log('TradingAssistantChat - Got response:', response.substring(0, 100) + '...');
      
      // Update messages with assistant response
      setMessages(TradingAssistantService.getConversationHistory());
      
      // Log nodes and edges to see if they've changed
      console.log('TradingAssistantChat - Nodes after response:', nodes.length);
      console.log('TradingAssistantChat - Edges after response:', edges.length);
      
    } catch (error) {
      console.error('TradingAssistantChat - Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to process your request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearChat = () => {
    TradingAssistantService.clearConversationHistory();
    setMessages([]);
    console.log('TradingAssistantChat - Conversation history cleared');
  };

  return (
    <div className={`fixed left-0 top-0 h-full z-40 flex ${isCollapsed ? 'w-12' : 'w-80'} transition-all duration-300 ease-in-out`}>
      {/* Main chat panel */}
      <div className={`bg-background border-r border-border h-full flex flex-col ${isCollapsed ? 'w-0 overflow-hidden' : 'w-full'}`}>
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
      
      {/* Toggle button */}
      <Button 
        variant="secondary" 
        size="icon" 
        className="h-12 w-12 rounded-none border-r border-t border-b border-border"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </Button>
    </div>
  );
}
