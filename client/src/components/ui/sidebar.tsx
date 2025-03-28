import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  
  // Get user groups
  const { data: groups } = useQuery({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
  });

  useEffect(() => {
    // Close sidebar on location change for mobile
    onCloseMobile();
  }, [location, onCloseMobile]);

  // Calculate active states
  const isHome = location === "/";
  const isGroups = location.startsWith("/groups");
  const isMaterials = location === "/materials";
  const isForum = location === "/forum";
  const isChat = location.startsWith("/chat");

  const handleSignOut = () => {
    logoutMutation.mutate();
  };

  return (
    <div 
      className={cn(
        "fixed md:relative w-64 h-full bg-white shadow-md z-30 transition-transform duration-300",
        "flex flex-col",
        mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-4 border-b">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary-600" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .358.186.687.484.87l.635.396a2 2 0 001.866 0l.634-.396a1.04 1.04 0 00.484-.87l.002-1.07 2.328-.996a1 1 0 11.788 1.838l-2.328.996L12 9.586v-.001l3.606-1.543a1 1 0 000-1.84l-7-3A1 1 0 0010.394 2.08zM14 9.304V4a1 1 0 00-1-1h-2a1 1 0 00-1 1v1h-1a1 1 0 000 2h1v2.304l-.395.169a1 1 0 01.395 1.866l-2.132.912a1.78 1.78 0 01-1.736 0l-2.132-.912a1 1 0 01.395-1.866L4 9.304V8.866l1.327.569a1 1 0 00.341.066 1 1 0 00.341-.066l2.264-.972 2.264.972a1 1 0 00.341.066 1 1 0 00.341-.066L12 8.866v.438z" />
            </svg>
            <h1 className="text-xl font-bold text-primary-600">StudyCollab</h1>
          </div>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 text-lg font-semibold">
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : user.username.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-sm">{user.displayName || user.username}</p>
                <p className="text-xs text-gray-500">{user.school || "Student"}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto scrollbar-hide">
          <Link href="/">
            <a className={cn(
              "flex items-center p-2 rounded-lg font-medium",
              isHome 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-600 hover:bg-gray-100"
            )}>
              <i className="ri-home-line text-xl mr-3"></i>
              <span>Home</span>
            </a>
          </Link>
          
          <Link href="/groups">
            <a className={cn(
              "flex items-center p-2 rounded-lg font-medium",
              isGroups 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-600 hover:bg-gray-100"
            )}>
              <i className="ri-team-line text-xl mr-3"></i>
              <span>My Groups</span>
            </a>
          </Link>
          
          <Link href="/materials">
            <a className={cn(
              "flex items-center p-2 rounded-lg font-medium",
              isMaterials 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-600 hover:bg-gray-100"
            )}>
              <i className="ri-book-open-line text-xl mr-3"></i>
              <span>Study Materials</span>
            </a>
          </Link>
          
          <Link href="/forum">
            <a className={cn(
              "flex items-center p-2 rounded-lg font-medium",
              isForum 
                ? "bg-primary-50 text-primary-600" 
                : "text-gray-600 hover:bg-gray-100"
            )}>
              <i className="ri-question-answer-line text-xl mr-3"></i>
              <span>Q&A Forum</span>
            </a>
          </Link>
          
          <div className="pt-4 border-t mt-4">
            <p className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">My Classes</p>
            
            {groups?.map((group) => (
              <Link key={group.id} href={`/groups/${group.id}`}>
                <a className={cn(
                  "flex items-center p-2 mt-2 rounded-lg text-gray-600 hover:bg-gray-100",
                  location === `/groups/${group.id}` && "bg-gray-100"
                )}>
                  <span className="w-2 h-2 rounded-full bg-primary-500 mr-3"></span>
                  <span>{group.name}</span>
                </a>
              </Link>
            ))}
            
            {(!groups || groups.length === 0) && (
              <p className="text-xs text-gray-500 px-2 mt-2">No groups joined yet</p>
            )}
          </div>
        </nav>
        
        {/* Bottom Links */}
        <div className="p-4 border-t">
          <button 
            onClick={handleSignOut}
            className="flex w-full items-center p-2 rounded-lg text-gray-600 hover:bg-gray-100"
          >
            <i className="ri-logout-box-line text-xl mr-3"></i>
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
