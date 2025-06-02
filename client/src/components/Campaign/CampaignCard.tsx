import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Megaphone, 
  Users, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  MoreHorizontal,
  Brain,
  Calendar,
  MessageSquare
} from "lucide-react";

interface Campaign {
  id: number;
  name: string;
  status: string;
  audienceSize: number;
  deliveredCount: number;
  failedCount: number;
  successRate: string;
  message: string;
  createdAt: string;
  completedAt?: string;
}

interface CampaignCardProps {
  campaign: Campaign;
}

export default function CampaignCard({ campaign }: CampaignCardProps) {
  const [showAIInsights, setShowAIInsights] = useState(false);

  const { data: aiInsights } = useQuery({
    queryKey: [`/api/ai/campaign-insights/${campaign.id}`],
    enabled: showAIInsights && campaign.status === 'completed',
    retry: false,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-600';
      case 'active':
        return 'bg-orange-600';
      case 'failed':
        return 'bg-red-600';
      case 'draft':
        return 'bg-gray-600';
      default:
        return 'bg-gray-600';
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'active':
        return 'secondary';
      case 'failed':
        return 'destructive';
      case 'draft':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`text-white w-12 h-12 rounded-xl flex items-center justify-center ${getStatusColor(campaign.status)}`}>
              <Megaphone className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-800">{campaign.name}</h4>
              <p className="text-gray-500">
                {campaign.audienceSize} recipients • Created {formatDate(campaign.createdAt)}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant={getStatusVariant(campaign.status)}>
                  {campaign.status}
                </Badge>
                <span className="text-sm text-gray-500">Campaign ID: #CMP-{campaign.id}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button variant="ghost" size="sm">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Campaign Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-800 flex items-center justify-center">
              <Users className="w-5 h-5 mr-1" />
              {campaign.audienceSize}
            </div>
            <div className="text-sm text-gray-500">Audience Size</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 mr-1" />
              {campaign.deliveredCount}
            </div>
            <div className="text-sm text-gray-500">Delivered</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 flex items-center justify-center">
              <XCircle className="w-5 h-5 mr-1" />
              {campaign.failedCount}
            </div>
            <div className="text-sm text-gray-500">Failed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 mr-1" />
              {campaign.successRate}%
            </div>
            <div className="text-sm text-gray-500">Success Rate</div>
          </div>
        </div>

        {/* AI Performance Summary */}
        {campaign.status === 'completed' && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between">
              <h5 className="font-medium text-gray-800 flex items-center">
                <Brain className="w-4 h-4 text-purple-600 mr-2" />
                AI Performance Summary
              </h5>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAIInsights(!showAIInsights)}
              >
                {showAIInsights ? 'Hide' : 'Show'} Details
              </Button>
            </div>
            {showAIInsights && aiInsights ? (
              <div className="mt-3 space-y-2">
                <p className="text-sm text-gray-600">{aiInsights.summary}</p>
                {aiInsights.insights && aiInsights.insights.length > 0 && (
                  <div className="mt-2">
                    <h6 className="text-sm font-medium text-gray-700 mb-1">Key Insights:</h6>
                    <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
                      {aiInsights.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-600 mt-2">
                Campaign reached {campaign.audienceSize} customers with a {campaign.successRate}% delivery rate. 
                {showAIInsights && !aiInsights && (
                  <span className="block mt-1 text-gray-500">Loading AI insights...</span>
                )}
              </p>
            )}
          </div>
        )}

        {/* Message Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h6 className="font-medium text-gray-800 mb-2 flex items-center">
            <MessageSquare className="w-4 h-4 mr-2" />
            Message Sent:
          </h6>
          <p className="text-gray-600 italic text-sm">
            "{campaign.message}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
