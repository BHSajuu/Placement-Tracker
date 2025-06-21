import React, { useState } from 'react';
import { Calendar, Target, Flame, Trophy, RefreshCw, Hash, Settings, LogOut } from 'lucide-react';
import { UserProgress, UserGoals } from '../types';
import { getRandomQuote } from '../utils/motivationalQuotes';
import { GoalSetupDialog } from './GoalSetupDialog';
import { AuthDialog } from './AuthDialog';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface DashboardProps {
  userProgress: UserProgress;
  startDate: Date;
  userGoals?: UserGoals;
  onResetJourney: () => void;
  onUpdateGoals: (goals: UserGoals) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  userProgress,
  startDate,
  userGoals,
  onResetJourney,
  onUpdateGoals
}) => {
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const { isAuthenticated, user, register, login, logout } = useAuth();
  const today = new Date();

  // Normalize dates to local midnight to count calendar days
  const toLocalMidnight = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const startMidnight = toLocalMidnight(startDate);
  const todayMidnight = toLocalMidnight(today);

  const daysPassed = Math.floor(
    (todayMidnight.getTime() - startMidnight.getTime())
    / (1000 * 60 * 60 * 24)
  ) + 1;
  const daysRemaining = Math.max(60 - daysPassed, 0);

  const todayStr = today.toISOString().split('T')[0];
  const todayTasks = userProgress.dailyHistory[todayStr] || 0;
  const todayDSAQuestions = userProgress.dsaQuestionsHistory[todayStr] || 0;



  const handleGoalSetup = () => {
    setShowGoalDialog(true);
  };

  const handleAuthSuccess = () => {
    // After successful auth, show goal setup if no goals exist
    if (!userGoals) {
      setShowGoalDialog(true);
    }
  };

  const stats = [
    {
      title: 'Current Streak',
      value: userProgress.currentStreak,
      icon: <Flame className="w-5 h-5" />,
      color: 'from-orange-500 to-red-500',
      suffix: 'days'
    },
    {
      title: 'Total XP',
      value: userProgress.totalXP.toLocaleString(),
      icon: <Trophy className="w-5 h-5" />,
      color: 'from-yellow-500 to-orange-500',
      suffix: 'XP'
    },
    {
      title: 'Tasks Today',
      value: todayTasks,
      icon: <Target className="w-5 h-5" />,
      color: 'from-green-500 to-teal-500',
      suffix: 'completed'
    },
    {
      title: 'DSA Questions Today',
      value: todayDSAQuestions,
      icon: <Hash className="w-5 h-5" />,
      color: 'from-blue-500 to-purple-500',
      suffix: 'solved'
    }
  ];

  // Define color palettes for achievements
  const achievementPalettes = [
    { bg: 'from-green-500 to-teal-500', text: 'text-gray-800' },
    { bg: 'from-blue-500 to-purple-500', text: 'text-white' },
    { bg: 'from-yellow-500 to-orange-700', text: 'text-gray-900' },
    { bg: 'from-pink-500 to-red-500', text: 'text-white' },
    { bg: 'from-indigo-500 to-blue-500', text: 'text-white' },
    { bg: 'from-gray-500 to-gray-700', text: 'text-white' },
    { bg: 'from-red-400 to-red-600', text: 'text-white' },
    { bg: 'from-purple-400 to-purple-600', text: 'text-white' },
    { bg: 'from-orange-400 to-orange-600', text: 'text-gray-900' },
    { bg: 'from-cyan-400 to-cyan-600', text: 'text-gray-900' },
    { bg: 'from-pink-400 to-pink-600', text: 'text-white' },
    { bg: 'from-yellow-400 to-yellow-600', text: 'text-gray-900' }
  ];

  // Randomly pick a palette for each achievement
  const getAchievementStyle = () => {
    const idx = Math.floor(Math.random() * achievementPalettes.length);
    return achievementPalettes[idx];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-0 items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            MAANG placement preparation tracker
          </h1>
          <p className={`text-purple-300  mt-3   ${isAuthenticated && user ? 'text-2xl font-semibold ' : ''}`}>
            {isAuthenticated && user ? `Welcome back, ${user.name}!` : 'Welcome to your prep journey!'}
          </p>
          <p className="text-gray-400 text-sm">
            {today.toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>

        <div className="flex gap-3">
          {isAuthenticated ? (
            <>
              {userGoals && (
                <>
                  <button
                    onClick={handleGoalSetup}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Update Goals
                  </button>
                  <button
                    onClick={() => setShowResetModal(true)}
                    className="btn bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                    New Journey
                  </button>
                </>
              )}
              <button
                onClick={logout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowAuthDialog(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Get Started
            </button>
          )}
        </div>
      </div>

      {/* Authentication Required Prompt */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg border-2 border-blue-400">
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-0 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Welcome to Your MAANG Prep Journey!</h2>
              <p className="text-blue-100">
                Create your account to start tracking your progress and set personalized 60-day goals.
              </p>
            </div>
            <button
              onClick={() => setShowAuthDialog(true)}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Goal Setup Prompt */}
      {isAuthenticated && !userGoals && (
        <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white shadow-lg border-2 border-green-400">
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-0 items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">Set Your 60-Day Goals!</h2>
              <p className="text-green-100">
                Define your personalized goals to get started with smart progress tracking.
              </p>
            </div>
            <button
              onClick={handleGoalSetup}
              className="bg-white text-green-600 px-6 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
            >
              Set Goals
            </button>
          </div>
        </div>
      )}

      {/* Countdown Timer */}
      {isAuthenticated && userGoals && (
        <div className="bg-gradient-to-r from-slate-800 to-[#7886C7] rounded-xl p-6 text-white shadow-lg hover:shadow-lg hover:shadow-blue-300/30 transition-shadow hover:cursor-pointer">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">Day {daysPassed} of 60</h2>
              <p className="text-yellow-600 text-lg">
                {daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Preparation Complete!'}
              </p>
            </div>
            <div className="text-right">
              <div className="bg-black/65 rounded-lg p-3">
                <Calendar className="w-8 h-8 mb-2" />
                <div className="text-sm font-medium">
                  {Math.round((daysPassed / 60) * 100)}%
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 bg-white/20 rounded-full h-2">
            <div
              className="bg-[#26dc72] rounded-full h-full transition-all duration-500"
              style={{ width: `${Math.min((daysPassed / 60) * 100, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Motivational Quote */}
      {isAuthenticated && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-green-500 hover:shadow-lg hover:shadow-blue-300/30 transition-shadow hover:cursor-pointer">
          <h3 className="text-lg font-semibold text-white mb-2">Daily Motivation</h3>
          <p className="text-gray-400 italic text-lg leading-relaxed">
            "{getRandomQuote()}"
          </p>
        </div>
      )}

      {/* Stats Grid */}
      {isAuthenticated && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-lg hover:shadow-blue-300/30 transition-shadow hover:cursor-pointer">
              <div className="flex items-center justify-between mb-4">
                <div className={`bg-gradient-to-r ${stat.color} p-2 rounded-lg text-white`}>
                  {stat.icon}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {stat.value}
                  </div>
                  {stat.suffix && (
                    <div className="text-xs text-gray-400">
                      {stat.suffix}
                    </div>
                  )}
                </div>
              </div>
              <h3 className="text-sm font-medium text-gray-400">
                {stat.title}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* Achievement Showcase */}
      {isAuthenticated && userProgress.achievements.length > 0 && (
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" /> Recent Achievements
          </h3>
          <div className="overflow-x-auto achievement-scrollbar">
            <div className="flex space-x-4 p-2 hover:cursor-no-drop">
              {userProgress.achievements.map((achievement) => {
                const style = getAchievementStyle();
                return (
                  <div
                    key={achievement.id}
                    className={`flex-shrink-0 bg-gradient-to-r ${style.bg} ${style.text} p-3 rounded-lg min-w-[120px] m-1 hover:scale-105 transition-transform duration-300 shadow-lg`}
                  >
                    <div className="font-semibold text-sm text-center">{achievement.title}</div>
                    <div className="text-xs mt-1 text-center">{achievement.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        onSuccess={handleAuthSuccess}
        onRegister={register}
        onLogin={login}
      />

      {/* Goal Setup Dialog */}
      <GoalSetupDialog
        isOpen={showGoalDialog}
        onClose={() => setShowGoalDialog(false)}
        onSave={onUpdateGoals}
        existingGoals={userGoals}
      />

      {/* Custom Modal for New Journey Confirmation */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950  bg-opacity-60 transition-opacity">
          <div className="bg-slate-950 rounded-2xl shadow-2xl hover:shadow-xl hover:shadow-blue-300/30 transition-shadow duration-300 p-8 relative w-full max-w-md border-t-4 border-lime-600 hover:border-blue-300/30 animate-fade-in">
            <h3 className="font-extrabold text-2xl text-gray-100 mb-3 flex items-center gap-2">
              <RefreshCw className="w-6 h-6 text-gray-500" /> Start New Journey ?
            </h3>
            <p className="text-gray-400 mb-8 text-lg">
              Are you sure you want to start a new journey ? <span className="font-bold text-red-500 animate-pulse">This will clear all your progress and cannot be undone.</span>
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded-xl bg-gray-200 text-gray-800 font-semibold hover:bg-gray-300 transition"
                onClick={() => setShowResetModal(false)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-400 text-white font-bold hover:from-red-600 hover:to-pink-600 transition"
                onClick={() => {
                  setShowResetModal(false);
                  onResetJourney();
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};