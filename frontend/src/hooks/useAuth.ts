import { useState, useEffect } from "react";
import { registerUser, loginUser, validateToken } from "../services/auth";
import type { User } from "../types/auth";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check for existing token on mount and validate it
  useEffect(() => {
    const validateExistingToken = async () => {
      const token = localStorage.getItem("access_token");
      if (token) {
        try {
          // Validate token with backend
          const userData = await validateToken();
          setUser(userData);
        } catch (err) {
          // Token is invalid, remove it
          localStorage.removeItem("access_token");
          setUser(null);
        }
      }
      setLoading(false);
    };

    validateExistingToken();
  }, []);

  const register = async (data: { email: string; username: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const userData = await registerUser(data);
      setUser(userData);
      return userData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: { email: string; password: string }) => {
    setLoading(true);
    setError(null);
    try {
      const tokenData = await loginUser(data);
      localStorage.setItem("access_token", tokenData.access_token);
      setUser(tokenData);
      return tokenData;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("access_token");
  };

  const isAuthenticated = () => {
    return !!localStorage.getItem("access_token");
  };

  return { user, loading, error, register, login, logout, isAuthenticated };
}

export default useAuth;