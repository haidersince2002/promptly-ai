import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import { ThemeProvider, useTheme } from "./context/ThemeContext.jsx";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const ClerkWithTheme = ({ children }) => {
  const { darkMode } = useTheme();

  return (
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorBackground:      darkMode ? '#0f1117' : '#ffffff',
          colorInputBackground: darkMode ? '#1a1d2e' : '#f9fafb',
          colorText:            darkMode ? '#ffffff' : '#111827',
          colorTextSecondary:   darkMode ? '#a0aec0' : '#6b7280',
          colorPrimary:         '#7c3aed',
          colorNeutral:         darkMode ? '#1a1d2e' : '#f3f4f6',
          colorAlphaShade:      darkMode ? '#0f1117' : '#ffffff',
        },
        elements: {
          card:              { background: darkMode ? '#0f1117' : '#ffffff',
                               backgroundImage: 'none',
                               border: darkMode ? '1px solid #2d2f3e' : '1px solid #e5e7eb' },
          headerTitle:       { color: darkMode ? '#f1f5f9' : '#111827' },
          headerSubtitle:    { color: darkMode ? '#94a3b8' : '#6b7280' },
          socialButtonsBlockButton: { 
                               color: darkMode ? '#cbd5e1' : '#374151',
                               borderColor: darkMode ? '#334155' : '#d1d5db' },
          socialButtonsBlockButtonText: { color: darkMode ? '#cbd5e1' : '#374151' },
          dividerLine:       { background: darkMode ? '#334155' : '#e5e7eb' },
          dividerText:       { color: darkMode ? '#94a3b8' : '#6b7280' },
          formFieldLabel:    { color: darkMode ? '#e2e8f0' : '#111827' },
          formFieldInput:    { color: darkMode ? '#f1f5f9' : '#111827',
                               backgroundColor: darkMode ? '#1a1d2e' : '#f9fafb',
                               borderColor: darkMode ? '#334155' : '#d1d5db',
                               '&::placeholder': { color: darkMode ? '#64748b' : '#9ca3af' } },
          formButtonPrimary: { backgroundColor: '#7c3aed' },
          footerActionText:  { color: darkMode ? '#94a3b8' : '#6b7280' },
          footerActionLink:  { color: '#7c3aed' },
          footer:            { background: darkMode ? '#0f1117' : '#ffffff',
                               backgroundImage: 'none' },
          footerAction:      { background: darkMode ? '#0f1117' : '#ffffff',
                               backgroundImage: 'none' },
          footerPages:       { background: darkMode ? '#0f1117' : '#ffffff',
                               backgroundImage: 'none' },
          identityPreview:   { color: darkMode ? '#cbd5e1' : '#374151' },
          identityPreviewText: { color: darkMode ? '#cbd5e1' : '#374151' },
          formFieldAction:   { color: '#7c3aed' },
          alertText:         { color: darkMode ? '#cbd5e1' : '#374151' },
          modalCloseButton:  { color: darkMode ? '#94a3b8' : '#6b7280' },
          userButtonPopoverCard: { background: darkMode ? '#0f1117' : '#ffffff',
                               backgroundImage: 'none',
                               border: darkMode ? '1px solid #2d2f3e' : '1px solid #e5e7eb' },
          userButtonPopoverActionButton: { color: darkMode ? '#cbd5e1' : '#374151' },
          userButtonPopoverActionButtonText: { color: darkMode ? '#cbd5e1' : '#374151' },
          userButtonPopoverActionButtonIcon: { color: darkMode ? '#94a3b8' : '#6b7280' },
          userButtonPopoverFooter: { background: darkMode ? '#0f1117' : '#ffffff',
                               backgroundImage: 'none' },
          userPreviewMainIdentifier: { color: darkMode ? '#f1f5f9' : '#111827' },
          userPreviewSecondaryIdentifier: { color: darkMode ? '#94a3b8' : '#6b7280' },
        }
      }}
    >
      {children}
    </ClerkProvider>
  );
};

createRoot(document.getElementById("root")).render(
  <ThemeProvider>
    <ClerkWithTheme>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ClerkWithTheme>
  </ThemeProvider>
);
