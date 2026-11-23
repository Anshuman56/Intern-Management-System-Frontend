import type { ReactNode } from 'react'

export default function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-10 flex items-start justify-center overflow-y-auto bg-slate-900/40 px-4 py-10" onClick={onClose}>
      <div className="card w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-xl leading-none text-slate-400 hover:text-slate-600" aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
