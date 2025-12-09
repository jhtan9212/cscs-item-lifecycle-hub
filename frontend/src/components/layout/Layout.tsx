import type { FC, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Header } from './Header';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <nav className="mb-6">
          <div className="flex space-x-4">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg ${
                location.pathname === '/'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/projects"
              className={`px-4 py-2 rounded-lg ${
                location.pathname.startsWith('/projects')
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Projects
            </Link>
          </div>
        </nav>
        <main>{children}</main>
      </div>
    </div>
  );
};
