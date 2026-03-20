"""
Structured Logging & Observability Service
==========================================
Comprehensive logging infrastructure for the 100Cr Engine.

Features:
- JSON structured logging for easy parsing
- Request correlation IDs
- User context preservation
- Performance metrics tracking
- Secure logging (sensitive data filtering)
- Log level control

Author: 100Cr Engine Team
"""

import os
import json
import time
import logging
import traceback
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone
from functools import wraps
from contextlib import contextmanager
from dataclasses import dataclass, field, asdict
import hashlib

# ============================================================================
# CONFIGURATION
# ============================================================================

LOG_LEVEL = os.environ.get('LOG_LEVEL', 'INFO').upper()
ENABLE_STRUCTURED_LOGS = os.environ.get('ENABLE_STRUCTURED_LOGS', 'true').lower() == 'true'
ENVIRONMENT = os.environ.get('ENVIRONMENT', 'development')

# Sensitive field patterns to mask
SENSITIVE_FIELDS = {
    'password', 'secret', 'token', 'api_key', 'apikey', 'authorization',
    'credit_card', 'card_number', 'cvv', 'ssn', 'private_key', 'refresh_token',
    'access_token', 'session', 'cookie', 'jwt', 'bearer', 'x-api-key',
    'supabase_service_role_key', 'razorpay_key_secret', 'anthropic_api_key'
}


# ============================================================================
# STRUCTURED LOG ENTRY
# ============================================================================

@dataclass
class LogEntry:
    """Structured log entry with all contextual metadata."""
    timestamp: str
    level: str
    message: str
    service: str = "100cr_engine"
    environment: str = ENVIRONMENT
    
    # Request context
    request_id: Optional[str] = None
    user_id: Optional[str] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    
    # Performance
    duration_ms: Optional[float] = None
    status_code: Optional[int] = None
    
    # Error details
    error_type: Optional[str] = None
    error_message: Optional[str] = None
    stack_trace: Optional[str] = None
    
    # Additional context
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def to_json(self) -> str:
        """Convert to JSON string, filtering out None values."""
        data = {k: v for k, v in asdict(self).items() if v is not None}
        return json.dumps(data, default=str)


# ============================================================================
# SENSITIVE DATA MASKING
# ============================================================================

def mask_sensitive_data(data: Any, depth: int = 0) -> Any:
    """
    Recursively mask sensitive fields in data structures.
    
    Args:
        data: Input data (dict, list, or primitive)
        depth: Current recursion depth (max 10)
        
    Returns:
        Data with sensitive fields masked
    """
    if depth > 10:
        return "[DEPTH_LIMIT]"
    
    if isinstance(data, dict):
        masked = {}
        for key, value in data.items():
            key_lower = key.lower().replace('-', '_')
            if any(sensitive in key_lower for sensitive in SENSITIVE_FIELDS):
                masked[key] = "[REDACTED]"
            else:
                masked[key] = mask_sensitive_data(value, depth + 1)
        return masked
    
    elif isinstance(data, list):
        return [mask_sensitive_data(item, depth + 1) for item in data[:50]]  # Limit list size
    
    elif isinstance(data, str):
        # Mask JWT tokens
        if len(data) > 50 and data.count('.') == 2:
            return f"{data[:20]}...[JWT_REDACTED]"
        # Mask long strings that might be keys
        if len(data) > 100:
            return f"{data[:20]}...[TRUNCATED]"
        return data
    
    return data


def hash_user_id(user_id: str) -> str:
    """Create a short hash of user ID for logs (privacy-preserving)."""
    if not user_id:
        return "anonymous"
    return hashlib.sha256(user_id.encode()).hexdigest()[:12]


# ============================================================================
# STRUCTURED LOGGER
# ============================================================================

