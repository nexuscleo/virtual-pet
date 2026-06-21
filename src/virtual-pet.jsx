import React, { useState, useEffect, useRef } from 'react';

export default function PetProgrammer({ username: propUsername }) {
  // Use propUsername if provided, otherwise fallback to local storage / default
  const [localStorageUsername, setLocalStorageUsername] = useState(() => {
    return localStorage.getItem('programmer_pet_username') || 'nexuscleo';
  });
  
  const username = propUsername || localStorageUsername;
  const [inputUsername, setInputUsername] = useState(username);
  
  // Sync input field if propUsername changes
  useEffect(() => {
    setInputUsername(username);
  }, [username]);

  const [petData, setPetData] = useState(() => {
    const cached = localStorage.getItem(`programmer_pet_data_${username}`);
    return cached ? JSON.parse(cached) : null;
  });

  const [loading, setLoading] = useState(!petData);
  const [error, setError] = useState(null);
  const [apiWarning, setApiWarning] = useState(null);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [activeTab, setActiveTab] = useState('pet'); // 'pet' or 'achievements'
  
  // Settings Panel State
  const [showSettings, setShowSettings] = useState(false);
  const [githubToken, setGithubToken] = useState(() => {
    return localStorage.getItem('programmer_pet_github_token') || '';
  });
  const [demoMode, setDemoMode] = useState(() => {
    return localStorage.getItem('programmer_pet_demo_mode') === 'true';
  });

  // Auto refresh state
  const [autoRefresh, setAutoRefresh] = useState(() => {
    return localStorage.getItem('programmer_pet_auto_refresh') === 'true';
  });
  const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

  // Level up animations state
  const [levelUpAnimate, setLevelUpAnimate] = useState(false);
  const [showLevelUpBadge, setShowLevelUpBadge] = useState(false);

  const countdownTimerRef = useRef(null);

  const achievementsList = [
    { id: 'first_repo', name: 'Primeiro Passo', desc: 'Criou pelo menos um repositório no GitHub', icon: '🌱', check: (data) => data.totalRepos > 0 },
    { id: 'commits_10', name: 'Commitador Iniciante', desc: 'Acumulou mais de 10 commits', icon: '📝', check: (data) => data.totalCommits >= 10 },
    { id: 'commits_100', name: 'Mestre dos Commits', desc: 'Acumulou mais de 100 commits', icon: '🚀', check: (data) => data.totalCommits >= 100 },
    { id: 'skills_3', name: 'Multitarefa', desc: 'Aprendeu pelo menos 3 linguagens de programação', icon: '📚', check: (data) => data.skillCount >= 3 },
    { id: 'skills_5', name: 'Poliglota Supremo', desc: 'Aprendeu pelo menos 5 linguagens de programação', icon: '🧠', check: (data) => data.skillCount >= 5 },
    { id: 'level_5', name: 'Evolução Avançada', desc: 'Seu pet alcançou o Nível 5', icon: '🔥', check: (data) => data.petLevel >= 5 },
    { id: 'level_10', name: 'Lendário', desc: 'Seu pet alcançou o Nível Máximo (Nível 10)', icon: '👑', check: (data) => data.petLevel >= 10 },
    { id: 'js_expert', name: 'Dev Web', desc: 'Aprendeu JavaScript ou TypeScript', icon: '⚡', check: (data) => data.skills.some(s => s.name === 'JavaScript' || s.name === 'TypeScript') },
  ];

  const generateMockData = (targetUser = username) => {
    setLoading(true);
    setError(null);
    setApiWarning(null);

    // Short timeout to simulate API loading call
    setTimeout(() => {
      const baseLanguages = ['JavaScript', 'TypeScript', 'Python', 'HTML', 'CSS', 'Go', 'Rust', 'Ruby', 'Java'];
      // Simple stable hash based on username
      const userHash = targetUser.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const numLanguages = 3 + (userHash % 5);
      const selectedLangs = baseLanguages.slice(0, numLanguages);

      // Get previous state from local storage to increment commits and simulate growth
      let previousData = null;
      const cached = localStorage.getItem(`programmer_pet_data_${targetUser}`);
      if (cached) {
        previousData = JSON.parse(cached);
      }

      const skills = selectedLangs.map((lang, idx) => {
        let prevSkill = previousData ? previousData.skills.find(s => s.name === lang) : null;
        // In demo mode, update randomly increments commits by 1 to 5 to trigger level-ups!
        let commits = prevSkill 
          ? prevSkill.commits + Math.floor(Math.random() * 6) + 1 
          : 5 + ((userHash * (idx + 1)) % 35);
        let repos = prevSkill ? prevSkill.repos : 1 + ((userHash + idx) % 4);

        return {
          name: lang,
          commits,
          repos,
          xp: 0, // calculated below
          level: Math.min(5, Math.floor((commits / 10) + 1))
        };
      });

      const totalCommits = skills.reduce((sum, s) => sum + s.commits, 0);
      skills.forEach(s => {
        s.xp = Math.round((s.commits / Math.max(totalCommits, 1)) * 1000);
      });
      skills.sort((a, b) => b.xp - a.xp);

      const totalXp = skills.reduce((sum, s) => sum + s.xp, 0);
      const petLevel = Math.min(10, 1 + Math.floor(skills.length / 2));
      const skillCount = skills.length;

      const newPetData = {
        username: targetUser,
        skills,
        totalXp,
        petLevel,
        skillCount,
        totalCommits,
        totalRepos: 3 + (userHash % 12),
        lastUpdated: new Date().toISOString(),
        isDemo: true
      };

      // Trigger Level Up celebration if level increased
      if (previousData && newPetData.petLevel > previousData.petLevel) {
        triggerLevelUpAnimation();
      }

      localStorage.setItem(`programmer_pet_data_${targetUser}`, JSON.stringify(newPetData));
      setPetData(newPetData);
      setLoading(false);
    }, 800);
  };

  const fetchGitHubData = async (targetUser = username) => {
    if (demoMode) {
      generateMockData(targetUser);
      return;
    }

    setLoading(true);
    setError(null);
    setApiWarning(null);

    const headers = {};
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    try {
      // Fetch user repos
      const reposRes = await fetch(`https://api.github.com/users/${targetUser}/repos?per_page=100`, { headers });
      if (!reposRes.ok) {
        if (reposRes.status === 403) {
          throw new Error('Limite de taxa (Rate Limit) do GitHub excedido. Adicione um Token GitHub nas configurações ou ative o Modo Demo.');
        }
        throw new Error(`Usuário "${targetUser}" não encontrado no GitHub.`);
      }
      
      const repos = await reposRes.json();

      // Aggregate languages and commits
      const languageStats = {};
      let totalCommits = 0;

      // Limit repo processing to avoid hitting rate limit too fast
      const maxReposToProcess = Math.min(repos.length, 12);

      for (let i = 0; i < maxReposToProcess; i++) {
        const repo = repos[i];
        if (!repo.language) continue;

        try {
          // Fetch commits for this repo
          const commitsRes = await fetch(`https://api.github.com/repos/${targetUser}/${repo.name}/commits?per_page=1`, { headers });
          if (commitsRes.ok) {
            const commitsData = await commitsRes.json();
            const linkHeader = commitsRes.headers.get('link');
            let commitCount = 1;
            
            if (linkHeader) {
              const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
              if (match) commitCount = parseInt(match[1], 10);
            } else if (Array.isArray(commitsData) && commitsData.length === 0) {
              commitCount = 0;
            }

            if (!languageStats[repo.language]) {
              languageStats[repo.language] = { commits: 0, repos: 0 };
            }
            languageStats[repo.language].commits += commitCount;
            languageStats[repo.language].repos += 1;
            totalCommits += commitCount;
          }
        } catch (commitErr) {
          console.warn(`Erro ao buscar commits para ${repo.name}:`, commitErr);
        }
      }

      // Convert to skills with XP
      const skills = Object.entries(languageStats)
        .map(([lang, stats]) => ({
          name: lang,
          commits: stats.commits,
          repos: stats.repos,
          xp: Math.round((stats.commits / Math.max(totalCommits, 1)) * 1000),
          level: Math.min(5, Math.floor((stats.commits / 10) + 1))
        }))
        .sort((a, b) => b.xp - a.xp);

      // Calculate pet stats
      const totalXp = skills.reduce((sum, s) => sum + s.xp, 0);
      const petLevel = Math.min(10, 1 + Math.floor(skills.length / 2));
      const skillCount = skills.length;

      const newPetData = {
        username: targetUser,
        skills,
        totalXp,
        petLevel,
        skillCount,
        totalCommits,
        totalRepos: repos.length,
        lastUpdated: new Date().toISOString()
      };

      // Check for Level Up!
      const cached = localStorage.getItem(`programmer_pet_data_${targetUser}`);
      if (cached) {
        const cachedData = JSON.parse(cached);
        if (newPetData.petLevel > cachedData.petLevel) {
          triggerLevelUpAnimation();
        }
      }

      // Save to localStorage
      localStorage.setItem(`programmer_pet_data_${targetUser}`, JSON.stringify(newPetData));
      setPetData(newPetData);
      setLoading(false);
    } catch (err) {
      console.error(err);
      
      // Attempt fallback to cached version
      const cached = localStorage.getItem(`programmer_pet_data_${targetUser}`);
      if (cached) {
        setPetData(JSON.parse(cached));
        setApiWarning(`Exibindo dados em cache. Detalhes: ${err.message}`);
        setLoading(false);
      } else {
        setError(err.message);
        setLoading(false);
      }
    }
  };

  const triggerLevelUpAnimation = () => {
    setLevelUpAnimate(true);
    setShowLevelUpBadge(true);
    setTimeout(() => {
      setLevelUpAnimate(false);
    }, 1500);
    setTimeout(() => {
      setShowLevelUpBadge(false);
    }, 3000);
  };

  // Handle auto-refresh interval and countdown timer
  useEffect(() => {
    // Only auto refresh if not in read-only mode (propUsername not provided)
    if (autoRefresh && !propUsername) {
      fetchGitHubData(username);

      countdownTimerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchGitHubData(username);
            return 300; // Reset to 5 mins
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
      setCountdown(300);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [autoRefresh, username, demoMode, propUsername]);

  // Initial Fetch on load (if no cache exists, or just background update)
  useEffect(() => {
    fetchGitHubData(username);
  }, [username]);

  const handleUserChange = (e) => {
    e.preventDefault();
    if (inputUsername.trim() && inputUsername !== username) {
      const newUser = inputUsername.trim();
      setLocalStorageUsername(newUser);
      localStorage.setItem('programmer_pet_username', newUser);
      
      // Load cached data for new user if it exists to show immediately
      const cached = localStorage.getItem(`programmer_pet_data_${newUser}`);
      if (cached) {
        setPetData(JSON.parse(cached));
      } else {
        setPetData(null);
      }
      
      fetchGitHubData(newUser);
    }
  };

  const handleAutoRefreshToggle = () => {
    const nextVal = !autoRefresh;
    setAutoRefresh(nextVal);
    localStorage.setItem('programmer_pet_auto_refresh', String(nextVal));
  };

  const handleDemoModeToggle = () => {
    const nextVal = !demoMode;
    setDemoMode(nextVal);
    localStorage.setItem('programmer_pet_demo_mode', String(nextVal));
    setPetData(null); // Force refresh
    generateMockData(username);
  };

  const handleTokenChange = (val) => {
    setGithubToken(val);
    localStorage.setItem('programmer_pet_github_token', val);
  };

  // Pet visual helper based on level
  const getPetEmoji = (level) => {
    if (level <= 2) return '🐣';
    if (level <= 4) return '🐥';
    if (level <= 6) return '🦆';
    if (level <= 8) return '🦅';
    return '🐉';
  };

  const formatCountdown = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Controls & Mode Header - HIDE if username is provided as prop */}
      {!propUsername && (
        <div className="glass-card" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
          <form onSubmit={handleUserChange} style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <label style={{ fontWeight: '500', color: 'var(--text-primary)' }}>GitHub:</label>
            <input
              type="text"
              value={inputUsername}
              onChange={(e) => setInputUsername(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-card)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
                width: '140px'
              }}
            />
            <button type="submit" className="tab-btn" style={{ padding: '8px 15px', fontSize: '14px', margin: 0 }}>
              Alterar
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <button 
              onClick={() => setShowSettings(!showSettings)} 
              className="tab-btn" 
              style={{ padding: '8px 12px', fontSize: '16px', margin: 0 }}
              title="Configurações"
            >
              ⚙️
            </button>

            <div className="toggle-container" onClick={handleAutoRefreshToggle}>
              <label className="switch">
                <input type="checkbox" checked={autoRefresh} readOnly />
                <span className="slider"></span>
              </label>
              <span style={{ fontSize: '14px', fontWeight: '500', color: 'var(--text-primary)' }}>
                Auto-Monitoramento
              </span>
            </div>

            <button 
              onClick={() => fetchGitHubData(username)} 
              disabled={loading}
              className="tab-btn" 
              style={{ padding: '8px 15px', fontSize: '14px', margin: 0 }}
            >
              {loading ? 'Buscando...' : 'Atualizar 🔄'}
            </button>
          </div>
        </div>
      )}

      {/* Expandable Settings Panel */}
      {showSettings && !propUsername && (
        <div className="glass-card" style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '15px', border: '1px dashed var(--primary)' }}>
          <h4 style={{ margin: 0, color: 'var(--primary)' }}>⚙️ Painel de Configurações</h4>
          
          {/* GitHub Token configuration */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-primary)' }}>
              Token de Acesso Pessoal (PAT) do GitHub (Opcional):
            </label>
            <input
              type="password"
              placeholder="ghp_..."
              value={githubToken}
              onChange={(e) => handleTokenChange(e.target.value)}
              style={{
                padding: '8px 12px',
                border: '1px solid var(--border-card)',
                borderRadius: '8px',
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-primary)',
              }}
            />
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
              Dica: Adicionar um token pessoal do GitHub previne erros de Rate Limit ao atualizar dados com frequência.
            </span>
          </div>

          <hr style={{ border: 0, borderTop: '1px solid var(--border-card)', margin: '5px 0' }} />

          {/* Demo Mode Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Modo de Demonstração (Dados Simulados)</strong>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Gera estatísticas simuladas para qualquer usuário (clique em "Atualizar" para simular novos commits e level-ups).
              </span>
            </div>
            <div className="toggle-container" onClick={handleDemoModeToggle}>
              <label className="switch">
                <input type="checkbox" checked={demoMode} readOnly />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Warnings & Errors */}
      {apiWarning && (
        <div style={{ padding: '10px 15px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid var(--warning)', borderRadius: '8px', color: 'var(--warning)', fontSize: '14px', textAlign: 'left' }}>
          ⚠️ <strong>Aviso:</strong> {apiWarning}
        </div>
      )}

      {error && (
        <div style={{ padding: '15px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid var(--danger)', borderRadius: '8px', color: 'var(--danger)', textAlign: 'left' }}>
          ❌ <strong>Erro:</strong> {error}
          {!propUsername && (
            <div style={{ marginTop: '10px', fontSize: '13px', color: 'var(--text-secondary)' }}>
              👉 Você pode abrir o painel de configurações clicando em <strong>⚙️</strong> no topo para ativar o <strong>Modo Demo</strong> com dados simulados ou inserir um <strong>Token pessoal do GitHub</strong>.
            </div>
          )}
        </div>
      )}

      {/* Realtime Monitoring Pulse Info */}
      {autoRefresh && !propUsername && (
        <div style={{ textAlign: 'left', fontSize: '14px', paddingLeft: '5px', display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
          <span className="pulse-dot"></span>
          <span>Monitoramento ativo. Próxima checagem automática em <strong>{formatCountdown(countdown)}</strong>.</span>
        </div>
      )}

      {/* Content Area */}
      {loading && !petData ? (
        <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', display: 'inline-block' }} className="pet-container level-up-animate">🥚</div>
          <h3 style={{ margin: '15px 0 5px' }}>Conectando ao GitHub...</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Buscando informações e gerando seu pet...</p>
        </div>
      ) : petData ? (
        <>
          {/* Navigation Tabs */}
          <div className="tabs-container">
            <button
              className={`tab-btn ${activeTab === 'pet' ? 'active' : ''}`}
              onClick={() => setActiveTab('pet')}
            >
              Meu Pet {petData.isDemo && '(Demo)'} 🎮
            </button>
            <button
              className={`tab-btn ${activeTab === 'achievements' ? 'active' : ''}`}
              onClick={() => setActiveTab('achievements')}
            >
              Conquistas 🏆
            </button>
          </div>

          {activeTab === 'pet' ? (
            <>
              {/* Pet Display Card */}
              <div className="glass-card" style={{ position: 'relative' }}>
                <div className={`pet-container ${levelUpAnimate ? 'level-up-animate' : ''}`}>
                  {getPetEmoji(petData.petLevel)}
                  {showLevelUpBadge && <div className="level-up-text">LEVEL UP! 🎉</div>}
                </div>
                
                <h3 style={{ margin: '10px 0 5px', fontSize: '24px' }}>
                  {petData.username}'s Programmer Pet {petData.isDemo && <span style={{ fontSize: '12px', background: 'var(--warning)', color: '#fff', padding: '2px 6px', borderRadius: '4px', verticalAlign: 'middle' }}>DEMO</span>}
                </h3>
                
                <p style={{ color: 'var(--text-secondary)', marginBottom: '15px' }}>
                  Nível {petData.petLevel} • {petData.skillCount} habilidades aprendidas • Humor: {petData.totalXp > 500 ? '😊' : petData.totalXp > 200 ? '😌' : '😐'}
                </p>

                {/* Progress bar */}
                <div style={{ maxWidth: '400px', margin: '0 auto 10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                    <span>XP do Pet</span>
                    <span>{petData.totalXp} / 2000 XP</span>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill" 
                      style={{ width: `${Math.min(100, (petData.totalXp / 2000) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                {petData.lastUpdated && (
                  <span style={{ fontSize: '11px', color: 'var(--text-secondary)', opacity: 0.7 }}>
                    Última sincronização: {new Date(petData.lastUpdated).toLocaleTimeString()}
                  </span>
                )}
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
                <div className="glass-card" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Total de Commits</span>
                  <div className="stats-number">{petData.totalCommits}</div>
                </div>
                <div className="glass-card" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Repositórios</span>
                  <div className="stats-number">{petData.totalRepos}</div>
                </div>
                <div className="glass-card" style={{ padding: '15px' }}>
                  <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Linguagens</span>
                  <div className="stats-number">{petData.skillCount}</div>
                </div>
              </div>

              {/* Skills List */}
              <div className="glass-card">
                <h3 style={{ margin: '0 0 15px', textAlign: 'left' }}>Habilidades Aprendidas</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {petData.skills.length > 0 ? (
                    petData.skills.map((skill, idx) => (
                      <div
                        key={idx}
                        onClick={() => setSelectedSkill(selectedSkill === idx ? null : idx)}
                        style={{
                          background: 'var(--bg-card)',
                          border: '1px solid var(--border-card)',
                          borderRadius: '12px',
                          padding: '12px 16px',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          backgroundColor: selectedSkill === idx ? 'var(--bg-card-hover)' : 'var(--bg-card)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '20px' }}>
                              {skill.name === 'JavaScript' ? '⚡' : skill.name === 'TypeScript' ? '🎯' : skill.name === 'Python' ? '🐍' : skill.name === 'HTML' ? '🏗️' : skill.name === 'CSS' ? '🎨' : skill.name === 'Java' ? '☕' : skill.name === 'Go' ? '🎯' : skill.name === 'Rust' ? '⚙️' : skill.name === 'Ruby' ? '💎' : skill.name === 'PHP' ? '🐘' : '📚'}
                            </span>
                            <strong style={{ color: 'var(--text-primary)' }}>{skill.name}</strong>
                            <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '12px', background: 'var(--primary-light)', color: '#fff' }}>
                              Lv. {skill.level}
                            </span>
                          </div>
                          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                            {skill.commits} commits • {skill.xp} XP
                          </span>
                        </div>
                        
                        {selectedSkill === idx && (
                          <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-card)', fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'left' }}>
                            📈 <strong>Progresso:</strong> {skill.level}/5
                            <br />
                            📂 <strong>Repositórios associados:</strong> {skill.repos}
                            <br />
                            💡 <strong>Próximo nível em:</strong> {Math.max(0, (skill.level * 10) - skill.commits)} commits
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '20px' }}>
                      Nenhuma habilidade identificada nos repositórios processados.
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            /* Achievements Tab */
            <div className="glass-card">
              <h3 style={{ margin: '0 0 5px', textAlign: 'left' }}>Conquistas Disponíveis</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'left', marginBottom: '20px' }}>
                Marcos desbloqueados com base no progresso das suas habilidades do GitHub.
              </p>

              <div className="achievements-grid">
                {achievementsList.map((ach) => {
                  const isUnlocked = ach.check(petData);
                  return (
                    <div 
                      key={ach.id} 
                      className={`achievement-card ${isUnlocked ? 'unlocked' : 'locked'}`}
                    >
                      <span className="achievement-icon">
                        {isUnlocked ? ach.icon : '🔒'}
                      </span>
                      <div className="achievement-details" style={{ textAlign: 'left' }}>
                        <h4 style={{ fontWeight: '600' }}>{ach.name}</h4>
                        <p>{ach.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      ) : (
        /* No data (meaning fetch failed and there is no cache stored under this username) */
        <div className="glass-card" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <div style={{ fontSize: '40px' }}>🥚</div>
          <h3 style={{ margin: '15px 0 5px' }}>Sem dados do pet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', maxWidth: '500px', margin: '0 auto 20px' }}>
            Não foi possível inicializar o seu pet para o usuário "{username}".
            Isso geralmente ocorre se o perfil não existe ou se o limite de taxa (Rate Limit) da API do GitHub foi atingido.
          </p>
          <button 
            className="tab-btn" 
            style={{ display: 'inline-block' }}
            onClick={() => fetchGitHubData(username)}
          >
            Tentar Novamente 🔄
          </button>
        </div>
      )}
    </div>
  );
}
