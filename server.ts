import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";
import fs from "fs";

// Load environment variables
dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

const DB_FILE = path.join(process.cwd(), "persistent_db.json");

// In-Memory Database + File Persistence
const db = {
  users: [
    { id: "usr-1", email: "vitorxl38@gmail.com", name: "Vítor Mendes", password: "vitor123", role: "OWNER", isSuperAdmin: true, plan: "BUSINESS" },
    { id: "usr-2", email: "carla.gerente@orcaflow.com", name: "Carla Souza", password: "carla123", role: "ADMIN", isSuperAdmin: false, plan: "BUSINESS" },
    { id: "usr-3", email: "tecnico.joao@orcaflow.com", name: "João Pedro", password: "joao123", role: "MEMBER", isSuperAdmin: false, plan: "FREE" }
  ],
  workspaces: [
    { id: "ws-1", name: "Solares Soluções Elétricas", niche: "Eletricista & Automação", phone: "(11) 98765-4321", email: "contato@solaresenergia.com.br", address: "Av. Paulista, 1000 - Bela Vista, São Paulo - SP", logoUrl: "", brandColor: "#eab308", pixKey: "financeiro@solaresenergia.com.br", ownerId: "usr-1" },
    { id: "ws-2", name: "Pixel Studio Design", niche: "Design & Agência Digital", phone: "(21) 99887-7665", email: "ola@pixelstudio.design", address: "Rua Visconde de Pirajá, 350 - Ipanema, Rio de Janeiro - RJ", logoUrl: "", brandColor: "#6366f1", pixKey: "pix@pixelstudio.design", ownerId: "usr-1" },
  ],
  workspaceMembers: [
    { id: "mem-1", workspaceId: "ws-1", userId: "usr-1", role: "OWNER", name: "Vítor Mendes", email: "vitorxl38@gmail.com" },
    { id: "mem-2", workspaceId: "ws-1", userId: "usr-2", role: "ADMIN", name: "Carla Souza", email: "carla.gerente@orcaflow.com" },
    { id: "mem-3", workspaceId: "ws-1", userId: "usr-3", role: "MEMBER", name: "João Pedro", email: "tecnico.joao@orcaflow.com" },
    { id: "mem-4", workspaceId: "ws-2", userId: "usr-1", role: "OWNER", name: "Vítor Mendes", email: "vitorxl38@gmail.com" },
  ],
  clients: [
    { id: "cli-1", name: "Condomínio Alvorada", phone: "(11) 99112-2334", email: "sindico@condominioalvorada.com", address: "Alameda Santos, 1420 - Cerqueira César, São Paulo - SP", workspaceId: "ws-1" },
    { id: "cli-2", name: "Clínica OdontoCare", phone: "(11) 98822-4455", email: "dra.silvia@odontocare.com.br", address: "Rua Vergueiro, 2200 - Vila Mariana, São Paulo - SP", workspaceId: "ws-1" },
    { id: "cli-3", name: "Startup FinTech Pop", phone: "(21) 97755-6611", email: "direcao@fintechpop.com.br", address: "Av. Rio Branco, 50 - Centro, Rio de Janeiro - RJ", workspaceId: "ws-2" }
  ],
  tokens: [
    { id: "tok-1", code: "ORCA-VITOR-VIP-99", email: "vitor.admin@orcaflow.com", emailLock: "vitor.admin@orcaflow.com", status: "ACTIVE", createdAt: "2026-05-28T12:00:00Z", usedBy: "" },
    { id: "tok-2", code: "ORCA-5573-A9", email: "", emailLock: "", status: "ACTIVE", createdAt: "2026-05-28T12:00:00Z", usedBy: "" },
    { id: "tok-3", code: "ORCA-REDE-LOCAL", email: "", emailLock: "", status: "ACTIVE", createdAt: "2026-05-28T13:00:00Z", usedBy: "" }
  ] as any[],
  budgets: [
    {
      id: "orc-1",
      workspaceId: "ws-1",
      number: "ORC-2026-001",
      clientName: "Condomínio Alvorada",
      clientPhone: "(11) 99112-2334",
      clientEmail: "sindico@condominioalvorada.com",
      clientAddress: "Alameda Santos, 1420 - Cerqueira César, São Paulo - SP",
      status: "APPROVED",
      discountType: "PERCENTAGE",
      discountValue: 5,
      subtotal: 4800,
      total: 4560,
      observations: "Incluso materiais certificados com selo do INMETRO e garantia estrutural de 12 meses. O início dos trabalhos dar-se-á em até 2 dias úteis após assinatura deste contrato.",
      validityDays: 15,
      paymentTerms: "Sinal de 50% no Pix e saldo restante em até 3x no boleto",
      nicheTemplate: "Eletricista & Automação",
      providerSignature: "Vítor Mendes - Solares Soluções",
      clientSignature: "STYLUS-DRAWN-SIGNATURE-ALVORADA-2026",
      clientSignatureName: "Marcos Aurelio (Síndico)",
      clientSignatureDate: "2026-05-25",
      paymentLink: "https://mpago.la/mock-pay-orc-1",
      createdAt: "2026-05-20T14:30:00Z",
      updatedAt: "2026-05-25T10:15:00Z",
      items: [
        { id: "item-1a", description: "Substituição de todo cabeamento do barramento elétrico central (fios de 16mm antichama)", quantity: 1, unitPrice: 2200, discount: 0 },
        { id: "item-1b", description: "Instalação de DRs (Disjuntor Diferencial Residual) trifásicos Siemens de segurança na casa de força", quantity: 2, unitPrice: 650, discount: 0 },
        { id: "item-1c", description: "Mapeamento técnico de aquecimento de carga por termografia computadorizada", quantity: 1, unitPrice: 1300, discount: 0 }
      ]
    },
    {
      id: "orc-2",
      workspaceId: "ws-1",
      number: "ORC-2026-002",
      clientName: "Clínica OdontoCare",
      clientPhone: "(11) 98822-4455",
      clientEmail: "dra.silvia@odontocare.com.br",
      clientAddress: "Rua Vergueiro, 2200 - Vila Mariana, São Paulo - SP",
      status: "PENDING",
      discountType: "FIXED",
      discountValue: 150,
      subtotal: 1850,
      total: 1700,
      observations: "Todos os serviços elétricos seguem estritamente a NBR 5410 de instalações de baixa tensão. Não cobrimos imprevistos estruturais internos pré-existentes.",
      validityDays: 10,
      paymentTerms: "À vista via Pix com desconto adicional de pontualidade",
      nicheTemplate: "Eletricista & Automação",
      providerSignature: "Vítor Mendes",
      clientSignature: "",
      clientSignatureName: "",
      clientSignatureDate: "",
      paymentLink: "https://mpago.la/mock-pay-orc-2",
      createdAt: "2026-05-27T09:00:00Z",
      updatedAt: "2026-05-27T09:12:00Z",
      items: [
        { id: "item-2a", description: "Infraestrutura dedicada de tomadas elétricas de segurança de 20A para sala odontológica", quantity: 5, unitPrice: 220, discount: 0 },
        { id: "item-2b", description: "Balanceamento elétrico fase-neutro no QDG da ala clínica", quantity: 1, unitPrice: 750, discount: 0 }
      ]
    },
    {
      id: "orc-3",
      workspaceId: "ws-2",
      number: "ORC-2026-003",
      clientName: "Startup FinTech Pop",
      clientPhone: "(21) 97755-6611",
      clientEmail: "direcao@fintechpop.com.br",
      clientAddress: "Av. Rio Branco, 50 - Centro, Rio de Janeiro - RJ",
      status: "IN_PROGRESS",
      discountType: "PERCENTAGE",
      discountValue: 0,
      subtotal: 12500,
      total: 12500,
      observations: "Desenvolvimento de brandbook completo, manual de aplicação visual, design de interface Figma (desktop e mobile) para 12 telas e prototipação interativa das jornadas.",
      validityDays: 20,
      paymentTerms: "50% entrada, 25% na entrega das telas principais e 25% na entrega final",
      nicheTemplate: "Design & Agência Digital",
      providerSignature: "Pixel Studio",
      clientSignature: "STYLUS-POP-FOUNDER-2026",
      clientSignatureName: "Rodrigo Brandão",
      clientSignatureDate: "2026-05-26",
      paymentLink: "https://stripe.com/mock-pay-orc-3",
      createdAt: "2026-05-24T11:00:00Z",
      updatedAt: "2026-05-26T16:00:00Z",
      items: [
        { id: "item-3a", description: "Design de Identidade Visual Corporativa Premium (Logotipo, Tipografia, Cores, Conceito)", quantity: 1, unitPrice: 4500, discount: 0 },
        { id: "item-3b", description: "Design de Interface do Usuário (Design Digital Figma - App Mobile & Dashboard)", quantity: 12, unitPrice: 500, discount: 10 },
        { id: "item-3c", description: "Sessão de Alinhamento Criativo e 3 rodadas de refinamento estrutural", quantity: 1, unitPrice: 2000, discount: 0 }
      ]
    }
  ],
  services: [
    { id: "srv-1", workspaceId: "ws-1", description: "Instalação Completa de Chuveiro Elétrico de Alta Potência", unitPrice: 180 },
    { id: "srv-2", workspaceId: "ws-1", description: "Substituição preventiva de disjuntor geral de segurança", unitPrice: 240 },
    { id: "srv-3", workspaceId: "ws-1", description: "Mapeamento elétrico termográfico preventivo", unitPrice: 450 },
    { id: "srv-4", workspaceId: "ws-2", description: "Design de Logotipo Vetorial e Identidade Cromática", unitPrice: 1500 },
    { id: "srv-5", workspaceId: "ws-2", description: "Design de Interface UI Figma de Tela Otimizada", unitPrice: 500 }
  ],
  subscriptions: [
    { id: "sub-1", userId: "usr-1", plan: "BUSINESS", status: "ACTIVE", nextBilling: "2026-06-28" }
  ],
  saasMetrics: {
    mrr: 18450,
    subscribers: 154,
    churnRate: 2.1,
    conversionRate: 14.8,
    budgetCount: 1408,
    revenueHistory: [
      { month: "Jan", value: 11200 },
      { month: "Fev", value: 12800 },
      { month: "Mar", value: 14100 },
      { month: "Abr", value: 16500 },
      { month: "Mai", value: 18450 },
    ],
    planDistribution: [
      { name: "Gratuito", count: 850, color: "#94a3b8" },
      { name: "Pro", count: 120, color: "#3b82f6" },
      { name: "Business", count: 34, color: "#8b5cf6" },
    ],
    nicheDistribution: [
      { niche: "Construção & Reforma", count: 412 },
      { niche: "Eletricista & Automação", count: 310 },
      { niche: "Design & Freelancers", count: 285 },
      { niche: "Encanador & Hidráulico", count: 180 },
      { niche: "Tecnologia & Consultoria", count: 120 },
      { niche: "Estética & Eventos", count: 101 },
    ]
  },
  aiSuggestions: {
    marketRates: [
      { item: "Eletricista (Ponto de Luz/Tomada)", average: "R$ 80 - R$ 150", detail: "Mais caro em capitais. Inclui quebra e fixação da caixinha." },
      { item: "Troca de Disjuntor Geral", average: "R$ 150 - R$ 300", detail: "Considerar balanceamento elétrico." },
      { item: "Projeto de Logo + Identidade Visual", average: "R$ 1.500 - R$ 5.000", detail: "Agências costumam cobrar mais" },
      { item: "Instalação de Chuveiro Comum", average: "R$ 90 - R$ 180", detail: "Troca de fiação pontual pode acrescer valor." }
    ]
  }
};

