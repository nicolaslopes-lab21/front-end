import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TicketFilter from '../components/TicketFilter';
import './TicketList.css';

export default function TicketList() {
    const [activeTab, setActiveTab] = useState('geral');
    const [statusFilter, setStatusFilter] = useState('Todos');
    const navigate = useNavigate();

    const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
    };

    return (
    <div className="ticket-list-container">
        <h2 className="ticket-list-title">Listagem e Filas</h2>

        <div className="ticket-list-tabs">
        <button 
            className={`ticket-tab ${activeTab === 'geral' ? 'active' : ''}`}
            onClick={() => setActiveTab('geral')}
        >
            Fila Geral
        </button>
        <button 
            className={`ticket-tab ${activeTab === 'pessoal' ? 'active' : ''}`}
            onClick={() => setActiveTab('pessoal')}
        >
            Fila Pessoal
        </button>
        </div>

        <TicketFilter onFilterChange={(status) => setStatusFilter(status)} />

        <p className="ticket-list-status">
        Fila atual: <strong className="status-highlight">{activeTab === 'geral' ? 'Geral' : 'Pessoal'}</strong> | 
        Filtro: <strong className="status-highlight">{statusFilter}</strong>
        </p>

        <div className="ticket-list-footer">
        <button className="back-button" onClick={handleLogout}>
            ← Voltar
        </button>
        </div>
    </div>
    );
}