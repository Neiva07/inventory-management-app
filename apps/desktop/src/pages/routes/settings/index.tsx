import React, { useState } from 'react';
import { SlidersHorizontal, Building2, User } from 'lucide-react';

import { PreferencesPage } from './preferences/PreferencesPage';
import { OrganizationPage } from './organization/OrganizationPage';
import { ProfilePage } from './profile/ProfilePage';
import { Card, CardContent } from 'components/ui';

type TabKey = 'preferences' | 'organization' | 'profile';

const tabs: Array<{ key: TabKey; label: string; icon: React.ReactNode }> = [
  { key: 'preferences', label: 'Preferências', icon: <SlidersHorizontal className="h-4 w-4" /> },
  { key: 'organization', label: 'Organização', icon: <Building2 className="h-4 w-4" /> },
  { key: 'profile', label: 'Perfil', icon: <User className="h-4 w-4" /> },
];

export const SettingsRouter = () => {
  const [tabValue, setTabValue] = useState<TabKey>('preferences');

  return (
    <div className="mx-auto w-full max-w-6xl p-3">
      <h1 className="mb-4 text-3xl font-semibold">Configurações</h1>

      <Card>
        <CardContent className="p-4">
          <div className="mb-4 flex flex-wrap gap-2 border-b pb-3">
            {tabs.map((tab) => {
              const active = tab.key === tabValue;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setTabValue(tab.key)}
                  className={
                    active
                      ? 'inline-flex items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground'
                      : 'inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent'
                  }
                  aria-pressed={active}
                >
                  {tab.icon}
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="pt-2">
            {tabValue === 'preferences' && <PreferencesPage />}
            {tabValue === 'organization' && <OrganizationPage />}
            {tabValue === 'profile' && <ProfilePage />}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
