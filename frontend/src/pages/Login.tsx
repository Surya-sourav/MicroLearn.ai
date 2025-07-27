import React, { useState } from 'react';
import Layout from '../components/common/Layout';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    // TODO: Integrate with backend
    setTimeout(() => {
      setLoading(false);
      if (email === 'demo@microlearn.com' && password === 'password') {
        window.location.href = '/';
      } else {
        setError('Invalid credentials');
      }
    }, 1200);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto card mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign in to MicroLearn</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            className="input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            className="input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-danger text-sm">{error}</div>}
          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Don&apos;t have an account? <a href="/register" className="text-primary hover:underline">Register</a>
        </p>
      </div>
    </Layout>
  );
};

export default Login;
