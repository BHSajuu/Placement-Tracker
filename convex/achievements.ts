import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const createAchievement = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    description: v.string(),
    type: v.union(
      v.literal("daily"),
      v.literal("milestone"),
      v.literal("streak"),
      v.literal("topic")
    ),
    icon: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("achievements", {
      userId: args.userId,
      title: args.title,
      description: args.description,
      type: args.type,
      icon: args.icon,
      unlockedAt: Date.now(),
    });
  },
});

export const getUserAchievements = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("achievements")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});