import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Verify profile exists; create one if the database trigger didn't fire
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .single()

        if (!profile) {
          const meta = user.user_metadata
          await supabase.from('profiles').insert({
            id: user.id,
            username:
              meta.user_name ??
              meta.preferred_username ??
              user.email?.split('@')[0] ??
              `user_${user.id.slice(0, 8)}`,
            display_name: meta.full_name ?? meta.name ?? null,
            avatar_url: meta.avatar_url ?? null,
          })
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host')
      const isLocalEnv = process.env.NODE_ENV === 'development'

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // Auth error — redirect to login with error indicator
  return NextResponse.redirect(`${origin}/login?error=auth`)
}
