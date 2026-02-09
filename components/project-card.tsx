import Link from 'next/link'
import { Star, GitFork, Layers } from 'lucide-react'
import type { ProjectWithDetails } from '@/types/project'

const TOOL_LABELS: Record<string, string> = {
  cursor: 'Cursor',
  windsurf: 'Windsurf',
  bolt: 'Bolt',
  lovable: 'Lovable',
  claude: 'Claude',
  replit: 'Replit',
  other: 'Other',
}

export const ProjectCard = ({ project }: { project: ProjectWithDetails }) => {
  const {
    author,
    title,
    slug,
    description,
    tool,
    tags,
    star_count,
    fork_count,
    step_count,
  } = project

  return (
    <Link
      href={`/@${author.username}/${slug}`}
      className="group flex flex-col h-full bg-[#0c0c0f] border border-[#1c1c25] rounded-lg p-5 hover:border-[#2a2a35] hover:-translate-y-0.5 transition-all duration-200"
    >
      {/* Top row */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {author.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={author.avatar_url}
              alt={author.username}
              width={22}
              height={22}
              className="w-[22px] h-[22px] rounded-full shrink-0"
            />
          ) : (
            <div className="w-[22px] h-[22px] rounded-full bg-[#3ddc84] flex items-center justify-center shrink-0">
              <span className="font-mono text-[#09090b] text-[10px] font-bold">
                {author.username[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <span className="font-mono text-xs text-[#e8e8ed]/50 truncate">
            @{author.username}
          </span>
        </div>
        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#3ddc84]/10 text-[#3ddc84]/80 shrink-0 ml-2">
          {TOOL_LABELS[tool] ?? tool}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-mono text-[15px] font-semibold leading-snug mb-1.5 group-hover:text-[#3ddc84] transition-colors">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-[#e8e8ed]/40 line-clamp-2 mb-3 leading-relaxed">
          {description}
        </p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {tags.slice(0, 4).map((tag) => (
            <span
              key={tag.tag_name}
              className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#1c1c25] text-[#e8e8ed]/40"
            >
              {tag.tag_name}
            </span>
          ))}
        </div>
      )}

      {/* Stats — pinned to bottom */}
      <div className="flex items-center gap-4 pt-3 mt-auto border-t border-[#1c1c25]">
        <span className="flex items-center gap-1 font-mono text-xs text-[#e8e8ed]/40">
          <Star size={12} />
          {star_count}
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-[#e8e8ed]/40">
          <GitFork size={12} />
          {fork_count}
        </span>
        <span className="flex items-center gap-1 font-mono text-xs text-[#e8e8ed]/40">
          <Layers size={12} />
          {step_count} {step_count === 1 ? 'step' : 'steps'}
        </span>
      </div>
    </Link>
  )
}
