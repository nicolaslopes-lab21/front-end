import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TechPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [tickets, setTickets] = useState(() => {
    return JSON.parse(localStorage.getItem('app_tickets') || '[]');
    });

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [solutionText, setSolutionText] = useState('');
    const [escalateLevel, setEscalateLevel] = useState('');

    const updateTickets = (updated) => {
    setTickets(updated);
    localStorage.setItem('app_tickets', JSON.stringify(updated));
    };

    const currentLevel = user.role ? user.role.replace('ATENDENTE_', '') : 'N1';

    const getEscalationOptions = (level) => {
    if (level === 'N1') return ['N2', 'N3'];
    if (level === 'N2') return ['N3'];
    return [];
    };

    const handleResolve = (id) => {
    if (!solutionText) return alert('Insira a solução para fechar o chamado.');
    const updated = tickets.map(t => t.id === id ? { ...t, status: 'FECHADO', solucao: solutionText } : t);
    updateTickets(updated);
    setSelectedTicket(null);
    setSolutionText('');
    };

    const handleEscalate = (id) => {
    if (!escalateLevel) return alert('Selecione um nível válido.');
    const updated = tickets.map(t => t.id === id ? { ...t, nivel: escalateLevel } : t);
    updateTickets(updated);
    setSelectedTicket(null);
    setEscalateLevel('');
    };

    const metrics = {
    abertos: tickets.filter(t => t.status === 'ABERTO').length,
    resolvidos: tickets.filter(t => t.status === 'FECHADO').length,
    atrasados: 0,
    hoje: tickets.filter(t => t.createdAt === new Date().toLocaleDateString('pt-BR')).length
    };

    const filteredTickets = tickets.filter(t => t.nivel === currentLevel);

    return (
    <div style={{ padding: '2rem', background: '#f4f6f9', minHeight: '100vh', color: '#333' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Painel de Atendimento Técnico (`/atendimento`)</h2>
            <div>
            <span style={{ marginRight: '1rem' }}>Perfil: <strong>{user.role}</strong></span>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ padding: '0.4rem 0.8rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
            </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div style={{ background: '#e3f2fd', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
            <small>Abertos</small><h3>{metrics.abertos}</h3>
            </div>
            <div style={{ background: '#e8f5e9', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
            <small>Resolvidos</small><h3>{metrics.resolvidos}</h3>
            </div>
            <div style={{ background: '#ffebee', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
            <small>Atrasados</small><h3>{metrics.atrasados}</h3>
            </div>
            <div style={{ background: '#fff3e0', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
            <small>Criados Hoje</small><h3>{metrics.hoje}</h3>
            </div>
        </div>

        <h3>Fila de Chamados - Nível {currentLevel}</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
            {filteredTickets.length === 0 ? <p>Nenhum chamado pendente no seu nível.</p> : filteredTickets.map(t => (
            <div key={t.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px', background: '#fafafa' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <strong>{t.id} - [{t.categoria}]</strong>
                <span>Status: <strong>{t.status}</strong></span>
                </div>
                <p style={{ margin: '0.5rem 0' }}>{t.descricao}</p>
                <small>Solicitante: {t.solicitante} | Anexo: {t.anexo}</small>

                {t.status !== 'FECHADO' && (
                <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                    <button onClick={() => setSelectedTicket({ ticket: t, type: 'atender' })} style={{ padding: '0.4rem 0.8rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Atender / Resolver</button>
                    
                    {getEscalationOptions(currentLevel).length > 0 && (
                    <button onClick={() => setSelectedTicket({ ticket: t, type: 'escalonar' })} style={{ padding: '0.4rem 0.8rem', background: '#fd7e14', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Escalonar</button>
                    )}
                </div>
                )}
            </div>
            ))}
        </div>

        {selectedTicket && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ background: '#fff', padding: '2rem', borderRadius: '8px', maxWidth: '400px', width: '100%' }}>
                <h3>{selectedTicket.type === 'atender' ? 'Resolver Chamado' : 'Escalonar Chamado'}</h3>
                <p>Protocolo: {selectedTicket.ticket.id}</p>

                {selectedTicket.type === 'atender' ? (
                <>
                    <textarea placeholder="Descrição da Solução..." value={solutionText} onChange={e => setSolutionText(e.target.value)} style={{ width: '100%', height: '80px', margin: '1rem 0', padding: '0.5rem' }} />
                    <button onClick={() => handleResolve(selectedTicket.ticket.id)} style={{ padding: '0.5rem 1rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirmar Solução</button>
                </>
                ) : (
                <>
                    <label style={{ display: 'block', margin: '1rem 0 0.5rem' }}>Elevar para qual nível?</label>
                    <select value={escalateLevel} onChange={e => setEscalateLevel(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}>
                    <option value="">-- Selecione --</option>
                    {getEscalationOptions(currentLevel).map(lvl => (
                        <option key={lvl} value={lvl}>{lvl}</option>
                    ))}
                    </select>
                    <button onClick={() => handleEscalate(selectedTicket.ticket.id)} style={{ padding: '0.5rem 1rem', background: '#fd7e14', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Confirmar Escalonamento</button>
                </>
                )}

                <button onClick={() => setSelectedTicket(null)} style={{ display: 'block', marginTop: '1rem', background: 'none', border: 'none', color: '#666', cursor: 'pointer' }}>Cancelar</button>
            </div>
            </div>
        )}
        </div>
    </div>
    );
}