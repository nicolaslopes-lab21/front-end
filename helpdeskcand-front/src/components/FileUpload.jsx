export default function FileUpload({ onFileSelect }) {
    const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && onFileSelect) {
        onFileSelect(file);
    }
    };

    return (
    <div className="file-upload-container">
        <label htmlFor="file-input" className="file-upload-label">
        📷 Anexar Evidência (Foto)
        </label>
        <input 
        id="file-input" 
        type="file" 
        accept="image/*" 
        onChange={handleFileChange}
        style={{ display: 'none' }}
        />
    </div>
    );
}