import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  BarChart3, 
  Users, 
  Target, 
  Megaphone, 
  TrendingUp, 
  Brain,
  LogOut
} from "lucide-react";
import { Link, useLocation } from "wouter";

interface SidebarProps {
  currentView: string;
}

export default function Sidebar({ currentView }: SidebarProps) {
  const { user } = useAuth();
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, href: '/' },
    { id: 'customers', label: 'Customers', icon: Users, href: '/customers' },
    { id: 'segments', label: 'Segments', icon: Target, href: '/segments' },
    { id: 'campaigns', label: 'Campaigns', icon: Megaphone, href: '/campaigns' },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp, href: '/analytics' },
    { id: 'ai-insights', label: 'AI Insights', icon: Brain, href: '/ai-insights' },
  ];

  return (
    <div className="w-64 bg-white shadow-lg flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Xeno CRM</h1>
            <p className="text-sm text-gray-500">Campaign Manager</p>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || location === item.href;
            
            return (
              <li key={item.id}>
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start gap-3 transition-colors ${
                      isActive 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Button>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3 px-4 py-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={user?.profileImageUrl || ''} alt={user?.firstName || 'User'} />
            <AvatarFallback>
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="font-medium text-gray-800">
              {user?.firstName && user?.lastName 
                ? `${user.firstName} ${user.lastName}`
                : user?.email || 'User'
              }
            </p>
            <p className="text-sm text-gray-500">Admin</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-gray-400 hover:text-gray-600"
          >
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
