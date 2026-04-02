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

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean; setIsOpen: (val: boolean) => void }) => {
  const location = useLocation();

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
          className="fixed inset-0 bg-black/50 z-40 md:hidden" 
          onClick={() => setIsOpen(false)}
        />
      )}
      
      <aside className={cn(
        "fixed md:sticky top-0 left-0 h-screen w-64 bg-[#1a1a1a] text-white z-50 transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          <div className="p-6 flex items-center justify-between">
            <Link to="/admin/overview" className="flex items-center space-x-2">
              <ShieldCheck className="h-8 w-8 text-[#feba02]" />
              <span className="text-2xl font-bold tracking-tight">AdminPanel</span>
            </Link>
            <button className="md:hidden p-2" onClick={() => setIsOpen(false)}>
              <X className="h-6 w-6" />
            </button>
          </div>

          <nav className="flex-grow px-4 space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                  location.pathname === item.path 
                    ? "bg-[#333333] text-white shadow-sm" 
                    : "text-white/60 hover:bg-[#333333] hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-[#333333]">
            <Link 
              to="/admin/login" 
              className="flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-white/60 hover:bg-[#333333] hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
};

const Header = ({ setIsOpen }: { setIsOpen: (val: boolean) => void }) => {
  return (
    <header className="bg-white border-b border-gray-200 h-16 sticky top-0 z-30 flex items-center justify-between px-4 md:px-8">
      <div className="flex items-center">
        <button 
          className="md:hidden p-2 mr-2 text-gray-500" 
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
        <h1 className="text-xl font-bold text-gray-800 hidden md:block">Platform Administration</h1>
      </div>

      <div className="flex items-center space-x-4">
        <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full relative">
          <Bell className="h-6 w-6" />
          <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-800">Super Admin</p>
            <p className="text-xs text-gray-500">System Access: Root</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold">
            SA
          </div>
        </div>
      </div>
    </header>
  );
};

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-grow flex flex-col">
        <Header setIsOpen={setIsSidebarOpen} />
        <main className="p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
