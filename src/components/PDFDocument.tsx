import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { FormInputs } from '../types/form'
import { colors } from '../constants/theme'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

// Funzione per calcolare il numero stimato di pagine
const calculateExpectedPages = (data: FormInputs): number => {
  let estimatedHeight = 0;
  const pageHeight = 841; // A4 height in points (210mm * 72/25.4)
  const usableHeight = pageHeight - 200; // margins (30pt top/bottom) + header(50pt) + footer(70pt) = più realistico
  
  // Titolo principale + sottotitolo + linea (~ 35pt)
  estimatedHeight += 35;
  
  // Sezione progetto - header + 1 riga dati (~ 45pt)
  estimatedHeight += 45;
  
  // Dati lavorazione - 5 righe fisse (~ 25pt per riga = 125pt totali)
  estimatedHeight += 125;
  
  // Metodo verifica - dipende da opzioni selezionate (più compatto del previsto)
  const selectedMethods = Object.values(data.tipoIspezione).filter(Boolean).length;
  const methodsRows = Math.ceil(selectedMethods / 4); // 4 metodi per riga in realtà
  estimatedHeight += methodsRows * 15 + 25; // 15pt per riga + titolo
  
  // Oggetto sopralluogo - dipende dalla lunghezza del testo (più realistico)
  const textLength = data.oggettoSopralluogo?.length || 0;
  if (textLength > 0) {
    const estimatedLines = Math.ceil(textLength / 90); // ~90 caratteri per riga più realistici
    estimatedHeight += estimatedLines * 12 + 35; // 12pt per riga + titolo e margini
  } else {
    estimatedHeight += 45; // Spazio minimo anche se vuoto
  }
  
  // Esito controllo - dipende da opzioni selezionate (più compatto)
  const selectedResults = Object.values(data.esito).filter(Boolean).length;
  const resultsRows = Math.ceil(selectedResults / 3); // 3 risultati per riga
  estimatedHeight += resultsRows * 15 + 45; // 15pt per riga + titolo e note
  
  // Firme - 1 riga con 6 colonne (~ 35pt)
  estimatedHeight += 35;
  
  // Calcola il numero di pagine (più conservativo)
  const pages = Math.ceil(estimatedHeight / usableHeight);
  
  // Debug: mostra il calcolo (rimuovere in produzione)
  console.log(`Altezza stimata: ${estimatedHeight}pt, Altezza utile: ${usableHeight}pt, Pagine: ${pages}`);
  
  return Math.max(1, pages); // Almeno 1 pagina
};

