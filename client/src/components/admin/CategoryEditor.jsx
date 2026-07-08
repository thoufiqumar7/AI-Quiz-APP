import { useEffect, useState } from 'react';
import Button from '../common/Button';

const empty = { name: '', description: '', icon: 'book-open' };

export default function CategoryEditor({ value, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(empty);
  useEffect(() => setForm(value ? { ...empty, ...value } : empty), [value]);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit(form); }} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">{form._id ? 'Edit category' : 'New category'}</h3>
      <input name="name" value={form.name} onChange={change} required minLength={2} placeholder="Category name" className="admin-input" />
      <input name="icon" value={form.icon} onChange={change} placeholder="Icon label" className="admin-input" />
      <textarea name="description" value={form.description} onChange={change} maxLength={240} placeholder="Description" className="admin-input min-h-24" />
      <div className="flex gap-2"><Button type="submit" disabled={loading}>Save</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