// DB Persistence Helpers
function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf-8");
  } catch (err) {
    console.error("Error persisting database to disk:", err);
  }
}

function loadDb() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const content = fs.readFileSync(DB_FILE, "utf-8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        if (parsed.users) db.users = parsed.users;
        if (parsed.workspaces) db.workspaces = parsed.workspaces;
        if (parsed.workspaceMembers) db.workspaceMembers = parsed.workspaceMembers;
        if (parsed.clients) db.clients = parsed.clients;
        if (parsed.tokens) db.tokens = parsed.tokens;
        if (parsed.budgets) db.budgets = parsed.budgets;
        if (parsed.services) db.services = parsed.services;
        if (parsed.subscriptions) db.subscriptions = parsed.subscriptions;
        if (parsed.saasMetrics) db.saasMetrics = parsed.saasMetrics;
        console.log("[OrcaFlow Core] Database reloaded from disk persistence.");
      }
    } else {
      // First run save default DB
      saveDb();
    }
  } catch (err) {
    console.error("Error loading database from disk:", err);
  }
}

// Invoke load immediately on launch
loadDb();

// Lazy initialization of Gemini Client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY") {
      geminiClient = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      console.log("Gemini API Client initialized successfully.");
    } else {
      console.log("No valid GEMINI_API_KEY env variable found. Using fallback mock dynamic generator.");
    }
  }
  return geminiClient;
}

