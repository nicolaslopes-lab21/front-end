export default function CreateTicket() {
    return (
    <div>
        <h2>RF03/RF04 - Abertura de Chamado</h2>
        <select>
        <option>Hardware</option>
        <option>Software</option>
        </select>
        <select>
        <option>Normal</option>
        <option>Médio</option>
        <option>Crítico</option>
        </select>
        <textarea placeholder="Descrição do problema"></textarea>
        <input type="file" />
        <button>Enviar Chamado</button>
    </div>
    );
}