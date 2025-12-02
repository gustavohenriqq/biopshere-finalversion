import React, { useState, useEffect } from "react";
import heroLogin from "./assets/biosphere-login.png";
import heroCadastro from "./assets/biosphere-cadastro.png";

const API_BASE = "http://localhost:3001";


const ROLES = {
  PACIENTE: "PACIENTE",
  MEDICO: "MEDICO",
  BIOMEDICO: "BIOMEDICO",
  ADMIN: "ADMIN", // se quiser tratar admin separado
};

const SCREENS = {
  LOGIN: "LOGIN",
  REGISTER_ROLE: "REGISTER_ROLE",
  REGISTER_CLIENT: "REGISTER_CLIENT",
  REGISTER_FUNC: "REGISTER_FUNC",

  PACIENTE_HOME: "PACIENTE_HOME",
  MEDICO_HOME: "MEDICO_HOME",
  BIOMEDICO_HOME: "BIOMEDICO_HOME",
  ADMIN_HOME: "ADMIN_HOME",

  PROFILE: "PROFILE",
  SCHEDULE: "SCHEDULE",
  HISTORY: "HISTORY",
  LAUDOS: "LAUDOS",
  RESUMO_CONSULTA: "RESUMO_CONSULTA",
  FINANCEIRO_ADMIN: "FINANCEIRO_ADMIN",
  USERS_ADMIN: "USERS_ADMIN",
};

function gerarHorarios() {
  const horas = [];
  for (let h = 8; h <= 18; h++) {
    const hh = String(h).padStart(2, "0");
    horas.push(`${hh}:00`);
  }
  return horas;
}
function ResumoCard({ titulo, valor }) {
  return (
    <div className="card-resumo">
      <p className="card-valor">{valor}</p>
      <p className="card-titulo">{titulo}</p>
    </div>
  );
}

