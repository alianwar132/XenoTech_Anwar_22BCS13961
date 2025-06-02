import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  BarChart3, 
  Users, 
  Target, 
  Brain, 
  MessageSquare, 
  TrendingUp,
  CheckCircle
} from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Xeno CRM</h1>
                <p className="text-sm text-gray-500">Campaign Manager</p>
              </div>
            </div>
            <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700">
              Sign In with Google
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
              AI-Powered Customer
              <span className="text-blue-600 block">Segmentation & Campaigns</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Build intelligent audience segments, create personalized campaigns, and drive engagement 
              with our comprehensive CRM platform powered by artificial intelligence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button onClick={handleLogin} size="lg" className="bg-blue-600 hover:bg-blue-700">
                Get Started Free
              </Button>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-blue-100 text-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Target className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Segmentation</h3>
                <p className="text-gray-600">
                  Create dynamic audience segments using flexible rules with AND/OR logic. 
                  Preview audience size in real-time before launching campaigns.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-purple-100 text-purple-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Integration</h3>
                <p className="text-gray-600">
                  Transform natural language into segment rules, generate personalized messages, 
                  and get intelligent campaign insights powered by AI.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-green-100 text-green-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Campaign Delivery</h3>
                <p className="text-gray-600">
                  Automated campaign delivery with real-time tracking, delivery receipts, 
                  and comprehensive analytics to measure performance.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-orange-100 text-orange-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Customer Management</h3>
                <p className="text-gray-600">
                  Secure REST APIs for customer and order data ingestion with comprehensive 
                  customer analytics and behavioral insights.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-indigo-100 text-indigo-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Advanced Analytics</h3>
                <p className="text-gray-600">
                  Deep insights into campaign performance, customer behavior patterns, 
                  and AI-generated recommendations for optimization.
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="bg-red-100 text-red-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Secure & Scalable</h3>
                <p className="text-gray-600">
                  Enterprise-grade security with Google OAuth, scalable architecture, 
                  and comprehensive API documentation with Swagger integration.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to Transform Your Customer Engagement?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using Xeno CRM to create personalized, 
            AI-powered customer experiences that drive results.
          </p>
          <Button 
            onClick={handleLogin} 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100"
          >
            Start Your Free Trial
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-blue-600 text-white w-10 h-10 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-xl font-bold text-white">Xeno CRM</span>
            </div>
            <p className="text-gray-400">
              © 2024 Xeno CRM. Built for the future of customer engagement.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
