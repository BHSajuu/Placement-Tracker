import { useState, useEffect } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { Id } from '../../convex/_generated/dataModel';
import toast from 'react-hot-toast';

interface User {
  name: string;
  email: string;
}

interface AuthState {
  userId: Id<"users"> | null;
  user: User | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    userId: null,
    user: null,
    isAuthenticated: false,
  });

  const createUser = useMutation(api.users.createUser);
  const loginUser = useMutation(api.users.loginUser);

  useEffect(() => {
    // Check for stored auth data
    const storedUserId = localStorage.getItem('prep-user-id');
    const storedUser = localStorage.getItem('prep-user-data');
    
    if (storedUserId && storedUser) {
      setAuthState({
        userId: storedUserId as Id<"users">,
        user: JSON.parse(storedUser),
        isAuthenticated: true,
      });
    }
  }, []);

  const register = async (name: string, email: string, password: string) => {
    try {
      const result = await createUser({ name, email, password });
      
      // Store auth data
      localStorage.setItem('prep-user-id', result.userId);
      localStorage.setItem('prep-user-data', JSON.stringify(result.user));
      
      setAuthState({
        userId: result.userId,
        user: result.user,
        isAuthenticated: true,
      });
      toast.success('Registered successfully');
      return { success: true };
    } catch (error) {
      toast.error('Registration failed: ');
      return { success: false, error: (error as Error).message };
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const result = await loginUser({ email, password });
      
      // Store auth data
      localStorage.setItem('prep-user-id', result.userId);
      localStorage.setItem('prep-user-data', JSON.stringify(result.user));
      
      setAuthState({
        userId: result.userId,
        user: result.user,
        isAuthenticated: true,
      });
      toast.success('Logged in successfully');
      return { success: true };
    } catch (error) {
      toast.error('Login failed: Invalid email or password'  );
      return { success: false, error: "" };

    }
  };

  const logout = () => {
    localStorage.removeItem('prep-user-id');
    localStorage.removeItem('prep-user-data');
    
    setAuthState({
      userId: null,
      user: null,
      isAuthenticated: false,
    });
    toast.success('Logged out successfully');
  };

  return {
    ...authState,
    register,
    login,
    logout,
  };
}