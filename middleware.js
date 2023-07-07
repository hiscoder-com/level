import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'

export async function middleware(req) {  
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session?.user) {
    return res
  }

  const redirectUrl = req.nextUrl.clone()
  redirectUrl.pathname = '/'
  redirectUrl.searchParams.set(`redirectedFrom`, req.nextUrl.pathname)
  return NextResponse.redirect(redirectUrl)
}

export const config = {
  matcher: [
    '/api/:path*',
    '/account',
    '/languages/:path*',
    '/projects/:path*',
    '/translate/:path*',
    '/users/:path*',
    '/404',
    '/agreements',
    '/api-doc',
    '/confession-steps',
    '/confession',
    '/user-agreement'
  ],
}
