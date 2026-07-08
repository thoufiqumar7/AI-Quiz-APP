import { useEffect, useState } from 'react';
import Button from '../common/Button';

const empty = { title: '', description: '', category: '', difficulty: 'medium', rewardXP: 100, activeDate: '' };

export default function ChallengeEditor({ value, categories, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(empty);
  useEffect(() => setForm(value ? {
    ...empty,
    ...value,
    category: value.category?._id || value.category || '',
    activeDate: value.activeDate ? new Date(value.activeDate).toISOString().slice(0, 10) : '',
  } : empty), [value]);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, rewardXP: Number(form.rewardXP) }); }} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">{form._id ? 'Edit challenge' : 'New challenge'}</h3>
      <input name="title" value={form.title} onChange={change} required placeholder="Title" className="admin-input" />
      <textarea name="description" value={form.description} onChange={change} required placeholder="Description" className="admin-input min-h-20" />
      <div className="grid gap-3 sm:grid-cols-4">
        <select name="category" value={form.category} onChange={change} required className="admin-input"><option value="">Category</option>{categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select>
        <select name="difficulty" value={form.difficulty} onChange={change} className="admin-input"><option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option></select>
        <input name="rewardXP" type="number" min="10" value={form.rewardXP} onChange={change} required className="admin-input" />
        <input name="activeDate" type="date" value={form.activeDate} onChange={change} required className="admin-input" />
      </div>
      <div className="flex gap-2"><Button type="submit" disabled={loading}>Save</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
