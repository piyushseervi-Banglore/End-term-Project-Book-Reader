import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/global.css';
import './styles/animations.css';
import './styles/components.css';
import { AuthProvider } from './contexts/AuthContext';
import { PDFProvider } from './contexts/PDFContext';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <PDFProvider>
        <App />
      </PDFProvider>
    </AuthProvider>
  </StrictMode>
);
