
import { supabase } from "@/integrations/supabase/client";
import { Node, Edge } from "reactflow";
import { NodeData } from "@/types/nodes";
import { Json } from "@/integrations/supabase/types";

export interface Algorithm {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  nodes: Node<NodeData>[];
  edges: Edge[];
  is_active: boolean | null;
  created_at: string;
  updated_at: string;
}

export interface AlgorithmPerformance {
  id: string;
  algorithm_id: string;
  date: string;
  profit_loss: number | null;
  trades_count: number | null;
  win_rate: number | null;
  metrics: Record<string, any> | null;
  created_at: string;
}

// Helper function to convert database types to our interface types
const convertDbToAlgorithm = (data: any): Algorithm => {
  return {
    ...data,
    nodes: Array.isArray(data.nodes) ? data.nodes : JSON.parse(data.nodes as string),
    edges: Array.isArray(data.edges) ? data.edges : JSON.parse(data.edges as string),
  };
};

// Helper function to convert database types to performance interface
const convertDbToPerformance = (data: any): AlgorithmPerformance => {
  return {
    ...data,
    metrics: data.metrics ? (typeof data.metrics === 'string' ? JSON.parse(data.metrics) : data.metrics) : null,
  };
};

export const AlgorithmService = {
  /**
   * Save an algorithm
   */
  async saveAlgorithm(
    name: string, 
    nodes: Node<NodeData>[], 
    edges: Edge[], 
    description?: string
  ): Promise<Algorithm> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("User not authenticated");
      }

      // Convert nodes and edges to JSON string if needed
      const { data, error } = await supabase
        .from('algorithms')
        .insert({
          user_id: user.user.id,
          name,
          description,
          nodes: nodes as unknown as Json,
          edges: edges as unknown as Json,
        })
        .select()
        .single();
      
      if (error) throw error;
      return convertDbToAlgorithm(data);
    } catch (error) {
      console.error('Error saving algorithm:', error);
      throw error;
    }
  },

  /**
   * Get all algorithms for the current user
   */
  async getUserAlgorithms(): Promise<Algorithm[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("User not authenticated");
      }

      const { data, error } = await supabase
        .from('algorithms')
        .select('*')
        .eq('user_id', user.user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(convertDbToAlgorithm);
    } catch (error) {
      console.error('Error getting user algorithms:', error);
      return [];
    }
  },

  /**
   * Get a specific algorithm by ID
   */
  async getAlgorithm(id: string): Promise<Algorithm | null> {
    try {
      const { data, error } = await supabase
        .from('algorithms')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data ? convertDbToAlgorithm(data) : null;
    } catch (error) {
      console.error('Error getting algorithm:', error);
      return null;
    }
  },

  /**
   * Update an existing algorithm
   */
  async updateAlgorithm(
    id: string,
    updates: Partial<Omit<Algorithm, 'id' | 'user_id' | 'created_at'>>
  ): Promise<Algorithm | null> {
    try {
      // Convert any nodes and edges to the format expected by the database
      const dbUpdates: any = {
        ...updates,
        updated_at: new Date().toISOString(),
      };
      
      // Only convert if present
      if (updates.nodes) {
        dbUpdates.nodes = updates.nodes as unknown as Json;
      }
      
      if (updates.edges) {
        dbUpdates.edges = updates.edges as unknown as Json;
      }

      const { data, error } = await supabase
        .from('algorithms')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data ? convertDbToAlgorithm(data) : null;
    } catch (error) {
      console.error('Error updating algorithm:', error);
      return null;
    }
  },

  /**
   * Delete an algorithm
   */
  async deleteAlgorithm(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('algorithms')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting algorithm:', error);
      return false;
    }
  },

  /**
   * Toggle algorithm active status
   */
  async toggleAlgorithmActive(id: string, isActive: boolean): Promise<Algorithm | null> {
    try {
      const { data, error } = await supabase
        .from('algorithms')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data ? convertDbToAlgorithm(data) : null;
    } catch (error) {
      console.error('Error toggling algorithm active status:', error);
      return null;
    }
  },

  /**
   * Get performance metrics for an algorithm
   */
  async getAlgorithmPerformance(algorithmId: string): Promise<AlgorithmPerformance[]> {
    try {
      const { data, error } = await supabase
        .from('algorithm_performance')
        .select('*')
        .eq('algorithm_id', algorithmId)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(convertDbToPerformance);
    } catch (error) {
      console.error('Error getting algorithm performance:', error);
      return [];
    }
  },

  /**
   * Add performance metrics for an algorithm
   */
  async addPerformanceMetric(
    algorithmId: string, 
    profitLoss: number, 
    tradesCount: number, 
    winRate: number,
    metrics?: Record<string, any>
  ): Promise<AlgorithmPerformance | null> {
    try {
      const { data, error } = await supabase
        .from('algorithm_performance')
        .insert({
          algorithm_id: algorithmId,
          profit_loss: profitLoss,
          trades_count: tradesCount,
          win_rate: winRate,
          metrics: metrics as unknown as Json,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data ? convertDbToPerformance(data) : null;
    } catch (error) {
      console.error('Error adding performance metric:', error);
      return null;
    }
  }
};
