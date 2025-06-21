import { useState, useEffect } from 'react';
import { Dashboard } from './components/Dashboard';
import { TaskManager } from './components/TaskManager';
import { ProgressTracker } from './components/ProgressTracker';
import { StrikeChart } from './components/StrikeChart';
import { RewardPopup } from './components/RewardPopup';
import { useConvexData } from './hooks/useConvexData';
import { useAuth } from './hooks/useAuth';
import { Task, UserProgress, Achievement, UserGoals } from './types';
import { BarChart3, CheckSquare, Target, Activity } from 'lucide-react';


function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null);
  
  const { isAuthenticated } = useAuth();
  const {
    userId,
    user,
    userGoals,
    userProgress,
    tasks,
    milestones,
    achievements,
    updateStartDate,
    createOrUpdateGoals,
    createOrUpdateProgress,
    createTask,
    toggleTask,
    deleteTask,
    createDefaultMilestones,
    updateMilestone,
    createAchievement,
  } = useConvexData();

  // Initialize default milestones when user is authenticated and has goals
  useEffect(() => {
    if (isAuthenticated && userId && userGoals && milestones.length === 0) {
      createDefaultMilestones();
    }
  }, [isAuthenticated, userId, userGoals, milestones, createDefaultMilestones]);

  // Initialize default user progress if not exists
  useEffect(() => {
    if (isAuthenticated && userId && userGoals && !userProgress) {
      createOrUpdateProgress({
        totalXP: 0,
        level: 1,
        currentStreak: 0,
        longestStreak: 0,
        completedTasks: 0,
        dailyHistory: {},
        dsaQuestionsHistory: {},
        dsaTopicsProgress: {},
        dsTopicProgress: {},
      });
    }
  }, [isAuthenticated, userId, userGoals, userProgress, createOrUpdateProgress]);

  const addTask = async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    if (!isAuthenticated || !userId) return;
    
    await createTask({
      title: taskData.title,
      category: taskData.category,
      timeSlot: taskData.timeSlot,
      xp: taskData.xp,
      questionsCount: taskData.questionsCount,
      dsaTopicName: taskData.dsaTopicName,
      dataScienceTopicName: taskData.dataScienceTopicName,
      projectName: taskData.projectName,
      caseStudyName: taskData.caseStudyName,
      tutorialCount: taskData.tutorialCount,
      sessionCount: taskData.sessionCount,
      chapterName: taskData.chapterName,
    });
  };

  const calculateSmartProgress = (task: Task, isCompleting: boolean) => {
    if (!userGoals) return 0;

    switch (task.category) {
      case 'DSA':
        return task.questionsCount || 1;
      case 'Web Dev':
        return task.projectName ? 1 : 0;
      case 'System Design':
        return task.caseStudyName ? 1 : 0;
      case 'Data Science':
        return task.tutorialCount || 1;
      case 'Mock Interview':
      case 'English Speaking Practice':
        return task.sessionCount || 1;
      case 'CS Fundamentals':
        return task.chapterName ? 1 : 0;
      default:
        return 1;
    }
  };

  const updateDSATopicProgress = async (task: Task, isCompleting: boolean, newProgress: UserProgress) => {
    if (task.category !== 'DSA' || !task.dsaTopicName || !userGoals?.dsaTopics) return;

    const topicName = task.dsaTopicName;
    const questionsCount = task.questionsCount || 1;

    if (!newProgress.dsaTopicsProgress[topicName]) {
      const topic = userGoals.dsaTopics.find(t => t.name === topicName);
      newProgress.dsaTopicsProgress[topicName] = {
        questionsCompleted: 0,
        totalQuestions: topic?.targetQuestions || 0,
        completed: false
      };
    }

    const topicProgress = newProgress.dsaTopicsProgress[topicName];

    if (isCompleting) {
      topicProgress.questionsCompleted += questionsCount;

      if (!topicProgress.completed && topicProgress.questionsCompleted >= topicProgress.totalQuestions) {
        topicProgress.completed = true;

        const achievement = {
          title: `${topicName} Mastered!`,
          description: `Completed all questions in ${topicName}`,
          type: 'topic' as const,
          icon: 'trophy',
        };
        
        await createAchievement(achievement);
        
        newProgress.totalXP += 150;
        setCurrentAchievement({
          id: `temp_${Date.now()}`,
          ...achievement,
          unlockedAt: new Date()
        });
      }
    } else {
      topicProgress.questionsCompleted = Math.max(0, topicProgress.questionsCompleted - questionsCount);
      if (topicProgress.completed && topicProgress.questionsCompleted < topicProgress.totalQuestions) {
        topicProgress.completed = false;
        newProgress.totalXP = Math.max(0, newProgress.totalXP - 150);
      }
    }
  };

  const updateDSTopicProgress = async (task: Task, isCompleting: boolean, newProgress: UserProgress) => {
    if (task.category !== 'Data Science' || !task.dataScienceTopicName || !userGoals?.dataScienceTopics) return;

    const topicName = task.dataScienceTopicName;
    const tutorials = task.tutorialCount || 1;

    if (!newProgress.dsTopicProgress[topicName]) {
      const topic = userGoals.dataScienceTopics.find(t => t.name === topicName);
      newProgress.dsTopicProgress[topicName] = {
        tutorialsCompleted: 0,
        totalTutorials: topic?.targetTutorials || 0,
        completed: false
      };
    }

    const topicProgress = newProgress.dsTopicProgress[topicName];
    
    if (isCompleting) {
      topicProgress.tutorialsCompleted += tutorials;
      if (!topicProgress.completed && topicProgress.tutorialsCompleted >= topicProgress.totalTutorials) {
        topicProgress.completed = true;
        
        const achievement = {
          title: `${topicName} Tutorials Completed!`,
          description: `Finished all tutorials for ${topicName}`,
          type: 'topic' as const,
          icon: 'trophy',
        };
        
        await createAchievement(achievement);
        
        newProgress.totalXP += 150;
        setCurrentAchievement({
          id: `temp_${Date.now()}`,
          ...achievement,
          unlockedAt: new Date()
        });
      }
    } else {
      topicProgress.tutorialsCompleted = Math.max(0, topicProgress.tutorialsCompleted - tutorials);
      if (topicProgress.completed && topicProgress.tutorialsCompleted < topicProgress.totalTutorials) {
        topicProgress.completed = false;
        newProgress.totalXP = Math.max(0, newProgress.totalXP - 150);
      }
    }
  };

  const checkDailyMilestones = async (todayTasks: Task[], newProgress: UserProgress) => {
    const today = new Date().toISOString().split('T')[0];
    const todayCompletedTasks = todayTasks.filter(task =>
      task.completed &&
      task.completedAt &&
      task.completedAt.toISOString().split('T')[0] === today
    );

    const dsaTasks = todayCompletedTasks.filter(task => task.category === 'DSA').length;
    const webDevTasks = todayCompletedTasks.filter(task => task.category === 'Web Dev').length;
    const totalTodayTasks = todayCompletedTasks.length;

    // Check for achievements that haven't been unlocked today
    const todayAchievements = achievements.filter(a => 
      a.unlockedAt.toISOString().split('T')[0] === today
    );

    if (dsaTasks >= 10 && !todayAchievements.some(a => a.title === 'DSA Daily Champion')) {
      const achievement = {
        title: 'DSA Daily Champion',
        description: 'Solved 10+ DSA problems in a day!',
        type: 'daily' as const,
        icon: 'trophy',
      };
      
      await createAchievement(achievement);
      newProgress.totalXP += 100;
      setCurrentAchievement({
        id: `temp_${Date.now()}`,
        ...achievement,
        unlockedAt: new Date()
      });
    }

    if (webDevTasks >= 3 && !todayAchievements.some(a => a.title === 'Web Dev Daily Master')) {
      const achievement = {
        title: 'Web Dev Daily Master',
        description: 'Completed 3+ Web Dev tasks in a day!',
        type: 'daily' as const,
        icon: 'trophy',
      };
      
      await createAchievement(achievement);
      newProgress.totalXP += 100;
      setCurrentAchievement({
        id: `temp_${Date.now()}`,
        ...achievement,
        unlockedAt: new Date()
      });
    }

    if (totalTodayTasks >= 10 && !todayAchievements.some(a => a.title === 'Productivity Beast')) {
      const achievement = {
        title: 'Productivity Beast',
        description: 'Completed 10+ tasks in a single day!',
        type: 'daily' as const,
        icon: 'trophy',
      };
      
      await createAchievement(achievement);
      newProgress.totalXP += 200;
      setCurrentAchievement({
        id: `temp_${Date.now()}`,
        ...achievement,
        unlockedAt: new Date()
      });
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!isAuthenticated || !userId || !userProgress) return;

    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await toggleTask(taskId, !task.completed);

    // Update progress
    const today = new Date().toISOString().split('T')[0];
    let newProgress = { ...userProgress };

    if (!task.completed) {
      // Task completed
      newProgress.totalXP += task.xp;
      newProgress.completedTasks += 1;
      newProgress.level = Math.floor(newProgress.totalXP / 1000) + 1;

      // Update daily history
      newProgress.dailyHistory[today] = (newProgress.dailyHistory[today] || 0) + 1;

      // Update DSA questions history if it's a DSA task
      if (task.category === 'DSA' && task.questionsCount) {
        newProgress.dsaQuestionsHistory[today] = (newProgress.dsaQuestionsHistory[today] || 0) + task.questionsCount;
      }

      // Update topic progress
      await updateDSATopicProgress(task, true, newProgress);
      await updateDSTopicProgress(task, true, newProgress);

      // Update milestones
      const smartProgressIncrement = calculateSmartProgress(task, true);
      const relatedMilestones = milestones.filter(m => m.category === task.category);
      
      for (const milestone of relatedMilestones) {
        if (!milestone.completed && milestone.current < milestone.target) {
          const newCurrent = milestone.current + smartProgressIncrement;
          const isCompleted = newCurrent >= milestone.target;
          
          await updateMilestone(milestone.id, newCurrent, isCompleted);
          
          if (isCompleted) {
            newProgress.totalXP += milestone.xp;
            
            const achievement = {
              title: `${milestone.title} Complete!`,
              description: milestone.description,
              type: 'milestone' as const,
              icon: 'trophy',
            };
            
            await createAchievement(achievement);
            setCurrentAchievement({
              id: `temp_${Date.now()}`,
              ...achievement,
              unlockedAt: new Date()
            });
          }
        }
      }

      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      const prevTodayCount = (newProgress.dailyHistory[today] || 1) - 1;
      
      if (prevTodayCount === 0) {
        const yesterdayCount = newProgress.dailyHistory[yesterdayStr] || 0;
        if (yesterdayCount > 0) {
          newProgress.currentStreak += 1;
        } else {
          newProgress.currentStreak = 1;
        }
        newProgress.longestStreak = Math.max(newProgress.longestStreak, newProgress.currentStreak);
        
        if (newProgress.currentStreak === 7) {
          const achievement = {
            title: 'Week Warrior',
            description: 'Maintained a 7-day streak!',
            type: 'streak' as const,
            icon: 'flame',
          };
          
          await createAchievement(achievement);
          setCurrentAchievement({
            id: `temp_${Date.now()}`,
            ...achievement,
            unlockedAt: new Date()
          });
        }
      }

      // Check daily milestones
      await checkDailyMilestones([...tasks, { ...task, completed: true }], newProgress);

    } else {
      // Task uncompleted
      newProgress.totalXP = Math.max(0, newProgress.totalXP - task.xp);
      newProgress.completedTasks = Math.max(0, newProgress.completedTasks - 1);
      newProgress.level = Math.floor(newProgress.totalXP / 1000) + 1;

      // Update daily history
      newProgress.dailyHistory[today] = Math.max(0, (newProgress.dailyHistory[today] || 0) - 1);

      // Update DSA questions history if it's a DSA task
      if (task.category === 'DSA' && task.questionsCount) {
        newProgress.dsaQuestionsHistory[today] = Math.max(0, (newProgress.dsaQuestionsHistory[today] || 0) - task.questionsCount);
      }

      // Update topic progress
      await updateDSATopicProgress(task, false, newProgress);
      await updateDSTopicProgress(task, false, newProgress);

      // Reverse milestone progress
      const smartProgressDecrement = calculateSmartProgress(task, false);
      const relatedMilestones = milestones.filter(m => m.category === task.category);
      
      for (const milestone of relatedMilestones) {
        const newCurrent = Math.max(0, milestone.current - smartProgressDecrement);
        const wasCompleted = milestone.completed;
        const isCompleted = wasCompleted && newCurrent >= milestone.target;
        
        await updateMilestone(milestone.id, newCurrent, isCompleted);
        
        if (wasCompleted && !isCompleted) {
          newProgress.totalXP = Math.max(0, newProgress.totalXP - milestone.xp);
        }
      }
    }

    // Save updated progress
    await createOrUpdateProgress({
      totalXP: newProgress.totalXP,
      level: newProgress.level,
      currentStreak: newProgress.currentStreak,
      longestStreak: newProgress.longestStreak,
      completedTasks: newProgress.completedTasks,
      dailyHistory: newProgress.dailyHistory,
      dsaQuestionsHistory: newProgress.dsaQuestionsHistory,
      dsaTopicsProgress: newProgress.dsaTopicsProgress,
      dsTopicProgress: newProgress.dsTopicProgress,
    });
  };

  const handleDeleteTask = async (taskId: string) => {
    await deleteTask(taskId);
  };

  const updateGoals = async (goals: UserGoals) => {
    if (!isAuthenticated || !userId) return;
    
    await createOrUpdateGoals(goals);
  };

  const resetJourney = async () => {
    if (!isAuthenticated || !userId) return;
    
    // Reset start date
    await updateStartDate(new Date().toISOString());

    // Reset progress
    await createOrUpdateProgress({
      totalXP: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      completedTasks: 0,
      dailyHistory: {},
      dsaQuestionsHistory: {},
      dsaTopicsProgress: {},
      dsTopicProgress: {},
    });

    // Delete all tasks
    for (const task of tasks) {
      await deleteTask(task.id);
    }

    // Reset milestones
    for (const milestone of milestones) {
      await updateMilestone(milestone.id, 0, false);
    }

    setCurrentAchievement(null);
    setActiveTab('dashboard');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <Target className="w-4 h-4" /> },
    { id: 'activity', label: 'Activity', icon: <Activity className="w-4 h-4" /> }
  ];

  const defaultUserProgress: UserProgress = {
    totalXP: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    completedTasks: 0,
    achievements: [],
    dailyHistory: {},
    dsaQuestionsHistory: {},
    dsaTopicsProgress: {},
    dsTopicProgress: {},
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 transition-colors duration-300">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="bg-gray-800 rounded-xl shadow-lg mb-8 p-1">
          <nav className="flex flex-nowrap overflow-x-auto md:overflow-hidden space-x-4 lg:space-x-16 px-2 no-scrollbar">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="transition-all duration-300">
          {activeTab === 'dashboard' && (
            <Dashboard
              userProgress={userProgress || defaultUserProgress}
              startDate={user ? new Date(user.startDate) : new Date()}
              userGoals={userGoals}
              onResetJourney={resetJourney}
              onUpdateGoals={updateGoals}
            />
          )}

          {activeTab === 'tasks' && isAuthenticated && (
            <TaskManager
              tasks={tasks}
              userGoals={userGoals}
              onAddTask={addTask}
              onToggleTask={handleToggleTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

          {activeTab === 'progress' && isAuthenticated && (
            <ProgressTracker
              userProgress={userProgress || defaultUserProgress}
              milestones={milestones}
              userGoals={userGoals}
              tasks={tasks}
            />
          )}

          {activeTab === 'activity' && isAuthenticated && (
            <StrikeChart userProgress={userProgress || defaultUserProgress} />
          )}

          {/* Show authentication required message for protected tabs */}
          {!isAuthenticated && ['tasks', 'progress', 'activity'].includes(activeTab) && (
            <div className="bg-gray-800 rounded-xl p-8 text-center">
              <h2 className="text-xl font-bold text-white mb-4">Authentication Required</h2>
              <p className="text-gray-400 mb-6">Please sign in to access this feature.</p>
              <button
                onClick={() => setActiveTab('dashboard')}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reward Popup */}
      <RewardPopup
        achievement={currentAchievement}
        onClose={() => setCurrentAchievement(null)}
      />
    </div>
  );
}

export default App;