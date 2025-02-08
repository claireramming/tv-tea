import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Auth0Provider } from '@auth0/auth0-react';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={process.env.AUTH0_DOMAIN || ''}
      clientId={process.env.AUTH0_CLIENT_ID || ''}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: 'https://dev-mxo5ack7pqfh6xcm.us.auth0.com/api/v2/',
        scope: 'read:current_user update:current_user_metadata'
      }}
    >
      <App />
    </Auth0Provider>
  </StrictMode>
);
