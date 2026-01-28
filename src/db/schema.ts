import { pgTable, serial, varchar, integer, decimal, date, timestamp, jsonb } from "drizzle-orm/pg-core";

/**
 * Staff table schema
 * Stores employee information linked to CodingThailand API users
 */
export const staffTable = pgTable("staff", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(), // Links to CodingThailand user ID
  fullName: varchar("full_name", { length: 255 }).notNull(), // ชื่อ-สกุล
  salary: decimal("salary", { precision: 10, scale: 2 }).notNull(), // เงินเดือน
  leaveDaysRemaining: integer("leave_days_remaining").notNull().default(10), // วันลาคงเหลือ
  startDate: date("start_date").notNull(), // วันที่เริ่มทำงาน
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

/**
 * LangChain chat histories table
 * Stores chat message history for conversation context
 * Note: message column must be JSONB for PostgresChatMessageHistory
 */
export const chatHistoriesTable = pgTable("langchain_chat_histories", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull(),
  message: jsonb("message").notNull(), // JSONB type required by LangChain
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id", { length: 50 }), // User ID for filtering sessions
});
