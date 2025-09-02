import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { FormInputs } from '../types/form'
import { colors } from '../constants/theme'
import { format } from 'date-fns'
import { it, enUS } from 'date-fns/locale'
import { Language } from '../hooks/useTranslation'
import { HeaderType } from '../hooks/useHeaderSelection'

// Mappatura delle label corrette per lingue
const tipoIspezioneLabels: Record<string, Record<Language, string>> = {
  'visivo': { it: 'Visivo', en: 'Visual' },
  'rilievo': { it: 'Rilievo/Verifica misure', en: 'Survey/Measurements' },
  'test': { it: 'Test/Collaudo', en: 'Test/Commissioning' },
  'altro': { it: 'Altro', en: 'Other' }
}

const esitoLabels: Record<string, Record<Language, string>> = {
  'conforme': { it: 'Conforme/Positivo', en: 'Conformant/Positive' },
  'nonConforme': { it: 'Non conforme', en: 'Non-conformant' },
  'osservazione': { it: 'Osservazione*', en: 'Observation*' }
}

const dlLabels: Record<string, Record<Language, string>> = {
  'DLG': { it: 'DLG', en: 'Gen. COW' },
  'DLS': { it: 'DLS', en: 'Struct. COW' },
  'COLLAUDATORE': { it: 'Collaudatore', en: 'Static Tester' },
  'DL_FACCIATE': { it: 'DL Facciate', en: 'Facades COW' },
  'DL_ELETTRICI': { it: 'DLI Ele.', en: 'Elec. COW' },
  'DL_MECCANICI': { it: 'DLI Mec.', en: 'Mech. COW' }
}

// Funzione per ottenere traduzioni
const getTranslation = (key: string, language: Language): string => {
  const translations: Record<string, Record<Language, string>> = {
    'scheda_verifica': { it: 'SCHEDA DI VERIFICA', en: 'INSPECTION REPORT' },
    'posa_installazione': { it: 'Posa/Installazione/Lavoro', en: 'Installation/Work' },
    'progetto': { it: 'PROGETTO', en: 'PROJECT' },
    'metodo_verifica': { it: 'METODO DI VERIFICA', en: 'CHECKING METHODS' },
    'oggetto_sopralluogo': { it: 'OGGETTO DEL SOPRALLUOGO', en: 'DESCRIPTION' },
    'esito_controllo': { it: 'ESITO CONTROLLO', en: 'CHECK RESULT' },
    'data_ispezione': { it: 'Data ispezione', en: 'Inspection date' },
    'n_progressivo': { it: 'N. progressivo', en: 'Number' },
    'lavorazione_verificata': { it: 'Lavorazione Verificata', en: 'Inspected works' },
    'verifica_materiale': { it: 'Verifica materiale previsto', en: 'Material check' },
    'riferimento_progetto': { it: 'Riferimento Progetto (ESE/COSTR)', en: 'Shop drawings reference' },
    'ubicazione': { it: 'Ubicazione - Localizzazione', en: 'Location' },
    'scheda_controllo': { it: 'Scheda controllo lavorazione', en: 'Checklist' },
    'nota_osservazione': { it: '* Tale osservazione è da considerarsi prescrittiva – da ottemperare', en: '* Please consider this observation as a prescription, it must be followed' },
    'data_verbale': { it: 'Data verbale', en: 'Report date' },
    'ispettore': { it: 'Ispettore', en: 'Inspector' },
    'per_conto_di': { it: 'Per conto di', en: 'On behalf of' },
    'firma': { it: 'Firma', en: 'Signature' },
    'footer_pdf': { it: 'Redesco Progetti srl - Scheda di Verifica | Pagina', en: 'Redesco Progetti srl - Inspection Report | Page' },
    'di': { it: 'di', en: 'of' },
    'figura': { it: 'Figura', en: 'Figure' }
  }
  
  return translations[key]?.[language] || key
}

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