// Current logged in Simulation user (State maintained per platform session)
let currentUser: any = null;
let currentWorkspace: any = null;

// API Routes - Auto Persistence Middleware
app.use((req, res, next) => {
  res.on("finish", () => {
    if (["POST", "PUT", "DELETE"].includes(req.method) && res.statusCode >= 200 && res.statusCode < 300) {
      if (!req.path.startsWith("/api/gemini/")) {
        console.log(`[OrcaFlow Persistence] Auto-saving database state following: ${req.method} ${req.path}`);
        saveDb();
      }
    }
  });
  next();
});

// Authentication APIs
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "E-mail e senha são obrigatórios" });
  }
  
  const found = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (found) {
    // Check password
    const userPass = found.password || "vitor123"; // fallback to standard password
    if (userPass !== password) {
      return res.status(401).json({ error: "Senha incorreta para esta conta" });
    }

    currentUser = found;
    // Auto-switch to their workspace
    const ws = db.workspaces.find(w => w.ownerId === currentUser.id);
    if (ws) {
      currentWorkspace = ws;
    }
    return res.json({ success: true, user: currentUser, workspace: currentWorkspace, isNew: false });
  }

  return res.status(404).json({ error: "Esta conta de e-mail não está cadastrada. Use um Token de Inscrição para se cadastrar primeiro!" });
});

app.post("/api/auth/register", (req, res) => {
  const { email, password, name, token } = req.body;
  
  if (!email || !password || !name || !token) {
    return res.status(400).json({ error: "Todos os campos (E-mail, Senha, Nome e Token de Ativação) são obrigatórios" });
  }

  // 1. Verify if user already exists
  const userExists = db.users.some(u => u.email.toLowerCase() === email.toLowerCase());
  if (userExists) {
    return res.status(400).json({ error: "Este e-mail já está cadastrado no sistema. Faça Login!" });
  }

  // 2. Locate active Token
  const foundTokenIndex = db.tokens.findIndex(t => t.code.trim().toUpperCase() === token.trim().toUpperCase() && t.status === "ACTIVE");
  if (foundTokenIndex === -1) {
    return res.status(400).json({ error: "O Token de Ativação digitado é inválido, expirou ou já foi usado por outro colaborador. Fale com Victor!" });
  }

  const actToken = db.tokens[foundTokenIndex];

  // 3a. Check if token has expired
  if (actToken.expiresAt && new Date(actToken.expiresAt) < new Date()) {
    return res.status(400).json({ error: "Este Token de Ativação comercial expirou. Solicite um novo código a Victor!" });
  }

  // 3. If token restricts email, make sure it matches
  if (actToken.email && actToken.email.toLowerCase() !== email.toLowerCase()) {
    return res.status(400).json({ error: `Este Token é restrito e exclusivo para o e-mail: ${actToken.email}` });
  }

  // 4. Register new user
  const newUser = {
    id: `usr-${Date.now()}`,
    email: email.toLowerCase(),
    name: name,
    password: password,
    role: "OWNER",
    isSuperAdmin: false,
    plan: "BUSINESS" as any // Auto business level feature set
  };

  db.users.push(newUser);
  currentUser = newUser;

  // Mark token as used
  db.tokens[foundTokenIndex].status = "USED";
  db.tokens[foundTokenIndex].usedBy = newUser.id;

  // Auto create workspace
  const newWs = {
    id: `ws-${Date.now()}`,
    name: `Empresa de ${newUser.name}`,
    niche: "Serviços Gerais",
    phone: "",
    email: newUser.email,
    address: "",
    logoUrl: "",
    brandColor: "#3b82f6",
    pixKey: "",
    ownerId: newUser.id
  };
  db.workspaces.push(newWs);
  currentWorkspace = newWs;

  // Add workspace member link
  db.workspaceMembers.push({
    id: `mem-${Date.now()}`,
    workspaceId: newWs.id,
    userId: newUser.id,
    role: "OWNER" as any,
    name: newUser.name,
    email: newUser.email
  });

  // Persist save immediately
  saveDb();

  return res.json({ success: true, user: currentUser, workspace: currentWorkspace, isNew: true });
});

app.get("/api/auth/me", (req, res) => {
  if (!currentUser) {
    return res.json({ user: null, workspace: null, subscription: null });
  }
  const currentSub = db.subscriptions.find(s => s.userId === currentUser.id);
  res.json({
    user: currentUser,
    workspace: currentWorkspace,
    subscription: currentSub || { id: "sub-none", userId: currentUser.id, plan: "FREE", status: "ACTIVE", nextBilling: "N/A" }
  });
});

