import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Wand2, Copy, MessageSquare, Check } from "lucide-react";

interface MessageVariant {
  variant: string;
  tone: string;
  content: string;
}

export default function MessageSuggestions() {
  const { toast } = useToast();
  const [objective, setObjective] = useState("");
  const [audience, setAudience] = useState("");
  const [generatedMessages, setGeneratedMessages] = useState<MessageVariant[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const generateMessagesMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/ai/generate-messages", { objective, audience });
      return response.json();
    },
    onSuccess: (data) => {
      setGeneratedMessages(data.messages || []);
      toast({
        title: "Success",
        description: "AI messages generated successfully!",
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
        description: "Failed to generate messages. Please try again.",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = async (content: string, index: number) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      toast({
        title: "Copied!",
        description: "Message copied to clipboard.",
      });
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message.",
        variant: "destructive",
      });
    }
  };

  const objectives = [
    { value: "re-engage", label: "Re-engage inactive customers" },
    { value: "product-launch", label: "Promote new product launch" },
    { value: "loyalty", label: "Increase customer loyalty" },
    { value: "holiday-sales", label: "Drive holiday sales" },
    { value: "cart-abandonment", label: "Recover abandoned carts" },
    { value: "upsell", label: "Upsell to existing customers" },
  ];

  const audiences = [
    { value: "high-value", label: "High-value customers" },
    { value: "inactive", label: "Inactive users (30+ days)" },
    { value: "frequent", label: "Frequent buyers" },
    { value: "new", label: "New customers" },
    { value: "premium", label: "Premium subscribers" },
    { value: "cart-abandoners", label: "Cart abandoners" },
  ];

  const getVariantColor = (variant: string) => {
    switch (variant.toLowerCase()) {
      case 'emotional':
        return 'bg-pink-100 text-pink-800';
      case 'urgency':
        return 'bg-red-100 text-red-800';
      case 'value-focused':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Wand2 className="w-5 h-5 text-purple-600 mr-2" />
          AI Message Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Campaign Objective:
          </label>
          <Select value={objective} onValueChange={setObjective}>
            <SelectTrigger>
              <SelectValue placeholder="Select campaign objective" />
            </SelectTrigger>
            <SelectContent>
              {objectives.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Audience:
          </label>
          <Select value={audience} onValueChange={setAudience}>
            <SelectTrigger>
              <SelectValue placeholder="Select target audience" />
            </SelectTrigger>
            <SelectContent>
              {audiences.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button 
          onClick={() => generateMessagesMutation.mutate()}
          disabled={!objective || !audience || generateMessagesMutation.isPending}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          {generateMessagesMutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Generating Messages...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Generate AI Messages
            </>
          )}
        </Button>

        {/* Generated Messages */}
        {generatedMessages.length > 0 && (
          <div className="mt-6 space-y-3">
            <h5 className="font-medium text-gray-800 flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Generated Message Variants
            </h5>
            {generatedMessages.map((message, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getVariantColor(message.variant)}>
                        {message.variant}
                      </Badge>
                      <span className="text-xs text-gray-500">
                        {message.tone}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      "{message.content}"
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(message.content, index)}
                    className="ml-3 text-purple-600 hover:text-purple-700"
                  >
                    {copiedIndex === index ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                💡 Tip: Use {'{name}'} in your messages for personalization
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