function formatarDataBR(valor) {
  if (!valor) return "";
  // se já vier em "dd/mm/aaaa", só devolve
  if (valor.includes("/") && valor.length === 10) return valor;

  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return valor; // se não der pra converter, não quebra

  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/* ====== APP PRINCIPAL ====== */

export default function App() {
  const [screen, setScreen] = useState(SCREENS.LOGIN);
  const [currentUser, setCurrentUser] = useState({
    nome: "",
    tipo: "",
    email: "",
  });

  const [profile, setProfile] = useState({
    email: "",
    telefone: "",
    senha: "",
    fotoUrl: "",
  });

  const [selectedConsulta, setSelectedConsulta] = useState(null);

  // agendamentos / slots
  const [availableSlots, setAvailableSlots] = useState([
    { id: 1, data: "27/11/2025", hora: "09:00" },
    { id: 2, data: "27/11/2025", hora: "10:00" },
    { id: 3, data: "28/11/2025", hora: "09:30" },
  ]);
  const [agendamentos, setAgendamentos] = useState([]);

    // 🔄 Carregar consultas do backend sempre que o usuário logar/trocar


  // 🔄 Carregar consultas do backend sempre que o usuário logar/trocar
  useEffect(() => {
    async function carregarConsultas() {
      try {
        const token = localStorage.getItem("token");

        const resp = await fetch(`${API_BASE}/consultas`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!resp.ok) {
          console.error("Falha ao buscar consultas", resp.status);
          return;
        }

        const data = await resp.json();
        console.log("🔎 Consultas vindas do backend:", data);

        const normalizados = data.map((c) => {
          const nomeExame =
  c.exame ||
  c.especialidade ||
  c.tipo ||
  c.especialidade_nome || 
  c.nome_exame ||
  "";

          return {
            id: c.id,
            data: c.data,
            hora: c.hora,
            paciente: c.paciente_nome || c.paciente || "",
            exame: nomeExame,
            status: c.status,
            laudoEmitido: !!c.laudoEmitido,
            responsavel: c.profissional_nome || c.responsavel || null,
          };
        });

        setAgendamentos(normalizados);
      } catch (err) {
        console.error("Erro ao carregar consultas", err);
      }
    }

    if (currentUser && currentUser.email) {
      carregarConsultas();
    }
  }, [currentUser]);


  // dados mock de paciente (apenas visual; não é fluxo de envio)
  // const [consultasPaciente] = useState([]); // Removido: usaremos o estado 'agendamentos'
  const [proximaConsulta, setProximaConsulta] = useState(null);
  // em App()
const [examesDisponiveis, setExamesDisponiveis] = useState(0);

// conta quantos laudos o paciente tem
useEffect(() => {
  if (!currentUser || !currentUser.nome) {
    setExamesDisponiveis(0);
    return;
  }

  const qtd = agendamentos.filter(
    (c) =>
      c.paciente === currentUser.nome &&
      c.laudoEmitido
  ).length;

  setExamesDisponiveis(qtd);
}, [agendamentos, currentUser]);


  // 🔄 Encontra a próxima consulta do paciente
  useEffect(() => {
  if (agendamentos.length > 0 && currentUser.tipo === ROLES.PACIENTE) {
    const hoje = new Date();

    const proximas = agendamentos
      .filter(
        (c) =>
          c.paciente === currentUser.nome &&
          c.status !== "cancelada" // ignora só as canceladas
      )
      .map((c) => ({
        ...c,
        timestamp: new Date(
          `${c.data.split("/").reverse().join("-")}T${c.hora}:00`
        ).getTime(),
      }))
      .filter((c) => c.timestamp > hoje.getTime())
      .sort((a, b) => a.timestamp - b.timestamp);

    setProximaConsulta(proximas[0] || null);
  } else {
    setProximaConsulta(null);
  }
}, [agendamentos, currentUser]);

  // dados mock de dashboard médico / biomédico (somente leitura)
  const [dadosDashboard, setDadosDashboard] = useState({
    pacientesCadastrados: 0,
    examesAndamento: 0,
    laudosProntos: 0,
    examesPendentes: 0,
    examesRecentes: [],
  });

  // 🔄 Carregar dados do dashboard do backend
  useEffect(() => {
    async function carregarDadosDashboard() {
      try {
        const token = localStorage.getItem("token");

        // 🚨 AVISO: Esta rota /api/dashboard não existe no backend.
        // Você precisará criá-la no backend para que esta parte funcione.
        const resp = await fetch(`${API_BASE}/api/dashboard`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!resp.ok) {
          console.error("Falha ao buscar dados do dashboard", resp.status);
          // Fallback para dados mockados se a API falhar
          setDadosDashboard({
            pacientesCadastrados: 0,
            examesAndamento: 0,
            laudosProntos: 0,
            examesPendentes: 0,
            examesRecentes: [],
          });
          return;
        }

        const data = await resp.json();
        setDadosDashboard({
          pacientesCadastrados: data.pacientesCadastrados || 0,
          examesAndamento: data.examesAndamento || 0,
          laudosProntos: data.laudosProntos || 0,
          examesPendentes: data.examesPendentes || 0,
          examesRecentes: data.examesRecentes || [],
        });
      } catch (err) {
        console.error("Erro ao carregar dados do dashboard", err);
        // Fallback para dados mockados se a API falhar
        setDadosDashboard({
          pacientesCadastrados: 0,
          examesAndamento: 0,
          laudosProntos: 0,
          examesPendentes: 0,
          examesRecentes: [],
        });
      }
    }

    carregarDadosDashboard();
  }, []);

  // Mock antigo (mantido para fallback)
  const examesMedico = [];

  /* ====== HANDLERS GERAIS ====== */

  async function handleLogin({ email, senha }) {
  try {
    const resp = await fetch(`${API_BASE}/tokens`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: senha }),
    });

    const body = await resp.json();

    if (!resp.ok) {
      alert(body.errors?.join("\n") || "Credenciais inválidas.");
      return;
    }

    const { token, user } = body;

    // guarda o token e o role se quiser reaproveitar depois
    localStorage.setItem("token", token);
    localStorage.setItem("role", user.role);
    localStorage.setItem("userEmail", user.email);
    localStorage.setItem("userName", user.nome_completo || "");

    // define o tipo com base no role vindo do backend
    let tipo;

    switch (user.role) {
      case "medico":
        tipo = ROLES.MEDICO;
        break;
      case "biomedico":
        tipo = ROLES.BIOMEDICO;
        break;
      case "admin":
        // só use se você já tiver ROLES.ADMIN
        tipo = ROLES.ADMIN || ROLES.PACIENTE;
        break;
      case "paciente":
      default:
        tipo = ROLES.PACIENTE;
        break;
    }

    const nome =
      user.nome_completo ||
      email.split("@")[0] ||
      "Usuário";

    setCurrentUser({
      id: user.id,
      nome,
      email: user.email,
      tipo,
      role: user.role,
    });

    setProfile((prev) => ({
      ...prev,
      email: user.email,
      nome,
    }));

    // redireciona conforme o tipo
    if (tipo === ROLES.MEDICO) {
      setScreen(SCREENS.MEDICO_HOME);
    } else if (tipo === ROLES.BIOMEDICO) {
      setScreen(SCREENS.BIOMEDICO_HOME);
    } else if (ROLES.ADMIN && tipo === ROLES.ADMIN && SCREENS.ADMIN_HOME) {
      // só se você tiver essa tela definida
      setScreen(SCREENS.ADMIN_HOME);
    } else {
      setScreen(SCREENS.PACIENTE_HOME);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao conectar com o servidor de login.");
  }
}


  function handleLogout() {
    localStorage.removeItem("token");
    setCurrentUser({ nome: "", tipo: "", email: "" });
    setScreen(SCREENS.LOGIN);
  }

  function openResumoFromPaciente(consulta) {
    setSelectedConsulta({
      ...consulta,
      paciente: currentUser.nome || "Paciente",
      // A hora já deve vir no objeto consulta, se for a próxima consulta
      // ou se for uma consulta do histórico.
      // Removendo a atribuição de proximaConsulta.hora para evitar erro.
    });
    setScreen(SCREENS.RESUMO_CONSULTA);
  }

  function openResumoFromProf(exame) {
    setSelectedConsulta({
      id: exame.id,
      data: exame.data,
      exame: exame.exame,
      status: exame.status,
      paciente: exame.paciente,
    });
    setScreen(SCREENS.RESUMO_CONSULTA);
  }

  async function handleCancelarProximaConsulta() {
  if (!proximaConsulta || !proximaConsulta.id) return;
  await handleCancelAppointment(proximaConsulta.id);
}


  async function handleMudarHorarioProximaConsulta() {
  if (!proximaConsulta) return;
  const novo = prompt(
    "Informe o novo horário da consulta (ex: 11:30):",
    proximaConsulta.hora
  );
  if (!novo) return;

  try {
    const token = localStorage.getItem("token");
    await fetch(`${API_BASE}/consultas/${proximaConsulta.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ hora: novo }),
    });
  } catch (err) {
    console.error(err);
    alert("Erro ao alterar horário da consulta no servidor.");
    return;
  }

  setProximaConsulta((prev) => ({ ...prev, hora: novo }));
}

  // agendamento
  // agendar consulta (paciente) – agora a partir do formulário
// agendar consulta (paciente) – agora a partir do formulário
// agendar consulta (paciente) – agora a partir do formulário
async function handleSchedule({ data, hora, especialidade }) {
  if (!currentUser || !currentUser.nome) {
    alert("Faça login antes de agendar.");
    return;
  }

  if (!data || !hora || !especialidade) {
    alert("Preencha data, horário e especialidade.");
    return;
  }

  try {
    const token = localStorage.getItem("token");

    const resp = await fetch(`${API_BASE}/consultas`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        data, // yyyy-MM-dd (vem do <input type="date">)
        hora, // "08:00", "09:00", etc.
        pacienteNome: currentUser.nome,
        pacienteEmail: currentUser.email,

        // Mandamos em todos os nomes possíveis pro backend não "perder" a info
        exame: especialidade,
        especialidade: especialidade,
        tipo: especialidade,
      }),
    }); //  ← fecha o objeto do fetch **e** o parêntese do fetch

    let body = null;
    try {
      body = await resp.json();
    } catch (e) {
      // se backend não devolver JSON, ignora
    }

    if (!resp.ok) {
      console.error("Erro ao agendar consulta:", resp.status, body);
      alert(body?.errors?.join("\n") || "Erro ao agendar consulta.");
      return;
    }

    // se o backend devolver a consulta criada, normaliza; senão cai no fallback
    const created = body && body.id ? body : null;

    // garante que o nome do exame/especialidade venha preenchido
    const nomeExame =
      (created &&
        (created.exame || created.especialidade || created.tipo)) ||
      especialidade;

    const novo = {
      id: created ? created.id : Date.now(),
      data: created ? created.data : data,
      hora: created ? created.hora : hora,
      paciente:
        (created && (created.paciente_nome || created.paciente)) ||
        currentUser.nome,
      exame: nomeExame,
      status: created ? created.status : "pendente",
      laudoEmitido: created ? !!created.laudoEmitido : false,
      responsavel:
        (created &&
          (created.profissional_nome || created.responsavel)) ||
        null,
    };

    setAgendamentos((prev) => [...prev, novo]);
    alert("Consulta agendada com sucesso. Aguarde aprovação.");
  } catch (err) {
    console.error("Erro ao enviar agendamento para o servidor:", err);
    alert("Erro ao conectar com o servidor de agendamento.");
  }
}

// cancelar consulta (paciente)
async function handleCancelAppointment(id) {
  if (!id) return;

  const confirmar = window.confirm(
    "Tem certeza que deseja cancelar esta consulta?"
  );
  if (!confirmar) return;

  try {
    const token = localStorage.getItem("token");

    const resp = await fetch(`${API_BASE}/consultas/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ status: "cancelada" }),
    });

    let body = null;
    try {
      body = await resp.json();
    } catch (e) {
      // se backend não devolver JSON, ignora
    }

    if (!resp.ok) {
      console.error("Erro ao cancelar consulta:", resp.status, body);
      alert(body?.errors?.join("\n") || "Erro ao cancelar consulta.");
      return;
    }

    // atualiza a lista no front
    setAgendamentos((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "cancelada" } : c
      )
    );

    alert("Consulta cancelada.");
  } catch (err) {
    console.error("Erro ao cancelar consulta no servidor:", err);
    alert("Erro ao conectar com o servidor para cancelar consulta.");
  }
}

  // aprovar / recusar consulta (médico/biomédico)
  async function handleDecideAppointment(id, decision, responsavel) {
    const novoStatus = decision === "aceitar" ? "aceita" : "recusada"; // minúsculo

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${API_BASE}/consultas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          status: novoStatus,
          responsavel,
        }),
      });

      let body = null;
      try {
        body = await resp.json();
      } catch (e) {
        // se o backend não devolver JSON, ignora
      }

      if (!resp.ok) {
        console.error("Erro ao atualizar agendamento:", resp.status, body);
        alert(body?.errors?.join("\n") || "Erro ao atualizar agendamento.");
        return;
      }
    } catch (err) {
      console.error("Erro ao atualizar agendamento no servidor:", err);
      alert("Erro ao atualizar agendamento no servidor.");
      return;
    }

    setAgendamentos((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: novoStatus,
              responsavel:
                decision === "aceitar"
                  ? responsavel || a.responsavel
                  : a.responsavel,
            }
          : a
      )
    );
  }

  

      // emitir laudo (marca laudoEmitido = true)
  async function handleEmitirLaudo(id) {
    if (!id) return;

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${API_BASE}/consultas/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ laudoEmitido: true }),
      });

      let body = null;
      try {
        body = await resp.json();
      } catch (e) {
        // se backend não devolver JSON, ignora
      }

      if (!resp.ok) {
        console.error("Erro ao emitir laudo:", resp.status, body);
        alert(body?.errors?.join("\n") || "Erro ao emitir laudo.");
        return;
      }

      setAgendamentos((prev) =>
        prev.map((c) =>
          c.id === id
            ? {
                ...c,
                laudoEmitido: true,
              }
            : c
        )
      );

      alert("Laudo emitido com sucesso.");
    } catch (err) {
      console.error("Erro ao emitir laudo:", err);
      alert("Erro ao conectar com o servidor para emitir laudo.");
    }
  }


  /* ====== FLUXO DE AUTENTICAÇÃO ====== */

  const isAuthScreen =
    screen === SCREENS.LOGIN ||
    screen === SCREENS.REGISTER_ROLE ||
    screen === SCREENS.REGISTER_CLIENT ||
    screen === SCREENS.REGISTER_FUNC;

  if (isAuthScreen) {
    return (
      <AuthLayout screen={screen}>
        {screen === SCREENS.LOGIN && (
          <LoginForm
            onSubmit={handleLogin}
            goToRegisterRole={() => setScreen(SCREENS.REGISTER_ROLE)}
          />
        )}

        {screen === SCREENS.REGISTER_ROLE && (
          <RegisterRoleSelect
            goCliente={() => setScreen(SCREENS.REGISTER_CLIENT)}
            goFuncionario={() => setScreen(SCREENS.REGISTER_FUNC)}
            goBack={() => setScreen(SCREENS.LOGIN)}
          />
        )}

        {screen === SCREENS.REGISTER_CLIENT && (
          <RegisterForm
            variant="cliente"
            goToLogin={() => setScreen(SCREENS.LOGIN)}
          />
        )}

        {screen === SCREENS.REGISTER_FUNC && (
          <RegisterForm
            variant="funcionario"
            goToLogin={() => setScreen(SCREENS.LOGIN)}
          />
        )}
      </AuthLayout>
    );
  }

  /* ====== LAYOUT INTERNO ====== */

