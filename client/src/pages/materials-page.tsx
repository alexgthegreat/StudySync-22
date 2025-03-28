import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";

import { Sidebar } from "@/components/ui/sidebar";
import { Header } from "@/components/ui/header";
import { MaterialList } from "@/components/materials/material-list";
import { UploadDialog } from "@/components/materials/upload-dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, FileText, Search } from "lucide-react";

export default function MaterialsPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch all materials
  const { 
    data: materials, 
    isLoading: isLoadingMaterials 
  } = useQuery({
    queryKey: ["/api/materials"],
    enabled: !!user,
  });

  // Fetch user groups for upload dialog
  const { data: userGroups } = useQuery({
    queryKey: ["/api/groups/my-groups"],
    enabled: !!user,
  });

  // Filter materials based on search and active tab
  const filteredMaterials = materials?.filter(material => {
    const matchesSearch = !searchQuery || 
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description && material.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    if (activeTab === "all") {
      return matchesSearch;
    } else if (activeTab === "mine") {
      return matchesSearch && material.uploadedBy === user?.id;
    } else if (activeTab === "shared") {
      return matchesSearch && material.groupId;
    } else if (activeTab === "external") {
      return matchesSearch && ['quizlet', 'youtube', 'link'].includes(material.type);
    }
    
    return matchesSearch;
  }) || [];

  // Count different file types
  const fileTypeCounts = {
    pdf: materials?.filter(m => m.type === 'pdf').length || 0,
    doc: materials?.filter(m => ['doc', 'docx', 'word'].includes(m.type)).length || 0,
    ppt: materials?.filter(m => ['ppt', 'pptx', 'powerpoint'].includes(m.type)).length || 0,
    image: materials?.filter(m => ['image', 'jpg', 'jpeg', 'png'].includes(m.type)).length || 0,
    quizlet: materials?.filter(m => m.type === 'quizlet').length || 0,
    other: materials?.filter(m => !['pdf', 'doc', 'docx', 'word', 'ppt', 'pptx', 'powerpoint', 'image', 'jpg', 'jpeg', 'png', 'quizlet'].includes(m.type)).length || 0,
  };

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Already handled by state change
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar mobileOpen={mobileMenuOpen} onCloseMobile={() => setMobileMenuOpen(false)} />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header onMobileMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6">
          {/* Hero Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="md:flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Study Materials</h1>
                <p className="text-gray-500 mt-1">
                  Access, share, and discover study materials for your classes
                </p>
              </div>

              <div className="mt-4 md:mt-0">
                <Button 
                  onClick={() => setUploadDialogOpen(true)}
                  className="flex items-center"
                >
                  <i className="ri-upload-2-line mr-2"></i>
                  Upload Material
                </Button>
              </div>
            </div>

            <form onSubmit={handleSearch} className="mt-6">
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Search materials by name, description, or subject..."
                  className="pl-10 py-6"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-3 text-gray-400" />
              </div>
            </form>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Categories</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
                    <TabsList className="flex flex-col h-auto w-full rounded-none">
                      <TabsTrigger value="all" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-primary-600">
                        <i className="ri-file-list-line mr-2"></i>
                        All Materials
                        <Badge className="ml-auto bg-gray-100 text-gray-800 hover:bg-gray-100">
                          {materials?.length || 0}
                        </Badge>
                      </TabsTrigger>
                      <TabsTrigger value="mine" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-primary-600">
                        <i className="ri-user-line mr-2"></i>
                        My Uploads
                      </TabsTrigger>
                      <TabsTrigger value="shared" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-primary-600">
                        <i className="ri-team-line mr-2"></i>
                        Group Materials
                      </TabsTrigger>
                      <TabsTrigger value="external" className="justify-start rounded-none border-l-2 border-transparent data-[state=active]:border-primary-600">
                        <i className="ri-link mr-2"></i>
                        External Links
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>File Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <i className="ri-file-pdf-line text-red-500 mr-2"></i>
                      PDF Files
                    </span>
                    <Badge variant="outline">{fileTypeCounts.pdf}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <i className="ri-file-word-line text-blue-500 mr-2"></i>
                      Word Documents
                    </span>
                    <Badge variant="outline">{fileTypeCounts.doc}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <i className="ri-file-ppt-line text-orange-500 mr-2"></i>
                      Presentations
                    </span>
                    <Badge variant="outline">{fileTypeCounts.ppt}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <i className="ri-image-line text-purple-500 mr-2"></i>
                      Images
                    </span>
                    <Badge variant="outline">{fileTypeCounts.image}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <i className="ri-flashcard-line text-green-500 mr-2"></i>
                      Quizlet Links
                    </span>
                    <Badge variant="outline">{fileTypeCounts.quizlet}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center text-sm">
                      <i className="ri-file-line text-gray-500 mr-2"></i>
                      Other Files
                    </span>
                    <Badge variant="outline">{fileTypeCounts.other}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Content */}
            <div className="md:col-span-3">
              {isLoadingMaterials ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                </div>
              ) : filteredMaterials.length > 0 ? (
                <MaterialList 
                  materials={filteredMaterials}
                  onUploadClick={() => setUploadDialogOpen(true)}
                />
              ) : (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <FileText className="h-16 w-16 text-gray-300 mb-4" />
                    <h3 className="text-xl font-medium text-gray-700">No materials found</h3>
                    <p className="text-gray-500 mt-2 text-center max-w-md">
                      {searchQuery 
                        ? `No materials match your search query "${searchQuery}"`
                        : "There are no study materials available in this category yet."}
                    </p>
                    <Button 
                      onClick={() => setUploadDialogOpen(true)}
                      className="mt-4"
                    >
                      Upload New Material
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Upload Dialog */}
      <UploadDialog 
        open={uploadDialogOpen} 
        onClose={() => setUploadDialogOpen(false)}
        availableGroups={userGroups}
      />
    </div>
  );
}
