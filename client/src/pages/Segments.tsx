import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import Sidebar from "@/components/Layout/Sidebar";
import TopBar from "@/components/Layout/TopBar";
import RuleBuilder from "@/components/SegmentBuilder/RuleBuilder";
import AudiencePreview from "@/components/SegmentBuilder/AudiencePreview";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  Wand2, 
  Target, 
  Users,
  Plus,
  Trash2
} from "lucide-react";
import { useLocation } from "wouter";

interface SegmentRule {
  field: string;
  operator: string;
  value: string;
}

interface SegmentRules {
  conditions: SegmentRule[];
  operator: 'AND' | 'OR';
}

export default function Segments() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [rules, setRules] = useState<SegmentRules>({
    conditions: [],
    operator: 'AND'
  });
  const [naturalLanguageInput, setNaturalLanguageInput] = useState("");

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

  const { data: segments, isLoading: segmentsLoading } = useQuery({
    queryKey: ["/api/segments"],
    retry: false,
  });

  const { data: preview, isLoading: previewLoading } = useQuery({
    queryKey: ["/api/segments/preview", rules],
    queryFn: async () => {
      if (rules.conditions.length === 0) {
        return { audienceSize: 0, percentage: "0", avgSpend: "0", engagementRate: "0" };
      }
      const response = await apiRequest("POST", "/api/segments/preview", { rules });
      return response.json();
    },
    retry: false,
  });

  const generateRulesMutation = useMutation({
    mutationFn: async (description: string) => {
      const response = await apiRequest("POST", "/api/ai/generate-segment-rules", { description });
      return response.json();
    },
    onSuccess: (data) => {
      setRules(data);
      toast({
        title: "Success",
        description: "AI rules generated successfully!",
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
        description: "Failed to generate rules. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createSegmentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/segments", {
        name: segmentName,
        description: segmentDescription,
        rules,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Segment created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/segments"] });
      // Reset form
      setSegmentName("");
      setSegmentDescription("");
      setRules({ conditions: [], operator: 'AND' });
      setNaturalLanguageInput("");
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
        description: "Failed to create segment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createCampaignMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/segments", {
        name: segmentName,
        description: segmentDescription,
        rules,
      });
      const segment = await response.json();
      
      // Navigate to create campaign with this segment
      setLocation(`/campaigns?segmentId=${segment.id}`);
      return segment;
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Segment created! Redirecting to campaign creation...",
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
        description: "Failed to create segment for campaign.",
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
            <p className="text-gray-600">Loading segments...</p>
          </div>
        </div>
      </div>
    );
  }

  const handleGenerateRules = () => {
    if (!naturalLanguageInput.trim()) {
      toast({
        title: "Error",
        description: "Please enter a description for your audience segment.",
        variant: "destructive",
      });
      return;
    }
    generateRulesMutation.mutate(naturalLanguageInput);
  };

  const addRule = () => {
    setRules(prev => ({
      ...prev,
      conditions: [...prev.conditions, { field: 'totalSpent', operator: '>', value: '' }]
    }));
  };

  const removeRule = (index: number) => {
    setRules(prev => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index)
    }));
  };

  const updateRule = (index: number, updates: Partial<SegmentRule>) => {
    setRules(prev => ({
      ...prev,
      conditions: prev.conditions.map((rule, i) => 
        i === index ? { ...rule, ...updates } : rule
      )
    }));
  };

  const applyTemplate = (templateType: string) => {
    const templates = {
      'high-value': {
        conditions: [{ field: 'totalSpent', operator: '>', value: '10000' }],
        operator: 'AND' as const
      },
      'inactive': {
        conditions: [{ field: 'lastPurchaseDate', operator: '>', value: '90' }],
        operator: 'AND' as const
      },
      'frequent': {
        conditions: [
          { field: 'visitCount', operator: '>', value: '10' },
          { field: 'totalSpent', operator: '>', value: '5000' }
        ],
        operator: 'AND' as const
      }
    };
    
    if (templates[templateType]) {
      setRules(templates[templateType]);
      toast({
        title: "Template Applied",
        description: `${templateType} template has been applied.`,
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar currentView="segments" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar 
          title="Audience Segments" 
          subtitle="Build custom audience segments with flexible rules and AI assistance"
        />
        
        <main className="flex-1 overflow-auto p-6">
          <Tabs defaultValue="create" className="space-y-6">
            <TabsList>
              <TabsTrigger value="create">Create Segment</TabsTrigger>
              <TabsTrigger value="existing">Existing Segments</TabsTrigger>
            </TabsList>

            <TabsContent value="create">
              <Card>
                <CardHeader>
                  <CardTitle>Create Audience Segment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* AI Natural Language Input */}
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-6">
                    <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                      <Brain className="w-5 h-5 text-purple-600 mr-2" />
                      AI-Powered Segment Builder
                    </h4>
                    <div className="space-y-4">
                      <Textarea
                        value={naturalLanguageInput}
                        onChange={(e) => setNaturalLanguageInput(e.target.value)}
                        placeholder="Describe your audience in plain English: e.g., 'Customers who spent more than ₹10,000 in the last 6 months but haven't purchased in 30 days'"
                        rows={3}
                        className="resize-none"
                      />
                      <Button 
                        onClick={handleGenerateRules}
                        disabled={generateRulesMutation.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        {generateRulesMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Wand2 className="w-4 h-4 mr-2" />
                            Generate Rules with AI
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Rule Builder */}
                    <div>
                      <RuleBuilder
                        rules={rules}
                        onRulesChange={setRules}
                        onAddRule={addRule}
                        onRemoveRule={removeRule}
                        onUpdateRule={updateRule}
                        onApplyTemplate={applyTemplate}
                      />
                    </div>

                    {/* Preview Panel */}
                    <div>
                      <AudiencePreview 
                        preview={preview}
                        isLoading={previewLoading}
                      />
                    </div>
                  </div>

                  {/* Segment Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Segment Name *
                      </label>
                      <Input
                        value={segmentName}
                        onChange={(e) => setSegmentName(e.target.value)}
                        placeholder="Enter segment name..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description
                      </label>
                      <Textarea
                        value={segmentDescription}
                        onChange={(e) => setSegmentDescription(e.target.value)}
                        placeholder="Optional description for this segment..."
                        rows={2}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setRules({ conditions: [], operator: 'AND' });
                        setSegmentName("");
                        setSegmentDescription("");
                        setNaturalLanguageInput("");
                      }}
                    >
                      Clear All Rules
                    </Button>
                    <div className="space-x-3">
                      <Button
                        onClick={() => createSegmentMutation.mutate()}
                        disabled={!segmentName || rules.conditions.length === 0 || createSegmentMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {createSegmentMutation.isPending ? "Saving..." : "Save Segment"}
                      </Button>
                      <Button
                        onClick={() => createCampaignMutation.mutate()}
                        disabled={!segmentName || rules.conditions.length === 0 || createCampaignMutation.isPending}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        {createCampaignMutation.isPending ? "Creating..." : "Create Campaign"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="existing">
              <Card>
                <CardHeader>
                  <CardTitle>Existing Segments</CardTitle>
                </CardHeader>
                <CardContent>
                  {segmentsLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 border border-gray-200 rounded-lg animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-2/3 mb-3"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                        </div>
                      ))}
                    </div>
                  ) : segments && segments.length > 0 ? (
                    <div className="space-y-4">
                      {segments.map((segment) => (
                        <div key={segment.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-gray-800 mb-1">{segment.name}</h3>
                              {segment.description && (
                                <p className="text-gray-600 text-sm mb-2">{segment.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-sm text-gray-500">
                                <span className="flex items-center">
                                  <Users className="w-4 h-4 mr-1" />
                                  {segment.audienceSize} customers
                                </span>
                                <span>Created {new Date(segment.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">
                                {segment.rules?.conditions?.length || 0} rules
                              </Badge>
                              <Button size="sm" variant="outline">
                                <Target className="w-4 h-4 mr-1" />
                                Create Campaign
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">No segments yet</h3>
                      <p className="text-gray-600 mb-6">
                        Create your first audience segment to start building targeted campaigns.
                      </p>
                      <Button onClick={() => setLocation("#create")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Your First Segment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
}
