"""
Anthropic AI Service Module
===========================
Handles AI-powered features using the official Anthropic SDK.

Features:
- Board report generation
- Growth strategy briefs
- Daily pulse insights
- Weekly coaching questions
- Deviation analysis

Integration:
- Uses the `anthropic` Python package
- Requires ANTHROPIC_API_KEY
- All prompts optimized for Indian founder context

Author: 100Cr Engine Team
"""

import os
import logging
from typing import Dict, Any, Optional, List, Tuple
from datetime import datetime, timezone
from dataclasses import dataclass

logger = logging.getLogger("100cr_engine.ai")


# ============================================================================
# VALID ANTHROPIC MODEL IDS (as of March 2026)
# ============================================================================
# These are the actual model strings accepted by the Anthropic API.
# Update these when new models are released.

VALID_MODELS = {
    # Claude 3.5 Sonnet (latest, most capable)
    'claude-3-5-sonnet-20241022': 'claude-3-5-sonnet-20241022',
    # Claude 3 Haiku (fastest, cheapest)
    'claude-3-haiku-20240307': 'claude-3-haiku-20240307',
    # Aliases for internal use
    'sonnet': 'claude-3-5-sonnet-20241022',
    'haiku': 'claude-3-haiku-20240307',
}

DEFAULT_MODEL = 'claude-3-5-sonnet-20241022'


@dataclass
class AIResponse:
    """Response from an AI generation call."""
    content: str
    model: str
    input_tokens: int
    output_tokens: int
    stop_reason: str


