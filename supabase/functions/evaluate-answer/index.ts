// Edge function for evaluating test answers using keyword matching

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { userAnswer, correctAnswer, question } = await req.json()

    if (!userAnswer || !correctAnswer) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Evaluate using keyword matching
    const result = evaluateAnswer(userAnswer, correctAnswer)
    
    console.log(`Evaluating answer - User: "${userAnswer}" | Correct: "${correctAnswer}" | Result: ${result.isCorrect}`)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

function evaluateAnswer(userAnswer: string, correctAnswer: string): { isCorrect: boolean; confidence: number; feedback: string; method: string } {
  const normalizedUser = userAnswer.toLowerCase().trim()
  const normalizedCorrect = correctAnswer.toLowerCase().trim()
  
  // Direct match check first
  if (normalizedUser === normalizedCorrect) {
    return {
      isCorrect: true,
      confidence: 1.0,
      feedback: 'Perfect match!',
      method: 'exact'
    }
  }
  
  // Check if one contains the other (for short answers)
  if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
    const matchRatio = Math.min(normalizedUser.length, normalizedCorrect.length) / 
                       Math.max(normalizedUser.length, normalizedCorrect.length)
    if (matchRatio > 0.5) {
      return {
        isCorrect: true,
        confidence: matchRatio,
        feedback: 'Answer matches expected response',
        method: 'substring'
      }
    }
  }
  
  // Extract key words (words with 3+ characters, excluding common words)
  const stopWords = new Set([
    'the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 
    'was', 'one', 'our', 'out', 'with', 'they', 'this', 'that', 'from', 'have', 
    'been', 'will', 'what', 'when', 'where', 'which', 'their', 'there', 'these', 
    'those', 'would', 'could', 'should', 'because', 'into', 'then', 'than',
    'its', 'also', 'just', 'only', 'such', 'more', 'some', 'very', 'most'
  ])
  
  const extractKeywords = (text: string): string[] => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopWords.has(word))
      .map(word => word.toLowerCase())
  }
  
  // Also extract important numbers
  const extractNumbers = (text: string): string[] => {
    const matches = text.match(/\d+/g)
    return matches || []
  }
  
  const correctKeywords = extractKeywords(normalizedCorrect)
  const userKeywords = extractKeywords(normalizedUser)
  const correctNumbers = extractNumbers(normalizedCorrect)
  const userNumbers = extractNumbers(normalizedUser)
  
  // Count keyword matches
  let keywordMatches = 0
  for (const keyword of correctKeywords) {
    // Check for exact match or if user answer contains the keyword
    if (userKeywords.includes(keyword) || normalizedUser.includes(keyword)) {
      keywordMatches++
    }
  }
  
  // Count number matches (important for quantities like "6 oz", "22 seats", etc.)
  let numberMatches = 0
  for (const num of correctNumbers) {
    if (userNumbers.includes(num)) {
      numberMatches++
    }
  }
  
  // Calculate match ratios
  const keywordRatio = correctKeywords.length > 0 ? keywordMatches / correctKeywords.length : 0
  const numberRatio = correctNumbers.length > 0 ? numberMatches / correctNumbers.length : 1 // If no numbers expected, don't penalize
  
  // Combined score - numbers are important for factual answers
  const hasNumbers = correctNumbers.length > 0
  const combinedScore = hasNumbers 
    ? (keywordRatio * 0.5 + numberRatio * 0.5)  // Numbers matter for factual answers
    : keywordRatio
  
  // Thresholds for acceptance
  // - If numbers are expected and user got them right, be more lenient with keywords
  // - If 50%+ of keywords match, consider it correct
  const isCorrect = (hasNumbers && numberRatio >= 0.8 && keywordRatio >= 0.3) || 
                    combinedScore >= 0.5 ||
                    (keywordRatio >= 0.4 && keywordMatches >= 2)
  
  const feedback = isCorrect 
    ? `Good! Matched ${keywordMatches}/${correctKeywords.length} key concepts${hasNumbers ? ` and ${numberMatches}/${correctNumbers.length} numbers` : ''}`
    : `Matched ${keywordMatches}/${correctKeywords.length} key concepts${hasNumbers ? ` and ${numberMatches}/${correctNumbers.length} numbers` : ''} - review the correct answer`
  
  return {
    isCorrect,
    confidence: combinedScore,
    feedback,
    method: 'keyword'
  }
}
