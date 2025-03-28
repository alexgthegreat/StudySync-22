import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages/home-page";
import AuthPage from "@/pages/auth-page";
import GroupPage from "@/pages/group-page";
import MaterialsPage from "@/pages/materials-page";
import ForumPage from "@/pages/forum-page";
import ChatPage from "@/pages/chat-page";
import PreviewPage from "@/pages/preview-page";
import { ProtectedRoute } from "./lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";

// Create a list of all groups to handle multiple entries
import { useState, useEffect, createContext, useContext } from "react";

function Router() {
  return (
    <Switch>
      <Route path="/preview" component={PreviewPage} />
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={HomePage} />
      <ProtectedRoute path="/groups/:id" component={GroupPage} />
      <ProtectedRoute path="/groups" component={() => <GroupsIndexPage />} />
      <ProtectedRoute path="/materials" component={MaterialsPage} />
      <ProtectedRoute path="/forum" component={ForumPage} />
      <ProtectedRoute path="/chat/:id" component={ChatPage} />
      <ProtectedRoute path="/chat" component={() => <ChatIndexPage />} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Placeholder components for index pages
function GroupsIndexPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Study Groups</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((id) => (
          <div key={id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Study Group {id}</h2>
            <p className="text-gray-600 mb-4">Group description goes here.</p>
            <Link href={`/groups/${id}`}>
              <a className="text-blue-600 hover:underline">View Group</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatIndexPage() {
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Your Chat Rooms</h1>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((id) => (
          <div key={id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <h2 className="text-xl font-semibold mb-2">Chat Room {id}</h2>
            <p className="text-gray-600 mb-4">Last message from 2 hours ago</p>
            <Link href={`/chat/${id}`}>
              <a className="text-blue-600 hover:underline">Join Chat</a>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
