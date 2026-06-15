import React from 'react';
import { createRoot } from 'react-dom/client';
import { createGlobalStyle, ThemeProvider } from 'styled-components';
import { styleReset } from 'react95';
import original from 'react95/dist/themes/original';
import w95fa from './fonts/w95fa.woff2';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// W95FA — a modern, antialiased re-creation of the Windows 95 system font
// (SIL Open Font License; see src/fonts/w95fa-OFL.txt). Far more legible than
// the original bitmap MS Sans Serif while keeping the period-correct look.
const GlobalStyles = createGlobalStyle`
  ${styleReset}
  @font-face {
    font-family: 'W95FA';
    src: url('${w95fa}') format('woff2');
    font-weight: normal;
    font-style: normal;
    font-display: swap;
  }
  html, body, #root { height: 100%; }
  body {
    font-family: 'W95FA', 'Tahoma', sans-serif;
    user-select: none;
  }
  /* Form controls don't inherit font-family by default — make react95's
     buttons, inputs and menus use the same face. */
  button, input, select, textarea {
    font-family: inherit;
  }
  /* Authentic Windows 95 cursors: the white arrow by default (cursor is an
     inherited property, so it propagates), the pointing hand on anything
     clickable, and the text I-beam in editable fields. */
  html, body {
    cursor: url('/cursors/arrow.png') 2 2, auto;
  }
  a, button, [role='button'], [role='menuitem'], li {
    /* !important to beat react95's own \`cursor: pointer\` class. */
    cursor: url('/cursors/pointer.png') 9 2, pointer !important;
  }
  input, textarea {
    cursor: text;
  }
`;

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <GlobalStyles />
      <ThemeProvider theme={original}>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
