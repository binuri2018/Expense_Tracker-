import { Routes, Route, Navigate, Link } from 'react-router-dom'
import './App.css'
import { AuthProvider, useAuth } from './context/AuthProvider.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function Layout({ children }) {
  return (
    <div className="app">
      <header className="header">
        <div className="container header-inner">
          <div className="brand"><span>💰</span><span>Expense Tracker</span></div>
          <nav className="nav">
            <HeaderAuthLinks />
          </nav>
        </div>
      </header>
      <main className="container main">{children}</main>
    </div>
  )
}

function Placeholder({ title }) {
  return (
    <div className="text-center text-gray-300">{title}</div>
  )
}

function HeaderAuthLinks() {
  const { user, logout } = useAuth();
  if (!user) {
    return (<>
      <Link to="/login" className="hover:text-white">Login</Link>
      <Link to="/register" className="hover:text-white">Register</Link>
    </>);
  }
  return (<>
    <span className="muted">Welcome, {user.username}!</span>
    <button onClick={logout} className="btn btn-danger">Logout</button>
  </>);
}

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Protected><Dashboard /></Protected>} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </AuthProvider>
  )
}
