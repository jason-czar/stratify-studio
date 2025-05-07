
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

When responding, focus on actionable changes to the algorithm, explaining your reasoning clearly.
Provide your responses in a structured format that's easy for the user to follow.
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

    return new Response(
      JSON.stringify({ 
        response: assistantResponse,
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
