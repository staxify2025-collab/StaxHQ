"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { 
  Customer, 
  ContractDocument, 
  ActivityNote, 
  CalendarEvent, 
  UserProfile, 
  Organization,
  UserRole
} from "@/types/crm";
import { 
  initialOrganizations, 
  initialTeamMembers, 
  demoCustomers, 
  demoContracts, 
  demoNotes, 
  demoCalendarEvents 
} from "@/lib/demo/seedData";
import { appConfig } from "@/config/appConfig";

interface TenantContextType {
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  logout: () => void;
  loginAsDemo: () => void;
  isDemoMode: boolean;
  activeOrg: Organization;
  toggleDemoMode: () => void;
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  teamMembers: UserProfile[];
  
  // Data
  customers: Customer[];
  contracts: ContractDocument[];
  notes: ActivityNote[];
  events: CalendarEvent[];
  products: string[];

  // Mutations
  addProduct: (name: string) => void;
  deleteProduct: (name: string) => void;
  addTeamMember: (member: Omit<UserProfile, "uid" | "createdAt" | "orgId">) => UserProfile;
  updateTeamMember: (uid: string, updates: Partial<UserProfile>) => void;
  deleteTeamMember: (uid: string) => void;
  addCustomer: (customer: Omit<Customer, "id" | "orgId" | "createdAt" | "updatedAt">) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addContract: (contract: Omit<ContractDocument, "id" | "orgId" | "createdAt" | "updatedAt">) => ContractDocument;
  updateContract: (id: string, updates: Partial<ContractDocument>) => void;
  deleteContract: (id: string) => void;

  addNote: (note: Omit<ActivityNote, "id" | "orgId" | "createdAt">) => ActivityNote;
  deleteNote: (id: string) => void;

  addEvent: (event: Omit<CalendarEvent, "id" | "orgId" | "createdAt">) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  updateOrgSettings: (updates: Partial<Organization>) => void;
  resetDemoData: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string>("admin@staxify.com");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [products, setProducts] = useState<string[]>(appConfig.defaultProducts);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(initialTeamMembers);
  
  // Scoped Store States
  const [primaryCustomers, setPrimaryCustomers] = useState<Customer[]>([]);
  const [demoCustomersState, setDemoCustomersState] = useState<Customer[]>(demoCustomers);

  const [primaryContracts, setPrimaryContracts] = useState<ContractDocument[]>([]);
  const [demoContractsState, setDemoContractsState] = useState<ContractDocument[]>(demoContracts);

  const [primaryNotes, setPrimaryNotes] = useState<ActivityNote[]>([]);
  const [demoNotesState, setDemoNotesState] = useState<ActivityNote[]>(demoNotes);

