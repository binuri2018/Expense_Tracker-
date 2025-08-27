import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';
import styles from './Login.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (e) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <h1 className={styles.title}>Welcome, admin!</h1>
        <p className={styles.sub}>Login to continue</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button className={styles.btnPrimary} type="submit">Login</button>
        </form>
        <div className={styles.hint}>Don't have an account? <Link to="/register">Register</Link></div>
      </div>
    </div>
  );
}


