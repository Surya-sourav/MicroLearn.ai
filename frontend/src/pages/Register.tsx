import React, { useState } from 'react';
import Layout from '../components/common/Layout';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    // TODO: Integrate with backend
    setTimeout(() => {
      setLoading(false);
      setSuccess('Registration successful! You can now log in.');
    }, 1200);
  };

  return (
    <Layout>
      <div className="max-w-md mx-auto card mt-12">
        <h2 className="text-2xl font-bold mb-6 text-center">Create your MicroLearn account</h2>
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
          <input
            className="input"
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            required
          />
          {error && <div className="text-danger text-sm">{error}</div>}
          {success && <div className="text-success text-sm">{success}</div>}
          <button className="btn w-full" type="submit" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/login" className="text-primary hover:underline">Sign in</a>
        </p>
      </div>
    </Layout>
  );
};

export default Register;
