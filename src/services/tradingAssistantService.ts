
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
      console.log('Trading Assistant - Request:', { prompt });
      console.log('Trading Assistant - Current Nodes:', JSON.stringify(nodes));
      console.log('Trading Assistant - Current Edges:', JSON.stringify(edges));
      
      // Add user message to conversation history
      this.addMessage('user', prompt);
      
      // Convert conversation history to the format expected by the OpenAI API
      const apiConversationHistory = this.conversationHistory
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }))
        .slice(0, -1); // Exclude the last message as we'll send it with context
      
      console.log('Trading Assistant - Calling edge function with conversation history length:', apiConversationHistory.length);
      
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
      
      console.log('Trading Assistant - Response from edge function:', data);
      
      const assistantResponse = data.response;
      
      // Add assistant response to conversation history
      this.addMessage('assistant', assistantResponse);
      
      // Process any node or edge updates
      if (data.modified) {
        console.log('Algorithm was modified by the assistant');
        console.log('Modified data:', JSON.stringify(data));
        
        if (data.nodes && JSON.stringify(data.nodes) !== JSON.stringify(nodes)) {
          console.log('New nodes different from current nodes, dispatching update event');
          console.log('Original node count:', nodes.length);
          console.log('New node count:', data.nodes.length);
          console.log('Nodes diff:', this.getDiff(nodes, data.nodes));
          
          // Update the nodes in the application
          window.dispatchEvent(new CustomEvent('trading-assistant-update-nodes', { 
            detail: { nodes: data.nodes }
          }));
          
          toast({
            title: 'Algorithm Updated',
            description: 'The trading algorithm has been modified based on your request.',
          });
        } else {
          console.log('Nodes unchanged or identical');
        }
        
        if (data.edges && JSON.stringify(data.edges) !== JSON.stringify(edges)) {
          console.log('New edges different from current edges, dispatching update event');
          console.log('Original edge count:', edges.length);
          console.log('New edge count:', data.edges.length);
          console.log('Edges diff:', this.getDiff(edges, data.edges));
          
          // Update the edges in the application
          window.dispatchEvent(new CustomEvent('trading-assistant-update-edges', {
            detail: { edges: data.edges }
          }));
        } else {
          console.log('Edges unchanged or identical');
        }
      } else {
        console.log('No algorithm modifications from assistant');
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
  
  // Helper method to compare differences between objects
  private static getDiff(original: any[], updated: any[]): string {
    try {
      const addedItems = updated.filter(updatedItem => 
        !original.some(originalItem => originalItem.id === updatedItem.id)
      );
      
      const removedItems = original.filter(originalItem => 
        !updated.some(updatedItem => updatedItem.id === originalItem.id)
      );
      
      const modifiedItems = updated.filter(updatedItem => {
        const originalItem = original.find(item => item.id === updatedItem.id);
        return originalItem && JSON.stringify(originalItem) !== JSON.stringify(updatedItem);
      });
      
      return JSON.stringify({
        added: addedItems.map(item => item.id),
        removed: removedItems.map(item => item.id),
        modified: modifiedItems.map(item => item.id)
      });
    } catch (error) {
      return `Error calculating diff: ${error.message}`;
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
