import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, Request
import os
from fastapi.responses import StreamingResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ToolHive-MCP")

app = FastAPI(title="ToolHive MCP Mock Server")

# Allow requests from all origins (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# KDM pricing data and policies
KDM_PRICES = {
    "KDM Titan Pro": 1199,
    "KDM Titan Air": 899,
    "KDM Neo Fold": 1799,
}

COMPETITOR_MAX_CREDITS = {
    # Apple
    "iPhone 15 Pro": 450,
    "iPhone 16 Pro": 600,
    "iPhone 17 Pro": 800,
    # Samsung
    "Galaxy S20 Ultra": 200,
    "Galaxy S21 Ultra": 300,
    "Galaxy S22 Ultra": 450,
    "Galaxy S23 Ultra": 600,
}

CONDITION_MULTIPLIERS = {
    "Excellent": 1.0,
    "Good": 0.8,
    "Fair": 0.5,
}

@app.get("/", response_class=HTMLResponse)
async def root():
    """
    Serves the beautiful rich interactive GUI control center for ToolHive.
    """
    current_dir = os.path.dirname(os.path.abspath(__file__))
    index_path = os.path.join(current_dir, "index.html")
    try:
        with open(index_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Failed to read index.html: {e}")
        return f"<h3>Error loading ToolHive GUI: {e}</h3>"


# ----------------- MCP SSE ENDPOINTS -----------------

@app.get("/mcp")
async def mcp_sse(request: Request):
    """
    Exposes the SSE stream endpoint. Immediately registers the client by emitting the post url.
    """
    logger.info("Client connected to SSE stream /mcp")
    
    async def sse_generator():
        # 1. Standard MCP legacy and modern endpoint handshake
        # Tells the client where to post the JSON-RPC messages.
        post_endpoint = "http://localhost:5001/mcp/message?session_id=toolhive_session_999"
        yield "event: endpoint\n"
        yield f"data: {post_endpoint}\n\n"
        
        # 2. Keepalive loop to maintain connection
        try:
            while True:
                await asyncio.sleep(15)
                yield ": heartbeat\n\n"
        except asyncio.CancelledError:
            logger.info("SSE connection closed by client")
            
    headers = {
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no"
    }
    return StreamingResponse(sse_generator(), media_type="text/event-stream", headers=headers)


@app.post("/mcp")
async def mcp_post(request: Request):
    """
    Fallback POST handler for standard/legacy MCP clients that POST directly to /mcp
    instead of the negotiated endpoint or if negotiated endpoint is still being resolved.
    """
    logger.info("Received POST request directly on /mcp")
    return await mcp_message(request)


def process_json_rpc(body: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """
    Processes a standard MCP JSON-RPC payload and returns the result.
    """
    req_id = body.get("id")
    method = body.get("method")
    params = body.get("params", {})

    if not method:
        return {"jsonrpc": "2.0", "id": req_id, "error": {"code": -32600, "message": "Invalid Request: method is required"}}

    # Standard JSON-RPC Method routing
    if method == "initialize":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "protocolVersion": "2025-03-26",
                "capabilities": {
                    "tools": {}
                },
                "serverInfo": {
                    "name": "ToolHive Utility Server",
                    "version": "1.0.0"
                }
            }
        }

    elif method == "initialized":
        # Notification; no response needed
        return None

    elif method == "tools/list":
        return {
            "jsonrpc": "2.0",
            "id": req_id,
            "result": {
                "tools": [
                    {
                        "name": "calculate_discount",
                        "description": "Calculates precise trade-in pricing, custom corporate volume discounts, or installment options for premium KDM smartphones.",
                        "inputSchema": {
                          "type": "object",
                          "properties": {
                            "phone_model": {
                              "type": "string",
                              "enum": ["KDM Titan Pro", "KDM Titan Air", "KDM Neo Fold"],
                              "description": "The KDM smartphone model being purchased."
                            },
                            "condition": {
                              "type": "string",
                              "enum": ["Excellent", "Good", "Fair"],
                              "description": "The trade-in condition of the competitor device."
                            },
                            "quantity": {
                              "type": "integer",
                              "minimum": 1,
                              "description": "Number of devices being purchased."
                            },
                            "competitor_phone": {
                              "type": "string",
                              "enum": ["iPhone 15 Pro", "iPhone 16 Pro", "iPhone 17 Pro", "Galaxy S20 Ultra", "Galaxy S21 Ultra", "Galaxy S22 Ultra", "Galaxy S23 Ultra"],
                              "description": "Optional trade-in competitor phone model. Defaults to iPhone 16 Pro if not specified."
                            }
                          },
                          "required": ["phone_model", "condition", "quantity"]
                        }
                    },
                    {
                        "name": "get_stock_status",
                        "description": "Query live boutique showroom inventory levels for premium titanium frames and custom limited color options.",
                        "inputSchema": {
                          "type": "object",
                          "properties": {
                            "color": {
                              "type": "string",
                              "description": "Specific luxury color finish (e.g., Space Gray, Raw Titanium, Obsidian Dark)."
                            }
                          },
                          "required": ["color"]
                        }
                    }
                ]
            }
        }

    elif method == "tools/call":
        tool_name = params.get("name")
        arguments = params.get("arguments", {})

        if tool_name == "calculate_discount":
            return handle_calculate_discount(req_id, arguments)
        elif tool_name == "get_stock_status":
            return handle_get_stock_status(req_id, arguments)
        else:
            return {
                "jsonrpc": "2.0",
                "id": req_id,
                "error": {
                    "code": -32601,
                    "message": f"Method not found: tool {tool_name}"
                }
            }

    # Fallback default response for unknown methods
    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "error": {
            "code": -32601,
            "message": f"Method not found: {method}"
        }
    }


