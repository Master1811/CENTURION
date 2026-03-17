"""
Server entry point for Supervisor.

This file imports the FastAPI app from main.py
to maintain compatibility with the supervisor configuration.

For development, run:
    uvicorn server:app --reload --port 8001
    
Or directly:
    python main.py
"""

from main import app

# Export app for uvicorn
__all__ = ['app']
