import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

const PageContentFallback = () => (
  <div className="animate-pulse rounded-lg bg-secondary/50 h-48 min-h-[200px]" aria-hidden />
);

export const MainLayout = () => {
  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64">
        <Header />
        <main className="flex-1 p-4 lg:p-6">
          <Suspense fallback={<PageContentFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
};