@app.post("/mcp/message")
async def mcp_message(request: Request):
    """
    Receives JSON-RPC POST requests from the MCP Client,
    performs appropriate routing, and directly returns the result.
    """
    try:
        body = await request.json()
        logger.info(f"Received JSON-RPC message: {json.dumps(body)}")
    except Exception as e:
        logger.error(f"Failed to parse request JSON: {e}")
        return {"jsonrpc": "2.0", "error": {"code": -32700, "message": "Parse error"}}

    return process_json_rpc(body)



# ----------------- MCP TOOL IMPLEMENTATIONS -----------------

def handle_calculate_discount(req_id: Any, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Handles the calculation logic based on KDM Phone Shop policies.
    """
    phone_model = args.get("phone_model")
    condition = args.get("condition", "Excellent")
    quantity = args.get("quantity", 1)
    competitor_phone = args.get("competitor_phone", "iPhone 16 Pro")

    # 1. Base price lookup
    unit_price = KDM_PRICES.get(phone_model)
    if not unit_price:
        return make_tool_error(req_id, f"Unknown KDM phone model requested: {phone_model}")

    total_retail = unit_price * quantity

    # 2. Trade-in credit calculation
    max_credit = COMPETITOR_MAX_CREDITS.get(competitor_phone, 600)  # Default to 600 (iPhone 16 Pro)
    multiplier = CONDITION_MULTIPLIERS.get(condition, 1.0)
    trade_in_credit_per_device = int(max_credit * multiplier)
    
    # We cap trade-in quantity by purchase quantity
    total_trade_in_credit = trade_in_credit_per_device * min(quantity, 1) # Assumes single trade-in device

    # 3. Volume / Corporate discount (15% for 3 or more devices)
    corporate_discount = 0.0
    discount_text = "None applied"
    if quantity >= 3:
        corporate_discount = total_retail * 0.15
        discount_text = f"15% Corporate Volume Discount (-${corporate_discount:,.2f})"

    # 4. Net Price Calculation
    final_price = max(0.0, total_retail - total_trade_in_credit - corporate_discount)

    # 5. Format Installment projection (12 months 0% interest)
    monthly_installment = final_price / 12.0

    report = (
        f"=== ToolHive Calculation Report ===\n"
        f"• KDM Phone Model: {phone_model} (${unit_price:,.2f} each)\n"
        f"• Quantity Ordered: {quantity}\n"
        f"• Subtotal Retail Price: ${total_retail:,.2f}\n\n"
        f"• Trade-in competitor phone: {competitor_phone}\n"
        f"• Trade-in physical condition: '{condition}' ({int(multiplier * 100)}% valuation)\n"
        f"• Applied Trade-In Store Credit: -${total_trade_in_credit:,.2f}\n\n"
        f"• Applied volume / corporate discounts: {discount_text}\n"
        f"-----------------------------------\n"
        f"★ Net Purchase Cost: ${final_price:,.2f}\n"
        f"★ Monthly Installment Projection (12-Month 0% APR): ${monthly_installment:,.2f}/month\n"
        f"==================================="
    )

    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "result": {
            "content": [
                {
                    "type": "text",
                    "text": report
                }
            ]
        }
    }


def handle_get_stock_status(req_id: Any, args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulates checking showroom inventory levels for premium colors.
    """
    color = args.get("color", "Raw Titanium")
    
    # Simple deterministic mocking
    color_lower = color.lower()
    if "raw" in color_lower or "titanium" in color_lower:
        status = "In Stock (High Availability)"
        count = 14
        lead_time = "Ready for immediate delivery"
    elif "space" in color_lower or "gray" in color_lower or "black" in color_lower:
        status = "Limited Stock (Restocking Soon)"
        count = 3
        lead_time = "Dispatch within 48 hours"
    elif "gold" in color_lower or "amber" in color_lower:
        status = "Exquisite Limited Color Edition"
        count = 1
        lead_time = "Boutique exclusive allocation"
    else:
        status = "Custom Order Color Option"
        count = 0
        lead_time = "Special fabrication lead-time: 5-7 business days"

    report = (
        f"=== Showroom Stock Inventory Check ===\n"
        f"• Color / Finish: {color}\n"
        f"• Status: {status}\n"
        f"• Available showroom unit count: {count} devices\n"
        f"• Delivery details: {lead_time}\n"
        f"====================================="
    )

    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "result": {
            "content": [
                {
                    "type": "text",
                    "text": report
                }
            ]
        }
    }


def make_tool_error(req_id: Any, message: str) -> Dict[str, Any]:
    return {
        "jsonrpc": "2.0",
        "id": req_id,
        "result": {
            "isError": True,
            "content": [
                {
                    "type": "text",
                    "text": f"Error during tool invocation: {message}"
                }
            ]
        }
    }

if __name__ == "__main__":
    import sys
    # Check if we should run in stdio mode (e.g., for the official Stacklok ToolHive UI, Cursor, Claude Code, etc.)
    if "--stdio" in sys.argv:
        # Standard input/output loop
        sys.stderr.write("ToolHive MCP Mock Server [STDIO Mode] active...\n")
        sys.stderr.flush()
        while True:
            try:
                line = sys.stdin.readline()
                if not line:
                    break
                if not line.strip():
                    continue
                body = json.loads(line.strip())
                response = process_json_rpc(body)
                if response is not None:
                    sys.stdout.write(json.dumps(response) + "\n")
                    sys.stdout.flush()
            except Exception as e:
                sys.stderr.write(f"Error in stdio loop: {e}\n")
                sys.stderr.flush()
    else:
        logger.info("Starting ToolHive MCP Mock Server on port 5001...")
        uvicorn.run(app, host="0.0.0.0", port=5001)

