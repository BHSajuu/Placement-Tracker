import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      password: args.password, // In production, hash this password
      startDate: new Date().toISOString(),
      createdAt: Date.now(),
    });

    return { userId, user: { name: args.name, email: args.email } };
  },
});

export const loginUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (!user || user.password !== args.password) {
      throw new Error("Invalid email or password");
    }

    return { userId: user._id, user: { name: user.name, email: user.email } };
  },
});

export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const updateStartDate = mutation({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      startDate: args.startDate,
    });
  },
});