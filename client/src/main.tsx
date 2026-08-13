import React from 'react';
import ReactDOM from 'react-dom/client';
import axios from 'axios';
import App from './App.tsx';
import './index.css';

// In production, VITE_API_URL points at the deployed backend (e.g. Render web service).
// In local dev this is left unset, so relative '/api/...' calls keep using Vite's dev proxy.
const apiBaseUrl = (import.meta as any).env.VITE_API_URL;
if (apiBaseUrl) {
  axios.defaults.baseURL = apiBaseUrl;
}
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
