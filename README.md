# 🎮 Virtual Programmer Pet

O **Virtual Programmer Pet** é uma aplicação React interativa que gera um "bicho de estimação virtual" para desenvolvedores com base em suas atividades no GitHub. O pet evolui (ganha níveis e muda de forma) conforme você faz commits e trabalha em diferentes linguagens de programação.

Esta aplicação foi desenvolvida com foco em **alta estética visual (glassmorphism)**, micro-animações, persistência de dados local e total resiliência a limites de taxa (Rate Limit) da API do GitHub.

---

## ✨ Funcionalidades

- **Evolução Dinâmica**: Seu pet cresce e evolui através de 5 formas visuais diferentes (de 🐣 Ovo/Pinto até 🐉 Dragão Lendário) com base no nível global calculado a partir das suas estatísticas.
- **Skills & XP por Linguagem**: A aplicação analisa seus repositórios públicos, identifica as linguagens que você utiliza e calcula níveis de proficiência (XP) individuais para cada uma.
- **Conquistas Desbloqueáveis (Achievements)**: Uma aba dedicada lista conquistas automáticas (ex: "Poliglota", "Mestre dos Commits") que mudam visualmente de bloqueadas (cinza com cadeado 🔒) para desbloqueadas (coloridas e vibrantes ✨) conforme você atinge os marcos de desenvolvimento.
- **Animações de Level Up**: Efeitos de bounce e brilho neon acompanhados de uma comemoração flutuante quando o pet sobe de nível.
- **Modo de Auto-Monitoramento**: Atualização automática periódica (a cada 5 minutos) com indicador pulsante (pulse dot) e temporizador na tela.
- **Persistência de Dados (localStorage)**: Os dados do pet e configurações ficam salvos no seu computador. A aplicação inicia de forma instantânea (optimistic rendering) e funciona mesmo em modo offline através do cache local.
- **Modo de Demonstração (Demo)**: Permite gerar dados simulados interativos. Clicar em "Atualizar" adiciona commits aleatórios para que você possa ver a barra de progresso encher e o pet subir de nível instantaneamente!
- **Suporte a GitHub Token (PAT)**: Evite bloqueios de limite de taxa (Rate Limit) da API do GitHub configurando um token pessoal diretamente pelo painel de configurações (⚙️).

---

## 🚀 Como Executar o Projeto Localmente

Se você deseja rodar a aplicação completa e interativa em sua máquina:

1. Certifique-se de ter o **Node.js** instalado.
2. Clone este repositório:
   ```bash
   git clone https://github.com/nexuscleo/virtualpet-portifolio.git
   cd virtual-pet
   ```
3. Instale as dependências:
   ```bash
   npm install
   ```
4. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
5. Abra o navegador em [http://localhost:5173/](http://localhost:5173/).

---

## 💼 Como Integrar o Widget no Seu Portfólio (React)

O componente foi estruturado para ser facilmente embutido em qualquer projeto React (como portfólios pessoais). Quando você passa o nome de usuário diretamente pelas propriedades, ele oculta toda a barra de controle superior de pesquisa e configurações, oferecendo uma exibição limpa e focada no seu pet.

### Passo 1: Copiar os arquivos
1. Copie o arquivo `src/virtual-pet.jsx` para dentro do seu projeto React.
2. Copie os estilos correspondentes ao pet contidos em `src/App.css` (classes como `.pet-container`, `.glass-card`, `.progress-bar-container`, `.achievements-grid`, `.achievement-card`, etc.) para o arquivo de estilos global do seu portfólio.

### Passo 2: Importar e Renderizar
Basta importar o componente e renderizá-lo passando a propriedade `username`:

```jsx
import React from 'react';
import PetProgrammer from './components/virtual-pet';

export default function Portfolio() {
  return (
    <div className="portfolio-container">
      <header>
        <h1>Bem-vindo ao meu Portfólio!</h1>
      </header>
      
      {/* Seção do seu Pet do GitHub */}
      <section className="pet-section">
        <h2>Meu Programmer Pet:</h2>
        <PetProgrammer username="seu-usuario-do-github" />
      </section>
    </div>
  );
}
```

---

## ⚙️ Configurações e Solução de Problemas

### Evitando o Rate Limit do GitHub
A API pública do GitHub limita usuários não autenticados a **60 requisições por hora**. Como a aplicação varre seus repositórios para mapear as linguagens e commits, você pode atingir esse limite rapidamente durante o desenvolvimento.

**Para resolver isso:**
1. Clique no botão de engrenagem **⚙️** no topo do aplicativo.
2. Insira um **Token de Acesso Pessoal (PAT)** do GitHub (você pode gerar um em *Settings > Developer Settings > Personal Access Tokens* no seu perfil do GitHub, sem precisar marcar nenhuma permissão/escopo para dados públicos).
3. O token fica salvo com total segurança apenas no `localStorage` do seu navegador local.

---

## 📝 Licença

Este projeto está licenciado sob a licença MIT. Sinta-se livre para usar, modificar e distribuir em seu portfólio!
