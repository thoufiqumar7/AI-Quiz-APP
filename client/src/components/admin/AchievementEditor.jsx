import { useEffect, useState } from 'react';
import Button from '../common/Button';

const empty = { title: '', description: '', icon: 'trophy', xpReward: 100, conditionType: 'total_quizzes', conditionValue: 1 };

export default function AchievementEditor({ value, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(empty);
  useEffect(() => setForm(value ? { ...empty, ...value } : empty), [value]);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  return (
    <form onSubmit={(event) => { event.preventDefault(); onSubmit({ ...form, xpReward: Number(form.xpReward), conditionValue: Number(form.conditionValue) }); }} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">{form._id ? 'Edit achievement' : 'New achievement'}</h3>
      <div className="grid gap-3 sm:grid-cols-2"><input name="title" value={form.title} onChange={change} required placeholder="Title" className="admin-input" /><input name="icon" value={form.icon} onChange={change} required placeholder="Icon" className="admin-input" /></div>
      <textarea name="description" value={form.description} onChange={change} required placeholder="Description" className="admin-input min-h-20" />
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="conditionType" value={form.conditionType} onChange={change} className="admin-input">
          <option value="total_quizzes">Total quizzes</option><option value="streak_days">Streak days</option><option value="high_accuracy_quizzes">High accuracy quizzes</option><option value="perfect_scores">Perfect scores</option><option value="hard_quiz_wins">Hard quiz wins</option><option value="total_xp">Total XP</option>
        </select>
        <input name="conditionValue" type="number" min="1" value={form.conditionValue} onChange={change} required className="admin-input" />
        <input name="xpReward" type="number" min="0" value={form.xpReward} onChange={change} required className="admin-input" />
      </div>
      <div className="flex gap-2"><Button type="submit" disabled={loading}>Save</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
