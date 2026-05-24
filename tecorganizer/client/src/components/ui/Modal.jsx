import { useEffect } from 'react'
import { X } from 'lucide-react'

export default function Modal({ isOpen, onClose, title, children }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
      <div className="bg-[var(--color-bg-primary)] rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-fade-in-scale">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-[var(--color-bg-secondary)] transition-colors"
        >
          <X size={20} />
        </button>
        {title && (
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
        )}
        {children}
      </div>
    </div>
  )
}