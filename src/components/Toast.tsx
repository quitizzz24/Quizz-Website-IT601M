import React, { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning";
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onClose: (id: string) => void;
}

export function Toast({ toasts, onClose }: ToastProps) {
  return (
    <div className="fixed bottom-20 sm:bottom-5 left-4 right-4 sm:left-auto sm:right-5 z-50 flex flex-col gap-2 max-w-[calc(100vw-32px)] sm:max-w-sm w-auto sm:w-full">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl shadow-lg border transition-all duration-300 transform translate-y-0 opacity-100 ${
            toast.type === "success"
              ? "bg-[#E9F0E8] border-[#5A6F56]/20 text-[#4A5D46]"
              : toast.type === "error"
              ? "bg-rose-50 border-rose-200 text-rose-800"
              : "bg-[#FCEEE6] border-[#BC8F71]/20 text-[#E67E22]"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            {toast.type === "success" && <CheckCircle className="h-5 w-5 text-[#5A6F56]" />}
            {toast.type === "error" && <AlertTriangle className="h-5 w-5 text-rose-600" />}
            {toast.type === "warning" && <Info className="h-5 w-5 text-[#E67E22]" />}
          </div>
          <p className="text-sm font-medium flex-1">{toast.text}</p>
          <button
            onClick={() => onClose(toast.id)}
            className="text-slate-400 hover:text-slate-700 shrink-0 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
