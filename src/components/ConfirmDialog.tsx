"use client";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  type?: "danger" | "warning" | "info";
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  type = "warning",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const typeColors = {
    danger: "bg-red-600 hover:bg-red-700 border-red-800",
    warning: "bg-[#ff5833] hover:bg-[#ff6b47] border-slate-900",
    info: "bg-blue-600 hover:bg-blue-700 border-blue-800",
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4 mb-4">
          <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${
            type === "danger" ? "bg-red-100" : type === "warning" ? "bg-orange-100" : "bg-blue-100"
          }`}>
            <span className={`material-symbols-outlined text-2xl ${
              type === "danger" ? "text-red-600" : type === "warning" ? "text-[#ff5833]" : "text-blue-600"
            }`}>
              {type === "danger" ? "warning" : type === "warning" ? "info" : "help"}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2">{title}</h3>
            <p className="text-slate-600 font-medium leading-snug">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCancel}
            className="flex-1 h-12 bg-white font-black rounded-lg border-3 border-slate-900 btn-push hover:bg-slate-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 h-12 text-white font-black rounded-lg border-3 btn-push transition-colors ${typeColors[type]}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
