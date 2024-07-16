import React, {createContext, useContext, ReactNode} from 'react';
import {darkTheme} from '@theme/theme';

type ThemeType = typeof darkTheme;

interface ThemeContextType {
  theme: ThemeType;
  //   toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({children}: {children: ReactNode}) => {
  //   const [theme, setTheme] = useState<ThemeType>(darkTheme);

  //   const toggleTheme = () => {
  //     // Logic to toggle theme, if you have more themes in the future
  //     // setTheme(prevTheme => (prevTheme === darkTheme ? lightTheme : darkTheme));
  //   };

  return (
    <ThemeContext.Provider value={{theme: darkTheme}}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
