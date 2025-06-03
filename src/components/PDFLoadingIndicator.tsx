import React from 'react';

interface PDFLoadingIndicatorProps {
  message?: string;
}

/**
 * Componente di caricamento per la generazione del PDF con compressione immagini
 */
const PDFLoadingIndicator: React.FC<PDFLoadingIndicatorProps> = ({ 
  message = "Compressione immagini a 150 DPI in corso..." 
}) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#f5f5f5',
      border: '1px solid #ddd',
      minHeight: '100px'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #f3f3f3',
        borderTop: '4px solid #3498db',
        borderRadius: '20px',
        animation: 'spin 1s linear infinite',
        marginBottom: '15px'
      }} />
      
      <p style={{
        margin: 0,
        fontSize: '14px',
        color: '#666',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        {message}
      </p>
      
      <p style={{
        margin: '5px 0 0 0',
        fontSize: '12px',
        color: '#999',
        textAlign: 'center',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        Ottimizzazione per una migliore qualità PDF...
      </p>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default PDFLoadingIndicator; 