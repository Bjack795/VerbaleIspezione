import React from 'react';
import { FormInputs } from '../types/form';
import { useCompressedImages } from '../hooks/useCompressedImages';
import PDFDocument from './PDFDocument';
import { ultraCompactImageConfig } from '../config/imageCompression';

interface PDFDocumentWrapperProps {
  data: FormInputs;
}

/**
 * Wrapper per il PDFDocument che gestisce la compressione delle immagini a 150 DPI
 */
const PDFDocumentWrapper: React.FC<PDFDocumentWrapperProps> = ({ data }) => {
  const { compressedImages, isLoading, error } = useCompressedImages(ultraCompactImageConfig);

  // Non renderizzare finché le immagini non sono pronte
  if (isLoading) {
    return null;
  }

  // Log degli errori se presenti, ma continua con il rendering
  if (error) {
    console.warn('PDFDocumentWrapper: Utilizzo immagini fallback a causa di errori:', error);
  }

  return <PDFDocument data={data} compressedImages={compressedImages} />;
};

export default PDFDocumentWrapper; 