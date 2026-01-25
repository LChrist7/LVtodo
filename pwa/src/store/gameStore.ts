import { create } from 'zustand';
import { Task, Group, Wish, Achievement, UserStats } from '@/types';

interface GameState {
  tasks: Task[];
  groups: Group[];
  wishes: Wish[];
  achievements: Achievement[];
  userStats: UserStats | null;
  selectedGroup: Group | null;

  setTasks: (tasks: Task[]) => void;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  removeTask: (taskId: string) => void;

  setGroups: (groups: Group[]) => void;
  addGroup: (group: Group) => void;
  updateGroup: (groupId: string, updates: Partial<Group>) => void;
  setSelectedGroup: (group: Group | null) => void;

  setWishes: (wishes: Wish[]) => void;
  addWish: (wish: Wish) => void;
  updateWish: (wishId: string, updates: Partial<Wish>) => void;

  setAchievements: (achievements: Achievement[]) => void;
  setUserStats: (stats: UserStats | null) => void;

  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  tasks: [],
  groups: [],
  wishes: [],
  achievements: [],
  userStats: null,
  selectedGroup: null,

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),

  setGroups: (groups) => set({ groups }),
  addGroup: (group) => set((state) => ({ groups: [...state.groups, group] })),
  updateGroup: (groupId, updates) =>
    set((state) => ({
      groups: state.groups.map((g) => (g.id === groupId ? { ...g, ...updates } : g)),
    })),
  setSelectedGroup: (group) => set({ selectedGroup: group }),

  setWishes: (wishes) => set({ wishes }),
  addWish: (wish) => set((state) => ({ wishes: [...state.wishes, wish] })),
  updateWish: (wishId, updates) =>
    set((state) => ({
      wishes: state.wishes.map((w) => (w.id === wishId ? { ...w, ...updates } : w)),
    })),

  setAchievements: (achievements) => set({ achievements }),
  setUserStats: (userStats) => set({ userStats }),

  reset: () =>
    set({
      tasks: [],
      groups: [],
      wishes: [],
      achievements: [],
      userStats: null,
      selectedGroup: null,
    }),
}));
