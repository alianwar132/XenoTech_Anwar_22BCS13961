import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Megaphone, 
  CheckCircle, 
  IndianRupee,
  TrendingUp,
  ArrowUp,
  Brain,
  Target,
  Rocket,
  BarChart3
} from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

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

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
    retry: false,
  });

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  if (isLoading || statsLoading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const recentCampaigns = campaigns?.slice(0, 3) || [];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView="dashboard" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Dashboard" 
          subtitle="Overview of your customer engagement"
        />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Customers</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats?.totalCustomers?.toLocaleString() || "0"}
                    </p>
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +12.5% from last month
                    </p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Active Campaigns</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats?.activeCampaigns || "0"}
                    </p>
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +3 this week
                    </p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <Megaphone className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Delivery Rate</p>
                    <p className="text-3xl font-bold text-gray-800">
                      {stats?.avgDeliveryRate?.toFixed(1) || "0"}%
                    </p>
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +1.3% improvement
                    </p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Revenue Impact</p>
                    <p className="text-3xl font-bold text-gray-800">
                      ₹{(stats?.totalRevenue / 1000000)?.toFixed(1) || "0"}M
                    </p>
                    <p className="text-green-600 text-sm mt-1 flex items-center">
                      <ArrowUp className="w-4 h-4 mr-1" />
                      +18.7% from campaigns
                    </p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <IndianRupee className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Campaigns */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Campaigns</CardTitle>
                </CardHeader>
                <CardContent>
                  {campaignsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                          <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                          </div>
                          <div className="w-20 h-6 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : recentCampaigns.length > 0 ? (
                    <div className="space-y-4">
                      {recentCampaigns.map((campaign) => (
                        <div key={campaign.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="bg-orange-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                              <Megaphone className="w-5 h-5" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800">{campaign.name}</h4>
                              <p className="text-sm text-gray-500">
                                {campaign.audienceSize} recipients • {new Date(campaign.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge 
                              variant={
                                campaign.status === 'completed' ? 'default' :
                                campaign.status === 'active' ? 'secondary' :
                                campaign.status === 'failed' ? 'destructive' : 'outline'
                              }
                            >
                              {campaign.status}
                            </Badge>
                            <p className="text-sm text-gray-500 mt-1">
                              {campaign.successRate}% success rate
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Megaphone className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">No campaigns yet</p>
                      <Link href="/segments">
                        <Button className="mt-4">Create Your First Campaign</Button>
                      </Link>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & AI Insights */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/segments">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Target className="w-5 h-5 mr-3 text-blue-600" />
                      Create Audience Segment
                    </Button>
                  </Link>
                  <Link href="/segments">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Rocket className="w-5 h-5 mr-3 text-orange-600" />
                      Launch Campaign
                    </Button>
                  </Link>
                  <Link href="/campaigns">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <BarChart3 className="w-5 h-5 mr-3 text-green-600" />
                      View Analytics
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* AI Insights Panel */}
              <Card className="bg-gradient-to-br from-purple-500 to-indigo-600 text-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Insights
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="bg-white/20 p-3 rounded-lg text-sm">
                    Your "Premium Customer" segment shows 23% higher engagement on weekends.
                  </div>
                  <div className="bg-white/20 p-3 rounded-lg text-sm">
                    Recommended: Create a lookalike segment based on your top 100 buyers.
                  </div>
                  <Link href="/ai-insights">
                    <Button className="w-full mt-4 bg-white text-purple-600 hover:bg-gray-100">
                      View All Insights
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
