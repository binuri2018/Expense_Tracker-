import { useEffect, useMemo, useState } from 'react';
import api from '../api/client.js';
import { useAuth } from '../context/AuthProvider.jsx';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, XAxis, YAxis, Bar, Tooltip } from 'recharts';
import styles from './Dashboard.module.css';

const CATEGORY_COLORS = {
  Travel: '#ef4444',
  'Food & Dining': '#eab308',
  Entertainment: '#22c55e',
  Other: '#60a5fa',
};

export default function Dashboard() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', category: '', amount: '' });

  const fetchAll = async () => {
    const { data } = await api.get('/expenses');
    setItems(data);
  };

  useEffect(() => { fetchAll(); }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(form.amount);
    if (!form.title || !form.category || Number.isNaN(amountNum)) return;
    await api.post('/expenses', { title: form.title, category: form.category, amount: amountNum });
    setForm({ title: '', category: '', amount: '' });
    fetchAll();
  };

  const remove = async (id) => {
    await api.delete(`/expenses/${id}`);
    fetchAll();
  };

  const byCategory = useMemo(() => {
    const map = {};
    for (const it of items) {
      map[it.category] = (map[it.category] || 0) + Number(it.amount);
    }
    return Object.entries(map).map(([category, total]) => ({ category, total }));
  }, [items]);

  const totalSpent = items.reduce((s, it) => s + Number(it.amount), 0);
  const avgPerExpense = items.length ? totalSpent / items.length : 0;
  const recent = [...items].sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt)).slice(0,5);

  return (
    <div className={styles.grid}>
      <div>
        <h1 className={styles.heading}>Welcome back, {user?.username}! 👋</h1>
        <p className={styles.muted}>Track and manage your expenses with ease</p>
      </div>

      <div className={styles.card}>
        <div className={styles.body}>
          <h2 className={styles.title}>Add New Expense</h2>
          <form className={styles.form} onSubmit={onSubmit}>
            <input className={styles.input} placeholder="Expense Title" value={form.title} onChange={(e)=>setForm({ ...form, title: e.target.value })} />
            <select className={styles.select} value={form.category} onChange={(e)=>setForm({ ...form, category: e.target.value })}>
              <option value="">Select a category</option>
              <option>Food & Dining</option>
              <option>Entertainment</option>
              <option>Travel</option>
              <option>Other</option>
            </select>
            <input className={styles.input} type="number" step="0.01" placeholder="Amount ($)" value={form.amount} onChange={(e)=>setForm({ ...form, amount: e.target.value })} />
            <button className={styles.btnPrimary}>Add Expense</button>
          </form>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.body}>
          <h2 className={styles.title}>Your Expenses</h2>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map(it => (
                  <tr key={it.id}>
                    <td>{it.title}</td>
                    <td>{it.category}</td>
                    <td>${Number(it.amount).toFixed(2)}</td>
                    <td>{new Date(it.createdAt).toDateString()}</td>
                    <td>
                      <div className={styles.actions}>
                        <button title="Edit" className={styles.btnGhost}>✏️</button>
                        <button title="Delete" onClick={()=>remove(it.id)} className={styles.btnGhost} style={{ color: '#f87171' }}>🗑️</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.body}>
          <h2 className={styles.title}>Expense Summary</h2>
          <div className={`${styles.grid} ${styles.grid3}`}>
            <StatCard label="Total Expenses" value={items.length} icon="📦" />
            <StatCard label="Total Spent" value={`$${totalSpent.toFixed(2)}`} icon="🪙" />
            <StatCard label="Average per Expense" value={`$${avgPerExpense.toFixed(2)}`} icon="📊" />
          </div>

          <div className={`${styles.grid} ${styles.grid2}`} style={{ marginTop: 16 }}>
            <div className={styles.body} style={{ border: '1px solid var(--color-border)', borderRadius: 12 }}>
              <h3 style={{ margin: 0, fontWeight: 600 }}>Top Spending Categories</h3>
              <div style={{ display: 'grid', gap: 14, marginTop: 12 }}>
                {byCategory.map((c) => (
                  <div key={c.category}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, color: '#d1d5db' }}>
                      <span>{c.category}</span>
                      <span>${c.total.toFixed(2)}</span>
                    </div>
                    <div className={styles.bar}>
                      <div className={styles.barFill} style={{ width: `${(c.total / Math.max(totalSpent, 1)) * 100}%`, background: CATEGORY_COLORS[c.category] || '#4b5563' }} />
                    </div>
                    <div style={{ color: '#9ca3af', fontSize: 12, marginTop: 4 }}>{items.filter(i=>i.category===c.category).length} expense{items.filter(i=>i.category===c.category).length!==1?'s':''}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.grid}>
              <div className={styles.body} style={{ border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>Recent Expenses (Last 5)</h3>
                <div style={{ display: 'grid', gap: 10, fontSize: 14, marginTop: 12 }}>
                  {recent.map(r => (
                    <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
                      <div>
                        <div>{r.title}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{r.category}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div>${Number(r.amount).toFixed(2)}</div>
                        <div className="muted" style={{ fontSize: 12 }}>{new Date(r.createdAt).toDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.body} style={{ border: '1px solid var(--color-border)', borderRadius: 12 }}>
                <h3 style={{ margin: 0, fontWeight: 600 }}>Category Colors</h3>
                <div className={styles.legend} style={{ marginTop: 8 }}>
                  {Object.entries(CATEGORY_COLORS).map(([name, color]) => (
                    <div key={name} className={styles.legendItem}>
                      <span className={styles.dot} style={{ background: color }} />
                      <span>{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card} style={{ marginTop: 16 }}>
            <div className={styles.body}>
              <h2 className={styles.title}>Expense Charts</h2>
              <div className={`${styles.grid} ${styles.grid2}`}>
                <div className={styles.body} style={{ border: '1px solid var(--color-border)', borderRadius: 12 }}>
                  <h3 style={{ margin: 0, fontWeight: 600 }}>Spending by Category</h3>
                  <div style={{ height: 256 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie data={byCategory} dataKey="total" nameKey="category" outerRadius={90}>
                          {byCategory.map((entry, idx) => (
                            <Cell key={idx} fill={CATEGORY_COLORS[entry.category] || '#8884d8'} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className={styles.body} style={{ border: '1px solid var(--color-border)', borderRadius: 12 }}>
                  <h3 style={{ margin: 0, fontWeight: 600 }}>Category Comparison</h3>
                  <div style={{ height: 256 }}>
                    <ResponsiveContainer>
                      <BarChart data={byCategory}>
                        <XAxis dataKey="category" tick={{ fill: '#9ca3af' }} />
                        <YAxis tick={{ fill: '#9ca3af' }} />
                        <Tooltip contentStyle={{ background: '#0b1220', border: '1px solid #1f2937', color: 'white' }} />
                        <Bar dataKey="total">
                          {byCategory.map((entry, idx) => (
                            <Cell key={idx} fill={CATEGORY_COLORS[entry.category] || '#8884d8'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }) {
  return (
    <div className="bg-card border border-gray-800 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="text-xl">{icon}</div>
        <div>
          <div className="text-gray-400 text-sm">{label}</div>
          <div className="text-2xl font-semibold">{value}</div>
        </div>
      </div>
    </div>
  );
}


