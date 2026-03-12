"use client";

interface AlertDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  buttonText?: string;
  onClose: () => void;
  type?: "error" | "success" | "warning" | "info";
}

export default function AlertDialog({
  isOpen,
  title,
  message,
  buttonText = "OK",
  onClose,
  type = "info",
}: AlertDialogProps) {
  if (!isOpen) return null;

  const typeConfig = {
    error: {
      bgColor: "bg-red-100",
      iconColor: "text-red-600",
      icon: "error",
      buttonColor: "bg-red-600 hover:bg-red-700 border-red-800",
    },
    success: {
      bgColor: "bg-green-100",
      iconColor: "text-green-600",
      icon: "check_circle",
      buttonColor: "bg-green-600 hover:bg-green-700 border-green-800",
    },
    warning: {
      bgColor: "bg-orange-100",
      iconColor: "text-[#ff5833]",
      icon: "warning",
      buttonColor: "bg-[#ff5833] hover:bg-[#ff6b47] border-slate-900",
    },
    info: {
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
      icon: "info",
      buttonColor: "bg-blue-600 hover:bg-blue-700 border-blue-800",
    },
  };

  const config = typeConfig[type];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl bold-border shadow-playful w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4 mb-4">
          <div className={`size-12 rounded-lg flex items-center justify-center shrink-0 ${config.bgColor}`}>
            <span className={`material-symbols-outlined text-2xl ${config.iconColor}`}>
              {config.icon}
            </span>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-black mb-2">{title}</h3>
            <p className="text-slate-600 font-medium leading-snug">{message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`w-full h-12 text-white font-black rounded-lg border-3 btn-push transition-colors ${config.buttonColor}`}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}