class StructuredLogger:
    """
    Structured logger with JSON output and context preservation.
    
    Usage:
        logger = StructuredLogger("auth")
        logger.info("User logged in", user_id="abc123", method="magic_link")
    """
    
    def __init__(self, name: str):
        self.name = name
        self.logger = logging.getLogger(f"100cr_engine.{name}")
        self._context: Dict[str, Any] = {}
    
    def set_context(self, **kwargs):
        """Set persistent context for all subsequent logs."""
        self._context.update(kwargs)
    
    def clear_context(self):
        """Clear persistent context."""
        self._context = {}
    
    def _log(
        self,
        level: str,
        message: str,
        error: Optional[Exception] = None,
        **kwargs
    ):
        """Internal logging method."""
        entry = LogEntry(
            timestamp=datetime.now(timezone.utc).isoformat(),
            level=level,
            message=message,
            **self._context
        )
        
        # Add additional kwargs to metadata
        if kwargs:
            entry.metadata = mask_sensitive_data(kwargs)
        
        # Add error details
        if error:
            entry.error_type = type(error).__name__
            entry.error_message = str(error)
            if level in ('ERROR', 'CRITICAL'):
                entry.stack_trace = traceback.format_exc()
        
        # Output
        log_level = getattr(logging, level, logging.INFO)
        
        if ENABLE_STRUCTURED_LOGS:
            self.logger.log(log_level, entry.to_json())
        else:
            # Human-readable format for development
            parts = [message]
            if entry.request_id:
                parts.insert(0, f"[{entry.request_id}]")
            if entry.user_id:
                parts.append(f"user={hash_user_id(entry.user_id)}")
            if entry.duration_ms:
                parts.append(f"duration={entry.duration_ms:.2f}ms")
            if error:
                parts.append(f"error={entry.error_type}")
            
            self.logger.log(log_level, " | ".join(parts))
    
    def debug(self, message: str, **kwargs):
        self._log("DEBUG", message, **kwargs)
    
    def info(self, message: str, **kwargs):
        self._log("INFO", message, **kwargs)
    
    def warning(self, message: str, **kwargs):
        self._log("WARNING", message, **kwargs)
    
    def error(self, message: str, error: Optional[Exception] = None, **kwargs):
        self._log("ERROR", message, error=error, **kwargs)
    
    def critical(self, message: str, error: Optional[Exception] = None, **kwargs):
        self._log("CRITICAL", message, error=error, **kwargs)
    
    @contextmanager
    def operation(self, name: str, **context):
        """
        Context manager for tracking operation duration.
        
        Usage:
            with logger.operation("database_query", table="users"):
                result = await db.query(...)
        """
        start = time.perf_counter()
        self.info(f"Starting {name}", operation=name, **context)
        
        try:
            yield
            duration_ms = (time.perf_counter() - start) * 1000
            self.info(
                f"Completed {name}",
                operation=name,
                duration_ms=duration_ms,
                status="success",
                **context
            )
        except Exception as e:
            duration_ms = (time.perf_counter() - start) * 1000
            self.error(
                f"Failed {name}",
                error=e,
                operation=name,
                duration_ms=duration_ms,
                status="error",
                **context
            )
            raise


# ============================================================================
# REQUEST LOGGING MIDDLEWARE
# ============================================================================

def log_request_decorator(logger: StructuredLogger):
    """
    Decorator for logging API request/response.
    
    Usage:
        @log_request_decorator(auth_logger)
        async def login_endpoint(request: Request):
            ...
    """
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract request from args/kwargs
            request = None
            for arg in args:
                if hasattr(arg, 'state'):
                    request = arg
                    break
            
            request_id = getattr(request.state, 'request_id', None) if request else None
            
            logger.set_context(
                request_id=request_id,
                endpoint=func.__name__
            )
            
            start = time.perf_counter()
            
            try:
                result = await func(*args, **kwargs)
                duration_ms = (time.perf_counter() - start) * 1000
                
                logger.info(
                    "Request completed",
                    duration_ms=duration_ms,
                    status="success"
                )
                
                return result
                
            except Exception as e:
                duration_ms = (time.perf_counter() - start) * 1000
                
                logger.error(
                    "Request failed",
                    error=e,
                    duration_ms=duration_ms,
                    status="error"
                )
                raise
            
            finally:
                logger.clear_context()
        
        return wrapper
    return decorator


# ============================================================================
# METRIC TRACKING
# ============================================================================