class AIService:
    """
    AI service for growth coaching and report generation.
    
    Uses Claude via Anthropic API for all AI features.
    
    Usage:
        ai = AIService()
        
        # Generate a board report with model specification
        report, usage = await ai.generate_board_report(context, model='sonnet')

        # Get daily pulse
        pulse, usage = await ai.generate_daily_pulse(context, model='haiku')
    """
    
    def __init__(self):
        """Initialize AI service with Anthropic API key."""
        self.api_key = os.environ.get('ANTHROPIC_API_KEY', '')
        self._client = None
        
        if not self.api_key:
            logger.warning("ANTHROPIC_API_KEY not set - AI features disabled")
        else:
            logger.info("✓ AI service initialized with Anthropic API key")
    
    @property
    def is_configured(self) -> bool:
        """Check if AI service is properly configured."""
        return bool(self.api_key)
    
    def _resolve_model(self, model: Optional[str]) -> str:
        """
        Resolve a model identifier to a valid Anthropic model ID.

        Args:
            model: Model name, alias, or full ID

        Returns:
            Valid Anthropic model ID
        """
        if not model:
            return DEFAULT_MODEL

        # Check if it's already a valid model ID or alias
        if model in VALID_MODELS:
            return VALID_MODELS[model]

        # Check if it matches a known model pattern
        if model.startswith('claude-3'):
            # Assume it's a valid model ID being passed directly
            return model

        # Default fallback
        logger.warning(f"Unknown model '{model}', defaulting to {DEFAULT_MODEL}")
        return DEFAULT_MODEL

    async def _get_client(self):
        """Lazy initialization of Anthropic client."""
        if self._client is None and self.is_configured:
            from anthropic import AsyncAnthropic
            self._client = AsyncAnthropic(api_key=self.api_key)
            logger.info("✓ Anthropic client initialized")
        return self._client
    
    async def _call_claude(
        self,
        prompt: str,
        model: Optional[str] = None,
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> AIResponse:
        """
        Make a call to Claude API.
        
        Args:
            prompt: The prompt to send
            model: Model to use (alias or full ID)
            max_tokens: Maximum response length
            temperature: Creativity level (0-1)
            
        Returns:
            AIResponse with content and token usage
        """
        resolved_model = self._resolve_model(model)

        if not self.is_configured:
            return AIResponse(
                content="AI features are not configured. Please set ANTHROPIC_API_KEY.",
                model=resolved_model,
                input_tokens=0,
                output_tokens=0,
                stop_reason='error'
            )

        try:
            client = await self._get_client()
            # Anthropic Prompt Caching:
            # Cache reusable "system" instructions + historical check-in blocks to
            # avoid paying full input-token cost for repeated prefixes.
            #
            # We keep this as a best-effort heuristic inside _call_claude so we can
            # benefit across features without changing every prompt builder.
            system_blocks = None
            user_content = None

            # Board report: cache system instructions + "Recent Performance" (check-ins)
            if "Recent Performance:" in prompt and "Generate a professional board report with:" in prompt:
                company_idx = prompt.find("Company:")
                if company_idx != -1:
                    system_prompt = prompt[:company_idx].strip()
                    rest = prompt[company_idx:].lstrip()

                    header_idx = rest.find("Recent Performance:")
                    generate_idx = rest.find("Generate a professional board report with:")

                    if header_idx != -1 and generate_idx != -1 and generate_idx > header_idx:
                        before_checkins = rest[:header_idx].rstrip()
                        checkins_text = rest[(header_idx + len("Recent Performance:")):generate_idx].strip()
                        after_checkins = rest[generate_idx:].lstrip()

                        system_blocks = [
                            {
                                "type": "text",
                                "text": system_prompt,
                                "cache_control": {"type": "ephemeral"},
                            },
                            {
                                "type": "text",
                                "text": f"Recent Performance:\n{checkins_text}",
                                "cache_control": {"type": "ephemeral"},
                            },
                        ]
                        user_content = f"{before_checkins}\n\n{after_checkins}".strip()

            # Strategy brief: cache system instructions + "Performance Summary" (check-ins)
            if system_blocks is None and "Performance Summary:" in prompt and "Generate a quarterly growth strategy brief with:" in prompt:
                company_idx = prompt.find("Company:")
                if company_idx != -1:
                    system_prompt = prompt[:company_idx].strip()
                    rest = prompt[company_idx:].lstrip()

                    header_idx = rest.find("Performance Summary:")
                    generate_idx = rest.find("Generate a quarterly growth strategy brief with:")

                    if header_idx != -1 and generate_idx != -1 and generate_idx > header_idx:
                        before_summary = rest[:header_idx].rstrip()
                        checkins_text = rest[(header_idx + len("Performance Summary:")):generate_idx].strip()
                        after_summary = rest[generate_idx:].lstrip()

                        system_blocks = [
                            {
                                "type": "text",
                                "text": system_prompt,
                                "cache_control": {"type": "ephemeral"},
                            },
                            {
                                "type": "text",
                                "text": f"Performance Summary:\n{checkins_text}",
                                "cache_control": {"type": "ephemeral"},
                            },
                        ]
                        user_content = f"{before_summary}\n\n{after_summary}".strip()

            # Fallback: enable automatic caching for generic prompts
            # (keeps the request schema valid even if heuristic splitting fails)
            if system_blocks is None:
                msg = await client.messages.create(
                    model=resolved_model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    cache_control={"type": "ephemeral"},
                    messages=[{"role": "user", "content": prompt}],
                )
            else:
                msg = await client.messages.create(
                    model=resolved_model,
                    max_tokens=max_tokens,
                    temperature=temperature,
                    system=system_blocks,
                    messages=[{"role": "user", "content": user_content}],
                )

            # Extract text content
            parts = []
            for block in getattr(msg, "content", []) or []:
                text = getattr(block, "text", None)
                if text:
                    parts.append(text)

            content = "\n".join(parts).strip()

            # Extract token usage from response
            usage = getattr(msg, "usage", None)
            input_tokens = getattr(usage, "input_tokens", 0) if usage else 0
            output_tokens = getattr(usage, "output_tokens", 0) if usage else 0
            stop_reason = getattr(msg, "stop_reason", "end_turn") or "end_turn"

            logger.debug(f"Claude call: model={resolved_model}, input={input_tokens}, output={output_tokens}")

            return AIResponse(
                content=content,
                model=resolved_model,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                stop_reason=stop_reason
            )

        except Exception as e:
            logger.error(f"Claude API error: {e}")
            return AIResponse(
                content=f"Error generating AI content: {str(e)}",
                model=resolved_model,
                input_tokens=0,
                output_tokens=0,
                stop_reason='error'
            )

    def _format_currency(self, amount: float) -> str:
        """Format amount in Indian currency notation."""
        if amount >= 10_000_000:
            return f"₹{amount/10_000_000:.1f}Cr"
        elif amount >= 100_000:
            return f"₹{amount/100_000:.1f}L"
        else:
            return f"₹{amount:,.0f}"
    
    async def generate_board_report(
        self,
        context: Dict[str, Any],
        model: Optional[str] = None
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Generate a monthly board report.
        
        Args:
            context: Dict with company metrics
            model: Model to use (optional, defaults to sonnet)

        Returns:
            Tuple of (report_dict, usage_dict)
        """
        prompt = f"""You are an experienced startup board advisor helping an Indian SaaS founder prepare their monthly board report.

Company: {context.get('company_name', 'Startup')}
Stage: {context.get('stage', 'Pre-seed')}
Current MRR: {self._format_currency(context.get('current_mrr', 0))}
Monthly Growth: {context.get('growth_rate', 0) * 100:.1f}%
ARR: {self._format_currency(context.get('current_mrr', 0) * 12)}

Recent Performance:
{self._format_checkins(context.get('checkins', []))}

Generate a professional board report with:
1. EXECUTIVE SUMMARY (2-3 sentences)
2. KEY METRICS (bullet points with MoM changes)
3. GROWTH ANALYSIS (what's working, what's not)
4. NEXT MONTH PRIORITIES (3 specific action items)

Use Indian context (₹ currency, Indian market references).
Be data-driven and actionable. Keep it under 500 words total."""

        response = await self._call_claude(prompt, model=model, max_tokens=1500)

        # Parse sections from response
        sections = self._parse_report_sections(response.content)

        usage = {
            'model': response.model,
            'input_tokens': response.input_tokens,
            'output_tokens': response.output_tokens,
        }

        return sections, usage

    async def generate_daily_pulse(
        self,
        context: Dict[str, Any],
        model: Optional[str] = None
    ) -> Tuple[Dict[str, Any], Dict[str, Any]]:
        """
        Generate daily pulse insights.
        
        Args:
            context: Dict with current metrics and recent activity
            model: Model to use (optional, defaults to haiku for cost)

        Returns:
            Tuple of (pulse_dict, usage_dict)
        """
        prompt = f"""You are a growth coach for an Indian SaaS founder. Generate a brief morning pulse update.

Current MRR: {self._format_currency(context.get('current_mrr', 0))}
Growth Rate: {context.get('growth_rate', 0) * 100:.1f}% MoM
Days since last check-in: {context.get('days_since_checkin', 0)}
Current streak: {context.get('streak', 0)} months

Generate a brief (3-4 bullet points) morning pulse with:
1. One positive observation
2. One area of attention
3. One specific action for today

Be encouraging but actionable. Indian founder context."""

        # Default to haiku for daily pulse (cost efficiency)
        use_model = model or 'haiku'
        response = await self._call_claude(prompt, model=use_model, max_tokens=500, temperature=0.8)

        pulse = {
            'greeting': 'Good morning! Here\'s your startup pulse for today.',
            'content': response.content,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }

        usage = {
            'model': response.model,
            'input_tokens': response.input_tokens,
            'output_tokens': response.output_tokens,
        }

        return pulse, usage

    async def generate_weekly_question(
        self,
        context: Dict[str, Any],
        model: Optional[str] = None
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Generate a weekly strategic question for reflection.
        
        Args:
            context: Dict with company stage and recent performance
            model: Model to use (optional)

        Returns:
            Tuple of (question_dict, usage_dict)
        """
        prompt = f"""You are a growth coach for a {context.get('stage', 'pre-seed')} Indian SaaS founder.

Their current growth rate is {context.get('growth_rate', 0) * 100:.1f}% MoM.
Their biggest challenge is: {context.get('challenge', 'scaling')}

Generate ONE powerful strategic question for their weekly reflection.
The question should be:
- Specific to their stage and situation
- Force them to think critically about growth blockers
- Be answerable in 2-3 paragraphs

Also provide a brief hint (1-2 sentences) to guide their thinking.

Format:
QUESTION: [your question]
HINT: [your hint]"""

        # Default to haiku for weekly questions
        use_model = model or 'haiku'
        response = await self._call_claude(prompt, model=use_model, max_tokens=300, temperature=0.9)

        # Parse question and hint
        question = "What's the biggest obstacle preventing you from doubling your growth rate?"
        hint = "Think about sales cycles, marketing channels, pricing, or team capacity."
        
        if 'QUESTION:' in response.content:
            parts = response.content.split('HINT:')
            question = parts[0].replace('QUESTION:', '').strip()
            if len(parts) > 1:
                hint = parts[1].strip()
        
        result = {
            'question': question,
            'hint': hint,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }

        usage = {
            'model': response.model,
            'input_tokens': response.input_tokens,
            'output_tokens': response.output_tokens,
        }

        return result, usage

    async def generate_deviation_analysis(
        self,
        context: Dict[str, Any],
        model: Optional[str] = None
    ) -> Tuple[str, Dict[str, Any]]:
        """
        Analyze why actual revenue deviated from projection.
        
        Args:
            context: Dict with actual vs projected and check-in notes
            model: Model to use (optional)

        Returns:
            Tuple of (analysis_text, usage_dict)
        """
        deviation = context.get('deviation_pct', 0)
        direction = 'above' if deviation > 0 else 'below'
        
        prompt = f"""A founder's actual revenue was {abs(deviation):.1f}% {direction} their projection.

Actual: {self._format_currency(context.get('actual', 0))}
Projected: {self._format_currency(context.get('projected', 0))}
Check-in note: {context.get('note', 'No note provided')}

Provide a brief (2-3 sentences) analysis of:
1. What likely caused this deviation
2. One specific action to {'maintain momentum' if deviation > 0 else 'get back on track'}

Be specific and actionable. Indian SaaS context."""

        # Default to haiku for deviation analysis
        use_model = model or 'haiku'
        response = await self._call_claude(prompt, model=use_model, max_tokens=300)

        usage = {
            'model': response.model,
            'input_tokens': response.input_tokens,
            'output_tokens': response.output_tokens,
        }

        return response.content, usage

    async def generate_strategy_brief(
        self,
        context: Dict[str, Any],
        model: Optional[str] = None
    ) -> Tuple[Dict[str, str], Dict[str, Any]]:
        """
        Generate a quarterly growth strategy brief.
        
        Args:
            context: Dict with full company context
            model: Model to use (optional)

        Returns:
            Tuple of (brief_dict, usage_dict)
        """
        prompt = f"""You are a growth strategy consultant for an Indian SaaS founder.

Company: {context.get('company_name', 'Startup')}
Stage: {context.get('stage', 'Pre-seed')}
Current MRR: {self._format_currency(context.get('current_mrr', 0))}
Current Growth: {context.get('growth_rate', 0) * 100:.1f}% MoM
Target: {context.get('target', '₹100 Crore ARR')}

Performance Summary:
{self._format_checkins(context.get('checkins', []))}

Generate a quarterly growth strategy brief with:

1. SITUATION ANALYSIS (current state, 2-3 sentences)
2. GROWTH OPPORTUNITIES (3 specific opportunities)
3. RISK FACTORS (2-3 risks to watch)
4. QUARTERLY GOALS (3 SMART goals)
5. KEY INITIATIVES (3 specific initiatives with owners)

Indian market context. Be specific and actionable."""

        response = await self._call_claude(prompt, model=model, max_tokens=2000)

        brief = {
            'content': response.content,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }

        usage = {
            'model': response.model,
            'input_tokens': response.input_tokens,
            'output_tokens': response.output_tokens,
        }

        return brief, usage

    def _format_checkins(self, checkins: List[Dict[str, Any]]) -> str:
        """Format check-in history for prompts."""
        if not checkins:
            return "No check-in history available."
        
        lines = []
        for c in checkins[:6]:  # Last 6 months
            mrr = self._format_currency(c.get('actual_revenue', 0))
            note = c.get('note', '')
            lines.append(f"- {c.get('month', 'N/A')}: {mrr}" + (f" ({note})" if note else ""))
        
        return '\n'.join(lines)
    
    def _parse_report_sections(self, response: str) -> Dict[str, str]:
        """Parse Claude response into report sections."""
        sections = {
            'summary': '',
            'metrics': '',
            'analysis': '',
            'next_steps': '',
            'full_content': response
        }
        
        # Simple parsing based on headers
        current_section = 'summary'
        current_content = []
        
        for line in response.split('\n'):
            line_upper = line.upper()
            if 'EXECUTIVE SUMMARY' in line_upper:
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'summary'
                current_content = []
            elif 'KEY METRICS' in line_upper or 'METRICS' in line_upper:
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'metrics'
                current_content = []
            elif 'GROWTH ANALYSIS' in line_upper or 'ANALYSIS' in line_upper:
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'analysis'
                current_content = []
            elif 'NEXT' in line_upper and 'PRIORITIES' in line_upper:
                if current_content:
                    sections[current_section] = '\n'.join(current_content)
                current_section = 'next_steps'
                current_content = []
            else:
                current_content.append(line)
        
        if current_content:
            sections[current_section] = '\n'.join(current_content)
        
        return sections


# Global instance
ai_service = AIService()
