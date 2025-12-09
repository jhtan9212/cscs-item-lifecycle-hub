import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">
            Item Lifecycle Hub
          </h1>
          <div className="text-sm text-gray-500">
            CSCS Platform
          </div>
        </div>
      </div>
    </header>
  );
};

