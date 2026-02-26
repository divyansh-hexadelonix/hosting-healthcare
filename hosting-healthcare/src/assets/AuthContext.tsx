import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { propertiesData, PropertyDataType } from '../data/propertiesData';

export interface BookingRequest {
  bookingId: string;
  propertyId: number | string;
  propertyName: string;
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
  sendBookingRequest: (request: Omit<BookingRequest, 'status' | 'requestDate'>) => void;
  withdrawBookingRequest: (bookingId: string) => void;
  properties: PropertyDataType[];
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

  const [properties, setProperties] = useState<PropertyDataType[]>(propertiesData);

  const loadProperties = () => {
    try {
      // 1. Load edits for existing properties
      const edits = JSON.parse(localStorage.getItem('hh_listing_edits') || '{}');
      
      // 2. Merge edits into base properties
      const mergedBase = propertiesData.map(p => {
        const edit = edits[p.id];
        if (edit) {
          return {
            ...p,
            propertyName: edit.propertyName || p.propertyName,
            city: edit.city || p.city,
            image: edit.image || p.image,
            price: edit.price || p.price,
            capacity: edit.capacity || p.capacity,
            type: edit.type || p.type,
            hostName: edit.hostName || p.hostName,
            hostEmail: edit.hostEmail || p.hostEmail,
            state: edit.state || p.state,
            zipCode: edit.zipCode || p.zipCode,
            country: edit.country || p.country,
            propertyAddress: edit.address || p.propertyAddress,
            propertyDescription: edit.description || p.propertyDescription,
            propertyOffers: edit.amenities || p.propertyOffers,
          };
        }
        return p;
      });

      // 3. Load new custom listings
      const newListingsRaw = JSON.parse(localStorage.getItem('hh_new_listings') || '[]');
      const mappedNewListings: PropertyDataType[] = newListingsRaw.map((l: any) => ({
        id: l.id,
        image: l.image,
        city: l.city,
        propertyName: l.propertyName,
        capacity: l.capacity,
        available: true,
        reviews: 0,
        rating: 0,
        price: l.price,
        type: l.type || 'villa',
        reviewsList: [],
        hostName: l.hostName,
        hostEmail: l.hostEmail,
        state: l.state,
        zipCode: l.zipCode,
        country: l.country,
        propertyAddress: l.address,
        propertyDescription: l.description,
        propertyOffers: l.amenities,
      }));

      setProperties([...mergedBase, ...mappedNewListings]);
    } catch (e) {
      console.error("Failed to load properties", e);
    }
  };

  // Helper: removes cancelled requests older than 24 hours AND rejected requests older than 24 hours
  const purgeStaleRequests = (userData: User): User => {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;

    // 1. Purge Cancelled
    const filteredCancelled = (userData.cancelledRequests || []).filter((req: BookingRequest) => {
      const reqTime = new Date(req.requestDate).getTime();
      // If unparseable, keep the entry to avoid accidental deletion
      return isNaN(reqTime) || reqTime > cutoff;
    });

    // 2. Purge Rejected from Sent Requests
    let guestNotifs: any[] = [];
    let hostRequests: any[] = [];
    try {
      guestNotifs = JSON.parse(localStorage.getItem('hh_guest_notifications') || '[]');
      hostRequests = JSON.parse(localStorage.getItem('hh_host_requests') || '[]');
    } catch {}

    const filteredSent = (userData.sentRequests || []).filter((req: BookingRequest) => {
      const notif = guestNotifs.find((n: any) => n.bookingId === req.bookingId);
      // If rejected, check timestamp
      if (notif && notif.type === 'rejected') {
        const rejectionTime = new Date(notif.timestamp).getTime();
        // If rejection time is valid and older than cutoff, remove it
        if (!isNaN(rejectionTime) && rejectionTime <= cutoff) {
          return false;
        }
      }

      // Check if Accepted and Past Move-out
      let isAccepted = false;
      if (notif && notif.type === 'accepted') {
        isAccepted = true;
      } else {
        const hostReq = hostRequests.find((r: any) => String(r.id) === String(req.bookingId));
        if (hostReq && (hostReq.status || '').toLowerCase() === 'accepted') {
          isAccepted = true;
        }
      }

      if (isAccepted && req.checkOutDate) {
        // Parse DD-MM-YYYY
        const parts = req.checkOutDate.split('-');
        if (parts.length === 3) {
          const moveOut = new Date(+parts[2], +parts[1] - 1, +parts[0]);
          const today = new Date();
          moveOut.setHours(0, 0, 0, 0);
          today.setHours(0, 0, 0, 0);

          // If today is strictly after moveOut, remove it
          if (today > moveOut) {
            return false;
          }
        }
      }
      return true;
    });

    return { ...userData, cancelledRequests: filteredCancelled, sentRequests: filteredSent };
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

  // Purge stale cancelled requests on app load
  useEffect(() => {
    if (user) {
      const purged = purgeStaleRequests(user);
      if (
        purged.cancelledRequests?.length !== user.cancelledRequests?.length ||
        purged.sentRequests?.length !== user.sentRequests?.length
      ) {
        setUser(purged);
        updatePersistentStorage(purged);
      }
    }

    loadProperties();
    window.addEventListener('hh_requests_updated', loadProperties);
    return () => window.removeEventListener('hh_requests_updated', loadProperties);
  }, []);

  // 2. Login
  const login = (userData: User) => {
    const userWithData = { 
        wishlist: [], 
        sentRequests: [], 
        cancelledRequests: [], 
        ...userData 
    };
    // Purge any cancelled requests older than 24hrs on login
    const purged = purgeStaleRequests(userWithData);
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
  const sendBookingRequest = (requestData: Omit<BookingRequest, 'status' | 'requestDate'>) => {
    if (!user) return;
    
    const newRequest: BookingRequest = {
        ...requestData,
        // Use provided bookingId (shared with hh_host_requests) or fall back to generated one
        bookingId: requestData.bookingId || ('BK-' + Date.now()),
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
                !(r.guestName === prevUser.name && r.property === requestToCancel.propertyName)
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
          const updatedUser = purgeStaleRequests(withNewCancellation);
          
          updatePersistentStorage(updatedUser);
          return updatedUser;
      });
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, toggleWishlist, sendBookingRequest, withdrawBookingRequest, properties }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};