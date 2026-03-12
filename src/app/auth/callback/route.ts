import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/my-galas'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Auth callback error:', error)
      
      // PKCE errors happen when the magic link is opened on a different device/browser
      const isPKCEError = error.message?.toLowerCase().includes('pkce') || 
                          error.message?.toLowerCase().includes('code verifier')
      
      const friendlyMessage = isPKCEError
        ? 'Please open the magic link on the same device and browser where you requested it.'
        : error.message

      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(friendlyMessage)}`, requestUrl.origin)
      )
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
}
