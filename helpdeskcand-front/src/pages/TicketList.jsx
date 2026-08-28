import { useState } from 'react';
import TicketFilter from '../components/TicketFilter';

export default function TicketList() {
    const [statusFilter, setStatusFilter] = useState('Todos');

    return (
    <div>
        <h2>RF06 - Listagem e Filas</h2>
        <button>Fila Geral</button>
        <button>Fila Pessoal</button>
        
        <TicketFilter onFilterChange={(status) => setStatusFilter(status)} />

        <p>Filtro selecionado: <strong>{statusFilter}</strong></p>
    </div>
    );
}