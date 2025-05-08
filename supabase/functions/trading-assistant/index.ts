
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define types directly in the file instead of importing from reactflow
interface NodeData {
  label?: string;
  description?: string;
  [key: string]: any;
}

interface Node {
  id: string;
  type?: string;
  position: {
    x: number;
    y: number;
  };
  data: NodeData;
  [key: string]: any;
}

interface Edge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  [key: string]: any;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Define the system message for the GPT model
const SYSTEM_MESSAGE = `
You are an AI assistant specialized in creating and modifying trading algorithms. 
You help users build algorithmic trading strategies using a visual interface.

The user's algorithm is represented as a flow of nodes that can include:
- Start nodes: Entry points of the algorithm
- Stock Selection nodes: For selecting assets to trade
- Condition nodes: For defining trading conditions and logic
- Order Execution nodes: For defining how to execute trades

You can:
1. Suggest modifications to the user's current algorithm
2. Create new algorithm components based on user's descriptions
3. Optimize existing trading strategies
4. Explain how different parts of the algorithm work
5. Make modifications to the algorithm when requested by the user

When requested to modify the algorithm, you should:
- Analyze the current nodes and edges configuration
- Make appropriate changes based on the user's request
- Return both a textual explanation and the modified nodes/edges

When modifying the algorithm:
- Preserve node IDs when updating existing nodes
- Generate unique IDs for new nodes (e.g., "stock-2", "condition-3")
- Ensure all connections (edges) are properly maintained and updated
- Position new nodes in a logical flow with appropriate spacing

Keep your textual responses clear and focused on the changes made.
`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt, nodes, edges, conversationHistory } = await req.json();

    // Process nodes and edges to create a context for the AI
    const nodeTypes = new Set(nodes.map((node: Node) => node.type));
    const nodeCount = nodes.length;
    const edgeCount = edges.length;
    
    // Create a description of the current algorithm state
    let algorithmDescription = `Current algorithm has ${nodeCount} nodes (${Array.from(nodeTypes).join(', ')}) and ${edgeCount} connections.\n\n`;
    
    // Add details about each node
    nodes.forEach((node: Node, index: number) => {
      algorithmDescription += `Node ${index + 1}: ${node.type} - ${JSON.stringify(node.data, null, 2)}\n`;
    });

    // Create the message history
    const messages = [
      { role: "system", content: SYSTEM_MESSAGE },
      ...conversationHistory,
      { 
        role: "user", 
        content: `Current algorithm state:\n${algorithmDescription}\n\nUser request: ${prompt}` 
      }
    ];

    // Call OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',  // Using gpt-4o as the latest available model in the OpenAI API
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API Error: ${data.error.message}`);
    }
    
    const assistantResponse = data.choices[0].message.content;
    
    // Analyze the response to see if we need to update the algorithm
    // This second call is specifically for extracting structured modifications
    const analysisMessages = [
      { 
        role: "system", 
        content: `
        You are an AI designed to analyze and extract structured modifications for a trading algorithm.
        A user has requested modifications to their algorithm, and another AI has provided a response.
        
        Your job is to:
        1. Analyze the response to identify what changes need to be made to the algorithm
        2. Return a JSON object containing:
          - A list of nodes to be added, modified, or deleted
          - A list of edges to be added, modified, or deleted
          
        If no changes are needed, return the original nodes and edges unchanged.
        `
      },
      { 
        role: "user", 
        content: `
        Original algorithm:
        ${JSON.stringify({ nodes, edges }, null, 2)}
        
        User request: ${prompt}
        
        Assistant response: ${assistantResponse}
        
        Please analyze this and provide:
        1. Modified nodes array (if changes needed)
        2. Modified edges array (if changes needed)
        Return the original structure if no changes are needed.
        `
      }
    ];

    const analysisResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: analysisMessages,
        temperature: 0.2,  // Lower temperature for more deterministic output
        max_tokens: 2000,
        response_format: { type: "json_object" }
      }),
    });

    const analysisData = await analysisResponse.json();
    
    if (analysisData.error) {
      throw new Error(`OpenAI API Analysis Error: ${analysisData.error.message}`);
    }
    
    const analysisContent = JSON.parse(analysisData.choices[0].message.content);
    
    // Use the analyzed modifications or the original if no changes
    const updatedNodes = analysisContent.nodes || nodes;
    const updatedEdges = analysisContent.edges || edges;

    // Compare to see if changes were actually made
    const nodesChanged = JSON.stringify(nodes) !== JSON.stringify(updatedNodes);
    const edgesChanged = JSON.stringify(edges) !== JSON.stringify(updatedEdges);

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
        nodes: updatedNodes,
        edges: updatedEdges,
        modified: nodesChanged || edgesChanged
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
