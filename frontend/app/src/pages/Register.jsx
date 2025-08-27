import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthProvider.jsx';
import styles from './Register.module.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(username, email, password);
      navigate('/dashboard');
    } catch (e) {
      setError('Registration failed');
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Sign up to get started</p>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={onSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Username</label>
            <input className={styles.input} value={username} onChange={(e)=>setUsername(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input className={styles.input} type="email" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input className={styles.input} type="password" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button className={styles.btnPrimary} type="submit">Register</button>
        </form>
        <div className={styles.hint}>Already have an account? <Link to="/login">Login</Link></div>
      </div>
    </div>
  );
}


