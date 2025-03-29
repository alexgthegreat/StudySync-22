import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./auth";
import { setupWebsocketServer } from "./websocket";
import { z } from "zod";
import { insertGroupSchema, insertMaterialSchema, insertPostSchema, insertCommentSchema, insertExamSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up the HTTP server
  const httpServer = createServer(app);
  
  // Setup auth routes
  setupAuth(app);
  
  // Setup WebSocket server
  setupWebsocketServer(httpServer);
  
  // Health check endpoint for Render and other hosting platforms
  app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Groups API
  app.get("/api/groups", async (req, res) => {
    try {
      const groups = await storage.getGroups();
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch groups" });
    }
  });

  app.get("/api/groups/popular", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const groups = await storage.getPopularGroups(limit);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch popular groups" });
    }
  });

  app.get("/api/groups/my-groups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groups = await storage.getUserGroups(req.user.id);
      res.json(groups);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user's groups" });
    }
  });

  app.post("/api/groups", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertGroupSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const group = await storage.createGroup(validatedData);
      
      // Automatically add creator as a member
      await storage.addGroupMember({
        userId: req.user.id,
        groupId: group.id
      });
      
      res.status(201).json(group);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create group" });
    }
  });

  app.get("/api/groups/:id", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      res.json(group);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group" });
    }
  });

  app.post("/api/groups/:id/join", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      const isAlreadyMember = await storage.isUserInGroup(req.user.id, groupId);
      if (isAlreadyMember) {
        return res.status(400).json({ message: "User is already a member of this group" });
      }
      
      const membership = await storage.addGroupMember({
        userId: req.user.id,
        groupId
      });
      
      res.status(201).json(membership);
    } catch (error) {
      res.status(500).json({ message: "Failed to join group" });
    }
  });

  app.get("/api/groups/:id/members", async (req, res) => {
    try {
      const groupId = parseInt(req.params.id);
      const members = await storage.getGroupMembers(groupId);
      
      // Get user details for each member
      const memberDetails = await Promise.all(
        members.map(async (member) => {
          const user = await storage.getUser(member.userId);
          return {
            ...member,
            user: user ? { 
              id: user.id, 
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl,
              school: user.school
            } : null
          };
        })
      );
      
      res.json(memberDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch group members" });
    }
  });

  // Materials API
  app.post("/api/materials", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertMaterialSchema.parse({
        ...req.body,
        uploadedBy: req.user.id
      });
      
      const material = await storage.createMaterial(validatedData);
      res.status(201).json(material);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create material" });
    }
  });

  app.get("/api/materials", async (req, res) => {
    try {
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const materials = await storage.getMaterials({ groupId });
      
      // Get uploader details
      const materialsWithUsers = await Promise.all(
        materials.map(async (material) => {
          const user = await storage.getUser(material.uploadedBy);
          return {
            ...material,
            uploader: user ? { 
              id: user.id, 
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      res.json(materialsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch materials" });
    }
  });

  app.get("/api/materials/recent", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
      const materials = await storage.getRecentMaterials(limit);
      
      // Get uploader details
      const materialsWithUsers = await Promise.all(
        materials.map(async (material) => {
          const user = await storage.getUser(material.uploadedBy);
          return {
            ...material,
            uploader: user ? { 
              id: user.id, 
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      res.json(materialsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch recent materials" });
    }
  });

  // Posts API
  app.post("/api/posts", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertPostSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const post = await storage.createPost(validatedData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create post" });
    }
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const posts = await storage.getPosts({ groupId });
      
      // Get creator details and comment counts
      const postsWithDetails = await Promise.all(
        posts.map(async (post) => {
          const user = await storage.getUser(post.createdBy);
          const comments = await storage.getPostComments(post.id);
          
          return {
            ...post,
            creator: user ? { 
              id: user.id, 
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl
            } : null,
            commentCount: comments.length
          };
        })
      );
      
      res.json(postsWithDetails);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch posts" });
    }
  });

  app.post("/api/posts/:id/comments", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const postId = parseInt(req.params.id);
      
      const validatedData = insertCommentSchema.parse({
        content: req.body.content,
        postId,
        createdBy: req.user.id
      });
      
      const comment = await storage.createComment(validatedData);
      res.status(201).json(comment);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create comment" });
    }
  });

  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const postId = parseInt(req.params.id);
      const comments = await storage.getPostComments(postId);
      
      // Get creator details
      const commentsWithUsers = await Promise.all(
        comments.map(async (comment) => {
          const user = await storage.getUser(comment.createdBy);
          return {
            ...comment,
            creator: user ? { 
              id: user.id, 
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      res.json(commentsWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch comments" });
    }
  });

  // Exams API
  app.post("/api/exams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const validatedData = insertExamSchema.parse({
        ...req.body,
        createdBy: req.user.id
      });
      
      const exam = await storage.createExam(validatedData);
      res.status(201).json(exam);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data format", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create exam" });
    }
  });

  app.get("/api/exams", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = req.query.groupId ? parseInt(req.query.groupId as string) : undefined;
      const exams = await storage.getExams({ 
        userId: req.user.id,
        groupId
      });
      
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch exams" });
    }
  });

  app.get("/api/exams/upcoming", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
      const exams = await storage.getUpcomingExams(req.user.id, limit);
      res.json(exams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch upcoming exams" });
    }
  });

  // Chat messages API
  app.get("/api/groups/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const groupId = parseInt(req.params.id);
      const group = await storage.getGroup(groupId);
      
      if (!group) {
        return res.status(404).json({ message: "Group not found" });
      }
      
      const isGroupMember = await storage.isUserInGroup(req.user.id, groupId) || group.createdBy === req.user.id;
      
      if (!isGroupMember) {
        return res.status(403).json({ message: "User is not a member of this group" });
      }
      
      const messages = await storage.getGroupMessages(groupId);
      
      // Get user details for each message
      const messagesWithUsers = await Promise.all(
        messages.map(async (message) => {
          const user = await storage.getUser(message.userId);
          return {
            ...message,
            user: user ? { 
              id: user.id, 
              username: user.username,
              displayName: user.displayName,
              avatarUrl: user.avatarUrl
            } : null
          };
        })
      );
      
      res.json(messagesWithUsers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  return httpServer;
}
