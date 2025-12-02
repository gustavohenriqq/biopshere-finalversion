# 🧬 Biosphere – Sistema Acadêmico de Gestão de Exames e Laudos

O **Biosphere** é um sistema web desenvolvido como **projeto acadêmico**, com o objetivo de simular o funcionamento de uma clínica/laboratório, permitindo o gerenciamento de **usuários, consultas, exames e laudos clínicos**.

O projeto aplica conceitos de **engenharia de software**, **organização de processos**, **integração frontend e backend** e **boas práticas de versionamento**.

---

## 🎯 Objetivo do Projeto

Simular um sistema real de gestão clínica, permitindo:
- Centralização de informações clínicas
- Agendamento de consultas e exames
- Acompanhamento do status dos exames
- Organização e liberação de laudos
- Diferentes visões conforme o perfil do usuário

Este projeto possui finalidade exclusivamente educacional.

---

## 👥 Perfis de Usuário

- **Paciente**: agendamento de consultas e exames, acompanhamento de histórico e acesso a laudos.
- **Médico**: visualização de pacientes, exames em andamento e histórico clínico.
- **Biomédico**: gerenciamento de exames, atualização de status e emissão de laudos.
- **Administrador**: visão geral do sistema e gestão administrativa.

---

## 🧪 Tecnologias Utilizadas

Frontend:
- React
- Vite
- JavaScript
- HTML5
- CSS3

Backend:
- Node.js
- Express
- MySQL
- Sequelize
- JWT (Autenticação)

---

## 📂 Estrutura do Projeto

biosphere/
- client   (frontend)
- server   (backend)
- README.md

Observação: a pasta node_modules não é versionada no GitHub.

---

## ⚙️ Como Executar o Projeto

### Pré-requisitos

Antes de iniciar, é necessário ter instalado:
- Node.js (versão 18 ou superior)
- npm
- MySQL

---

## ▶️ Passo a Passo de Execução

### 1️⃣ Clonar o repositório

git clone https://github.com/gustavohenriqq/biopshere-finalversion.git  
cd biosphere

---

### 2️⃣ Executar o Backend

Entrar na pasta do servidor:  
cd server

Instalar dependências:  
npm install

Iniciar o backend:  
npm run dev

O backend será executado em:  
http://localhost:3001

---

### 3️⃣ Executar o Frontend

Abrir um novo terminal e entrar na pasta do frontend:  
cd client

Instalar dependências:  
npm install

Iniciar o frontend:  
npm run dev

O frontend estará disponível em:  
http://localhost:5173

---

## 🔗 Comunicação entre Frontend e Backend

O frontend consome a API REST do backend configurada em:  
http://localhost:3001

Importante: o backend deve estar em execução antes de utilizar o sistema no navegador.

---

## 📌 Observações Importantes

- A pasta node_modules não é enviada ao GitHub
- Sempre é necessário executar npm install após clonar o projeto
- Este comportamento é padrão em projetos Node.js
- O projeto não utiliza dados reais

---

## 📈 Possíveis Melhorias Futuras

- Separação do código em componentes menores
- Utilização de React Router
- Melhor validação de formulários
- Interface totalmente responsiva
- Deploy em ambiente de produção


---

## ⚠️ Aviso Legal

Este sistema não deve ser utilizado em ambiente médico real.  
Trata-se de um projeto educacional, sem armazenamento de dados sensíveis reais.
