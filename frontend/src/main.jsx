import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { ApiKeyProvider } from './contexts/ApiKeyContext';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <ApiKeyProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApiKeyProvider>
    </AuthProvider>
  </React.StrictMode>
);
