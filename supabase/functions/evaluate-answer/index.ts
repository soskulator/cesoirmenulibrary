// Edge function for AI-powered answer evaluation
// Supabase Edge Function for evaluating test answers

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

    // Get the Lovable API key for AI access
    const lovableApiKey = Deno.env.get('LOVABLE_API_KEY')
    
    if (!lovableApiKey) {
      // Fallback to simple keyword matching if no API key
      return new Response(
        JSON.stringify(fallbackEvaluation(userAnswer, correctAnswer)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use Lovable AI to evaluate the answer
    const response = await fetch('https://ai.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${lovableApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an answer evaluator for a restaurant staff test. Your job is to determine if the user's answer demonstrates understanding of the correct answer, even if not verbatim.

Be generous with partial matches - if the user captures the key concepts, mark it correct. Look for:
- Key terms and concepts
- Understanding of the main point
- Accurate information even if worded differently

Respond ONLY with a JSON object in this exact format:
{"isCorrect": true/false, "confidence": 0.0-1.0, "feedback": "brief explanation"}

Examples of correct matches:
- Correct: "24 Hour oxtail broth. Shallot crumble." | User: "made with oxtail broth that's cooked for 24 hours" → CORRECT
- Correct: "Crudo is raw and thinly sliced. Ceviche is cured in citrus and diced." | User: "crudo is raw, ceviche is cooked in citrus" → CORRECT (close enough)
- Correct: "Within 1 minute" | User: "under a minute" → CORRECT`
          },
          {
            role: 'user',
            content: `Question: ${question || 'Not provided'}
Correct Answer: ${correctAnswer}
User's Answer: ${userAnswer}

Evaluate if the user's answer is correct or close enough to be marked correct.`
          }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    })

    if (!response.ok) {
      console.error('AI API error:', await response.text())
      return new Response(
        JSON.stringify(fallbackEvaluation(userAnswer, correctAnswer)),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const aiResponse = await response.json()
    const content = aiResponse.choices?.[0]?.message?.content || ''
    
    try {
      // Parse the JSON response from AI
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0])
        return new Response(
          JSON.stringify({
            isCorrect: result.isCorrect === true,
            confidence: result.confidence || 0.5,
            feedback: result.feedback || '',
            method: 'ai'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
    }

    // Fallback if AI response parsing fails
    return new Response(
      JSON.stringify(fallbackEvaluation(userAnswer, correctAnswer)),
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

function fallbackEvaluation(userAnswer: string, correctAnswer: string): { isCorrect: boolean; confidence: number; feedback: string; method: string } {
  const normalizedUser = userAnswer.toLowerCase().trim()
  const normalizedCorrect = correctAnswer.toLowerCase().trim()
  
  // Extract key words (words with 4+ characters, not common words)
  const stopWords = ['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'with', 'they', 'this', 'that', 'from', 'have', 'been', 'will', 'what', 'when', 'where', 'which', 'their', 'there', 'these', 'those', 'would', 'could', 'should', 'because']
  
  const extractKeywords = (text: string): string[] => {
    return text
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length >= 3 && !stopWords.includes(word))
  }
  
  const correctKeywords = extractKeywords(normalizedCorrect)
  const userKeywords = extractKeywords(normalizedUser)
  
  if (correctKeywords.length === 0) {
    // For very short answers, check direct inclusion
    const isCorrect = normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)
    return {
      isCorrect,
      confidence: isCorrect ? 0.7 : 0.3,
      feedback: isCorrect ? 'Answer matches' : 'Answer does not match',
      method: 'fallback'
    }
  }
  
  // Count how many key terms the user got
  let matchCount = 0
  for (const keyword of correctKeywords) {
    if (normalizedUser.includes(keyword)) {
      matchCount++
    }
  }
  
  const matchRatio = matchCount / correctKeywords.length
  
  // Consider correct if they got at least 50% of key terms
  const isCorrect = matchRatio >= 0.5
  
  return {
    isCorrect,
    confidence: matchRatio,
    feedback: isCorrect 
      ? `Matched ${matchCount}/${correctKeywords.length} key terms`
      : `Only matched ${matchCount}/${correctKeywords.length} key terms`,
    method: 'fallback'
  }
}
