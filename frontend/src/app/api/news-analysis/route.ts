import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { newsTitle, newsUrl, newsSummary, newsSource } = body

    if (!newsTitle) {
      return NextResponse.json(
        { error: 'News title is required' },
        { status: 400 }
      )
    }

    const openAiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY

    if (!openAiKey) {
      return NextResponse.json(
        { error: 'OpenAI API key not configured' },
        { status: 500 }
      )
    }

    // Create comprehensive prompt for OpenAI
    const prompt = `You are a financial market analyst. Analyze the following news article and provide a comprehensive analysis.

News Title: ${newsTitle}
${newsSource ? `Source: ${newsSource}` : ''}
${newsSummary ? `Summary: ${newsSummary}` : ''}
${newsUrl ? `URL: ${newsUrl}` : ''}

IMPORTANT: Format your response EXACTLY as follows with clear section headers:

1. BREAKING NEWS SUMMARY:
[Provide a concise 2-3 sentence summary of the breaking news. Highlight the key facts and immediate implications.]

2. MARKET ANALYSIS:
[Analyze how this news might impact the markets. Discuss potential effects on different sectors. Provide insights on market sentiment and trends. Include any relevant technical or fundamental analysis.]

3. EARNINGS REPORT:
[If this news relates to earnings, provide details about the latest or expected earnings. If not directly related, mention any relevant earnings reports that might be affected. Include key metrics, expectations, and comparisons.]

4. ECONOMIC INDICATORS:
[Discuss relevant economic indicators that relate to this news. Include GDP, inflation, employment, interest rates, or other relevant metrics. Explain how these indicators might be impacted or how they provide context.]

CRITICAL: Start each section with the exact header format shown above (e.g., "1. BREAKING NEWS SUMMARY:"). Be factual, concise, and provide actionable insights.`

    // Call OpenAI API
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
              'You are an expert financial market analyst. Provide clear, structured, and actionable market analysis.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('OpenAI API error:', errorData)
      return NextResponse.json(
        { error: 'Failed to generate analysis', detail: errorData },
        { status: response.status }
      )
    }

    const data = await response.json()
    const analysisText = data.choices?.[0]?.message?.content || 'No analysis available.'

    // Parse the analysis into structured sections
    const sections = parseAnalysis(analysisText)

    return NextResponse.json({
      breakingNews: sections.breakingNews,
      marketAnalysis: sections.marketAnalysis,
      earningsReport: sections.earningsReport,
      economicIndicators: sections.economicIndicators,
      fullAnalysis: analysisText,
    })
  } catch (err: any) {
    console.error('News analysis API error:', err)
    return NextResponse.json(
      { error: 'Failed to process news analysis', detail: String(err) },
      { status: 500 }
    )
  }
}

