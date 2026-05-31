# ⚡ ToolHive MCP Mock Server & Configuration Suite

Welcome to the **ToolHive Configuration Suite**! This directory provides everything you need to run, configure, and thoroughly test the Model Context Protocol (MCP) integrations with your KDM Phone Shop Guardrail Sandbox.

---

## 🚀 Quick Start Guide

### Step 1: Run the Server
Simply execute the provided run script in your terminal to fire up the FastAPI-powered high-performance math and inventory engine:

```bash
./run.sh
```

The server will automatically boot on port **`5001`**:
* **Home Status Endpoint**: `http://localhost:5001/`
* **SSE Stream Handshake**: `http://localhost:5001/mcp`
* **Direct JSON-RPC Message Target**: `http://localhost:5001/mcp/message`

---

## 🛠️ Exposed MCP Tools & Capabilities

This server fully implements the standard **Model Context Protocol (MCP)** specification over Server-Sent Events (SSE). It exposes two high-performance tools:

### 1. `calculate_discount`
Calculates precise cost projections, applies trade-in credits for competitor devices based on physical condition, and applies corporate bulk purchase discounts.
* **Input Schema**:
  - `phone_model` (*string, enum*): `"KDM Titan Pro"`, `"KDM Titan Air"`, `"KDM Neo Fold"`
  - `condition` (*string, enum*): `"Excellent"`, `"Good"`, `"Fair"`
  - `quantity` (*integer*): `minimum: 1`
  - `competitor_phone` (*string, optional*): Defaults to `"iPhone 16 Pro"`
* **Business Math Rules Applied**:
  - **Flagship Unit Prices**:
    - *KDM Titan Pro*: `$1,199.00`
    - *KDM Titan Air*: `$899.00`
    - *KDM Neo Fold*: `$1,799.00`
  - **Trade-In Credit Coefficients**:
    - *Excellent*: 100% of Max MSRP Store Credit (e.g., iPhone 17 Pro max credit is `$800.00`)
    - *Good*: 80% of Max MSRP Store Credit (e.g., iPhone 16 Pro credit becomes `$480.00`)
    - *Fair*: 50% of Max MSRP Store Credit
  - **Corporate Volume Pricing**:
    - 15% discount on the entire subtotal if `quantity >= 3` devices.
  - **Installment Calculation**:
    - Automatically projects interest-free 12-month installment payment pricing.

### 2. `get_stock_status`
Queries live boutique showroom stock and provides material shipping lead times.
* **Input Schema**:
  - `color` (*string*): Luxury color finish choice (e.g., `"Raw Titanium"`, `"Space Gray"`)

---

## 🧪 Verifying Sandbox Playbooks

Once the server is running on **port 5001**, navigate to your Guardrail Admin Console dashboard to test these real-time scenarios in the **Chat Sandbox**:

1. **iPhone Trade-In Calculation**:
   - *Prompt*: "I want to buy 1 KDM Titan Pro and trade in my iPhone 16 Pro in Good condition. How much will it cost?"
   - *Outcome*: The LLM automatically translates this into calling `calculate_discount`, receives the precise calculations from this mock server, and responds with step-by-step cost reports.

2. **Bulk Corporate Purchase Discount**:
   - *Prompt*: "Our firm wants to purchase 5 KDM Neo Fold devices. What's our total corporate price after trade-in?"
   - *Outcome*: The LLM calls `calculate_discount` with `quantity=5` and applies the 15% corporate discount, printing a formatted calculation table.

3. **Showroom Stock Check**:
   - *Prompt*: "Do you have the KDM Titan Pro in Raw Titanium color in stock right now?"
   - *Outcome*: The LLM calls `get_stock_status` with `color='Raw Titanium'` to return precise showroom stock availability.

---

## 💻 Tech Stack & Customizability
* **Runtime**: python3 (FastAPI & Uvicorn)
* **No Extra Dependencies**: Re-uses the existing `fastapi` and `uvicorn` modules already present in the workspace virtual environment!
* **Configuration**: The `mcp-config.json` is also provided in this folder for seamless integration if you wish to run this server using Cursor, Windsurf, or Claude Desktop.
