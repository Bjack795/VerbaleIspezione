import React from 'react';
import { FormInputs } from '../types/form';
import { useCompressedImages } from '../hooks/useCompressedImages';
import PDFLoadingIndicator from './PDFLoadingIndicator';
import { PDFDocument } from './PDFDocument';

interface PDFDocumentWrapperProps {
  data: FormInputs;
}

/**
 * Wrapper per il PDFDocument che gestisce il caricamento e la compressione delle immagini
 * Prima di renderizzare il PDF effettivo
 */
const PDFDocumentWrapper: React.FC<PDFDocumentWrapperProps> = ({ data }) => {
  const { compressedImages, isLoading, error } = useCompressedImages();

  // Mostra il componente di loading durante la compressione delle immagini
  if (isLoading) {
    return <PDFLoadingIndicator />;
  }

  // Log degli errori se presenti, ma continua con il rendering
  if (error) {
    console.warn('PDFDocumentWrapper: Utilizzo immagini fallback a causa di errori:', error);
  }

  return <PDFDocument data={data} compressedImages={compressedImages} />;
};

export default PDFDocumentWrapper; 