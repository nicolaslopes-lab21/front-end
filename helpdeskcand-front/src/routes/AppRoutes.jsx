import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import CompleteRegister from '../pages/CompleteRegister';
import CreateTicket from '../pages/CreateTicket';
import TicketList from '../pages/TicketList';

export default function AppRoutes() {
    return (
    <BrowserRouter>
        <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/completar-cadastro" element={<CompleteRegister />} />
        <Route path="/novo-chamado" element={<CreateTicket />} />
        <Route path="/chamados" element={<TicketList />} />
        </Routes>
    </BrowserRouter>
    );
}