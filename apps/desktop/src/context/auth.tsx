import React, { createContext, ReactElement, useContext, useEffect, useState } from "react";
import { eq } from "drizzle-orm";
import { upsertUserFromSession, User } from "model/auth";
import { getFromCache, storeInCache, removeFromCache } from "lib/cache";
import { Session } from "model/session";
import { Organization, getOrganization } from "model/organization";
import { UserMembership, getUserMembership } from "model/userMembership";
import { createAppDb } from "../db/client";
import { users } from "../db/schema";
import { configureSyncScope, clearSyncScope } from "../db/syncRuntime";

interface AuthContextData {
  user: User | null;
  organization: Organization | null;
  membership: UserMembership | null;
  session: Session | null;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  isAuthLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthContextProvider = ({ children }: { children: ReactElement }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [membership, setMembership] = useState<UserMembership | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const loadUserData = React.useCallback(async () => {
    setIsAuthLoading(true);
    if (!user?.id) {
      setOrganization(null);
      setMembership(null);
      setIsAuthLoading(false);
      return;
    }

    try {
      const userMembership = await getUserMembership(user.id);
      setMembership(userMembership);

      if (!userMembership?.organizationId) {
        setOrganization(null);
        return;
      }

      const org = await getOrganization(userMembership.organizationId);
      setOrganization(org);

      // Configure bidirectional sync scope for this user + org
      if (user?.id && userMembership.organizationId) {
        const cachedSession = getFromCache("session") as Session | null;
        void configureSyncScope(
          user.id,
          [userMembership.organizationId],
          () => cachedSession?.id ?? null,
        );
      }
    } catch (error) {
      setOrganization(null);
      setMembership(null);
      console.error('Error loading user data:', error);
    } finally {
      setIsAuthLoading(false);
    }
  }, [user?.id]);

  // Load organization and membership data when user changes
  useEffect(() => {
    void loadUserData();
  }, [loadUserData]);

  const logout = async () => {
    try {
      if (session?.id && window.electron?.clerkLogout) {
        await window.electron.clerkLogout(session.id);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear local state and cache regardless of API success
      clearSyncScope();
      setUser(null);
      setOrganization(null);
      setMembership(null);
      setSession(null);
      removeFromCache("user");
      removeFromCache("session");
    }
  };

  const upsertInFlight = React.useRef<Promise<User | null> | null>(null);

  const handleSession = React.useCallback(async (sessionData: Session) => {
    // Deduplicate: if an upsert is already running, reuse its result
    if (upsertInFlight.current) {
      return upsertInFlight.current;
    }

    const promise = upsertUserFromSession(sessionData)
      .then((upsertedUser) => {
        setUser(upsertedUser);
        storeInCache("user", upsertedUser);
        return upsertedUser;
      })
      .catch(async (error) => {
        console.error("Failed to upsert user:", error);
        const userFromCache = getFromCache("user");
        if (!userFromCache) return null;

        try {
          const db = createAppDb();
          const rows = await db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.id, userFromCache.id))
            .limit(1);

          if (rows.length > 0) {
            setUser(userFromCache);
            return userFromCache;
          }
        } catch {
          // DB not ready
        }

        removeFromCache("user");
        removeFromCache("session");
        setSession(null);
        return null;
      })
      .finally(() => {
        upsertInFlight.current = null;
      });

    upsertInFlight.current = promise;
    return promise;
  }, []);

  useEffect(() => {
    if (window.electron) {
      window.electron.onAuthSessionReceived(async (newSession) => {
        console.log('Session received in React:', newSession);
        setSession(newSession);
        storeInCache("session", newSession);
        if (newSession) {
          await handleSession(newSession);
        } else {
          const user = getFromCache("user")
          setUser(user);
        }
      });
    }
  }, [handleSession]);

  useEffect(() => {
    const cachedSession = getFromCache("session");
    setSession(cachedSession);
    if (cachedSession) {
      void handleSession(cachedSession);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      organization, 
      membership, 
      session, 
      logout, 
      refreshUserData: loadUserData,
      isAuthLoading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
