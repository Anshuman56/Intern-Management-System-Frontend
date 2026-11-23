import { useState, type FormEvent } from 'react'
import { api } from '../api'
import Modal from '../components/Modal'
import { badge, formatDate, toDateInput } from '../format'
import type { Intern } from '../types'
import { useApi } from '../useApi'

const EMPTY_FORM = { name: '', email: '', password: '', phone: '', department: '', joiningDate: '', isActive: true }

function InternForm({ intern, onSaved, onCancel }: { intern: Intern | null; onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState(
    intern
      ? {
          name: intern.name,
          email: intern.email,
          password: '',
          phone: intern.phone || '',
          department: intern.department || '',
          joiningDate: toDateInput(intern.joiningDate),
          isActive: intern.isActive,
        }
      : EMPTY_FORM,
  )
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const set = (field: keyof typeof form, value: string | boolean) => setForm((f) => ({ ...f, [field]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setSaving(true)
    // Blank password on edit means "keep the current one"; blank date means "let the server decide"
    const body: Record<string, unknown> = { ...form }
    if (!form.password) delete body.password
    if (!form.joiningDate) delete body.joiningDate
    try {
      await api(intern ? `/interns/${intern._id}` : '/interns', { method: intern ? 'PUT' : 'POST', body })
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
        <span className="label">Name *</span>
        <input className="input" required value={form.name} onChange={(e) => set('name', e.target.value)} />
      </label>
      <label className="block">
        <span className="label">Email *</span>
        <input className="input" type="email" required value={form.email} onChange={(e) => set('email', e.target.value)} />
      </label>
      <label className="block">
        <span className="label">{intern ? 'New password (leave blank to keep)' : 'Password *'}</span>
        <input
          className="input"
          type="password"
          minLength={6}
          required={!intern}
          autoComplete="new-password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
        />
      </label>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="label">Phone</span>
          <input className="input" value={form.phone} onChange={(e) => set('phone', e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Department</span>
          <input className="input" value={form.department} onChange={(e) => set('department', e.target.value)} />
        </label>
        <label className="block">
          <span className="label">Joining date</span>
          <input className="input" type="date" value={form.joiningDate} onChange={(e) => set('joiningDate', e.target.value)} />
        </label>
        <label className="flex items-center gap-2 pt-6 text-sm">
          <input type="checkbox" checked={form.isActive} onChange={(e) => set('isActive', e.target.checked)} />
          Active (can log in)
        </label>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <button type="button" onClick={onCancel} className="btn-secondary">
          Cancel
        </button>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : intern ? 'Save changes' : 'Add intern'}
        </button>
      </div>
    </form>
  )
}

export default function Interns() {
  const [search, setSearch] = useState('')
  const { data: interns, error, loading, reload } = useApi<Intern[]>(
    `/interns${search ? `?search=${encodeURIComponent(search)}` : ''}`,
  )
  // undefined = closed, null = adding, Intern = editing
  const [editing, setEditing] = useState<Intern | null | undefined>(undefined)
  const [actionError, setActionError] = useState('')

  const handleDelete = async (intern: Intern) => {
    if (!confirm(`Delete ${intern.name}? This also deletes their tasks and submissions.`)) return
    setActionError('')
    try {
      await api(`/interns/${intern._id}`, { method: 'DELETE' })
      reload()
    } catch (err) {
      setActionError((err as Error).message)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold">Interns</h1>
        <div className="flex gap-2">
          <input
            className="input w-56"
            placeholder="Search name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button onClick={() => setEditing(null)} className="btn-primary whitespace-nowrap">
            + Add intern
          </button>
        </div>
      </div>

      {(error || actionError) && <p className="alert-error">{error || actionError}</p>}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="th">Name</th>
              <th className="th">Email</th>
              <th className="th">Department</th>
              <th className="th">Joined</th>
              <th className="th">Status</th>
              <th className="th text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {interns?.map((i) => (
              <tr key={i._id}>
                <td className="td font-medium">
                  {i.name}
                  {i.phone && <div className="text-xs font-normal text-slate-400">{i.phone}</div>}
                </td>
                <td className="td">{i.email}</td>
                <td className="td">{i.department || '—'}</td>
                <td className="td whitespace-nowrap">{formatDate(i.joiningDate)}</td>
                <td className="td">
                  <span className={`${badge} ${i.isActive ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {i.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="td text-right whitespace-nowrap">
                  <button onClick={() => setEditing(i)} className="btn-secondary mr-2">
                    Edit
                  </button>
                  <button onClick={() => handleDelete(i)} className="btn-danger">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {interns?.length === 0 && (
              <tr>
                <td colSpan={6} className="td py-8 text-center text-slate-500">
                  No interns found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {loading && !interns && <p className="p-4 text-sm text-slate-500">Loading interns…</p>}
      </div>

      {editing !== undefined && (
        <Modal title={editing ? 'Edit intern' : 'Add intern'} onClose={() => setEditing(undefined)}>
          <InternForm
            intern={editing}
            onCancel={() => setEditing(undefined)}
            onSaved={() => {
              setEditing(undefined)
              reload()
            }}
          />
        </Modal>
      )}
    </div>
  )
}
