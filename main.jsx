import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';  // <-- aqui faltava o "App"
import './index.css'; // se quiser adicionar Tailwind ou outro estilo

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
