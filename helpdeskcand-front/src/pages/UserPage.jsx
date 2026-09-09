import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function UserPage() {
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user')) || {};

    const [tickets, setTickets] = useState(() => {
    const savedTickets = JSON.parse(localStorage.getItem('app_tickets') || '[]');
    return savedTickets.filter(t => t.solicitante === user.email);
    });

    const [formData, setFormData] = useState({ categoria: 'HARDWARE', urgencia: 'NORMAL', descricao: '' });
    const [file, setFile] = useState(null);
    const [fileError, setFileError] = useState('');

    const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
        const allowedTypes = ['application/pdf', 'image/svg+xml', 'image/png', 'image/jpeg'];
        if (!allowedTypes.includes(selectedFile.type)) {
        setFileError('Anexo inválido! Somente extensões .pdf, .svg, .png e .jpg são permitidas.');
        setFile(null);
        e.target.value = null;
        } else {
        setFileError('');
        setFile(selectedFile);
        }
    }
    };

    const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!user.emailConfirmed) {
        alert('Bloqueado: Seu e-mail precisa estar confirmado para abrir chamados.');
        return;
    }

    const allTickets = JSON.parse(localStorage.getItem('app_tickets') || '[]');
    const protocolNumber = String(allTickets.length + 1).padStart(4, '0');
    const newTicket = {
        id: `HD-2026-${protocolNumber}`,
        solicitante: user.email,
        categoria: formData.categoria,
        urgencia: formData.urgencia,
        descricao: formData.descricao,
        anexo: file ? file.name : 'Nenhum',
        status: 'ABERTO',
        nivel: 'N1',
      slaLimit: new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        createdAt: new Date().toLocaleDateString('pt-BR')
    };

    const updated = [...allTickets, newTicket];
    localStorage.setItem('app_tickets', JSON.stringify(updated));
    setTickets(updated.filter(t => t.solicitante === user.email));
    setFormData({ categoria: 'HARDWARE', urgencia: 'NORMAL', descricao: '' });
    setFile(null);
    };

    return (
    <div style={{ padding: '2rem', background: '#f4f6f9', minHeight: '100vh', color: '#333' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h2>Painel do Usuário (`/usuario`)</h2>
            <button onClick={() => { localStorage.clear(); navigate('/'); }} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
        </div>

        {!user.emailConfirmed && (
            <div style={{ background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
            <strong>Aviso:</strong> Por favor, confirme seu e-mail para habilitar o envio de novos chamados.
            </div>
        )}

        <h3>Abrir Novo Chamado</h3>
        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
            <select value={formData.categoria} onChange={e => setFormData({ ...formData, categoria: e.target.value })} style={{ padding: '0.5rem' }}>
            <option value="HARDWARE">HARDWARE</option>
            <option value="SOFTWARE">SOFTWARE</option>
            <option value="REDES">REDES</option>
            </select>

            <select value={formData.urgencia} onChange={e => setFormData({ ...formData, urgencia: e.target.value })} style={{ padding: '0.5rem' }}>
            <option value="NORMAL">NORMAL</option>
            <option value="MEDIO">MÉDIO</option>
            <option value="CRITICO">CRÍTICO</option>
            </select>

            <textarea placeholder="Descrição do problema..." value={formData.descricao} onChange={e => setFormData({ ...formData, descricao: e.target.value })} required style={{ padding: '0.5rem', height: '80px' }} />

            <div>
            <label style={{ display: 'block', fontSize: '0.85rem' }}>Anexo (.pdf, .svg, .png, .jpg):</label>
            <input type="file" onChange={handleFileChange} />
            {fileError && <p style={{ color: 'red', fontSize: '0.85rem' }}>{fileError}</p>}
            </div>

            <button type="submit" disabled={!user.emailConfirmed} style={{ padding: '0.75rem', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: user.emailConfirmed ? 'pointer' : 'not-allowed' }}>
            Enviar Chamado
            </button>
        </form>

        <h3>Meus Chamados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr style={{ background: '#eee', textAlign: 'left' }}>
                <th style={{ padding: '0.5rem' }}>Protocolo</th>
                <th style={{ padding: '0.5rem' }}>Categoria</th>
                <th style={{ padding: '0.5rem' }}>Status</th>
                <th style={{ padding: '0.5rem' }}>Limite SLA</th>
            </tr>
            </thead>
            <tbody>
            {tickets.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={{ padding: '0.5rem' }}><strong>{t.id}</strong></td>
                <td style={{ padding: '0.5rem' }}>{t.categoria}</td>
                <td style={{ padding: '0.5rem' }}>{t.status}</td>
                <td style={{ padding: '0.5rem' }}>{t.slaLimit}</td>
                </tr>
            ))}
            </tbody>
        </table>
        </div>
    </div>
    );
}