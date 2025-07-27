import React from 'react';

const Header: React.FC = () => (
  <header className="bg-primary text-white shadow p-4 flex items-center justify-between">
    <h1 className="text-2xl font-bold tracking-tight">MicroLearn</h1>
    <nav>
      <a href="/" className="mx-2 hover:underline">Dashboard</a>
      <a href="/spaces" className="mx-2 hover:underline">Spaces</a>
      <a href="/flashcards" className="mx-2 hover:underline">Flashcards</a>
      <a href="/documents" className="mx-2 hover:underline">Documents</a>
      <a href="/chat" className="mx-2 hover:underline">Chat</a>
    </nav>
  </header>
);

export default Header;