const homeScreen =
  currentUser.tipo === ROLES.MEDICO
    ? SCREENS.MEDICO_HOME
    : currentUser.tipo === ROLES.BIOMEDICO
    ? SCREENS.BIOMEDICO_HOME
    : currentUser.tipo === ROLES.ADMIN
    ? SCREENS.ADMIN_HOME
    : SCREENS.PACIENTE_HOME;


return (
  <ShellLayout
    onLogout={handleLogout}
    user={currentUser}
    onNavigate={setScreen}
    currentScreen={screen}
    homeScreen={homeScreen}
  >
    {screen === SCREENS.PACIENTE_HOME && (
      <PacienteHome
        nome={currentUser.nome || "Paciente"}
        proximaConsulta={proximaConsulta}
        examesDisponiveis={examesDisponiveis}
        consultas={agendamentos.filter(c => c.paciente === currentUser.nome)}
        onCancelarProxima={handleCancelarProximaConsulta}
        onOpenResumo={openResumoFromPaciente}
      />
    )}

    {screen === SCREENS.MEDICO_HOME && (
      <MedicoHome
        nome={currentUser.nome || "Médico"}
        onOpenResumo={openResumoFromProf}
        agendamentos={agendamentos}
      />
    )}

    {screen === SCREENS.BIOMEDICO_HOME && (
      <BiomedicoHome
        nome={currentUser.nome || "Biomédico"}
        onOpenResumo={openResumoFromProf}
      />
    )}

    {screen === SCREENS.ADMIN_HOME && (
      <AdminHome
        user={currentUser}
        onGoFinanceiro={() => setScreen(SCREENS.FINANCEIRO_ADMIN)}
        onGoUsers={() => setScreen(SCREENS.USERS_ADMIN)}
      />
    )}

    {screen === SCREENS.FINANCEIRO_ADMIN && <FinanceiroPage />}

    {screen === SCREENS.USERS_ADMIN && <AdminUsersPage />}

    {screen === SCREENS.PROFILE && (
      <ProfilePage
        profile={profile}
        onSave={setProfile}
        user={currentUser}
      />
    )}

    {screen === SCREENS.SCHEDULE && (
      <SchedulePage
        role={currentUser.tipo}
        currentUser={currentUser}
        agendamentos={agendamentos}
        onSchedule={handleSchedule}
        onDecide={handleDecideAppointment}
        onCancel={handleCancelAppointment}
      />
    )}

    {screen === SCREENS.HISTORY && (
      <HistoryPage
        role={currentUser.tipo}
        currentUser={currentUser}
        agendamentos={
          currentUser.tipo === ROLES.PACIENTE
            ? agendamentos.filter((c) => c.paciente === currentUser.nome)
            : agendamentos
        }
      />
    )}

    {screen === SCREENS.LAUDOS && (
      <LaudosPage
        role={currentUser.tipo}
        currentUser={currentUser}
        agendamentos={agendamentos}
        onEmitirLaudo={handleEmitirLaudo}
      />
    )}

    {screen === SCREENS.RESUMO_CONSULTA && (
      <ResumoConsulta
        consulta={selectedConsulta}
        role={currentUser.tipo}
        onBack={() => setScreen(homeScreen)}
      />
    )}
  </ShellLayout>
);

/* ====== LAYOUTS ====== */

function AuthLayout({ children, screen }) {

  const hero = screen === SCREENS.LOGIN ? heroLogin : heroCadastro;

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-inner">
          <img src={hero} alt="Biosphere" className="hero-img" />
          <div className="auth-brand-text">
            <h1>Biosphere</h1>
            <p>Ciência que conecta, saúde que transforma.</p>
          </div>
        </div>
      </div>
      <div className="auth-right">{children}</div>
    </div>
  );
}

