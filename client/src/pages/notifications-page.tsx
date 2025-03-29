import { NotificationList } from "@/components/notifications/notification-list";
import { Sidebar } from "@/components/ui/sidebar";
import { useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationsPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background">
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />
      
      <div className={`flex-1 flex flex-col ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Mobile header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .358.186.687.484.87l.635.396a2 2 0 001.866 0l.634-.396a1.04 1.04 0 00.484-.87l.002-1.07 2.328-.996a1 1 0 11.788 1.838l-2.328.996L12 9.586v-.001l3.606-1.543a1 1 0 000-1.84l-7-3A1 1 0 0010.394 2.08z" />
            </svg>
            <h1 className="text-xl font-bold">StudyCollab</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span className="sr-only">Open menu</span>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </Button>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold flex items-center">
                <Bell className="inline-block mr-3 h-8 w-8" />
                Notifications
              </h1>
              <p className="text-gray-600 mt-2">
                Stay updated with the latest activities from your study groups
              </p>
            </div>

            <div className="grid gap-8">
              <NotificationList />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}