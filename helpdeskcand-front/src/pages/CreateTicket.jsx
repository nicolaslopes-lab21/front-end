import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FileUpload from '../components/FileUpload';
import './CreateTicket.css';

export default function CreateTicket() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
    solicitante: '',
    empresa: '',
    equipamento: '',
    patrimonio: '',
    titulo: '',
    prioridade: 'Média',
    descricao: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);

    const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
    e.preventDefault();
    alert('Chamado registrado com sucesso!');
    navigate('/chamados');
    };

    return (
    <div className="create-ticket-container">
        <h2 className="create-ticket-title">Novo Chamado Técnico</h2>

        <form className="create-ticket-form" onSubmit={handleSubmit}>
        <div className="form-row">
            <input 
            type="text" 
            name="solicitante" 
            placeholder="Nome do Solicitante" 
            className="ticket-input" 
            value={formData.solicitante} 
            onChange={handleChange} 
            required 
            />
            <input 
            type="text" 
            name="empresa" 
            placeholder="Empresa / Setor" 
            className="ticket-input" 
            value={formData.empresa} 
            onChange={handleChange} 
            required 
            />
        </div>

        <div className="form-row">
            <input 
            type="text" 
            name="equipamento" 
            placeholder="Equipamento (ex: Notebook Dell)" 
            className="ticket-input" 
            value={formData.equipamento} 
            onChange={handleChange} 
            required 
            />
            <input 
            type="text" 
            name="patrimonio" 
            placeholder="Nº Patrimônio / Série" 
            className="ticket-input" 
            value={formData.patrimonio} 
            onChange={handleChange} 
            required 
            />
        </div>

        <div className="form-row">
            <input 
            type="text" 
            name="titulo" 
            placeholder="Título do Incidentes / Solicitação" 
            className="ticket-input" 
            value={formData.titulo} 
            onChange={handleChange} 
            required 
            />
            <select 
            name="prioridade" 
            className="ticket-input select-input" 
            value={formData.prioridade} 
            onChange={handleChange}
            >
            <option value="Baixa">Prioridade: Baixa</option>
            <option value="Média">Prioridade: Média</option>
            <option value="Alta">Prioridade: Alta</option>
            <option value="Crítica">Prioridade: Crítica</option>
            </select>
        </div>

        <textarea 
            name="descricao" 
            placeholder="Descrição detalhada do problema..." 
            className="ticket-textarea" 
            value={formData.descricao} 
            onChange={handleChange} 
            required 
        />

        <FileUpload onFileSelect={(file) => setSelectedFile(file)} />
        {selectedFile && <p className="file-name">Arquivo: {selectedFile.name}</p>}

        <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={() => navigate('/chamados')}>
            Cancelar
            </button>
            <button type="submit" className="btn-submit">
            Abrir Chamado
            </button>
        </div>
        </form>
    </div>
    );
}