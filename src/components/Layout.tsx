import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  Shirt, 
  Sparkles, 
  User as UserIcon, 
  LogOut, 
  Menu, 
  X,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Wardrobe', path: '/wardrobe', icon: Shirt },
    { name: 'Stylist', path: '/stylist', icon: Sparkles },
    { name: 'Shopping', path: '/shopping', icon: ShoppingBag },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen flex bg-beige-100">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-beige-200 p-6">
        <div className="mb-10">
          <Link to="/dashboard" className="text-2xl font-serif font-bold tracking-tighter">
            NEURO<span className="italic">WARDROBE</span>
          </Link>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-matte-black text-white shadow-lg'
                  : 'text-gray-500 hover:bg-beige-200 hover:text-matte-black'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="pt-6 border-t border-beige-200">
          <button
            onClick={() => {
              logout();
              navigate('/');
            }}
            className="flex items-center space-x-3 px-4 py-3 w-full text-gray-500 hover:text-red-500 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-md border-b border-beige-200 z-50 px-4 flex items-center justify-between">
        <Link to="/dashboard" className="text-xl font-serif font-bold tracking-tighter">
          NEURO<span className="italic">WARDROBE</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(true)}>
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="fixed inset-0 bg-white z-[60] p-6 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
              <span className="text-2xl font-serif font-bold tracking-tighter">NEURO</span>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <nav className="flex-1 space-y-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-4 px-6 py-4 rounded-2xl text-lg ${
                    location.pathname === item.path
                      ? 'bg-matte-black text-white'
                      : 'text-gray-500'
                  }`}
                >
                  <item.icon size={24} />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center space-x-4 px-6 py-4 text-red-500"
            >
              <LogOut size={24} />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 pt-16 md:pt-0 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 md:p-10">
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
