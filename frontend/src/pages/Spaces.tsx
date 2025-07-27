import React from 'react';
import Layout from '../components/common/Layout';

const Spaces: React.FC = () => {
  // TODO: Fetch spaces from backend
  const spaces = [
    { id: 1, name: 'Math Study Group', description: 'Collaborate on math topics.' },
    { id: 2, name: 'History Notes', description: 'Share and review history materials.' },
  ];

  return (
    <Layout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Spaces</h2>
        <a href="/spaces/new" className="btn">+ New Space</a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {spaces.map(space => (
          <div key={space.id} className="card">
            <h3 className="text-lg font-semibold mb-2">{space.name}</h3>
            <p className="mb-4">{space.description}</p>
            <a href={`/spaces/${space.id}`} className="btn">View Space</a>
          </div>
        ))}
      </div>
    </Layout>
  );
};

export default Spaces;
