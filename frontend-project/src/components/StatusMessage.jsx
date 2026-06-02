function StatusMessage({ message, type = 'success' }) {
  if (!message) return null;

  return (
    <div
      className={`mb-4 rounded border px-4 py-3 text-sm ${
        type === 'error'
          ? 'border-rose-200 bg-rose-50 text-rose-700'
          : 'border-emerald-200 bg-emerald-50 text-emerald-700'
      }`}
    >
      {message}
    </div>
  );
}

export default StatusMessage;
