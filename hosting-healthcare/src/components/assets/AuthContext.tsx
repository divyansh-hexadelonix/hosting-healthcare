import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the User shape matches your requirements
export interface User {
  name: string;
  email: string;
  profileImage?: string;
  contactNumber?: string;
  medicalLicense?: string;
  wishlist?: string[]; 
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  toggleWishlist: (propertyId: string) => void; 
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // 1. On load, check if user is already logged in (Persistent State)
  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse user from local storage", error);
      }
    }
  }, []);

  // 2. Login function: Updates state and saves to local storage
  const login = (userData: User) => {
    // Ensure wishlist exists on login (default to empty array if missing)
    const userWithWishlist = { wishlist: [], ...userData };
    
    setUser(userWithWishlist);
    localStorage.setItem('currentUser', JSON.stringify(userWithWishlist));
  };

  // 3. Logout function: Clears state and local storage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // --- ADDED: Toggle Wishlist Function (Persists to main DB) ---
  const toggleWishlist = (propertyId: string) => {
    if (!user || !user.email) return;

    setUser((prevUser) => {
      if (!prevUser) return null;

      const currentWishlist = prevUser.wishlist || [];
      let updatedWishlist: string[];

      if (currentWishlist.includes(propertyId)) {
        // Remove if exists
        updatedWishlist = currentWishlist.filter(id => id !== propertyId);
      } else {
        // Add if doesn't exist
        updatedWishlist = [...currentWishlist, propertyId];
      }

      const updatedUser = { ...prevUser, wishlist: updatedWishlist };

      // A. Update current session storage immediately
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));

      // B. Update the main "database" (hh_users_db) so it persists after logout/login
      try {
        const dbUsersStr = localStorage.getItem('hh_users_db');
        if (dbUsersStr) {
          const dbUsers: any[] = JSON.parse(dbUsersStr);
          const userIndex = dbUsers.findIndex((u: any) => u.email === prevUser.email);
          
          if (userIndex !== -1) {
            dbUsers[userIndex] = { ...dbUsers[userIndex], wishlist: updatedWishlist };
            localStorage.setItem('hh_users_db', JSON.stringify(dbUsers));
          }
        }
      } catch (e) {
        console.error("Failed to update user db storage", e);
      }

      return updatedUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for easy access
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};