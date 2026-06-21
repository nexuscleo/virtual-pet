import React from 'react';
import PetProgrammer from './virtual-pet';
import './App.css';

function App() {
  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'system-ui, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1>Virtual Programmer Pet 🎮</h1>
        <p>Acompanhe o nível do seu pet com base nas atividades do GitHub!</p>
      </header>
      <main>
        <PetProgrammer />
      </main>
    </div>
  );
}

export default App;
