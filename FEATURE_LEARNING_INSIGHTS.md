# What You Can Learn - Feature Documentation

## Overview

The "What You Can Learn" feature uses Groq's LLaMA 3.3 70B to provide personalized learning insights based on your chess mistakes and blunders. After analyzing a game with Stockfish and selecting your color (White or Black), you can click a button to generate AI-powered recommendations for improvement.

## What It Does

The AI analyzes all your mistakes, blunders, and inaccuracies from the game and provides:

1. **Key Mistakes Summary**: A brief overview of your most critical errors
2. **Pattern Recognition**: Identifies recurring patterns in your mistakes (tactical oversight, positional weakness, etc.)
3. **Specific Lessons**: 3-5 concrete lessons you should learn from this game
4. **Practical Improvement Tips**: 3-4 actionable tips you can apply in future games
5. **Study Recommendations**: Specific topics or areas to study based on your errors

## Files Added/Modified

### Backend

#### New Files:
- `backend/app/services/llm.py` - LLM service for generating learning insights using Groq

#### Modified Files:
- `backend/app/core/config.py` - Added `groq_api_key` setting
- `backend/app/schemas/pgn.py` - Added schemas for learning insights request/response
- `backend/app/api/routes/pgn.py` - Added `/learning-insights` endpoint
- `backend/README.md` - Documented the new feature and API endpoint

### Frontend

#### New Files:
- `frontend/src/components/LearningInsights/LearningInsights.tsx` - React component for displaying insights

#### Modified Files:
- `frontend/src/api/analyze.api.ts` - Added `getLearningInsights()` API function
- `frontend/src/pages/Home.tsx` - Integrated new "Learning ✨" tab

### Documentation:
- `README.md` - Updated main README with feature overview
- `FEATURE_LEARNING_INSIGHTS.md` - This comprehensive documentation file

## How It Works

### Backend Flow:

1. **Extract Errors**: The service filters all plies to find mistakes/blunders made by the specified player
2. **Build Context**: Creates a detailed prompt with:
   - Player color
   - Game result
   - All blunders with explanations
   - All mistakes with explanations
   - Count of inaccuracies
3. **Call Groq**: Sends the context to LLaMA 3.3 70B with specific instructions to provide educational analysis
4. **Return Insights**: Sends back formatted insights with error counts

### Frontend Flow:

1. **User Analyzes Game**: User pastes PGN and clicks "Analyze"
2. **User Selects Color**: User picks which side they played (White or Black)
3. **Learning Tab**: User navigates to the new "Learning ✨" tab
4. **Generate Insights**: User clicks "Generate Learning Insights ✨" button
5. **Loading State**: Shows spinner and "Analyzing your game with AI..." message
6. **Display Results**: Shows:
   - Error count summary (blunders, mistakes, inaccuracies)
   - AI-generated insights formatted nicely
   - Option to regenerate insights

## API Endpoint

### POST `/learning-insights`

**Request:**
```json
{
  "plies": [...],  // Array of move analysis from Stockfish
  "playerColor": "white",  // or "black"
  "headers": {  // Optional game metadata
    "White": "PlayerName",
    "Black": "OpponentName",
    "Result": "1-0"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "data": {
    "insights": "## Key Mistakes Summary\n\nYou made several tactical oversights in the middlegame...\n\n## Pattern Recognition\n...",
    "errorCount": {
      "blunders": 2,
      "mistakes": 3,
      "inaccuracies": 5
    },
    "playerColor": "white",
    "error": null  // Only present if there was an error
  }
}
```

## Setup Instructions

### 1. Get Groq API Key

1. Visit https://console.groq.com/keys
2. Create a new API key (free tier available!)
3. Copy the key (starts with `gsk_`)

### 2. Configure Environment Variable

#### For Docker:

Edit `docker-compose.yml`:

```yaml
services:
  backend:
    environment:
      - GROQ_API_KEY=gsk_your-api-key-here
```

#### For Local Development:

```bash
export GROQ_API_KEY=gsk_your-api-key-here
```

