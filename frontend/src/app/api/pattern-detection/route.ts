// frontend/src/app/api/pattern-detection/route.ts

import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { symbol, ohlcData } = await req.json()
    
    if (!symbol || !ohlcData || !Array.isArray(ohlcData) || ohlcData.length === 0) {
      return NextResponse.json(
        { error: 'Symbol and OHLC data are required' },
        { status: 400 }
      )
    }

    const openAiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY
    if (!openAiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Format OHLC data for OpenAI
    const dataSummary = ohlcData.slice(-30).map((d: any) => ({
      date: d.date || d.timestamp,
      open: d.open || d.o,
      high: d.high || d.h,
      low: d.low || d.l,
      close: d.close || d.c,
      volume: d.volume || d.v
    }))

    const prompt = `Analyze the following candlestick/OHLC data for ${symbol} and identify trading patterns.

OHLC Data (last 30 candles):
${JSON.stringify(dataSummary, null, 2)}

Please analyze and identify:
1. Chart patterns (Head & Shoulders, Double Top/Bottom, Triangles, Flags, Pennants, etc.)
2. Trend direction (Uptrend, Downtrend, Sideways)
3. Support and Resistance levels
4. Any reversal signals or continuation patterns

Format your response as JSON with the following structure:
{
  "patterns": [
    {
      "name": "Pattern Name",
      "type": "bullish|bearish|neutral",
      "confidence": "high|medium|low",
      "description": "Brief description"
    }
  ],
  "trend": {
    "direction": "uptrend|downtrend|sideways",
    "strength": "strong|moderate|weak",
    "description": "Trend analysis"
  },
  "supportResistance": {
    "support": [number],
    "resistance": [number],
    "description": "Key levels"
  },
  "alerts": [
    {
      "type": "bullish|bearish|reversal",
      "message": "Alert message",
      "confidence": "high|medium|low"
    }
  ]
}

Be concise and focus on actionable insights.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openAiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert technical analyst specializing in candlestick pattern recognition and trend analysis. Provide accurate, structured JSON responses.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate pattern analysis', detail: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const analysisText = data.choices?.[0]?.message?.content || '{}'
    
    let analysis
    try {
      analysis = JSON.parse(analysisText)
    } catch (e) {
      // Fallback if JSON parsing fails
      analysis = {
        patterns: [],
        trend: { direction: 'unknown', strength: 'unknown', description: analysisText },
        supportResistance: { support: [], resistance: [], description: '' },
        alerts: [{ type: 'neutral', message: analysisText, confidence: 'low' }],
      }
    }

    return NextResponse.json(analysis)
  } catch (err: any) {
    console.error('Pattern detection API error:', err)
    return NextResponse.json(
      { error: 'Failed to process pattern detection', detail: String(err) },
      { status: 500 }
    )
  }
}

