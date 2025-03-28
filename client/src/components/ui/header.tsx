import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Menu, Search, Bell, MessageSquare, Plus, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user, logoutMutation } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Searching for:", searchQuery);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <header className="bg-card border-b h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <Button 
          onClick={onMobileMenuClick}
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
        >
          <Menu className="h-5 w-5" />
        </Button>
        
        <form onSubmit={handleSearch} className="relative w-full md:w-64">
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
        </form>
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative" asChild>
          <Link href="/notifications">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500"></span>
          </Link>
        </Button>
        
        {/* Messages */}
        <Button variant="ghost" size="icon" asChild>
          <Link href="/chat">
            <MessageSquare className="h-5 w-5" />
          </Link>
        </Button>
        
        {/* Quick Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <Plus className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>
              <Link href="/groups" className="flex items-center">
                Create Study Group
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/materials" className="flex items-center">
                Upload Material
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Link href="/forum" className="flex items-center">
                Post Question
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Avatar className="h-8 w-8">
                <AvatarFallback>
                  {user?.displayName ? getInitials(user.displayName) : user?.username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                <p className="font-medium">{user?.displayName || user?.username}</p>
                <p className="w-[200px] truncate text-sm text-muted-foreground">
                  @{user?.username}
                </p>
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