function ShellLayout({
  children,
  onLogout,
  user,
  onNavigate,
  currentScreen,
  homeScreen,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  function go(screen) {
    onNavigate(screen);
    setMenuOpen(false);
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="topbar-left">Biosphere</div>
        <div className="topbar-right">
          <button
            className="icon-button"
            onClick={() => alert("Notificações ainda não implementadas.")}
          >
            🔔
          </button>

          <button
            type="button"
            className="avatar-button"
            onClick={() => go(SCREENS.PROFILE)}
          >
            <span className="topbar-username">
              {user.tipo === ROLES.MEDICO ? "Dr. " : ""}
              {user.nome}
            </span>
            <span className="avatar-circle" />
          </button>

          <button className="icon-button" onClick={onLogout}>
            Sair
          </button>
        </div>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <button
            className="icon-button big"
            onClick={() => setMenuOpen((v) => !v)}
          >
            ☰
          </button>
          <button className="icon-button big" onClick={() => go(homeScreen)}>
            🏠
          </button>
        </aside>

        <main className="app-content">{children}</main>

        {menuOpen && (
          <nav className="side-menu">
            <div className="side-menu-title">Menu</div>
            <button
              className={`side-menu-item ${
                currentScreen === homeScreen ? "active" : ""
              }`}
              onClick={() => go(homeScreen)}
            >
              Início
            </button>
            <button
              className={`side-menu-item ${
                currentScreen === SCREENS.SCHEDULE ? "active" : ""
              }`}
              onClick={() => go(SCREENS.SCHEDULE)}
            >
              Agendar consulta
            </button>
            <button
              className={`side-menu-item ${
                currentScreen === SCREENS.HISTORY ? "active" : ""
              }`}
              onClick={() => go(SCREENS.HISTORY)}
            >
              Histórico
            </button>
            <button
              className={`side-menu-item ${
                currentScreen === SCREENS.LAUDOS ? "active" : ""
              }`}
              onClick={() => go(SCREENS.LAUDOS)}
            >
              Laudos
            </button>
            <button
              className={`side-menu-item ${
                currentScreen === SCREENS.PROFILE ? "active" : ""
              }`}
              onClick={() => go(SCREENS.PROFILE)}
            >
              Perfil
            </button>
           {user.tipo === ROLES.ADMIN && (
  <>
    <button
      className={`side-menu-item ${
        currentScreen === SCREENS.FINANCEIRO_ADMIN ? "active" : ""
      }`}
      onClick={() => go(SCREENS.FINANCEIRO_ADMIN)}
    >
      Financeiro
    </button>

    <button
      className={`side-menu-item ${
        currentScreen === SCREENS.USERS_ADMIN ? "active" : ""
      }`}
      onClick={() => go(SCREENS.USERS_ADMIN)}
    >
      Administração
    </button>
  </>
)}

            <hr />
            <button className="side-menu-item" onClick={onLogout}>
              Sair
            </button>
          </nav>
        )}
      </div>
    </div>
  );
}

/* ====== LOGIN / CADASTRO ====== */

function LoginForm({ onSubmit, goToRegisterRole }) {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [lembrar, setLembrar] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    onSubmit({ email, senha, lembrar });
  }

  return (
    <div className="panel">
      <h2 className="panel-title">LOGIN</h2>
      <form onSubmit={handleSubmit} className="form-vertical">
        <label className="field-label">Email:</label>
        <input
          className="field-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <label className="field-label">Senha:</label>
        <input
          className="field-input"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />

        <div className="row-remember">
          <label
            className="remember-label"
            onClick={() => setLembrar((v) => !v)}
          >
            <span className={`dot ${lembrar ? "dot-active" : ""}`} />
            <span className="remember-text">Lembre-se de mim</span>
          </label>
          <button
            type="button"
            className="link-button"
            onClick={() =>
              alert("Fluxo de 'Esqueceu a senha?' ainda não implementado.")
            }
          >
            Esqueceu a senha?
          </button>
        </div>

        <button type="submit" className="btn-cta">
          Logar
        </button>
      </form>

      <button className="link-button big" onClick={goToRegisterRole}>
        Criar conta
      </button>
    </div>
  );
}

function RegisterRoleSelect({ goCliente, goFuncionario, goBack }) {
  return (
    <div className="panel">
      <h2 className="panel-title">CADASTRO</h2>
      <p className="panel-subtitle">Selecione o tipo de acesso:</p>

      <div className="role-buttons">
        <button className="btn-role" onClick={goCliente}>
          Sou Cliente
        </button>
        <button className="btn-role" onClick={goFuncionario}>
          Sou Funcionário
        </button>
      </div>

      <button className="link-button big" onClick={goBack}>
        Voltar para o login
      </button>
    </div>
  );
}

