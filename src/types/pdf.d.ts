declare module '@react-pdf/renderer' {
  import { ReactNode } from 'react';

  export interface PDFDownloadLinkProps {
    document: ReactNode;
    fileName?: string;
    className?: string;
    children: (props: {
      blob: Blob | null;
      url: string | null;
      loading: boolean;
      error: Error | null;
    }) => ReactNode;
  }

  export const PDFDownloadLink: React.FC<PDFDownloadLinkProps>;
  export const PDFDocument: React.FC<{ data: any }>;
  
  export const Document: React.FC<{ children: ReactNode }>;
  export const Page: React.FC<{ size?: string; style?: any; children: ReactNode }>;
  export const Text: React.FC<{ style?: any; children?: ReactNode; render?: (props: { pageNumber: number; totalPages: number }) => string }>;
  export const View: React.FC<{ style?: any; children?: ReactNode; fixed?: boolean }>;
  export const StyleSheet: {
    create: (styles: Record<string, any>) => Record<string, any>;
  };
  export const Image: React.FC<{ src: string; style?: any }>;
} 