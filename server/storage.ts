import { users, groups, groupMembers, materials, posts, comments, exams, messages } from "@shared/schema";
import type { User, InsertUser, Group, InsertGroup, GroupMember, InsertGroupMember, Material, InsertMaterial, Post, InsertPost, Comment, InsertComment, Exam, InsertExam, Message, InsertMessage } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { eq, desc, and, gte } from "drizzle-orm";

const MemoryStore = createMemoryStore(session);

// Initialize Supabase connection (only if DATABASE_URL is properly formatted)
let db: any = null;
if (process.env.DATABASE_URL && process.env.DATABASE_URL.startsWith('postgresql://')) {
  const sql = neon(process.env.DATABASE_URL);
  db = drizzle(sql);
}

// Define the storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Group operations
  createGroup(group: InsertGroup): Promise<Group>;
  getGroup(id: number): Promise<Group | undefined>;
  getGroups(): Promise<Group[]>;
  getUserGroups(userId: number): Promise<Group[]>;
  getPopularGroups(limit?: number): Promise<Group[]>;

  // Group members
  addGroupMember(member: InsertGroupMember): Promise<GroupMember>;
  getGroupMembers(groupId: number): Promise<GroupMember[]>;
  isUserInGroup(userId: number, groupId: number): Promise<boolean>;

  // Materials
  createMaterial(material: InsertMaterial): Promise<Material>;
  getMaterials(filters?: { groupId?: number }): Promise<Material[]>;
  getRecentMaterials(limit?: number): Promise<Material[]>;

  // Posts
  createPost(post: InsertPost): Promise<Post>;
  getPosts(filters?: { groupId?: number }): Promise<Post[]>;

  // Comments
  createComment(comment: InsertComment): Promise<Comment>;
  getPostComments(postId: number): Promise<Comment[]>;

  // Exams
  createExam(exam: InsertExam): Promise<Exam>;
  getExams(filters?: { userId?: number, groupId?: number }): Promise<Exam[]>;
  getUpcomingExams(userId: number, limit?: number): Promise<Exam[]>;

  // Messages
  createMessage(message: InsertMessage): Promise<Message>;
  getGroupMessages(groupId: number, limit?: number): Promise<Message[]>;

  // Session store for authentication
  sessionStore: ReturnType<typeof createMemoryStore>;
}

export class SupabaseStorage implements IStorage {
  sessionStore: ReturnType<typeof createMemoryStore>;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error('Database not properly configured');
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Group operations
  async createGroup(group: InsertGroup): Promise<Group> {
    const result = await db.insert(groups).values(group).returning();
    return result[0];
  }

  async getGroup(id: number): Promise<Group | undefined> {
    const result = await db.select().from(groups).where(eq(groups.id, id)).limit(1);
    return result[0];
  }

  async getGroups(): Promise<Group[]> {
    return await db.select().from(groups).orderBy(desc(groups.createdAt));
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    const result = await db
      .select({
        id: groups.id,
        name: groups.name,
        description: groups.description,
        isActive: groups.isActive,
        createdBy: groups.createdBy,
        createdAt: groups.createdAt,
      })
      .from(groups)
      .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
      .where(eq(groupMembers.userId, userId))
      .orderBy(desc(groups.createdAt));
    
    return result;
  }

  async getPopularGroups(limit: number = 5): Promise<Group[]> {
    return await db.select().from(groups).limit(limit).orderBy(desc(groups.createdAt));
  }

