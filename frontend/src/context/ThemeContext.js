// File: frontend/src/context/ThemeContext.js

import React, { createContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export default ThemeContext;

export const ThemeProvider = ({ children }) => {
    // 1. State to hold the current theme. We'll get the initial theme from localStorage or default to 'light'.
    const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

    // 2. useEffect to apply the theme to the root <html> element
    useEffect(() => {
        // This is the official Bootstrap 5 way to switch themes.
        document.documentElement.setAttribute('data-bs-theme', theme);
        // Save the user's preference in localStorage.
        localStorage.setItem('theme', theme);
    }, [theme]);

    // 3. Function to toggle the theme
    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };

    // 4. Provide the theme and the toggle function to the rest of the app
    const contextData = {
        theme: theme,
        toggleTheme: toggleTheme,
    };

    return (
        <ThemeContext.Provider value={contextData}>
            {children}
        </ThemeContext.Provider>
    );
};