// Funzione per creare il contenuto suddiviso per pagine
const createPagedContent = (data: FormInputs, compressedImages: Record<string, string>) => {
  const totalPages = calculateExpectedPages(data);
  
  // Contenuto principale (quello che hai già)
  const mainContent = (
    <>
      <Text style={styles.title}>SCHEDA DI VERIFICA</Text>
      <Text style={styles.subtitle}>Posa/Installazione/Lavoro</Text>
      <View style={styles.headerDividerThin}></View>

      {/* Sezione PROGETTO */}
      <View style={[styles.sectionWrapper, { position: 'relative' }]} wrap={false}>
        <View style={styles.grayBackground}>
           <Text style={styles.sectionTitle}>PROGETTO: {data.nomeProgetto}</Text>
        </View>
        <View style={styles.sectionLine}></View>
         <View style={styles.sectionRowLast}>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.sectionSubtitle}>Data ispezione</Text>
             <Text style={styles.value}>
               {format(new Date(data.dataIspezione), 'dd/MM/yyyy', { locale: it })}
             </Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.sectionSubtitle}>N. progressivo</Text>
             <Text style={styles.value}>{data.numero}</Text>
           </View>
           <View style={styles.sectionColumn}>
              {Object.entries(data.dl).map(([key, value]) => value && 
                <Text key={key} style={styles.sectionSubtitle}>{key.replace(/_/g, ' ').trim()}</Text>
              )}
           </View>
         </View>
        {/* Bordi esterni - renderizzati per ultimi */}
        <View style={styles.sectionBorderTop}></View>
        <View style={styles.sectionBorderBottom}></View>
        <View style={styles.sectionBorderLeft}></View>
        <View style={styles.sectionBorderRight}></View>
      </View>

      {/* Sezione Dati Lavorazione */}
       <View style={[styles.sectionWrapper, { position: 'relative' }]} wrap={false}>
          <View style={styles.sectionRow}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>Lavorazione Verificata</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.lavorazioneVerificata}</Text>
            </View>
          </View>
          <View style={styles.rowLine}></View>
           <View style={styles.sectionRow}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>Verifica materiale previsto</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.verificaMateriale}</Text>
            </View>
          </View>
          <View style={styles.rowLine}></View>
           <View style={styles.sectionRow}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>Riferimento Progetto costruttivo</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.riferimentoProgetto}</Text>
            </View>
          </View>
          <View style={styles.rowLine}></View>
           <View style={styles.sectionRow}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>Ubicazione - Localizzazione</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.ubicazione}</Text>
            </View>
          </View>
          <View style={styles.rowLine}></View>
           <View style={styles.sectionRowLast}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>Scheda controllo lavorazione</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.schedaControllo}</Text>
            </View>
          </View>
          {/* Bordi esterni - renderizzati per ultimi */}
          <View style={styles.sectionBorderTop}></View>
          <View style={styles.sectionBorderBottom}></View>
          <View style={styles.sectionBorderLeft}></View>
          <View style={styles.sectionBorderRight}></View>
       </View>

      {/* Sezione METODO DI VERIFICA */}
      <View style={styles.unBorderedSection} wrap={false}>
         <Text style={styles.sectionTitle}>METODO DI VERIFICA</Text>
         <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 12, gap: 20 , alignItems: 'center' }}>
           {Object.entries(data.tipoIspezione).map(([key, value]) => (
             <View key={key} style={{ flexDirection: 'row'}}>
               <Image
                 src={compressedImages[value ? 'checkbox_checked' : 'checkbox_unchecked']}
                 style={{ width: 12, height: 12, marginRight: 6 }}
               />
               <Text style={styles.checkboxOption}>
                 {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
               </Text>
             </View>
           ))}
         </View>
      </View>

      {/* Sezione OGGETTO DEL SOPRALLUOGO E ESITO CONTROLLO*/}
      <View style={[styles.sectionWrapper, { position: 'relative' }]}>
         <Text style={styles.sectionTitle}>OGGETTO DEL SOPRALLUOGO</Text>
         <View style={styles.sectionRowLast}>
           <View style={styles.sectionColumnFull}>
              <Text style={[styles.value]}>{data.oggettoSopralluogo}</Text>
           </View>
         </View>

         <Text style={styles.sectionTitle}>ESITO CONTROLLO</Text>
         <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 12, gap: 20 , alignItems: 'center' }} wrap={false}>
           {Object.entries(data.esito).map(([key, value]) => (
             <View key={key} style={{ flexDirection: 'row'}}>
               <Image
                 src={compressedImages[value ? 'checkbox_checked' : 'checkbox_unchecked']}
                 style={{ width: 12, height: 12, marginRight: 6 }}
               />
               <Text style={styles.checkboxOption}>
                 {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
               </Text>
             </View>
           ))}
         </View>
          <Text style={styles.noteText}>* Tale osservazione è da considerarsi prescrittiva – da ottemperare</Text>
         {/* Bordi esterni - renderizzati per ultimi */}
         <View style={styles.sectionBorderTop}></View>
         <View style={styles.sectionBorderBottom}></View>
         <View style={styles.sectionBorderLeft}></View>
         <View style={styles.sectionBorderRight}></View>
      </View>
      
      <View style={[styles.sectionWrapper, { position: 'relative' }]} wrap={false}>
         <View style={styles.sectionRowLast}>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>Ispettore</Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>NOME COGNOME</Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>Per conto di</Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>Mauro Eugenio Giuliani</Text>
           </View>
         </View>
         <View style={styles.sectionLine}></View>
         <View style={styles.sectionRowLast}>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.value}>Data verbale</Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
              <Text style={styles.value}>
                  {format(new Date(data.dataVerbale), 'dd/MM/yyyy', { locale: it })}
              </Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>Firma</Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             {/* <View style={styles.verticalDividerLine}></View> */}
             <Image
              src={compressedImages.firma}
              style={styles.firma}
            />
           </View>

         </View>
         {/* Bordi esterni - renderizzati per ultimi */}
         <View style={styles.sectionBorderTop}></View>
         <View style={styles.sectionBorderBottom}></View>
         <View style={styles.sectionBorderLeft}></View>
         <View style={styles.sectionBorderRight}></View>
      </View>
    </>
  );

  return { mainContent, totalPages };
};

