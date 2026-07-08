export default function FormInput({
  id,
  name,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  autoComplete,
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-xl border bg-white px-3 py-2.5 text-sm outline-none transition dark:bg-slate-900 ${
          error
            ? 'border-red-400 focus:ring-2 focus:ring-red-300'
            : 'border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 dark:border-slate-700'
        }`}
      />
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </div>
  );
}
