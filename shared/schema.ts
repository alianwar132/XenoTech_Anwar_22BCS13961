import {
  pgTable,
  text,
  varchar,
  timestamp,
  jsonb,
  index,
  serial,
  integer,
  decimal,
  boolean,
  uuid,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Customers table for CRM data
export const customers = pgTable("customers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  totalSpent: decimal("total_spent", { precision: 10, scale: 2 }).default("0"),
  visitCount: integer("visit_count").default(0),
  lastPurchaseDate: timestamp("last_purchase_date"),
  customerSince: timestamp("customer_since").defaultNow(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  orderDate: timestamp("order_date").defaultNow(),
  status: text("status").default("completed"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Audience segments table
export const segments = pgTable("segments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  rules: jsonb("rules").notNull(), // Store segment rules as JSON
  audienceSize: integer("audience_size").default(0),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Campaigns table
export const campaigns = pgTable("campaigns", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  segmentId: integer("segment_id").references(() => segments.id).notNull(),
  message: text("message").notNull(),
  status: text("status").default("draft"), // draft, active, completed, failed
  audienceSize: integer("audience_size").default(0),
  deliveredCount: integer("delivered_count").default(0),
  failedCount: integer("failed_count").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  completedAt: timestamp("completed_at"),
});

// Communication logs table
export const communicationLogs = pgTable("communication_logs", {
  id: serial("id").primaryKey(),
  campaignId: integer("campaign_id").references(() => campaigns.id).notNull(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  message: text("message").notNull(),
  status: text("status").default("pending"), // pending, sent, failed
  sentAt: timestamp("sent_at"),
  failureReason: text("failure_reason"),
  vendorId: text("vendor_id"), // ID from vendor API
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(orders),
  communicationLogs: many(communicationLogs),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
}));

export const segmentsRelations = relations(segments, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [segments.createdBy],
    references: [users.id],
  }),
  campaigns: many(campaigns),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  segment: one(segments, {
    fields: [campaigns.segmentId],
    references: [segments.id],
  }),
  createdBy: one(users, {
    fields: [campaigns.createdBy],
    references: [users.id],
  }),
  communicationLogs: many(communicationLogs),
}));

export const communicationLogsRelations = relations(communicationLogs, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [communicationLogs.campaignId],
    references: [campaigns.id],
  }),
  customer: one(customers, {
    fields: [communicationLogs.customerId],
    references: [customers.id],
  }),
}));

// Insert schemas
export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
});

export const insertSegmentSchema = createInsertSchema(segments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCampaignSchema = createInsertSchema(campaigns).omit({
  id: true,
  createdAt: true,
  completedAt: true,
});

export const insertCommunicationLogSchema = createInsertSchema(communicationLogs).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Segment = typeof segments.$inferSelect;
export type InsertSegment = z.infer<typeof insertSegmentSchema>;
export type Campaign = typeof campaigns.$inferSelect;
export type InsertCampaign = z.infer<typeof insertCampaignSchema>;
export type CommunicationLog = typeof communicationLogs.$inferSelect;
export type InsertCommunicationLog = z.infer<typeof insertCommunicationLogSchema>;