// Helper function to parse the analysis text into sections
function parseAnalysis(text: string) {
  const sections = {
    breakingNews: '',
    marketAnalysis: '',
    earningsReport: '',
    economicIndicators: '',
  }

  // Normalize the text - handle various formats
  const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')

  // More flexible regex patterns that handle various formats
  // Pattern 1: Look for section headers with numbers or without, with or without colons
  const patterns = {
    breakingNews: [
      /(?:^|\n)\s*(?:1\.|###\s*1\.|#\s*1\.)?\s*(?:BREAKING NEWS SUMMARY|BREAKING NEWS)[:\-]?\s*\n([\s\S]*?)(?=\n\s*(?:2\.|###\s*2\.|#\s*2\.|MARKET ANALYSIS|$))/i,
      /(?:^|\n)\s*BREAKING NEWS SUMMARY[:\-]?\s*\n([\s\S]*?)(?=\n\s*(?:2\.|MARKET ANALYSIS|$))/i,
    ],
    marketAnalysis: [
      /(?:^|\n)\s*(?:2\.|###\s*2\.|#\s*2\.)?\s*MARKET ANALYSIS[:\-]?\s*\n([\s\S]*?)(?=\n\s*(?:3\.|###\s*3\.|#\s*3\.|EARNINGS REPORT|$))/i,
      /(?:^|\n)\s*MARKET ANALYSIS[:\-]?\s*\n([\s\S]*?)(?=\n\s*(?:3\.|EARNINGS REPORT|$))/i,
    ],
    earningsReport: [
      /(?:^|\n)\s*(?:3\.|###\s*3\.|#\s*3\.)?\s*EARNINGS REPORT[:\-]?\s*\n([\s\S]*?)(?=\n\s*(?:4\.|###\s*4\.|#\s*4\.|ECONOMIC INDICATORS|$))/i,
      /(?:^|\n)\s*EARNINGS REPORT[:\-]?\s*\n([\s\S]*?)(?=\n\s*(?:4\.|ECONOMIC INDICATORS|$))/i,
    ],
    economicIndicators: [
      /(?:^|\n)\s*(?:4\.|###\s*4\.|#\s*4\.)?\s*ECONOMIC INDICATORS[:\-]?\s*\n([\s\S]*?)$/i,
      /(?:^|\n)\s*ECONOMIC INDICATORS[:\-]?\s*\n([\s\S]*?)$/i,
    ],
  }

  // Try each pattern for breaking news
  for (const pattern of patterns.breakingNews) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      sections.breakingNews = match[1].trim()
      break
    }
  }

  // Try each pattern for market analysis
  for (const pattern of patterns.marketAnalysis) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      sections.marketAnalysis = match[1].trim()
      break
    }
  }

  // Try each pattern for earnings report
  for (const pattern of patterns.earningsReport) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      sections.earningsReport = match[1].trim()
      break
    }
  }

  // Try each pattern for economic indicators
  for (const pattern of patterns.economicIndicators) {
    const match = normalizedText.match(pattern)
    if (match && match[1]) {
      sections.economicIndicators = match[1].trim()
      break
    }
  }

  // Fallback: Split by numbered sections or headers
  if (!sections.breakingNews || !sections.marketAnalysis) {
    // Try splitting by numbered sections (1., 2., 3., 4.)
    const numberedParts = normalizedText.split(/\n(?=\d+\.\s+[A-Z])/i)
    if (numberedParts.length >= 4) {
      if (!sections.breakingNews) {
        sections.breakingNews = numberedParts[0]
          .replace(/^[\s\S]*?(?:BREAKING NEWS|1\.)/i, '')
          .replace(/^[\s\S]*?:\s*/, '')
          .trim()
      }
      if (!sections.marketAnalysis) {
        sections.marketAnalysis = numberedParts[1]
          .replace(/^[\s\S]*?(?:MARKET ANALYSIS|2\.)/i, '')
          .replace(/^[\s\S]*?:\s*/, '')
          .trim()
      }
      if (!sections.earningsReport) {
        sections.earningsReport = numberedParts[2]
          .replace(/^[\s\S]*?(?:EARNINGS REPORT|3\.)/i, '')
          .replace(/^[\s\S]*?:\s*/, '')
          .trim()
      }
      if (!sections.economicIndicators) {
        sections.economicIndicators = numberedParts[3]
          .replace(/^[\s\S]*?(?:ECONOMIC INDICATORS|4\.)/i, '')
          .replace(/^[\s\S]*?:\s*/, '')
          .trim()
      }
    }
  }

  // Final fallback: Split by double newlines or section markers
  if (!sections.breakingNews || !sections.marketAnalysis) {
    const parts = normalizedText.split(/\n\n+/)
    // Try to identify sections by content
    parts.forEach((part) => {
      const trimmed = part.trim()
      if (!trimmed) return

      if (
        !sections.breakingNews &&
        /breaking news/i.test(trimmed) &&
        !/market|earnings|economic/i.test(trimmed)
      ) {
        sections.breakingNews = trimmed.replace(/^[\s\S]*?(?:BREAKING NEWS|1\.)/i, '').trim()
      } else if (
        !sections.marketAnalysis &&
        /market analysis/i.test(trimmed) &&
        !/breaking|earnings|economic/i.test(trimmed)
      ) {
        sections.marketAnalysis = trimmed.replace(/^[\s\S]*?(?:MARKET ANALYSIS|2\.)/i, '').trim()
      } else if (
        !sections.earningsReport &&
        /earnings/i.test(trimmed) &&
        !/breaking|market|economic/i.test(trimmed)
      ) {
        sections.earningsReport = trimmed.replace(/^[\s\S]*?(?:EARNINGS REPORT|3\.)/i, '').trim()
      } else if (
        !sections.economicIndicators &&
        /economic indicators/i.test(trimmed)
      ) {
        sections.economicIndicators = trimmed
          .replace(/^[\s\S]*?(?:ECONOMIC INDICATORS|4\.)/i, '')
          .trim()
      }
    })
  }

  // Clean up extracted sections - remove section headers that might have been included
  Object.keys(sections).forEach((key) => {
    if (sections[key as keyof typeof sections]) {
      sections[key as keyof typeof sections] = sections[key as keyof typeof sections]
        .replace(/^(?:1\.|2\.|3\.|4\.|###?\s*\d+\.?|BREAKING NEWS|MARKET ANALYSIS|EARNINGS REPORT|ECONOMIC INDICATORS)[:\-]?\s*/i, '')
        .trim()
    }
  })

  return sections
}

