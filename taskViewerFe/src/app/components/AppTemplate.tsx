import type { FC, PropsWithChildren } from 'react';
import { AppTemplateHeader } from './AppTemplateHeader.tsx';

export const AppTemplate: FC<PropsWithChildren> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <AppTemplateHeader />
      </header>
      <main className="container mx-auto px-4 py-4">
        {children}
      </main>
    </div>
  );
}
