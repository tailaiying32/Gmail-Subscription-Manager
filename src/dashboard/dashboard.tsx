import React from 'react';
import { createRoot } from 'react-dom/client';
import './dashboard.css';
import { App } from './App';

const root = document.getElementById('root')!;
createRoot(root).render(<App />);
