import { supabase } from '@/integrations/supabase/client';
import type { Node, Edge } from 'reactflow';
import { NodeData } from '@/types/nodes';
import { toast } from '@/hooks/use-toast';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export class TradingAssistantService {
  private static conversationHistory: Message[] = [];

  static async getAssistantResponse(
    prompt: string,
    nodes: Node<NodeData>[],
    edges: Edge[]
  ): Promise<string> {
    try {
      // Add user message to conversation history
      this.addMessage('user', prompt);
      
      // Convert conversation history to the format expected by the OpenAI API
      const apiConversationHistory = this.conversationHistory
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        .slice(0, -1); // Exclude the last message as we'll send it with context
      
      const { data, error } = await supabase.functions.invoke('trading-assistant', {
        body: {
          prompt,
          nodes,
          edges,
          conversationHistory: apiConversationHistory
        }
      });
      
      if (error) {
        console.error('Error calling trading assistant:', error);
        toast({
          title: 'Error',
          description: 'Failed to get response from the trading assistant.',
          variant: 'destructive',
        });
        return 'Sorry, I encountered an error processing your request.';
      }
      
      const assistantResponse = data.response;
      
      // Add assistant response to conversation history
      this.addMessage('assistant', assistantResponse);
      
      // Process any node or edge updates
      if (data.modified) {
        console.log('Algorithm was modified by the assistant');
        
        if (data.nodes && JSON.stringify(data.nodes) !== JSON.stringify(nodes)) {
          // Update the nodes in the application
          window.dispatchEvent(new CustomEvent('trading-assistant-update-nodes', { 
            detail: { nodes: data.nodes }
          }));
          
          toast({
            title: 'Algorithm Updated',
            description: 'The trading algorithm has been modified based on your request.',
          });
        }
        
        if (data.edges && JSON.stringify(data.edges) !== JSON.stringify(edges)) {
          // Update the edges in the application
          window.dispatchEvent(new CustomEvent('trading-assistant-update-edges', {
            detail: { edges: data.edges }
          }));
        }
      }
      
      return assistantResponse;
    } catch (error) {
      console.error('Error in trading assistant service:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred.',
        variant: 'destructive',
      });
      return 'Sorry, an unexpected error occurred.';
    }
  }
  
  static addMessage(role: 'user' | 'assistant', content: string): void {
    this.conversationHistory.push({ role, content });
    
    // Keep conversation history to a reasonable size
    if (this.conversationHistory.length > 20) {
      this.conversationHistory = this.conversationHistory.slice(-20);
    }
  }
  
  static getConversationHistory(): Message[] {
    return [...this.conversationHistory];
  }
  
  static clearConversationHistory(): void {
    this.conversationHistory = [];
  }
}