// Workspaces / Multi-empresa APIs
app.get("/api/workspaces", (req, res) => {
  if (!currentUser) {
    return res.json([]);
  }
  // Let's filter workspaces where the user has membership
  const myMemberWsIds = db.workspaceMembers
    .filter(m => m.userId === currentUser.id)
    .map(m => m.workspaceId);
  const myWorkspaces = db.workspaces.filter(w => myMemberWsIds.includes(w.id));
  res.json(myWorkspaces);
});

app.post("/api/workspaces", (req, res) => {
  if (!currentUser) {
    return res.status(401).json({ error: "Sessão expirada. Faça login novamente." });
  }
  const { name, niche, phone, email, address, brandColor, pixKey } = req.body;
  if (!name || !niche) {
    return res.status(400).json({ error: "Nome e nicho são obrigatórios" });
  }

  const newWs = {
    id: `ws-${Date.now()}`,
    name,
    niche,
    phone: phone || "",
    email: email || "",
    address: address || "",
    logoUrl: "",
    brandColor: brandColor || "#3b82f6",
    pixKey: pixKey || "",
    ownerId: currentUser.id
  };

  db.workspaces.push(newWs);
  db.workspaceMembers.push({
    id: `mem-${Date.now()}`,
    workspaceId: newWs.id,
    userId: currentUser.id,
    role: "OWNER" as any,
    name: currentUser.name,
    email: currentUser.email
  });

  currentWorkspace = newWs;
  res.status(201).json(newWs);
});

app.put("/api/workspaces/:id", (req, res) => {
  const { id } = req.params;
  const { name, niche, phone, email, address, logoUrl, brandColor, pixKey } = req.body;

  const idx = db.workspaces.findIndex(w => w.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Empresa não encontrada" });
  }

  db.workspaces[idx] = {
    ...db.workspaces[idx],
    name: name || db.workspaces[idx].name,
    niche: niche || db.workspaces[idx].niche,
    phone: phone !== undefined ? phone : db.workspaces[idx].phone,
    email: email !== undefined ? email : db.workspaces[idx].email,
    address: address !== undefined ? address : db.workspaces[idx].address,
    logoUrl: logoUrl !== undefined ? logoUrl : db.workspaces[idx].logoUrl,
    brandColor: brandColor !== undefined ? brandColor : db.workspaces[idx].brandColor,
    pixKey: pixKey !== undefined ? pixKey : db.workspaces[idx].pixKey,
  };

  if (currentWorkspace && currentWorkspace.id === id) {
    currentWorkspace = db.workspaces[idx];
  }

  res.json(db.workspaces[idx]);
});

// Set active workspce
app.post("/api/workspaces/select", (req, res) => {
  const { workspaceId } = req.body;
  const ws = db.workspaces.find(w => w.id === workspaceId);
  if (!ws) {
    return res.status(404).json({ error: "Workspace não encontrado" });
  }
  currentWorkspace = ws;
  res.json({ success: true, workspace: currentWorkspace });
});

// Workspace Members / Equipe e permissões API
app.get("/api/workspaces/:id/members", (req, res) => {
  const { id } = req.params;
  const members = db.workspaceMembers.filter(m => m.workspaceId === id);
  res.json(members);
});

app.post("/api/workspaces/:id/members", (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  if (!name || !email) {
    return res.status(400).json({ error: "Nome e E-mail são necessários" });
  }

  // Check limits for Free Plan (limit to 1 member, Business plan starts at unlimited etc)
  const isBusiness = currentUser.plan === "BUSINESS";
  const currentMembersCount = db.workspaceMembers.filter(m => m.workspaceId === id).length;
  if (!isBusiness && currentMembersCount >= 3) {
    return res.status(403).json({ error: "Limite do plano atingido. Assine o plano Business para adicionar equipe ilimitadamente." });
  }

  const newMember = {
    id: `mem-${Date.now()}`,
    workspaceId: id,
    userId: `usr-${Date.now()}`, // Simulated user
    name,
    email,
    role: role || "MEMBER",
    joinedAt: new Date().toISOString()
  };

  db.workspaceMembers.push(newMember);
  res.status(201).json(newMember);
});

app.delete("/api/workspace-members/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.workspaceMembers.findIndex(m => m.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Membro não encontrado" });
  }
  const deleted = db.workspaceMembers.splice(idx, 1)[0];
  res.json({ success: true, deleted });
});

// Service Catalog APIs
app.get("/api/workspaces/:workspaceId/services", (req, res) => {
  const { workspaceId } = req.params;
  const services = db.services.filter(s => s.workspaceId === workspaceId);
  res.json(services);
});

app.post("/api/workspaces/:workspaceId/services", (req, res) => {
  const { workspaceId } = req.params;
  const { description, unitPrice, category, code, obs } = req.body;
  if (!description) {
    return res.status(400).json({ error: "Descrição do serviço é obrigatória" });
  }
  const newService = {
    id: `srv-${Date.now()}`,
    workspaceId,
    description,
    unitPrice: parseFloat(unitPrice) || 0,
    category: category || "Serviço",
    code: code || "",
    obs: obs || ""
  };
  db.services.push(newService);
  saveDb();
  res.status(201).json(newService);
});

app.put("/api/services/:id", (req, res) => {
  const { id } = req.params;
  const { description, unitPrice, category, code, obs } = req.body;
  const idx = db.services.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Item de catálogo de serviço não encontrado" });
  }
  db.services[idx] = {
    ...db.services[idx],
    description: description !== undefined ? description : db.services[idx].description,
    unitPrice: unitPrice !== undefined ? parseFloat(unitPrice) || 0 : db.services[idx].unitPrice,
    category: category !== undefined ? category : (db.services[idx].category || "Serviço"),
    code: code !== undefined ? code : (db.services[idx].code || ""),
    obs: obs !== undefined ? obs : (db.services[idx].obs || "")
  };
  saveDb();
  res.json(db.services[idx]);
});

