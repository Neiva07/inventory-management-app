import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppSettings, UILayout, getAppSettings, setAppSettings } from '../model/appSettings';
import { useAuth } from './auth';

interface UIContextType {
  layout: UILayout;
  setLayout: (layout: UILayout) => void;
  loading: boolean;
}

const UIContext = createContext<UIContextType>({
  layout: 'navbar',
  setLayout: () => {},
  loading: false,
});

export const UIContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [layout, setLayoutState] = useState<UILayout>('navbar');
  const [loading, setLoading] = useState(false);

  // Load settings when user changes
  useEffect(() => {
    if (!user) return;
    setLoading(true);
    getAppSettings(user.id)
      .then((settings) => {
        if (settings && settings.layout) {
          setLayoutState(settings.layout);
        } else {
          setLayoutState('navbar');
        }
      })
      .finally(() => setLoading(false));
  }, [user]);

  // Update Firestore and local state
  const setLayout = (newLayout: UILayout) => {
    if (!user) return;
    setLayoutState(newLayout);
    setAppSettings({ user_id: user.id, layout: newLayout });
  };

  return (
    <UIContext.Provider value={{ layout, setLayout, loading }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext); 