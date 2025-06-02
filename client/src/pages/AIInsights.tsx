import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import MessageSuggestions from "@/components/AI/MessageSuggestions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Clock,
  Users,
  Lightbulb,
  TrendingUp,
  Calendar,
  MessageSquare,
  Target,
  Zap
} from "lucide-react";

export default function AIInsights() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [selectedSourceSegment, setSelectedSourceSegment] = useState("");
  const [lookalikeResults, setLookalikeResults] = useState(null);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: segments } = useQuery({
    queryKey: ["/api/segments"],
    retry: false,
  });

  const generateLookalikeMutation = useMutation({
    mutationFn: async (sourceSegmentId: string) => {
      const response = await apiRequest("POST", "/api/ai/lookalike-audience", { sourceSegmentId });
      return response.json();
    },
    onSuccess: (data) => {
      setLookalikeResults(data);
      toast({
        title: "Success",
        description: "Lookalike audience generated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to generate lookalike audience. Please try again.",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading AI insights...</p>
          </div>
        </div>
      </div>
    );
  }

  // Mock engagement heatmap data - in real app this would come from analytics
  const engagementHeatmap = [
    { day: 'Mon', engagement: 0.7 },
    { day: 'Tue', engagement: 0.9 },
    { day: 'Wed', engagement: 0.8 },
    { day: 'Thu', engagement: 0.75 },
    { day: 'Fri', engagement: 0.6 },
    { day: 'Sat', engagement: 0.95 },
    { day: 'Sun', engagement: 0.8 },
  ];

  const getHeatmapColor = (engagement: number) => {
    if (engagement < 0.3) return 'bg-blue-200';
    if (engagement < 0.5) return 'bg-blue-300';
    if (engagement < 0.7) return 'bg-blue-400';
    if (engagement < 0.9) return 'bg-blue-500';
    return 'bg-blue-600';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView="ai-insights" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="AI Insights" 
          subtitle="Leverage artificial intelligence to optimize your customer engagement"
        />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* AI Features Overview */}
          <Card className="bg-gradient-to-br from-purple-600 to-indigo-700 text-white">
            <CardContent className="p-8">
              <h2 className="text-3xl font-bold mb-4 flex items-center">
                <Brain className="w-8 h-8 mr-3" />
                AI-Powered CRM Intelligence
              </h2>
              <p className="text-lg opacity-90 mb-6">
                Leverage artificial intelligence to optimize your customer engagement and campaign performance.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white/20 rounded-lg p-4">
                  <MessageSquare className="w-8 h-8 mb-2" />
                  <h4 className="font-semibold">Smart Messaging</h4>
                  <p className="text-sm opacity-80">AI-generated personalized messages</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <TrendingUp className="w-8 h-8 mb-2" />
                  <h4 className="font-semibold">Predictive Analytics</h4>
                  <p className="text-sm opacity-80">Forecast customer behavior patterns</p>
                </div>
                <div className="bg-white/20 rounded-lg p-4">
                  <Users className="w-8 h-8 mb-2" />
                  <h4 className="font-semibold">Lookalike Audiences</h4>
                  <p className="text-sm opacity-80">Find similar high-value customers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Message Suggestions */}
            <MessageSuggestions />

            {/* Smart Scheduling */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 text-blue-600 mr-2" />
                  Smart Scheduling
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h5 className="font-medium text-gray-800 mb-2 flex items-center">
                    <Lightbulb className="w-5 h-5 text-blue-600 mr-2" />
                    AI Recommendation
                  </h5>
                  <p className="text-gray-600 text-sm">
                    Based on your audience engagement patterns, we recommend sending campaigns on{' '}
                    <strong>Tuesday at 2:00 PM</strong> for optimal delivery rates.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">94.2%</div>
                    <div className="text-sm text-gray-500">Predicted Success Rate</div>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">2:00 PM</div>
                    <div className="text-sm text-gray-500">Optimal Time</div>
                  </div>
                </div>
                
                {/* Engagement Heatmap */}
                <div>
                  <h6 className="font-medium text-gray-800 mb-3">Weekly Engagement Heatmap</h6>
                  <div className="grid grid-cols-7 gap-1">
                    {engagementHeatmap.map((day) => (
                      <div key={day.day} className="text-center">
                        <div className="text-xs font-medium text-gray-500 p-1 mb-1">
                          {day.day}
                        </div>
                        <div 
                          className={`h-6 rounded ${getHeatmapColor(day.engagement)}`}
                          title={`${day.day}: ${(day.engagement * 100).toFixed(0)}% engagement`}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Low engagement</span>
                    <span>High engagement</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lookalike Audience Generator */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                Lookalike Audience Generator
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">Source Audience</h5>
                  <Select 
                    value={selectedSourceSegment} 
                    onValueChange={setSelectedSourceSegment}
                  >
                    <SelectTrigger className="mb-4">
                      <SelectValue placeholder="Select a segment to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {segments?.map((segment) => (
                        <SelectItem key={segment.id} value={segment.id.toString()}>
                          {segment.name} ({segment.audienceSize} customers)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    onClick={() => selectedSourceSegment && generateLookalikeMutation.mutate(selectedSourceSegment)}
                    disabled={!selectedSourceSegment || generateLookalikeMutation.isPending}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    {generateLookalikeMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Find Similar Customers
                      </>
                    )}
                  </Button>
                </div>
                
                <div>
                  <h5 className="font-medium text-gray-800 mb-3">Generated Audience Insights</h5>
                  {lookalikeResults ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Similarity Score</span>
                          <span className="text-lg font-bold text-green-600">87%</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Audience Size</span>
                          <span className="text-lg font-bold text-gray-800">1,423</span>
                        </div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-700">Avg. Potential Value</span>
                          <span className="text-lg font-bold text-gray-800">
                            ₹{lookalikeResults.characteristics?.avgSpent?.toLocaleString() || '12,850'}
                          </span>
                        </div>
                      </div>
                      
                      <Button className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                        <Target className="w-4 h-4 mr-2" />
                        Create Segment
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p>Select a source segment and click "Find Similar Customers" to generate lookalike audience insights.</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Performance Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Brain className="w-5 h-5 text-purple-600 mr-2" />
                AI Performance Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Calendar className="w-4 h-4 text-purple-600 mr-2" />
                    Timing Optimization
                  </h6>
                  <p className="text-sm text-gray-600">
                    Send campaigns during peak engagement hours (2-4 PM) for 23% better delivery rates.
                  </p>
                </div>
                
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <MessageSquare className="w-4 h-4 text-blue-600 mr-2" />
                    Message Personalization
                  </h6>
                  <p className="text-sm text-gray-600">
                    Personalized messages with customer names show 34% higher engagement rates.
                  </p>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h6 className="font-semibold text-gray-800 mb-2 flex items-center">
                    <Target className="w-4 h-4 text-green-600 mr-2" />
                    Segment Targeting
                  </h6>
                  <p className="text-sm text-gray-600">
                    Smaller, well-defined segments (500-2000 customers) perform 45% better than broad targeting.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
}