app.delete("/api/services/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.services.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Serviço não encontrado" });
  }
  const deleted = db.services.splice(idx, 1)[0];
  res.json({ success: true, deleted });
});

// Client Management APIs (Persistent explicit registrations + dynamic derivations)
app.get("/api/workspaces/:workspaceId/clients", (req, res) => {
  const { workspaceId } = req.params;

  // 1. Fetch explicitly saved client entities
  const explicitClients = db.clients.filter(c => c.workspaceId === workspaceId);

  // 2. Derive clients from existing budgets for backward compatibility
  const budgetClientsMap: Record<string, typeof explicitClients[0]> = {};
  db.budgets
    .filter(b => b.workspaceId === workspaceId)
    .forEach(b => {
      budgetClientsMap[b.clientName.toLowerCase()] = {
        id: `Derived-${b.id}`,
        name: b.clientName,
        phone: b.clientPhone,
        email: b.clientEmail || "",
        address: b.clientAddress || "",
        workspaceId
      };
    });

  // 3. Combine databases, preferring explicit registrations
  const combined = [...explicitClients];
  Object.values(budgetClientsMap).forEach(bc => {
    if (!combined.some(c => c.name.toLowerCase() === bc.name.toLowerCase())) {
      combined.push(bc);
    }
  });

  res.json(combined);
});

app.post("/api/workspaces/:workspaceId/clients", (req, res) => {
  const { workspaceId } = req.params;
  const { name, phone, email, address } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: "Nome e WhatsApp do cliente são obrigatórios." });
  }

  // Check user name duplication in this workspace database
  const exists = db.clients.some(c => c.workspaceId === workspaceId && c.name.toLowerCase() === name.toLowerCase());
  if (exists) {
    return res.status(400).json({ error: "Já existe um cliente com este nome registrado neste workspace." });
  }

  const newClient = {
    id: `cli-${Date.now()}`,
    name: name.trim(),
    phone: phone.trim(),
    email: (email || "").trim(),
    address: (address || "").trim(),
    workspaceId
  };

  db.clients.push(newClient);
  saveDb();
  res.status(201).json(newClient);
});

// Delete Client (Removes explicit profile + cleans up associated budgets)
app.delete("/api/workspaces/:workspaceId/clients/:clientName", (req, res) => {
  const { workspaceId, clientName } = req.params;
  const decodedClientName = decodeURIComponent(clientName);
  
  // 1. Clean up from explicit database
  db.clients = db.clients.filter(c => !(c.workspaceId === workspaceId && c.name.toLowerCase() === decodedClientName.toLowerCase()));

  // 2. Clean up from budgets database
  const initialLength = db.budgets.length;
  db.budgets = db.budgets.filter(b => !(b.workspaceId === workspaceId && b.clientName.toLowerCase() === decodedClientName.toLowerCase()));
  const deletedCount = initialLength - db.budgets.length;

  saveDb();
  res.json({ success: true, deletedCount });
});

// Superadmin Token Management APIs
app.get("/api/saas/tokens", (req, res) => {
  res.json(db.tokens);
});

app.post("/api/saas/tokens", (req, res) => {
  const { code, email, durationDays } = req.body;
  const newCode = code ? code.trim().toUpperCase() : `ORCA-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;
  
  let expiresAt: string | null = null;
  if (durationDays && parseInt(durationDays) > 0) {
    const days = parseInt(durationDays);
    const expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + days);
    expiresAt = expireDate.toISOString();
  }

  const brandNewToken = {
    id: `tok-${Date.now()}`,
    code: newCode,
    email: email ? email.toLowerCase().trim() : "",
    emailLock: email ? email.toLowerCase().trim() : "",
    status: "ACTIVE" as const,
    createdAt: new Date().toISOString(),
    expiresAt,
    durationDays: durationDays ? parseInt(durationDays) : null,
    usedBy: ""
  };

  db.tokens.push(brandNewToken);
  saveDb();
  res.status(201).json(brandNewToken);
});

app.delete("/api/saas/tokens/:id", (req, res) => {
  const { id } = req.params;
  db.tokens = db.tokens.filter(t => t.id !== id);
  saveDb();
  res.json({ success: true });
});

// Budgets APIs
app.get("/api/budgets", (req, res) => {
  if (!currentWorkspace) {
    return res.json([]);
  }
  const workspaceId = currentWorkspace.id;
  const budgets = db.budgets.filter(b => b.workspaceId === workspaceId);
  res.json(budgets);
});

app.post("/api/budgets", (req, res) => {
  if (!currentWorkspace) {
    return res.status(401).json({ error: "Nenhuma empresa selecionada ou ativa. Faça login." });
  }
  const {
    clientName, clientPhone, clientEmail, clientAddress,
    items, discountType, discountValue, observations,
    validityDays, paymentTerms, status, brandColor, customNiche,
    providerSignature, clientSignature, clientSignatureName, clientSignatureDate
  } = req.body;

  if (!clientName || !clientPhone) {
    return res.status(400).json({ error: "Nome do cliente e telefone são obrigatórios" });
  }

  // Calculo automático backend
  const itemsList = items || [];
  const subtotal = itemsList.reduce((acc: number, curr: any) => {
    const qty = parseFloat(curr.quantity) || 0;
    const price = parseFloat(curr.unitPrice) || 0;
    return acc + (qty * price);
  }, 0);

  let discount = parseFloat(discountValue) || 0;
  let total = subtotal;
  if (discountType === "PERCENTAGE") {
    total = subtotal - (subtotal * (discount / 100));
  } else {
    total = subtotal - discount;
  }
  if (total < 0) total = 0;

  // Generate standard unique budget sequential number
  const prefix = "ORC";
  const numYear = new Date().getFullYear();
  const sequence = String(db.budgets.length + 1).padStart(3, "0");
  const budgetNumber = `${prefix}-${numYear}-${sequence}`;

  const id = `orc-${Date.now()}`;
  const newBudget = {
    id,
    workspaceId: currentWorkspace.id,
    number: budgetNumber,
    clientName,
    clientPhone,
    clientEmail: clientEmail || "",
    clientAddress: clientAddress || "",
    items: itemsList.map((item: any) => ({
      id: item.id || `item-${Math.random().toString(36).substring(5)}`,
      description: item.description,
      quantity: parseFloat(item.quantity) || 1,
      unitPrice: parseFloat(item.unitPrice) || 0,
      discount: parseFloat(item.discount) || 0
    })),
    discountType: discountType || "PERCENTAGE",
    discountValue: discount,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    observations: observations || "",
    validityDays: parseInt(validityDays) || 15,
    paymentTerms: paymentTerms || "À vista no PIX",
    status: status || "PENDING",
    nicheTemplate: customNiche || currentWorkspace.niche,
    providerSignature: providerSignature || currentWorkspace.name,
    clientSignature: clientSignature || "",
    clientSignatureName: clientSignatureName || "",
    clientSignatureDate: clientSignatureDate || "",
    paymentLink: `https://orcaflow.com/pagar/${id}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.budgets.push(newBudget);
  res.status(201).json(newBudget);
});

