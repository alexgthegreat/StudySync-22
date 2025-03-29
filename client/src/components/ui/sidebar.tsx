import React, { useState, useEffect } from "react";
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
  X,
  ChevronLeft,
  ChevronRight,
  Menu,
  Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onCollapseChange?: (collapsed: boolean) => void;
}

export function Sidebar({ mobileOpen, onCloseMobile, onCollapseChange }: SidebarProps) {
  const [location, setLocation] = useLocation();
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem('sidebarCollapsed');
    return savedState ? JSON.parse(savedState) : false;
  });
  
  // Save collapsed state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
  }, [collapsed]);
  
  // Notify parent component when collapse state changes
  const handleCollapseToggle = () => {
    const newCollapsed = !collapsed;
    setCollapsed(newCollapsed);
    if (onCollapseChange) {
      onCollapseChange(newCollapsed);
    }
  };

  // Auto-collapse on mobile/small screens
  useEffect(() => {
    if (isMobile && !collapsed) {
      setCollapsed(true);
      if (onCollapseChange) {
        onCollapseChange(true);
      }
    }
  }, [isMobile]);

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
    { name: 'Notifications', path: '/notifications', icon: <Bell className="w-5 h-5" /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar className="w-5 h-5" /> },
  ];

  // Close mobile sidebar after navigation
  const handleNavigation = (path: string) => {
    if (isMobile && mobileOpen) {
      onCloseMobile();
    }
    setLocation(path);
  };

  // Sidebar content
  const sidebarContent = (
    <>
      <div className={cn(
        "flex items-center justify-between", 
        collapsed ? "p-3" : "p-4",
        "border-b"
      )}>
        <div className={cn(
          "flex items-center", 
          collapsed ? "justify-center w-full" : "space-x-2"
        )}>
          <svg className="w-8 h-8 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .358.186.687.484.87l.635.396a2 2 0 001.866 0l.634-.396a1.04 1.04 0 00.484-.87l.002-1.07 2.328-.996a1 1 0 11.788 1.838l-2.328.996L12 9.586v-.001l3.606-1.543a1 1 0 000-1.84l-7-3A1 1 0 0010.394 2.08z" />
          </svg>
          {!collapsed && <h1 className="text-xl font-bold truncate">StudyCollab</h1>}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className={cn("flex-shrink-0", collapsed ? "ml-0" : "ml-2", isMobile ? "hidden" : "flex")}
          onClick={handleCollapseToggle}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <nav className={cn(
        "flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300", 
        collapsed ? "px-2 py-4" : "p-4"
      )}>
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <div
              key={item.path}
              className={cn(
                "flex items-center py-2 rounded-lg transition-colors cursor-pointer",
                collapsed ? "justify-center px-2" : "px-4",
                isActiveRoute(item.path)
                  ? "bg-primary text-primary-foreground font-medium"
                  : "hover:bg-accent hover:text-accent-foreground text-gray-700"
              )}
              title={collapsed ? item.name : undefined}
              onClick={() => handleNavigation(item.path)}
              role="button"
              tabIndex={0}
              aria-label={item.name}
            >
              <span className={cn("flex-shrink-0", collapsed ? "" : "mr-3")}>{item.icon}</span>
              {!collapsed && <span className="truncate">{item.name}</span>}
            </div>
          ))}
        </div>
      </nav>

      {!collapsed && (
        <div className="p-4 border-t shrink-0">
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
              onClick={() => handleNavigation('/groups')}
            >
              <Users className="mr-2 h-4 w-4" />
              <span className="truncate">Find Groups</span>
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside 
        className={cn(
          "hidden md:flex md:flex-col md:fixed md:inset-y-0 border-r bg-card transition-all duration-300 z-20",
          collapsed ? "md:w-16" : "md:w-64"
        )}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Sidebar Backdrop */}
      <div 
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-background/80 backdrop-blur-sm transition-opacity",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      {/* Mobile Sidebar (Drawer) */}
      <aside 
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-card shadow-lg flex flex-col transform transition-transform duration-300 ease-in-out",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex justify-end p-4 border-b">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onCloseMobile}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex flex-col flex-1 overflow-hidden">
          {sidebarContent}
        </div>
      </aside>
    </>
  );
}