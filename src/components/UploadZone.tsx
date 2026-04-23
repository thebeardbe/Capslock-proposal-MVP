import React, { useState } from 'react';

interface UploadZoneProps {
  onUpload: (text: string) => void;
  isLoading: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onUpload, isLoading }) => {
  const [isOver, setIsOver] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpload(event.target?.result as string);
      };
      reader.readAsText(file);
    } else {
      alert('Please upload a valid CSV file.');
    }
  };

  return (
    <div 
      className={`upload-zone ${isOver ? 'active' : ''} ${isLoading ? 'loading' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setIsOver(true); }}
      onDragLeave={() => setIsOver(false)}
      onDrop={handleDrop}
      onClick={() => document.getElementById('fileInput')?.click()}
    >
      <input 
        type="file" 
        id="fileInput" 
        style={{ display: 'none' }} 
        accept=".csv"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => onUpload(event.target?.result as string);
            reader.readAsText(file);
          }
        }}
      />
      <div className="upload-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M12 16V8M12 8L9 11M12 8L15 11" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 15V16C3 18.2091 4.79086 20 7 20H17C19.2091 20 21 18.2091 21 16V15" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9V8C3 5.79086 4.79086 4 7 4H17C19.2091 4 21 5.79086 21 8V9" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <h3>{isLoading ? 'Processing Data...' : 'Drop your performance CSV here'}</h3>
        <p>Support for Meta and Google Ads exports</p>
      </div>
    </div>
  );
};
