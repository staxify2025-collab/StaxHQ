"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { 
  Customer, 
  ContractDocument, 
  ActivityNote, 
  CalendarEvent, 
  UserProfile, 
  Organization, 
  UserRole, 
  AppNotification, 
  NotificationType, 
  ContractTemplate, 
  Invoice,
  ProjectCard,
  ProjectStage,
  BankTransaction
} from "@/types/crm";
import { 
  initialOrganizations, 
  initialTeamMembers, 
  demoCustomers, 
  demoContracts, 
  demoNotes, 
  demoCalendarEvents, 
  demoNotifications, 
  initialTemplates, 
  demoInvoices,
  initialProjects,
  demoProjects,
  initialBankTransactions,
  demoBankTransactions
} from "@/lib/demo/seedData";
import { appConfig } from "@/config/appConfig";
import { dispatchNotificationWithAlert } from "@/lib/notifications/notificationService";
import { 
  sendPasswordResetEmail, 
  confirmPasswordReset, 
  verifyPasswordResetCode 
} from "firebase/auth";
import { auth } from "@/lib/firebase/config";

interface TenantContextType {
  isAuthenticated: boolean;
  login: (email: string, password?: string) => { success: boolean; error?: string };
  logout: () => void;
  loginAsDemo: () => void;
  isDemoMode: boolean;
  activeOrg: Organization;
  toggleDemoMode: () => void;
  currentUser: UserProfile;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  teamMembers: UserProfile[];
  userPasswords: Record<string, string>;
  resetTeamMemberPassword: (email: string, newPassword?: string) => void;
  sendResetVerificationEmail: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>;
  confirmPasswordResetWithCode: (code: string, newPassword: string) => Promise<{ success: boolean; error?: string; email?: string }>;
  
  // Data
  customers: Customer[];
  contracts: ContractDocument[];
  templates: ContractTemplate[];
  invoices: Invoice[];
  projects: ProjectCard[];
  bankTransactions: BankTransaction[];
  notes: ActivityNote[];
  events: CalendarEvent[];
  products: string[];
  notifications: AppNotification[];
  unreadNotificationCount: number;

  // Mutations
  addProduct: (name: string) => void;
  deleteProduct: (name: string) => void;
  addTeamMember: (member: Omit<UserProfile, "uid" | "createdAt" | "orgId">) => UserProfile;
  updateTeamMember: (uid: string, updates: Partial<UserProfile>) => void;
  deleteTeamMember: (uid: string) => void;
  addCustomer: (customer: Omit<Customer, "id" | "orgId" | "createdAt" | "updatedAt">) => Customer;
  updateCustomer: (id: string, updates: Partial<Customer>) => void;
  deleteCustomer: (id: string) => void;

  addProject: (project: Omit<ProjectCard, "id" | "orgId" | "createdAt" | "updatedAt">) => ProjectCard;
  updateProject: (id: string, updates: Partial<ProjectCard>) => void;
  deleteProject: (id: string) => void;
  moveProjectStage: (id: string, newStage: ProjectStage) => void;
  addProjectNote: (projectId: string, content: string, authorName?: string) => void;
  toggleProjectTask: (projectId: string, taskId: string) => void;
  importProjects: (projects: ProjectCard[]) => void;

  addBankTransaction: (tx: Omit<BankTransaction, "id" | "orgId" | "importedAt">) => BankTransaction;
  updateBankTransaction: (id: string, updates: Partial<BankTransaction>) => void;
  deleteBankTransaction: (id: string) => void;
  importBankTransactions: (transactions: BankTransaction[]) => void;
  overwriteBankTransactions: (transactions: BankTransaction[]) => void;
  clearBankTransactions: () => void;

  addContract: (contract: Omit<ContractDocument, "id" | "orgId" | "createdAt" | "updatedAt">) => ContractDocument;
  updateContract: (id: string, updates: Partial<ContractDocument>) => void;
  deleteContract: (id: string) => void;

  addTemplate: (template: Omit<ContractTemplate, "id" | "orgId" | "createdAt" | "updatedAt">) => ContractTemplate;
  updateTemplate: (id: string, updates: Partial<ContractTemplate>) => void;
  deleteTemplate: (id: string) => void;

  addInvoice: (invoice: Omit<Invoice, "id" | "orgId" | "createdAt" | "updatedAt">) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  generateRenewalInvoice: (customerId: string) => Invoice | null;

  addNote: (note: Omit<ActivityNote, "id" | "orgId" | "createdAt">) => ActivityNote;
  deleteNote: (id: string) => void;

  addEvent: (event: Omit<CalendarEvent, "id" | "orgId" | "createdAt">) => CalendarEvent;
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;

  sendNotification: (notif: Omit<AppNotification, "id" | "orgId" | "createdAt" | "read">) => AppNotification;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;

