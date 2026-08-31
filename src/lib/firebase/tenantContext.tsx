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

  // Mutations
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
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  
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
      const savedMode = localStorage.getItem("staxhq_demo_mode");
      if (savedMode !== null) setIsDemoMode(savedMode === "true");

      const savedRole = localStorage.getItem("staxhq_user_role") as UserRole;
      if (savedRole) setCurrentRole(savedRole);

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
    return {
      uid: "usr-admin-1",
      displayName: isDemoMode ? "Demo Administrator" : "Cahaba Admin",
      email: isDemoMode ? "demo@staxhq.com" : "admin@staxhq.com",
      role: currentRole,
      orgId: activeOrg.id,
      createdAt: Date.now() - 30 * 86400000,
    };
  }, [isDemoMode, activeOrg.id, currentRole]);

  const toggleDemoMode = () => {
    const next = !isDemoMode;
    setIsDemoMode(next);
    localStorage.setItem("staxhq_demo_mode", String(next));
  };

  const handleRoleChange = (role: UserRole) => {
    setCurrentRole(role);
    localStorage.setItem("staxhq_user_role", role);
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

  return (
    <TenantContext.Provider
      value={{
        isDemoMode,
        activeOrg,
        toggleDemoMode,
        currentUser,
        currentRole,
        setCurrentRole: handleRoleChange,
        teamMembers: initialTeamMembers,
        customers,
        contracts,
        notes,
        events,
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
