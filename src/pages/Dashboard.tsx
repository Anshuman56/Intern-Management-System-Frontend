import { useAuth } from '../auth/auth'
import { useApi } from '../useApi'

type StatusCounts = { Pending: number; 'In Progress': number; Completed: number }

interface Stats {
  role: 'admin' | 'intern'
  interns?: { total: number; active: number; inactive: number }
  tasks: { total: number; byStatus: StatusCounts; overdue: number }
  submissions: { total: number; pendingReview: number; reviewed: number }
}

const COLORS: Record<string, string> = {
  indigo: 'text-indigo-600',
  slate: 'text-slate-700',
  amber: 'text-amber-600',
  blue: 'text-blue-600',
  green: 'text-green-600',
  red: 'text-red-600',
}

function StatCard({ label, value, hint, color }: { label: string; value: number; hint?: string; color: string }) {
  return (
    <div className="card">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className={`mt-1 text-3xl font-semibold ${COLORS[color]}`}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const { data: s, error, loading } = useApi<Stats>('/dashboard/stats')

  const cards = !s
    ? []
    : s.role === 'admin' && s.interns
      ? [
          { label: 'Interns', value: s.interns.total, hint: `${s.interns.active} active`, color: 'indigo' },
          { label: 'Total tasks', value: s.tasks.total, color: 'slate' },
          { label: 'In progress', value: s.tasks.byStatus['In Progress'], hint: `${s.tasks.byStatus.Pending} pending`, color: 'blue' },
          { label: 'Completed', value: s.tasks.byStatus.Completed, color: 'green' },
          { label: 'Overdue', value: s.tasks.overdue, color: 'red' },
          { label: 'Awaiting review', value: s.submissions.pendingReview, hint: `${s.submissions.total} submissions`, color: 'amber' },
        ]
      : [
          { label: 'My tasks', value: s.tasks.total, color: 'indigo' },
          { label: 'Pending', value: s.tasks.byStatus.Pending, color: 'slate' },
          { label: 'In progress', value: s.tasks.byStatus['In Progress'], color: 'blue' },
          { label: 'Completed', value: s.tasks.byStatus.Completed, color: 'green' },
          { label: 'Overdue', value: s.tasks.overdue, color: 'red' },
          { label: 'Awaiting review', value: s.submissions.pendingReview, hint: `${s.submissions.total} submitted`, color: 'amber' },
        ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Welcome, {user?.name}</h1>
        <p className="text-sm text-slate-500">
          {user?.role === 'admin' ? 'Overview of all interns and tasks' : 'Overview of your tasks'}
        </p>
      </div>
      {error && <p className="alert-error">{error}</p>}
      {loading && !s && <p className="text-sm text-slate-500">Loading stats…</p>}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <StatCard key={c.label} {...c} />
        ))}
      </div>
    </div>
  )
}