// Duplicate Budget
app.post("/api/budgets/:id/duplicate", (req, res) => {
  const { id } = req.params;
  const found = db.budgets.find(b => b.id === id);
  if (!found) {
    return res.status(404).json({ error: "Orçamento não encontrado" });
  }

  const prefix = "ORC";
  const numYear = new Date().getFullYear();
  const sequence = String(db.budgets.length + 1).padStart(3, "0");
  const budgetNumber = `${prefix}-${numYear}-${sequence}`;

  const duplicated = {
    ...found,
    id: `orc-${Date.now()}`,
    number: budgetNumber,
    status: "PENDING" as any,
    clientSignature: "",
    clientSignatureName: "",
    clientSignatureDate: "",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    items: found.items.map(item => ({
      ...item,
      id: `item-${Math.random().toString(36).substring(5)}`
    }))
  };

  db.budgets.push(duplicated);
  res.status(201).json(duplicated);
});

// Update budget status or details
app.put("/api/budgets/:id", (req, res) => {
  const { id } = req.params;
  const budgetIdx = db.budgets.findIndex(b => b.id === id);
  if (budgetIdx === -1) {
    return res.status(404).json({ error: "Orçamento não encontrado" });
  }

  const existing = db.budgets[budgetIdx];
  const {
    clientName, clientPhone, clientEmail, clientAddress,
    items, discountType, discountValue, observations,
    validityDays, paymentTerms, status, customNiche,
    providerSignature, clientSignature, clientSignatureName, clientSignatureDate
  } = req.body;

  // Reprocess calculations
  let subtotal = existing.subtotal;
  let total = existing.total;

  let itemsList = existing.items;
  if (items) {
    itemsList = items.map((item: any) => ({
      id: item.id || `item-${Math.random().toString(36).substring(5)}`,
      description: item.description,
      quantity: parseFloat(item.quantity) || 1,
      unitPrice: parseFloat(item.unitPrice) || 0,
      discount: parseFloat(item.discount) || 0
    }));

    subtotal = itemsList.reduce((acc: number, curr: any) => {
      const qty = parseFloat(curr.quantity) || 0;
      const price = parseFloat(curr.unitPrice) || 0;
      return acc + (qty * price);
    }, 0);
  }

  const discType = discountType || existing.discountType;
  const discValue = discountValue !== undefined ? parseFloat(discountValue) : existing.discountValue;

  if (items || discountType || discountValue !== undefined) {
    if (discType === "PERCENTAGE") {
      total = subtotal - (subtotal * (discValue / 100));
    } else {
      total = subtotal - discValue;
    }
  }

  db.budgets[budgetIdx] = {
    ...existing,
    clientName: clientName || existing.clientName,
    clientPhone: clientPhone || existing.clientPhone,
    clientEmail: clientEmail !== undefined ? clientEmail : existing.clientEmail,
    clientAddress: clientAddress !== undefined ? clientAddress : existing.clientAddress,
    items: itemsList,
    discountType: discType,
    discountValue: discValue,
    subtotal: Math.round(subtotal * 100) / 100,
    total: Math.round(total * 100) / 100,
    observations: observations !== undefined ? observations : existing.observations,
    validityDays: validityDays !== undefined ? parseInt(validityDays) : existing.validityDays,
    paymentTerms: paymentTerms || existing.paymentTerms,
    status: status || existing.status,
    nicheTemplate: customNiche || existing.nicheTemplate,
    providerSignature: providerSignature !== undefined ? providerSignature : existing.providerSignature,
    clientSignature: clientSignature !== undefined ? clientSignature : existing.clientSignature,
    clientSignatureName: clientSignatureName !== undefined ? clientSignatureName : existing.clientSignatureName,
    clientSignatureDate: clientSignatureDate !== undefined ? clientSignatureDate : existing.clientSignatureDate,
    updatedAt: new Date().toISOString()
  };

  res.json(db.budgets[budgetIdx]);
});

app.delete("/api/budgets/:id", (req, res) => {
  const { id } = req.params;
  const idx = db.budgets.findIndex(b => b.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: "Orçamento não encontrado" });
  }
  const deleted = db.budgets.splice(idx, 1)[0];
  res.json({ success: true, deleted });
});