class MetricsCollector:
    """
    Collects performance metrics for monitoring.
    
    Tracks:
    - Request latencies
    - Error rates
    - Feature usage
    - AI model performance
    """
    
    def __init__(self):
        self._metrics: Dict[str, List[float]] = {}
        self._counters: Dict[str, int] = {}
        self._logger = StructuredLogger("metrics")
    
    def record_latency(self, operation: str, duration_ms: float):
        """Record operation latency."""
        if operation not in self._metrics:
            self._metrics[operation] = []
        
        self._metrics[operation].append(duration_ms)
        
        # Keep last 1000 measurements per operation
        if len(self._metrics[operation]) > 1000:
            self._metrics[operation] = self._metrics[operation][-1000:]
    
    def increment_counter(self, name: str, value: int = 1):
        """Increment a counter."""
        self._counters[name] = self._counters.get(name, 0) + value
    
    def get_stats(self, operation: str) -> Dict[str, float]:
        """Get statistics for an operation."""
        values = self._metrics.get(operation, [])
        
        if not values:
            return {"count": 0}
        
        sorted_values = sorted(values)
        count = len(values)
        
        return {
            "count": count,
            "min_ms": sorted_values[0],
            "max_ms": sorted_values[-1],
            "avg_ms": sum(values) / count,
            "p50_ms": sorted_values[int(count * 0.5)],
            "p95_ms": sorted_values[int(count * 0.95)] if count >= 20 else sorted_values[-1],
            "p99_ms": sorted_values[int(count * 0.99)] if count >= 100 else sorted_values[-1],
        }
    
    def get_all_stats(self) -> Dict[str, Any]:
        """Get all metrics."""
        return {
            "operations": {op: self.get_stats(op) for op in self._metrics},
            "counters": dict(self._counters),
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    
    def emit_summary(self):
        """Emit summary metrics to logs."""
        stats = self.get_all_stats()
        self._logger.info("Metrics summary", **stats)


# ============================================================================
# GLOBAL INSTANCES
# ============================================================================

# Named loggers for different components
auth_logger = StructuredLogger("auth")
api_logger = StructuredLogger("api")
habit_logger = StructuredLogger("habit_engine")
payment_logger = StructuredLogger("payments")
ai_logger = StructuredLogger("ai")
admin_logger = StructuredLogger("admin")
db_logger = StructuredLogger("database")

# Global metrics collector
metrics = MetricsCollector()


# ============================================================================
# CONVENIENCE FUNCTIONS
# ============================================================================

def get_logger(name: str) -> StructuredLogger:
    """Get or create a named logger."""
    return StructuredLogger(name)


def log_auth_event(
    event: str,
    user_id: Optional[str] = None,
    method: Optional[str] = None,
    success: bool = True,
    error: Optional[Exception] = None,
    **kwargs
):
    """Log authentication-related events."""
    level = "info" if success else "warning"
    getattr(auth_logger, level)(
        f"Auth event: {event}",
        user_id=user_id,
        auth_method=method,
        success=success,
        error=error,
        **kwargs
    )


def log_api_request(
    request_id: str,
    endpoint: str,
    method: str,
    user_id: Optional[str] = None,
    duration_ms: Optional[float] = None,
    status_code: int = 200,
    **kwargs
):
    """Log API request completion."""
    api_logger.info(
        f"{method} {endpoint}",
        request_id=request_id,
        endpoint=endpoint,
        method=method,
        user_id=user_id,
        duration_ms=duration_ms,
        status_code=status_code,
        **kwargs
    )
    
    if duration_ms:
        metrics.record_latency(f"api.{endpoint}", duration_ms)
    
    metrics.increment_counter(f"api.status.{status_code}")


def log_habit_engine_event(
    event: str,
    job_id: Optional[str] = None,
    users_processed: int = 0,
    emails_sent: int = 0,
    errors: int = 0,
    **kwargs
):
    """Log habit engine events."""
    habit_logger.info(
        f"Habit engine: {event}",
        job_id=job_id,
        users_processed=users_processed,
        emails_sent=emails_sent,
        errors=errors,
        **kwargs
    )
    
    metrics.increment_counter(f"habit.{event}")
    metrics.increment_counter("habit.emails_sent", emails_sent)
    metrics.increment_counter("habit.errors", errors)


def log_payment_event(
    event: str,
    user_id: Optional[str] = None,
    plan: Optional[str] = None,
    amount: Optional[int] = None,
    payment_id: Optional[str] = None,
    success: bool = True,
    **kwargs
):
    """Log payment-related events."""
    level = "info" if success else "error"
    getattr(payment_logger, level)(
        f"Payment event: {event}",
        user_id=user_id,
        plan=plan,
        amount=amount,
        payment_id=payment_id,
        success=success,
        **kwargs
    )
    
    metrics.increment_counter(f"payment.{event}")
    if amount and success:
        metrics.increment_counter("payment.revenue_inr", amount)


def log_ai_usage(
    feature: str,
    user_id: str,
    model: str,
    input_tokens: int = 0,
    output_tokens: int = 0,
    cost_inr: float = 0.0,
    duration_ms: float = 0.0,
    **kwargs
):
    """Log AI feature usage."""
    ai_logger.info(
        f"AI usage: {feature}",
        user_id=user_id,
        feature=feature,
        model=model,
        input_tokens=input_tokens,
        output_tokens=output_tokens,
        cost_inr=cost_inr,
        duration_ms=duration_ms,
        **kwargs
    )
    
    metrics.record_latency(f"ai.{feature}", duration_ms)
    metrics.increment_counter(f"ai.{feature}.calls")
    metrics.increment_counter("ai.total_tokens", input_tokens + output_tokens)
