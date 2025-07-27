import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen bg-background flex flex-col">
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
    <main className="flex-1 container mx-auto px-4 py-8">{children}</main>
    <footer className="bg-muted text-center text-gray-500 py-4 text-sm">© 2025 MicroLearn. All rights reserved.</footer>
  </div>
);

export default Layout;
