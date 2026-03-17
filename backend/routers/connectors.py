"""
Connectors Router
=================
Payment gateway and data source connectors.

All endpoints require paid subscription.

Endpoints:
- GET /connectors - List connected providers
- POST /connectors/{provider}/connect - Connect a provider
- DELETE /connectors/{provider} - Disconnect a provider
- POST /connectors/{provider}/sync - Trigger sync

Author: 100Cr Engine Team
"""

import logging
from typing import Dict, Any, List

from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel

from services.auth import require_paid_subscription
from services.supabase import supabase_service
from services.encryption import encryption_service

logger = logging.getLogger("100cr_engine.connectors")

router = APIRouter(prefix="/connectors", tags=["Connectors"])


# ============================================================================
# CONSTANTS
# ============================================================================

SUPPORTED_PROVIDERS = {
    'razorpay': {
        'name': 'Razorpay',
        'tier': 1,
        'auth_type': 'api_key',
        'description': 'India\'s leading payment gateway',
        'docs_url': 'https://razorpay.com/docs/api/'
    },
    'stripe': {
        'name': 'Stripe',
        'tier': 1,
        'auth_type': 'api_key',
        'description': 'Global payment processing',
        'docs_url': 'https://stripe.com/docs/api'
    },
    'cashfree': {
        'name': 'Cashfree',
        'tier': 1,
        'auth_type': 'api_key',
        'description': 'Indian payment gateway',
        'docs_url': 'https://docs.cashfree.com/'
    },
    'chargebee': {
        'name': 'Chargebee',
        'tier': 1,
        'auth_type': 'api_key',
        'description': 'Subscription billing platform',
        'docs_url': 'https://www.chargebee.com/docs/'
    },
}


# ============================================================================
# MODELS
# ============================================================================

class ProviderInfo(BaseModel):
    """Information about a supported provider."""
    id: str
    name: str
    tier: int
    auth_type: str
    description: str
    docs_url: str


class ConnectorStatus(BaseModel):
    """Status of a connected provider."""
    provider: str
    name: str
    is_active: bool
    last_synced_at: str | None
    created_at: str


class ConnectResponse(BaseModel):
    """Response after connecting a provider."""
    success: bool
    provider: str
    message: str


# ============================================================================
# ROUTES
# ============================================================================

@router.get("/providers", response_model=List[ProviderInfo])
async def list_supported_providers():
    """
    List all supported data providers.
    
    Returns:
        List of providers with connection details
    """
    return [
        ProviderInfo(
            id=provider_id,
            name=info['name'],
            tier=info['tier'],
            auth_type=info['auth_type'],
            description=info['description'],
            docs_url=info['docs_url']
        )
        for provider_id, info in SUPPORTED_PROVIDERS.items()
    ]


@router.get("", response_model=List[ConnectorStatus])
async def list_connectors(user: Dict[str, Any] = Depends(require_paid_subscription)):
    """
    List user's connected data sources.
    
    Returns:
        List of connected providers (without API keys)
    """
    user_id = user['id']
    connectors = await supabase_service.get_connectors(user_id)
    
    return [
        ConnectorStatus(
            provider=c['provider'],
            name=SUPPORTED_PROVIDERS.get(c['provider'], {}).get('name', c['provider']),
            is_active=c.get('is_active', False),
            last_synced_at=c.get('last_synced_at'),
            created_at=c.get('created_at', '')
        )
        for c in connectors
    ]


@router.post("/{provider}/connect", response_model=ConnectResponse)
async def connect_provider(
    provider: str,
    api_key: str = Query(..., min_length=10, description="API key for the provider"),
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Connect a payment provider.
    
    The API key is encrypted before storage using Fernet encryption.
    
    Args:
        provider: Provider ID (razorpay, stripe, etc.)
        api_key: Your API key for the provider
        
    Returns:
        Connection status
    """
    if provider not in SUPPORTED_PROVIDERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported provider. Choose from: {list(SUPPORTED_PROVIDERS.keys())}"
        )
    
    user_id = user['id']
    
    # TODO: Validate API key by making a test request to the provider
    # This would be implemented per-provider
    
    # Encrypt the API key before storage
    encrypted_key = encryption_service.encrypt(api_key)
    
    # Save connector
    connector_data = {
        'user_id': user_id,
        'provider': provider,
        'encrypted_key': encrypted_key,
        'is_active': True,
        'last_synced_at': None,
    }
    
    await supabase_service.save_connector(connector_data)
    
    logger.info(f"User {user_id} connected {provider}")
    
    return ConnectResponse(
        success=True,
        provider=provider,
        message=f'{SUPPORTED_PROVIDERS[provider]["name"]} connected successfully!'
    )


@router.delete("/{provider}")
async def disconnect_provider(
    provider: str,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Disconnect a payment provider.
    
    This removes the encrypted API key from storage.
    """
    user_id = user['id']
    
    success = await supabase_service.delete_connector(user_id, provider)
    
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connector not found"
        )
    
    logger.info(f"User {user_id} disconnected {provider}")
    
    return {'success': True, 'message': f'{provider} disconnected'}


@router.post("/{provider}/sync")
async def sync_provider(
    provider: str,
    user: Dict[str, Any] = Depends(require_paid_subscription)
):
    """
    Trigger a manual sync with a connected provider.
    
    Fetches latest revenue data from the provider and
    creates/updates check-ins automatically.
    """
    user_id = user['id']
    
    # Get encrypted key
    encrypted_key = await supabase_service.get_connector_key(user_id, provider)
    
    if not encrypted_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{provider} not connected"
        )
    
    # Decrypt key
    api_key = encryption_service.decrypt(encrypted_key)
    
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to decrypt API key. Please reconnect the provider."
        )
    
    # TODO: Implement actual sync logic per provider
    # This would:
    # 1. Call provider API to fetch revenue data
    # 2. Create check-ins for each month
    # 3. Update last_synced_at
    
    logger.info(f"Sync triggered for user {user_id} provider {provider}")
    
    return {
        'success': True,
        'message': f'Sync with {provider} initiated',
        'note': 'Sync functionality is coming soon'
    }
