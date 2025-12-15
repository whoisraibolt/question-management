import React, { createContext, useContext } from 'react';

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {}, // função vazia pois não há toggle
});

export function ThemeProvider({ children }) {
  const theme = 'light'; // tema fixo

  // toggleTheme vazio, pois não há tema escuro
  const toggleTheme = () => {
    // opcional: pode deixar vazio ou lançar warning
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