  // Group members
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const result = await db.insert(groupMembers).values(member).returning();
    return result[0];
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return await db.select().from(groupMembers).where(eq(groupMembers.groupId, groupId));
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(groupMembers)
      .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
      .limit(1);
    return result.length > 0;
  }

  // Materials
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const result = await db.insert(materials).values(material).returning();
    return result[0];
  }

  async getMaterials(filters: { groupId?: number } = {}): Promise<Material[]> {
    let query = db.select().from(materials);
    
    if (filters.groupId) {
      query = query.where(eq(materials.groupId, filters.groupId));
    }
    
    return await query.orderBy(desc(materials.uploadedAt));
  }

  async getRecentMaterials(limit: number = 5): Promise<Material[]> {
    return await db.select().from(materials).limit(limit).orderBy(desc(materials.uploadedAt));
  }

  // Posts
  async createPost(post: InsertPost): Promise<Post> {
    const result = await db.insert(posts).values(post).returning();
    return result[0];
  }

  async getPosts(filters: { groupId?: number } = {}): Promise<Post[]> {
    let query = db.select().from(posts);
    
    if (filters.groupId) {
      query = query.where(eq(posts.groupId, filters.groupId));
    }
    
    return await query.orderBy(desc(posts.createdAt));
  }

  // Comments
  async createComment(comment: InsertComment): Promise<Comment> {
    const result = await db.insert(comments).values(comment).returning();
    return result[0];
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(desc(comments.createdAt));
  }

  // Exams
  async createExam(exam: InsertExam): Promise<Exam> {
    const result = await db.insert(exams).values(exam).returning();
    return result[0];
  }

  async getExams(filters: { userId?: number, groupId?: number } = {}): Promise<Exam[]> {
    let query = db.select().from(exams);
    
    if (filters.groupId) {
      query = query.where(eq(exams.groupId, filters.groupId));
    } else if (filters.userId) {
      query = query.where(eq(exams.createdBy, filters.userId));
    }
    
    return await query.orderBy(exams.date);
  }

  async getUpcomingExams(userId: number, limit: number = 3): Promise<Exam[]> {
    const now = new Date();
    return await db
      .select()
      .from(exams)
      .where(and(eq(exams.createdBy, userId), gte(exams.date, now)))
      .limit(limit)
      .orderBy(exams.date);
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const result = await db.insert(messages).values(message).returning();
    return result[0];
  }

  async getGroupMessages(groupId: number, limit: number = 100): Promise<Message[]> {
    return await db
      .select()
      .from(messages)
      .where(eq(messages.groupId, groupId))
      .limit(limit)
      .orderBy(desc(messages.sentAt));
  }
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private groups: Map<number, Group>;
  private groupMembers: Map<number, GroupMember>;
  private materials: Map<number, Material>;
  private posts: Map<number, Post>;
  private comments: Map<number, Comment>;
  private exams: Map<number, Exam>;
  private messages: Map<number, Message>;

  sessionStore: ReturnType<typeof createMemoryStore>;
  
  private userIdCounter: number;
  private groupIdCounter: number;
  private groupMemberIdCounter: number;
  private materialIdCounter: number;
  private postIdCounter: number;
  private commentIdCounter: number;
  private examIdCounter: number;
  private messageIdCounter: number;

  constructor() {
    this.users = new Map();
    this.groups = new Map();
    this.groupMembers = new Map();
    this.materials = new Map();
    this.posts = new Map();
    this.comments = new Map();
    this.exams = new Map();
    this.messages = new Map();
    
    this.userIdCounter = 1;
    this.groupIdCounter = 1;
    this.groupMemberIdCounter = 1;
    this.materialIdCounter = 1;
    this.postIdCounter = 1;
    this.commentIdCounter = 1;
    this.examIdCounter = 1;
    this.messageIdCounter = 1;

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Clear expired sessions every 24h
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Group operations
  async createGroup(group: InsertGroup): Promise<Group> {
    const id = this.groupIdCounter++;
    const now = new Date();
    const newGroup: Group = { 
      ...group, 
      id, 
      isActive: true, 
      createdAt: now
    };
    this.groups.set(id, newGroup);
    return newGroup;
  }

  async getGroup(id: number): Promise<Group | undefined> {
    return this.groups.get(id);
  }

  async getGroups(): Promise<Group[]> {
    return Array.from(this.groups.values());
  }

  async getUserGroups(userId: number): Promise<Group[]> {
    const userGroupMemberships = Array.from(this.groupMembers.values())
      .filter(member => member.userId === userId)
      .map(member => member.groupId);
    
    return Array.from(this.groups.values())
      .filter(group => userGroupMemberships.includes(group.id));
  }

  async getPopularGroups(limit: number = 5): Promise<Group[]> {
    // Count members per group
    const groupMemberCounts = new Map<number, number>();
    
    Array.from(this.groupMembers.values()).forEach(member => {
      const currentCount = groupMemberCounts.get(member.groupId) || 0;
      groupMemberCounts.set(member.groupId, currentCount + 1);
    });
    
    // Sort groups by member count and return top ones
    return Array.from(this.groups.values())
      .sort((a, b) => {
        const countA = groupMemberCounts.get(a.id) || 0;
        const countB = groupMemberCounts.get(b.id) || 0;
        return countB - countA; // Descending order
      })
      .slice(0, limit);
  }

  // Group members
  async addGroupMember(member: InsertGroupMember): Promise<GroupMember> {
    const id = this.groupMemberIdCounter++;
    const now = new Date();
    const newMember: GroupMember = { ...member, id, joinedAt: now };
    this.groupMembers.set(id, newMember);
    return newMember;
  }

  async getGroupMembers(groupId: number): Promise<GroupMember[]> {
    return Array.from(this.groupMembers.values())
      .filter(member => member.groupId === groupId);
  }

  async isUserInGroup(userId: number, groupId: number): Promise<boolean> {
    return Array.from(this.groupMembers.values())
      .some(member => member.userId === userId && member.groupId === groupId);
  }

  // Materials
  async createMaterial(material: InsertMaterial): Promise<Material> {
    const id = this.materialIdCounter++;
    const now = new Date();
    const newMaterial: Material = { ...material, id, uploadedAt: now };
    this.materials.set(id, newMaterial);
    return newMaterial;
  }

  async getMaterials(filters: { groupId?: number } = {}): Promise<Material[]> {
    let result = Array.from(this.materials.values());
    
    if (filters.groupId !== undefined) {
      result = result.filter(material => material.groupId === filters.groupId);
    }
    
    return result;
  }

  async getRecentMaterials(limit: number = 5): Promise<Material[]> {
    return Array.from(this.materials.values())
      .sort((a, b) => b.uploadedAt.getTime() - a.uploadedAt.getTime())
      .slice(0, limit);
  }

  // Posts
  async createPost(post: InsertPost): Promise<Post> {
    const id = this.postIdCounter++;
    const now = new Date();
    const newPost: Post = { ...post, id, createdAt: now };
    this.posts.set(id, newPost);
    return newPost;
  }

  async getPosts(filters: { groupId?: number } = {}): Promise<Post[]> {
    let result = Array.from(this.posts.values());
    
    if (filters.groupId !== undefined) {
      result = result.filter(post => post.groupId === filters.groupId);
    }
    
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Comments
  async createComment(comment: InsertComment): Promise<Comment> {
    const id = this.commentIdCounter++;
    const now = new Date();
    const newComment: Comment = { ...comment, id, createdAt: now };
    this.comments.set(id, newComment);
    return newComment;
  }

  async getPostComments(postId: number): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  // Exams
  async createExam(exam: InsertExam): Promise<Exam> {
    const id = this.examIdCounter++;
    const newExam: Exam = { ...exam, id };
    this.exams.set(id, newExam);
    return newExam;
  }

  async getExams(filters: { userId?: number, groupId?: number } = {}): Promise<Exam[]> {
    let result = Array.from(this.exams.values());
    
    if (filters.groupId !== undefined) {
      result = result.filter(exam => exam.groupId === filters.groupId);
    }
    
    // For user, get all exams from groups they're part of
    if (filters.userId !== undefined) {
      const userGroups = Array.from(this.groupMembers.values())
        .filter(member => member.userId === filters.userId)
        .map(member => member.groupId);
      
      result = result.filter(exam => 
        exam.createdBy === filters.userId || 
        (exam.groupId && userGroups.includes(exam.groupId))
      );
    }
    
    return result.sort((a, b) => a.date.getTime() - b.date.getTime());
  }

  async getUpcomingExams(userId: number, limit: number = 3): Promise<Exam[]> {
    const now = new Date();
    const userExams = await this.getExams({ userId });
    
    return userExams
      .filter(exam => exam.date > now)
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .slice(0, limit);
  }

  // Messages
  async createMessage(message: InsertMessage): Promise<Message> {
    const id = this.messageIdCounter++;
    const now = new Date();
    const newMessage: Message = { ...message, id, sentAt: now };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  async getGroupMessages(groupId: number, limit: number = 100): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.groupId === groupId)
      .sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime())
      .slice(-limit);
  }
}

// Use SupabaseStorage if database is properly configured, otherwise fallback to MemStorage
export const storage = db ? new SupabaseStorage() : new MemStorage();
