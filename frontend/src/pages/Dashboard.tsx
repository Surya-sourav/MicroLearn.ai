import React from 'react';
import Layout from '../components/common/Layout';

const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="card">
          <h2 className="text-xl font-bold mb-2">Spaces</h2>
          <p className="mb-4">Organize your learning into collaborative spaces.</p>
          <a href="/spaces" className="btn">View Spaces</a>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-2">Flashcards</h2>
          <p className="mb-4">Create and review flashcards for active recall.</p>
          <a href="/flashcards" className="btn">Go to Flashcards</a>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-2">Documents</h2>
          <p className="mb-4">Upload and manage your learning materials.</p>
          <a href="/documents" className="btn">Manage Documents</a>
        </div>
        <div className="card">
          <h2 className="text-xl font-bold mb-2">Chat</h2>
          <p className="mb-4">Ask questions and get instant answers.</p>
          <a href="/chat" className="btn">Open Chat</a>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