// Gemini AI Assistant Endpoints
app.post("/api/gemini/suggest-description", async (req, res) => {
  const { promptText, niche } = req.body;
  if (!promptText) {
    return res.status(400).json({ error: "Insira uma descrição inicial do serviço para a IA aprimorar." });
  }

  const prompt = `Você é o Copiloto de Inteligência Artificial do OrçaFlow, um sistema SaaS premium focado na geração rápida e altamente profissional de orçamentos.
O profissional atua no nicho de: "${niche || 'Geral/Freelancer'}".
A descrição do serviço informada pelo usuário é: "${promptText}".

Escreva uma descrição polida, altamente profissional, técnica e detalhada para colocar nos itens do orçamento de serviço.
Escreva de forma sucinta, porém elegante e que passe alta credibilidade técnica ao cliente final (em português do brasil).
Evite formatação como markdown muito agressivo. Escreva um parágrafo limpo e profissional de até 4 linhas.`;

  try {
    const aiClient = getGeminiClient();
    if (aiClient) {
      console.log("Generating AI description with model gemini-3.5-flash...");
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      return res.json({ suggestion: response.text?.trim() });
    } else {
      // Return beautiful high-quality domain mock fallback
      console.log("Using Mock generator fallback for suggest description");
      const fallbacks: { [key: string]: string } = {
        "eletricista": "Execução técnica de infraestrutura elétrica dedicada conforme NBR 5410, incluindo passagem de cabos antichama homologados pelo INMETRO, balanceamento minucioso dos circuitos para eficiência energética e instalação de disjuntores de segurança contra picos de tensão e curto-circuitos.",
        "design": "Consultoria e concepção de posicionamento visual estratégico com entrega de protótipo de alta fidelidade interativo no Figma. Inclui estudo cromático avançado, manual simplificado de aplicação e exportação limpa de arquivos vetoriais otimizados.",
        "encanador": "Localização subterrânea e reparo de infiltrações ocultas por geofonamento digital acústico de alta precisão. Substituição de conexões danificadas com sistema termofusor de alta fusão de canos de alta pressão Tigre, assegurando zero umidade residual."
      };
      const key = (niche || "").toLowerCase();
      let match = fallbacks["design"];
      if (key.includes("eletri") || key.includes("eletr")) match = fallbacks["eletricista"];
      if (key.includes("encan") || key.includes("hidr")) match = fallbacks["encanador"];
      return res.json({
        suggestion: `${promptText} - Executado com rigor técnico, utilizando ferramentas profissionais e insumos com certificações de qualidade nacionais, com garantia contra problemas pós-instalação.`,
        isMock: true
      });
    }
  } catch (error: any) {
    console.error("Gemini suggestion error:", error);
    res.json({ suggestion: "Serviço altamente otimizado com materiais selecionados de primeira linha, fiação adequada, alinhamento técnico e acabamento profissional premium com 1 ano de garantia." });
  }
});

// IA melhora textos do orçamento
app.post("/api/gemini/improve-text", async (req, res) => {
  const { text, goal } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Texto do orçamento para otimização é obrigatório." });
  }

  const prompt = `Melhore o seguinte termo/observação/texto de orçamento para torná-lo mais ${goal || 'formal e convincente'}:
"${text}"
O sistema SaaS chama-se OrçaFlow e se orgulha de fechar contratos 3x mais rápido. Escreva uma versão irresistível, clara e objetiva para o cliente em português brasileiro em no máximo 3 frases.`;

  try {
    const aiClient = getGeminiClient();
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt
      });
      return res.json({ improvedText: response.text?.trim() });
    } else {
      return res.json({
        improvedText: `${text} — Compromisso incondicional com a pontualidade, suporte técnico pós-atendimento agilizado e materiais de qualidade certificada internacionalmente.`,
        isMock: true
      });
    }
  } catch (err) {
    res.json({ improvedText: `${text} (Refinado profissionalmente para obter 100% de satisfação do cliente e garantia estendida).` });
  }
});

// IA cria modelo automático por nicho
app.post("/api/gemini/niche-template", async (req, res) => {
  const { niche } = req.body;
  if (!niche) {
    return res.status(400).json({ error: "Nicho é necessário para sugerir modelo." });
  }

  const prompt = `Crie uma lista em formato JSON de 3 itens típicos de serviços no nicho de "${niche}" para um orçamento profissional.
Siga o seguinte formato schema rigorosamente:
[
  {"description": "nome curto do serviço com termos técnicos", "quantity": 1, "unitPrice": 150}
]
Retorne APENAS o array JSON limpo, sem markdown, tags ou blocos adicionais.`;

  try {
    const aiClient = getGeminiClient();
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                description: { type: Type.STRING },
                quantity: { type: Type.NUMBER },
                unitPrice: { type: Type.NUMBER }
              },
              required: ["description", "quantity", "unitPrice"]
            }
          }
        }
      });
      const parsed = JSON.parse(response.text || "[]");
      return res.json({ items: parsed });
    } else {
      throw new Error("No Gemini configured, using mockup database");
    }
  } catch (error) {
    // Elegant fallbacks depending on niche
    const lowercase = niche.toLowerCase();
    let sample = [
      { description: "Mão de obra e projeto técnico detalhado de instalação", quantity: 1, unitPrice: 850 },
      { description: "Disjuntores temomagnéticos adicionais homologados", quantity: 3, unitPrice: 90 },
      { description: "Garantia técnica assistida e monitoramento pós-entrega", quantity: 1, unitPrice: 300 }
    ];

    if (lowercase.includes("paint") || lowercase.includes("pint") || lowercase.includes("refor")) {
      sample = [
        { description: "Preparação de gesso, selador acrílico e correção de fissuras com lixamento mecânico", quantity: 1, unitPrice: 1200 },
        { description: "Pintura de teto e paredes com tinta acrílica premium acetinada", quantity: 2, unitPrice: 650 },
        { description: "Mão de obra especializada de acabamento fino", quantity: 1, unitPrice: 950 }
      ];
    } else if (lowercase.includes("design") || lowercase.includes("freela") || lowercase.includes("agenc") || lowercase.includes("web") || lowercase.includes("program")) {
      sample = [
        { description: "Arquitetura da informação de wireframes interativos de alta fidelidade", quantity: 1, unitPrice: 2200 },
        { description: "Design UI/UX da interface visual personalizada no Figma (Responsivo Desktop/Mobile)", quantity: 5, unitPrice: 600 },
        { description: "Desenvolvimento técnico front-end limpo otimizado para motores de busca", quantity: 1, unitPrice: 3500 }
      ];
    } else if (lowercase.includes("mec") || lowercase.includes("auto") || lowercase.includes("manut")) {
      sample = [
        { description: "Diagnóstico completo computadorizado via scanner eletrônico de última geração", quantity: 1, unitPrice: 250 },
        { description: "Substituição preventiva do kit completo de correia dentada e tensores originais", quantity: 1, unitPrice: 580 },
        { description: "Alinhamento 3D a laser de alta fidelidade e balanceamento fino de eixos", quantity: 2, unitPrice: 95 }
      ];
    }
    return res.json({ items: sample });
  }
});

