import { useState, type FormEvent } from 'react'
import { api } from '../api'
import Modal from '../components/Modal'
import { badge, formatDate, isOverdue, PRIORITY_BADGE, STATUS_BADGE } from '../format'
import { PRIORITIES, TASK_STATUSES, type Intern, type Priority, type Task } from '../types'
import { useApi } from '../useApi'

function TaskForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const { data: interns } = useApi<Intern[]>('/interns?isActive=true')
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', deadline: '', priority: 'Medium' as Priority })
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field: keyof typeof form, value: string) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    try {
      // The deadline is the end of the chosen day in the admin's time zone
      const deadline = new Date(`${form.deadline}T23:59:59`).toISOString()
      await api('/tasks', { method: 'POST', body: { ...form, deadline } })
      onSaved()
    } catch (err) {
      setError((err as Error).message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="alert-error">{error}</p>}
      <label className="block">
        <span className="label">Title *</span>
        <input className="input" required value={form.title} onChange={(e) => set('title', e.target.value)} />
      </label>
      <label className="block">
        <span className="label">Description</span>
        <textarea className="input" rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} />
      </label>
      <label className="block">
        <span className="label">Assign to *</span>
        <select className="input" required value={form.assignedTo} onChange={(e) => set('assignedTo', e.target.value)}>
          <option value="">{interns ? 'Select an intern' : 'Loading interns…'}</option>
          {interns?.map((i) => (
            <option key={i._id} value={i._id}>
              {i.name} ({i.email})
            </option>
          ))}
        </select>
        {interns?.length === 0 && <span className="text-xs text-red-600">Add an active intern first.</span>}
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">Deadline *</span>
          <input className="input" type="date" required value={form.deadline} onChange={(e) => set('deadline', e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Priority</span>
          <select className="input" value={form.priority} onChange={(e) => set('priority', e.target.value)}>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Creating…' : 'Create task'}
        </button>
      </div>
    </form>
  )
}

export default function Tasks() {
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const query = new URLSearchParams({ ...(status && { status }), ...(priority && { priority }) }).toString()
  const { data: tasks, error, loading, reload } = useApi<Task[]>(`/tasks${query ? `?${query}` : ''}`)
  const [creating, setCreating] = useState(false)
  const [actionError, setActionError] = useState('')

  const handleDelete = async (task: Task) => {
    if (!confirm(`Delete "${task.title}"? Its submissions are deleted too.`)) return
    setActionError('')
    try {
      await api(`/tasks/${task._id}`, { method: 'DELETE' })
      reload()
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Tasks</h1>
        <div className="flex flex-wrap gap-2">
          <select className="input w-40" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {TASK_STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select className="input w-40" value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
          <button onClick={() => setCreating(true)} className="btn-primary whitespace-nowrap">
            + New task
          </button>
        </div>
      </div>

      {(error || actionError) && <p className="alert-error">{error || actionError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Task</th>
              <th className="th">Assigned to</th>
              <th className="th">Deadline</th>
              <th className="th">Priority</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks?.map((t) => {
              const intern = typeof t.assignedTo === 'object' ? t.assignedTo : null
              const overdue = isOverdue(t.deadline, t.status)
              return (
                <tr key={t._id}>
                  <td className="td max-w-xs">
                    <div className="font-medium">{t.title}</div>
                    {t.description && <div className="line-clamp-2 text-xs text-slate-500">{t.description}</div>}
                  </td>
                  <td className="td">{intern ? intern.name : <span className="text-slate-400">Removed</span>}</td>
                  <td className={`td whitespace-nowrap ${overdue ? 'font-medium text-red-600' : ''}`}>
                    {formatDate(t.deadline)}
                    {overdue && <div className="text-xs">Overdue</div>}
                  </td>
                  <td className="td">
                    <span className={`${badge} ${PRIORITY_BADGE[t.priority]}`}>{t.priority}</span>
                  </td>
                  <td className="td">
                    <span className={`${badge} ${STATUS_BADGE[t.status]}`}>{t.status}</span>
                  </td>
                  <td className="td text-right">
                    <button onClick={() => handleDelete(t)} className="btn-danger">
                      Delete
                    </button>
                  </td>
                </tr>
              )
            })}
            {tasks?.length === 0 && (
              <tr>
                <td colSpan={6} className="td py-8 text-center text-slate-500">
                  No tasks found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && !tasks && <p className="p-4 text-sm text-slate-500">Loading tasks…</p>}
      </div>

      {creating && (
        <Modal title="New task" onClose={() => setCreating(false)}>
          <TaskForm
            onCancel={() => setCreating(false)}
            onSaved={() => {
              setCreating(false)
              reload()
            }}
          />
        </Modal>
      )}
    </div>
  )
}