function RegisterForm({ goToLogin, variant }) {
  const isFuncionario = variant === "funcionario";

  const [tipoCadastro, setTipoCadastro] = useState(
    isFuncionario ? "" : "paciente"
  );
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    email: "",
    confirmarEmail: "",
    telefone: "",
    senha: "",
    confirmarSenha: "",
    dataNascimento: "",
    genero: "",
    endereco: "",
    numero: "",
    registroProfissional: "",
    especialidade: "",
    documento: null,
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e) {
  e.preventDefault();
  console.log("🟢 handleSubmit foi chamado", form, "isFuncionario:", isFuncionario);

  // validações específicas para CLIENTE
  if (!isFuncionario) {
    if (!form.email || !form.confirmarEmail) {
      alert("Preencha o e-mail e a confirmação do e-mail.");
      return;
    }

    if (form.email !== form.confirmarEmail) {
      alert("Os e-mails não coincidem.");
      return;
    }

    if (!form.senha || !form.confirmarSenha) {
      alert("Preencha a senha e a confirmação da senha.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }
  }

  if (isFuncionario && !tipoCadastro) {
    alert("Selecione o tipo de cadastro (Biomédico ou Médico).");
    return;
  }

  if (isFuncionario && !form.documento) {
    alert("Anexe o documento para análise.");
    return;
  }

  // 🔹 Monta o payload exatamente como o backend espera
      const payload = {
    nome_completo: form.nome,
    cpf: form.cpf,
    email: form.email,
    telefone: form.telefone,
    idade: form.dataNascimento || "0",
    genero: form.genero || "não informado",
    endereco: form.endereco || "",
    numero: form.numero || "",
    password: form.senha,
    // por padrão, cliente é paciente aprovado
    role: "paciente",
    status: "aprovado",
  };

  if (isFuncionario) {
    payload.tipo_cadastro = tipoCadastro;              // "biomedico" ou "medico"
    payload.registro_profissional = form.registroProfissional;
    payload.especialidade = form.especialidade;

    // 👇 aqui trocamos o tipo de usuário
    payload.role = tipoCadastro;                       // "medico" ou "biomedico"
    payload.status = "pendente";                       // precisa de aprovação do admin
  }

  console.log("🔵 Enviando payload para backend:", payload);

  try {
    const resp = await fetch(`${API_BASE}/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("🟣 Resposta bruta do fetch:", resp);

    let body = null;
    try {
      body = await resp.json();
    } catch (jsonErr) {
      console.error("⚠️ Erro ao ler JSON da resposta:", jsonErr);
    }

    console.log("🟣 Corpo da resposta do backend:", body);

    if (!resp.ok) {
      alert(body?.errors?.join("\n") || "Erro ao cadastrar usuário.");
      return;
    }

    alert("Cadastro realizado com sucesso! Agora faça login.");
    goToLogin();
  } catch (err) {
    console.error("🔴 Erro de rede / fetch ao cadastrar:", err);
    alert("Erro ao conectar com o servidor de cadastro.");
  }
}

  const isBiomedico = tipoCadastro === "biomedico";
  const isMedico = tipoCadastro === "medico";
  const registroLabel = isBiomedico
    ? "CRBM:"
    : isMedico
    ? "CRM:"
    : "Registro profissional:";

  const submitLabel = isFuncionario ? "Enviar cadastro para análise" : "Cadastrar";

  return (
  <div className="panel">
    <button
      type="button"
      className="link-button"
      onClick={goToLogin}
      style={{ marginBottom: "8px" }}
    >
      ← Voltar para o login
    </button>

    <h2 className="panel-title">CADASTRO</h2>

      {isFuncionario && (
        <div className="select-wrapper">
          <select
            className="select-pill"
            value={tipoCadastro}
            onChange={(e) => setTipoCadastro(e.target.value)}
          >
            <option value="">Selecione o tipo de cadastro</option>
            <option value="biomedico">Biomédico</option>
            <option value="medico">Médico</option>
          </select>
        </div>
      )}

      {!isFuncionario && (
        <p className="panel-subtitle">
          Cadastro de <strong>Cliente</strong>
        </p>
      )}

      <form onSubmit={handleSubmit} className="form-grid">
        <Field label="Nome completo:">
          <input
            className="field-input"
            value={form.nome}
            onChange={(e) => handleChange("nome", e.target.value)}
          />
        </Field>

        <Field label="CPF:">
          <input
            className="field-input"
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => handleChange("cpf", e.target.value)}
          />
        </Field>

        <Field label="Email:">
          <input
            className="field-input"
            type="email"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </Field>

        <Field label="Confirmar email:">
          <input
            className="field-input"
            type="email"
            value={form.confirmarEmail}
            onChange={(e) => handleChange("confirmarEmail", e.target.value)}
          />
        </Field>

        <Field label="Telefone:">
          <input
            className="field-input"
            value={form.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
          />
        </Field>

        <Field label="Senha:">
          <input
            className="field-input"
            type="password"
            value={form.senha}
            onChange={(e) => handleChange("senha", e.target.value)}
          />
        </Field>

        <Field label="Confirmar senha:">
          <input
            className="field-input"
            type="password"
            value={form.confirmarSenha}
            onChange={(e) =>
              handleChange("confirmarSenha", e.target.value)
            }
          />
        </Field>

        <Field label="Data de nascimento:">
          <input
            className="field-input"
            type="date"
            value={form.dataNascimento}
            onChange={(e) =>
              handleChange("dataNascimento", e.target.value)
            }
          />
        </Field>

        <Field label="Gênero:">
          <select
            className="field-input"
            value={form.genero}
            onChange={(e) => handleChange("genero", e.target.value)}
          >
            <option value="">Selecione</option>
            <option value="feminino">Feminino</option>
            <option value="masculino">Masculino</option>
            <option value="outro">Outro</option>
          </select>
        </Field>

        {isFuncionario && (isBiomedico || isMedico) && (
          <Field label={registroLabel}>
            <input
              className="field-input"
              placeholder={
                isBiomedico ? "CRBM - R / XXXXXX" : "CRM - 000000"
              }
              value={form.registroProfissional}
              onChange={(e) =>
                handleChange("registroProfissional", e.target.value)
              }
            />
          </Field>
        )}

        {isFuncionario && isMedico && (
          <Field label="Especialidade:">
            <input
              className="field-input"
              value={form.especialidade}
              onChange={(e) =>
                handleChange("especialidade", e.target.value)
              }
            />
          </Field>
        )}

        <Field label="Endereço:" full>
          <input
            className="field-input"
            placeholder="ex: Rua / Avenida"
            value={form.endereco}
            onChange={(e) => handleChange("endereco", e.target.value)}
          />
        </Field>

        <Field label="Número:">
          <input
            className="field-input"
            value={form.numero}
            onChange={(e) => handleChange("numero", e.target.value)}
          />
        </Field>

        {isFuncionario && (
          <Field label="Anexar documento (PDF/Imagem):" full>
            <input
              className="field-input file-input"
              type="file"
              accept=".pdf,image/*"
              onChange={(e) =>
                handleChange("documento", e.target.files?.[0] || null)
              }
            />
          </Field>
        )}

        <div className="form-footer">
          <button type="submit" className="btn-cta">
            {submitLabel}
          </button>
        </div>
      </form>

      <button className="link-button big" onClick={goToLogin}>
        Já possui conta?
      </button>
    </div>
  );
}

/* pequeno helper para reduzir código de campos */
function Field({ label, children, full }) {
  return (
    <div className={`field-group ${full ? "full-width" : ""}`}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

/* ====== TELAS PRINCIPAIS ====== */

function PacienteHome({
  nome,
  proximaConsulta,
  examesDisponiveis,
  consultas,
  onCancelarProxima,
  onOpenResumo,
}) {
  return (
    <div className="page">
      <div className="page-header">
        <h2>
          Olá, {nome} <span>👋</span>
        </h2>
        <p className="welcome-sub">Bem-vindo ao Biosphere.</p>
      </div>

      <div className="info-banner">
        Você possui <strong>{examesDisponiveis}</strong> exames disponíveis
        para visualização.
      </div>

      <div className="box box-proxima-consulta">
        <p className="box-title">Próxima consulta</p>
        {proximaConsulta ? (
          <>
            <p className="box-text">
              Sua próxima consulta é para o dia:{" "}
              <strong>{formatarDataBR(proximaConsulta.data)}</strong>
              <span className="dot-separator">•</span>
              <strong>{proximaConsulta.hora} horas</strong>
            </p>

            <div className="btn-row">
              <button className="btn-neutral" onClick={onCancelarProxima}>
                Cancelar consulta
              </button>
            </div>
          </>
        ) : (
          <p className="box-text">Nenhuma consulta aceita agendada.</p>
        )}
      </div>

            <div className="table-wrapper">
        <div className="table-title">Consultas em aberto</div>
        <table className="table-simple">
          <thead>
            <tr>
              <th>Data</th>
              <th>Exame</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {consultas.map((c) => (
              <tr key={c.id}>
                <td>{formatarDataBR(c.data)}</td>
                <td>{c.exame || c.especialidade || c.tipo || "-"}</td>
                <td>
                  <span
                    className={
                      c.status === "aceita"
                        ? "status-pill status-ok"
                        : c.status === "recusada" || c.status === "cancelada"
                        ? "status-pill status-cancel"
                        : "status-pill status-pending"
                    }
                  >
                    {c.status}
                  </span>
                </td>
                <td className="table-actions">
                  <button
                    className="link-button"
                    onClick={() => onOpenResumo(c)}
                  >
                    Ver resumo
                  </button>
                  <button
                    className="link-button"
                    onClick={async () => {
                      try {
                        await fetch(
                          `${API_BASE}/api/laudos/${c.id}/download`,
                          { method: "GET" }
                        );
                        alert(
                          "Laudo baixado (confira o navegador/cliente)."
                        );
                      } catch (err) {
                        console.error(err);
                        alert("Erro ao baixar laudo.");
                      }
                    }}
                  >
                    Baixar laudo
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MedicoHome({ nome, onOpenResumo, agendamentos = [] }) {
  // ---- métricas do topo ----
  const pacientesSet = new Set();
  agendamentos.forEach((c) => {
    if (c.paciente) pacientesSet.add(c.paciente);
  });

  const pacientesCadastrados = pacientesSet.size;
  const examesPendentes = agendamentos.filter(
    (c) => c.status === "pendente"
  ).length;
  const laudosProntos = agendamentos.filter(
    (c) => c.laudoEmitido
  ).length;
  const examesAndamento = agendamentos.filter(
    (c) =>
      (c.status === "aceita" || c.status === "em andamento") &&
      !c.laudoEmitido
  ).length;

  // últimos 5 exames (para a tabela de baixo)
  const examesRecentes = [...agendamentos]
    .sort((a, b) => {
      const da = new Date(a.data);
      const db = new Date(b.data);
      return db - da;
    })
    .slice(0, 5);

  return (
    <div className="page">
      <div className="page-header">
        <h2>
          Olá, Dr. {nome} <span>👋</span>
        </h2>
      </div>

      <div className="cards-row">
        <ResumoCard
          titulo="Pacientes cadastrados"
          valor={pacientesCadastrados}
        />
        <ResumoCard
          titulo="Exames em andamento"
          valor={examesAndamento}
        />
        <ResumoCard
          titulo="Laudos prontos"
          valor={laudosProntos}
        />
        <ResumoCard
          titulo="Exames pendentes"
          valor={examesPendentes}
        />
      </div>

      <h3 className="section-title">Resumo rápido</h3>

      <div className="table-wrapper">
        <table className="table-simple">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Exame</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {examesRecentes.map((ex) => (
              <tr key={ex.id}>
                <td>{formatarDataBR(ex.data)}</td>
                <td>{ex.paciente || "-"}</td>
                <td>{ex.exame || ex.especialidade || "-"}</td>
                <td>
                  <span
                    className={
                      ex.status === "aceita"
                        ? "status-pill status-ok"
                        : ex.status === "cancelada" ||
                          ex.status === "recusada"
                        ? "status-pill status-cancel"
                        : "status-pill status-pending"
                    }
                  >
                    {ex.status}
                  </span>
                </td>
                <td>
                  <button
                    className="link-button"
                    onClick={() => onOpenResumo(ex)}
                  >
                    Ver resumo
                  </button>
                </td>
              </tr>
            ))}
            {examesRecentes.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhum exame para mostrar no resumo.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BiomedicoHome({ nome, onOpenResumo }) {
  const [aba, setAba] = useState("pendentes");
  const [novoExame, setNovoExame] = useState({
    paciente: "",
    tipo: "",
    data: "",
  });
  const [resultado, setResultado] = useState({
    exameId: "",
    texto: "",
  });
  const [exames, setExames] = useState([]);

  // carrega exames do backend ao entrar na tela
  useEffect(() => {
    async function carregarExames() {
      try {
        const token = localStorage.getItem("token");
        const resp = await fetch(`${API_BASE}/api/exames`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (!resp.ok) {
          console.error("Falha ao buscar exames", resp.status);
          return;
        }

        const data = await resp.json();
        const normalizados = data.map((ex) => ({
          id: ex.id,
          data: ex.data, // ajuste se vier em outro formato
          paciente: ex.paciente_nome || ex.paciente || "-",
          exame: ex.tipo || ex.exame || "Exame",
          status: ex.status || "pendente",
        }));

        setExames(normalizados);
      } catch (err) {
        console.error("Erro ao carregar exames", err);
      }
    }

    carregarExames();
  }, []);

  async function registrarExame(e) {
    e.preventDefault();
    if (!novoExame.paciente || !novoExame.tipo || !novoExame.data) {
      alert("Preencha paciente, tipo e data do exame.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(`${API_BASE}/api/exames`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(novoExame),
      });

      let body = null;
      try {
        body = await resp.json();
      } catch (e) {}

      if (!resp.ok) {
        console.error("Erro ao registrar exame:", resp.status, body);
        alert(body?.errors?.join("\n") || "Erro ao registrar exame.");
        return;
      }

      const criado = body && body.id ? body : null;

      const novoItem = {
        id: criado ? criado.id : Date.now(),
        data: criado ? criado.data : novoExame.data,
        paciente: criado?.paciente_nome || novoExame.paciente,
        exame: criado?.tipo || novoExame.tipo,
        status: criado?.status || "pendente",
      };

      setExames((prev) => [...prev, novoItem]);

      alert(
        `Exame registrado para ${novoExame.paciente}, tipo ${novoExame.tipo}, data ${novoExame.data}.`
      );
      setNovoExame({ paciente: "", tipo: "", data: "" });
    } catch (err) {
      console.error(err);
      alert("Erro ao registrar exame no servidor.");
    }
  }

  async function lancarResultado(e) {
    e.preventDefault();
    if (!resultado.exameId || !resultado.texto) {
      alert("Preencha o ID do exame e o resultado.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const resp = await fetch(
        `${API_BASE}/api/exames/${resultado.exameId}/resultado`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ texto: resultado.texto }),
        }
      );

      let body = null;
      try {
        body = await resp.json();
      } catch (e) {}

      if (!resp.ok) {
        console.error("Erro ao lançar resultado:", resp.status, body);
        alert(body?.errors?.join("\n") || "Erro ao salvar resultado.");
        return;
      }

      // marca como concluído na lista
      setExames((prev) =>
        prev.map((ex) =>
          String(ex.id) === String(resultado.exameId)
            ? { ...ex, status: "Concluído" }
            : ex
        )
      );

      alert(`Resultado lançado para exame ${resultado.exameId}.`);
      setResultado({ exameId: "", texto: "" });
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar resultado do exame.");
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>
          Olá, {nome} <span>👋</span>
        </h2>
        <p className="welcome-sub">
          Área do biomédico – registrar exames, inserir resultados e gerar laudos.
        </p>
      </div>

      <div className="tabs">
        <button
          className={`tab-btn ${aba === "pendentes" ? "tab-btn-active" : ""}`}
          onClick={() => setAba("pendentes")}
        >
          Exames pendentes
        </button>
        <button
          className={`tab-btn ${aba === "registrar" ? "tab-btn-active" : ""}`}
          onClick={() => setAba("registrar")}
        >
          Registrar exame
        </button>
        <button
          className={`tab-btn ${aba === "resultados" ? "tab-btn-active" : ""}`}
          onClick={() => setAba("resultados")}
        >
          Inserir resultados / laudos
        </button>
      </div>

      {aba === "pendentes" && (
        <div className="table-wrapper">
          <div className="table-title">Exames em andamento</div>
          <table className="table-simple">
            <thead>
              <tr>
                <th>ID</th>
                <th>Paciente</th>
                <th>Exame</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
  {exames.map((ex) => (
    <tr key={ex.id}>
      <td>{ex.id}</td>
      <td>{ex.paciente}</td>
      <td>{ex.exame}</td>
      <td>
        <span
          className={
            ex.status === "Concluído"
              ? "status-pill status-ok"
              : ex.status === "Cancelado"
              ? "status-pill status-cancel"
              : "status-pill status-pending"
          }
        >
          {ex.status}
        </span>
      </td>
      <td>
        <button
          className="link-button"
          onClick={() => onOpenResumo(ex)}
        >
          Ver / gerar laudo
        </button>
      </td>
    </tr>
  ))}
</tbody>

          </table>
        </div>
      )}

      {aba === "registrar" && (
        <div className="box">
          <p className="box-title">Registrar novo exame</p>
          <form className="form-grid" onSubmit={registrarExame}>
            <Field label="Paciente:">
              <input
                className="field-input"
                value={novoExame.paciente}
                onChange={(e) =>
                  setNovoExame((v) => ({ ...v, paciente: e.target.value }))
                }
              />
            </Field>
            <Field label="Tipo de exame:">
              <input
                className="field-input"
                value={novoExame.tipo}
                onChange={(e) =>
                  setNovoExame((v) => ({ ...v, tipo: e.target.value }))
                }
              />
            </Field>
            <Field label="Data:">
              <input
                className="field-input"
                type="date"
                value={novoExame.data}
                onChange={(e) =>
                  setNovoExame((v) => ({ ...v, data: e.target.value }))
                }
              />
            </Field>
            <div className="form-footer">
              <button type="submit" className="btn-cta">
                Registrar exame
              </button>
            </div>
          </form>
        </div>
      )}

      {aba === "resultados" && (
        <div className="box">
          <p className="box-title">Inserir resultado / gerar laudo</p>
          <form className="form-grid" onSubmit={lancarResultado}>
            <Field label="ID do exame:">
              <input
                className="field-input"
                value={resultado.exameId}
                onChange={(e) =>
                  setResultado((v) => ({ ...v, exameId: e.target.value }))
                }
              />
            </Field>
            <Field label="Resultado / observações:" full>
              <textarea
                className="field-input"
                rows={4}
                value={resultado.texto}
                onChange={(e) =>
                  setResultado((v) => ({ ...v, texto: e.target.value }))
                }
              />
            </Field>
            <div className="form-footer">
              <button type="submit" className="btn-cta">
                Salvar resultado e gerar laudo
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function ResumoConsulta({ consulta, role, onBack }) {
  if (!consulta) return null;

  const isPaciente = role === ROLES.PACIENTE;

  return (
    <div className="page">
      <button className="link-button" onClick={onBack}>
        ← Voltar
      </button>
      <h2>Resumo da consulta</h2>

      <div className="box">
        {consulta.paciente && (
          <p>
            <strong>Paciente:</strong> {consulta.paciente}
          </p>
        )}
        {consulta.data && (
  <p>
    <strong>Data:</strong> {formatarDataBR(consulta.data)}
  </p>
)}
        {consulta.hora && (
          <p>
            <strong>Horário:</strong> {consulta.hora}
          </p>
        )}
        {consulta.exame && (
          <p>
            <strong>Exame:</strong> {consulta.exame}
          </p>
        )}
        {consulta.status && (
          <p>
            <strong>Status:</strong> {consulta.status}
          </p>
        )}
      </div>

      {isPaciente ? (
        <div className="btn-row">
          <button
            className="btn-neutral"
            onClick={() => alert("Aqui você poderá baixar o laudo em PDF quando a API estiver pronta.")}
          >
            Baixar laudo em PDF
          </button>
          <button
            className="btn-neutral"
            onClick={() => alert("Aqui você poderá compartilhar o laudo quando a API estiver pronta.")}
          >
            Compartilhar laudo
          </button>
        </div>
      ) : (
        <div className="btn-row">
          <button
            className="btn-neutral"
            onClick={() => alert("Aqui você poderá registrar o laudo quando a API estiver pronta.")}
          >
            Registrar laudo
          </button>
          <button
            className="btn-neutral"
            onClick={() => alert("Aqui você poderá gerar o laudo em PDF quando a API estiver pronta.")}
          >
            Gerar laudo em PDF
          </button>
          <button
            className="btn-neutral"
            onClick={() => alert("Aqui você poderá enviar o laudo ao paciente quando a API estiver pronta.")}
          >
            Enviar laudo ao paciente
          </button>
        </div>
      )}
    </div>
  );
}
  /* ====== TELAS DO MENU (AGENDAR / HISTÓRICO / LAUDOS / PERFIL) ====== */

function SchedulePage({
  role,
  currentUser = {},
  agendamentos = [],
  onSchedule = () => {},
  onDecide = () => {},
  onCancel = () => {},
}) {
  const isPaciente = role === ROLES.PACIENTE;

  // nome do profissional (usado só na visão MÉDICO / BIOMÉDICO)
  const nomeProfissional = currentUser?.nome || "";

  // estados do formulário (paciente)
  const [data, setData] = useState(() => {
    // hoje em formato yyyy-MM-dd
    return new Date().toISOString().split("T")[0];
  });
  const [hora, setHora] = useState("");
  const [especialidade, setEspecialidade] = useState("");

  const horarios = gerarHorarios();
  const hojeISO = new Date().toISOString().split("T")[0];

  // consultas deste paciente (se paciente)
  const minhasConsultas = isPaciente
    ? agendamentos.filter((c) => c.paciente === currentUser.nome)
    : agendamentos;

  async function handleSubmit(e) {
    e.preventDefault();

    if (data < hojeISO) {
      alert("A data deve ser a partir de hoje.");
      return;
    }

    if (!hora) {
      alert("Selecione um horário entre 08:00 e 18:00.");
      return;
    }

    if (!especialidade) {
      alert("Selecione a especialidade desejada.");
      return;
    }

    onSchedule({ data, hora, especialidade });
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Agendar consulta</h2>
        <p>
          {isPaciente
            ? "Escolha a data, horário e especialidade para agendar uma nova consulta."
            : "Visualize e gerencie as consultas agendadas pelos pacientes."}
        </p>
      </div>

      {isPaciente ? (
        <>
          {/* 🔹 PACIENTE: formulário de novo agendamento */}
          <div className="box">
            <p className="box-title">Nova consulta</p>
            <form className="form-grid" onSubmit={handleSubmit}>
              <Field label="Data:">
                <input
                  className="field-input"
                  type="date"
                  value={data}
                  min={hojeISO}
                  onChange={(e) => setData(e.target.value)}
                />
              </Field>

              <Field label="Horário:">
                <select
                  className="field-input"
                  value={hora}
                  onChange={(e) => setHora(e.target.value)}
                >
                  <option value="">Selecione um horário</option>
                  {horarios.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Especialidade:">
                <select
                  className="field-input"
                  value={especialidade}
                  onChange={(e) => setEspecialidade(e.target.value)}
                >
                  <option value="">Selecione a especialidade</option>
                  <option value="Clínico Geral">Clínico Geral</option>
                  <option value="Cardiologia">Cardiologia</option>
                  <option value="Endocrinologia">Endocrinologia</option>
                  <option value="Ginecologia">Ginecologia</option>
                  <option value="Pediatria">Pediatria</option>
                  <option value="Ortopedia">Ortopedia</option>
                </select>
              </Field>

              <div className="form-footer">
                <button type="submit" className="btn-cta">
                  Agendar consulta
                </button>
              </div>
            </form>
          </div>

          {/* 🔹 PACIENTE: lista das próprias consultas */}
          <div className="table-wrapper" style={{ marginTop: "24px" }}>
            <div className="table-title">Minhas consultas</div>
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {minhasConsultas.map((c) => (
                  <tr key={c.id}>
                    <td>{formatarDataBR(c.data)}</td>
                    <td>{c.hora}</td>
                    <td>{c.exame || c.especialidade || "-"}</td>
                    <td>{c.status}</td>
                    <td className="table-actions">
                      {c.status !== "cancelada" && (
                        <button
                          className="link-button"
                          onClick={() => onCancel(c.id)}
                        >
                          Cancelar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {minhasConsultas.length === 0 && (
                  <tr>
                    <td colSpan={5}>Nenhuma consulta agendada no momento.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <>
          {/* 🔹 MÉDICO / BIOMÉDICO: visão de gestão */}
          <div className="table-wrapper">
            <div className="table-title">Consultas agendadas</div>
            <table className="table-simple">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Hora</th>
                  <th>Paciente</th>
                  <th>Especialidade</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map((c) => (
                  <tr key={c.id}>
                    <td>{formatarDataBR(c.data)}</td>
                    <td>{c.hora}</td>
                    <td>{c.paciente || "-"}</td>
                    <td>{c.exame || c.especialidade || "-"}</td>
                    <td>{c.status}</td>
                    <td className="table-actions">
                      {c.status === "pendente" && (
                        <>
                          <button
                            className="link-button link-accept"
                            onClick={() =>
                              onDecide(c.id, "aceitar", nomeProfissional)
                            }
                          >
                            Aceitar
                          </button>
                          <button
                            className="link-button link-reject"
                            onClick={() =>
                              onDecide(c.id, "recusar", nomeProfissional)
                            }
                          >
                            Recusar
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
                {agendamentos.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      Nenhuma consulta agendada no momento.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}


function LaudosPage({ role, currentUser, agendamentos = [], onEmitirLaudo = () => {} }) {
  const isPaciente = role === ROLES.PACIENTE;

  const itens = isPaciente
    ? agendamentos.filter((c) => c.paciente === currentUser.nome)
    : agendamentos;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Laudos</h2>
        <p>
          {isPaciente
            ? "Aqui você vê os laudos dos seus exames."
            : "Aqui você gerencia e emite laudos de exames."}
        </p>
      </div>

      <div className="table-wrapper">
        <table className="table-simple">
          <thead>
            <tr>
              <th>Data</th>
              <th>Paciente</th>
              <th>Exame</th>
              <th>Status</th>
              <th>Laudo</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {itens.map((c) => (
              <tr key={c.id}>
                <td>{formatarDataBR(c.data)}</td>
                <td>{c.paciente || "-"}</td>
                <td>{c.exame || "Exame"}</td>
                <td>{c.status}</td>
                <td>{c.laudoEmitido ? "Emitido" : "Pendente"}</td>
                <td className="table-actions">
                  {!isPaciente && !c.laudoEmitido && (
                    <button
                      className="link-button"
                      onClick={() => onEmitirLaudo(c.id)}
                    >
                      Emitir laudo
                    </button>
                  )}
                  {c.laudoEmitido && (
                    <button
                      className="link-button"
                      onClick={() =>
                        alert(
                          "Aqui futuramente você poderá baixar o PDF do laudo."
                        )
                      }
                    >
                      Baixar
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={6}>Nenhum laudo disponível no momento.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function HistoryPage({ role, currentUser, agendamentos = [] }) {
  const isPaciente = role === ROLES.PACIENTE;

  // já vem filtrado do App quando é paciente
  const itens = agendamentos;

  const colSpan = isPaciente ? 5 : 6;

  return (
    <div className="page">
      <div className="page-header">
        <h2>Histórico de consultas</h2>
        <p>
          {isPaciente
            ? "Veja todas as consultas que você já agendou, incluindo canceladas e concluídas."
            : "Veja o histórico de consultas dos pacientes atendidos."}
        </p>
      </div>

      <div className="table-wrapper">
        <table className="table-simple">
          <thead>
            <tr>
              <th>Data</th>
              <th>Hora</th>
              {!isPaciente && <th>Paciente</th>}
              <th>Especialidade / Exame</th>
              <th>Status</th>
              <th>Laudo</th>
            </tr>
          </thead>
          <tbody>
            {itens.map((c) => (
              <tr key={c.id}>
                <td>{formatarDataBR(c.data)}</td>
                <td>{c.hora}</td>
                {!isPaciente && <td>{c.paciente || "-"}</td>}
                <td>{c.exame || c.especialidade || "-"}</td>
                <td>{c.status}</td>
                <td>{c.laudoEmitido ? "Emitido" : "Pendente"}</td>
              </tr>
            ))}
            {itens.length === 0 && (
              <tr>
                <td colSpan={colSpan}>
                  Nenhuma consulta encontrada no histórico.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function ProfilePage({ profile, onSave, user }) {
  const [form, setForm] = React.useState({
    nome: user?.nome || "",
    email: profile?.email || user?.email || "",
    telefone: profile?.telefone || "",
    fotoUrl: profile?.fotoUrl || "",
  });

  function handleChange(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    onSave((prev) => ({
      ...prev,
      email: form.email,
      telefone: form.telefone,
      fotoUrl: form.fotoUrl,
    }));
    alert("Perfil atualizado (somente no front, por enquanto).");
  }
  return (
    <div className="page">
      <div className="page-header">
        <h2>Meu perfil</h2>
        <p>Atualize seus dados básicos.</p>
      </div>

      <form className="form" onSubmit={handleSubmit}>
        <Field label="Nome completo" full>
          <input
            className="field-input"
            value={form.nome}
            disabled
            readOnly
          />
        </Field>

        <Field label="Email" full>
          <input
            className="field-input"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </Field>

        <Field label="Telefone" full>
          <input
            className="field-input"
            value={form.telefone}
            onChange={(e) => handleChange("telefone", e.target.value)}
          />
        </Field>

        <Field label="URL da foto (opcional)" full>
          <input
            className="field-input"
            value={form.fotoUrl}
            onChange={(e) => handleChange("fotoUrl", e.target.value)}
          />
        </Field>

        <div className="form-footer">
          <button type="submit" className="btn-cta">
            Salvar
          </button>
        </div>
      </form>
    </div>
  );
}
  /* ====== TELAS ADMINISTRATIVAS (FINANCEIRO / ADMIN USERS) ====== */

function FinanceiroPage() {
  // aqui você poderia consumir dados reais de faturamento depois
  const indicadores = [
    { label: "Faturamento do mês", valor: "R$ 120.000,00" },
    { label: "Exames realizados no mês", valor: "320" },
    { label: "Ticket médio por exame", valor: "R$ 375,00" },
    { label: "Pendências em faturamento", valor: "R$ 8.500,00" },
  ];

  return (
    <div className="page">
      <div className="page-header">
        <h2>Painel financeiro</h2>
        <p>Visão geral dos principais indicadores de faturamento.</p>
      </div>

      <div className="cards-row">
        {indicadores.map((i) => (
          <ResumoCard key={i.label} titulo={i.label} valor={i.valor} />
        ))}
      </div>

      <div className="box" style={{ marginTop: "24px" }}>
        <p className="box-title">Observações</p>
        <p className="box-text">
          Esta tela é um protótipo. No futuro, aqui você poderá integrar
          com os dados reais do sistema de cobrança / ERP.
        </p>
      </div>
    </div>
  );
}

function AdminUsersPage() {
  // mock simples de cadastros pendentes de médicos/biomédicos
  const [pendentes, setPendentes] = useState([
    {
      id: 1,
      nome: "Dra. Ana Souza",
      email: "ana.souza@bio.com",
      tipo: "medico",
      registro: "CRM 123456",
    },
    {
      id: 2,
      nome: "Carlos Lima",
      email: "carlos.lima@bio.com",
      tipo: "biomedico",
      registro: "CRBM 2 / 98765",
    },
  ]);

  const [aprovados, setAprovados] = useState([]);

  function aprovar(id) {
    const user = pendentes.find((u) => u.id === id);
    if (!user) return;
    setPendentes((prev) => prev.filter((u) => u.id !== id));
    setAprovados((prev) => [...prev, { ...user, status: "Aprovado" }]);
    alert(`Cadastro de ${user.nome} aprovado.`);
    // aqui futuramente você pode chamar uma API:
    // fetch(`${API_BASE}/admin/users/${id}/aprovar`, { method: "PATCH" })
  }

  function rejeitar(id) {
    const user = pendentes.find((u) => u.id === id);
    if (!user) return;
    setPendentes((prev) => prev.filter((u) => u.id !== id));
    alert(`Cadastro de ${user.nome} rejeitado.`);
    // e aqui, futuramente:
    // fetch(`${API_BASE}/admin/users/${id}/rejeitar`, { method: "PATCH" })
  }

  return (
    <div className="page">
      <div className="page-header">
        <h2>Administração de usuários</h2>
        <p>Gerencie os cadastros de profissionais da plataforma.</p>
      </div>

      <div className="table-wrapper">
        <div className="table-title">Cadastros pendentes</div>
        <table className="table-simple">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Email</th>
              <th>Tipo</th>
              <th>Registro</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {pendentes.map((u) => (
              <tr key={u.id}>
                <td>{u.nome}</td>
                <td>{u.email}</td>
                <td>{u.tipo === "medico" ? "Médico" : "Biomédico"}</td>
                <td>{u.registro}</td>
                <td className="table-actions">
                  <button
                    className="link-button"
                    onClick={() => aprovar(u.id)}
                  >
                    Aprovar
                  </button>
                  <button
                    className="link-button"
                    onClick={() => rejeitar(u.id)}
                  >
                    Rejeitar
                  </button>
                </td>
              </tr>
            ))}
            {pendentes.length === 0 && (
              <tr>
                <td colSpan={5}>Nenhum cadastro pendente.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {aprovados.length > 0 && (
        <div className="table-wrapper" style={{ marginTop: "24px" }}>
          <div className="table-title">Últimos aprovados (sessão)</div>
          <table className="table-simple">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>Tipo</th>
                <th>Registro</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {aprovados.map((u) => (
                <tr key={u.id}>
                  <td>{u.nome}</td>
                  <td>{u.email}</td>
                  <td>{u.tipo === "medico" ? "Médico" : "Biomédico"}</td>
                  <td>{u.registro}</td>
                  <td>
                    <span className="status-pill status-ok">Aprovado</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminHome({ user, onGoFinanceiro, onGoUsers }) {
  return (
    <div className="page">
      <div className="page-header">
        <h2>Olá, {user?.nome || "Admin"} 👋</h2>
        <p>Bem-vindo ao painel administrativo do Biosphere.</p>
      </div>

      <div className="cards-row">
        <ResumoCard titulo="Visão financeira" valor="Acessar" />
        <ResumoCard titulo="Gestão de usuários" valor="Acessar" />
        <ResumoCard titulo="Consultas hoje" valor="—" />
        <ResumoCard titulo="Exames no mês" valor="—" />
      </div>

      <div className="box">
        <p className="box-title">Atalhos rápidos</p>
        <div className="btn-row" style={{ marginTop: "8px" }}>
          <button
            className="btn-cta"
            style={{ maxWidth: 220 }}
            onClick={onGoFinanceiro}
          >
            Ir para Financeiro
          </button>
          <button className="btn-neutral" onClick={onGoUsers}>
            Gerenciar usuários
          </button>
        </div>
        <p className="box-text" style={{ marginTop: "10px" }}>
          Use o menu ao lado ou os botões acima para navegar entre as áreas de
          administração do sistema.
        </p>
      </div>
    </div>
  );
}}