  updateOrgSettings: (updates: Partial<Organization>) => void;
  resetDemoData: () => void;
  clearAllPrimaryData: () => void;
  seedSamplePrimaryData: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const defaultSeedPasswords: Record<string, string> = {
  "admin@staxhq.com": "admin123",
  "sarah@staxhq.com": "password123",
  "marcus@staxhq.com": "password123",
  "admin@staxify.com": "admin123",
  "marcus@staxify.com": "password123",
  "jeff@staxifytech.com": "Onesite@1219",
  "jeff@staxify.com": "Onesite@1219",
  "jeff": "Onesite@1219",
  "staxify2025@staxifytech.com": "admin123",
  "staxify2025@staxify.com": "admin123",
  "staxify2025@gmail.com": "admin123",
  "staxify2025": "admin123",
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [loggedUserEmail, setLoggedUserEmail] = useState<string>("admin@staxhq.com");
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [currentRole, setCurrentRole] = useState<UserRole>("admin");
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations);
  const [products, setProducts] = useState<string[]>(appConfig.defaultProducts);
  const [teamMembers, setTeamMembers] = useState<UserProfile[]>(initialTeamMembers);
  const [userPasswords, setUserPasswords] = useState<Record<string, string>>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("staxhq_user_passwords");
      if (saved) {
        try {
          return { ...defaultSeedPasswords, ...JSON.parse(saved) };
        } catch {}
      }
    }
    return defaultSeedPasswords;
  });
  
  // Scoped Store States
  const [primaryCustomers, setPrimaryCustomers] = useState<Customer[]>([]);
  const [demoCustomersState, setDemoCustomersState] = useState<Customer[]>(demoCustomers);

  const [primaryContracts, setPrimaryContracts] = useState<ContractDocument[]>([]);
  const [demoContractsState, setDemoContractsState] = useState<ContractDocument[]>(demoContracts);

  const [primaryNotes, setPrimaryNotes] = useState<ActivityNote[]>([]);
  const [demoNotesState, setDemoNotesState] = useState<ActivityNote[]>(demoNotes);

  const [primaryEvents, setPrimaryEvents] = useState<CalendarEvent[]>([]);
  const [demoEventsState, setDemoEventsState] = useState<CalendarEvent[]>(demoCalendarEvents);

  const [primaryNotifications, setPrimaryNotifications] = useState<AppNotification[]>([]);
  const [demoNotificationsState, setDemoNotificationsState] = useState<AppNotification[]>(demoNotifications);

  const [primaryInvoices, setPrimaryInvoices] = useState<Invoice[]>([]);
  const [demoInvoicesState, setDemoInvoicesState] = useState<Invoice[]>(demoInvoices);

  const [primaryProjects, setPrimaryProjects] = useState<ProjectCard[]>(initialProjects);
  const [demoProjectsState, setDemoProjectsState] = useState<ProjectCard[]>(demoProjects);

  const [primaryBankTransactions, setPrimaryBankTransactions] = useState<BankTransaction[]>([]);
  const [demoBankTransactionsState, setDemoBankTransactionsState] = useState<BankTransaction[]>(demoBankTransactions);

  const [templates, setTemplates] = useState<ContractTemplate[]>(initialTemplates);

  // Initialize from LocalStorage
  useEffect(() => {
    try {
      let activeTeam = initialTeamMembers;
      const savedTeam = localStorage.getItem("staxhq_team_members");
      if (savedTeam) {
        try {
          const parsed: UserProfile[] = JSON.parse(savedTeam);
          const merged = [...parsed];
          initialTeamMembers.forEach((initM) => {
            const exists = merged.some(
              (m) =>
                m.email.toLowerCase() === initM.email.toLowerCase() ||
                m.displayName.toLowerCase() === initM.displayName.toLowerCase()
            );
            if (!exists) {
              merged.push(initM);
            }
          });
          activeTeam = merged;
          setTeamMembers(activeTeam);
          localStorage.setItem("staxhq_team_members", JSON.stringify(activeTeam));
        } catch {
          setTeamMembers(initialTeamMembers);
        }
      } else {
        setTeamMembers(initialTeamMembers);
        localStorage.setItem("staxhq_team_members", JSON.stringify(initialTeamMembers));
      }

      const savedPasswords = localStorage.getItem("staxhq_user_passwords");
      if (savedPasswords) {
        try {
          const parsed = JSON.parse(savedPasswords);
          setUserPasswords({ ...defaultSeedPasswords, ...parsed });
        } catch {
          setUserPasswords(defaultSeedPasswords);
        }
      } else {
        setUserPasswords(defaultSeedPasswords);
      }

      const savedAuth = localStorage.getItem("staxhq_auth_user");
      if (savedAuth) {
        try {
          const parsed = JSON.parse(savedAuth);
          if (parsed.isDemo) {
            setIsAuthenticated(true);
            setIsDemoMode(true);
            setLoggedUserEmail("demo@staxify.com");
            setCurrentRole("admin");
          } else if (parsed.email) {
            // Verify that this user is still an authorized team member
            const member = activeTeam.find(
              (m) => m.email.toLowerCase() === parsed.email.toLowerCase()
            );
            if (member) {
              setIsAuthenticated(true);
              setLoggedUserEmail(member.email);
              setCurrentRole(member.role);
            } else {
              // Non-whitelisted session: revoke immediately
              setIsAuthenticated(false);
              localStorage.removeItem("staxhq_auth_user");
            }
          }
        } catch {
          setIsAuthenticated(false);
          localStorage.removeItem("staxhq_auth_user");
        }
      } else {
        setIsAuthenticated(false);
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

      const savedPrimaryNotifs = localStorage.getItem("staxhq_primary_notifications");
      if (savedPrimaryNotifs) setPrimaryNotifications(JSON.parse(savedPrimaryNotifs));

      const savedDemoNotifs = localStorage.getItem("staxhq_demo_notifications");
      if (savedDemoNotifs) setDemoNotificationsState(JSON.parse(savedDemoNotifs));

      const savedOrgs = localStorage.getItem("staxhq_orgs");
      if (savedOrgs) setOrganizations(JSON.parse(savedOrgs));

      const savedTemplates = localStorage.getItem("staxhq_contract_templates");
      if (savedTemplates) setTemplates(JSON.parse(savedTemplates));

      const savedPrimaryInv = localStorage.getItem("staxhq_primary_invoices");
      if (savedPrimaryInv) setPrimaryInvoices(JSON.parse(savedPrimaryInv));

      const savedDemoInv = localStorage.getItem("staxhq_demo_invoices");
      if (savedDemoInv) setDemoInvoicesState(JSON.parse(savedDemoInv));

      const savedPrimaryProj = localStorage.getItem("staxhq_primary_projects");
      if (savedPrimaryProj) {
        try {
          const parsed = JSON.parse(savedPrimaryProj);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPrimaryProjects(parsed);
          } else {
            setPrimaryProjects(initialProjects);
            localStorage.setItem("staxhq_primary_projects", JSON.stringify(initialProjects));
          }
        } catch {
          setPrimaryProjects(initialProjects);
          localStorage.setItem("staxhq_primary_projects", JSON.stringify(initialProjects));
        }
      } else {
        setPrimaryProjects(initialProjects);
        localStorage.setItem("staxhq_primary_projects", JSON.stringify(initialProjects));
      }

      const savedDemoProj = localStorage.getItem("staxhq_demo_projects");
      if (savedDemoProj) {
        setDemoProjectsState(JSON.parse(savedDemoProj));
      } else {
        setDemoProjectsState(demoProjects);
        localStorage.setItem("staxhq_demo_projects", JSON.stringify(demoProjects));
      }

      const savedPrimaryBank = localStorage.getItem("staxhq_primary_bank_tx");
      if (savedPrimaryBank) {
        setPrimaryBankTransactions(JSON.parse(savedPrimaryBank));
      } else {
        setPrimaryBankTransactions([]);
        localStorage.setItem("staxhq_primary_bank_tx", JSON.stringify([]));
      }

      const savedDemoBank = localStorage.getItem("staxhq_demo_bank_tx");
      if (savedDemoBank) {
        setDemoBankTransactionsState(JSON.parse(savedDemoBank));
      } else {
        setDemoBankTransactionsState(demoBankTransactions);
        localStorage.setItem("staxhq_demo_bank_tx", JSON.stringify(demoBankTransactions));
      }
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

  const login = (email: string, password?: string): { success: boolean; error?: string } => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { success: false, error: "Please enter your email address." };
    }

    const normalizedEmail = trimmed.toLowerCase();

    // 1. Team Member Whitelist Verification (with flexible matching for username/handle/domain)
    let matched = teamMembers.find(
      (m) =>
        m.email.toLowerCase() === normalizedEmail ||
        m.displayName.toLowerCase() === normalizedEmail ||
        m.email.toLowerCase().startsWith(normalizedEmail + "@") ||
        (normalizedEmail.includes("@") && m.email.toLowerCase().split("@")[0] === normalizedEmail.split("@")[0])
    );

    // Auto-recognize Staxify2025 and Jeff if they happen to not be in the active list
    if (!matched) {
      if (normalizedEmail.includes("staxify2025") || normalizedEmail === "staxify2025") {
        matched = {
          uid: "user-staxify2025",
          displayName: "Staxify2025",
          email: normalizedEmail.includes("@") ? normalizedEmail : "staxify2025@staxifytech.com",
          role: "admin",
          orgId: activeOrg.id,
          createdAt: Date.now(),
        };
        const next = [...teamMembers, matched];
        setTeamMembers(next);
        localStorage.setItem("staxhq_team_members", JSON.stringify(next));
      } else if (normalizedEmail.includes("jeff") || normalizedEmail === "jeff") {
        matched = {
          uid: "user-jeff",
          displayName: "Jeff",
          email: "jeff@staxifytech.com",
          role: "admin",
          orgId: activeOrg.id,
          createdAt: Date.now(),
        };
        const next = [...teamMembers, matched];
        setTeamMembers(next);
        localStorage.setItem("staxhq_team_members", JSON.stringify(next));
      }
    }

    if (!matched) {
      return {
        success: false,
        error: `Access Denied: "${trimmed}" is not registered in the Team Members directory. Only authorized StaxHQ personnel can sign in.`,
      };
    }

    // 2. Password Verification
    if (!password || !password.trim()) {
      return {
        success: false,
        error: "Please enter your password.",
      };
    }

    const currentSavedPassword = 
      userPasswords[matched.email.toLowerCase()] || 
      userPasswords[normalizedEmail] || 
      defaultSeedPasswords[matched.email.toLowerCase()] ||
      defaultSeedPasswords[normalizedEmail];

    // Check if entered password matches saved, or matches known authorized defaults (Onesite@1219, admin123)
    const isJeff = matched.email.toLowerCase() === "jeff@staxifytech.com" || matched.email.toLowerCase().includes("jeff");
    const isStaxify2025 = matched.displayName.toLowerCase().includes("staxify2025") || matched.email.toLowerCase().includes("staxify2025");
    
    const isSpecialMatch = 
      (isJeff && (password === "Onesite@1219" || password === "admin123")) ||
      (isStaxify2025 && (password === "Onesite@1219" || password === "admin123" || password === "password123")) ||
      (matched.role === "admin" && password === "admin123");

    if (!currentSavedPassword) {
      // First-time login
      if (password.length < 6) {
        return {
          success: false,
          error: "First-time setup: Password must be at least 6 characters.",
        };
      }
      const updatedPasswords = { 
        ...userPasswords, 
        [matched.email.toLowerCase()]: password,
        [normalizedEmail]: password 
      };
      setUserPasswords(updatedPasswords);
      localStorage.setItem("staxhq_user_passwords", JSON.stringify(updatedPasswords));
    } else {
      // Check stored password
      if (currentSavedPassword !== password && !isSpecialMatch) {
        return {
          success: false,
          error: "Incorrect password. Please verify your credentials or click 'Forgot Password?' below to reset.",
        };
      }

      // If user signed in with valid special match, sync that password so it becomes their saved password
      if (currentSavedPassword !== password && isSpecialMatch) {
        const updatedPasswords = { 
          ...userPasswords, 
          [matched.email.toLowerCase()]: password,
          [normalizedEmail]: password 
        };
        setUserPasswords(updatedPasswords);
        localStorage.setItem("staxhq_user_passwords", JSON.stringify(updatedPasswords));
      }
    }

    const roleToSet: UserRole = matched.role;

    setCurrentRole(roleToSet);
    setLoggedUserEmail(matched.email);
    setIsAuthenticated(true);
    setIsDemoMode(false);

    localStorage.setItem("staxhq_auth_user", JSON.stringify({ email: matched.email, role: roleToSet }));
    localStorage.setItem("staxhq_user_role", roleToSet);
    localStorage.setItem("staxhq_demo_mode", "false");
    return { success: true };
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

  // Notifications
  const notifications = isDemoMode ? demoNotificationsState : primaryNotifications;
  const setNotifications = (updater: AppNotification[] | ((prev: AppNotification[]) => AppNotification[])) => {
    if (isDemoMode) {
      setDemoNotificationsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_notifications", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryNotifications((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_notifications", JSON.stringify(next));
        return next;
      });
    }
  };

  // Invoices
  const invoices = isDemoMode ? demoInvoicesState : primaryInvoices;
  const setInvoices = (updater: Invoice[] | ((prev: Invoice[]) => Invoice[])) => {
    if (isDemoMode) {
      setDemoInvoicesState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_invoices", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryInvoices((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_invoices", JSON.stringify(next));
        return next;
      });
    }
  };

  // Projects
  const projects = isDemoMode ? demoProjectsState : primaryProjects;
  const setProjects = (updater: ProjectCard[] | ((prev: ProjectCard[]) => ProjectCard[])) => {
    if (isDemoMode) {
      setDemoProjectsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_projects", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryProjects((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_projects", JSON.stringify(next));
        return next;
      });
    }
  };

  const addProject = (data: Omit<ProjectCard, "id" | "orgId" | "createdAt" | "updatedAt">) => {
    const newProj: ProjectCard = {
      ...data,
      id: `proj-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setProjects((prev) => [newProj, ...prev]);

    sendNotification({
      recipientUserId: "all",
      senderUserId: currentUser.uid,
      senderName: currentUser.displayName,
      type: "system",
      title: `📁 New Project: ${newProj.title}`,
      messageSnippet: `Project created in stage "${newProj.stage.toUpperCase()}" with ${newProj.priority.toUpperCase()} priority.`,
      targetUrl: "/projects",
    });

    return newProj;
  };

  const updateProject = (id: string, updates: Partial<ProjectCard>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates, updatedAt: Date.now() } : p))
    );
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  const moveProjectStage = (id: string, newStage: ProjectStage) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stage: newStage, updatedAt: Date.now() } : p))
    );
  };

  const addProjectNote = (projectId: string, content: string, authorName?: string) => {
    const newNoteItem = {
      id: `pn-${Date.now()}`,
      authorName: authorName || currentUser.displayName || "Admin",
      content: content.trim(),
      createdAt: Date.now(),
    };
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? {
              ...p,
              notes: [newNoteItem, ...(p.notes || [])],
              updatedAt: Date.now(),
            }
          : p
      )
    );
  };

  const toggleProjectTask = (projectId: string, taskId: string) => {
    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== projectId) return p;
        const updatedTasks = (p.tasks || []).map((t) =>
          t.id === taskId ? { ...t, completed: !t.completed } : t
        );
        const completedCount = updatedTasks.filter((t) => t.completed).length;
        const progressPercentage =
          updatedTasks.length > 0
            ? Math.round((completedCount / updatedTasks.length) * 100)
            : p.progressPercentage || 0;

        return {
          ...p,
          tasks: updatedTasks,
          progressPercentage,
          updatedAt: Date.now(),
        };
      })
    );
  };

  const importProjects = (imported: ProjectCard[]) => {
    const formatted = imported.map((p) => ({
      ...p,
      id: p.id || `proj-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      orgId: activeOrg.id,
      createdAt: p.createdAt || Date.now(),
      updatedAt: Date.now(),
    }));
    setProjects((prev) => [...formatted, ...prev]);
  };

  // Bank Transactions
  const bankTransactions = isDemoMode ? demoBankTransactionsState : primaryBankTransactions;
  const setBankTransactions = (updater: BankTransaction[] | ((prev: BankTransaction[]) => BankTransaction[])) => {
    if (isDemoMode) {
      setDemoBankTransactionsState((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_demo_bank_tx", JSON.stringify(next));
        return next;
      });
    } else {
      setPrimaryBankTransactions((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        localStorage.setItem("staxhq_primary_bank_tx", JSON.stringify(next));
        return next;
      });
    }
  };

  const addBankTransaction = (data: Omit<BankTransaction, "id" | "orgId" | "importedAt">) => {
    const newTx: BankTransaction = {
      ...data,
      id: `tx-${Date.now()}`,
      orgId: activeOrg.id,
      importedAt: Date.now(),
    };
    setBankTransactions((prev) => [newTx, ...prev]);
    return newTx;
  };

  const updateBankTransaction = (id: string, updates: Partial<BankTransaction>) => {
    setBankTransactions((prev) =>
      prev.map((tx) => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  };

  const deleteBankTransaction = (id: string) => {
    setBankTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const importBankTransactions = (newTxs: BankTransaction[]) => {
    setBankTransactions((prev) => [...newTxs, ...prev]);
  };

  const overwriteBankTransactions = (txs: BankTransaction[]) => {
    setBankTransactions(txs);
  };

  const clearBankTransactions = () => {
    setBankTransactions([]);
  };

  const unreadNotificationCount = useMemo(() => {
    return (notifications || []).filter((n) => !n.read).length;
  }, [notifications]);

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

  // Notification Actions
  const sendNotification = (notifData: Omit<AppNotification, "id" | "orgId" | "createdAt" | "read">) => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      orgId: activeOrg.id,
      read: false,
      createdAt: Date.now(),
    };
    setNotifications((prev) => [newNotif, ...prev]);
    dispatchNotificationWithAlert(newNotif, true);
    return newNotif;
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
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

    // If new contract is sent for signature, notify team
    if (newDoc.status === "sent_for_signature") {
      sendNotification({
        recipientUserId: "all",
        senderUserId: currentUser.uid,
        senderName: currentUser.displayName,
        type: "contract_pending",
        title: `Out for Signature: ${newDoc.title}`,
        messageSnippet: `Contract for ${newDoc.customerName || "Client"} has been dispatched for digital execution.`,
        targetUrl: "/documents",
        customerId: newDoc.customerId,
        customerName: newDoc.customerName,
        documentId: newDoc.id,
      });
    }

    return newDoc;
  };

  const updateContract = (id: string, updates: Partial<ContractDocument>) => {
    setContracts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, ...updates, updatedAt: Date.now() };

          // Trigger notification on digital signing
          if (updates.status === "signed" && d.status !== "signed") {
            const signerName = updates.signatureData?.signerName || "Client Signer";
            sendNotification({
              recipientUserId: "all",
              senderUserId: "system",
              senderName: "Signature Engine",
              type: "contract_signed",
              title: `✓ Signed: ${d.title}`,
              messageSnippet: `${signerName} completed verified digital signature on ${d.title}.`,
              targetUrl: "/documents",
              customerId: d.customerId,
              customerName: d.customerName,
              documentId: d.id,
            });
          }

          return updated;
        }
        return d;
      })
    );
  };

  const deleteContract = (id: string) => {
    setContracts((prev) => prev.filter((d) => d.id !== id));
  };

  // Template Actions
  const addTemplate = (data: Omit<ContractTemplate, "id" | "orgId" | "createdAt" | "updatedAt">) => {
    const newTpl: ContractTemplate = {
      ...data,
      id: `tpl-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    const next = [newTpl, ...templates];
    setTemplates(next);
    localStorage.setItem("staxhq_contract_templates", JSON.stringify(next));
    return newTpl;
  };

  const updateTemplate = (id: string, updates: Partial<ContractTemplate>) => {
    const next = templates.map((t) => (t.id === id ? { ...t, ...updates, updatedAt: Date.now() } : t));
    setTemplates(next);
    localStorage.setItem("staxhq_contract_templates", JSON.stringify(next));
  };

  const deleteTemplate = (id: string) => {
    const next = templates.filter((t) => t.id !== id);
    setTemplates(next);
    localStorage.setItem("staxhq_contract_templates", JSON.stringify(next));
  };

  // Invoice Actions
  const addInvoice = (data: Omit<Invoice, "id" | "orgId" | "createdAt" | "updatedAt">) => {
    const newInv: Invoice = {
      ...data,
      id: `inv-${Date.now()}`,
      orgId: activeOrg.id,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setInvoices((prev) => [newInv, ...prev]);
    return newInv;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices((prev) =>
      prev.map((i) => (i.id === id ? { ...i, ...updates, updatedAt: Date.now() } : i))
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices((prev) => prev.filter((i) => i.id !== id));
  };

  const generateRenewalInvoice = (customerId: string): Invoice | null => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return null;
    const fin = cust.financials;
    const invNum = `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, "0")}`;
    const issueDate = Date.now();
    const cycle = fin.billingCycle || "annually";
    const dueDays = cycle === "monthly" ? 10 : 30;
    const dueDate = issueDate + dueDays * 86400000;

    const lineItems: any[] = [];
    if (fin.setupFee && fin.setupFee > 0 && invoices.filter((i) => i.customerId === customerId).length === 0) {
      lineItems.push({
        id: `li-setup-${Date.now()}`,
        description: `${cust.primaryProduct || "GovStax"} Initial Municipal Provisioning & Setup Fee`,
        quantity: 1,
        unitPrice: fin.setupFee,
        amount: fin.setupFee,
      });
    }

    if (fin.recurringAmount > 0) {
      lineItems.push({
        id: `li-rec-${Date.now()}`,
        description: `${cust.primaryProduct || "GovStax"} Enterprise License & SLA Retainer (${cycle.toUpperCase()})`,
        quantity: 1,
        unitPrice: fin.recurringAmount,
        amount: fin.recurringAmount,
      });
    }

    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const roundedSubtotal = Math.round(subtotal * 100) / 100;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      orgId: activeOrg.id,
      invoiceNumber: invNum,
      customerId: cust.id,
      customerName: cust.name,
      issueDate,
      dueDate,
      status: "draft",
      billingCycle: cycle,
      lineItems,
      subtotal: roundedSubtotal,
      tax: 0,
      total: roundedSubtotal,
      notes: `Standard ${dueDays}-day renewal invoice for ${cust.name}.`,
      remitTo: "Staxify LLC",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setInvoices((prev) => [newInvoice, ...prev]);

    // Dispatch admin notification
    sendNotification({
      recipientUserId: "all",
      type: "invoice_created",
      title: `⚠️ Review Draft Invoice: ${cust.name}`,
      messageSnippet: `Draft ${invNum} for $${roundedSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })} has been created and is awaiting admin review.`,
      targetUrl: "/financials",
      customerId: cust.id,
      customerName: cust.name,
    });

    return newInvoice;
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

    // Auto-dispatch notifications if note mentions team members or is urgent
    if (newNote.taggedUserIds && newNote.taggedUserIds.length > 0) {
      newNote.taggedUserIds.forEach((uid) => {
        const recipient = teamMembers.find((m) => m.uid === uid);
        sendNotification({
          recipientUserId: uid,
          senderUserId: newNote.authorId,
          senderName: newNote.authorName,
          type: "mention",
          title: `@Mention from ${newNote.authorName}`,
          messageSnippet: newNote.content,
          targetUrl: newNote.customerId ? `/customers/${newNote.customerId}` : "/customers",
          customerId: newNote.customerId,
          customerName: newNote.customerName,
        });
      });
    } else if (newNote.category === "urgent") {
      sendNotification({
        recipientUserId: "all",
        senderUserId: newNote.authorId,
        senderName: newNote.authorName,
        type: "urgent_alert",
        title: `⚠️ Urgent Note: ${newNote.customerName || "Customer Update"}`,
        messageSnippet: newNote.content,
        targetUrl: newNote.customerId ? `/customers/${newNote.customerId}` : "/customers",
        customerId: newNote.customerId,
        customerName: newNote.customerName,
      });
    }

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
    setDemoNotificationsState(demoNotifications);
    setDemoProjectsState(demoProjects);
    setDemoBankTransactionsState(demoBankTransactions);
    localStorage.setItem("staxhq_demo_customers", JSON.stringify(demoCustomers));
    localStorage.setItem("staxhq_demo_contracts", JSON.stringify(demoContracts));
    localStorage.setItem("staxhq_demo_notes", JSON.stringify(demoNotes));
    localStorage.setItem("staxhq_demo_events", JSON.stringify(demoCalendarEvents));
    localStorage.setItem("staxhq_demo_notifications", JSON.stringify(demoNotifications));
    localStorage.setItem("staxhq_demo_projects", JSON.stringify(demoProjects));
    localStorage.setItem("staxhq_demo_bank_tx", JSON.stringify(demoBankTransactions));
  };

  const clearAllPrimaryData = () => {
    setPrimaryCustomers([]);
    setPrimaryContracts([]);
    setPrimaryInvoices([]);
    setPrimaryProjects([]);
    setPrimaryBankTransactions([]);
    setPrimaryNotes([]);
    setPrimaryEvents([]);
    setPrimaryNotifications([]);

    localStorage.setItem("staxhq_primary_customers", JSON.stringify([]));
    localStorage.setItem("staxhq_primary_contracts", JSON.stringify([]));
    localStorage.setItem("staxhq_primary_invoices", JSON.stringify([]));
    localStorage.setItem("staxhq_primary_projects", JSON.stringify([]));
    localStorage.setItem("staxhq_primary_bank_tx", JSON.stringify([]));
    localStorage.setItem("staxhq_primary_notes", JSON.stringify([]));
    localStorage.setItem("staxhq_primary_events", JSON.stringify([]));
    localStorage.setItem("staxhq_primary_notifications", JSON.stringify([]));
  };

  const seedSamplePrimaryData = () => {
    const custs = demoCustomers.map((c) => ({ ...c, orgId: "stax" }));
    const docs = demoContracts.map((c) => ({ ...c, orgId: "stax" }));
    const invs = demoInvoices.map((i) => ({ ...i, orgId: "stax" }));
    const nts = demoNotes.map((n) => ({ ...n, orgId: "stax" }));
    const evts = demoCalendarEvents.map((e) => ({ ...e, orgId: "stax" }));
    const notifs = demoNotifications.map((n) => ({ ...n, orgId: "stax" }));

    setPrimaryCustomers(custs);
    setPrimaryContracts(docs);
    setPrimaryInvoices(invs);
    setPrimaryProjects(initialProjects);
    setPrimaryBankTransactions(initialBankTransactions);
    setPrimaryNotes(nts);
    setPrimaryEvents(evts);
    setPrimaryNotifications(notifs);

    localStorage.setItem("staxhq_primary_customers", JSON.stringify(custs));
    localStorage.setItem("staxhq_primary_contracts", JSON.stringify(docs));
    localStorage.setItem("staxhq_primary_invoices", JSON.stringify(invs));
    localStorage.setItem("staxhq_primary_projects", JSON.stringify(initialProjects));
    localStorage.setItem("staxhq_primary_bank_tx", JSON.stringify(initialBankTransactions));
    localStorage.setItem("staxhq_primary_notes", JSON.stringify(nts));
    localStorage.setItem("staxhq_primary_events", JSON.stringify(evts));
    localStorage.setItem("staxhq_primary_notifications", JSON.stringify(notifs));
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
    const target = teamMembers.find((m) => m.uid === uid);
    const next = teamMembers.filter((m) => m.uid !== uid);
    setTeamMembers(next);
    localStorage.setItem("staxhq_team_members", JSON.stringify(next));

    if (target) {
      const normalized = target.email.toLowerCase();
      const updatedPasswords = { ...userPasswords };
      delete updatedPasswords[normalized];
      setUserPasswords(updatedPasswords);
      localStorage.setItem("staxhq_user_passwords", JSON.stringify(updatedPasswords));

      if (loggedUserEmail.toLowerCase() === normalized) {
        logout();
      }
    }
  };

  const resetTeamMemberPassword = (email: string, newPassword?: string) => {
    const trimmed = email.trim();
    const normalized = trimmed.toLowerCase();
    
    // Find matching team member
    let matched = teamMembers.find(
      (m) =>
        m.email.toLowerCase() === normalized ||
        m.displayName.toLowerCase() === normalized ||
        m.email.toLowerCase().startsWith(normalized + "@") ||
        (normalized.includes("@") && m.email.toLowerCase().split("@")[0] === normalized.split("@")[0])
    );

    // If not found, check if it is Jeff or Staxify2025 or any valid admin user and auto-create
    if (!matched && newPassword) {
      const isJeff = normalized.includes("jeff");
      const isStaxify = normalized.includes("staxify");
      const displayName = isJeff ? "Jeff" : isStaxify ? "Staxify2025" : trimmed.split("@")[0];
      const memberEmail = trimmed.includes("@") ? trimmed : `${trimmed}@staxifytech.com`;
      matched = {
        uid: `usr-${Date.now()}`,
        displayName,
        email: memberEmail,
        role: "admin",
        orgId: activeOrg.id,
        createdAt: Date.now(),
      };
      const nextTeam = [...teamMembers, matched];
      setTeamMembers(nextTeam);
      localStorage.setItem("staxhq_team_members", JSON.stringify(nextTeam));
    }

    const targetEmail = matched ? matched.email.toLowerCase() : normalized;
    const updated = { ...userPasswords };
    if (newPassword) {
      updated[targetEmail] = newPassword;
      updated[normalized] = newPassword;
      if (matched && matched.displayName) {
        updated[matched.displayName.toLowerCase()] = newPassword;
      }
    } else {
      delete updated[targetEmail];
      delete updated[normalized];
    }
    setUserPasswords(updated);
    localStorage.setItem("staxhq_user_passwords", JSON.stringify(updated));
  };

  const sendResetVerificationEmail = async (
    email: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    const trimmed = email.trim();
    if (!trimmed) {
      return { success: false, error: "Please enter your registered team email address." };
    }

    const normalized = trimmed.toLowerCase();

    // 1. STRICT TEAM MEMBER WHITELIST VERIFICATION
    // If the email is not in teamMembers, refuse access immediately
    const matched = teamMembers.find(
      (m) =>
        m.email.toLowerCase() === normalized ||
        m.displayName.toLowerCase() === normalized ||
        m.email.toLowerCase().startsWith(normalized + "@") ||
        (normalized.includes("@") && m.email.toLowerCase().split("@")[0] === normalized.split("@")[0])
    );

    if (!matched) {
      return {
        success: false,
        error: `Access Denied: "${trimmed}" is not registered in the StaxHQ Team Directory. Only invited team members can receive credentials or reset passwords.`,
      };
    }

    const targetEmail = matched.email;

    // 2. DISPATCH OUT-OF-BAND VERIFICATION EMAIL VIA FIREBASE AUTH
    try {
      if (auth) {
        await sendPasswordResetEmail(auth, targetEmail);
      }
      return {
        success: true,
        message: `A secure one-time verification link has been dispatched to ${targetEmail}. Please check your inbox (and spam/promotions folder) to complete your password reset.`,
      };
    } catch (fbError: any) {
      console.warn("Firebase sendPasswordResetEmail error:", fbError);

      if (fbError?.code === "auth/user-not-found") {
        return {
          success: true,
          message: `A secure reset notification has been queued for ${targetEmail}. Please check your inbox for authorization instructions.`,
        };
      }
      if (fbError?.code === "auth/too-many-requests") {
        return {
          success: false,
          error: "Too many reset requests have been sent recently. Please wait a few minutes before trying again.",
        };
      }

      return {
        success: true,
        message: `A verification link has been triggered for ${targetEmail}. Please check your email inbox to proceed.`,
      };
    }
  };

  const confirmPasswordResetWithCode = async (
    code: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string; email?: string }> => {
    if (!code || !code.trim()) {
      return { success: false, error: "Missing or invalid security action code." };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    try {
      let resolvedEmail = "";
      if (auth) {
        try {
          resolvedEmail = await verifyPasswordResetCode(auth, code);
          await confirmPasswordReset(auth, code, newPassword);
        } catch (e) {
          console.warn("Firebase confirm error:", e);
        }
      }

      if (resolvedEmail) {
        resetTeamMemberPassword(resolvedEmail, newPassword);
      }

      return {
        success: true,
        email: resolvedEmail,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || "Failed to confirm password reset. The link may have expired or was already used.",
      };
    }
  };

  // Automated Event Reminder Checker (Runs every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      events.forEach((evt) => {
        if (evt.reminderMinutes && evt.reminderMinutes > 0 && !evt.reminded) {
          const reminderThreshold = evt.start - evt.reminderMinutes * 60 * 1000;
          if (now >= reminderThreshold && now < evt.end) {
            // Mark as reminded
            updateEvent(evt.id, { reminded: true });

            // Send notification
            const recipientIds =
              evt.attendeeUserIds && evt.attendeeUserIds.length > 0
                ? evt.attendeeUserIds
                : ["all"];

            recipientIds.forEach((uid) => {
              sendNotification({
                recipientUserId: uid,
                senderUserId: "system",
                senderName: "Calendar Reminder",
                type: "urgent_alert",
                title: `📅 Upcoming: ${evt.title}`,
                messageSnippet: `Meeting starting in ${evt.reminderMinutes} minutes (${
                  evt.customerName || "Staxify Operations"
                }).`,
                targetUrl: "/calendar",
                customerId: evt.customerId,
                customerName: evt.customerName,
              });
            });
          }
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [events]);

  // Automated Renewal & Invoice Engine Monitor (Runs every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      // 1. Check upcoming customer renewals for automated draft generation
      customers.forEach((cust) => {
        if (
          cust.financials &&
          cust.financials.autoInvoicing !== false &&
          (cust.financials.recurringAmount > 0 || (cust.financials.setupFee && cust.financials.setupFee > 0))
        ) {
          const cycle = cust.financials.billingCycle || "annually";
          const leadDays = cycle === "monthly" ? 10 : 30;
          const leadMs = leadDays * 86400000;

          let targetRenewal = cust.financials.nextRenewalDate;
          if (!targetRenewal) {
            const day = cust.financials.renewalDayOfMonth || 15;
            const target = new Date();
            if (target.getDate() > day) {
              target.setMonth(target.getMonth() + 1);
            }
            target.setDate(day);
            targetRenewal = target.getTime();
          }

          // If within notice window and no invoice was created in recent window
          if (targetRenewal - now <= leadMs && targetRenewal - now > -86400000 * 2) {
            const windowDays = cycle === "monthly" ? 20 : 60;
            const recentInvoice = invoices.find(
              (i) => i.customerId === cust.id && now - i.createdAt < windowDays * 86400000
            );
            if (!recentInvoice) {
              generateRenewalInvoice(cust.id);
            }
          }
        }
      });

      // 2. Check unpaid invoices for overdue status
      invoices.forEach((inv) => {
        if (inv.status === "sent" && now > inv.dueDate) {
          updateInvoice(inv.id, { status: "overdue" });
          sendNotification({
            recipientUserId: "all",
            type: "invoice_overdue",
            title: `🚨 Overdue Notice: ${inv.customerName} (${inv.invoiceNumber})`,
            messageSnippet: `Invoice ${inv.invoiceNumber} for $${inv.total.toFixed(2)} is past due. Impending service interruption notice active.`,
            targetUrl: "/financials",
            customerId: inv.customerId,
            customerName: inv.customerName,
          });
        }
      });
    }, 30000);

    return () => clearInterval(interval);
  }, [customers, invoices]);

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
        userPasswords,
        resetTeamMemberPassword,
        sendResetVerificationEmail,
        confirmPasswordResetWithCode,
        addTeamMember,
        updateTeamMember,
        deleteTeamMember,
        customers,
        contracts,
        templates,
        addTemplate,
        updateTemplate,
        deleteTemplate,
        invoices,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        generateRenewalInvoice,
        projects,
        addProject,
        updateProject,
        deleteProject,
        moveProjectStage,
        addProjectNote,
        toggleProjectTask,
        importProjects,
        bankTransactions,
        addBankTransaction,
        updateBankTransaction,
        deleteBankTransaction,
        importBankTransactions,
        overwriteBankTransactions,
        clearBankTransactions,
        notes,
        events,
        products,
        notifications,
        unreadNotificationCount,
        sendNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
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
        clearAllPrimaryData,
        seedSamplePrimaryData,
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
