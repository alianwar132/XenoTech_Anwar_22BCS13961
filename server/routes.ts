import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  insertCustomerSchema,
  insertOrderSchema,
  insertSegmentSchema,
  insertCampaignSchema,
} from "@shared/schema";
import { 
  generateSegmentRules,
  generateCampaignMessages,
  generateCampaignInsights,
  generateLookalikeAudience 
} from "./openai";
import { vendorAPI } from "./vendorAPI";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Dashboard API
  app.get('/api/dashboard/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  // Customer API Routes
  app.post('/api/customers', async (req, res) => {
    try {
      const customerData = insertCustomerSchema.parse(req.body);
      const customer = await storage.createCustomer(customerData);
      res.status(201).json(customer);
    } catch (error) {
      console.error("Error creating customer:", error);
      res.status(400).json({ message: "Invalid customer data", error: error.message });
    }
  });

  app.get('/api/customers', isAuthenticated, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const offset = parseInt(req.query.offset as string) || 0;
      const customers = await storage.getCustomers(limit, offset);
      res.json(customers);
    } catch (error) {
      console.error("Error fetching customers:", error);
      res.status(500).json({ message: "Failed to fetch customers" });
    }
  });

  app.get('/api/customers/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const customer = await storage.getCustomer(id);
      if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
      }
      res.json(customer);
    } catch (error) {
      console.error("Error fetching customer:", error);
      res.status(500).json({ message: "Failed to fetch customer" });
    }
  });

  // Order API Routes
  app.post('/api/orders', async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.status(201).json(order);
    } catch (error) {
      console.error("Error creating order:", error);
      res.status(400).json({ message: "Invalid order data", error: error.message });
    }
  });

  app.get('/api/customers/:customerId/orders', isAuthenticated, async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const orders = await storage.getOrdersByCustomer(customerId);
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  // Segment API Routes
  app.post('/api/segments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const segmentData = insertSegmentSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      // Calculate audience size
      const audience = await storage.getCustomersBySegmentRules(segmentData.rules);
      const segment = await storage.createSegment({
        ...segmentData,
        audienceSize: audience.length,
      });
      
      res.status(201).json(segment);
    } catch (error) {
      console.error("Error creating segment:", error);
      res.status(400).json({ message: "Invalid segment data", error: error.message });
    }
  });

  app.get('/api/segments', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const segments = await storage.getSegments(userId);
      res.json(segments);
    } catch (error) {
      console.error("Error fetching segments:", error);
      res.status(500).json({ message: "Failed to fetch segments" });
    }
  });

  app.get('/api/segments/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const segment = await storage.getSegment(id);
      if (!segment) {
        return res.status(404).json({ message: "Segment not found" });
      }
      res.json(segment);
    } catch (error) {
      console.error("Error fetching segment:", error);
      res.status(500).json({ message: "Failed to fetch segment" });
    }
  });

  app.post('/api/segments/preview', isAuthenticated, async (req, res) => {
    try {
      const { rules } = req.body;
      const audience = await storage.getCustomersBySegmentRules(rules);
      const totalCustomers = await storage.getTotalCustomersCount();
      
      // Calculate insights
      const avgSpend = audience.length > 0 
        ? audience.reduce((sum, c) => sum + parseFloat(c.totalSpent || "0"), 0) / audience.length 
        : 0;
      
      const engagementRate = audience.length > 0
        ? (audience.filter(c => c.visitCount > 5).length / audience.length) * 100
        : 0;

      res.json({
        audienceSize: audience.length,
        percentage: totalCustomers > 0 ? ((audience.length / totalCustomers) * 100).toFixed(1) : "0",
        avgSpend: avgSpend.toFixed(0),
        engagementRate: engagementRate.toFixed(0),
      });
    } catch (error) {
      console.error("Error previewing segment:", error);
      res.status(500).json({ message: "Failed to preview segment" });
    }
  });

  // Campaign API Routes
  app.post('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaignData = insertCampaignSchema.parse({
        ...req.body,
        createdBy: userId,
      });
      
      const campaign = await storage.createCampaign(campaignData);
      
      // Start campaign delivery asynchronously
      setTimeout(() => {
        processCampaignDelivery(campaign.id);
      }, 1000);
      
      res.status(201).json(campaign);
    } catch (error) {
      console.error("Error creating campaign:", error);
      res.status(400).json({ message: "Invalid campaign data", error: error.message });
    }
  });

  app.get('/api/campaigns', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const campaigns = await storage.getCampaigns(userId);
      res.json(campaigns);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      res.status(500).json({ message: "Failed to fetch campaigns" });
    }
  });

  app.get('/api/campaigns/:id', isAuthenticated, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const campaign = await storage.getCampaign(id);
      if (!campaign) {
        return res.status(404).json({ message: "Campaign not found" });
      }
      res.json(campaign);
    } catch (error) {
      console.error("Error fetching campaign:", error);
      res.status(500).json({ message: "Failed to fetch campaign" });
    }
  });

  // AI API Routes
  app.post('/api/ai/generate-segment-rules', isAuthenticated, async (req, res) => {
    try {
      const { description } = req.body;
      if (!description) {
        return res.status(400).json({ message: "Description is required" });
      }
      
      const rules = await generateSegmentRules(description);
      res.json(rules);
    } catch (error) {
      console.error("Error generating segment rules:", error);
      res.status(500).json({ message: "Failed to generate segment rules" });
    }
  });

  app.post('/api/ai/generate-messages', isAuthenticated, async (req, res) => {
    try {
      const { objective, audience } = req.body;
      if (!objective || !audience) {
        return res.status(400).json({ message: "Objective and audience are required" });
      }
      
      const messages = await generateCampaignMessages(objective, audience);
      res.json(messages);
    } catch (error) {
      console.error("Error generating messages:", error);
      res.status(500).json({ message: "Failed to generate messages" });
    }
  });

  app.post('/api/ai/campaign-insights/:campaignId', isAuthenticated, async (req, res) => {
    try {
      const campaignId = parseInt(req.params.campaignId);
      const campaign = await storage.getCampaign(campaignId);
      const segment = campaign ? await storage.getSegment(campaign.segmentId) : null;
      
      if (!campaign || !segment) {
        return res.status(404).json({ message: "Campaign or segment not found" });
      }

      const insights = await generateCampaignInsights({
        audienceSize: campaign.audienceSize,
        deliveredCount: campaign.deliveredCount,
        failedCount: campaign.failedCount,
        successRate: parseFloat(campaign.successRate || "0"),
        segmentDescription: segment.description || segment.name,
      });
      
      res.json(insights);
    } catch (error) {
      console.error("Error generating campaign insights:", error);
      res.status(500).json({ message: "Failed to generate campaign insights" });
    }
  });

  app.post('/api/ai/lookalike-audience', isAuthenticated, async (req, res) => {
    try {
      const { sourceSegmentId } = req.body;
      if (!sourceSegmentId) {
        return res.status(400).json({ message: "Source segment ID is required" });
      }
      
      const segment = await storage.getSegment(sourceSegmentId);
      if (!segment) {
        return res.status(404).json({ message: "Source segment not found" });
      }
      
      const sourceCustomers = await storage.getCustomersBySegmentRules(segment.rules);
      const customerData = sourceCustomers.map(c => ({
        totalSpent: parseFloat(c.totalSpent || "0"),
        visitCount: c.visitCount || 0,
        daysSinceLastPurchase: c.lastPurchaseDate 
          ? Math.floor((Date.now() - new Date(c.lastPurchaseDate).getTime()) / (1000 * 60 * 60 * 24))
          : 999,
      }));
      
      const lookalike = await generateLookalikeAudience(customerData);
      res.json(lookalike);
    } catch (error) {
      console.error("Error generating lookalike audience:", error);
      res.status(500).json({ message: "Failed to generate lookalike audience" });
    }
  });

  // Delivery Receipt API (called by vendor)
  app.post('/api/delivery-receipt', async (req, res) => {
    try {
      const { logId, vendorId, status, deliveredAt, failureReason } = req.body;
      
      await storage.updateCommunicationLogStatus(
        logId,
        status.toLowerCase(),
        new Date(deliveredAt),
        failureReason
      );
      
      res.json({ message: "Delivery receipt processed" });
    } catch (error) {
      console.error("Error processing delivery receipt:", error);
      res.status(500).json({ message: "Failed to process delivery receipt" });
    }
  });

  // Campaign delivery processing function
  async function processCampaignDelivery(campaignId: number) {
    try {
      const campaign = await storage.getCampaign(campaignId);
      const segment = campaign ? await storage.getSegment(campaign.segmentId) : null;
      
      if (!campaign || !segment) {
        console.error("Campaign or segment not found for delivery processing");
        return;
      }

      // Update campaign status to active
      await storage.updateCampaignStats(campaignId, { status: 'active' });

      // Get audience
      const audience = await storage.getCustomersBySegmentRules(segment.rules);
      
      let deliveredCount = 0;
      let failedCount = 0;

      // Process each customer in the audience
      for (const customer of audience) {
        // Create communication log entry
        const log = await storage.createCommunicationLog({
          campaignId,
          customerId: customer.id,
          message: campaign.message.replace('{name}', customer.name),
          status: 'pending',
        });

        // Send message via vendor API
        try {
          const response = await vendorAPI.sendMessage({
            customerId: customer.id,
            customerName: customer.name,
            customerEmail: customer.email,
            message: campaign.message.replace('{name}', customer.name),
            campaignId,
            logId: log.id,
          });

          if (response.status === 'SENT') {
            deliveredCount++;
          } else {
            failedCount++;
          }
        } catch (error) {
          console.error(`Failed to send message to customer ${customer.id}:`, error);
          failedCount++;
          await storage.updateCommunicationLogStatus(log.id, 'failed', undefined, 'Vendor API error');
        }

        // Small delay to avoid overwhelming the system
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update campaign stats
      const successRate = audience.length > 0 ? (deliveredCount / audience.length) * 100 : 0;
      await storage.updateCampaignStats(campaignId, {
        deliveredCount,
        failedCount,
        successRate: parseFloat(successRate.toFixed(2)),
        status: 'completed',
        completedAt: new Date(),
      });

      console.log(`Campaign ${campaignId} completed: ${deliveredCount} delivered, ${failedCount} failed`);
    } catch (error) {
      console.error(`Error processing campaign delivery for campaign ${campaignId}:`, error);
      await storage.updateCampaignStats(campaignId, { status: 'failed' });
    }
  }

  const httpServer = createServer(app);
  return httpServer;
}