// Funzione per parsare e renderizzare il testo con formattazione HTML
const renderFormattedText = (text: string, baseStyle: any) => {
  if (!text) return <Text style={baseStyle}></Text>;

  // LOG: testo RAW prima di qualsiasi sostituzione/normalizzazione
  console.log('PDFDocument - RAW before normalization:', JSON.stringify(text));

  // Normalizza spazi non separabili ed eccessi di spazi
  const normalized = text
    .replace(/&nbsp;/g, ' ')
    .replace(/[ \t\f\v\u00A0]+/g, ' ');

  if (!normalized.includes('<') || !normalized.includes('>')) {
    return <Text style={baseStyle}>{normalized}</Text>;
  }

  const withComposedFontFamily = (style: any) => {
    // Non forzare varianti specifiche (Helvetica-Oblique/BoldOblique) per evitare errori di risoluzione font
    // Lascia che fontWeight/fontStyle agiscano sul font di base definito a livello di pagina/stile
    return { ...style };
  };

  const parseSegments = (input: string, style: any): React.ReactNode[] => {
    const segments: React.ReactNode[] = [];
    const regex = /<(b|i|u)>([\s\S]*?)<\/\1>/g;
    let lastIndex = 0;

    for (const match of input.matchAll(regex)) {
      const start = match.index as number;
      const end = start + match[0].length;
      const tag = match[1];
      const content = match[2];

      if (start > lastIndex) {
        const plain = input.slice(lastIndex, start);
        if (plain) {
          segments.push(
            <Text key={`plain-${lastIndex}-${start}`} style={style}>
              {plain}
            </Text>
          );
        }
      }

      let nextStyle = { ...style };
      if (tag === 'b') nextStyle = { ...nextStyle, fontWeight: 'bold' };
      if (tag === 'i') nextStyle = { ...nextStyle, fontStyle: 'italic' };
      if (tag === 'u') nextStyle = { ...nextStyle, textDecoration: 'underline' };
      nextStyle = withComposedFontFamily(nextStyle);

      const inner = parseSegments(content, nextStyle);

      // NON wrappare se ci sono segmenti figli: lascia che i figli applichino lo stile più specifico
      if (inner.length > 0) {
        segments.push(...inner);
      } else {
        segments.push(
          <Text key={`leaf-${start}-${end}`} style={nextStyle}>
            {content}
          </Text>
        );
      }

      lastIndex = end;
    }

    if (lastIndex < input.length) {
      const tail = input.slice(lastIndex);
      if (tail) {
        segments.push(
          <Text key={`tail-${lastIndex}-${input.length}`} style={style}>
            {tail}
          </Text>
        );
      }
    }

    return segments;
  };

  const segments = parseSegments(normalized, withComposedFontFamily(baseStyle));
  // Usa un singolo Text contenitore per mantenere il flusso inline ed evitare wrap indesiderati
  return (
    <Text style={withComposedFontFamily(baseStyle)}>
      {segments}
    </Text>
  );
};


