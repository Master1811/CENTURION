"""
Kill Switches
=============
Shared module-level state for AI kill switches and crisis controls.
Imported by both admin router and AI router.

All state is in-memory and resets on restart — intentional.
For persistent kill switches, persist to DB and reload on startup.
"""
from typing import Dict, Optional

# ---------------------------------------------------------------------------
# AI kill switches
# ---------------------------------------------------------------------------

# True  → ALL AI endpoints return 503 immediately
AI_KILL_SWITCH: bool = False

# Per-feature switches.  True → that feature returns 503.
FEATURE_KILL_SWITCHES: Dict[str, bool] = {
    'daily_pulse': False,
    'weekly_question': False,
    'board_report': False,
    'strategy_brief': False,
    'investor_summary': False,
}

# ---------------------------------------------------------------------------
# Signup / maintenance flags
# ---------------------------------------------------------------------------

SIGNUPS_DISABLED: bool = False
SIGNUPS_DISABLED_MESSAGE: str = "New registrations are temporarily paused."

MAINTENANCE_MODE: bool = False
MAINTENANCE_MESSAGE: str = "The platform is under scheduled maintenance. Please try again later."

# ---------------------------------------------------------------------------
# Audit trail (last change)
# ---------------------------------------------------------------------------

last_updated_by: Optional[str] = None
last_updated_at: Optional[str] = None
