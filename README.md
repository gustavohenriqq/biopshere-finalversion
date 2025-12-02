# 🧬 Biosphere – Sistema de Gestão de Exames e Laudos Clínicos

O **Biosphere** é um sistema web desenvolvido para gerenciar **exames laboratoriais, consultas médicas e laudos clínicos**, integrando pacientes, médicos, biomédicos e administradores em uma única plataforma.

O projeto foi pensado para simular um ambiente real de clínica/laboratório, com foco em **organização, usabilidade e fluxo de atendimento**, desde o agendamento até a liberação de laudos.

---

## 🎯 Objetivo do Projeto

O objetivo do Biosphere é oferecer:
- Centralização das informações clínicas
- Facilitação no agendamento de consultas e exames
- Acompanhamento do status dos exames
- Visualização e controle de laudos
- Gestão administrativa básica

O sistema foi desenvolvido como parte de um **projeto acadêmico**, aplicando conceitos de engenharia de software, experiência do usuário e fluxo de processos.

---

## 👥 Perfis de Usuário

O sistema trabalha com múltiplos perfis, cada um com funcionalidades específicas:

### 🧍 Paciente
- Cadastro e autenticação
- Agendamento de consultas/exames
- Visualização do histórico
- Acompanhamento de exames
- Acesso aos laudos disponíveis

### 🩺 Médico
- Visualização de pacientes
- Acompanhamento de exames
- Consulta de histórico clínico
- Análise de exames em andamento e finalizados

### 🔬 Biomédico
- Gerenciamento de exames
- Atualização do status dos exames
- Emissão de laudos

### 🛠️ Administrador
- Visão geral do sistema
- Gestão de usuários
- Gestão financeira (visão administrativa)
- Controle e organização das operações

---

## 🖥️ Tecnologias Utilizadas

### Frontend
- **React**
- **Vite**
- **JavaScript (ES6+)**
- **HTML5**
- **CSS3**

### Backend *(repositório separado / API local)*
- **Node.js**
- **Express**
- **MySQL**
- **Sequelize**
- **JWT (Autenticação)**

> 🔗 O frontend se comunica com uma API rodando localmente, por padrão em:  
> `http://localhost:3001`

---

## 📂 Estrutura do Projeto (Frontend)

```text
biosphere/
├── public/
├── src/
│   ├── assets/        # Imagens e recursos visuais
│   ├── App.jsx        # Componente principal do sistema
│   ├── main.jsx       # Ponto de entrada do React
│   ├── index.css      # Estilos globais
│   └── ...
├── index.html
├── package.json
├── vite.config.js
└── README.md
