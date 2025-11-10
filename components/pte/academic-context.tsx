'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

// Define types
type AcademicDashboardData = {
  overallScore: number;
  targetScore: number;
  readingScore: number;
  writingScore: number;
  listeningScore: number;
  speakingScore: number;
  testsCompleted: number;
  studyHours: number;
  streak: number;
};

type AcademicGoal = {
  id: number;
  title: string;
  current: number;
  target: number;
  status: 'completed' | 'in-progress';
};

type AcademicProgress = {
  month: string;
  score: number;
};

type AcademicPerformance = {
  section: string;
  score: number;
};

type AcademicState = {
  dashboardData: AcademicDashboardData | null;
  goals: AcademicGoal[];
  progress: AcademicProgress[];
  performance: AcademicPerformance[];
  loading: boolean;
  error: string | null;
};

type AcademicAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_DASHBOARD_DATA'; payload: AcademicDashboardData }
  | { type: 'SET_GOALS'; payload: AcademicGoal[] }
  | { type: 'SET_PROGRESS'; payload: AcademicProgress[] }
  | { type: 'SET_PERFORMANCE'; payload: AcademicPerformance[] }
  | { type: 'UPDATE_GOAL_PROGRESS'; payload: { id: number; progress: number } }
  | { type: 'ADD_GOAL'; payload: AcademicGoal }
  | { type: 'REMOVE_GOAL'; payload: number };

// Initial state
const initialState: AcademicState = {
  dashboardData: null,
  goals: [],
  progress: [],
  performance: [],
  loading: false,
  error: null,
};

// Reducer
const academicReducer = (state: AcademicState, action: AcademicAction): AcademicState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    
    case 'SET_DASHBOARD_DATA':
      return { ...state, dashboardData: action.payload, loading: false };
    
    case 'SET_GOALS':
      return { ...state, goals: action.payload };
    
    case 'SET_PROGRESS':
      return { ...state, progress: action.payload };
    
    case 'SET_PERFORMANCE':
      return { ...state, performance: action.payload };
    
    case 'UPDATE_GOAL_PROGRESS':
      return {
        ...state,
        goals: state.goals.map(goal =>
          goal.id === action.payload.id
            ? { ...goal, current: action.payload.progress }
            : goal
        ),
      };
    
    case 'ADD_GOAL':
      return { ...state, goals: [...state.goals, action.payload] };
    
    case 'REMOVE_GOAL':
      return { ...state, goals: state.goals.filter(goal => goal.id !== action.payload) };
    
    default:
      return state;
  }
};

// Context
const AcademicContext = createContext<{
  state: AcademicState;
  dispatch: React.Dispatch<AcademicAction>;
}>({
  state: initialState,
  dispatch: () => null,
});

// Provider
export function AcademicProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(academicReducer, initialState);

  return (
    <AcademicContext.Provider value={{ state, dispatch }}>
      {children}
    </AcademicContext.Provider>
  );
}

// Hook
export function useAcademic() {
  const context = useContext(AcademicContext);
  if (!context) {
    throw new Error('useAcademic must be used within an AcademicProvider');
  }
  return context;
}