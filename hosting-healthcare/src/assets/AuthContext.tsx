import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface BookingRequest {
  bookingId: string;
  propertyId: number;
  hotelName: string;
  image: string;
  city: string;
  checkInDate: string;
  checkOutDate: string;
  status: 'Pending' | 'Cancelled';
  requestDate: string;
  price: string | number;
}

// Updated User interface
export interface User {
  name: string;
  email: string;
  profileImage?: string;
  contactNumber?: string;
  medicalLicense?: string;
  wishlist?: string[];
  sentRequests?: BookingRequest[];
  cancelledRequests?: BookingRequest[];
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  toggleWishlist: (propertyId: string) => void;
  sendBookingRequest: (request: Omit<BookingRequest, 'bookingId' | 'status' | 'requestDate'>) => void;
  withdrawBookingRequest: (bookingId: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        return JSON.parse(storedUser);
      } catch (error) {
        console.error("Failed to parse user from local storage", error);
        localStorage.removeItem('currentUser');
        return null;
      }
    }
    return null;
  });

  // Helper: removes cancelled requests older than 24 hours
  const purgeStaleCancelledRequests = (userData: User): User => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    const filtered = (userData.cancelledRequests || []).filter((req: BookingRequest) => {
      const reqTime = new Date(req.requestDate).getTime();
      // If unparseable, keep the entry to avoid accidental deletion
      return isNaN(reqTime) || reqTime > cutoff;
    });
    return { ...userData, cancelledRequests: filtered };
  };

  // Helper to update local storage and main DB simulation
  const updatePersistentStorage = (updatedUser: User) => {
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    try {
      const dbUsersStr = localStorage.getItem('hh_users_db');
      const dbUsers: any[] = dbUsersStr ? JSON.parse(dbUsersStr) : [];
      const userIndex = dbUsers.findIndex((u: any) => u.email === updatedUser.email);
      if (userIndex !== -1) {
        dbUsers[userIndex] = { ...dbUsers[userIndex], ...updatedUser };
      } else {
        dbUsers.push(updatedUser);
      }
      localStorage.setItem('hh_users_db', JSON.stringify(dbUsers));
    } catch (e) {
      console.error("Failed to update user db storage", e);
    }
  };

  // 2. Login
  const login = (userData: User) => {
    const userWithData = { 
        wishlist: [], 
        sentRequests: [], 
        cancelledRequests: [], 
        ...userData 
    };
    // Purge any cancelled requests older than 24hrs on login
    const purged = purgeStaleCancelledRequests(userWithData);
    setUser(purged);
    localStorage.setItem('currentUser', JSON.stringify(purged));
  };

  // 3. Logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // 4. Toggle Wishlist
  const toggleWishlist = (propertyId: string) => {
    if (!user) return;
    setUser((prevUser) => {
      if (!prevUser) return null;
      const currentWishlist = prevUser.wishlist || [];
      let updatedWishlist: string[];
      if (currentWishlist.includes(propertyId)) {
        updatedWishlist = currentWishlist.filter(id => id !== propertyId);
      } else {
        updatedWishlist = [...currentWishlist, propertyId];
      }
      const updatedUser = { ...prevUser, wishlist: updatedWishlist };
      updatePersistentStorage(updatedUser);
      return updatedUser;
    });
  };

  // --- 5. NEW: Send Booking Request ---
  const sendBookingRequest = (requestData: Omit<BookingRequest, 'bookingId' | 'status' | 'requestDate'>) => {
    if (!user) return;
    
    const newRequest: BookingRequest = {
        ...requestData,
        bookingId: 'BK-' + Date.now().toString().slice(-6), // Generate simple unique ID
        status: 'Pending',
        requestDate: new Date().toLocaleDateString()
    };

    setUser((prevUser) => {
        if (!prevUser) return null;
        const updatedRequests = [newRequest, ...(prevUser.sentRequests || [])];
        const updatedUser = { ...prevUser, sentRequests: updatedRequests };
        updatePersistentStorage(updatedUser);
        return updatedUser;
    });
  };

  // --- 6. NEW: Withdraw Booking Request ---
  const withdrawBookingRequest = (bookingId: string) => {
      if (!user) return;

      setUser((prevUser) => {
          if (!prevUser || !prevUser.sentRequests) return prevUser;

          // Find the request to cancel
          const requestToCancel = prevUser.sentRequests.find(req => req.bookingId === bookingId);
          if (!requestToCancel) return prevUser;

          // --- Remove from host's hh_host_requests in localStorage ---
          try {
            const hostRequests: any[] = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
            const updatedHostRequests = hostRequests.filter(
              (r: any) =>
                !(r.guestName === prevUser.name && r.property === requestToCancel.hotelName)
            );
            localStorage.setItem('hh_host_requests', JSON.stringify(updatedHostRequests));
            // Notify Dashboard in same tab to re-load
            window.dispatchEvent(new Event('hh_requests_updated'));
          } catch (e) {
            console.error('Failed to update host requests on withdrawal', e);
          }

          // Store cancellation time as ISO string so 24hr purge can parse it reliably
          const cancelledRequest: BookingRequest = {
            ...requestToCancel,
            status: 'Cancelled',
            requestDate: new Date().toISOString(),
          };

          // Filter out from sent requests
          const updatedSentRequests = prevUser.sentRequests.filter(req => req.bookingId !== bookingId);
          
          // Add to cancelled requests
          const updatedCancelledRequests = [cancelledRequest, ...(prevUser.cancelledRequests || [])];

          // Purge any existing cancelled requests older than 24hrs while we're here
          const withNewCancellation = {
              ...prevUser,
              sentRequests: updatedSentRequests,
              cancelledRequests: updatedCancelledRequests,
          };
          const updatedUser = purgeStaleCancelledRequests(withNewCancellation);
          
          updatePersistentStorage(updatedUser);
          return updatedUser;
      });
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, toggleWishlist, sendBookingRequest, withdrawBookingRequest }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};