  const [primaryEvents, setPrimaryEvents] = useState<CalendarEvent[]>([]);
  const [demoEventsState, setDemoEventsState] = useState<CalendarEvent[]>(demoCalendarEvents);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const savedAuth = localStorage.getItem("staxhq_auth_user");
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          setIsAuthenticated(true);
          if (parsed.email) setLoggedUserEmail(parsed.email);
          if (parsed.role) setCurrentRole(parsed.role);
        } catch {}
      }

      const savedMode = localStorage.getItem("staxhq_demo_mode");
      if (savedMode !== null) setIsDemoMode(savedMode === "true");

      const savedRole = localStorage.getItem("staxhq_user_role") as UserRole;
      if (savedRole) setCurrentRole(savedRole);

      const savedProducts = localStorage.getItem("staxhq_products");
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      } else {
        setProducts(appConfig.defaultProducts);
      }

      const savedTeam = localStorage.getItem("staxhq_team_members");
      if (savedTeam) {
        setTeamMembers(JSON.parse(savedTeam));
      } else {
        setTeamMembers(initialTeamMembers);
      }

      const savedPrimaryCust = localStorage.getItem("staxhq_primary_customers");
      if (savedPrimaryCust) setPrimaryCustomers(JSON.parse(savedPrimaryCust));

      const savedDemoCust = localStorage.getItem("staxhq_demo_customers");
      if (savedDemoCust) setDemoCustomersState(JSON.parse(savedDemoCust));

      const savedPrimaryDocs = localStorage.getItem("staxhq_primary_contracts");
      if (savedPrimaryDocs) setPrimaryContracts(JSON.parse(savedPrimaryDocs));

      const savedDemoDocs = localStorage.getItem("staxhq_demo_contracts");
      if (savedDemoDocs) setDemoContractsState(JSON.parse(savedDemoDocs));

      const savedPrimaryNotes = localStorage.getItem("staxhq_primary_notes");
      if (savedPrimaryNotes) setPrimaryNotes(JSON.parse(savedPrimaryNotes));

      const savedDemoNotes = localStorage.getItem("staxhq_demo_notes");
      if (savedDemoNotes) setDemoNotesState(JSON.parse(savedDemoNotes));

      const savedPrimaryEvt = localStorage.getItem("staxhq_primary_events");
      if (savedPrimaryEvt) setPrimaryEvents(JSON.parse(savedPrimaryEvt));

      const savedDemoEvt = localStorage.getItem("staxhq_demo_events");
      if (savedDemoEvt) setDemoEventsState(JSON.parse(savedDemoEvt));

      const savedOrgs = localStorage.getItem("staxhq_orgs");
      if (savedOrgs) setOrganizations(JSON.parse(savedOrgs));
    } catch (e) {
      console.warn("Storage sync fallback:", e);
    }
  }, []);

  const activeOrg = useMemo(() => {
    return isDemoMode
      ? organizations.find((o) => o.id === "demo-org") || initialOrganizations[1]
      : organizations.find((o) => o.id === "stax") || initialOrganizations[0];
  }, [isDemoMode, organizations]);

  const currentUser: UserProfile = useMemo(() => {
    if (isDemoMode) {
      return {
        uid: "usr-demo-admin",
        displayName: "Demo Administrator",
        email: "demo@staxify.com",
        role: "admin",
        orgId: "demo-org",
        createdAt: Date.now() - 30 * 86400000,
      };
    }

    const matched = teamMembers.find(
      (m) => m.email.toLowerCase() === loggedUserEmail.toLowerCase()
    );

    if (matched) {
      return {
        ...matched,
        role: currentRole || matched.role,
      };
    }

    return {
      uid: "usr-admin-1",
      displayName: "Admin Operator",
      email: loggedUserEmail || "admin@staxify.com",
      role: currentRole,
      orgId: activeOrg.id,
      createdAt: Date.now() - 30 * 86400000,
    };
  }, [isDemoMode, loggedUserEmail, teamMembers, currentRole, activeOrg.id]);

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    localStorage.setItem("staxhq_demo_mode", String(next));
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem("staxhq_user_role", role);
  };

  const login = (email: string, password?: string) => {
    const trimmed = email.trim();
    if (!trimmed) return false;

    const matched = teamMembers.find(
      (m) => m.email.toLowerCase() === trimmed.toLowerCase()
    );

    const roleToSet: UserRole = matched
      ? matched.role
      : (trimmed.toLowerCase().includes("admin") ? "admin" : "employee");

    setCurrentRole(roleToSet);
    setLoggedUserEmail(trimmed);
    setIsAuthenticated(true);
    setIsDemoMode(false);

    localStorage.setItem("staxhq_auth_user", JSON.stringify({ email: trimmed, role: roleToSet }));
    localStorage.setItem("staxhq_user_role", roleToSet);
    localStorage.setItem("staxhq_demo_mode", "false");
    return true;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem("staxhq_auth_user");
  };

  const loginAsDemo = () => {
    setIsDemoMode(true);
    setCurrentRole("admin");
    setLoggedUserEmail("demo@staxify.com");
    setIsAuthenticated(true);
    localStorage.setItem("staxhq_auth_user", JSON.stringify({ email: "demo@staxify.com", role: "admin", isDemo: true }));
    localStorage.setItem("staxhq_demo_mode", "true");
    localStorage.setItem("staxhq_user_role", "admin");
  };

  // Customers
  const customers = isDemoMode ? demoCustomersState : primaryCustomers;
  const setCustomers = (updater: Customer[] | ((prev: Customer[]) => Customer[])) => {
    if (isDemoMode) {
      setDemoCustomersState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_customers", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryCustomers((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_customers", JSON.stringify(next));
        return next;
      });
    }
  };

  // Contracts
  const contracts = isDemoMode ? demoContractsState : primaryContracts;
  const setContracts = (updater: ContractDocument[] | ((prev: ContractDocument[]) => ContractDocument[])) => {
    if (isDemoMode) {
      setDemoContractsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_contracts", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryContracts((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_contracts", JSON.stringify(next));
        return next;
      });
    }
  };

  // Notes
  const notes = isDemoMode ? demoNotesState : primaryNotes;
  const setNotes = (updater: ActivityNote[] | ((prev: ActivityNote[]) => ActivityNote[])) => {
    if (isDemoMode) {
      setDemoNotesState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_notes", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryNotes((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_notes", JSON.stringify(next));
        return next;
      });
    }
  };

  // Events
  const events = isDemoMode ? demoEventsState : primaryEvents;
  const setEvents = (updater: CalendarEvent[] | ((prev: CalendarEvent[]) => CalendarEvent[])) => {
    if (isDemoMode) {
      setDemoEventsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_events", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryEvents((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_events", JSON.stringify(next));
        return next;
      });
    }
  };

  // Customer Actions
  const addCustomer = (data: Omit<Customer, "id" | "orgId" | "createdAt" | "updatedAt">) => {
    const newCust: Customer = {
      ...data,
      id: `cust-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCustomers((prev) => [newCust, ...prev]);
    return newCust;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    setCustomers((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: Date.now() } : c))
    );
  };

  const deleteCustomer = (id: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== id));
  };

  // Contract Actions
  const addContract = (data: Omit<ContractDocument, "id" | "orgId" | "createdAt" | "updatedAt">) => {
    const newDoc: ContractDocument = {
      ...data,
      id: `doc-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setContracts((prev) => [newDoc, ...prev]);
    return newDoc;
  };

  const updateContract = (id: string, updates: Partial<ContractDocument>) => {
    setContracts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates, updatedAt: Date.now() } : d))
    );
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((d) => d.id !== id));
  };

  // Note Actions
  const addNote = (data: Omit<ActivityNote, "id" | "orgId" | "createdAt">) => {
    const newNote: ActivityNote = {
      ...data,
      id: `note-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
    };
    setNotes((prev) => [newNote, ...prev]);
    return newNote;
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  // Event Actions
  const addEvent = (data: Omit<CalendarEvent, "id" | "orgId" | "createdAt">) => {
    const newEvent: CalendarEvent = {
      ...data,
      id: `evt-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
    };
    setEvents((prev) => [newEvent, ...prev]);
    return newEvent;
  };

  const updateEvent = (id: string, updates: Partial<CalendarEvent>) => {
    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  const deleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const updateOrgSettings = (updates: Partial<Organization>) => {
    setOrganizations((prev) => {
      const next = prev.map((o) => (o.id === activeOrg.id ? { ...o, ...updates } : o));
      localStorage.setItem("staxhq_orgs", JSON.stringify(next));
      return next;
    });
  };

  const resetDemoData = () => {
    setDemoCustomersState(demoCustomers);
    setDemoContractsState(demoContracts);
    setDemoNotesState(demoNotes);
    setDemoEventsState(demoCalendarEvents);
    localStorage.setItem("staxhq_demo_customers", JSON.stringify(demoCustomers));
    localStorage.setItem("staxhq_demo_contracts", JSON.stringify(demoContracts));
    localStorage.setItem("staxhq_demo_notes", JSON.stringify(demoNotes));
    localStorage.setItem("staxhq_demo_events", JSON.stringify(demoCalendarEvents));
  };

  const addProduct = (productName: string) => {
    const trimmed = productName.trim();
    if (!trimmed || products.some((p) => p.toLowerCase() === trimmed.toLowerCase())) return;
    const next = [...products, trimmed];
    setProducts(next);
    localStorage.setItem("staxhq_products", JSON.stringify(next));
  };

  const deleteProduct = (productName: string) => {
    const next = products.filter((p) => p.toLowerCase() !== productName.toLowerCase());
    setProducts(next);
    localStorage.setItem("staxhq_products", JSON.stringify(next));
  };

  const addTeamMember = (memberData: Omit<UserProfile, "uid" | "createdAt" | "orgId">) => {
    const newMember: UserProfile = {
      ...memberData,
      uid: `usr-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
    };
    const next = [...teamMembers, newMember];
    setTeamMembers(next);
    localStorage.setItem("staxhq_team_members", JSON.stringify(next));
    return newMember;
  };

  const updateTeamMember = (uid: string, updates: Partial<UserProfile>) => {
    const next = teamMembers.map((m) => (m.uid === uid ? { ...m, ...updates } : m));
    setTeamMembers(next);
    localStorage.setItem("staxhq_team_members", JSON.stringify(next));
  };

  const deleteTeamMember = (uid: string) => {
    const next = teamMembers.filter((m) => m.uid !== uid);
    setTeamMembers(next);
    localStorage.setItem("staxhq_team_members", JSON.stringify(next));
  };

  return (
    <TenantContext.Provider
      value={{
        isAuthenticated,
        login,
        logout,
        loginAsDemo,
        isDemoMode,
        activeOrg,
        toggleDemoMode,
        currentUser,
        currentRole,
        setCurrentRole: handleRoleChange,
        teamMembers,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        customers,
        contracts,
        notes,
        events,
        products,
        addProduct,
        deleteProduct,
        addCustomer,
        updateCustomer,
        deleteCustomer,
        addContract,
        updateContract,
        deleteContract,
        addNote,
        deleteNote,
        addEvent,
        updateEvent,
        deleteEvent,
        updateOrgSettings,
        resetDemoData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error("useTenant must be used within a TenantProvider");
  }
  return context;
}
