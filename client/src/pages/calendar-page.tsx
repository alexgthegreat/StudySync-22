import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Sidebar } from "@/components/ui/sidebar";
import { Calendar as CalendarIcon, Users, BookOpen, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { ExamCalendar } from "@/components/calendar/exam-calendar";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";

// Interface for exam event
interface ExamEvent {
  id: number;
  title: string;
  date: Date;
  description?: string;
  groupId?: number;
  groupName?: string;
  location?: string;
}

export default function CalendarPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<ExamEvent[]>([]);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const { user } = useAuth();

  // Query for user's groups
  const { data: userGroups = [] } = useQuery<any[]>({
    queryKey: ['/api/groups/my-groups'],
    enabled: !!user,
  });

  // Query for exams
  const { data: exams = [] } = useQuery<any[]>({
    queryKey: ['/api/exams'],
    enabled: !!user,
  });

  // Load events from exams data
  useEffect(() => {
    const allEvents: ExamEvent[] = [];

    // Add events from exams if available
    if (exams && exams.length > 0) {
      exams.forEach(exam => {
        if (exam.date) {
          allEvents.push({
            id: exam.id,
            title: exam.title || 'Untitled Exam',
            date: new Date(exam.date),
            description: exam.description,
            groupId: exam.groupId,
            groupName: exam.groupName,
            location: exam.location
          });
        }
      });
    }

    setEvents(allEvents);
  }, [exams, userGroups]);

  // Get events for selected date
  const selectedDateEvents = events.filter(event => 
    selectedDate && 
    event.date.getDate() === selectedDate.getDate() &&
    event.date.getMonth() === selectedDate.getMonth() &&
    event.date.getFullYear() === selectedDate.getFullYear()
  );

  // Mutation for adding a new exam event
  const addExamMutation = useMutation({
    mutationFn: async (examData: any) => {
      const response = await fetch('/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(examData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add exam');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['/api/exams'] });
    }
  });

  // Handle adding a new event
  const handleAddEvent = () => {
    if (selectedDate && newEventTitle) {
      // Create the new exam data
      const examData = {
        title: newEventTitle,
        date: selectedDate.toISOString(),
        description: newEventDesc,
        location: newEventLocation,
        userId: user?.id
      };
      
      // Submit to API
      addExamMutation.mutate(examData);
      
      // Reset form
      setNewEventTitle("");
      setNewEventDesc("");
      setNewEventLocation("");
      setIsAddEventOpen(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar 
        mobileOpen={mobileMenuOpen} 
        onCloseMobile={() => setMobileMenuOpen(false)}
        onCollapseChange={setSidebarCollapsed}
      />
      
      <div className={cn(
        "flex-1 flex flex-col relative transition-all duration-300",
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      )}>
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between p-4 border-b sticky top-0 bg-background z-10">
          <div className="flex items-center space-x-2">
            <svg className="w-8 h-8 text-primary flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838l-2.328.996.002 1.069c0 .358.186.687.484.87l.635.396a2 2 0 001.866 0l.634-.396a1.04 1.04 0 00.484-.87l.002-1.07 2.328-.996a1 1 0 11.788 1.838l-2.328.996L12 9.586v-.001l3.606-1.543a1 1 0 000-1.84l-7-3A1 1 0 0010.394 2.08z" />
            </svg>
            <h1 className="text-xl font-bold truncate">StudyCollab</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </header>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-3xl font-bold flex items-center">
                <CalendarIcon className="inline-block mr-3 h-8 w-8" />
                Academic Calendar
              </h1>
              <p className="text-gray-600 mt-2">
                Manage your exam schedule and study group events
              </p>
            </div>

            <Tabs defaultValue="calendar" className="w-full">
              <TabsList className="grid w-full md:w-auto grid-cols-2 mb-6">
                <TabsTrigger value="calendar">Calendar View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>
              
              <TabsContent value="calendar" className="space-y-6">
                <div className="grid md:grid-cols-[300px_1fr] gap-6">
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle>Calendar</CardTitle>
                        <CardDescription>Select a date to view events</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          className="border rounded-md"
                          // Highlight dates with events
                          modifiers={{
                            event: events.map(event => new Date(event.date))
                          }}
                          modifiersStyles={{
                            event: { 
                              fontWeight: "bold",
                              backgroundColor: "hsl(var(--primary) / 0.1)",
                              color: "hsl(var(--primary))", 
                              borderRadius: "0" 
                            }
                          }}
                        />
                      </CardContent>
                      <CardFooter>
                        <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
                          <DialogTrigger asChild>
                            <Button className="w-full">
                              <CalendarIcon className="w-4 h-4 mr-2" />
                              Add Event
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Add New Event</DialogTitle>
                              <DialogDescription>
                                Create a new event for {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'selected date'}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid gap-2">
                                <Label htmlFor="title">Event Title</Label>
                                <Input 
                                  id="title" 
                                  placeholder="Final Exam" 
                                  value={newEventTitle}
                                  onChange={(e) => setNewEventTitle(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Input 
                                  id="description" 
                                  placeholder="Chapters 1-10" 
                                  value={newEventDesc}
                                  onChange={(e) => setNewEventDesc(e.target.value)}
                                />
                              </div>
                              <div className="grid gap-2">
                                <Label htmlFor="location">Location</Label>
                                <Input 
                                  id="location" 
                                  placeholder="Room 101" 
                                  value={newEventLocation}
                                  onChange={(e) => setNewEventLocation(e.target.value)}
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsAddEventOpen(false)}>Cancel</Button>
                              <Button onClick={handleAddEvent}>Save Event</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardFooter>
                    </Card>
                    
                    {userGroups && userGroups.length > 0 && (
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle>Study Groups</CardTitle>
                          <CardDescription>Your group schedule</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="space-y-2">
                            {userGroups.map((group: any) => (
                              <li key={group.id} className="flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary" />
                                <span>{group.name}</span>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                  
                  <div>
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>
                          {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                        </CardTitle>
                        <CardDescription>
                          {selectedDateEvents.length === 0 
                            ? 'No events scheduled for this day' 
                            : `${selectedDateEvents.length} event${selectedDateEvents.length > 1 ? 's' : ''} scheduled`}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {selectedDateEvents.length === 0 ? (
                          <div className="text-center py-10">
                            <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
                            <h3 className="mt-4 text-lg font-medium">No events scheduled</h3>
                            <p className="mt-1 text-sm text-gray-500">
                              Select a different date or add a new event
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedDateEvents.map((event) => (
                              <div key={event.id} className="border border-border rounded-lg p-4">
                                <div className="flex items-start justify-between">
                                  <div>
                                    <h3 className="font-semibold text-lg">{event.title}</h3>
                                    <p className="text-sm text-gray-500">
                                      {event.location && (
                                        <span className="block">{event.location}</span>
                                      )}
                                      {event.groupName && (
                                        <span className="flex items-center mt-1">
                                          <Users className="mr-1 h-3 w-3" />
                                          {event.groupName}
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <span className="text-sm font-medium text-primary">
                                      {format(event.date, 'h:mm a')}
                                    </span>
                                  </div>
                                </div>
                                {event.description && (
                                  <p className="mt-3 text-sm">{event.description}</p>
                                )}
                                <div className="mt-4 flex justify-end space-x-2">
                                  <Button size="sm" variant="outline">Edit</Button>
                                  <Button size="sm" variant="default">
                                    <BookOpen className="mr-1 h-3 w-3" />
                                    Study Materials
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="list" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Upcoming Events</CardTitle>
                    <CardDescription>All your upcoming exams and study sessions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {events.length === 0 ? (
                      <div className="text-center py-10">
                        <CalendarIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <h3 className="mt-4 text-lg font-medium">No events scheduled</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Add your first event to get started
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Sort events by date (earliest first) */}
                        {[...events]
                          .sort((a, b) => a.date.getTime() - b.date.getTime())
                          .map((event) => (
                            <div key={event.id} className="border border-border rounded-lg p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-semibold text-lg">{event.title}</h3>
                                  <p className="text-sm text-gray-500">
                                    {event.location && (
                                      <span className="block">{event.location}</span>
                                    )}
                                    {event.groupName && (
                                      <span className="flex items-center mt-1">
                                        <Users className="mr-1 h-3 w-3" />
                                        {event.groupName}
                                      </span>
                                    )}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-sm font-medium text-primary">
                                    {format(event.date, 'MMM d, yyyy')}
                                  </span>
                                  <span className="block text-xs text-gray-500">
                                    {format(event.date, 'h:mm a')}
                                  </span>
                                </div>
                              </div>
                              {event.description && (
                                <p className="mt-3 text-sm">{event.description}</p>
                              )}
                              <div className="mt-4 flex justify-end space-x-2">
                                <Button size="sm" variant="outline">Edit</Button>
                                <Button size="sm" variant="default">
                                  <BookOpen className="mr-1 h-3 w-3" />
                                  Study Materials
                                </Button>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  );
}