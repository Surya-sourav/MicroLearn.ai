import { useState } from "react";
import { registerUser, loginUser } from "../services/auth";

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  return { user, loading, error, register, login, logout };
}

export default useAuth;