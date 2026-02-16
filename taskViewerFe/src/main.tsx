import React from 'react';
import ReactDOM from 'react-dom/client';
import { initTheme } from './lib/theme';
import { App } from './app';
import './index.css';

// Применить сохранённую тему до первого рендера, чтобы избежать мигания
initTheme(document.documentElement);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
