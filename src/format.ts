// Shared display helpers

export const formatDate = (value?: string) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

// yyyy-mm-dd for <input type="date">
export const toDateInput = (value?: string) => (value ? new Date(value).toISOString().slice(0, 10) : '')

export const STATUS_BADGE: Record<string, string> = {
  Pending: 'bg-slate-100 text-slate-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  Completed: 'bg-green-50 text-green-700',
}

export const PRIORITY_BADGE: Record<string, string> = {
  Low: 'bg-slate-100 text-slate-600',
  Medium: 'bg-amber-50 text-amber-700',
  High: 'bg-red-50 text-red-700',
}

export const badge = 'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap'

export const isOverdue = (deadline: string, status: string) =>
  status !== 'Completed' && new Date(deadline).getTime() < Date.now()
