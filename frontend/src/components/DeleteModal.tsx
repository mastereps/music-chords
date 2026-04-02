interface DeleteModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteModal({ isOpen, title, message, onConfirm, onCancel }: DeleteModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end bg-black/50 p-4 sm:items-center sm:justify-center">
      <div className="w-full max-w-md rounded-3xl bg-white p-5  dark:bg-stone-900">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">{message}</p>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onCancel} className="flex-1 rounded-2xl border border-stone-300 px-4 py-3 font-semibold dark:border-stone-700">
            Cancel
          </button>
          <button type="button" onClick={() => void onConfirm()} className="flex-1 rounded-2xl bg-red-600 px-4 py-3 font-semibold text-white">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
