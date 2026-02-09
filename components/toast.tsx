'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { X } from 'lucide-react'

/* ================================================================== */
/*  Types                                                              */
/* ================================================================== */

type ToastVariant = 'success' | 'error' | 'info'

type Toast = {
  id: number
  message: string
  variant: ToastVariant
}

type ToastContextValue = {
  toast: (message: string, variant?: ToastVariant) => void
}

/* ================================================================== */
/*  Context                                                            */
/* ================================================================== */

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

/* ================================================================== */
/*  Provider                                                           */
/* ================================================================== */

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((message: string, variant: ToastVariant = 'info') => {
    const id = ++nextId
    setToasts((prev) => [...prev, { id, message, variant }])

    // Auto-dismiss after 3 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Toast container — fixed bottom-right */}
      {toasts.length > 0 && (
        <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 pointer-events-none">
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onDismiss={() => dismiss(t.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  )
}

/* ================================================================== */
/*  Hook                                                               */
/* ================================================================== */

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

/* ================================================================== */
/*  Toast item                                                         */
/* ================================================================== */

const VARIANT_BORDER: Record<ToastVariant, string> = {
  success: 'border-l-[#3ddc84]',
  error: 'border-l-red-400',
  info: 'border-l-[#3b82f6]',
}

const ToastItem = ({
  toast,
  onDismiss,
}: {
  toast: Toast
  onDismiss: () => void
}) => (
  <div
    className={`pointer-events-auto flex items-center gap-3 min-w-[260px] max-w-[360px] bg-[#0c0c0f] border border-[#1c1c25] border-l-[3px] ${VARIANT_BORDER[toast.variant]} rounded-lg px-4 py-3 shadow-xl animate-toast-in`}
  >
    <p className="font-mono text-xs text-[#e8e8ed]/70 flex-1">{toast.message}</p>
    <button
      type="button"
      onClick={onDismiss}
      className="text-[#e8e8ed]/20 hover:text-[#e8e8ed]/50 transition-colors shrink-0"
    >
      <X size={12} />
    </button>
  </div>
)
