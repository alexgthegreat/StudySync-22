import React from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { 
  Home, 
  Users, 
  FileText, 
  MessageSquare, 
  BookOpen, 
  Calendar, 
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const isActiveRoute = (route: string) => {
    if (route === '/' && location === '/') return true;
    if (route !== '/' && location.startsWith(route)) return true;
    return false;
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <Home className="w-5 h-5" /> },
    { name: 'Study Groups', path: '/groups', icon: <Users className="w-5 h-5" /> },
    { name: 'Materials', path: '/materials', icon: <FileText className="w-5 h-5" /> },
    { name: 'Forum', path: '/forum', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Chat', path: '/chat', icon: <MessageSquare className="w-5 h-5" /> },
    { name: 'Exams', path: '/exams', icon: <Calendar className="w-5 h-5" /> },
  ];

  // Sidebar content
  const sidebarContent = (
    <>
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .358.186.687.484.87l.635.396a2 2 0 001.866 0l.634-.396a1.04 1.04 0 00.484-.87l.002-1.07 2.328-.996a1 1 0 11.788 1.838l-2.328.996L12 9.586v-.001l3.606-1.543a1 1 0 000-1.84l-7-3A1 1 0 0010.394 2.08z" />
          </svg>
          <h1 className="text-xl font-bold">StudyCollab</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}>
            <a
              className={cn(
                "flex items-center py-2 px-4 rounded-lg transition-colors",
                isActiveRoute(item.path)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-accent hover:text-accent-foreground text-gray-700"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t">
        <div className="flex items-center justify-between p-2">
          <span className="text-sm font-medium">Theme</span>
          <ThemeSwitcher />
        </div>
        
        <div className="mt-4 bg-accent/20 rounded-lg p-4">
          <h3 className="font-medium text-sm mb-2">Studying for exams?</h3>
          <p className="text-xs text-gray-600 mb-3">
            Create a study group to collaborate with classmates.
          </p>
          <Button
            variant="default"
            size="sm"
            className="w-full"
            onClick={() => {
              window.location.href = '/groups';
            }}
          >
            <Users className="mr-2 h-4 w-4" />
            Find Groups
          </Button>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-card">
        <div className="flex flex-col h-full">
          {sidebarContent}
        </div>
      </div>

      {/* Mobile Sidebar (Drawer) */}
      <div 
        className={`md:hidden fixed inset-0 z-50 bg-background/80 backdrop-blur-sm ${mobileOpen ? 'flex' : 'hidden'}`}
        onClick={onCloseMobile}
      >
        <div 
          className="fixed inset-y-0 left-0 w-72 bg-card shadow-lg flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end p-4">
            <Button variant="ghost" size="icon" onClick={onCloseMobile}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          {sidebarContent}
        </div>
      </div>
    </>
  );
}