import { useState } from 'react'
import { api } from '../api'
import { badge, formatDate, STATUS_BADGE } from '../format'
import type { Submission, TaskStatus } from '../types'
import { useApi } from '../useApi'

const FILTERS = [
  { value: 'false', label: 'Awaiting review' },
  { value: 'true', label: 'Reviewed' },
  { value: '', label: 'All' },
]

function SubmissionCard({ s, onReviewed }: { s: Submission; onReviewed: () => void }) {
  const [feedback, setFeedback] = useState(s.adminFeedback)
  const [saving, setSaving] = useState<TaskStatus | ''>('')
  const [error, setError] = useState('')

  const review = async (taskStatus: TaskStatus) => {
    if (!feedback.trim()) {
      setError('Write some feedback first')
      return
    }
    setError('')
    setSaving(taskStatus)
    try {
      await api(`/submissions/${s._id}/review`, { method: 'PUT', body: { adminFeedback: feedback, taskStatus } })
      onReviewed()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving('')
    }
  }

  return (
    <div className="card space-y-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-semibold">{s.task?.title || 'Deleted task'}</h2>
          <p className="text-sm text-slate-500">
            {s.intern?.name || 'Deleted intern'} · submitted {formatDate(s.submittedAt)}
          </p>
        </div>
        {s.task && <span className={`${badge} ${STATUS_BADGE[s.task.status]}`}>Task: {s.task.status}</span>}
      </div>

      <div className="space-y-1 text-sm">
        {s.githubUrl && (
          <p>
            <span className="text-slate-500">GitHub: </span>
            <a href={s.githubUrl} target="_blank" rel="noreferrer" className="break-all text-indigo-600 hover:underline">
              {s.githubUrl}
            </a>
          </p>
        )}
        {s.docLink && (
          <p>
            <span className="text-slate-500">Document: </span>
            <a href={s.docLink} target="_blank" rel="noreferrer" className="break-all text-indigo-600 hover:underline">
              {s.docLink}
            </a>
          </p>
        )}
        {s.description && <p className="whitespace-pre-line text-slate-700">{s.description}</p>}
      </div>

      {error && <p className="alert-error">{error}</p>}
      <label className="block">
        <span className="label">Feedback</span>
        <textarea
          className="input"
          rows={2}
          placeholder="Tell the intern what was good and what to fix"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
        />
      </label>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => review('Completed')} disabled={!!saving} className="btn-primary">
          {saving === 'Completed' ? 'Saving…' : 'Mark Completed'}
        </button>
        <button onClick={() => review('In Progress')} disabled={!!saving} className="btn-secondary">
          {saving === 'In Progress' ? 'Saving…' : 'Request changes'}
        </button>
      </div>
    </div>
  )
}

export default function Submissions() {
  const [reviewed, setReviewed] = useState('false')
  const { data: submissions, error, loading, reload } = useApi<Submission[]>(
    `/submissions${reviewed ? `?reviewed=${reviewed}` : ''}`,
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Submissions</h1>
        <div className="flex rounded-md border border-slate-300 bg-white p-0.5">
          {FILTERS.map((f) => (
            <button
              key={f.label}
              onClick={() => setReviewed(f.value)}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                reviewed === f.value ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {loading && !submissions && <p className="text-sm text-slate-500">Loading submissions…</p>}
      {submissions?.length === 0 && <div className="card text-center text-slate-500">No submissions here.</div>}

      <div className="grid gap-4 lg:grid-cols-2">
        {submissions?.map((s) => (
          // key includes the feedback so the form resets after a review
          <SubmissionCard key={`${s._id}-${s.adminFeedback}`} s={s} onReviewed={reload} />
        ))}
      </div>
    </div>
  )
}
