import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Users, TrendingUp, IndianRupee, Lightbulb } from "lucide-react";

interface AudiencePreviewProps {
  preview?: {
    audienceSize: number;
    percentage: string;
    avgSpend: string;
    engagementRate: string;
  };
  isLoading: boolean;
}

export default function AudiencePreview({ preview, isLoading }: AudiencePreviewProps) {
  if (isLoading) {
    return (
      <div>
        <h4 className="text-lg font-semibold text-gray-800 mb-4">Audience Preview</h4>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-6 animate-pulse">
            <div className="text-center">
              <div className="h-8 bg-blue-200 rounded w-20 mx-auto mb-2"></div>
              <div className="h-4 bg-blue-200 rounded w-32 mx-auto mb-2"></div>
              <div className="h-3 bg-blue-200 rounded w-24 mx-auto"></div>
            </div>
          </div>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Audience Preview</h4>
      
      {/* Audience Size */}
      <div className="bg-blue-50 rounded-xl p-6 mb-6">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-blue-600">
            {preview?.audienceSize?.toLocaleString() || "0"}
          </h3>
          <p className="text-gray-600 mt-1">customers match your criteria</p>
          <p className="text-sm text-gray-500 mt-2 flex items-center justify-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            <span>{preview?.percentage || "0"}% of total customer base</span>
          </p>
        </div>
      </div>

      {/* Audience Insights */}
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <IndianRupee className="w-4 h-4 mr-1" />
                Avg. Spend
              </span>
              <span className="text-lg font-bold text-gray-800">
                ₹{preview?.avgSpend || "0"}
              </span>
            </div>
            <Progress value={78} className="h-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Engagement Rate
              </span>
              <span className="text-lg font-bold text-gray-800">
                {preview?.engagementRate || "0"}%
              </span>
            </div>
            <Progress value={parseInt(preview?.engagementRate || "0")} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* AI Suggestions */}
      <div className="mt-6 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4">
        <h5 className="font-medium text-gray-800 mb-2 flex items-center">
          <Lightbulb className="w-4 h-4 text-purple-600 mr-2" />
          AI Suggestions
        </h5>
        <p className="text-sm text-gray-600">
          This segment has high purchase potential. Consider offering exclusive deals or early access to new products.
        </p>
      </div>
    </div>
  );
}
