import { CheckCircle2, Info, XCircle, X } from 'lucide-react'
import { useStore } from '@/store/useStore'
import { cn } from '@/lib/utils'

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
  error: <XCircle className="h-5 w-5 text-red-500" />,
  info: <Info className="h-5 w-5 text-sky-500" />,
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts)
  const removeToast = useStore((s) => s.removeToast)

  return (
    <div className="fixed top-4 right-4 left-4 sm:left-auto z-[100] space-y-2 sm:w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'bg-white border border-slate-200 shadow-lg rounded-lg p-3 flex items-start gap-3 animate-in',
          )}
        >
          <div className="mt-0.5">{icons[t.tipo]}</div>
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-slate-900">{t.titulo}</div>
            {t.descricao && <div className="text-xs text-slate-500 mt-0.5">{t.descricao}</div>}
          </div>
          <button onClick={() => removeToast(t.id)} className="text-slate-400 hover:text-slate-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
