import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, Plus } from "lucide-react";
import { ReactNode } from "react";

interface TopBarProps {
  title: string;
  subtitle?: string;
  actionButton?: ReactNode;
}

export default function TopBar({ title, subtitle, actionButton }: TopBarProps) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          {subtitle && (
            <p className="text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-4">
          {actionButton}
          <div className="relative">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-600 relative">
              <Bell className="w-5 h-5" />
              <Badge 
                variant="destructive" 
                className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center text-xs"
              >
                3
              </Badge>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
