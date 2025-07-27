import React from 'react';

const Sidebar: React.FC = () => (
  <aside className="w-64 bg-surface shadow-lg rounded-lg p-6 hidden md:block">
    <nav className="flex flex-col space-y-4">
      <a href="/" className="text-primary font-semibold hover:underline">Dashboard</a>
      <a href="/spaces" className="text-primary font-semibold hover:underline">Spaces</a>
      <a href="/flashcards" className="text-primary font-semibold hover:underline">Flashcards</a>
      <a href="/documents" className="text-primary font-semibold hover:underline">Documents</a>
      <a href="/chat" className="text-primary font-semibold hover:underline">Chat</a>
    </nav>
  </aside>
);

export default Sidebar;
