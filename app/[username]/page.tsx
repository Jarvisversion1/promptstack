import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Calendar, Star, GitFork, Layers, Settings } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { buildMetadata } from '@/lib/seo'
import {
  getProfileByUsername,
  getProjectsByAuthor,
  getForkedProjectsByUser,
  getStarredProjectsByUser,
  getUserStats,
} from '@/lib/queries/profiles'
import { ProfileTabs } from '@/components/profile-tabs'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type PageProps = {
  params: Promise<{ username: string }>
  searchParams: Promise<{ tab?: string }>
}

/* ================================================================== */
/*  Helpers                                                            */
/* ================================================================== */

function formatJoinDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })
}

/* ================================================================== */
/*  Metadata                                                           */
/* ================================================================== */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { username: raw } = await params
  const username = decodeURIComponent(raw).replace(/^@/, '')
  const profile = await getProfileByUsername(username)

  if (!profile) {
    return { title: 'Not Found | PromptStack' }
  }

  const name = profile.display_name ?? profile.username
  const description = profile.bio
    ? `${name}'s prompt projects and workflows. ${profile.bio}`
    : `${name}'s prompt projects and workflows on PromptStack.`

  return buildMetadata({
    title: `@${profile.username} on PromptStack`,
    description,
    path: `/@${profile.username}`,
    ogType: 'profile',
    ogImage: profile.avatar_url ?? undefined,
  })
}

/* ================================================================== */
/*  Page                                                               */
/* ================================================================== */

export default async function ProfilePage({ params }: PageProps) {
  const { username: raw } = await params
  const username = decodeURIComponent(raw).replace(/^@/, '')

  const profile = await getProfileByUsername(username)
  if (!profile) notFound()

  /* ---- Current viewer --------------------------------------------- */
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwnProfile = user?.id === profile.id

  /* ---- Parallel data fetching ------------------------------------- */
  const [stats, projects, remixes, starred] = await Promise.all([
    getUserStats(profile.id),
    getProjectsByAuthor(profile.id, user?.id ?? null),
    getForkedProjectsByUser(profile.id),
    getStarredProjectsByUser(profile.id),
  ])

  const displayName = profile.display_name ?? profile.username

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div>
      {/* ============================================================ */}
      {/*  Profile header section                                       */}
      {/* ============================================================ */}
      <div className="bg-[#0c0c0f] border-b border-[#1c1c25]">
        <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
          <div className="flex flex-col sm:flex-row gap-5 sm:gap-6">
            {/* Avatar */}
            {profile.avatar_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={profile.avatar_url}
                alt={profile.username}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#3ddc84] flex items-center justify-center shrink-0">
                <span className="font-mono text-[#09090b] text-xl font-bold">
                  {profile.username[0]?.toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h1 className="font-mono text-xl md:text-2xl font-bold tracking-tight truncate">
                    {displayName}
                  </h1>
                  <p className="font-mono text-sm text-[#e8e8ed]/40 mt-0.5">
                    @{profile.username}
                  </p>
                </div>

                {/* Edit profile button */}
                {isOwnProfile && (
                  <Link
                    href="/settings"
                    className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-md border border-[#1c1c25] text-[#e8e8ed]/50 hover:border-[#2a2a35] hover:text-[#e8e8ed]/70 transition-colors shrink-0"
                  >
                    <Settings size={12} />
                    Edit Profile
                  </Link>
                )}
              </div>

              {/* Bio */}
              {profile.bio && (
                <p className="text-sm text-[#e8e8ed]/50 leading-relaxed mt-3 max-w-xl">
                  {profile.bio}
                </p>
              )}

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mt-4">
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Layers size={13} className="text-[#e8e8ed]/25" />
                  <span className="text-[#e8e8ed]/80 font-semibold">
                    {stats.totalProjects}
                  </span>
                  <span className="text-[#e8e8ed]/30">
                    {stats.totalProjects === 1 ? 'project' : 'projects'}
                  </span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <Star size={13} className="text-[#e8e8ed]/25" />
                  <span className="text-[#e8e8ed]/80 font-semibold">
                    {stats.totalStars}
                  </span>
                  <span className="text-[#e8e8ed]/30">
                    {stats.totalStars === 1 ? 'star' : 'stars'} received
                  </span>
                </span>
                <span className="flex items-center gap-1.5 font-mono text-xs">
                  <GitFork size={13} className="text-[#e8e8ed]/25" />
                  <span className="text-[#e8e8ed]/80 font-semibold">
                    {stats.totalForks}
                  </span>
                  <span className="text-[#e8e8ed]/30">
                    {stats.totalForks === 1 ? 'fork' : 'forks'} received
                  </span>
                </span>
              </div>

              {/* Member since */}
              <div className="flex items-center gap-1.5 mt-3">
                <Calendar size={12} className="text-[#e8e8ed]/20" />
                <span className="font-mono text-[11px] text-[#e8e8ed]/20">
                  Member since {formatJoinDate(profile.created_at)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/*  Tab content                                                  */}
      {/* ============================================================ */}
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        <Suspense fallback={<TabsSkeleton />}>
          <ProfileTabs
            username={profile.username}
            isOwnProfile={isOwnProfile}
            projects={projects}
            remixes={remixes}
            starred={starred}
          />
        </Suspense>
      </div>
    </div>
  )
}

/* ================================================================== */
/*  Skeleton                                                           */
/* ================================================================== */

function TabsSkeleton() {
  return (
    <div>
      <div className="border-b border-[#1c1c25] mb-6">
        <div className="flex gap-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-5 w-20 bg-[#1c1c25] rounded animate-pulse mb-3"
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-52 bg-[#0c0c0f] border border-[#1c1c25] rounded-lg animate-pulse"
          />
        ))}
      </div>
    </div>
  )
}
