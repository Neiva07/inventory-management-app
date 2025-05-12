import React, { createContext, ReactElement, useContext, useEffect, useState } from "react";
import { upsertUserFromSession, User } from "model/auth";
import { getFromCache, storeInCache, removeFromCache } from "lib/cache";
import { Session } from "model/session";

interface AuthContextData {
  user: User | null;
  session: Session | null;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthContextProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);

  const logout = async () => {
    try {
      if (session?.id && window.electron?.clerkLogout) {
        await window.electron.clerkLogout(session.id);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and cache regardless of API success
      setUser(null);
      setSession(null);
      removeFromCache("user");
      removeFromCache("session");
    }
  };

  useEffect(() => {
    if (window.electron) {
      window.electron.onAuthSessionReceived(async (newSession) => {
        console.log('Session received in React:', newSession);
        setSession(newSession);
        storeInCache("session", newSession);
        if (newSession) {
          const firebaseUser = await upsertUserFromSession(newSession);
          setUser(firebaseUser);
          storeInCache("user", firebaseUser);
        } else {
          setUser(null);
        }
      });
    }
  }, []);

  useEffect(() => {
    const cachedSession = getFromCache("session");
    setSession(cachedSession);
 if (cachedSession) {
      upsertUserFromSession(cachedSession).then(firebaseUser => {
        if(firebaseUser){
          setUser(firebaseUser);
          storeInCache("user", firebaseUser);
        }
      }).catch(() => {
        const userFromCache = getFromCache("user");
        if(userFromCache) {
          setUser(userFromCache);
        }
      });
    }
   
  }, []);

  return (
    <AuthContext.Provider value={{ user, session, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
