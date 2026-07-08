import { useEffect, useState } from 'react';
import Button from '../common/Button';

const empty = {
  category: '',
  difficulty: 'easy',
  topic: 'General',
  question: '',
  options: ['', '', '', ''],
  answer: '',
  explanation: '',
};

export default function QuestionEditor({ value, categories, onSubmit, onCancel, loading }) {
  const [form, setForm] = useState(empty);

  useEffect(() => {
    setForm(value ? {
      ...empty,
      ...value,
      category: value.category?._id || value.category || '',
      options: value.options?.length ? value.options : empty.options,
    } : empty);
  }, [value]);

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function changeOption(index, option) {
    setForm((current) => ({
      ...current,
      options: current.options.map((item, itemIndex) => itemIndex === index ? option : item),
    }));
  }

  function submit(event) {
    event.preventDefault();
    onSubmit({ ...form, options: form.options.map((item) => item.trim()).filter(Boolean) });
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold">{form._id ? 'Edit question' : 'New question'}</h3>
      <div className="grid gap-3 sm:grid-cols-3">
        <select name="category" value={form.category} onChange={change} required className="admin-input">
          <option value="">Choose category</option>
          {categories.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}
        </select>
        <select name="difficulty" value={form.difficulty} onChange={change} className="admin-input">
          <option value="easy">Easy</option><option value="medium">Medium</option><option value="hard">Hard</option>
        </select>
        <input name="topic" value={form.topic} onChange={change} required placeholder="Topic" className="admin-input" />
      </div>
      <textarea name="question" value={form.question} onChange={change} required minLength={8} placeholder="Question" className="admin-input min-h-24" />
      <div className="grid gap-2 sm:grid-cols-2">
        {form.options.map((option, index) => (
          <input key={index} value={option} onChange={(event) => changeOption(index, event.target.value)} required={index < 2} placeholder={`Option ${index + 1}`} className="admin-input" />
        ))}
      </div>
      <input name="answer" value={form.answer} onChange={change} required placeholder="Exact correct option" className="admin-input" />
      <textarea name="explanation" value={form.explanation} onChange={change} placeholder="Explanation" className="admin-input min-h-20" />
      <div className="flex gap-2"><Button type="submit" disabled={loading}>Save</Button><Button variant="secondary" onClick={onCancel}>Cancel</Button></div>
    </form>
  );
}
