import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import CampaignCard from "@/components/Campaign/CampaignCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Plus, 
  Search,
  Filter,
  MessageSquare,
  Users,
  TrendingUp,
  Calendar
} from "lucide-react";

export default function Campaigns() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    message: "",
    segmentId: "",
  });

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

  const { data: campaigns, isLoading: campaignsLoading } = useQuery({
    queryKey: ["/api/campaigns"],
    retry: false,
  });

  const { data: segments } = useQuery({
    queryKey: ["/api/segments"],
    retry: false,
  });

  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/campaigns", newCampaign);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Campaign created and delivery started!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/campaigns"] });
      setIsCreateDialogOpen(false);
      setNewCampaign({ name: "", message: "", segmentId: "" });
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
        description: "Failed to create campaign. Please try again.",
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
            <p className="text-gray-600">Loading campaigns...</p>
          </div>
        </div>
      </div>
    );
  }

  const filteredCampaigns = campaigns?.filter(campaign => {
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || campaign.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const campaignStats = campaigns?.reduce((acc, campaign) => {
    acc.total++;
    if (campaign.status === 'active') acc.active++;
    if (campaign.status === 'completed') acc.completed++;
    if (campaign.status === 'failed') acc.failed++;
    return acc;
  }, { total: 0, active: 0, completed: 0, failed: 0 }) || { total: 0, active: 0, completed: 0, failed: 0 };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView="campaigns" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Campaign History" 
          subtitle="Track performance and delivery statistics for all campaigns"
          actionButton={
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>Create New Campaign</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Campaign Name *
                    </label>
                    <Input
                      value={newCampaign.name}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Enter campaign name..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Target Segment *
                    </label>
                    <Select 
                      value={newCampaign.segmentId} 
                      onValueChange={(value) => setNewCampaign(prev => ({ ...prev, segmentId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a segment" />
                      </SelectTrigger>
                      <SelectContent>
                        {segments?.map((segment) => (
                          <SelectItem key={segment.id} value={segment.id.toString()}>
                            {segment.name} ({segment.audienceSize} customers)
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      value={newCampaign.message}
                      onChange={(e) => setNewCampaign(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter your message... Use {name} for personalization."
                      rows={4}
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Tip: Use {'{name}'} to personalize messages with customer names.
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setIsCreateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => createCampaignMutation.mutate()}
                      disabled={!newCampaign.name || !newCampaign.segmentId || !newCampaign.message || createCampaignMutation.isPending}
                      className="bg-orange-600 hover:bg-orange-700"
                    >
                      {createCampaignMutation.isPending ? "Creating..." : "Create & Launch"}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          }
        />
        
        <main className="flex-1 overflow-auto p-6 space-y-6">
          {/* Campaign Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Total Campaigns</p>
                    <p className="text-3xl font-bold text-gray-800">{campaignStats.total}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Megaphone className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Active</p>
                    <p className="text-3xl font-bold text-orange-600">{campaignStats.active}</p>
                  </div>
                  <div className="bg-orange-100 p-3 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Completed</p>
                    <p className="text-3xl font-bold text-green-600">{campaignStats.completed}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm font-medium">Failed</p>
                    <p className="text-3xl font-bold text-red-600">{campaignStats.failed}</p>
                  </div>
                  <div className="bg-red-100 p-3 rounded-lg">
                    <Calendar className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search campaigns..."
                      className="pl-10 w-64"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Campaigns</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>Found {filteredCampaigns.length} campaigns</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Campaign List */}
          {campaignsLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                        <div>
                          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                          <div className="h-4 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="w-20 h-6 bg-gray-200 rounded"></div>
                    </div>
                    <div className="grid grid-cols-4 gap-6">
                      {[1, 2, 3, 4].map((j) => (
                        <div key={j} className="text-center">
                          <div className="h-8 bg-gray-200 rounded w-16 mx-auto mb-1"></div>
                          <div className="h-4 bg-gray-200 rounded w-20 mx-auto"></div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredCampaigns.length > 0 ? (
            <div className="space-y-4">
              {filteredCampaigns.map((campaign) => (
                <CampaignCard key={campaign.id} campaign={campaign} />
              ))}
            </div>
          ) : campaigns && campaigns.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No campaigns yet</h3>
                <p className="text-gray-600 mb-6">
                  Create your first campaign to start engaging with your customers.
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-orange-600 hover:bg-orange-700">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Your First Campaign
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No campaigns found</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your search or filter criteria.
                </p>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  );
}
