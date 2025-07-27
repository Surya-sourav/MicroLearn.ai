import React from 'react';
import Layout from '../components/common/Layout';

const SpaceDetail: React.FC = () => {
  // TODO: Fetch space details from backend
  const space = {
    id: 1,
    name: 'Math Study Group',
    description: 'Collaborate on math topics.',
    members: ['Alice', 'Bob', 'Charlie'],
    documents: [
      { id: 1, title: 'Algebra Notes' },
      { id: 2, title: 'Calculus Summary' },
    ],
  };

  return (
    <Layout>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">{space.name}</h2>
        <p className="mb-4 text-gray-600">{space.description}</p>
        <div className="mb-4">
          <span className="font-semibold">Members:</span> {space.members.join(', ')}
        </div>
      </div>
      <div>
        <h3 className="text-xl font-semibold mb-2">Documents</h3>
        <ul className="list-disc pl-6">
          {space.documents.map(doc => (
            <li key={doc.id} className="mb-2">
              <a href={`/documents/${doc.id}`} className="text-primary hover:underline">{doc.title}</a>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
};

export default SpaceDetail;
