import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import chamadoService from '../services/chamadoService';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [metrics, setMetrics] = useState({
    totalAbertos: 0,
    totalResolvidos: 0,
    totalAtrasados: 0,
    totalHoje: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        setLoading(true);
        const data = await chamadoService.obterDashboard();
        setMetrics(data);
      } catch (err) {
        console.error('Erro ao carregar métricas:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const totalGeral = (metrics.totalAbertos || 0) + (metrics.totalResolvidos || 0);

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h2>Dashboard de Métricas - HelpDesk CAnd</h2>
          <p>Visão geral do sistema de suporte em tempo real via API</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {currentUser?.perfil === 'SETOR_ADMINISTRATIVO' ? (
            <button className="nav-btn" onClick={() => navigate('/admin')}>Painel Admin</button>
          ) : (
            <button className="nav-btn" onClick={() => navigate('/atendimento')}>Painel Atendimento</button>
          )}
          <button className="logout-btn" onClick={() => { authService.logout(); navigate('/'); }}>Sair</button>
        </div>
      </header>

      {loading ? (
        <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>Carregando dados da API...</p>
      ) : (
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Chamados Totais</h3>
            <p className="metric-value">{totalGeral}</p>
          </div>

          <div className="metric-card warning">
            <h3>Em Aberto</h3>
            <p className="metric-value">{metrics.totalAbertos}</p>
          </div>

          <div className="metric-card danger">
            <h3>Atrasados (SLA Estourado)</h3>
            <p className="metric-value">{metrics.totalAtrasados}</p>
          </div>

          <div className="metric-card success">
            <h3>Resolvidos</h3>
            <p className="metric-value">{metrics.totalResolvidos}</p>
          </div>

          <div className="metric-card info">
            <h3>Abertos Hoje</h3>
            <p className="metric-value">{metrics.totalHoje}</p>
          </div>
        </div>
      )}
    </div>
  );
}