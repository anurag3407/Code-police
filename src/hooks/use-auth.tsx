'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithRedirect, 
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { User as UserDoc, defaultRulesProfile, defaultNotificationPrefs } from '@/types/firestore';
import { Timestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  userDoc: UserDoc | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userDoc, setUserDoc] = useState<UserDoc | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper function to create user document (used by both useEffect and signUpWithEmail)
  const createUserDocumentHelper = async (user: User, displayName?: string) => {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      // Create new user document - only include photoURL if it exists
      // Firestore does not accept undefined values
      const newUser = {
        id: user.uid,
        email: user.email || '',
        displayName: displayName || user.displayName || 'User',
        createdAt: Timestamp.now(),
        providerData: user.providerData.map(p => ({
          providerId: p.providerId,
          email: p.email || '',
        })),
        defaultOrgId: '', // Will be set after creating default org
        ...(user.photoURL ? { photoURL: user.photoURL } : {}),
      };

      await setDoc(userRef, newUser);

      // Create default organization
      const orgId = `org_${user.uid}`;
      const orgRef = doc(db, 'organizations', orgId);
      await setDoc(orgRef, {
        id: orgId,
        name: `${newUser.displayName}'s Workspace`,
        ownerId: user.uid,
        plan: 'free',
        createdAt: Timestamp.now(),
        settings: {
          rulesProfile: defaultRulesProfile,
          notificationPreferences: defaultNotificationPrefs,
        },
      });

      // Create org member entry
      const memberRef = doc(db, 'orgMembers', `${orgId}_${user.uid}`);
      await setDoc(memberRef, {
        id: `${orgId}_${user.uid}`,
        orgId,
        userId: user.uid,
        role: 'owner',
        joinedAt: Timestamp.now(),
      });

      // Update user with default org
      await setDoc(userRef, { defaultOrgId: orgId }, { merge: true });
      
      return { ...newUser, defaultOrgId: orgId } as UserDoc;
    }

    return userSnap.data() as UserDoc;
  };

  useEffect(() => {
    // Handle redirect result from Google Sign-In
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          // User signed in via redirect, create/fetch user document
          const userRef = doc(db, 'users', result.user.uid);
          const userSnap = await getDoc(userRef);
          
          if (!userSnap.exists()) {
            // New user - will be handled by createUserDocument below
          }
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
      }
    };
    
    handleRedirectResult();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        // Fetch or create user document
        const userRef = doc(db, 'users', user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          setUserDoc(userSnap.data() as UserDoc);
        } else {
          // Create user document for redirect sign-in
          const newUserDoc = await createUserDocumentHelper(user);
          setUserDoc(newUserDoc);
        }
      } else {
        setUserDoc(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);



  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    // Use redirect instead of popup - more reliable and avoids COOP issues
    await signInWithRedirect(auth, provider);
    // After redirect, the user will come back and onAuthStateChanged will handle it
  };

  const signInWithEmail = async (email: string, password: string) => {
    const result = await signInWithEmailAndPassword(auth, email, password);
    const docRef = await getDoc(doc(db, 'users', result.user.uid));
    if (docRef.exists()) {
      setUserDoc(docRef.data() as UserDoc);
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const userDocData = await createUserDocumentHelper(result.user, displayName);
    setUserDoc(userDocData);
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setUserDoc(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      userDoc,
      loading,
      signInWithGoogle,
      signInWithEmail,
      signUpWithEmail,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