// SaaS billing APIs (Mock Stripe e Mercado Pago)
app.post("/api/saas/subscribe", (req, res) => {
  const { plan } = req.body;
  if (!plan) {
    return res.status(400).json({ error: "Plano é requerido" });
  }

  currentUser.plan = plan;
  // Update databases
  const subIdx = db.subscriptions.findIndex(s => s.userId === currentUser.id);
  if (subIdx !== -1) {
    db.subscriptions[subIdx].plan = plan;
  } else {
    db.subscriptions.push({
      id: `sub-${Date.now()}`,
      userId: currentUser.id,
      plan: plan,
      status: "ACTIVE",
      nextBilling: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
    });
  }

  // Update master statistics
  db.saasMetrics.subscribers += 1;
  if (plan === "PRO") {
    db.saasMetrics.mrr += 49;
  } else if (plan === "BUSINESS") {
    db.saasMetrics.mrr += 129;
  }

  res.json({
    success: true,
    user: currentUser,
    message: `Plano atualizado com sucesso para ${plan}! A transação foi processada via sandbox da Stripe.`,
    checkoutUrl: `https://stripe.com/mock-checkout-success?plan=${plan}`
  });
});

// Superadmin SaaS metric overview
app.get("/api/saas/admin", (req, res) => {
  // Return operational statistics of the SaaS platform
  res.json({
    metrics: db.saasMetrics,
    users: db.users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      plan: u.plan,
      status: "ACTIVE",
      companyName: db.workspaces.find(w => w.ownerId === u.id)?.name || "Nenhuma registrada",
      createdAt: "2026-05-01"
    })),
    workspaces: db.workspaces.map(w => ({
      id: w.id,
      name: w.name,
      niche: w.niche,
      memberCount: db.workspaceMembers.filter(m => m.workspaceId === w.id).length,
      budgetCount: db.budgets.filter(b => w.id && b.workspaceId === w.id).length
    }))
  });
});

// Delete specific SaaS user
app.delete("/api/saas/users/:id", (req, res) => {
  const { id } = req.params;
  const foundUser = db.users.find(u => u.id === id);
  if (!foundUser) {
    return res.status(404).json({ error: "Usuário não encontrado no sistema." });
  }
  // Safe lockout prevention: guard Vitor or isSuperAdmin users
  if (foundUser.email === "vitorxl38@gmail.com" || foundUser.isSuperAdmin) {
    return res.status(400).json({ error: "Não é permitido excluir o usuário Administrador Master principal." });
  }

  // Remove user
  db.users = db.users.filter(u => u.id !== id);

  // Clean up workspace members / subscriptions
  db.workspaceMembers = db.workspaceMembers.filter(m => m.userId !== id);
  db.subscriptions = db.subscriptions.filter(s => s.userId !== id);

  // If there are workspaces owned by the user, we can clean up
  const userWorkspaces = db.workspaces.filter(w => w.ownerId === id);
  const wsIds = userWorkspaces.map(w => w.id);
  db.workspaces = db.workspaces.filter(w => w.ownerId !== id);
  db.budgets = db.budgets.filter(b => !wsIds.includes(b.workspaceId));

  saveDb();
  res.json({ success: true, message: `Usuário ${foundUser.email} foi excluído do sistema com sucesso.` });
});

// Delete all recorded users except superadmins/Vitor
app.delete("/api/saas/users-all", (req, res) => {
  const initialCount = db.users.length;
  // Retain Victor and super admins
  const adminUsers = db.users.filter(u => u.email === "vitorxl38@gmail.com" || u.isSuperAdmin);
  db.users = adminUsers;

  const adminIds = adminUsers.map(u => u.id);
  db.workspaceMembers = db.workspaceMembers.filter(m => adminIds.includes(m.userId));
  db.subscriptions = db.subscriptions.filter(s => adminIds.includes(s.userId));

  // Remove corresponding non-admin workspaces and their budgets
  db.workspaces = db.workspaces.filter(w => adminIds.includes(w.ownerId));
  const activeWsIds = db.workspaces.map(w => w.id);
  db.budgets = db.budgets.filter(b => activeWsIds.includes(b.workspaceId));

  saveDb();
  res.json({ success: true, message: `${initialCount - adminUsers.length} usuários excluídos com sucesso. Apenas Administradores Master continuam registrados.` });
});

// API helper to test dynamic QR PIX code representation standard
app.get("/api/pix/qr-mock", (req, res) => {
  const { key, amount } = req.query;
  // standard visual representation of PIX payload
  const fallbackKey = key || "financeiro@solaresenergia.com.br";
  const strAmount = amount ? String(amount) : "0.00";
  const payload = `00020101021226580014BR.GOV.BCB.PIX0114${fallbackKey}5204000053039865408${strAmount}5802BR5915ORCAFLOW PLAT6009SAO PAULO62070503***6304CA77`;
  res.json({ payload });
});

// Mount Vite middleware or Static serving depending on env
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, port: 3000, host: "0.0.0.0" },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // Serve index.html for SPA history routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[OrçaFlow Master Core] Server dynamically running on port ${PORT}`);
  });
}

startServer();