Or create a `.env` file in the `backend/` directory:

```bash
GROQ_API_KEY=gsk_your-api-key-here
STOCKFISH_PATH=/usr/games/stockfish
STOCKFISH_DEPTH=12
```

### 3. Restart the Backend

```bash
# If using Docker
docker compose down
docker compose up --build

# If running locally
# Just restart uvicorn (it will pick up the new environment variable)
```

## Usage

1. **Analyze a Game**: Paste a PGN and click "Analyze"
2. **Select Your Color**: Choose whether you played White or Black
3. **Navigate to Learning Tab**: Click the "Learning ✨" tab
4. **Generate Insights**: Click "Generate Learning Insights ✨"
5. **Review Your Insights**: Read the AI-generated analysis and recommendations

## Cost Considerations

- Uses Groq's LLaMA 3.3 70B model
- **FREE TIER**: Generous free tier with high rate limits
- Extremely fast inference (much faster than OpenAI)
- No credit card required to get started!

## Error Handling

The feature gracefully handles errors:

- **No API Key**: Shows error message asking user to configure API key
- **API Rate Limit**: Shows error with instructions (rarely happens with Groq's generous limits)
- **Network Error**: Shows generic error message
- **No Errors in Game**: Shows congratulatory message instead of calling API
- **Bold Text**: Now properly renders markdown bold (`**text**`) in the insights

## Technical Details

### LLM Configuration:
- Model: `llama-3.3-70b-versatile` (via Groq)
- Temperature: `0.7` (balanced creativity and consistency)
- Max Tokens: `500` (sufficient for concise insights)
- Max Retries: `2` (limited to avoid long waits)

### Prompt Engineering:
The prompt is carefully structured to:
- Provide context about the game and player
- List all errors with Stockfish explanations
- Request specific sections (summary, patterns, lessons, tips, study recommendations)
- Emphasize constructive, educational tone

### Frontend Design:
- Clean, card-based UI matching existing components
- Loading states with spinner
- Error states with helpful messages
- Formatted markdown-style output with **bold text support**
- Color-coded error counts (red for blunders, orange for mistakes, yellow for inaccuracies)
- Single-use generation to conserve API calls (free tier friendly)

## Future Enhancements (Ideas)

1. **Save Insights**: Allow users to save insights for later review (prevents need for regeneration)
2. **Compare Games**: Compare insights across multiple games to track improvement
3. **Custom Prompts**: Let users ask specific questions about their game
4. **Opening Analysis**: Specific insights about opening choices
5. **Endgame Focus**: Special analysis for endgame mistakes
6. **Model Selection**: Allow users to choose between different Groq models
7. **Export**: Export insights as PDF or text file
8. **Multi-language**: Support for insights in different languages
9. **Caching**: Cache insights for same game + color to avoid duplicate API calls

## Troubleshooting

### "Failed to generate insights"
- Check that `GROQ_API_KEY` is set correctly
- Verify your Groq API key is valid
- Check backend logs for detailed error messages

### "Unable to generate AI insights at this time"
- Network issue connecting to Groq
- Rate limit exceeded (rare with Groq's free tier)
- Backend will show fallback message with error count

### Bold text not showing properly
- Make sure you're using the latest version of the component
- The `formatInsights` function now properly handles `**bold text**` markdown

### Insights seem generic
- Make sure the game has clear mistakes (not just inaccuracies)
- Check that player color is correctly selected
- The AI analyzes all your errors and patterns - more mistakes = more detailed insights

## License & Attribution

This feature uses:
- Groq's LLaMA 3.3 70B API (via Groq Cloud)
- Groq Python SDK
- Stockfish analysis as input

Make sure your usage complies with Groq's terms of service.

**Why Groq over OpenAI?**
- ✅ Generous free tier (no credit card required)
- ✅ Much higher rate limits
- ✅ Extremely fast inference (~100 tokens/sec)
- ✅ Cost-effective for production use
- ✅ Easy to switch to OpenAI if needed

