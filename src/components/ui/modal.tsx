import * as React from "react"
import { X } from "lucide-react"

export function Modal({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  )
}
