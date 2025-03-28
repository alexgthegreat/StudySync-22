import { useState, useRef, useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface HeaderProps {
  onMobileMenuClick: () => void;
}

export function Header({ onMobileMenuClick }: HeaderProps) {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-6">
      <div className="flex items-center">
        <button 
          onClick={onMobileMenuClick}
          className="md:hidden mr-2 text-gray-600"
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
        
        <form onSubmit={handleSearch} className="relative w-64">
          <input 
            type="text" 
            placeholder="Search anything..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <i className="ri-search-line absolute left-3 top-2.5 text-gray-400"></i>
        </form>
      </div>
      
      <div className="flex items-center space-x-4">
        <Link href="/notifications">
          <a className="relative p-1 rounded-full text-gray-600 hover:bg-gray-100">
            <i className="ri-notification-3-line text-xl"></i>
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
          </a>
        </Link>
        
        <Link href="/messages">
          <a className="relative p-1 rounded-full text-gray-600 hover:bg-gray-100">
            <i className="ri-message-3-line text-xl"></i>
          </a>
        </Link>
        
        {user && (
          <div className="relative p-1 rounded-full text-gray-600 hover:bg-gray-100">
            <i className="ri-add-circle-line text-xl"></i>
          </div>
        )}
      </div>
    </header>
  );
}
