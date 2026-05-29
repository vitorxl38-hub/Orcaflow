import React, { useState, useEffect } from 'react';
import {
  Sparkles, FileText, CheckCircle2, AlertCircle, TrendingUp, Users, Settings,
  CreditCard, ShieldAlert, Phone, HelpCircle, Share2, Copy, Download, Trash2,
  Plus, Play, Check, Send, Coins, LogIn, ChevronRight, CheckCircle, RefreshCw,
  Layers, Palette, Briefcase, UserPlus, KeyRound, ShieldCheck
} from 'lucide-react';
import { AIPanel } from './components/AIPanel';
import { SignaturePad } from './components/SignaturePad';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';

import { PlanType, UserRole, BudgetStatus, User, Workspace, BudgetItem, Budget, MetricSummary, SaaSAdminData, CatalogService } from './types';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'budget-maker' | 'dashboard' | 'services' | 'clients' | 'team' | 'admin'>('budget-maker');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Authentication State
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Registration State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regToken, setRegToken] = useState('');

  // Token Management lists for Superadmin Victor
  const [saasTokens, setSaasTokens] = useState<any[]>([]);
  const [newCreatedTokenCode, setNewCreatedTokenCode] = useState('');
  const [newCreatedTokenEmail, setNewCreatedTokenEmail] = useState('');

  // Explicit Saved Clients States
  const [clientsList, setClientsList] = useState<any[]>([]);
  const [isAddingClient, setIsAddingClient] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientAddress, setNewClientAddress] = useState('');

  const [authLoading, setAuthLoading] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Workspace & Multi-company State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);
  const [isCreatingWorkspace, setIsCreatingWorkspace] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsNiche, setNewWsNiche] = useState('Construção Civil & Reforma');
  const [wsMembers, setWsMembers] = useState<any[]>([]);

  // Budget State
  const [budgets, setBudgets] = useState<Budget[]>([]);
  
  // Service Catalog State
  const [services, setServices] = useState<CatalogService[]>([]);
  const [newServiceDesc, setNewServiceDesc] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [isAddingService, setIsAddingService] = useState(false);
  const [activeBudget, setActiveBudget] = useState<Partial<Budget>>({
    clientName: '',
    clientPhone: '',
    clientEmail: '',
    clientAddress: '',
    discountType: 'PERCENTAGE',
    discountValue: 0,
    validityDays: 15,
    paymentTerms: 'À vista via Pix com 5% de desconto imediato',
    status: BudgetStatus.PENDING,
    observations: 'Orçamento gerado e validado via OrçaFlow AI. Garantia integral de execução técnica de acordo com normas técnicas vigentes.',
    items: [
      { id: '1', description: 'Mão de obra qualificada e execução técnica supervisionada', quantity: 1, unitPrice: 1200, discount: 0 },
      { id: '2', description: 'Insumos homologados e conectores de alta pressão', quantity: 2, unitPrice: 180, discount: 0 }
    ],
    providerSignature: 'Vítor Mendes - Solares Soluções',
    clientSignature: '',
    clientSignatureName: '',
    clientSignatureDate: ''
  });

  // UI state
  const [checkoutModal, setCheckoutModal] = useState<string | null>(null);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({ name: '', email: '', role: UserRole.MEMBER });
  const [saasAdminData, setSaasAdminData] = useState<SaaSAdminData | null>(null);
  const [showPixQr, setShowPixQr] = useState(false);
  const [pixPayload, setPixPayload] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Post-Purchase Multi-Tenant Onboarding State
  const [isOnboarding, setIsOnboarding] = useState(false);

  // Local state for workspace form editing to avoid direct keystroke API calls and support explicit "Save" action
  const [workspaceForm, setWorkspaceForm] = useState({
    name: '',
    niche: '',
    phone: '',
    email: '',
    address: '',
    brandColor: '#3b82f6',
    pixKey: ''
  });

  // Services Catalog advanced additions states
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [newServiceCategory, setNewServiceCategory] = useState<string>('Serviço');
  const [newServiceCode, setNewServiceCode] = useState<string>('');
  const [newServiceObs, setNewServiceObs] = useState<string>('');

  // Token advanced customization
  const [newCreatedTokenDuration, setNewCreatedTokenDuration] = useState<string>('no-expire');

  // Budget live autocomplete states
  const [activeSuggestRow, setActiveSuggestRow] = useState<number | null>(null);
  const [suggestFilteredList, setSuggestFilteredList] = useState<any[]>([]);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingPlan, setOnboardingPlan] = useState<PlanType | null>(null);
  const [onboardingForm, setOnboardingForm] = useState({
    name: 'Solares Soluções Corporativas',
    niche: 'Eletricista & Automação',
    phone: '(11) 98765-4321',
    email: 'comercial@solaresenergia.com.br',
    address: 'Av. Paulista, 1000 - São Paulo, SP',
    brandColor: '#eab308',
    pixKey: 'financeiro@solaresenergia.com.br'
  });
  const [onboardingTeam, setOnboardingTeam] = useState<{name: string, email: string, role: UserRole}[]>([]);
  const [newOnboardingMember, setNewOnboardingMember] = useState({ name: '', email: '', role: UserRole.MEMBER });

  // Auto notification helper
  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Dynamic dashboard analytics calculations based on real active workspace budgets
  const computedDashboardData = React.useMemo(() => {
    const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    // Initialize empty values for months
    const monthlyValuesMap = months.reduce((acc, month) => {
      acc[month] = { count: 0, approved: 0, total: 0 };
      return acc;
    }, {} as Record<string, { count: number, approved: number, total: number }>);
    
    budgets.forEach(b => {
      try {
        const date = b.createdAt ? new Date(b.createdAt) : new Date();
        const monthIdx = date.getMonth();
        const monthName = months[monthIdx];
        if (monthlyValuesMap[monthName]) {
          monthlyValuesMap[monthName].total += b.total;
          monthlyValuesMap[monthName].count += 1;
          if (b.status === BudgetStatus.APPROVED) {
            monthlyValuesMap[monthName].approved += b.total;
          }
        }
      } catch (e) {
        // Safe check
      }
    });

    const chartData = months.map(m => ({
      month: m,
      value: monthlyValuesMap[m].total,
      approved: monthlyValuesMap[m].approved,
      count: monthlyValuesMap[m].count
    })).filter((item, index) => {
      const currentMonthIdx = new Date().getMonth();
      // keep up to current month or months with positive values
      return index <= currentMonthIdx || item.value > 0;
    });

    // Calculate dynamic operating categories in budgets list
    const nicheMap: Record<string, number> = {};
    budgets.forEach(b => {
      const n = b.nicheTemplate || activeWorkspace?.niche || "Geral";
      nicheMap[n] = (nicheMap[n] || 0) + b.total;
    });

    const nicheData = Object.entries(nicheMap).map(([niche, count]) => ({
      niche: niche.length > 20 ? niche.substring(0, 18) + '...' : niche,
      count: Math.round(count)
    })).sort((a, b) => b.count - a.count);

    if (nicheData.length === 0) {
      nicheData.push({ niche: activeWorkspace?.niche || "Geral", count: 0 });
    }

    const totalValue = budgets.reduce((acc, curr) => acc + curr.total, 0);
    const approvedValue = budgets.filter(b => b.status === BudgetStatus.APPROVED).reduce((acc, curr) => acc + curr.total, 0);
    const pendingValue = budgets.filter(b => b.status === BudgetStatus.PENDING).reduce((acc, curr) => acc + curr.total, 0);
    const inProgressValue = budgets.filter(b => b.status === BudgetStatus.IN_PROGRESS).reduce((acc, curr) => acc + curr.total, 0);
    const declinedValue = budgets.filter(b => b.status === BudgetStatus.DECLINED).reduce((acc, curr) => acc + curr.total, 0);

    const totalCount = budgets.length;
    const approvedCount = budgets.filter(b => b.status === BudgetStatus.APPROVED).length;
    const pendingCount = budgets.filter(b => b.status === BudgetStatus.PENDING).length;
    const conversionRate = totalCount > 0 ? (approvedCount / totalCount) * 100 : 0;

    return {
      chartData,
      nicheData,
      totalValue,
      approvedValue,
      pendingValue,
      inProgressValue,
      declinedValue,
      totalCount,
      approvedCount,
      pendingCount,
      conversionRate
    };
  }, [budgets, activeWorkspace]);

  // Fetch initial profile and active workspace from backend
  useEffect(() => {
    async function initSession() {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          setActiveWorkspace(data.workspace);

          // Fetch user's workspaces
          const wsRes = await fetch('/api/workspaces');
          const wsData = await wsRes.json();
          setWorkspaces(wsData);

          // Fetch budgets
          const bRes = await fetch('/api/budgets');
          const bData = await bRes.json();
          setBudgets(bData);
        }
      } catch (err) {
        console.error("Erro carregando sessão inicial:", err);
      }
    }
    initSession();
  }, []);

  // Sync members, services, and explicit clients list when workspace changes
  useEffect(() => {
    if (activeWorkspace?.id) {
      fetch(`/api/workspaces/${activeWorkspace.id}/members`)
        .then(res => res.json())
        .then(data => setWsMembers(data))
        .catch(err => console.error(err));

      fetch(`/api/workspaces/${activeWorkspace.id}/services`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setServices(data))
        .catch(err => console.error(err));

      fetch(`/api/workspaces/${activeWorkspace.id}/clients`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setClientsList(data))
        .catch(err => console.error(err));

      setWorkspaceForm({
        name: activeWorkspace.name || '',
        niche: activeWorkspace.niche || '',
        phone: activeWorkspace.phone || '',
        email: activeWorkspace.email || '',
        address: activeWorkspace.address || '',
        brandColor: activeWorkspace.brandColor || '#3b82f6',
        pixKey: activeWorkspace.pixKey || ''
      });
    }
  }, [activeWorkspace]);

  // Load SaaS admin tokens and metrics when super administrator logs in
  useEffect(() => {
    if (user?.isSuperAdmin) {
      fetch(`/api/saas/tokens`)
        .then(res => res.ok ? res.json() : [])
        .then(data => setSaasTokens(data))
        .catch(err => console.error(err));

      fetch(`/api/saas/admin`)
        .then(res => res.ok ? res.json() : null)
        .then(data => data && setSaasAdminData(data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // Login Action
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      showNotification("E-mail e senha são obrigatórios.", "error");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.error || "Erro ao fazer login.", "error");
        return;
      }
      if (data.success) {
        setUser(data.user);
        setActiveWorkspace(data.workspace);
        showNotification(`Olá, ${data.user.name}. Acesso realizado!`);
        
        // Load workspaces & budgets
        const wsRes = await fetch('/api/workspaces');
        const wsData = await wsRes.json();
        setWorkspaces(wsData);

        const bRes = await fetch('/api/budgets');
        const bData = await bRes.json();
        setBudgets(bData);
      }
    } catch (err) {
      showNotification("Erro na autenticação. Tente novamente.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  // Register New Account with Token Action
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPassword || !regToken) {
      showNotification("Por favor, preencha todos os campos do cadastro.", "error");
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: regName, email: regEmail, password: regPassword, token: regToken })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.error || "Falha ao registrar conta.", "error");
        return;
      }
      if (data.success) {
        setUser(data.user);
        setActiveWorkspace(data.workspace);
        showNotification("Conta criada e ativada com sucesso! Bem-vindo ao OrçaFlow.");

        // Clean values
        setRegName('');
        setRegEmail('');
        setRegPassword('');
        setRegToken('');
        setAuthMode('login');

        // Refresh lists
        const wsRes = await fetch('/api/workspaces');
        const wsData = await wsRes.json();
        setWorkspaces(wsData);

        const bRes = await fetch('/api/budgets');
        const bData = await bRes.json();
        setBudgets(bData);
      }
    } catch (err) {
      showNotification("Erro ao processar ativação de conta.", "error");
    } finally {
      setAuthLoading(false);
    }
  };

  // Change Select Workspace
  const handleSelectWorkspace = async (id: string) => {
    try {
      const res = await fetch('/api/workspaces/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId: id })
      });
      const data = await res.json();
      if (data.success) {
        setActiveWorkspace(data.workspace);
        // Refresh budgets of newly selected workspace
        const bRes = await fetch('/api/budgets');
        const bData = await bRes.json();
        setBudgets(bData);
        showNotification(`Workspace alterado para "${data.workspace.name}"`);
      }
    } catch (err) {
      showNotification("Erro ao transicionar de workspace.", "error");
    }
  };

  // Create workspace action
  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newWsName, niche: newWsNiche })
      });
      const data = await res.json();
      if (res.ok) {
        setWorkspaces(prev => [...prev, data]);
        setActiveWorkspace(data);
        setBudgets([]);
        setServices([]);
        setIsCreatingWorkspace(false);
        setNewWsName('');
        showNotification(`Empresa "${data.name}" registrada no OrçaFlow!`);
      }
    } catch(err) {
      showNotification("Não foi possível registrar a empresa.", "error");
    }
  };

  // Service Catalog Actions
  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace || !newServiceDesc.trim()) return;
    try {
      const isEditing = !!editingServiceId;
      const url = isEditing 
        ? `/api/services/${editingServiceId}` 
        : `/api/workspaces/${activeWorkspace.id}/services`;
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: newServiceDesc,
          unitPrice: parseFloat(newServicePrice) || 0,
          category: newServiceCategory,
          code: newServiceCode,
          obs: newServiceObs
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (isEditing) {
          setServices(prev => prev.map(s => s.id === editingServiceId ? data : s));
          showNotification("Item do catálogo atualizado e salvo!");
        } else {
          setServices(prev => [...prev, data]);
          showNotification("Serviço registrado no catálogo com sucesso!");
        }
        setNewServiceDesc('');
        setNewServicePrice('');
        setNewServiceCategory('Serviço');
        setNewServiceCode('');
        setNewServiceObs('');
        setEditingServiceId(null);
        setIsAddingService(false);
      } else {
        const err = await res.json();
        showNotification(err.error || "Erro ao salvar serviço.", "error");
      }
    } catch (err) {
      showNotification("Não foi possível registrar o serviço.", "error");
    }
  };

  const handleDeleteService = async (id: string) => {
    try {
      const res = await fetch(`/api/services/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setServices(prev => prev.filter(s => s.id !== id));
        showNotification("Serviço removido do catálogo.");
      }
    } catch (err) {
      showNotification("Erro ao excluir serviço.", "error");
    }
  };

  // Client Deletion Action
  const handleDeleteClient = async (clientName: string) => {
    if (!activeWorkspace) return;
    if (!window.confirm(`Deseja realmente remover o cliente "${clientName}" e todos os orçamentos vinculados? Esta ação é irreversível.`)) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/clients/${encodeURIComponent(clientName)}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setClientsList(prev => prev.filter(c => c.name !== clientName));
        setBudgets(prev => prev.filter(b => b.clientName !== clientName));
        showNotification(`Cliente "${clientName}" excluído com sucesso!`);
      } else {
        showNotification("Não foi possível excluir o cliente.", "error");
      }
    } catch (err) {
      showNotification("Erro ao remover cliente.", "error");
    }
  };

  // Client Creation Action from Clients management page
  const handleRegisterClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    if (!newClientName.trim() || !newClientPhone.trim()) {
      showNotification("Nome e WhatsApp do cliente são obrigatórios.", "error");
      return;
    }
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/clients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClientName,
          phone: newClientPhone,
          email: newClientEmail,
          address: newClientAddress
        })
      });
      const data = await res.json();
      if (!res.ok) {
        showNotification(data.error || "Não foi possível cadastrar cliente.", "error");
        return;
      }
      setClientsList(prev => [...prev, data]);
      setIsAddingClient(false);
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setNewClientAddress('');
      showNotification(`Cliente "${data.name}" registrado com sucesso no banco de dados!`);
    } catch (err) {
      showNotification("Erro de conexão ao salvar cliente.", "error");
    }
  };

  // Delete single SaaS user (Superadmin exclusive)
  const handleDeleteSaaSUser = async (userId: string, email: string) => {
    if (!window.confirm(`Deseja realmente EXCLUIR o usuário ${email}? Todos os seus dados, workspaces e orçamentos serão removidos permanentemente.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/saas/users/${userId}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || "Usuário excluído com sucesso!");
        // Refresh SaaS admin data
        const adminRes = await fetch('/api/saas/admin');
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setSaasAdminData(adminData);
        }
      } else {
        showNotification(data.error || "Erro ao excluir usuário.", "error");
      }
    } catch (err) {
      showNotification("Não foi possível excluir o usuário.", "error");
    }
  };

  // Bulk delete all users (Superadmin exclusive)
  const handleDeleteAllSaaSUsers = async () => {
    const confirmText1 = "CRÍTICO! Deseja realmente excluir TODOS os usuários cadastrados e seus respectivos workspaces e orçamentos?";
    const confirmText2 = "Esta operação é irreversível e excluirá em massa todas as contas exceto os Administradores Master. CONFIRMA?";
    if (!window.confirm(confirmText1) || !window.confirm(confirmText2)) {
      return;
    }
    try {
      const res = await fetch('/api/saas/users-all', {
        method: 'DELETE'
      });
      const data = await res.json();
      if (res.ok) {
        showNotification(data.message || "Todos os usuários foram excluídos em massa!");
        // Refresh SaaS admin data
        const adminRes = await fetch('/api/saas/admin');
        if (adminRes.ok) {
          const adminData = await adminRes.json();
          setSaasAdminData(adminData);
        }
      } else {
        showNotification(data.error || "Erro na exclusão em massa.", "error");
      }
    } catch (err) {
      showNotification("Não foi possível realizar a exclusão em massa.", "error");
    }
  };

  // Create SaaS activation token action (Superadmin exclusive)
  const handleCreateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/saas/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCreatedTokenCode.trim() || undefined,
          email: newCreatedTokenEmail.trim() || undefined,
          durationDays: newCreatedTokenDuration !== 'no-expire' ? parseInt(newCreatedTokenDuration) : undefined
        })
      });
      const data = await res.json();
      if (res.ok) {
        setSaasTokens(prev => [data, ...prev]);
        setNewCreatedTokenCode('');
        setNewCreatedTokenEmail('');
        setNewCreatedTokenDuration('no-expire');
        showNotification("Token comercial gerado e liberado com sucesso!");
      } else {
        showNotification(data.error || "Erro ao criar token.", "error");
      }
    } catch (err) {
      showNotification("Não foi possível gerar token eletrônico.", "error");
    }
  };

  // Revoke SaaS Token action (Superadmin exclusive)
  const handleDeleteToken = async (tokenId: string) => {
    if (!window.confirm("Deseja realmente revogar e excluir este Token de Ativação comercial?")) return;
    try {
      const res = await fetch(`/api/saas/tokens/${tokenId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setSaasTokens(prev => prev.filter(t => t.id !== tokenId));
        showNotification("Token revogado e excluído com sucesso.");
      } else {
        showNotification("Falha ao remover o token escolhido.", "error");
      }
    } catch (err) {
      showNotification("Erro na conexão com o servidor.", "error");
    }
  };

  // Save/Update Workspace data (Pix, Colors, Address etc)
  const handleUpdateWorkspaceMetadata = async (updatedFields: Partial<Workspace>) => {
    if (!activeWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (res.ok) {
        setActiveWorkspace(data);
        setWorkspaces(prev => prev.map(w => w.id === data.id ? data : w));
        showNotification("Configurações da empresa salvas com sucesso!");
      }
    } catch (err) {
      showNotification("Erro ao salvar preferências.", "error");
    }
  };

  // Add team member action
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeWorkspace) return;
    try {
      const res = await fetch(`/api/workspaces/${activeWorkspace.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberForm)
      });
      const data = await res.json();
      if (res.ok) {
        setWsMembers(prev => [...prev, data]);
        setIsAddingMember(false);
        setMemberForm({ name: '', email: '', role: UserRole.MEMBER });
        showNotification("Convite enviado com sucesso para " + data.name);
      } else {
        showNotification(data.error || "Limite excedido para o seu plano atual.", "error");
      }
    } catch (err) {
      showNotification("Houve um erro técnico de envio.", "error");
    }
  };

  // Delete workspace member
  const handleDeleteMember = async (memId: string) => {
    try {
      const res = await fetch(`/api/workspace-members/${memId}`, { method: 'DELETE' });
      if (res.ok) {
        setWsMembers(prev => prev.filter(m => m.id !== memId));
        showNotification("Membro removido da equipe.");
      }
    } catch (err) {
      showNotification("Não foi possível concluir.", "error");
    }
  };

  // Calculate calculations instant preview
  const itemsList = activeBudget.items || [];
  const calculatedSubtotal = itemsList.reduce((acc, curr) => {
    const qty = parseFloat(curr.quantity as any) || 0;
    const price = parseFloat(curr.unitPrice as any) || 0;
    return acc + (qty * price);
  }, 0);

  const discount = parseFloat(activeBudget.discountValue as any) || 0;
  let calculatedTotal = calculatedSubtotal;
  if (activeBudget.discountType === 'PERCENTAGE') {
    calculatedTotal = calculatedSubtotal * (1 - (discount / 100));
  } else {
    calculatedTotal = calculatedSubtotal - discount;
  }
  if (calculatedTotal < 0) calculatedTotal = 0;

  // Form value change helpers
  const handleUpdateBudgetField = (field: keyof Budget, value: any) => {
    setActiveBudget(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateItem = (index: number, field: keyof BudgetItem, value: any) => {
    const nextItems = [...(activeBudget.items || [])];
    nextItems[index] = { ...nextItems[index], [field]: value };
    setActiveBudget(prev => ({ ...prev, items: nextItems }));
  };

  const handleRemoveItem = (index: number) => {
    const nextItems = (activeBudget.items || []).filter((_, i) => i !== index);
    setActiveBudget(prev => ({ ...prev, items: nextItems }));
  };

  const handleAddItem = () => {
    const nextItems = [...(activeBudget.items || []), {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      discount: 0
    }];
    setActiveBudget(prev => ({ ...prev, items: nextItems }));
  };

  // Submit Budget creation to API
  const handleGenerateBudget = async () => {
    if (!activeBudget.clientName || !activeBudget.clientPhone) {
      showNotification("Por favor, preencha o Nome e o WhatsApp do cliente para prosseguir.", "error");
      return;
    }

    try {
      const res = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...activeBudget,
          subtotal: calculatedSubtotal,
          total: calculatedTotal,
          customNiche: activeWorkspace?.niche
        })
      });
      const data = await res.json();
      if (res.ok) {
        setBudgets(prev => [data, ...prev]);
        showNotification(`Orçamento emitido com sucesso! Sequencial #${data.number}.`);
        setActiveBudget({
          clientName: '',
          clientPhone: '',
          clientEmail: '',
          clientAddress: '',
          discountType: 'PERCENTAGE',
          discountValue: 0,
          validityDays: 15,
          paymentTerms: 'À vista via Pix com 5% de desconto imediato',
          status: BudgetStatus.PENDING,
          observations: 'Orçamento gerado e validado via OrçaFlow AI. Garantia técnica integral conforme as especificações de serviços descritas.',
          items: [{ id: '1', description: 'Atendimento técnico padrão com peças sob medida.', quantity: 1, unitPrice: 350, discount: 0 }],
          providerSignature: activeWorkspace?.name || 'Assinado'
        });
        
        // Switch to list, preview is automatically embedded
        setActiveTab('budget-maker');
      } else {
        showNotification(data.error || "Erro ao emitir orçamento.", "error");
      }
    } catch (err) {
      showNotification("Houve uma falha técnica ao enviar proposta.", "error");
    }
  };

  // Duplicate dynamic budget
  const handleDuplicateBudget = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets/${id}/duplicate`, { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setBudgets(prev => [data, ...prev]);
        showNotification(`Sucesso! Orçamento ${data.number} duplicado.`);
      }
    } catch (err) {
      showNotification("Erro ao duplicar.", "error");
    }
  };

  // Delete budget
  const handleDeleteBudget = async (id: string) => {
    try {
      const res = await fetch(`/api/budgets/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBudgets(prev => prev.filter(b => b.id !== id));
        showNotification("Orçamento excluído.");
      }
    } catch (err) {
      showNotification("Erro ao excluir orçamento.", "error");
    }
  };

  // Pix QR generation handler
  const triggerPixQr = async (budget: Budget) => {
    const key = activeWorkspace?.pixKey || "financeiro@solaresenergia.com.br";
    try {
      const res = await fetch(`/api/pix/qr-mock?key=${encodeURIComponent(key)}&amount=${budget.total}`);
      const data = await res.json();
      setPixPayload(data.payload);
      setShowPixQr(true);
    } catch (err) {
      showNotification("Erro ao gerar QR Code Pix", "error");
    }
  };

  // WhatsApp auto message dispatcher
  const handleShareWhatsApp = (budget: Budget) => {
    const cleanPhone = budget.clientPhone.replace(/\D/g, '');
    const enterpriseName = activeWorkspace?.name || 'OrçaFlow Serviços';
    const msg = `Olá, ${budget.clientName}! Segue o link com seu orçamento profissional emitido por ${enterpriseName}:
*Código:* ${budget.number}
*Valor:* R$ ${budget.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
*Link para Visualização e Assinatura Digital:* https://orcaflow.com/pdf-prev/${budget.id}

Qualquer dúvida, estamos à disposição no WhatsApp.`;
    const url = `https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  // SaaS Subscriber checkout mockup modal
  const handleSubscribeSaaS = async (plan: PlanType) => {
    try {
      const res = await fetch('/api/saas/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan })
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setCheckoutModal(null);
        
        // Launch onboarding wizard after subscription purchase
        setOnboardingPlan(plan);
        setIsOnboarding(true);
        setOnboardingStep(1);
        
        // Prefill email
        if (data.user?.email) {
          setOnboardingForm(prev => ({
            ...prev,
            email: data.user.email
          }));
        }
        
        showNotification(data.message || `Parabéns! Faturamento do plano ${plan} ativado no modo Sandbox.`, "success");
      }
    } catch (err) {
      showNotification("Erro ao prosseguir com assinatura.", "error");
    }
  };

  // Apply inputs from AI Panel
  const handleApplyDescriptionFromAI = (suggestion: string) => {
    // If we have items, apply to the first empty item description or add a new item
    const items = [...(activeBudget.items || [])];
    const emptyIdx = items.findIndex(item => !item.description);
    if (emptyIdx !== -1) {
      items[emptyIdx].description = suggestion;
    } else {
      items.push({
        id: `item-${Date.now()}`,
        description: suggestion,
        quantity: 1,
        unitPrice: 250,
        discount: 0
      });
    }
    setActiveBudget(prev => ({ ...prev, items }));
    showNotification("Descrição gerada por IA aplicada ao orçamento!");
  };

  const handleApplyItemsFromAI = (aiItems: { description: string; quantity: number; unitPrice: number }[]) => {
    const formatted = aiItems.map((item, i) => ({
      id: `ai-item-${i}-${Date.now()}`,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: 0
    }));
    setActiveBudget(prev => ({ ...prev, items: formatted }));
    showNotification("Modelo técnico sugerido inserido com sucesso!");
  };

  const handleApplyObservationsFromAI = (suggestion: string) => {
    setActiveBudget(prev => ({ ...prev, observations: suggestion }));
    showNotification("Termos & Observações refinados aplicados!");
  };

  // Download PDF simulation helper
  const triggerPdfPrint = () => {
    window.print();
  };

  if (isOnboarding) {
    const brandPresets = [
      { name: "Amarelo Luz (Eletro/Solar)", hex: "#eab308", class: "bg-yellow-500 border-yellow-500", text: "text-yellow-500" },
      { name: "Azul Corporativo (TI/Agências)", hex: "#3b82f6", class: "bg-blue-500 border-blue-500", text: "text-blue-500" },
      { name: "Verde Hidro (Hidráulica)", hex: "#10b981", class: "bg-emerald-500 border-emerald-500", text: "text-emerald-500" },
      { name: "Indigo Criativo (Design)", hex: "#6366f1", class: "bg-indigo-500 border-indigo-500", text: "text-indigo-500" },
      { name: "Laranja Obras (Construção)", hex: "#f97316", class: "bg-orange-500 border-orange-500", text: "text-orange-500" },
      { name: "Rosa Premium (Beleza/Spa)", hex: "#ec4899", class: "bg-pink-500 border-pink-500", text: "text-pink-500" },
    ];

    const currentBrandObj = brandPresets.find(p => p.hex === onboardingForm.brandColor) || brandPresets[1];

    const handleOnboardingSubmit = async () => {
      try {
        let wsId = 'ws-new';
        const res = await fetch('/api/workspaces', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: onboardingForm.name,
            niche: onboardingForm.niche,
            phone: onboardingForm.phone,
            email: onboardingForm.email,
            address: onboardingForm.address,
            brandColor: onboardingForm.brandColor,
            pixKey: onboardingForm.pixKey
          })
        });
        const savedWs = await res.json();
        if (res.ok) {
          wsId = savedWs.id;
          // Refresh list of workspaces
          const wsRes = await fetch('/api/workspaces');
          const wsData = await wsRes.json();
          setWorkspaces(wsData);
          setActiveWorkspace(savedWs);

          // Add members if any configured
          for (const member of onboardingTeam) {
            await fetch(`/api/workspaces/${wsId}/members`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(member)
            });
          }

          // reload budget of chosen workspace
          const bRes = await fetch('/api/budgets');
          const bData = await bRes.json();
          setBudgets(bData);

          showNotification(`Empresa "${savedWs.name}" registrada com sucesso!`, "success");
        } else {
          showNotification("Empresa criada localmente no sandbox.");
        }
      } catch(e) {
        showNotification("Empresa criada localmente no sandbox.");
      } finally {
        setIsOnboarding(false);
        setActiveTab('budget-maker');
      }
    };

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-center items-center py-8 px-4 relative selection:bg-blue-500 selection:text-white">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="max-w-xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative space-y-6 animate-fade-in my-auto">
          {/* Progress Header */}
          <div className="flex flex-col items-center text-center space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full text-[10px] font-bold uppercase tracking-widest leading-none">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Compra efetuada com sucesso!
            </div>
            <h1 className="font-display font-extrabold text-2xl tracking-tight text-white mt-3">
              Configurar Plano {onboardingPlan}
            </h1>
            <p className="text-[11px] text-slate-400 font-sans">
              Configure os detalhes da sua empresa para faturamento automático e emissão rápida.
            </p>

            {/* Stepper indicators */}
            <div className="flex items-center gap-2 mt-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <React.Fragment key={i}>
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    onboardingStep === i
                      ? 'bg-blue-600 text-white shadow-lg ring-4 ring-blue-500/20'
                      : onboardingStep > i
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}>
                    {onboardingStep > i ? <Check className="w-4 h-4 text-slate-950 font-bold" /> : i}
                  </div>
                  {i < 5 && <div className={`w-6 h-0.5 ${onboardingStep > i ? 'bg-emerald-500' : 'bg-slate-800'}`} />}
                </React.Fragment>
              ))}
            </div>
          </div>

          <hr className="border-slate-805 border-slate-800" />

          {/* STEP 1 */}
          {onboardingStep === 1 && (
            <div className="space-y-4 animate-fade-in text-slate-200">
              <div className="bg-slate-950/60 p-5 rounded-2xl border border-slate-800 space-y-3 shadow-inner">
                <h3 className="font-semibold text-sm text-blue-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Assinatura Ativada no Sandbox!
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed text-left font-sans">
                  Parabéns! Sua transação foi aprovada e integrada com sucesso. Você acaba de desbloquear todo o potencial do <strong>OrçaFlow SaaS</strong> com faturamento instantâneo e inteligência artificial avançada.
                </p>
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-xs flex justify-between items-center">
                  <div className="text-left font-sans">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-mono">Faturamento Mensal</span>
                    <span className="font-bold text-slate-200">OrçaFlow Plano {onboardingPlan}</span>
                  </div>
                  <span className="font-mono font-extrabold text-white text-xs bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
                    R$ {onboardingPlan === PlanType.PRO ? '49,00' : '129,00'}/mês
                  </span>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Vantagens ativas em sua conta:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] text-slate-350 bg-slate-950/20 p-3 rounded-xl font-sans">
                  <span className="flex items-center gap-1.5">⚡ Propostas Digitais Ilimitadas</span>
                  <span className="flex items-center gap-1.5">🧠 Copiloto Gemini AI Ativo</span>
                  <span className="flex items-center gap-1.5">✍️ Assinatura com Tela Digital</span>
                  <span className="flex items-center gap-1.5">👥 Multi-Tenant Multiempresa</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOnboardingStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-3 px-4 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 shadow-lg shadow-blue-600/10 cursor-pointer"
              >
                Começar a Cadastrar Empresa <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2 */}
          {onboardingStep === 2 && (
            <div className="space-y-4 animate-fade-in text-slate-200">
              <div className="text-left">
                <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-blue-400" /> Cadastre o Perfil da sua Empresa
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">Este perfil será utilizado para preencher automaticamente os dados de contato no cabeçalho das suas propostas comerciais.</p>
              </div>
              
              <div className="grid grid-cols-1 gap-3.5 text-left font-sans">
                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Razão Social / Nome de Exibição Comercial *</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition"
                    placeholder="Ex: Solares Soluções Corporativas Ltda"
                    value={onboardingForm.name}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nicho / Setor de Atuação *</label>
                  <select
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl p-3 focus:outline-none focus:border-blue-500 transition"
                    value={onboardingForm.niche}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, niche: e.target.value }))}
                  >
                    <option value="Eletricista & Automação">⚡ Eletricista & Automação</option>
                    <option value="Construção Civil & Reforma">🏢 Construção Civil & Reforma</option>
                    <option value="Design & Agência Digital">💻 Design & Agência Digital</option>
                    <option value="Hidráulica & Encanamentos">🚰 Hidráulica & Encanamentos</option>
                    <option value="Instalações & Climatização">❄️ Instalações & Climatização</option>
                    <option value="TI, Consultoria & Programação">🚀 TI, Consultoria & Programação</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Telefone / WhatsApp Comercial *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition"
                      placeholder="Ex: (11) 98765-4321"
                      value={onboardingForm.phone}
                      onChange={(e) => setOnboardingForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">E-mail Comercial Oficial *</label>
                    <input
                      type="email"
                      className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition"
                      placeholder="Ex: comercial@suaempresa.com"
                      value={onboardingForm.email}
                      onChange={(e) => onboardingForm ? setOnboardingForm(prev => ({ ...prev, email: e.target.value })) : null}
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Sede Comercial (Endereço Físico)</label>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 rounded-xl p-3 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition"
                    placeholder="Ex: Alameda Santos, 1000 - São Paulo, SP"
                    value={onboardingForm.address}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(1)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold py-3 px-4 rounded-xl transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  disabled={!onboardingForm.name.trim()}
                  onClick={() => setOnboardingStep(3)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-3 px-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Próximo Passo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {onboardingStep === 3 && (
            <div className="space-y-4 animate-fade-in text-slate-200">
              <div className="text-left font-sans">
                <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-blue-400" /> Faturamento Pix & Identidade Cromática
                </h3>
                <p className="text-[11px] text-slate-400 mt-1">
                  Defina o tom de cor predominante das propostas e configure o faturamento Pix Express para automatizar os recebidos.
                </p>
              </div>

              <div className="space-y-4 text-left font-sans">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Cor Predominante nos Orçamentos</span>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                    {[
                      { name: "Amarelo Luz", hex: "#eab308", border: "border-yellow-500", bg: "bg-yellow-500" },
                      { name: "Azul Real", hex: "#3b82f6", border: "border-blue-500", bg: "bg-blue-500" },
                      { name: "Verde Hidro", hex: "#10b981", border: "border-emerald-500", bg: "bg-emerald-500" },
                      { name: "Indigo Criativo", hex: "#6366f1", border: "border-indigo-500", bg: "bg-indigo-500" },
                      { name: "Laranja Obras", hex: "#f97316", border: "border-orange-500", bg: "bg-orange-500" },
                      { name: "Rosa Premium", hex: "#ec4899", border: "border-pink-500", bg: "bg-pink-500" },
                    ].map((preset) => (
                      <button
                        key={preset.hex}
                        type="button"
                        onClick={() => setOnboardingForm(prev => ({ ...prev, brandColor: preset.hex }))}
                        className={`flex items-center gap-2.5 p-2 rounded-xl text-[10px] font-semibold border-2 transition text-left ${
                          onboardingForm.brandColor === preset.hex
                            ? 'border-blue-500 bg-blue-500/10 text-white'
                            : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full ${preset.bg} shrink-0`} />
                        <span className="truncate">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Chave Pix Comercial Credenciada</label>
                  <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                    Quando sua chave Pix (CPF/CNPJ, E-mail ou Celular) é preenchida, o OrçaFlow SaaS anexa automaticamente QR Codes Pix inteligentes aos links compartilhados ao cliente correspondente.
                  </p>
                  <input
                    type="text"
                    className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-100 p-3 rounded-xl focus:outline-none focus:border-blue-500 placeholder:text-slate-600 transition font-mono"
                    placeholder="Chave Pix (Ex: CNPJ ou contato@suaempresa.com)"
                    value={onboardingForm.pixKey}
                    onChange={(e) => setOnboardingForm(prev => ({ ...prev, pixKey: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(2)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold py-3 px-4 rounded-xl transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(4)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 hover:shadow-lg cursor-pointer"
                >
                  Avançar para a Equipe <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 4 */}
          {onboardingStep === 4 && (
            <div className="space-y-4 animate-fade-in text-slate-200 text-left">
              <div>
                <h3 className="font-semibold text-sm text-slate-200 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-400" /> Cadastre os Membros da sua Equipe
                </h3>
                <p className="text-[11px] text-slate-400 mt-1 font-sans">
                  Pronto para faturar com multiempresa e multi-tenant? Atribua papéis adicionais no OrçaFlow para outros técnicos e analistas.
                </p>
              </div>

              <div className="space-y-3 font-sans">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Colaboradores Pendentes ({onboardingTeam.length})</span>
                  {onboardingTeam.length > 0 ? (
                    <div className="space-y-1.5 max-h-36 overflow-y-auto bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                      {onboardingTeam.map((mem, i) => (
                        <div key={i} className="flex justify-between items-center text-xs bg-slate-900 border border-slate-800 p-2 rounded-lg">
                          <div>
                            <p className="font-semibold text-slate-100">{mem.name}</p>
                            <p className="text-[10px] text-slate-400">{mem.email}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-bold uppercase py-0.5 px-2 bg-blue-500/10 text-blue-400 rounded-full">{mem.role}</span>
                            <button
                              type="button"
                              onClick={() => setOnboardingTeam(prev => prev.filter((_, idx) => idx !== i))}
                              className="text-red-400 hover:text-red-500 text-sm p-1"
                            >
                              ✖
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-slate-950/20 rounded-xl border border-dashed border-slate-800 text-slate-500 text-[11px]">
                      Nenhum colaborador adicionado ainda. Somente você constará no workspace inicial.
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/40 p-3.5 border border-slate-800 rounded-xl space-y-2.5">
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 block">Convidar Técnico / Administrador Comercial</span>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Nome Completo"
                      className="bg-slate-950 border border-slate-800 text-xs p-2 rounded-lg text-white outline-none focus:border-blue-500"
                      value={newOnboardingMember.name}
                      onChange={(e) => setNewOnboardingMember(prev => ({ ...prev, name: e.target.value }))}
                    />
                    <input
                      type="email"
                      placeholder="E-mail"
                      className="bg-slate-950 border border-slate-800 text-xs p-2 rounded-lg text-white outline-none focus:border-blue-500"
                      value={newOnboardingMember.email}
                      onChange={(e) => setNewOnboardingMember(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-between items-center bg-slate-900/40 p-1 rounded-lg">
                    <div className="flex items-center gap-1.5 pl-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-sans">Função:</span>
                      <select
                        className="bg-slate-950 text-[10px] text-white border-none py-1 px-1.5 rounded"
                        value={newOnboardingMember.role}
                        onChange={(e) => setNewOnboardingMember(prev => ({ ...prev, role: e.target.value as any }))}
                      >
                        <option value={UserRole.MEMBER}>Técnico Executor</option>
                        <option value={UserRole.ADMIN}>Administrador</option>
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (!newOnboardingMember.name.trim() || !newOnboardingMember.email.trim()) {
                          showNotification("Insira o nome e email do novo membro.", "error");
                          return;
                        }
                        setOnboardingTeam(prev => [...prev, newOnboardingMember]);
                        setNewOnboardingMember({ name: '', email: '', role: UserRole.MEMBER });
                        showNotification("Membro pronto para importação.");
                      }}
                      className="bg-slate-850 hover:bg-slate-750 text-white text-[10px] font-semibold py-1.5 px-3.5 rounded-lg transition"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2 font-sans">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(3)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold py-3 px-4 rounded-xl transition cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() => setOnboardingStep(5)}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-3 px-4 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Visualizar Resumo <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 5 */}
          {onboardingStep === 5 && (
            <div className="space-y-4 animate-fade-in text-slate-200">
              <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl text-center space-y-2.5">
                <div className="w-11 h-11 bg-emerald-500 rounded-full flex items-center justify-center mx-auto shadow shadow-emerald-500/10">
                  <CheckCircle2 className="w-6 h-6 text-slate-950 font-black" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-emerald-400">Pronto para a Ativação!</h3>
                  <p className="text-xs text-slate-300">Todos os canais de estrutura da sua empresa estão integrados e prontos.</p>
                </div>
              </div>

              <div className="bg-slate-950/70 p-4 border border-slate-850 rounded-2xl text-left space-y-2.5 text-xs">
                <span className="text-[10px] text-slate-450 uppercase font-bold block tracking-wider">Perfil Consolidado do Faturamento:</span>
                <div className="space-y-1.5 text-slate-300 leading-relaxed font-sans">
                  <p>🏢 <b>Empresa Emitente:</b> {onboardingForm.name}</p>
                  <p>💼 <b>Setor / Niche de Atuação:</b> {onboardingForm.niche}</p>
                  <p>📱 <b>WhatsApp de Atendimento:</b> {onboardingForm.phone}</p>
                  <p>🤝 <b>Pix Comercial Ativado:</b> <code>{onboardingForm.pixKey || "Chave padrão do sistema"}</code></p>
                  <p>👥 <b>Colaboradores Vinculados:</b> {onboardingTeam.length === 0 ? 'Somente o Proprietário' : `${onboardingTeam.length} membros convidados`}</p>
                </div>
              </div>

              <div className="flex gap-3 font-sans">
                <button
                  type="button"
                  onClick={() => setOnboardingStep(4)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold py-3 px-4 rounded-xl transition cursor-pointer"
                >
                  Revisar
                </button>
                <button
                  type="button"
                  onClick={handleOnboardingSubmit}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold py-3 px-4 rounded-xl transition shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  Ativar & Abrir OrçaFlow 🚀
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans flex flex-col md:flex-row relative transition-colors duration-300`}>
      
      {/* Dynamic Popups/Notifications */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl border animate-fade-in text-xs font-semibold ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200' 
            : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-red-600" />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* PIX QR Modal Sandbox */}
      {showPixQr && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 text-slate-900 shadow-2xl border border-slate-100 text-center space-y-4 animate-fade-in">
            <div className="w-12 h-12 bg-teal-50 ml-auto mr-auto rounded-full flex items-center justify-center">
              <Coins className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">Pix Copia e Cola Automático</h3>
              <p className="text-xs text-slate-500">O PIX QR Code abaixo foi gerado baseado na chave do seu workspace.</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 flex flex-col items-center gap-3">
              <div className="w-40 h-40 bg-slate-800 flex items-center justify-center rounded-lg p-2">
                {/* Simulated high-fidelity QR Code representation */}
                <div className="w-full h-full border-4 border-white grid grid-cols-5 gap-0.5 p-1 bg-white">
                  {Array.from({ length: 25 }).map((_, i) => (
                    <div 
                      key={i} 
                      className={`rounded-sm ${(i * 3 + 7) % 5 === 0 || i % 4 === 0 || (i > 10 && i < 18) ? 'bg-slate-900' : 'bg-white'}`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-[10px] bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full font-semibold">Sandbox Integrado Ativo</span>
            </div>
            <div className="space-y-2">
              <input 
                type="text" 
                readOnly 
                value={pixPayload} 
                className="w-full text-[10px] bg-slate-100 border rounded-lg p-2 font-mono text-slate-700 focus:outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(pixPayload);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2000);
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white text-xs py-2 px-3 rounded-lg font-medium flex items-center justify-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedLink ? 'Copiado!' : 'Copiar Payload'}
                </button>
                <button
                  onClick={() => setShowPixQr(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs py-2 px-3 rounded-lg font-medium transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PLAN SELECT MOCK MODAL */}
      {checkoutModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-slate-900 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-display font-semibold text-base text-slate-900">Finalizar Assinatura ({checkoutModal})</h3>
              <button onClick={() => setCheckoutModal(null)} className="text-slate-400 hover:text-slate-600 text-sm">✖</button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              O OrçaFlow foi desenhado como uma experiência de checkout premium em parceria técnica com <b>Stripe</b> e <b>Mercado Pago</b>. Toda infraestrutura de faturamento recorrente se encontra preparada.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border space-y-2.5">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>Plano {checkoutModal} Recorrente</span>
                <span>R$ {checkoutModal === 'PRO' ? '49,00' : '129,00'}/mês</span>
              </div>
              <div className="text-[10px] text-slate-450 leading-relaxed text-slate-500">
                • Acesso multiempresa ilimitado<br />
                • Copiloto de Inteligência Artificial completo<br />
                • Assinatura digital direta com carimbo eletrônico
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => handleSubscribeSaaS(checkoutModal as any)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <Check className="w-4 h-4 text-emerald-400" /> Simular Checkout via Stripe API (Sandbox)
              </button>
              <button
                onClick={() => handleSubscribeSaaS(checkoutModal as any)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center gap-1.5"
              >
                Simular Checkout via Mercado Pago SDK
              </button>
              <button
                onClick={() => setCheckoutModal(null)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-semibold py-2.5 rounded-xl transition text-center"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col shrink-0 border-r border-slate-800">
        {/* Superior Logo and Title branding */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-1.5 rounded-lg text-white">
              <RefreshCw className="w-5 h-5 text-indigo-100" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg tracking-tight text-white flex items-center gap-0.5">
                Orça<span className="text-blue-500">Flow</span>
              </span>
              <span className="text-[9px] text-slate-400 block font-mono">SaaS Enterprise</span>
            </div>
          </div>
          <button 
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
            className="p-1 px-2 text-[10px] border border-slate-700 rounded bg-slate-800 hover:bg-slate-750 text-slate-305 transition"
            title="Mudar Tema"
          >
            {theme === 'light' ? '🌌 Dark' : '☀️ Light'}
          </button>
        </div>

        {/* Selected Workspace view & Selector */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Empresa Ativa</span>
            <button 
              onClick={() => setIsCreatingWorkspace(!isCreatingWorkspace)} 
              className="text-[10px] text-blue-400 hover:text-blue-300 flex items-center gap-0.5"
            >
              <Plus className="w-3 h-3" /> Nova
            </button>
          </div>

          {isCreatingWorkspace ? (
            <form onSubmit={handleCreateWorkspace} className="space-y-2 pt-1 animate-fade-in">
              <input
                type="text"
                placeholder="Título da sua Empresa"
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2 py-1 rounded focus:outline-none"
                value={newWsName}
                onChange={(e) => setNewWsName(e.target.value)}
                autoFocus
              />
              <select
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2 py-1 rounded focus:outline-none"
                value={newWsNiche}
                onChange={(e) => setNewWsNiche(e.target.value)}
              >
                <option value="Eletricista & Automação">🛠️ Eletr. / Automação</option>
                <option value="Construção Civil & Reforma">🏢 Constr. / Pintor</option>
                <option value="Design & Agência Digital">💻 Design / Freelance</option>
                <option value="Hidráulica & Encanamentos">🚰 Encanador</option>
              </select>
              <div className="flex gap-1 justify-end">
                <button type="submit" className="bg-blue-600 text-white text-[10px] px-2 py-0.5 rounded">Salvar</button>
                <button type="button" onClick={() => setIsCreatingWorkspace(false)} className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded">Cancelar</button>
              </div>
            </form>
          ) : (
            <div className="relative">
              <select
                className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-xs px-2.5 py-1.5 rounded-lg focus:outline-none font-medium"
                value={activeWorkspace?.id || ''}
                onChange={(e) => handleSelectWorkspace(e.target.value)}
              >
                {workspaces.map(ws => (
                  <option key={ws.id} value={ws.id}>{ws.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeWorkspace && (
            <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1.5 rounded-md">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <span>Nicho: <b>{activeWorkspace.niche}</b></span>
            </div>
          )}
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('budget-maker')}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'budget-maker' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Criador de Orçamentos</span>
          </button>

          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Dashboard Estatísticas</span>
          </button>

          <button 
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'clients' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clientes Cadastrados</span>
          </button>

          <button 
            onClick={() => setActiveTab('services')}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'services' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Catálogo de Serviços</span>
          </button>

          <button 
            onClick={() => setActiveTab('team')}
            className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
              activeTab === 'team' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Minha Equipe & Pix</span>
          </button>

          {user?.isSuperAdmin && (
            <div className="pt-4 border-t border-slate-800 mt-4 space-y-1">
              <span className="text-[9px] text-slate-450 uppercase font-black tracking-wider block px-3 text-violet-400">SaaS Platform Admin</span>
              <button 
                onClick={() => setActiveTab('admin')}
                className={`w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold transition ${
                  activeTab === 'admin' ? 'bg-violet-700 text-white animate-pulse' : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Layers className="w-4 h-4 text-violet-300" />
                <span>Painel SaaS Administrativo</span>
              </button>
            </div>
          )}
        </nav>

        {/* User Status Bottom Card */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xs uppercase text-blue-400 border border-slate-700">
              {user?.name.slice(0, 2) || "CO"}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-white">{user?.name || "Prestador Autônomo"}</p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email || "anonimo@empresa.com"}</p>
            </div>
          </div>
          <div className="bg-slate-900 rounded-lg p-2 flex justify-between items-center border border-slate-850">
            <span className="text-[9px] uppercase font-bold text-slate-400">Plano Atual:</span>
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">{user?.plan || 'PRO'}</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden p-4 md:p-8 space-y-6">
        
        {/* INLINE LOGIN MODIFIER fallback / Simple User Identity Switch */}
        {/* INLINE LOGIN MODIFIER fallback / Simple User Identity Switch */}
        {!user && (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl flex flex-col gap-4 text-center max-w-sm ml-auto mr-auto shadow-xl animate-fade-in text-slate-900 dark:text-slate-100">
            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-full w-12 h-12 ml-auto mr-auto flex items-center justify-center">
              <LogIn className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-semibold text-slate-900 dark:text-white text-base">Portal de Acesso OrçaFlow</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {authMode === 'login' 
                  ? 'Digite seu e-mail e senha para gerenciar suas empresas e orçamentos.' 
                  : 'Preencha o cadastro usando seu Token de Ativação comercial.'}
              </p>
            </div>

            {/* Mode Selectors */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg text-[11px]">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`py-1.5 px-3 rounded-md transition font-medium ${
                  authMode === 'login' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Logar na Conta
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`py-1.5 px-3 rounded-md transition font-medium ${
                  authMode === 'register' 
                    ? 'bg-blue-600 text-white shadow-sm' 
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Ativar Token
              </button>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">E-mail Corporativo</label>
                  <input
                    type="email"
                    placeholder="Ex: seunome@servicos.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Senha de Acesso</label>
                  <input
                    type="password"
                    placeholder="Sua senha secreta"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 text-white text-xs font-semibold p-2.5 rounded-lg hover:bg-blue-500 transition cursor-pointer"
                >
                  {authLoading ? 'Verificando...' : 'Entrar no Painel'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-3">
                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Seu Nome / Nome Comercial</label>
                  <input
                    type="text"
                    placeholder="Ex: Victor Mendes"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">E-mail para Registro</label>
                  <input
                    type="email"
                    placeholder="Ex: joao@eletricista.com"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Escolha uma Senha</label>
                  <input
                    type="password"
                    placeholder="Senha de pelo menos 6 dígitos"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-1 text-left">
                  <label className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold">Token de Ativação SaaS</label>
                  <input
                    type="text"
                    placeholder="Ex: ORCA-XXXX-XX"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-orange-200 dark:border-orange-700/60 text-xs rounded-lg p-2.5 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 font-mono tracking-wider text-center"
                    value={regToken}
                    onChange={(e) => setRegToken(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-blue-600 text-white text-xs font-semibold p-2.5 rounded-lg hover:bg-blue-500 transition cursor-pointer"
                >
                  {authLoading ? 'Validando Token...' : 'Criar e Ativar Conta'}
                </button>
              </form>
            )}

            {/* Helpful instructions for superadmin testing */}
            <div className="mt-2 p-3 bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-900/50 rounded-lg text-left">
              <span className="text-[9.5px] uppercase font-mono font-bold text-violet-750 dark:text-violet-300 block mb-1">👑 Painel Administrador Master:</span>
              <p className="text-[10.5px] text-violet-800 dark:text-violet-200 leading-normal font-medium">
                Para gerenciar usuários, criar planos e liberar tokens de inscrição, logue como Victor:<br />
                <strong>E-mail:</strong> <span className="font-mono font-bold text-slate-900 dark:text-white">vitorxl38@gmail.com</span><br />
                <strong>Senha:</strong> <span className="font-mono font-bold text-slate-900 dark:text-white">vitor123</span>
              </p>
            </div>
          </div>
        )}

        {/* 1. VIEW: BUDGET MAKER (The main business component) */}
        {user && activeTab === 'budget-maker' && (
          <div className="space-y-6">
            
            {/* Real-time Header info */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-fade-in">
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight">Emissor e Copiloto de Orçamentos</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Insira as informações básicas para faturar rapidamente em menos de 2 minutos.</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleApplyItemsFromAI([
                    { description: "Mão de obra e projeto técnico detalhado de instalação", quantity: 1, unitPrice: 850 },
                    { description: "Disjuntores temomagnéticos adicionais homologados", quantity: 3, unitPrice: 90 },
                    { description: "Garantia técnica assistida e monitoramento pós-entrega", quantity: 1, unitPrice: 300 }
                  ])}
                  className="bg-slate-150 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-xs px-3.5 py-2 rounded-xl font-semibold transition text-slate-700 dark:text-slate-200"
                >
                  Carregar Dados de Exemplo
                </button>
                <button
                  onClick={handleGenerateBudget}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4 text-sky-200" /> Confirmar e Emitir
                </button>
              </div>
            </div>

            {/* Split layout: Form Editor on the left; Real-time PDF preview style + AI panel on the right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Form Input fields */}
              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-6">
                
                {/* Client info */}
                <div className="space-y-4">
                  <div className="border-b pb-2">
                    <h3 className="font-display font-bold text-sm text-slate-850 dark:text-slate-100 flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-blue-500" /> Dados Básicos do Cliente
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-505 text-slate-500">Nome do Cliente *</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                        placeholder="Ex: João Roberto"
                        value={activeBudget.clientName || ''}
                        onChange={(e) => handleUpdateBudgetField('clientName', e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-505 text-slate-500">WhatsApp do Cliente *</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                        placeholder="Ex: (11) 98888-8888"
                        value={activeBudget.clientPhone || ''}
                        onChange={(e) => handleUpdateBudgetField('clientPhone', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-505 text-slate-500">Endereço (Opcional)</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                        placeholder="Ex: Av das Nações, 500"
                        value={activeBudget.clientAddress || ''}
                        onChange={(e) => handleUpdateBudgetField('clientAddress', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-slate-505 text-slate-500">E-mail (Opcional)</label>
                      <input
                        type="email"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                        placeholder="Ex: joao@empresa.com"
                        value={activeBudget.clientEmail || ''}
                        onChange={(e) => handleUpdateBudgetField('clientEmail', e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                {/* Services/Items table creator */}
                <div className="space-y-4">
                  <div className="border-b pb-2 flex justify-between items-center">
                    <h3 className="font-display font-bold text-sm text-slate-850 dark:text-slate-100">
                      Tabela de Serviços e Materiais
                    </h3>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold py-1 px-2.5 rounded-md flex items-center gap-1 transition"
                    >
                      <Plus className="w-3 h-3" /> Adicionar Linha
                    </button>
                  </div>

                  {/* Responsive Row Items List */}
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {itemsList.map((item, index) => (
                      <div key={item.id} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border border-slate-200 dark:border-slate-750 flex flex-col md:flex-row gap-3">
                        <div className="flex-1 space-y-1 relative">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] text-slate-400">Descrição Técnica do Serviço</label>
                            {services.length > 0 && (
                              <select
                                onChange={(e) => {
                                  const sVal = e.target.value;
                                  if (!sVal) return;
                                  const found = services.find(s => s.id === sVal);
                                  if (found) {
                                    handleUpdateItem(index, 'description', found.description);
                                    handleUpdateItem(index, 'unitPrice', found.unitPrice.toString());
                                  }
                                  e.target.value = ''; // Reset select tag
                                }}
                                className="text-[10px] bg-blue-50 dark:bg-slate-800 text-blue-800 dark:text-slate-200 border-none outline-none max-w-[160px] rounded px-1.5 py-0.5 font-bold cursor-pointer transition hover:bg-blue-105 select-none"
                              >
                                <option value="">⚡ Usar do Catálogo</option>
                                {services.map(s => (
                                  <option key={s.id} value={s.id}>{s.description.substring(0, 36)}...</option>
                                ))}
                              </select>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Mapeamento com osciloscópio, troca de fiação..."
                            className="w-full bg-[#0B1220] border border-[#1E293B] text-white caret-white placeholder-[#94A3B8] rounded p-1.5 text-xs outline-none focus:border-blue-550 transition-all"
                            value={item.description}
                            onChange={(e) => {
                              const val = e.target.value;
                              handleUpdateItem(index, 'description', val);
                              if (val.trim().length >= 1) {
                                const matched = services.filter(s => 
                                  s.description.toLowerCase().includes(val.toLowerCase()) || 
                                  (s.category && s.category.toLowerCase().includes(val.toLowerCase()))
                                );
                                setSuggestFilteredList(matched);
                                setActiveSuggestRow(index);
                              } else {
                                setSuggestFilteredList([]);
                                setActiveSuggestRow(null);
                              }
                            }}
                            onFocus={() => {
                              const val = item.description || '';
                              if (val.trim().length >= 1) {
                                const matched = services.filter(s => 
                                  s.description.toLowerCase().includes(val.toLowerCase()) || 
                                  (s.category && s.category.toLowerCase().includes(val.toLowerCase()))
                                );
                                setSuggestFilteredList(matched);
                                setActiveSuggestRow(index);
                              }
                            }}
                          />
                          {activeSuggestRow === index && suggestFilteredList.length > 0 && (
                            <div className="absolute left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl z-50 max-h-48 overflow-y-auto divide-y divide-slate-800">
                              <div className="p-1.5 bg-slate-800 text-[10px] text-slate-400 flex justify-between items-center">
                                <span className="font-bold">📝 Sugestões do seu catálogo:</span>
                                <button 
                                  type="button" 
                                  onClick={() => {
                                    setSuggestFilteredList([]);
                                    setActiveSuggestRow(null);
                                  }} 
                                  className="text-[9px] text-rose-400 hover:text-rose-300 font-extrabold pr-1 cursor-pointer"
                                >
                                  Fechar [✖]
                                </button>
                              </div>
                              {suggestFilteredList.map((srv) => (
                                <button
                                  key={srv.id}
                                  type="button"
                                  onClick={() => {
                                    handleUpdateItem(index, 'description', srv.description);
                                    handleUpdateItem(index, 'unitPrice', srv.unitPrice ? srv.unitPrice.toString() : '0');
                                    setSuggestFilteredList([]);
                                    setActiveSuggestRow(null);
                                  }}
                                  className="w-full text-left p-2.5 hover:bg-slate-800/80 transition flex flex-col gap-0.5 cursor-pointer"
                                >
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-semibold text-slate-100 line-clamp-1">{srv.description}</span>
                                    <span className="text-[10px] font-mono text-emerald-450 text-emerald-400 font-bold ml-2 shrink-0">
                                      R$ {(srv.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[9px] text-slate-450 text-slate-400">
                                    <span className="bg-slate-800 px-1.5 py-0.2 rounded text-[8px] uppercase font-bold text-slate-300">
                                      {srv.category || 'Serviço'}
                                    </span>
                                    {srv.code && <span>Cód: {srv.code}</span>}
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="w-20 space-y-1">
                          <label className="text-[10px] text-slate-400">Qtd</label>
                          <input
                            type="number"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(index, 'quantity', e.target.value)}
                          />
                        </div>
                        <div className="w-32 space-y-1">
                          <label className="text-[10px] text-slate-400">Preço Unitário (R$)</label>
                          <input
                            type="number"
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded p-1.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                            value={item.unitPrice}
                            onChange={(e) => handleUpdateItem(index, 'unitPrice', e.target.value)}
                          />
                        </div>
                        <div className="self-end pb-1.5">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-550 text-red-500 hover:text-red-700 p-1"
                            title="Remover Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Discount & Observations */}
                <div className="space-y-4 pt-2">
                  <div className="border-b pb-2">
                    <h3 className="font-display font-semibold text-xs text-slate-700 dark:text-slate-400 uppercase tracking-wider">Descontos & Condição de Pagamento</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Unidade de Desconto</label>
                      <select
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100"
                        value={activeBudget.discountType || 'PERCENTAGE'}
                        onChange={(e) => handleUpdateBudgetField('discountType', e.target.value)}
                      >
                        <option value="PERCENTAGE">% Porcentagem</option>
                        <option value="FIXED">R$ Valor Fixo</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Valor Desconto</label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                        value={activeBudget.discountValue || 0}
                        onChange={(e) => handleUpdateBudgetField('discountValue', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Prazo de Validade (dias)</label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                        value={activeBudget.validityDays || 15}
                        onChange={(e) => handleUpdateBudgetField('validityDays', e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Assinatura do Profissional (Carimbo)</label>
                      <input
                        type="text"
                        placeholder="Vítor Mendes - Solares Soluções"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                        value={activeBudget.providerSignature || ''}
                        onChange={(e) => handleUpdateBudgetField('providerSignature', e.target.value)}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500">Métodos de Pagamento</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                        value={activeBudget.paymentTerms || ''}
                        onChange={(e) => handleUpdateBudgetField('paymentTerms', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500">Observações Estratégicas</label>
                    <textarea
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2 text-xs text-slate-900 dark:text-slate-100 outline-none"
                      value={activeBudget.observations || ''}
                      onChange={(e) => handleUpdateBudgetField('observations', e.target.value)}
                    />
                  </div>
                </div>

                {/* Provider signature or upload log custom logo */}
                <div className="p-4 bg-slate-50 dark:bg-slate-850/40 rounded-xl border border-slate-100 dark:border-slate-800/80 space-y-4">
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-750 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Configuração de Cores & Logo</span>
                  
                  <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="flex items-center gap-2">
                       <span className="text-xs text-slate-650 dark:text-slate-300 font-semibold">Cor Destaque:</span>
                      <input 
                        type="color" 
                        value={activeWorkspace?.brandColor || '#3b82f6'} 
                        onChange={(e) => handleUpdateWorkspaceMetadata({ brandColor: e.target.value })}
                        className="w-10 h-10 rounded border dark:border-slate-700 cursor-pointer p-0.5 bg-white dark:bg-slate-900"
                        title="Brand Color Picker"
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      Toda a identidade técnica do PDF (títulos, bordas, botões) reflete sua escolha de cor de forma instantânea.
                    </div>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-200/55 dark:border-slate-800/60">
                    <label className="text-[11px] font-bold text-slate-600 dark:text-slate-350 block">Logotipo da Empresa (URL da Imagem)</label>
                    <input 
                      type="text"
                      value={activeWorkspace?.logoUrl || ''} 
                      onChange={(e) => handleUpdateWorkspaceMetadata({ logoUrl: e.target.value })}
                      placeholder="https://exemplo.com/logo.png"
                      className="w-full text-xs p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <div className="flex flex-wrap gap-1.5 items-center mt-1.5">
                      <span className="text-[10px] text-slate-400 uppercase font-bold mr-1">Inserir Presets:</span>
                      <button 
                        type="button"
                        onClick={() => handleUpdateWorkspaceMetadata({ logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=eng' })}
                        className="text-[10px] bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        ⚡ Elétrica
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleUpdateWorkspaceMetadata({ logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=repair' })}
                        className="text-[10px] bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        🔧 Técnica
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleUpdateWorkspaceMetadata({ logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=architect' })}
                        className="text-[10px] bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        📐 Construção
                      </button>
                      <button 
                        type="button"
                        onClick={() => handleUpdateWorkspaceMetadata({ logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=corp' })}
                        className="text-[10px] bg-slate-250 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-750 dark:text-slate-200 px-2 py-0.5 rounded cursor-pointer"
                      >
                        🏢 Consultoria
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right panel: Live budget simulator mockup + AI Copilot */}
              <div className="lg:col-span-12 xl:col-span-5 space-y-6">

                {/* Real-time PDF Design Simulator */}
                <div className="bg-white rounded-2xl p-6 shadow-md border border-slate-150 relative space-y-4">
                  {/* Decorative Header with logo configuration branding */}
                  <div className="flex justify-between items-start border-b pb-4 gap-3">
                    <div className="flex items-center gap-3">
                      {activeWorkspace?.logoUrl ? (
                        <img 
                          src={activeWorkspace.logoUrl} 
                          alt="Logo corporativo" 
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 object-contain rounded bg-slate-50 border border-slate-150 p-1"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded bg-slate-50 border border-slate-150 flex items-center justify-center text-slate-400">
                          <Briefcase className="w-6 h-6" />
                        </div>
                      )}
                      <div>
                        <span className="text-[18px] font-black font-display tracking-tight text-slate-900 flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeWorkspace?.brandColor || '#3b82f6' }} />
                          {activeWorkspace?.name || 'Sua Empresa'}
                        </span>
                        <p className="text-[9px] font-mono text-slate-500 mt-0.5">Nicho: {activeWorkspace?.niche || 'Geral'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] bg-slate-100 font-bold px-2 py-0.5 rounded uppercase text-slate-650">Orçamento #</span>
                      <span className="text-xs font-bold text-slate-600 block mt-1">PROPOSTA_TEMP</span>
                    </div>
                  </div>

                  {/* Budget client details on PDF */}
                  <div className="grid grid-cols-2 gap-2 text-slate-850 text-[11px] pb-2">
                    <div>
                      <p className="text-slate-400 text-[10px]">PRESTADOR DE SERVIÇOS</p>
                      <p className="font-semibold">{activeWorkspace?.name || 'Vendedor'}</p>
                      <p className="text-slate-500">{activeWorkspace?.phone || '(11) 99999-9999'}</p>
                      <p className="text-slate-500 truncate">{activeWorkspace?.email}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px]">CLIENTE FINAL</p>
                      <p className="font-semibold text-slate-900">{activeBudget.clientName || '--- Nome do Cliente ---'}</p>
                      <p className="text-slate-550 text-slate-500">{activeBudget.clientPhone || '--- WhatsApp ---'}</p>
                      <p className="text-slate-500 truncate">{activeBudget.clientAddress}</p>
                    </div>
                  </div>

                  {/* Services listing tables rendering */}
                  <div className="space-y-2 border-t pt-2 text-[11px]">
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wide">Descrição detalhada do faturamento</p>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b text-slate-400">
                          <th className="py-1">Serviço/Peça</th>
                          <th className="text-center py-1">Qtd</th>
                          <th className="text-right py-1">Preço (R$)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {itemsList.map((item, idx) => (
                          <tr key={idx} className="border-b text-slate-800">
                            <td className="py-1.5 pr-2 font-medium">{item.description || <span className="text-rose-450 italic">"Escreva a descrição do serviço..."</span>}</td>
                            <td className="text-center py-1.5">{item.quantity}</td>
                            <td className="text-right py-1.5">R$ {(item.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Budget math results display */}
                  <div className="bg-slate-50 p-3 rounded-lg border flex flex-col text-[11.5px] text-slate-80
                  text-slate-800 space-y-1">
                    <div className="flex justify-between">
                      <span>Subtotal técnico:</span>
                      <span>R$ {calculatedSubtotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-semibold">
                        <span>Desconto Aplicado ({activeBudget.discountType === 'PERCENTAGE' ? `${discount}%` : 'Fixo'}):</span>
                        <span>- R$ {(activeBudget.discountType === 'PERCENTAGE' ? (calculatedSubtotal * discount / 100) : discount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-slate-900 border-t pt-1.5 text-xs">
                      <span>Total do Orçamento:</span>
                      <span className="text-[13px]" style={{ color: activeWorkspace?.brandColor || '#3b82f6' }}>
                        R$ {calculatedTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  {/* Payment term and Pix details */}
                  <div className="p-3 bg-indigo-50/50 text-slate-800 border border-indigo-100 rounded-lg text-[10px] space-y-1.5">
                    <p className="font-semibold text-slate-900">Termos de Adjudicação & Pagamento</p>
                    <p>{activeBudget.paymentTerms || "Não especificado"}</p>
                    <p className="text-indigo-900 font-medium">✅ Chave PIX cadastrada para liquidação automática: <b>{activeWorkspace?.pixKey || "Chave Pix não fornecida"}</b></p>
                  </div>

                  {/* Dynamic Signature box simulator inside HTML preview */}
                  <div className="grid grid-cols-2 gap-4 pt-3 text-[10px] text-slate-500 text-center border-t border-slate-100">
                    <div className="border-r border-dashed border-slate-200 pr-2">
                      <p className="text-slate-400 font-bold uppercase">PRESTADOR DE SERVIÇOS</p>
                      <div className="h-10 border-b border-slate-300 md:h-12 flex items-center justify-center font-mono text-[9px] text-slate-400">
                        {activeBudget.providerSignature || 'Vítor Mendes'}
                      </div>
                      <p className="mt-1 font-semibold">{activeWorkspace?.name || 'Solares'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 font-bold uppercase">ASSINATURA DIGITAL DO CLIENTE</p>
                      <div className="h-12 flex flex-col items-center justify-center">
                        {activeBudget.clientSignature ? (
                          <div className="bg-emerald-50 text-emerald-800 border border-emerald-100 rounded px-1.5 py-0.5 text-[8.5px] leading-tight font-mono">
                            ✍️ Carimbo IP-Check: <b>VERIFICADO</b><br />
                            {activeBudget.clientSignatureName || 'Assinou Proposta'}
                          </div>
                        ) : (
                          <span className="text-slate-400 italic">Disponível em link do cliente</span>
                        )}
                      </div>
                      <p className="mt-0.5 font-semibold text-slate-700">{activeBudget.clientSignatureName || 'Aguardando validação'}</p>
                    </div>
                  </div>
                </div>

                {/* AIPanel integration for the copilot services */}
                <AIPanel
                  niche={activeWorkspace?.niche || 'Eletricista'}
                  onApplyDescription={handleApplyDescriptionFromAI}
                  onApplyItems={handleApplyItemsFromAI}
                  onApplyObservations={handleApplyObservationsFromAI}
                  brandColor={activeWorkspace?.brandColor}
                />

              </div>

            </div>

            {/* Issued Budgets Table lists under Creator */}
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-black text-lg">Orçamentos Emitidos ({budgets.length})</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Clique para enviar direto ao WhatsApp do cliente ou visualizar proposta impressa.</p>
                </div>
                <button 
                  onClick={async () => {
                    const res = await fetch('/api/budgets');
                    const bData = await res.json();
                    setBudgets(bData);
                    showNotification("Fluxo de orçamentos atualizado!");
                  }}
                  className="p-1.5 bg-slate-100 dark:bg-slate-800 text-xs rounded hover:bg-slate-200 transition"
                >
                  Atualizar Lista
                </button>
              </div>

              {budgets.length === 0 ? (
                <div className="text-center p-10 text-slate-400 text-xs border border-dashed rounded-xl">
                  Nenhum orçamento emitido ainda para o workspace {activeWorkspace?.name}. Comece cadastrando um no painel acima de forma instantânea!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b text-slate-400 leading-normal">
                        <th className="py-2">Código</th>
                        <th className="py-2">Cliente</th>
                        <th className="py-2">Serviços / Data</th>
                        <th className="py-2 text-right">Faturamento (R$)</th>
                        <th className="py-2 text-center">Status</th>
                        <th className="py-2 text-center">Ações Rápidas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {budgets.map(b => (
                        <tr key={b.id} className="border-b text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-850 transition">
                          <td className="py-3 font-semibold font-mono text-blue-500">{b.number}</td>
                          <td className="py-3">
                            <p className="font-bold text-slate-900 dark:text-slate-100">{b.clientName}</p>
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-emerald-500" /> {b.clientPhone}
                            </span>
                          </td>
                          <td className="py-3">
                            <p className="truncate max-w-xs">{b.items.map(i => i.description).join(', ')}</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">{new Date(b.createdAt).toLocaleDateString('pt-BR')}</span>
                          </td>
                          <td className="py-3 text-right font-black">
                            R$ {(b.total || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              b.status === BudgetStatus.APPROVED 
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                                : b.status === BudgetStatus.IN_PROGRESS 
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400'
                            }`}>
                              {b.status === BudgetStatus.APPROVED ? 'Aprovado' : b.status === BudgetStatus.IN_PROGRESS ? 'Em andamento' : 'Pendente'}
                            </span>
                          </td>
                          <td className="py-3">
                            <div className="flex gap-2 justify-center items-center">
                              <button
                                onClick={() => handleShareWhatsApp(b)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold py-1 px-2 rounded flex items-center gap-1 transition"
                                title="Enviar por WhatsApp"
                              >
                                <Send className="w-3 h-3" /> WhatsApp
                              </button>
                              <button
                                onClick={() => triggerPixQr(b)}
                                className="bg-sky-650 bg-sky-500 hover:bg-sky-650 text-white text-[10px] font-bold py-1 px-2 rounded flex items-center gap-1 transition"
                                title="Pix Inteligente"
                              >
                                <Coins className="w-3 h-3 text-gold" /> PIX
                              </button>
                              <button
                                onClick={() => handleDuplicateBudget(b.id)}
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-755 text-slate-700 dark:text-slate-300 text-[10px] font-semibold py-1 px-2 rounded transition"
                                title="Clonar Orçamento"
                              >
                                Duplicar
                              </button>
                              <button
                                onClick={() => {
                                  // Open temporary visual system print layout directly formatted as elegant PDF
                                  window.print();
                                }}
                                className="text-slate-400 hover:text-blue-500 p-1"
                                title="Imprimir como PDF"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBudget(b.id)}
                                className="text-slate-400 hover:text-red-500 p-1"
                                title="Deletar Proposta"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. VIEW: DASHBOARD (Rich reports for analytics) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight">Painel Executivo OrçaFlow</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Visualize receitas estimadas, taxas de conversão de clientes e faturamentos recorrentes.</p>
              </div>
              <span className="text-xs bg-slate-100 dark:bg-slate-850 px-3 py-1 bg-sky-50 text-indigo-700 rounded-full font-bold">Métricas Atualizadas</span>
            </div>

            {/* Micro stats block deck */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] text-slate-400 uppercase font-black font-mono">Receita total enviada</span>
                <p className="text-2xl font-black">R$ {budgets.reduce((acc, curr) => acc + curr.total, 0).toLocaleString('pt-BR')}</p>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full w-fit">
                  +12% vs. mês passado
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] text-slate-400 uppercase font-black font-mono">Conversão de Orçamentos</span>
                <p className="text-2xl font-black">
                  {budgets.length > 0 
                    ? `${(budgets.filter(b => b.status === BudgetStatus.APPROVED).length / budgets.length * 100).toFixed(1)}%`
                    : '100%'}
                </p>
                <div className="text-[10px] text-emerald-500 font-bold flex items-center gap-1 bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 rounded-full w-fit">
                  Meta setorial superada
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] text-slate-400 uppercase font-black font-mono">Orçamentos Aprovados</span>
                <p className="text-2xl font-black">{budgets.filter(b => b.status === BudgetStatus.APPROVED).length} de {budgets.length}</p>
                <div className="text-[10px] text-blue-500 font-bold flex items-center gap-1 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full w-fit">
                  {budgets.filter(b => b.status === BudgetStatus.PENDING).length} pendentes de fechamento
                </div>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-2">
                <span className="text-[11px] text-slate-400 uppercase font-black font-mono">Velocidade de fechamento</span>
                <p className="text-2xl font-black">20 min</p>
                <div className="text-[10px] text-indigo-500 font-bold flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/20 px-2 py-0.5 rounded-full w-fit">
                  3x mais ágil que Excel
                </div>
              </div>
            </div>

            {/* Dynamic visual Charts via recharts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Sales line charts - 100% VERIDICAL REAL DATA */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">Evolução de Faturamento Real</h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-500">Histórico de receita total emitida e aprovada em propostas verídicas deste Workspace.</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={computedDashboardData.chartData}
                      margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" vertical={false} />
                      <XAxis dataKey="month" style={{ fontSize: '10px' }} stroke="#94a3b8" />
                      <YAxis style={{ fontSize: '10px' }} stroke="#94a3b8" />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Area type="monotone" name="Volume Total" dataKey="value" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorValue)" />
                      <Area type="monotone" name="Aprovado" dataKey="approved" stroke="#10b981" strokeWidth={2.5} fillOpacity={0.6} fill="url(#colorApproved)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Niche distribution charts - 100% VERIDICAL REAL DATA */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-5 rounded-2xl shadow-sm space-y-4">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200">Segmentação Comercial por Categoria</h4>
                  <p className="text-[11px] text-slate-450 dark:text-slate-500">Distribuição total consolidada de orçamentos emitidos por nicho operacional.</p>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={computedDashboardData.nicheData}
                      layout="vertical"
                      margin={{ top: 10, right: 10, left: 10, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" className="dark:stroke-slate-800" horizontal={false} />
                      <XAxis type="number" style={{ fontSize: '10px' }} stroke="#94a3b8" />
                      <YAxis dataKey="niche" type="category" style={{ fontSize: '9px' }} stroke="#94a3b8" width={90} />
                      <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`} />
                      <Bar name="Faturamento no Nicho" dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* 3. Copilot analytics insights based on custom workspace data */}
            <div className="bg-gradient-to-tr from-slate-900 to-blue-950 text-white p-6 rounded-3xl border border-slate-800 shadow-xl space-y-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-blue-500/10 rounded-xl">
                  <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm">Copiloto Inteligente de Negócios OrçaFlow</h4>
                  <p className="text-[10px] text-slate-400">Análise cognitiva em tempo real adaptada ao nicho de "<b>{activeWorkspace?.niche || 'Prestação de Serviços Gerais'}</b>"</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1.5 hover:border-slate-700 transition text-left">
                  <span className="text-emerald-400 font-bold block">💡 Otimização de Precificação</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    Com base nos orçamentos fechados na categoria <b>{activeWorkspace?.niche || 'Geral'}</b>, recomendamos embutir uma margem de garantia técnica de 10% adicionada à proposta. Isso melhora em 15% sua margem líquida declarada.
                  </p>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1.5 hover:border-slate-700 transition text-left">
                  <span className="text-yellow-400 font-bold block">📞 Alerta de Follow-up Ativo</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    Você possui <b>{budgets.filter(b => b.status === BudgetStatus.PENDING).length} proposta(s) com status Pendente</b>. O tempo médio ideal de fechamento é de 24h. Envie uma mensagem rápida pelo WhatsApp para agilizar o fechamento.
                  </p>
                </div>

                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-1.5 hover:border-slate-700 transition text-left">
                  <span className="text-sky-400 font-bold block">📈 Expansão do Plano Comercial</span>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                    Você registrou <b>{budgets.length} orçamento(s)</b> neste workspace. O plano {user?.plan} ativo permite faturar de forma ilimitada para todos os colaboradores e empresas adicionados no OrçaFlow.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

         {/* 3. VIEW: CLIENTS (Directory list of simulated prospects) */}
        {activeTab === 'clients' && (
          <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <span className="p-2 bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-300 rounded-xl">
                    <Users className="w-5 h-5" />
                  </span>
                  Meus Clientes
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Banco de dados unificado de clientes do workspace <b>{activeWorkspace?.name}</b>. Cadastre perfis para agilizar emissões ou gerenciar orçamentos.
                </p>
              </div>
              <button
                onClick={() => setIsAddingClient(!isAddingClient)}
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-4 py-2 rounded-xl font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer self-stretch md:self-auto"
              >
                👤 {isAddingClient ? 'Fechar Cadastro' : 'Cadastrar Novo Cliente'}
              </button>
            </div>

            {/* Expandable Client Registration Form Card */}
            {isAddingClient && (
              <form onSubmit={handleRegisterClient} className="bg-white dark:bg-slate-900 border border-blue-150 dark:border-blue-900/60 rounded-2xl p-6 shadow-sm space-y-4 animate-fade-in">
                <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                  <UserPlus className="w-4 h-4 text-blue-500" />
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Ficha de Cadastro de Cliente</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Nome do Cliente / Empresa *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-205 border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      placeholder="Ex: João Silva ou Construtora Aliança"
                      value={newClientName}
                      onChange={(e) => setNewClientName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">WhatsApp / Telefone de Contato *</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-202 border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      placeholder="Ex: (11) 98888-8888"
                      value={newClientPhone}
                      onChange={(e) => setNewClientPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">E-mail de Contrato (Opcional)</label>
                    <input
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      placeholder="Ex: joao.rob@email.com"
                      value={newClientEmail}
                      onChange={(e) => setNewClientEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Endereço Completo de Atendimento (Opcional)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 rounded-lg p-2.5 text-xs text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500"
                      placeholder="Ex: Alameda das Flores, 120 - Bairro Novo, PR"
                      value={newClientAddress}
                      onChange={(e) => setNewClientAddress(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddingClient(false)}
                    className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-semibold py-2 px-4 rounded-xl transition cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-4 rounded-xl transition cursor-pointer shadow-md"
                  >
                    ✓ Salvar Cadastro de Cliente
                  </button>
                </div>
              </form>
            )}

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                {clientsList.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 dark:text-slate-400 space-y-2">
                    <p className="text-sm font-semibold">Nenhum cliente cadastrado neste Workspace.</p>
                    <p className="text-xs">Registre um cliente clicando em "Cadastrar Novo Cliente" para iniciar seu banco de dados unificado.</p>
                  </div>
                ) : (
                  <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
                    <thead>
                      <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400">
                        <th className="py-2.5 font-bold uppercase text-[10px]">Nome Completo</th>
                        <th className="py-2.5 font-bold uppercase text-[10px]">Contato WhatsApp</th>
                        <th className="py-2.5 font-bold uppercase text-[10px]">Endereço de Atendimento</th>
                        <th className="py-2.5 font-bold uppercase text-[10px]">E-mail Cadastrado</th>
                        <th className="py-2.5 font-bold uppercase text-[10px] text-center">Faturamento Acumulado</th>
                        <th className="py-2.5 font-bold uppercase text-[10px] text-center w-48">Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {clientsList.map((client) => (
                        <tr key={client.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition">
                          <td className="py-3 font-semibold text-slate-900 dark:text-slate-100">{client.name}</td>
                          <td className="py-3 font-mono text-slate-850 dark:text-slate-300">{client.phone}</td>
                          <td className="py-3 truncate max-w-xs text-slate-700 dark:text-slate-350">{client.address || "--- Endereço não informado ---"}</td>
                          <td className="py-3 text-slate-500 dark:text-slate-400">{client.email || "---"}</td>
                          <td className="py-3 text-center font-bold text-slate-900 dark:text-slate-100">
                            R$ {budgets.filter(b => b.clientName.toLowerCase() === client.name.toLowerCase()).reduce((a,c) => a + c.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 text-center flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                handleUpdateBudgetField('clientName', client.name);
                                handleUpdateBudgetField('clientPhone', client.phone);
                                handleUpdateBudgetField('clientAddress', client.address);
                                handleUpdateBudgetField('clientEmail', client.email);
                                setActiveTab('budget-maker');
                                showNotification(`Cliente "${client.name}" carregado com sucesso.`);
                              }}
                              className="bg-blue-50 dark:bg-blue-950 hover:bg-blue-100 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 text-[10px] font-bold py-1 px-2.5 rounded-lg transition border border-blue-200 dark:border-blue-800/80 cursor-pointer"
                            >
                              Faturar Novo
                            </button>
                            <button
                              onClick={() => handleDeleteClient(client.name)}
                              className="bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-450 text-[10px] font-bold py-1 px-2.5 rounded-lg transition border border-rose-250 dark:border-rose-900/80 cursor-pointer"
                            >
                              Excluir
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 4. VIEW: SERVICE CATALOG (Catálogo de Serviços) */}
        {activeTab === 'services' && (
          <div className="space-y-6 animate-fade-in text-slate-800 dark:text-slate-200">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm gap-4">
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight text-slate-900 dark:text-slate-100">Catálogo de Serviços Compartilhado</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Cadastre os serviços e materiais recorrentes da sua empresa <b>{activeWorkspace?.name}</b> para preenchimento automático ultra veloz de novas propostas.
                </p>
              </div>
              <button
                onClick={() => setIsAddingService(!isAddingService)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2 px-4 rounded-xl shadow-lg transition flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                {isAddingService ? 'Fechar Formulário' : 'Novo Serviço no Catálogo'}
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Form to Register or Edit Services */}
              {(isAddingService || services.length === 0) && (
                <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4 animate-fade-in">
                  <h3 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">
                    {editingServiceId ? '📝 Editar Item do Catálogo' : '📦 Cadastrar Serviço / Peça'}
                  </h3>
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Descrição do Serviço ou Item *</label>
                      <textarea
                        required
                        value={newServiceDesc}
                        onChange={(e) => setNewServiceDesc(e.target.value)}
                        placeholder="Ex: Instalação de quadro elétrico trifásico com aterramento completo..."
                        rows={2}
                        className="w-full text-xs p-3 bg-[#0B1220] border border-[#1E293B] text-[#FFFFFF] placeholder-[#94A3B8] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Preço de Referência Unitário (R$)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        placeholder="Ex: 450.00"
                        className="w-full text-xs p-3 bg-[#0B1220] border border-[#1E293B] text-[#FFFFFF] placeholder-[#94A3B8] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Categoria / Gênero</label>
                      <select
                        value={newServiceCategory}
                        onChange={(e) => setNewServiceCategory(e.target.value)}
                        className="w-full text-xs p-3 bg-[#0B1220] border border-[#1E293B] text-[#FFFFFF] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      >
                        <option value="Serviço">💼 Serviço de Mão de Obra</option>
                        <option value="Material">📦 Peça / Material</option>
                        <option value="Técnico">🔧 Suporte Técnico</option>
                        <option value="Equipamento">⚡ Equipamento / Aluguel</option>
                        <option value="Outro">📝 Outros Requisitos</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Código ou Referência (Opcional)</label>
                      <input
                        type="text"
                        value={newServiceCode}
                        onChange={(e) => setNewServiceCode(e.target.value)}
                        placeholder="Ex: SKU-991"
                        className="w-full text-xs p-3 bg-[#0B1220] border border-[#1E293B] text-[#FFFFFF] placeholder-[#94A3B8] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider block">Observações Técnicas Extras (Opcional)</label>
                      <textarea
                        value={newServiceObs}
                        onChange={(e) => setNewServiceObs(e.target.value)}
                        placeholder="Ex: Fabricante Tigre, garantia de 12 meses..."
                        rows={2}
                        className="w-full text-xs p-3 bg-[#0B1220] border border-[#1E293B] text-[#FFFFFF] placeholder-[#94A3B8] rounded-xl focus:outline-none focus:ring-1 focus:ring-blue-500 transition"
                      />
                    </div>

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-grow text-xs font-bold text-white py-2.5 px-4 rounded-xl transition shadow-md flex items-center justify-center gap-1.5 cursor-pointer bg-blue-600 hover:bg-blue-500"
                      >
                        <CheckCircle2 className="w-4 h-4" /> {editingServiceId ? 'Salvar Alterações' : 'Cadastrar no Catálogo'}
                      </button>
                      {editingServiceId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingServiceId(null);
                            setNewServiceDesc('');
                            setNewServicePrice('');
                            setNewServiceCategory('Serviço');
                            setNewServiceCode('');
                            setNewServiceObs('');
                            setIsAddingService(false);
                          }}
                          className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs px-3 rounded-xl transition"
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Services List Table */}
              <div className={`${(isAddingService || services.length === 0) ? 'lg:col-span-8' : 'lg:col-span-12'} bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-150 dark:border-slate-800 shadow-sm space-y-4`}>
                <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h3 className="font-display font-black text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider text-[11px]">Itens e Serviços Ativos ({services.length})</h3>
                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold px-2 py-0.5 rounded-full">Automático</span>
                </div>

                {services.length === 0 ? (
                  <div className="text-center py-12 px-4 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Nenhum serviço salvo ainda</h4>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                        Adicione os serviços da sua empresa usando o formulário ao lado para começar a faturar mais rápido.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400">
                          <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] w-1/2">Descrição técnica / Item</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-[10px]">Categoria</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-right">Preço Sugerido</th>
                          <th className="py-2.5 font-bold uppercase tracking-wider text-[10px] text-center w-36">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                        {services.map((srv) => (
                          <tr key={srv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                            <td className="py-3 pr-4">
                              <span className="font-medium text-slate-800 dark:text-slate-200 block">{srv.description}</span>
                              {srv.code && (
                                <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 block">Ref: {srv.code}</span>
                              )}
                              {srv.obs && (
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 block italic leading-tight">{srv.obs}</span>
                              )}
                            </td>
                            <td className="py-3">
                              <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                                srv.category === 'Material' 
                                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300' 
                                  : srv.category === 'Técnico' 
                                  ? 'bg-violet-100 text-violet-800 dark:bg-violet-950/40 dark:text-violet-350'
                                  : srv.category === 'Equipamento' 
                                  ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-305'
                                  : 'bg-blue-100 text-blue-800 dark:bg-slate-800 dark:text-slate-300'
                              }`}>
                                {srv.category || 'Serviço'}
                              </span>
                            </td>
                            <td className="py-3 text-right font-mono text-slate-900 dark:text-slate-100">
                              R$ {(srv.unitPrice || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 text-center">
                              <div className="flex justify-center items-center gap-1.5">
                                <button
                                  onClick={() => {
                                    setEditingServiceId(srv.id);
                                    setNewServiceDesc(srv.description);
                                    setNewServicePrice(srv.unitPrice ? srv.unitPrice.toString() : '');
                                    setNewServiceCategory(srv.category || 'Serviço');
                                    setNewServiceCode(srv.code || '');
                                    setNewServiceObs(srv.obs || '');
                                    setIsAddingService(true);
                                  }}
                                  title="Editar este item"
                                  className="p-1 px-2.5 rounded bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-sky-400 hover:bg-blue-100 transition cursor-pointer text-[10px] font-bold"
                                >
                                  Editar
                                </button>
                                <button
                                  onClick={() => handleDeleteService(srv.id)}
                                  title="Remover do catálogo"
                                  className="p-1 px-2.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-150 dark:hover:bg-rose-900/50 transition cursor-pointer text-[10px] font-bold"
                                >
                                  Excluir
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 5. VIEW: MINHA EQUIPE & PIX */}
        {activeTab === 'team' && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight">Equipe e Ajustes Corporativos</h1>
                <p className="text-xs text-slate-500 dark:text-slate-400">Configure sua chave Pix, adicione membros ao workspace e atribua permissões de visualização.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left Column: Pix setup of current active workspace */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="border-b pb-2">
                  <h4 className="font-display font-bold text-sm">Informações de Minha Empresa e Pix</h4>
                  <p className="text-[11px] text-slate-400">Preencha todas as informações da sua equipe corporativa e salve para atualizar instantaneamente os documentos enviados aos clientes.</p>
                </div>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nome da Empresa</label>
                    <input
                      type="text"
                      className="w-full bg-[#0B1220] border border-[#1E293B] text-xs rounded-lg p-3 text-white placeholder-[#94A3B8] outline-none"
                      placeholder="Ex: Solares Soluções Corporativas"
                      value={workspaceForm.name}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nicho de Atuação</label>
                    <input
                      type="text"
                      className="w-full bg-[#0B1220] border border-[#1E293B] text-xs rounded-lg p-3 text-white placeholder-[#94A3B8] outline-none"
                      placeholder="Ex: Eletricista & Automação"
                      value={workspaceForm.niche}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, niche: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">E-mail de Contato Comercial</label>
                    <input
                      type="email"
                      className="w-full bg-[#0B1220] border border-[#1E293B] text-xs rounded-lg p-3 text-white placeholder-[#94A3B8] outline-none"
                      placeholder="comercial@solaresenergia.com.br"
                      value={workspaceForm.email}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Telefone Comercial Corporativo</label>
                    <input
                      type="text"
                      className="w-full bg-[#0B1220] border border-[#1E293B] text-xs rounded-lg p-3 text-white placeholder-[#94A3B8] outline-none"
                      placeholder="Ex: (11) 98765-4321"
                      value={workspaceForm.phone}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Endereço de Escritório</label>
                    <input
                      type="text"
                      className="w-full bg-[#0B1220] border border-[#1E293B] text-xs rounded-lg p-3 text-white placeholder-[#94A3B8] outline-none"
                      placeholder="Av Paulista, 1000 - Cerqueira Cesar"
                      value={workspaceForm.address}
                      onChange={(e) => setWorkspaceForm({ ...workspaceForm, address: e.target.value })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 pb-2">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Minha Chave Pix</label>
                      <input
                        type="text"
                        className="w-full bg-[#0B1220] border border-[#1E293B] text-xs rounded-lg p-3 text-white placeholder-[#94A3B8] outline-none"
                        placeholder="Ex: Pix CNPJ ou e-mail"
                        value={workspaceForm.pixKey}
                        onChange={(e) => setWorkspaceForm({ ...workspaceForm, pixKey: e.target.value })}
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cor de Marca</label>
                      <div className="flex gap-2">
                        <input
                          type="color"
                          className="w-10 h-10 bg-[#0B1220] border border-[#1E293B] rounded cursor-pointer p-0.5"
                          value={workspaceForm.brandColor}
                          onChange={(e) => setWorkspaceForm({ ...workspaceForm, brandColor: e.target.value })}
                        />
                        <input
                          type="text"
                          className="flex-1 bg-[#0B1220] border border-[#1E293B] text-xs rounded-lg p-2 text-white placeholder-[#94A3B8] outline-none font-mono"
                          value={workspaceForm.brandColor}
                          onChange={(e) => setWorkspaceForm({ ...workspaceForm, brandColor: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => handleUpdateWorkspaceMetadata(workspaceForm)}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Salvar Informações e Chave Pix
                  </button>
                </div>
              </div>

              {/* Right Column: Invite member listing lists */}
              <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-2">
                  <div>
                    <h4 className="font-display font-bold text-sm">Membros Técnicos & Equipes</h4>
                    <p className="text-[11px] text-slate-400">Pessoas vinculadas à empresa "{activeWorkspace?.name}"</p>
                  </div>
                  <button
                    onClick={() => setIsAddingMember(!isAddingMember)}
                    className="bg-blue-600 text-white text-[11px] font-bold py-1 px-2 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Adicionar Membro
                  </button>
                </div>

                {isAddingMember && (
                  <form onSubmit={handleAddMember} className="bg-slate-50 dark:bg-slate-850 p-4 rounded-xl border space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500">Nome do Colaborador</label>
                        <input
                          type="text"
                          className="w-full bg-white dark:bg-slate-900 border text-xs p-2 rounded outline-none"
                          placeholder="Ex: Carlos Souza"
                          value={memberForm.name}
                          onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500">E-mail Corporativo</label>
                        <input
                          type="email"
                          className="w-full bg-white dark:bg-slate-900 border text-xs p-2 rounded outline-none"
                          placeholder="carlos@empresa.com"
                          value={memberForm.email}
                          onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-slate-500">Permissão:</label>
                        <select
                          className="bg-white dark:bg-slate-900 border text-[11px] px-2 py-1 rounded"
                          value={memberForm.role}
                          onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as any })}
                        >
                          <option value={UserRole.ADMIN}>Administrador</option>
                          <option value={UserRole.MEMBER}>Técnico Executor</option>
                          <option value={UserRole.VIEWER}>Leitor Geral</option>
                        </select>
                      </div>
                      <div className="flex gap-1">
                        <button type="submit" className="bg-emerald-600 text-white text-[11px] px-3 py-1 rounded">Enviar Código</button>
                        <button type="button" onClick={() => setIsAddingMember(false)} className="bg-slate-200 text-slate-700 text-[11px] px-3 py-1 rounded">Cancelar</button>
                      </div>
                    </div>
                  </form>
                )}

                <div className="space-y-2">
                  {wsMembers.map(m => (
                    <div key={m.id} className="bg-slate-50 dark:bg-slate-850 p-3 rounded-xl border flex items-center justify-between">
                      <div>
                        <p className="font-bold text-xs text-slate-900 dark:text-slate-100">{m.name}</p>
                        <span className="text-[10px] text-slate-400 block">{m.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-sky-50 text-indigo-700 dark:bg-slate-800 dark:text-slate-350 font-bold px-2 py-0.5 rounded-full uppercase">
                          {m.role}
                        </span>
                        {m.role !== UserRole.OWNER && (
                          <button 
                            onClick={() => handleDeleteMember(m.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                            title="Desvincular colaborador"
                          >
                            ✖
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* 6. VIEW: SaaS SUPERADMIN PANEL */}
        {activeTab === 'admin' && user?.isSuperAdmin && saasAdminData && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-violet-950 text-white p-6 rounded-2xl border border-violet-900 gap-4">
              <div>
                <h1 className="font-display font-black text-2xl tracking-tight text-white flex items-center gap-2">
                  <ShieldAlert className="w-6 h-6 text-violet-400" />
                  Painel de Controle SaaS Admin (Superuser)
                </h1>
                <p className="text-xs text-violet-350">Supervisão técnica de usuários, empresas e métricas gerais financeiras do OrçaFlow.</p>
              </div>
              <button
                type="button"
                onClick={handleDeleteAllSaaSUsers}
                className="bg-red-600 hover:bg-red-500 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Trash2 className="w-4 h-4" /> Excluir Todos os Usuários
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider">MRR (Mensalidade Recorrente)</span>
                <p className="text-2xl font-black text-violet-600 dark:text-slate-100">R$ {saasAdminData.metrics.mrr.toLocaleString('pt-BR')}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider">Assinantes Ativos</span>
                <p className="text-2xl font-black">{saasAdminData.metrics.subscribers}</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider">Taxa de Churn</span>
                <p className="text-2xl font-black text-rose-500">{saasAdminData.metrics.churnRate}%</p>
              </div>
              <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-1">
                <span className="text-[10.5px] text-slate-400 uppercase font-bold tracking-wider">Taxa de Conversão Landing</span>
                <p className="text-2xl font-black text-emerald-500">{saasAdminData.metrics.conversionRate}%</p>
              </div>
            </div>

            {/* Simulated registration events log */}
            <div className="bg-white dark:bg-slate-900 border border-slate-150 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b pb-2">
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Contas e Configurações Ativas Globais</h4>
                <span className="text-[10px] bg-red-100 dark:bg-rose-950 text-red-750 dark:text-rose-350 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Zona de Segurança</span>
              </div>
              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                      <th className="py-2.5 uppercase text-[10px] font-bold">E-mail Registrado</th>
                      <th className="py-2.5 uppercase text-[10px] font-bold">Nome</th>
                      <th className="py-2.5 uppercase text-[10px] font-bold">Workspace Associado</th>
                      <th className="py-2.5 uppercase text-[10px] font-bold text-center">Plano Ativo</th>
                      <th className="py-2.5 uppercase text-[10px] font-bold text-center w-28">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {saasAdminData.users.map((item, idx) => (
                      <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850/40 transition">
                        <td className="py-3 font-semibold text-slate-950 dark:text-white">{item.email}</td>
                        <td className="py-3 font-medium text-slate-800 dark:text-slate-200">{item.name}</td>
                        <td className="py-3 text-slate-600 dark:text-slate-400">{item.companyName}</td>
                        <td className="py-3 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-mono leading-none ${
                            item.plan === PlanType.BUSINESS 
                              ? 'bg-violet-100 text-violet-800 font-bold' 
                              : item.plan === PlanType.PRO 
                              ? 'bg-blue-100 text-blue-800 font-semibold' 
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {item.plan}
                          </span>
                        </td>
                        <td className="py-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteSaaSUser(item.id, item.email)}
                            className="p-1 px-2.5 rounded bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition cursor-pointer text-[10px] font-bold border border-rose-250 dark:border-rose-900/40"
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Token Generation & Maintenance Dashboard */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Column 1: Generator Form */}
              <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <KeyRound className="w-4 h-4 text-violet-500" />
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Gerar Novo Token</h4>
                </div>

                <form onSubmit={handleCreateToken} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">Código Customizado (Opcional)</label>
                    <input
                      type="text"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 outline-none focus:border-violet-600 font-mono"
                      placeholder="Ex: ORCA-VITOR-1"
                      value={newCreatedTokenCode}
                      onChange={(e) => setNewCreatedTokenCode(e.target.value.toUpperCase())}
                    />
                    <span className="text-[9.5px] text-slate-400 block leading-tight">Se deixado em branco, geramos uma combinação segura e aleatória automaticamente.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">Limitar p/ E-mail (Opcional)</label>
                    <input
                      type="email"
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 outline-none focus:border-violet-600"
                      placeholder="Ex: cliente.novo@gmail.com"
                      value={newCreatedTokenEmail}
                      onChange={(e) => setNewCreatedTokenEmail(e.target.value)}
                    />
                    <span className="text-[9.5px] text-slate-400 block leading-tight">Se definido, somente o usuário com este e-mail poderá utilizar o token durante o cadastro.</span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10.5px] font-semibold text-slate-500 uppercase tracking-wider block">Duração e Validade do Token</label>
                    <select
                      className="w-full bg-slate-50 dark:bg-slate-850 border border-slate-200 dark:border-slate-750 text-xs rounded-lg p-2.5 outline-none focus:border-violet-600"
                      value={newCreatedTokenDuration}
                      onChange={(e) => setNewCreatedTokenDuration(e.target.value)}
                    >
                      <option value="no-expire">Sem expiração (Vitalício)</option>
                      <option value="7">7 dias úteis</option>
                      <option value="30">30 dias corridos (Mensal)</option>
                      <option value="180">180 dias corridos (Semestral)</option>
                      <option value="365">365 dias corridos (Anual)</option>
                    </select>
                    <span className="text-[9.5px] text-slate-400 block leading-tight">O token será inativado ou indisponível após transcorrida a validade selecionada.</span>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-semibold text-xs py-2.5 px-4 rounded-xl transition cursor-pointer shadow-md"
                  >
                    🚀 Gerar e Liberar Token
                  </button>
                </form>
              </div>

              {/* Column 2 & 3: Token Audit Log Table */}
              <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4 text-slate-800 dark:text-slate-200">
                <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-slate-100">Tokens Ativos e Chaves de Pré-Inscrição</h4>
                </div>

                <div className="overflow-x-auto">
                  {saasTokens.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                      Nenhum token foi gerado até o momento. Use o painel ao lado para emitir sua primeira chave de registro.
                    </div>
                  ) : (
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-slate-150 dark:border-slate-800 text-slate-400">
                          <th className="py-2.5 uppercase text-[10px] font-bold">Código do Token</th>
                          <th className="py-2.5 uppercase text-[10px] font-bold">Lock de E-mail</th>
                          <th className="py-2.5 uppercase text-[10px] font-bold text-center">Status</th>
                          <th className="py-2.5 uppercase text-[10px] font-bold text-center">Data Criação</th>
                          <th className="py-2.5 uppercase text-[10px] font-bold text-center w-24">Ação</th>
                        </tr>
                      </thead>
                      <tbody>
                        {saasTokens.map((token) => (
                          <tr key={token.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-850/10 transition leading-normal">
                            <td className="py-3 font-mono font-bold text-slate-900 dark:text-slate-100 tracking-wider">
                              {token.code}
                            </td>
                            <td className="py-3 font-medium text-slate-600 dark:text-slate-350">
                              {token.emailLock || <span className="text-slate-400 italic">Público (Qualquer e-mail)</span>}
                              {token.expiresAt && (
                                <span className="block text-[9.5px] text-amber-600 dark:text-amber-450 font-bold">
                                  Validade: {new Date(token.expiresAt).toLocaleDateString('pt-BR')}
                                </span>
                              )}
                            </td>
                            <td className="py-3 text-center">
                              {token.status === 'ACTIVE' ? (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">Ativo</span>
                              ) : (
                                <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold bg-slate-100 text-slate-500 uppercase tracking-wider">Utilizado</span>
                              )}
                            </td>
                            <td className="py-3 text-center font-mono text-slate-450 dark:text-slate-500 text-[10px]">
                              {new Date(token.createdAt).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="py-3 text-center">
                              <button
                                onClick={() => handleDeleteToken(token.id)}
                                className="bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/50 text-rose-600 dark:text-rose-450 text-[10px] font-bold py-1 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 transition cursor-pointer"
                              >
                                Excluir
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      
    </div>
  );
}
