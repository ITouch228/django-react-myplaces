import { createContext } from "react";
import type { User } from "../types";

interface AuthContextType {
  user: User | null;
  register: (
    username: string,
    password: string,
    email?: string,
  ) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);
