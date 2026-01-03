"""
LLM service for generating chess learning insights using OpenAI.
"""
from typing import Any
from groq import Groq

from app.core.config import settings


def _format_move_for_llm(ply_data: dict[str, Any], move_number: int, is_white: bool) -> str:
    """Format a single move's data for LLM consumption."""
    color = "White" if is_white else "Black"
    notation = f"{move_number}. " if is_white else f"{move_number}... "
    
    lines = [f"{notation}{ply_data['san']} - {ply_data['grade']}"]
    
    if ply_data.get('reason'):
        lines.append(f"  Reason: {ply_data['reason']}")
    
    if ply_data.get('centipawnLoss'):
        lines.append(f"  Centipawn Loss: {ply_data['centipawnLoss']}")
    
    if ply_data.get('bestMove'):
        lines.append(f"  Best Move: {ply_data['bestMove']}")
    
    return "\n".join(lines)


def _extract_mistakes_and_blunders(plies: list[dict[str, Any]], player_color: str) -> dict[str, Any]:
    """Extract mistakes and blunders for the specified player."""
    is_player_white = player_color.lower() == "white"
    
    mistakes = []
    blunders = []
    inaccuracies = []
    
    for ply_idx, ply in enumerate(plies):
        # Determine who made this move (ply 0 is white's first move)
        move_by_white = ply_idx % 2 == 0
        
        # Skip if not the player's move
        if move_by_white != is_player_white:
            continue
        
        grade = ply.get('grade', '')
        move_number = (ply_idx // 2) + 1
        
        move_info = {
            'ply': ply_idx + 1,
            'move_number': move_number,
            'san': ply.get('san'),
            'grade': grade,
            'reason': ply.get('reason'),
            'centipawnLoss': ply.get('centipawnLoss'),
            'bestMove': ply.get('bestMove'),
            'eval': ply.get('eval'),
        }
        
        if grade == 'Blunder':
            blunders.append(move_info)
        elif grade == 'Mistake':
            mistakes.append(move_info)
        elif grade == 'Inaccuracy':
            inaccuracies.append(move_info)
    
    return {
        'blunders': blunders,
        'mistakes': mistakes,
        'inaccuracies': inaccuracies,
    }


def _build_llm_prompt(
    player_color: str,
    errors: dict[str, Any],
    game_result: str | None,
    opponent_name: str | None,
) -> str:
    """Build the prompt for the LLM to generate learning insights."""
    
    prompt_parts = [
        f"You are a chess coach analyzing a game where the player played as {player_color}.",
        f"The game result was: {game_result or 'Unknown'}",
    ]
    
    if opponent_name:
        prompt_parts.append(f"The opponent was: {opponent_name}")
    
    prompt_parts.append("\n## Player's Errors\n")
    
    # Add blunders
    if errors['blunders']:
        prompt_parts.append(f"### Blunders ({len(errors['blunders'])})")
        for blunder in errors['blunders']:
            move_str = _format_move_for_llm(
                blunder, 
                blunder['move_number'], 
                player_color.lower() == 'white'
            )
            prompt_parts.append(move_str)
    
    # Add mistakes
    if errors['mistakes']:
        prompt_parts.append(f"\n### Mistakes ({len(errors['mistakes'])})")
        for mistake in errors['mistakes']:
            move_str = _format_move_for_llm(
                mistake, 
                mistake['move_number'], 
                player_color.lower() == 'white'
            )
            prompt_parts.append(move_str)
    
    # Add inaccuracies (but only summarize if many)
    if errors['inaccuracies']:
        prompt_parts.append(f"\n### Inaccuracies ({len(errors['inaccuracies'])})")
        if len(errors['inaccuracies']) <= 3:
            for inaccuracy in errors['inaccuracies']:
                move_str = _format_move_for_llm(
                    inaccuracy, 
                    inaccuracy['move_number'], 
                    player_color.lower() == 'white'
                )
                prompt_parts.append(move_str)
        else:
            prompt_parts.append(f"  (Multiple inaccuracies throughout the game)")
    
    prompt_parts.extend([
        "\n## Your Task",
        "Please provide a comprehensive learning analysis with the following sections:",
        "",
        "1. **Key Mistakes Summary**: Briefly summarize the most critical errors (1-2 sentences)",
        "2. **Pattern Recognition**: Identify any recurring patterns in the mistakes (e.g., tactical oversight, positional weakness, time pressure, endgame issues)",
        "3. **Specific Lessons**: List 1-3 specific lessons the player should learn from this game",
        "4. **Practical Improvement Tips**: Provide 1-3 actionable tips for improvement",
        "5. **Study Recommendations**: Suggest specific topics or areas to study based on these errors",
        "",
        "Keep your analysis constructive, educational, and focused on improvement.",
        "Use chess terminology appropriately but explain concepts clearly.",
    ])
    
    return "\n".join(prompt_parts)


def generate_learning_insights(
    plies: list[dict[str, Any]],
    player_color: str,
    game_headers: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """
    Generate learning insights for the player's mistakes and blunders using OpenAI.
    
    Args:
        plies: List of ply analysis data from Stockfish
        player_color: "white" or "black" - the color the player was playing
        game_headers: Optional game metadata (for context like opponent name, result)
    
    Returns:
        Dictionary containing:
        - insights: The LLM-generated learning insights
        - errorCount: Statistics about errors found
        - playerColor: The color analyzed
    """
    # Extract mistakes and blunders for the player
    errors = _extract_mistakes_and_blunders(plies, player_color)
    
    total_errors = len(errors['blunders']) + len(errors['mistakes']) + len(errors['inaccuracies'])
    
    if total_errors == 0:
        return {
            'insights': "Great job! No significant mistakes or blunders were found in this game. "
                       "You played very accurately throughout.",
            'errorCount': {
                'blunders': 0,
                'mistakes': 0,
                'inaccuracies': 0,
            },
            'playerColor': player_color,
        }
    
    # Get game context
    game_result = game_headers.get('Result') if game_headers else None
    player_name = (
        game_headers.get('White') if player_color.lower() == 'white' else game_headers.get('Black')
    ) if game_headers else None
    opponent_name = (
        game_headers.get('Black') if player_color.lower() == 'white' else game_headers.get('White')
    ) if game_headers else None
    
    # Build prompt
    prompt = _build_llm_prompt(player_color, errors, game_result, opponent_name)
    
    # Call OpenAI API
    try:
        # Get API key from environment or settings
        api_key = settings.groq_api_key
        if not api_key:
            raise ValueError("Groq API key not configured. Set GROQ_API_KEY environment variable.")
        
        client = Groq(
            api_key=api_key,
            max_retries=2,  # Limit retries to avoid long waits
            timeout=30.0,  # 30 second timeout
        )
        
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # Using GPT-4o-mini for cost-effectiveness
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert chess coach providing constructive, educational analysis of games. "
                              "Your goal is to help players improve by identifying patterns in their mistakes and "
                              "providing actionable advice."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.7,
            max_tokens=500,
        )
        
        insights = response.choices[0].message.content
        
        return {
            'insights': insights,
            'errorCount': {
                'blunders': len(errors['blunders']),
                'mistakes': len(errors['mistakes']),
                'inaccuracies': len(errors['inaccuracies']),
            },
            'playerColor': player_color,
        }
    
    except Exception as e:
        # Provide specific error message for rate limits
        error_message = str(e)
        if "429" in error_message or "rate" in error_message.lower():
            user_message = (
                "⚠️ Groq API Rate Limit Exceeded\n\n"
                "Your Groq account has hit its rate limit. This usually happens when:\n"
                "- You're on the free tier (very low limits)\n"
                "- You haven't added credits to your account\n"
                "- You've made too many requests recently\n\n"
                "**To fix this:**\n"
                "1. Visit https://groq.com/settings/organization/billing\n"
                "2. Add credits to your account (minimum $5)\n"
                "3. Wait a few minutes and try again\n\n"
                f"**Your Error Summary:**\n"
                f"- Blunders: {len(errors['blunders'])}\n"
                f"- Mistakes: {len(errors['mistakes'])}\n"
                f"- Inaccuracies: {len(errors['inaccuracies'])}"
            )
        else:
            user_message = (
                f"Unable to generate AI insights at this time: {error_message}\n\n"
                f"**Your Error Summary:**\n"
                f"- Blunders: {len(errors['blunders'])}\n"
                f"- Mistakes: {len(errors['mistakes'])}\n"
                f"- Inaccuracies: {len(errors['inaccuracies'])}\n\n"
                "Please review these moves carefully to identify patterns and areas for improvement."
            )
        
        # Return a fallback response if LLM fails
        return {
            'insights': user_message,
            'errorCount': {
                'blunders': len(errors['blunders']),
                'mistakes': len(errors['mistakes']),
                'inaccuracies': len(errors['inaccuracies']),
            },
            'playerColor': player_color,
            'error': error_message,
        }

