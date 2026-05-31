#!/bin/bash

# Determine project directory relative to this script
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( dirname "$DIR" )"

echo "=========================================================="
echo "⚡ Starting ToolHive MCP Mock Server for Sandbox Scenarios"
echo "=========================================================="

# Check if project virtual environment exists
if [ -f "$PROJECT_ROOT/.venv/bin/python" ]; then
    echo "Using existing python virtual environment..."
    "$PROJECT_ROOT/.venv/bin/python" "$DIR/server.py"
elif [ -f "$PROJECT_ROOT/venv/bin/python" ]; then
    echo "Using existing venv virtual environment..."
    "$PROJECT_ROOT/venv/bin/python" "$DIR/server.py"
elif command -v python3 &>/dev/null; then
    echo "Using system python3..."
    python3 "$DIR/server.py"
elif command -v python &>/dev/null; then
    echo "Using system python..."
    python "$DIR/server.py"
else
    echo "❌ Error: Python interpreter was not found. Please install Python to run the ToolHive Mock Server."
    exit 1
fi
