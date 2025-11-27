import { X } from "lucide-react";

export function PolicyModal({ title, content, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 overflow-auto p-4">
      <div className="bg-white rounded-lg max-w-xl w-full p-6 relative">
        <div className="flex items-start justify-between mb-6">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100">
            <X className="h-6 w-6" />
          </button>
        </div>
        <div className="text-gray-600">
          <p>{content}</p>
        </div>
      </div>
    </div>
  );
}
