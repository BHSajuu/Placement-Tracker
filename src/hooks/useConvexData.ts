import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useAuth } from "./useAuth";
import { UserGoals, UserProgress, Task, Milestone, Achievement } from "../types";
import { Id } from "../../convex/_generated/dataModel";

export function useConvexData() {
  const { userId, isAuthenticated } = useAuth();

  // Queries
  const user = useQuery(api.users.getUser, userId ? { userId } : "skip");
  const userGoals = useQuery(api.userGoals.getUserGoals, userId ? { userId } : "skip");
  const userProgress = useQuery(api.userProgress.getUserProgress, userId ? { userId } : "skip");
  const tasks = useQuery(api.tasks.getUserTasks, userId ? { userId } : "skip");
  const milestones = useQuery(api.milestones.getUserMilestones, userId ? { userId } : "skip");
  const achievements = useQuery(api.achievements.getUserAchievements, userId ? { userId } : "skip");

  // Mutations
  const updateStartDate = useMutation(api.users.updateStartDate);
  const createOrUpdateGoals = useMutation(api.userGoals.createOrUpdateGoals);
  const createOrUpdateProgress = useMutation(api.userProgress.createOrUpdateProgress);
  const createTask = useMutation(api.tasks.createTask);
  const toggleTask = useMutation(api.tasks.toggleTask);
  const deleteTask = useMutation(api.tasks.deleteTask);
  const createDefaultMilestones = useMutation(api.milestones.createDefaultMilestones);
  const updateMilestone = useMutation(api.milestones.updateMilestone);
  const createAchievement = useMutation(api.achievements.createAchievement);

  // Helper functions to convert Convex data to app types
  const convertTask = (convexTask: any): Task => ({
    id: convexTask._id,
    title: convexTask.title,
    category: convexTask.category,
    timeSlot: convexTask.timeSlot,
    completed: convexTask.completed,
    createdAt: new Date(convexTask.createdAt),
    completedAt: convexTask.completedAt ? new Date(convexTask.completedAt) : undefined,
    questionsCount: convexTask.questionsCount,
    dsaTopicName: convexTask.dsaTopicName,
    dataScienceTopicName: convexTask.dataScienceTopicName,
    projectName: convexTask.projectName,
    caseStudyName: convexTask.caseStudyName,
    tutorialCount: convexTask.tutorialCount,
    sessionCount: convexTask.sessionCount,
    chapterName: convexTask.chapterName,
  });

  const convertMilestone = (convexMilestone: any): Milestone => ({
    id: convexMilestone._id,
    title: convexMilestone.title,
    description: convexMilestone.description,
    category: convexMilestone.category,
    target: convexMilestone.target,
    current: convexMilestone.current,
    completed: convexMilestone.completed,
  });

  const convertAchievement = (convexAchievement: any): Achievement => ({
    id: convexAchievement._id,
    title: convexAchievement.title,
    description: convexAchievement.description,
    type: convexAchievement.type,
    icon: convexAchievement.icon,
    unlockedAt: new Date(convexAchievement.unlockedAt),
  });

  const convertUserProgress = (convexProgress: any): UserProgress => ({
    currentStreak: convexProgress.currentStreak,
    longestStreak: convexProgress.longestStreak,
    completedTasks: convexProgress.completedTasks,
    achievements: achievements?.map(convertAchievement) || [],
    dailyHistory: convexProgress.dailyHistory,
    dsaQuestionsHistory: convexProgress.dsaQuestionsHistory,
    dsaTopicsProgress: convexProgress.dsaTopicsProgress,
    dsTopicProgress: convexProgress.dsTopicProgress,
  });

  return {
    userId,
    isAuthenticated,
    user,
    userGoals: userGoals as UserGoals | undefined,
    userProgress: userProgress ? convertUserProgress(userProgress) : undefined,
    tasks: tasks?.map(convertTask) || [],
    milestones: milestones?.map(convertMilestone) || [],
    achievements: achievements?.map(convertAchievement) || [],
    
    // Mutations
    updateStartDate: (startDate: string) => 
      userId ? updateStartDate({ userId, startDate }) : Promise.resolve(),
    createOrUpdateGoals: (goals: Omit<UserGoals, 'userId'>) =>
      userId ? createOrUpdateGoals({ userId, ...goals }) : Promise.resolve(),
    createOrUpdateProgress: (progress: Omit<UserProgress, 'achievements'>) =>
      userId ? createOrUpdateProgress({ userId, ...progress }) : Promise.resolve(),
    createTask: (task: Omit<Task, 'id' | 'createdAt' | 'completed'>) =>
      userId ? createTask({ userId, ...task }) : Promise.resolve(),
    toggleTask: (taskId: string, completed: boolean) => 
      toggleTask({ taskId: taskId as Id<"tasks">, completed }),
    deleteTask: (taskId: string) => 
      deleteTask({ taskId: taskId as Id<"tasks"> }),
    createDefaultMilestones: () =>
      userId ? createDefaultMilestones({ userId }) : Promise.resolve(),
    updateMilestone: (milestoneId: string, current: number, completed: boolean) =>
      updateMilestone({ milestoneId: milestoneId as Id<"milestones">, current, completed }),
    createAchievement: (achievement: Omit<Achievement, 'id' | 'unlockedAt'>) =>
      userId ? createAchievement({ userId, ...achievement }) : Promise.resolve(),
  };
}