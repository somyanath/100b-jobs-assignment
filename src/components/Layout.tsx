import { NavLink, Outlet } from 'react-router-dom';

/**
 * Main layout component that wraps all pages
 * Provides consistent header and navigation structure
 */
const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with navigation */}
      <header className="bg-slate-800 text-white p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-6">
          <h1 className="text-xl font-bold text-center sm:text-left">
            APPLICANT SCREENING SYSTEM
          </h1>
          
          {/* Navigation menu */}
          <nav className="flex gap-4 justify-center sm:justify-end">
            <NavLink 
              to="/shortlist" 
              className={({ isActive }) => 
                isActive 
                  ? 'font-bold border-b-2 border-white pb-1 px-2' 
                  : 'hover:text-gray-300 transition-colors px-2 py-1 rounded hover:bg-slate-700'
              }
            >
              Team Builder
            </NavLink>
          </nav>
        </div>
      </header>

      {/* Main content area */}
      <main className="flex-grow p-4 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;