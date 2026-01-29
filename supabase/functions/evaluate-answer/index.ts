// Edge function for evaluating test answers using Lovable AI
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

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
    // Authentication check
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('Missing or invalid Authorization header')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Create Supabase client with user's auth token
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify user authentication
    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token)
    
    if (claimsError || !claimsData?.claims) {
      console.error('Token validation failed:', claimsError?.message || 'No claims')
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const userId = claimsData.claims.sub

    // Parse and validate request body
    const body = await req.json()
    const { userAnswer, correctAnswer, question, attemptId } = body

    // Input validation with length limits
    if (typeof userAnswer !== 'string' || userAnswer.length === 0 || userAnswer.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Invalid user answer: must be a non-empty string under 2000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (typeof correctAnswer !== 'string' || correctAnswer.length === 0 || correctAnswer.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Invalid correct answer: must be a non-empty string under 2000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (typeof question !== 'string' || question.length === 0 || question.length > 1000) {
      return new Response(
        JSON.stringify({ error: 'Invalid question: must be a non-empty string under 1000 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // If attemptId is provided, verify it belongs to the authenticated user
    if (attemptId) {
      if (typeof attemptId !== 'string' || attemptId.length > 100) {
        return new Response(
          JSON.stringify({ error: 'Invalid attempt ID' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: attempt, error: attemptError } = await supabaseClient
        .from('foh_test_attempts')
        .select('id, user_id')
        .eq('id', attemptId)
        .eq('user_id', userId)
        .maybeSingle()

      if (attemptError || !attempt) {
        console.error('Attempt validation failed:', attemptError?.message || 'No matching attempt')
        return new Response(
          JSON.stringify({ error: 'Invalid test attempt' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Use Lovable AI to evaluate the answer
    const result = await evaluateWithAI(userAnswer.trim(), correctAnswer.trim(), question.trim())
    
    console.log(`AI Evaluating for user ${userId} - Result: ${result.isCorrect}`)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    
    // Fallback to keyword matching if AI fails
    try {
      const body = await req.json().catch(() => ({}))
      const { userAnswer, correctAnswer } = body
      
      if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
        const result = keywordFallback(userAnswer, correctAnswer)
        return new Response(
          JSON.stringify(result),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    } catch {
      // Ignore fallback errors
    }
    
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

async function evaluateWithAI(userAnswer: string, correctAnswer: string, question: string): Promise<{ isCorrect: boolean; confidence: number; feedback: string; method: string }> {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')
  
  if (!LOVABLE_API_KEY) {
    console.log('No LOVABLE_API_KEY, falling back to keyword matching')
    return keywordFallback(userAnswer, correctAnswer)
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a LENIENT evaluator for restaurant staff training tests. Your primary goal is to ACCEPT answers that show the employee understands the concept, even if imperfect.

CRITICAL EVALUATION RULES - BE GENEROUS:
1. SPELLING: Accept answers with typos, phonetic spelling, or minor misspellings (e.g., "burgandy" = "burgundy", "vinaigrette" = "vinigrette")
2. WORD ORDER: Accept if key concepts are present regardless of order
3. SYNONYMS: Accept equivalent terms (e.g., "garnish" = "topping", "entree" = "main course", "appetizer" = "starter")
4. PARTIAL ANSWERS: Accept if 50%+ of the key concepts are mentioned
5. ABBREVIATIONS: Accept common abbreviations (e.g., "OJ" = "orange juice", "SA" = "server assistant")
6. MISSING ARTICLES/PREPOSITIONS: Ignore missing "the", "a", "an", "with", "and", etc.
7. EXTRA DETAILS: Accept answers with additional correct information
8. PLURAL/SINGULAR: Treat as equivalent
9. INGREDIENTS: Accept if major components are mentioned even if minor ones are missing
10. DESCRIPTIONS: Accept if the essence/meaning matches, not verbatim

MARKING INCORRECT - Only mark wrong if:
- The answer is fundamentally wrong or describes a different dish/concept
- Critical safety information is incorrect (allergens, dietary restrictions)
- The answer shows complete misunderstanding

DEFAULT TO ACCEPTING if there's reasonable doubt.

Respond ONLY with a JSON object (no markdown, no code blocks):
{"isCorrect": true/false, "confidence": 0.0-1.0, "feedback": "brief explanation"}`
          },
          {
            role: 'user',
            content: `Question: ${question}

Expected Answer: ${correctAnswer}

Employee's Answer: ${userAnswer}

Is this answer acceptable? Remember to be lenient - accept if they understand the concept.`
          }
        ],
        temperature: 0.1,
      }),
    })

    if (!response.ok) {
      if (response.status === 429) {
        console.log('Rate limited, falling back to keyword matching')
        return keywordFallback(userAnswer, correctAnswer)
      }
      throw new Error(`AI API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in AI response')
    }

    // Parse the JSON response
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim()
    const parsed = JSON.parse(cleanContent)

    return {
      isCorrect: parsed.isCorrect === true,
      confidence: typeof parsed.confidence === 'number' ? parsed.confidence : (parsed.isCorrect ? 0.8 : 0.2),
      feedback: parsed.feedback || (parsed.isCorrect ? 'Answer accepted' : 'Answer needs review'),
      method: 'ai'
    }

  } catch (error) {
    console.error('AI evaluation failed:', error)
    return keywordFallback(userAnswer, correctAnswer)
  }
}

function keywordFallback(userAnswer: string, correctAnswer: string): { isCorrect: boolean; confidence: number; feedback: string; method: string } {
  const normalizedUser = userAnswer.toLowerCase().trim()
  const normalizedCorrect = correctAnswer.toLowerCase().trim()
  
  // Direct match check first
  if (normalizedUser === normalizedCorrect) {
    return {
      isCorrect: true,
      confidence: 1.0,
      feedback: 'Perfect match!',
      method: 'keyword'
    }
  }
  
  // Check if one contains the other (for short answers)
  if (normalizedCorrect.includes(normalizedUser) || normalizedUser.includes(normalizedCorrect)) {
    const matchRatio = Math.min(normalizedUser.length, normalizedCorrect.length) / 
                       Math.max(normalizedUser.length, normalizedCorrect.length)
    if (matchRatio > 0.3) {
      return {
        isCorrect: true,
        confidence: matchRatio,
        feedback: 'Answer matches expected response',
        method: 'keyword'
      }
    }
  }
  
  // Simple Levenshtein-like similarity for fuzzy matching
  const calculateSimilarity = (str1: string, str2: string): number => {
    if (str1 === str2) return 1.0
    const longer = str1.length > str2.length ? str1 : str2
    const shorter = str1.length > str2.length ? str2 : str1
    if (longer.length === 0) return 1.0
    
    // Check if shorter is contained in longer
    if (longer.includes(shorter)) {
      return shorter.length / longer.length
    }
    
    // Character overlap ratio
    const longerChars = new Set(longer.split(''))
    const shorterChars = new Set(shorter.split(''))
    let matches = 0
    shorterChars.forEach(char => {
      if (longerChars.has(char)) matches++
    })
    return matches / Math.max(longerChars.size, shorterChars.size)
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
  
  const correctKeywords = extractKeywords(normalizedCorrect)
  const userKeywords = extractKeywords(normalizedUser)
  
  // Count keyword matches with fuzzy matching
  let keywordMatches = 0
  let fuzzyMatches = 0
  
  for (const correctWord of correctKeywords) {
    // Exact match
    if (userKeywords.includes(correctWord) || normalizedUser.includes(correctWord)) {
      keywordMatches++
      continue
    }
    
    // Fuzzy match - check if any user word is similar (handles typos)
    for (const userWord of userKeywords) {
      const similarity = calculateSimilarity(correctWord, userWord)
      if (similarity >= 0.7) { // 70% similar = accept (handles 1-2 typos)
        fuzzyMatches++
        break
      }
    }
  }
  
  const totalMatches = keywordMatches + (fuzzyMatches * 0.8) // Fuzzy matches count as 80%
  const keywordRatio = correctKeywords.length > 0 ? totalMatches / correctKeywords.length : 0
  
  // More lenient threshold - accept at 25% match or 2+ matches
  const isCorrect = keywordRatio >= 0.25 || totalMatches >= 2
  
  const feedback = isCorrect 
    ? `Good! Matched ${Math.round(totalMatches)}/${correctKeywords.length} key concepts`
    : `Matched ${Math.round(totalMatches)}/${correctKeywords.length} key concepts - needs review`
  
  return {
    isCorrect,
    confidence: keywordRatio,
    feedback,
    method: 'keyword'
  }
}
