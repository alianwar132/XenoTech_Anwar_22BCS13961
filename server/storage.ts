import {
  users,
  customers,
  orders,
  segments,
  campaigns,
  communicationLogs,
  type User,
  type UpsertUser,
  type Customer,
  type InsertCustomer,
  type Order,
  type InsertOrder,
  type Segment,
  type InsertSegment,
  type Campaign,
  type InsertCampaign,
  type CommunicationLog,
  type InsertCommunicationLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql, and, or, gte, lte, gt, lt } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Customer operations
  createCustomer(customer: InsertCustomer): Promise<Customer>;
  getCustomers(limit?: number, offset?: number): Promise<Customer[]>;
  getCustomer(id: number): Promise<Customer | undefined>;
  updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined>;
  getCustomersBySegmentRules(rules: any): Promise<Customer[]>;
  getTotalCustomersCount(): Promise<number>;
  
  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  getOrdersByCustomer(customerId: number): Promise<Order[]>;
  
  // Segment operations
  createSegment(segment: InsertSegment): Promise<Segment>;
  getSegments(userId: string): Promise<Segment[]>;
  getSegment(id: number): Promise<Segment | undefined>;
  updateSegmentAudienceSize(id: number, size: number): Promise<void>;
  
  // Campaign operations
  createCampaign(campaign: InsertCampaign): Promise<Campaign>;
  getCampaigns(userId: string): Promise<Campaign[]>;
  getCampaign(id: number): Promise<Campaign | undefined>;
  updateCampaignStats(id: number, stats: { deliveredCount?: number; failedCount?: number; successRate?: number; status?: string; completedAt?: Date }): Promise<void>;
  
  // Communication log operations
  createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog>;
  updateCommunicationLogStatus(id: number, status: string, sentAt?: Date, failureReason?: string): Promise<void>;
  getCommunicationLogsByCampaign(campaignId: number): Promise<CommunicationLog[]>;
  
  // Analytics operations
  getDashboardStats(userId: string): Promise<{
    totalCustomers: number;
    activeCampaigns: number;
    avgDeliveryRate: number;
    totalRevenue: number;
  }>;
}

export class DatabaseStorage implements IStorage {
  // User operations (IMPORTANT: mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Customer operations
  async createCustomer(customer: InsertCustomer): Promise<Customer> {
    const [newCustomer] = await db.insert(customers).values(customer).returning();
    return newCustomer;
  }

  async getCustomers(limit = 50, offset = 0): Promise<Customer[]> {
    return await db.select().from(customers).limit(limit).offset(offset).orderBy(desc(customers.createdAt));
  }

  async getCustomer(id: number): Promise<Customer | undefined> {
    const [customer] = await db.select().from(customers).where(eq(customers.id, id));
    return customer;
  }

  async updateCustomer(id: number, updates: Partial<InsertCustomer>): Promise<Customer | undefined> {
    const [customer] = await db
      .update(customers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(customers.id, id))
      .returning();
    return customer;
  }

  async getCustomersBySegmentRules(rules: any): Promise<Customer[]> {
    // Build dynamic query based on segment rules
    let query = db.select().from(customers);
    
    if (rules && rules.conditions) {
      const conditions = this.buildSegmentConditions(rules.conditions, rules.operator);
      if (conditions) {
        query = query.where(conditions);
      }
    }
    
    return await query;
  }

  private buildSegmentConditions(conditions: any[], operator: 'AND' | 'OR' = 'AND'): any {
    if (!conditions || conditions.length === 0) return undefined;

    const sqlConditions = conditions.map(condition => {
      const { field, operator: op, value } = condition;
      
      switch (field) {
        case 'totalSpent':
          switch (op) {
            case '>': return gt(customers.totalSpent, value);
            case '>=': return gte(customers.totalSpent, value);
            case '<': return lt(customers.totalSpent, value);
            case '<=': return lte(customers.totalSpent, value);
            case '=': return eq(customers.totalSpent, value);
            default: return undefined;
          }
        case 'visitCount':
          switch (op) {
            case '>': return gt(customers.visitCount, parseInt(value));
            case '>=': return gte(customers.visitCount, parseInt(value));
            case '<': return lt(customers.visitCount, parseInt(value));
            case '<=': return lte(customers.visitCount, parseInt(value));
            case '=': return eq(customers.visitCount, parseInt(value));
            default: return undefined;
          }
        case 'lastPurchaseDate':
          const date = new Date();
          date.setDate(date.getDate() - parseInt(value));
          switch (op) {
            case '>': return gt(customers.lastPurchaseDate, date);
            case '<': return lt(customers.lastPurchaseDate, date);
            default: return undefined;
          }
        default:
          return undefined;
      }
    }).filter(Boolean);

    if (sqlConditions.length === 0) return undefined;
    if (sqlConditions.length === 1) return sqlConditions[0];
    
    return operator === 'AND' ? and(...sqlConditions) : or(...sqlConditions);
  }

