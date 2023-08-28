import React, { createContext, ReactElement, useContext, useEffect } from "react";
import { logout, signInWithGoogle, User } from "model/auth"
import { getFromCache, removeFromCache, storeInCache } from "lib/cache";

interface AuthContextData {
  user: User | null;
  loginWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthContextProvider = ({ children }: { children: ReactElement }) => {

  const [user, setUser] = React.useState<User>(null);

  const loginWithGoogle = async () => {
    const { user: loggedUser } = await signInWithGoogle();

    setUser(loggedUser.data() as User);
    storeInCache("user", loggedUser.data() as User)
  }

  const signOut = async () => {
    await logout();
    removeFromCache("user");
    setUser(null);
  }

  useEffect(() => {
    setUser(getFromCache("user"))
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithGoogle,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}
