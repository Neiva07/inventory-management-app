import React, { createContext, ReactElement, useContext, useEffect, useState } from "react";
import { upsertUserFromSession, User } from "model/auth";
import { getFromCache, storeInCache, removeFromCache } from "lib/cache";
import { Session } from "model/session";
import { Organization, getOrganization } from "model/organization";
import { UserMembership, getUserMembership } from "model/userMembership";

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
      setUser(null);
      setOrganization(null);
      setMembership(null);
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
          const user = getFromCache("user")
          setUser(user);
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
