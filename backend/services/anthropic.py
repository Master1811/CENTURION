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
from typing import Dict, Any, Optional, List
from datetime import datetime, timezone

logger = logging.getLogger("100cr_engine.ai")


class AIService:
    """
    AI service for growth coaching and report generation.
    
    Uses Claude via Anthropic API for all AI features.
    
    Usage:
        ai = AIService()
        
        # Generate a board report
        report = await ai.generate_board_report(context)
        
        # Get daily pulse
        pulse = await ai.generate_daily_pulse(context)
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
        max_tokens: int = 2000,
        temperature: float = 0.7
    ) -> str:
        """
        Make a call to Claude API.
        
        Args:
            prompt: The prompt to send
            max_tokens: Maximum response length
            temperature: Creativity level (0-1)
            
        Returns:
            Claude's response text
        """
        if not self.is_configured:
            return "AI features are not configured. Please set ANTHROPIC_API_KEY."
        
        try:
            client = await self._get_client()
            msg = await client.messages.create(
                model="claude-sonnet-4-20250514",
                max_tokens=max_tokens,
                temperature=temperature,
                messages=[{"role": "user", "content": prompt}],
            )
            # anthropic SDK returns content as a list of blocks
            parts = []
            for block in getattr(msg, "content", []) or []:
                text = getattr(block, "text", None)
                if text:
                    parts.append(text)
            return "\n".join(parts).strip()
        except Exception as e:
            logger.error(f"Claude API error: {e}")
            return f"Error generating AI content: {str(e)}"
    
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
        context: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generate a monthly board report.
        
        Args:
            context: Dict with:
                - company_name: Company name
                - current_mrr: Current MRR
                - growth_rate: Monthly growth rate
                - checkins: Recent check-in history
                - highlights: Key wins/losses
                - stage: Funding stage
                
        Returns:
            Dict with:
                - summary: Executive summary
                - metrics: Key metrics section
                - analysis: Growth analysis
                - next_steps: Recommended actions
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

        response = await self._call_claude(prompt, max_tokens=1500)
        
        # Parse sections from response
        sections = self._parse_report_sections(response)
        
        return sections
    
    async def generate_daily_pulse(
        self,
        context: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Generate daily pulse insights.
        
        Args:
            context: Dict with current metrics and recent activity
            
        Returns:
            Dict with:
                - greeting: Personalized greeting
                - highlights: List of key points
                - action: One suggested action
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

        response = await self._call_claude(prompt, max_tokens=500, temperature=0.8)
        
        return {
            'greeting': 'Good morning! Here\'s your startup pulse for today.',
            'content': response,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_weekly_question(
        self,
        context: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generate a weekly strategic question for reflection.
        
        Args:
            context: Dict with company stage and recent performance
            
        Returns:
            Dict with:
                - question: The strategic question
                - hint: Guidance for answering
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

        response = await self._call_claude(prompt, max_tokens=300, temperature=0.9)
        
        # Parse question and hint
        question = "What's the biggest obstacle preventing you from doubling your growth rate?"
        hint = "Think about sales cycles, marketing channels, pricing, or team capacity."
        
        if 'QUESTION:' in response:
            parts = response.split('HINT:')
            question = parts[0].replace('QUESTION:', '').strip()
            if len(parts) > 1:
                hint = parts[1].strip()
        
        return {
            'question': question,
            'hint': hint,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
    
    async def generate_deviation_analysis(
        self,
        context: Dict[str, Any]
    ) -> str:
        """
        Analyze why actual revenue deviated from projection.
        
        Args:
            context: Dict with actual vs projected and check-in notes
            
        Returns:
            Analysis text
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

        return await self._call_claude(prompt, max_tokens=300)
    
    async def generate_strategy_brief(
        self,
        context: Dict[str, Any]
    ) -> Dict[str, str]:
        """
        Generate a quarterly growth strategy brief.
        
        Args:
            context: Dict with full company context
            
        Returns:
            Dict with strategy sections
        """
        prompt = f"""You are a growth strategy consultant for an Indian SaaS founder.

Company: {context.get('company_name', 'Startup')}
Stage: {context.get('stage', 'Pre-seed')}
Current MRR: {self._format_currency(context.get('current_mrr', 0))}
Current Growth: {context.get('growth_rate', 0) * 100:.1f}% MoM
Target: {context.get('target', '₹100 Crore ARR')}

Performance Summary:
{self._format_checkins(context.get('checkins', []))}

Generate a Q1 2025 growth strategy brief with:

1. SITUATION ANALYSIS (current state, 2-3 sentences)
2. GROWTH OPPORTUNITIES (3 specific opportunities)
3. RISK FACTORS (2-3 risks to watch)
4. QUARTERLY GOALS (3 SMART goals)
5. KEY INITIATIVES (3 specific initiatives with owners)

Indian market context. Be specific and actionable."""

        response = await self._call_claude(prompt, max_tokens=2000)
        
        return {
            'content': response,
            'generated_at': datetime.now(timezone.utc).isoformat()
        }
    
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
