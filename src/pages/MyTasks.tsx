import { useState, type FormEvent } from 'react'
import { api } from '../api'
import Modal from '../components/Modal'
import { badge, formatDate, isOverdue, PRIORITY_BADGE, STATUS_BADGE } from '../format'
import { TASK_STATUSES, type Task } from '../types'
import { useApi } from '../useApi'

function SubmitForm({ task, onSaved, onCancel }: { task: Task; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({ githubUrl: '', docLink: '', description: '' })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field: keyof typeof form, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.githubUrl && !form.docLink) {
      setError('Add a GitHub link or a document link')
      return
    }
    setError('')
    setSaving(true)
    // Only send the links that were filled in
    const body = Object.fromEntries(Object.entries({ task: task._id, ...form }).filter(([, v]) => v))
    try {
      await api('/submissions', { method: 'POST', body })
      onSaved()
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <p className="text-sm text-slate-500">
        Submitting work for <span className="font-medium text-slate-700">{task.title}</span>
      </p>
      {error && <p className="alert-error">{error}</p>}
      <label className="block">
        <span className="label">GitHub URL</span>
        <input
          className="input"
          type="url"
          placeholder="https://github.com/you/repo"
          value={form.githubUrl}
          onChange={(e) => set('githubUrl', e.target.value)}
        />
      </label>
      <label className="block">
        <span className="label">Document link</span>
        <input
          className="input"
          type="url"
          placeholder="https://docs.google.com/…"
          value={form.docLink}
          onChange={(e) => set('docLink', e.target.value)}
        />
      </label>
      <label className="block">
        <span className="label">Notes</span>
        <textarea
          className="input"
          rows={3}
          placeholder="What did you do? Anything the reviewer should know?"
          value={form.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </label>
      <p className="text-xs text-slate-400">At least one link is required.</p>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Submitting…' : 'Submit'}
        </button>
      </div>
    </form>
  )
}

export default function MyTasks() {
  const [status, setStatus] = useState('')
  const { data: tasks, error, loading, reload } = useApi<Task[]>(`/tasks/my${status ? `?status=${encodeURIComponent(status)}` : ''}`)
  const [submitting, setSubmitting] = useState<Task | null>(null)
  const [busyId, setBusyId] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const startTask = async (task: Task) => {
    setBusyId(task._id)
    setMessage({ type: '', text: '' })
    try {
      await api(`/tasks/${task._id}`, { method: 'PUT', body: { status: 'In Progress' } })
      await reload()
    } catch (err) {
      setMessage({ type: 'error', text: (err as Error).message })
    } finally {
      setBusyId('')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">My Tasks</h1>
        <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          {TASK_STATUSES.map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {error && <p className="alert-error">{error}</p>}
      {message.text && <p className={message.type === 'error' ? 'alert-error' : 'alert-success'}>{message.text}</p>}
      {loading && !tasks && <p className="text-sm text-slate-500">Loading tasks…</p>}
      {tasks?.length === 0 && <div className="card text-center text-slate-500">No tasks here yet.</div>}

      <div className="grid gap-4 md:grid-cols-2">
        {tasks?.map((t) => {
          const overdue = isOverdue(t.deadline, t.status)
          return (
            <div key={t._id} className="card flex flex-col gap-3">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-semibold">{t.title}</h2>
                <span className={`${badge} ${STATUS_BADGE[t.status]}`}>{t.status}</span>
              </div>
              {t.description && <p className="text-sm whitespace-pre-line text-slate-600">{t.description}</p>}
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className={`${badge} ${PRIORITY_BADGE[t.priority]}`}>{t.priority} priority</span>
                <span className={overdue ? 'font-medium text-red-600' : 'text-slate-500'}>
                  Due {formatDate(t.deadline)}
                  {overdue && ' · Overdue'}
                </span>
              </div>
              <div className="mt-auto flex gap-2 pt-1">
                {t.status === 'Pending' && (
                  <button onClick={() => startTask(t)} disabled={busyId === t._id} className="btn-primary">
                    {busyId === t._id ? 'Starting…' : 'Mark In Progress'}
                  </button>
                )}
                {t.status === 'In Progress' && (
                  <button onClick={() => setSubmitting(t)} className="btn-primary">
                    Submit work
                  </button>
                )}
                {t.status === 'Completed' && <span className="text-sm text-green-700">Reviewed and completed ✓</span>}
              </div>
            </div>
          )
        })}
      </div>

      {submitting && (
        <Modal title="Submit work" onClose={() => setSubmitting(null)}>
          <SubmitForm
            task={submitting}
            onCancel={() => setSubmitting(null)}
            onSaved={() => {
              setSubmitting(null)
              setMessage({ type: 'success', text: 'Work submitted. The admin will review it.' })
              reload()
            }}
          />
        </Modal>
      )}
    </div>
  )
}
