import './FileUpload.css';

export default function FileUpload({ onFileSelect }) {
    return (
    <div>
        <label>Anexar Evidências: </label>
        <input 
        type="file" 
        onChange={(e) => onFileSelect(e.target.files[0])} 
        />
    </div>
    );
}