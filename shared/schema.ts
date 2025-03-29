import { pgTable, text, serial, integer, boolean, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  displayName: text("display_name").notNull(),
  school: text("school"),
  avatarUrl: text("avatar_url"),
  agreedToTerms: boolean("agreed_to_terms").default(false),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  firstName: true,
  lastName: true,
  displayName: true,
  school: true,
  avatarUrl: true,
  agreedToTerms: true,
});

export const groups = pgTable("groups", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGroupSchema = createInsertSchema(groups).pick({
  name: true,
  description: true,
  createdBy: true,
});

export const groupMembers = pgTable("group_members", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  groupId: integer("group_id").notNull(),
  joinedAt: timestamp("joined_at").defaultNow(),
});

export const insertGroupMemberSchema = createInsertSchema(groupMembers).pick({
  userId: true,
  groupId: true,
});

export const materials = pgTable("materials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(),  // pdf, doc, image, link
  url: text("url").notNull(),
  subject: text("subject"),
  groupId: integer("group_id"),
  uploadedBy: integer("uploaded_by").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const insertMaterialSchema = createInsertSchema(materials).pick({
  name: true,
  description: true,
  type: true,
  url: true,
  subject: true,
  groupId: true,
  uploadedBy: true,
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  groupId: integer("group_id"),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPostSchema = createInsertSchema(posts).pick({
  title: true,
  content: true,
  groupId: true,
  createdBy: true,
});

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  postId: integer("post_id").notNull(),
  createdBy: integer("created_by").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCommentSchema = createInsertSchema(comments).pick({
  content: true,
  postId: true,
  createdBy: true,
});

export const exams = pgTable("exams", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  subject: text("subject"),
  date: timestamp("date").notNull(),
  location: text("location"),
  groupId: integer("group_id"),
  createdBy: integer("created_by").notNull(),
});

export const insertExamSchema = createInsertSchema(exams).pick({
  title: true,
  description: true,
  subject: true,
  date: true,
  location: true,
  groupId: true,
  createdBy: true,
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  groupId: integer("group_id").notNull(),
  userId: integer("user_id").notNull(),
  sentAt: timestamp("sent_at").defaultNow(),
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  groupId: true,
  userId: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Group = typeof groups.$inferSelect;
export type InsertGroup = z.infer<typeof insertGroupSchema>;

export type GroupMember = typeof groupMembers.$inferSelect;
export type InsertGroupMember = z.infer<typeof insertGroupMemberSchema>;

export type Material = typeof materials.$inferSelect;
export type InsertMaterial = z.infer<typeof insertMaterialSchema>;

export type Post = typeof posts.$inferSelect;
export type InsertPost = z.infer<typeof insertPostSchema>;

export type Comment = typeof comments.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;

export type Exam = typeof exams.$inferSelect;
export type InsertExam = z.infer<typeof insertExamSchema>;

export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
