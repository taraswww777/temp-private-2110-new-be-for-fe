import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext.tsx';
import { ProjectProvider } from '@/contexts/ProjectContext.tsx';
import type { PropsWithChildren } from 'react';

export const AppLoader = ({ children }: PropsWithChildren) => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <ProjectProvider>
          {children}
        </ProjectProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};
