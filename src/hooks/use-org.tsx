'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { Organization, OrgMember, Project } from '@/types/firestore';
import { useAuth } from './use-auth';

interface OrgContextType {
  currentOrg: Organization | null;
  organizations: Organization[];
  projects: Project[];
  loading: boolean;
  setCurrentOrgId: (orgId: string) => void;
  refreshProjects: () => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user, userDoc } = useAuth();
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's organizations
  useEffect(() => {
    const fetchOrganizations = async () => {
      if (!user) {
        setOrganizations([]);
        setCurrentOrg(null);
        setLoading(false);
        return;
      }

      try {
        // Get all org memberships for this user
        const membersQuery = query(
          collection(db, 'orgMembers'),
          where('userId', '==', user.uid)
        );
        const membersSnap = await getDocs(membersQuery);
        
        const orgIds = membersSnap.docs.map(d => (d.data() as OrgMember).orgId);
        
        if (orgIds.length === 0) {
          setOrganizations([]);
          setCurrentOrg(null);
          setLoading(false);
          return;
        }

        // Fetch all organizations
        const orgs: Organization[] = [];
        for (const orgId of orgIds) {
          const orgDoc = await getDoc(doc(db, 'organizations', orgId));
          if (orgDoc.exists()) {
            orgs.push(orgDoc.data() as Organization);
          }
        }
        
        setOrganizations(orgs);
        
        // Set current org to default or first
        const defaultOrgId = userDoc?.defaultOrgId || orgs[0]?.id;
        const defaultOrg = orgs.find(o => o.id === defaultOrgId) || orgs[0];
        setCurrentOrg(defaultOrg);
      } catch (error) {
        console.error('Error fetching organizations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrganizations();
  }, [user, userDoc]);

  // Fetch projects when current org changes
  useEffect(() => {
    const fetchProjects = async () => {
      if (!currentOrg) {
        setProjects([]);
        return;
      }

      try {
        const projectsQuery = query(
          collection(db, 'projects'),
          where('orgId', '==', currentOrg.id),
          where('active', '==', true)
        );
        const projectsSnap = await getDocs(projectsQuery);
        const projectsList = projectsSnap.docs.map(d => d.data() as Project);
        setProjects(projectsList);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, [currentOrg]);

  const setCurrentOrgId = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrg(org);
    }
  };

  const refreshProjects = async () => {
    if (!currentOrg) return;
    
    const projectsQuery = query(
      collection(db, 'projects'),
      where('orgId', '==', currentOrg.id),
      where('active', '==', true)
    );
    const projectsSnap = await getDocs(projectsQuery);
    const projectsList = projectsSnap.docs.map(d => d.data() as Project);
    setProjects(projectsList);
  };

  return (
    <OrgContext.Provider value={{
      currentOrg,
      organizations,
      projects,
      loading,
      setCurrentOrgId,
      refreshProjects,
    }}>
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