// Registra un font (opzionale, dipende se vuoi usare un font specifico)
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 70,
    fontSize: 10,
    fontFamily: 'Helvetica',
    lineHeight: 1.5,
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
  },
  header: {
    flexDirection: 'column',
    marginBottom: 10,
    paddingTop: 15,
    paddingBottom: 7,
  },
  headerLine: {
    height: 1,
    backgroundColor: '#000',
    marginTop: 7,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,

  },
  logo: {
    width: 40, // Dimensione aggiustata per evitare deformazione
    height: 'auto', // Altezza automatica per mantenere proporzioni
    marginRight: 10,
  },
  firma: {
    width: 110, // Dimensione aggiustata per evitare deformazione
    height: 'auto', // Altezza automatica per mantenere proporzioni
    alignItems: 'center',
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.on_background,
  },
  headerDividerThick: {
    height: 1,
    backgroundColor: '#000',
  },
  headerTitleContainer: {
    MarginTop: 8,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
    //paddingBottom: 8,
    //marginTop: 10,
    
    //color: colors.on_background,
  },
  headerSubtitle: {
    fontSize: 10,
    textAlign: 'left',
    color: colors.on_surface_variant,
  },
   headerDividerThin: {
    height: 0.8,
    backgroundColor: '#ccc',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'left',
    fontSize: 8,
    color: colors.on_surface_variant,
    paddingTop: 10,
  },
  footerLine: {
    height: 1,
    backgroundColor: '#000',
    marginBottom: 10,
  },
  content: {
    marginTop: 8,
    marginBottom: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colors.on_background,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    color: colors.on_surface_variant,
    marginTop: 5,
    marginBottom: 10,
  },
  // Stili per le sezioni con bordo come nello screenshot
  borderedSection: {
    marginTop: 15,
  },
  // Container per sezione con wrapper di bordi
  sectionWrapper: {
    marginTop: 15,
  },
  unBorderedSection: {
    marginTop: 15,
  },
  // Stile per le sezioni con sfondo grigio
  grayBackground: {
    backgroundColor: colors.surface_container_highest, // Utilizzo un colore simile al grigio
  },
  sectionLine: {
    height: 0.5,
    backgroundColor: '#000',
  },
  // Stile per le righe all'interno delle sezioni
  sectionRow: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  rowLine: {
    height: 0.5,
    backgroundColor: '#000',
  },
  sectionRowLast: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  // Stile per le colonne all'interno delle righe
  sectionColumn: {
    flexGrow: 1,
    flexBasis: '50%',
    paddingHorizontal: 9,
  },
   sectionColumnFull: {
    flexGrow: 1,
    flexBasis: '100%',
    paddingHorizontal: 9,
  },
   sectionColumnThird: {
    flexGrow: 1,
    flexBasis: '33.33%',
    paddingHorizontal: 9,
  },
  // Stile per i bordi verticali tra le colonne
  verticalDivider: {
    position: 'relative',
  },
  verticalDividerLine: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 0.5,
    backgroundColor: '#ccc',
  },
  // Stili per i bordi delle sezioni
  sectionBorderTop: {
    height: 1,
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  sectionBorderBottom: {
    height: 1,
    backgroundColor: 'black',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sectionBorderLeft: {
    width: 1,
    backgroundColor: 'black',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  sectionBorderRight: {
    width: 1,
    backgroundColor: 'black',
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 5,
    color: colors.on_surface,
  },
  value: {
    color: colors.on_background,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'left',
    color: colors.on_background,
    margin: 9,

  },
   sectionSubtitle: {
    fontSize: 9,
    textAlign: 'left',
    color: colors.on_surface_variant,

   },
  checkboxGroup: {
    marginTop: 5,
  },
  checkboxOption: {
    marginTop: 1,
    color: colors.on_surface,
  },
  noteText: {
    fontSize: 8,
    color: colors.on_surface_variant,
    margin: 8,

  },
});

interface PDFDocumentProps {
  data: FormInputs;
}

interface PDFDocumentProps {
  data: FormInputs;
  compressedImages?: Record<string, string>;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ data, compressedImages }) => {
  // Fallback alle immagini originali se non sono fornite immagini compresse
  const imagesToUse = compressedImages || {
    logo: `${import.meta.env.BASE_URL}logo.png`,
    firma: `${import.meta.env.BASE_URL}firma.jpg`,
    checkbox_checked: `${import.meta.env.BASE_URL}images/checkbox_checked.png`,
    checkbox_unchecked: `${import.meta.env.BASE_URL}images/checkbox_unchecked.png`
  };

  const { mainContent } = createPagedContent(data, imagesToUse);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.logoRow}>
            <Image
              src={imagesToUse.logo}
              style={styles.logo}
            />
            <Text style={styles.companyName}>Redesco Progetti srl</Text>
          </View>
          {/* Linea sotto header - COMPATIBILE */}
          <View style={styles.headerLine}></View>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {mainContent}
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument 