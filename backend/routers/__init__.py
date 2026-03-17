"""
Routers Package Initialization
==============================
Export all routers for the main application.

Usage:
    from routers import engine_router, benchmarks_router, ai_router
"""

from routers.engine import router as engine_router
from routers.benchmarks import router as benchmarks_router
from routers.ai import router as ai_router
from routers.reports import router as reports_router
from routers.connectors import router as connectors_router
from routers.admin import router as admin_router

__all__ = [
    'engine_router',
    'benchmarks_router',
    'ai_router',
    'reports_router',
    'connectors_router',
    'admin_router',
]
