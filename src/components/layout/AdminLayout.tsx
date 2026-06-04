import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Store, 
  ClipboardList, 
  Layers, 
  DollarSign, 
  Tag, 
  FileText, 
  Star, 
  LifeBuoy, 
  CreditCard, 
  PieChart, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck,
  Bell
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../NotificationBell';

function getAdminUser() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      localStorage.removeItem('token');
      return null;
    }
    if (payload.role !== 'admin') return null;
    return { id: payload.sub || payload.id, email: payload.email, role: payload.role, full_name: payload.full_name || 'Super Admin' };
  } catch {
    return null;
  }
}

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();
  
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!getAdminUser();
  };

  const menuItems = [
    { name: 'Overview', icon: LayoutDashboard, path: '/admin/overview' },
    { name: 'Users', icon: Users, path: '/admin/users' },
    { name: 'Vendors', icon: Store, path: '/admin/vendors' },
    { name: 'Bookings', icon: ClipboardList, path: '/admin/bookings' },
    { name: 'Categories', icon: Layers, path: '/admin/categories' },
    { name: 'Pricing', icon: DollarSign, path: '/admin/pricing' },
    { name: 'Promotions', icon: Tag, path: '/admin/promotions' },
    { name: 'CMS', icon: FileText, path: '/admin/cms' },
    { name: 'Reviews', icon: Star, path: '/admin/reviews' },
    { name: 'Support', icon: LifeBuoy, path: '/admin/support' },
    { name: 'Payments', icon: CreditCard, path: '/admin/payments' },
    { name: 'Analytics', icon: PieChart, path: '/admin/analytics' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-64 bg-[#003580] border-r border-blue-900 text-white z-50 transition-transform duration-300 ease-in-out md:translate-x-0 rounded-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/admin/overview" className="flex items-center space-x-2 group">
              <ShieldCheck className="h-5 w-5 text-blue-200" />
              <span className="text-lg font-black tracking-tight text-white">AdminPanel</span>
            </Link>
            <button className="md:hidden p-2 rounded-none hover:bg-blue-900 text-blue-100 hover:text-white" onClick={() => setIsOpen(false)}>
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex-grow px-3 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2 rounded-none text-[10px] font-bold uppercase tracking-wider transition-all border border-transparent",
                    isActive 
                      ? "bg-blue-950 text-white border-l-2 border-blue-400" 
                      : "text-blue-100 hover:bg-blue-800/40 hover:text-white"
                  )}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="h-3.5 w-3.5 text-blue-300" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-blue-900">
            {isAuthenticated() ? (
              <button 
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  window.location.href = '/admin/login';
                }}
                className="flex items-center space-x-3 w-full px-3 py-2 rounded-none text-[10px] font-bold uppercase tracking-wider text-red-200 hover:text-white bg-red-950/40 border border-red-900/50 hover:bg-red-900/50 transition-all"
              >
                <LogOut className="h-3.5 w-3.5 text-red-300" />
                <span>Log Out</span>
              </button>
            ) : (
              <Link 
                to="/admin/login" 
                className="flex items-center space-x-3 px-3 py-2 rounded-none text-[10px] font-bold uppercase tracking-wider text-blue-100 hover:bg-blue-800/40 hover:text-white transition-all border border-transparent"
              >
                <LogOut className="h-3.5 w-3.5 text-blue-300" />
                <span>Log Out</span>
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!getAdminUser();
  };

  const user = getAdminUser();

  return (
    <header className="bg-[#003580] border-b border-blue-900 h-16 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 text-white">
      <div className="flex items-center">
        <button 
          className="md:hidden p-2 mr-2 rounded-none text-blue-100 hover:text-white hover:bg-blue-900" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        {isAuthenticated() ? (
          <h1 className="text-sm font-bold uppercase tracking-wider text-white hidden md:block">System Administration</h1>
        ) : (
          <Link to="/admin/login" className="text-sm font-bold uppercase tracking-wider text-white hidden md:block">
            AdminPanel
          </Link>
        )}
      </div>

      <div className="flex items-center space-x-4">
        {isAuthenticated() && (
          <NotificationBell userId={user?.id || 'admin-1'} role="admin" />
        )}
        {isAuthenticated() ? (
          <div className="flex items-center space-x-3 border-l pl-4 border-blue-900">
            <div className="text-right hidden sm:block">
              <p className="text-[10px] font-bold uppercase tracking-wider text-white">{user?.full_name || 'Super Admin'}</p>
              <p className="text-[9px] text-blue-200 font-bold uppercase tracking-widest">Access: Root</p>
            </div>
            <div className="h-9 w-9 rounded-none bg-blue-900/60 text-blue-200 border border-blue-800/60 flex items-center justify-center font-bold text-xs">
              {user?.full_name ? user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : 'SA'}
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-3 border-l pl-4 border-blue-900">
            <Link to="/admin/login" className="bg-white hover:bg-blue-50 text-[#003580] px-3.5 py-1.5 rounded-none text-[10px] font-extrabold uppercase tracking-wider transition-all">
              Sign in
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="admin-portal flex min-h-screen bg-slate-50 text-slate-900 font-sans">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-grow flex flex-col">
        <Header setIsOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-8 flex-grow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

