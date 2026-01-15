import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css'; // Global styles and variables
import keycloak from './keycloak';

const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement!);

// Prevenim dubla inițializare în Development (Strict Mode / HMR)
const didInit = document.getElementById('keycloak-did-init');
if (didInit) {
  // Dacă deja s-a inițializat, nu mai facem nimic (evităm LOOP-ul)
  console.log("Keycloak initialization skipped (already running).");
} else {
    const marker = document.createElement('div');
    marker.id = 'keycloak-did-init';
    marker.style.display = 'none';
    document.body.appendChild(marker);

    // 1. Randăm un mesaj de așteptare IMEDIAT (ca să nu fie pagina albă)
    root.render(
      <div style={{ padding: '20px', fontSize: '20px' }}>
        Se conectează la Keycloak...
      </div>
    );

    // 2. Încercăm inițializarea
    keycloak.init({ 
      onLoad: 'login-required', // Forțează login-ul imediat
      checkLoginIframe: false,   // Dezactivăm iframe-ul de verificare
      pkceMethod: 'S256'         // Specificăm explicit PKCE
    }).then((authenticated: boolean) => {
      
      if (authenticated) {
        console.log("Autentificare reușită!");
        
        console.log("Token Keycloak:", keycloak.token);
        // 3. Dacă e logat, afișăm Aplicația
        root.render(
          <React.StrictMode>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </React.StrictMode>
        );
      } else {
        // Teoretic nu ajungi aici cu 'login-required', dar pentru siguranță:
        console.error("Nu s-a putut autentifica.");
        root.render(<div>Nu ești autentificat. Dă refresh.</div>);
      }

    }).catch((error: any) => {
      console.error("Eroare la inițializare Keycloak:", error);
      // 4. Afișăm eroarea pe ecran ca să o vezi
      root.render(
        <div style={{ color: 'red', padding: '20px' }}>
          <h1>Eroare critică Keycloak</h1>
          <p>Verifică consola (F12) pentru detalii tehnice.</p>
          <pre>{JSON.stringify(error, null, 2)}</pre>
        </div>
      );
    });
}