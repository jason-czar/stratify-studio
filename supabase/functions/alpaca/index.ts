
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALPACA_API_KEY = Deno.env.get("ALPACA_KEY");
const ALPACA_API_SECRET = Deno.env.get("ALPACA_SECRET");
const ALPACA_API_URL = "https://paper-api.alpaca.markets/v2";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request URL and path
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();
    
    if (!path) {
      return new Response(
        JSON.stringify({ error: "Invalid endpoint" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Handle different operations based on the path
    switch (path) {
      case "account":
        return await getAccount(req);
      case "positions":
        return await getPositions(req);
      case "orders":
        return await getOrders(req);
      case "place-order":
        return await placeOrder(req);
      default:
        return new Response(
          JSON.stringify({ error: "Invalid endpoint" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
        );
    }
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});

/**
 * Get the Alpaca account information
 */
async function getAccount(req: Request) {
  try {
    const response = await fetch(`${ALPACA_API_URL}/account`, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET!
      }
    });
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
    );
  } catch (error) {
    console.error("Error fetching account:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

/**
 * Get all open positions
 */
async function getPositions(req: Request) {
  try {
    const response = await fetch(`${ALPACA_API_URL}/positions`, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET!
      }
    });
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
    );
  } catch (error) {
    console.error("Error fetching positions:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

/**
 * Get all orders
 */
async function getOrders(req: Request) {
  try {
    // Updated: Get status from body instead of query parameters
    let status = '';
    
    // Parse request body if it exists
    try {
      if (req.body) {
        const body = await req.json();
        status = body?.status || '';
      }
    } catch (e) {
      // If parsing body fails, proceed with no status filter
      console.log("No body provided or failed to parse");
    }
    
    const endpoint = status ? 
      `${ALPACA_API_URL}/orders?status=${status}` : 
      `${ALPACA_API_URL}/orders`;
      
    const response = await fetch(endpoint, {
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET!
      }
    });
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}

/**
 * Place a new order
 */
async function placeOrder(req: Request) {
  try {
    // Only allow POST for placing orders
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Method not allowed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 405 }
      );
    }
    
    // Parse the order parameters from the request body
    const orderParams = await req.json();
    
    const response = await fetch(`${ALPACA_API_URL}/orders`, {
      method: "POST",
      headers: {
        "APCA-API-KEY-ID": ALPACA_API_KEY!,
        "APCA-API-SECRET-KEY": ALPACA_API_SECRET!,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(orderParams)
    });
    
    const data = await response.json();
    
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: response.status }
    );
  } catch (error) {
    console.error("Error placing order:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
}
