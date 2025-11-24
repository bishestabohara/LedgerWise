'use client';

import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export default function ThemeInitializer() {
  const { settings } = useApp();

  useEffect(() => {
    // Apply theme on mount and whenever it changes
    const theme = settings.theme || 'light';
    document.body.className = theme === 'dark' ? 'dark-theme' : '';
  }, [settings.theme]);

  return null; // This component doesn't render anything
}