  async getTotalCustomersCount(): Promise<number> {
    const [result] = await db.select({ count: sql`count(*)` }).from(customers);
    return parseInt(result.count as string);
  }

  // Order operations
  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    
    // Update customer stats
    await db.execute(sql`
      UPDATE customers 
      SET 
        total_spent = total_spent + ${order.amount},
        visit_count = visit_count + 1,
        last_purchase_date = ${new Date()},
        updated_at = ${new Date()}
      WHERE id = ${order.customerId}
    `);
    
    return newOrder;
  }

  async getOrdersByCustomer(customerId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.customerId, customerId)).orderBy(desc(orders.orderDate));
  }

  // Segment operations
  async createSegment(segment: InsertSegment): Promise<Segment> {
    const [newSegment] = await db.insert(segments).values(segment).returning();
    return newSegment;
  }

  async getSegments(userId: string): Promise<Segment[]> {
    return await db.select().from(segments).where(eq(segments.createdBy, userId)).orderBy(desc(segments.createdAt));
  }

  async getSegment(id: number): Promise<Segment | undefined> {
    const [segment] = await db.select().from(segments).where(eq(segments.id, id));
    return segment;
  }

  async updateSegmentAudienceSize(id: number, size: number): Promise<void> {
    await db.update(segments).set({ audienceSize: size, updatedAt: new Date() }).where(eq(segments.id, id));
  }

  // Campaign operations
  async createCampaign(campaign: InsertCampaign): Promise<Campaign> {
    const [newCampaign] = await db.insert(campaigns).values(campaign).returning();
    return newCampaign;
  }

  async getCampaigns(userId: string): Promise<Campaign[]> {
    return await db
      .select()
      .from(campaigns)
      .where(eq(campaigns.createdBy, userId))
      .orderBy(desc(campaigns.createdAt));
  }

  async getCampaign(id: number): Promise<Campaign | undefined> {
    const [campaign] = await db.select().from(campaigns).where(eq(campaigns.id, id));
    return campaign;
  }

  async updateCampaignStats(id: number, stats: { deliveredCount?: number; failedCount?: number; successRate?: number; status?: string; completedAt?: Date }): Promise<void> {
    await db.update(campaigns).set({ ...stats, updatedAt: new Date() }).where(eq(campaigns.id, id));
  }

  // Communication log operations
  async createCommunicationLog(log: InsertCommunicationLog): Promise<CommunicationLog> {
    const [newLog] = await db.insert(communicationLogs).values(log).returning();
    return newLog;
  }

  async updateCommunicationLogStatus(id: number, status: string, sentAt?: Date, failureReason?: string): Promise<void> {
    await db
      .update(communicationLogs)
      .set({ 
        status, 
        sentAt: sentAt || new Date(),
        failureReason 
      })
      .where(eq(communicationLogs.id, id));
  }

  async getCommunicationLogsByCampaign(campaignId: number): Promise<CommunicationLog[]> {
    return await db
      .select()
      .from(communicationLogs)
      .where(eq(communicationLogs.campaignId, campaignId))
      .orderBy(desc(communicationLogs.createdAt));
  }

  // Analytics operations
  async getDashboardStats(userId: string): Promise<{
    totalCustomers: number;
    activeCampaigns: number;
    avgDeliveryRate: number;
    totalRevenue: number;
  }> {
    // Get total customers
    const [customerCount] = await db.select({ count: sql`count(*)` }).from(customers);
    
    // Get active campaigns for user
    const [activeCampaignCount] = await db
      .select({ count: sql`count(*)` })
      .from(campaigns)
      .where(and(eq(campaigns.createdBy, userId), eq(campaigns.status, 'active')));
    
    // Get average delivery rate for user's campaigns
    const [avgDeliveryRate] = await db
      .select({ 
        avg: sql`COALESCE(AVG(success_rate), 0)` 
      })
      .from(campaigns)
      .where(eq(campaigns.createdBy, userId));
    
    // Get total revenue (sum of all orders)
    const [totalRevenue] = await db
      .select({ 
        total: sql`COALESCE(SUM(amount), 0)` 
      })
      .from(orders);

    return {
      totalCustomers: parseInt(customerCount.count as string),
      activeCampaigns: parseInt(activeCampaignCount.count as string),
      avgDeliveryRate: parseFloat(avgDeliveryRate.avg as string),
      totalRevenue: parseFloat(totalRevenue.total as string),
    };
  }
}

export const storage = new DatabaseStorage();