// Funzione per creare il contenuto suddiviso per pagine
const createPagedContent = (data: FormInputs, compressedImages: Record<string, string>, language: Language = 'it') => {
  const totalPages = calculateExpectedPages(data);
  
  // Contenuto principale (quello che hai già)
  const mainContent = (
    <>
      <Text style={styles.title}>{getTranslation('scheda_verifica', language)}</Text>
      <Text style={styles.subtitle}>{getTranslation('posa_installazione', language)}</Text>
      <View style={styles.headerDividerThin}></View>

      {/* Sezione PROGETTO */}
      <View style={[styles.sectionWrapper, { position: 'relative' }]} wrap={false}>
        <View style={styles.grayBackground}>
           <Text style={styles.sectionTitle}>{getTranslation('progetto', language)}: {data.numeroCommessa} - {data.nomeProgetto}</Text>
        </View>
        <View style={styles.sectionLine}></View>
         <View style={styles.sectionRowLast}>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.sectionSubtitle}>{getTranslation('data_ispezione', language)}</Text>
             <Text style={styles.value}>
               {format(new Date(data.dataIspezione), 'dd/MM/yyyy', { locale: language === 'en' ? enUS : it })}
             </Text>
           </View>
           <View style={[styles.sectionColumn, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.sectionSubtitle}>{getTranslation('n_progressivo', language)}</Text>
             <Text style={styles.value}>{data.numero}</Text>
           </View>
           <View style={styles.sectionColumn}>
              {Object.entries(data.dl).map(([key, value]) => value && 
                <Text key={key} style={styles.sectionSubtitle}>{dlLabels[key]?.[language] || key}</Text>
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
              <Text style={styles.label}>{getTranslation('lavorazione_verificata', language)}</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.lavorazioneVerificata}</Text>
            </View>
          </View>
          <View style={styles.sectionLineLight}></View>
           <View style={styles.sectionRow}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>{getTranslation('verifica_materiale', language)}</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.verificaMateriale}</Text>
            </View>
          </View>
          <View style={styles.sectionLineLight}></View>
           <View style={styles.sectionRow}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>{getTranslation('riferimento_progetto', language)}</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.riferimentoProgetto}</Text>
            </View>
          </View>
          <View style={styles.sectionLineLight}></View>
           <View style={styles.sectionRow}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>{getTranslation('ubicazione', language)}</Text>
            </View>
            <View style={styles.sectionColumn}>
              <Text style={styles.value}>{data.ubicazione}</Text>
            </View>
          </View>
          <View style={styles.sectionLineLight}></View>
           <View style={styles.sectionRowLast}>
            <View style={[styles.sectionColumn, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.label}>{getTranslation('scheda_controllo', language)}</Text>
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
         <Text style={styles.sectionTitle}>{getTranslation('metodo_verifica', language)}</Text>
         <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 12, gap: 20 , alignItems: 'center' }}>
           {Object.entries(data.tipoIspezione).map(([key, value]) => (
             <View key={key} style={{ flexDirection: 'row'}}>
               <Image
                 src={compressedImages[value ? 'checkbox_checked' : 'checkbox_unchecked']}
                 style={{ width: 12, height: 12, marginRight: 6 }}
               />
               <Text style={styles.checkboxOption}>
                 {tipoIspezioneLabels[key]?.[language] || key}
               </Text>
             </View>
           ))}
         </View>
      </View>

      {/* Sezione OGGETTO DEL SOPRALLUOGO E ESITO CONTROLLO*/}
      <View style={[styles.sectionWrapper]}>
         {/* Bordi orizzontali inline per garantire visibilità su più pagine */}
         <View style={styles.inlineBorderLine}></View>
         {/* Riga con colonne: bordo sinistro, contenuto (titolo + testo), bordo destro */}
         <View style={styles.oggettoRow}>
           <View style={styles.sideBorder}></View>
           <View style={styles.oggettoContent}>
             <Text style={styles.sectionTitle}>{getTranslation('oggetto_sopralluogo', language)}</Text>
             <View style={styles.sectionRowLast}>
               <View style={styles.sectionColumnFull}>
                 {renderFormattedText(data.oggettoSopralluogo, styles.value)}
               </View>
             </View>
           </View>
           <View style={styles.sideBorder}></View>
         </View>
         <View style={styles.inlineBorderLine}></View>

         <Text style={styles.sectionTitle}>{getTranslation('esito_controllo', language)}</Text>
         <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 12, gap: 20 , alignItems: 'center' }} wrap={false}>
           {Object.entries(data.esito).map(([key, value]) => (
             <View key={key} style={{ flexDirection: 'row'}}>
               <Image
                 src={compressedImages[value ? 'checkbox_checked' : 'checkbox_unchecked']}
                 style={{ width: 12, height: 12, marginRight: 6 }}
               />
               <Text style={styles.checkboxOption}>
                 {esitoLabels[key]?.[language] || key}
               </Text>
             </View>
           ))}
         </View>
          <Text style={styles.noteText}>{getTranslation('nota_osservazione', language)}</Text>
      </View>
      
      <View style={[styles.sectionWrapper, { position: 'relative' }]} wrap={false}>
         <View style={styles.sectionRowLast}>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>{getTranslation('data_verbale', language)}</Text>
           </View>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>{getTranslation('ispettore', language)}</Text>
           </View>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>{getTranslation('per_conto_di', language)}</Text>
           </View>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>{getTranslation('firma', language)}</Text>
           </View>
         </View>
         <View style={styles.sectionLineLight}></View>
         <View style={styles.sectionRowLast}>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
              <View style={styles.verticalDividerLine}></View>
              <Text style={styles.value}>
                  {format(new Date(data.dataVerbale), 'dd/MM/yyyy', { locale: language === 'en' ? enUS : it })}
              </Text>
           </View>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>{data.ispettore}</Text>
           </View>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
             <View style={styles.verticalDividerLine}></View>
             <Text style={styles.value}>Mauro Eugenio Giuliani</Text>
           </View>
           <View style={[styles.sectionColumnCentered, styles.verticalDivider]}>
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
    width: 100, // Dimensione aggiustata per evitare deformazione
    height: 'auto', // Altezza automatica per mantenere proporzioni
    marginRight: 10,
  },
  logoMaestrale: {
    width: 70, // Logo più grande per Maestrale
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
  sectionLineLight: {
    height: 0.5,
    marginHorizontal: 10,
    backgroundColor: '#ccc',
  },
  // Bordi inline per sezioni che si spezzano su più pagine
  inlineBorderLine: {
    height: 0.8,
    backgroundColor: 'black',
    marginHorizontal: 0,
  },
  oggettoRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  sideBorder: {
    width: 0.8,
    backgroundColor: 'black',
  },
  oggettoContent: {
    flexGrow: 1,
    flexBasis: '100%',
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
  sectionRowLastCentered: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  // Stile per le colonne all'interno delle righe
  sectionColumnCentered: {
    flexGrow: 1,
    flexBasis: '50%',
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  sectionBox: {
    borderStyle: 'solid',
    borderColor: 'black',
    borderTopWidth: 0.8,
    borderRightWidth: 0.8,
    borderBottomWidth: 0.8,
    borderLeftWidth: 0.8,
    paddingBottom: 2,
  },
  sectionBorderTop: {
    height: 0.8,
    backgroundColor: 'black',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  sectionBorderBottom: {
    height: 0.8,
    backgroundColor: 'black',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  sectionBorderLeft: {
    width: 0.8,
    backgroundColor: 'black',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  sectionBorderRight: {
    width: 0.8,
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
  compressedImages?: Record<string, string>;
  language?: Language;
  headerType?: HeaderType;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ data, compressedImages, language = 'it', headerType = 'redesco' }) => {
  // Configurazione header basata sul tipo selezionato
  const logoPath = headerType === 'maestrale' ? 'logo_mae.png' : 'logo.png'
  const companyName = headerType === 'maestrale' ? 'Maestrale Srl' : ' '
  
  // Fallback alle immagini originali se non sono fornite immagini compresse
  const imagesToUse = compressedImages || {
    logo: `${import.meta.env.BASE_URL}${logoPath}`,
    firma: `${import.meta.env.BASE_URL}firma.jpg`,
    checkbox_checked: `${import.meta.env.BASE_URL}images/checkbox_checked.png`,
    checkbox_unchecked: `${import.meta.env.BASE_URL}images/checkbox_unchecked.png`
  };

  const { mainContent } = createPagedContent(data, imagesToUse, language);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header} fixed>
          <View style={styles.logoRow}>
            <Image
              src={imagesToUse.logo}
              style={headerType === 'maestrale' ? styles.logoMaestrale : styles.logo}
            />
            <Text style={styles.companyName}>{companyName}</Text>
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