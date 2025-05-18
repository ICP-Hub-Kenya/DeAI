import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

const generateCode = async (prompt: string) => {
  console.log(`Generating code for prompt: ${prompt}`)
  return await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": "You are a coding assistant. Generate clean, well-documented code based on the user's requirements."
        },
        {
          "role": "user",
          "content": prompt
        }
      ],
      temperature: 0.7
    })
  })
}

const reviewCode = async (code: string) => {
  console.log(`Reviewing code: ${code}`)
  return await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          "role": "system",
          "content": "You are a code review assistant. Analyze code snippets and provide explanations and suggestions for improvements."
        },
        {
          "role": "user",
          "content": `Please review this code:\n\n${code}`
        }
      ],
      temperature: 0.7
    })
  })
}

serve(async (req: Request) => {
  try {
    const url = new URL(req.url)
    console.log('Request URL:', url)
    console.log("Request URL pathname:", url.pathname)
    const requestData = await req.json()
    console.log('Request data:', requestData)

    let response
    switch (url.pathname) {
      case '/openai-proxy/generate':
        response = await generateCode(requestData.prompt)
        break
      case '/openai-proxy/review':
        response = await reviewCode(requestData.code)
        break
      default:
        throw new Error('Invalid endpoint')
    }

    const data = await response.json()
    console.log('Response data:', data)

    return new Response(JSON.stringify(data), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    })
  } catch (error: unknown) {
    console.error('Error:', error)
    if (error instanceof Error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    } else {
      return new Response(JSON.stringify({ error: 'An unknown error occurred' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
})