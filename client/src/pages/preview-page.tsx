import { useState } from "react";
import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { UserAvatar, GroupAvatar } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { ChevronRight, MessageCircle, FileText, Book, Users, Calendar } from "lucide-react";

export default function PreviewPage() {
  const [activeTab, setActiveTab] = useState<string>("groups");

  // Mock data for preview
  const groups = [
    { 
      id: 1, 
      name: "AP Biology Study Group", 
      description: "Preparing for the AP Bio exam together",
      membersCount: 24,
      isActive: true
    },
    { 
      id: 2, 
      name: "Math Competition Team", 
      description: "Practice for upcoming math competitions",
      membersCount: 18,
      isActive: true
    },
    { 
      id: 3, 
      name: "History Essay Workshop", 
      description: "Peer review for history essays",
      membersCount: 15,
      isActive: true
    }
  ];

  const materials = [
    {
      id: 1,
      name: "Cell Structure Notes.pdf",
      type: "PDF",
      subject: "Biology",
      uploadedAt: new Date(2025, 2, 25)
    },
    {
      id: 2,
      name: "Calculus Formulas.docx",
      type: "DOC",
      subject: "Math",
      uploadedAt: new Date(2025, 2, 24)
    },
    {
      id: 3,
      name: "French Revolution Timeline.png",
      type: "IMG",
      subject: "History",
      uploadedAt: new Date(2025, 2, 23)
    }
  ];

  const discussions = [
    {
      id: 1,
      title: "Help with Photosynthesis Problem",
      excerpt: "I'm having trouble understanding the light-dependent reactions...",
      author: "Emma S.",
      replies: 7,
      subject: "Biology"
    },
    {
      id: 2,
      title: "Integral Practice Questions",
      excerpt: "Does anyone have additional practice problems for integration by parts?",
      author: "Jayden K.",
      replies: 4,
      subject: "Math"
    }
  ];

  const exams = [
    {
      id: 1,
      title: "AP Biology Midterm",
      date: new Date(2025, 3, 15), // April 15, 2025
      location: "Room 203",
      subject: "Biology"
    },
    {
      id: 2,
      title: "Calculus Quiz",
      date: new Date(2025, 3, 10), // April 10, 2025
      location: "Room 156",
      subject: "Math"
    }
  ];

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with CTA */}
      <header className="bg-indigo-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">StudyCollab</h1>
            <p className="text-xl mb-8">
              Explore what Bethlehem Central students are using to collaborate
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth">
                <Button size="lg" className="bg-amber-400 text-indigo-900 hover:bg-amber-500">
                  Sign Up Now
                </Button>
              </Link>
              <Link href="/auth">
                <Button variant="outline" size="lg" className="border-white text-white hover:bg-indigo-800">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Preview content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-4 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Preview StudyCollab</h2>
              <Badge className="bg-amber-400 text-indigo-900 hover:bg-amber-400">Bethlehem Central Schools</Badge>
            </div>
            <p className="text-gray-600 mb-6">
              See how students at Bethlehem Central are using StudyCollab to study together, share resources, and succeed academically.
            </p>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-8">
                <TabsTrigger value="groups" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="hidden sm:inline">Study Groups</span>
                </TabsTrigger>
                <TabsTrigger value="materials" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className="hidden sm:inline">Materials</span>
                </TabsTrigger>
                <TabsTrigger value="discussions" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Discussions</span>
                </TabsTrigger>
                <TabsTrigger value="exams" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span className="hidden sm:inline">Upcoming Exams</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="groups" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Popular Study Groups</h3>
                  <div className="w-64">
                    <Input placeholder="Search groups..." className="h-9" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groups.map(group => (
                    <Card key={group.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <GroupAvatar />
                          {group.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-500">{group.description}</p>
                        <div className="flex items-center mt-3 text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-1" /> 
                          <span>{group.membersCount} members</span>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="secondary" size="sm" className="w-full" disabled>
                          Join (Sign up first)
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="materials" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Recently Shared Materials</h3>
                  <div className="w-64">
                    <Input placeholder="Search materials..." className="h-9" />
                  </div>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {materials.map(material => (
                        <li key={material.id} className="p-4 hover:bg-gray-50">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              {material.type === "PDF" && <FileText className="h-5 w-5 mr-3 text-red-500" />}
                              {material.type === "DOC" && <FileText className="h-5 w-5 mr-3 text-blue-500" />}
                              {material.type === "IMG" && <FileText className="h-5 w-5 mr-3 text-green-500" />}
                              <div>
                                <p className="font-medium">{material.name}</p>
                                <div className="flex items-center mt-1">
                                  <Badge variant="outline" className="mr-2 text-xs">{material.subject}</Badge>
                                  <span className="text-xs text-gray-500">{formatDate(material.uploadedAt)}</span>
                                </div>
                              </div>
                            </div>
                            <Button variant="ghost" size="sm" disabled>
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="discussions" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Active Discussions</h3>
                  <div className="w-64">
                    <Input placeholder="Search discussions..." className="h-9" />
                  </div>
                </div>
                <Card>
                  <CardContent className="p-0">
                    <ul className="divide-y">
                      {discussions.map(discussion => (
                        <li key={discussion.id} className="p-4 hover:bg-gray-50">
                          <div className="mb-2">
                            <div className="flex items-center justify-between">
                              <h4 className="font-medium">{discussion.title}</h4>
                              <Badge variant="outline" className="text-xs">{discussion.subject}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{discussion.excerpt}</p>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center">
                              <UserAvatar className="h-5 w-5 mr-2" />
                              <span className="text-gray-600">{discussion.author}</span>
                            </div>
                            <div className="flex items-center text-gray-500">
                              <MessageCircle className="h-4 w-4 mr-1" />
                              <span>{discussion.replies} replies</span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="exams" className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Upcoming Exams</h3>
                  <div className="w-64">
                    <Input placeholder="Search exams..." className="h-9" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  {exams.map(exam => (
                    <Card key={exam.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{exam.title}</CardTitle>
                          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{exam.subject}</Badge>
                        </div>
                        <CardDescription>
                          {formatDate(exam.date)} • {exam.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex gap-2 mt-2">
                          <Button variant="outline" size="sm" className="text-xs" disabled>
                            <Book className="h-3 w-3 mr-1" />
                            Study Materials
                          </Button>
                          <Button variant="outline" size="sm" className="text-xs" disabled>
                            <Users className="h-3 w-3 mr-1" />
                            Study Group
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="text-center py-8">
            <h2 className="text-2xl font-bold mb-4">Ready to join your classmates?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Create an account to join study groups, access shared materials, participate in discussions, and stay on top of your exam schedule.
            </p>
            <Link href="/auth">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 py-6 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-lg font-bold text-indigo-900">StudyCollab</h2>
              <p className="text-sm text-gray-600">A collaborative learning platform for students</p>
            </div>
            <div className="text-center md:text-right text-sm text-gray-600">
              <p>&copy; 2025 StudyCollab for Bethlehem Central Schools</p>
              <p>All users must follow school district technology policies</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}