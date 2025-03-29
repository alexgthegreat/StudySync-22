import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Link, useLocation } from "wouter";
import { Material, Group, Exam } from "@shared/schema";

import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { StatsCard, UserAvatarGroup, FileTypeCounts } from "@/components/dashboard/stats-card";
import { ActivityCard } from "@/components/dashboard/activity-card";
import { GroupList } from "@/components/groups/group-list";
import { CreateGroupDialog } from "@/components/groups/create-group-dialog";
import { MaterialList } from "@/components/materials/material-list";
import { UploadDialog } from "@/components/materials/upload-dialog";
import { ExamCard, AddExamCard } from "@/components/dashboard/exam-card";
import { Button } from "@/components/ui/button";

export default function HomePage() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createGroupOpen, setCreateGroupOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  // Fetch user groups for avatar display and member counts
  const { data: userGroups = [] } = useQuery<Group[]>({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
  });

  // Fetch recent study materials
  const { data: recentMaterials = [] } = useQuery<Material[]>({
    queryKey: ["/api/materials/recent"],
    enabled: !!user,
  });

  // Fetch upcoming exams
  const { data: upcomingExams = [] } = useQuery<Exam[]>({
    queryKey: ["/api/exams/upcoming"],
    enabled: !!user,
  });

  // Process file type counts for the stats card
  const fileTypeCounts = {
    pdfs: recentMaterials?.filter(m => m.type === 'pdf').length || 0,
    docs: recentMaterials?.filter(m => ['doc', 'docx', 'word'].includes(m.type)).length || 0,
    images: recentMaterials?.filter(m => ['image', 'jpg', 'jpeg', 'png'].includes(m.type)).length || 0,
  };

  // Convert recent materials to activity format
  const recentActivities = recentMaterials?.slice(0, 4).map(material => ({
    type: 'file' as const,
    title: `New study guide uploaded`,
    description: material.name,
    timestamp: material.uploadedAt ? new Date(material.uploadedAt) : new Date(),
    subject: material.subject || undefined,
    subjectColor: 'primary' as const
  })) || [];

  // State to track if sidebar is collapsed
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)}
        onCollapseChange={(collapsed: boolean) => setSidebarCollapsed(collapsed)}
      />

      <div 
        className={`flex-1 flex flex-col h-full overflow-hidden transition-all duration-300 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        }`}
      >
        <Header onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-xl shadow-lg overflow-hidden mb-6">
            <div className="md:flex items-center">
              <div className="p-6 md:w-3/5">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  Welcome back, {user?.displayName || user?.username}!
                </h1>
                <p className="text-gray-700 mb-4">
                  Continue collaborating with your classmates and boost your academic performance.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Button 
                    className="bg-white text-primary-600 hover:bg-primary-50 transition-colors flex items-center"
                    onClick={() => setCreateGroupOpen(true)}
                  >
                    <i className="ri-add-circle-line mr-2"></i>
                    Create Study Group
                  </Button>
                  <Button 
                    className="bg-primary-700 text-white hover:bg-primary-800 transition-colors flex items-center"
                    onClick={() => setLocation("/groups")}
                  >
                    <i className="ri-search-line mr-2"></i>
                    Browse Groups
                  </Button>
                </div>
              </div>
              <div className="hidden md:block md:w-2/5">
                <div className="h-48 w-full bg-primary-700 flex items-center justify-center">
                  <svg className="w-32 h-32 text-primary-300 opacity-50" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .358.186.687.484.87l.635.396a2 2 0 001.866 0l.634-.396a1.04 1.04 0 00.484-.87l.002-1.07 2.328-.996a1 1 0 11.788 1.838l-2.328.996L12 9.586v-.001l3.606-1.543a1 1 0 000-1.84l-7-3A1 1 0 0010.394 2.08z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <StatsCard
              title="Active Groups"
              value={userGroups?.length || 0}
              badgeText={userGroups?.length ? "+2 New" : undefined}
              badgeColor="primary"
            >
              {userGroups && userGroups.length > 0 && (
                <UserAvatarGroup
                  users={userGroups.map(g => ({
                    id: g.id,
                    displayName: g.name,
                    username: g.name
                  }))}
                />
              )}
            </StatsCard>

            <StatsCard
              title="Study Materials"
              value={recentMaterials?.length || 0}
              badgeText={recentMaterials?.length ? "+3 New" : undefined}
              badgeColor="secondary"
            >
              <FileTypeCounts 
                pdfs={fileTypeCounts.pdfs} 
                docs={fileTypeCounts.docs} 
                images={fileTypeCounts.images} 
              />
            </StatsCard>

            <StatsCard
              title="Upcoming Exams"
              value={upcomingExams?.length || 0}
              badgeText={upcomingExams?.length ? `${upcomingExams.length} This Week` : undefined}
              badgeColor="red"
              actionText="View Schedule"
              onActionClick={() => setLocation("/exams")}
            />
          </div>

          {/* Recent Activity and Popular Groups */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Recent Activity */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Recent Activity</h2>
                <button className="text-sm text-gray-500 hover:text-gray-700">See all</button>
              </div>

              <div className="space-y-4">
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <ActivityCard 
                      key={index}
                      type={activity.type}
                      title={activity.title}
                      description={activity.description}
                      timestamp={activity.timestamp}
                      subject={activity.subject}
                      subjectColor={activity.subjectColor}
                      onViewClick={() => {/* Navigate to material view */}}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-700 dark:text-gray-300">
                    No recent activity. Start collaborating with your classmates!
                  </div>
                )}
              </div>
            </div>

            {/* Popular Groups */}
            <GroupList 
              limit={3}
              onCreateClick={() => setCreateGroupOpen(true)}
            />
          </div>

          {/* Study Materials and Upcoming Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Study Materials */}
            <div className="lg:col-span-2">
              <MaterialList 
                materials={recentMaterials.map(m => ({
                  ...m,
                  uploadedAt: m.uploadedAt || new Date(),
                  subject: m.subject || undefined,
                  uploader: {
                    id: m.uploadedBy,
                    username: "User"
                  }
                }))}
                onUploadClick={() => setUploadDialogOpen(true)}
              />
            </div>

            {/* Upcoming Exams */}
            <div className="bg-white rounded-xl shadow-sm p-5">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold">Upcoming Exams</h2>
                <button className="text-sm text-gray-500 hover:text-gray-700">View Calendar</button>
              </div>

              <div className="space-y-4">
                {upcomingExams && upcomingExams.length > 0 ? (
                  upcomingExams.map(exam => (
                    <ExamCard
                      key={exam.id}
                      title={exam.title}
                      description={exam.description || ""}
                      date={new Date(exam.date)}
                      location={exam.location || undefined}
                      subject={exam.subject || "General"}
                      onJoinStudyGroup={() => {/* Navigate to study group */}}
                      onFindFlashcards={() => {/* Navigate to flashcards */}}
                    />
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-700 dark:text-gray-300">
                    No upcoming exams. Add an exam to keep track of important dates.
                  </div>
                )}

                <AddExamCard onClick={() => {/* Open add exam modal */}} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Dialogs */}
      <CreateGroupDialog 
        open={createGroupOpen} 
        onClose={() => setCreateGroupOpen(false)} 
      />

      <UploadDialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        availableGroups={userGroups}
      />
    </div>
  );
}