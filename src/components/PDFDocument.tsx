import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { FormInputs } from '../types/form'
import { colors } from '../constants/theme'

// Registra un font (opzionale, dipende se vuoi usare un font specifico)
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
    lineHeight: 1.5, // Migliora la leggibilità
  },
  header: {
    position: 'absolute',
    top: 30,
    left: 30,
    right: 30,
    // Rimuovo display flex qui per gestire layout interno diversamente
    // borderBottom: '1 solid #000', // Sposto il bordo più in basso
    // paddingBottom: 10,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 60, // Dimensione aggiustata per evitare deformazione
    height: 'auto', // Altezza automatica per mantenere proporzioni
    marginRight: 10,
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.on_background,
  },
  headerDividerThick: {
    borderBottom: '1 solid #000',
    marginBottom: 10,
  },
  headerTitleContainer: {
     marginBottom: 15,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 3,
    color: colors.on_background,
  },
  headerSubtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
    color: colors.on_surface_variant,
  },
   headerDividerThin: {
    borderBottom: '0.5 solid #ccc',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 8,
    color: colors.on_surface_variant,
    borderTop: '1 solid #000',
    paddingTop: 10,
  },
  content: {
    marginTop: 100, // Aumento lo spazio per il nuovo header
    marginBottom: 60,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
    color: colors.on_background,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 20,
    color: colors.on_surface_variant,
  },
  // Stili per le sezioni con bordo come nello screenshot
  borderedSection: {
    border: '1 solid #000',
    marginBottom: 15,
  },
  // Stile per le sezioni con sfondo grigio
  grayBackground: {
    backgroundColor: colors.surface_container_highest, // Utilizzo un colore simile al grigio
    padding: 8,
  },
  // Stile per le righe all'interno delle sezioni
  sectionRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #ccc',
    paddingVertical: 5,
  },
  sectionRowLast: {
    flexDirection: 'row',
    paddingVertical: 5,
  },
  // Stile per le colonne all'interno delle righe
  sectionColumn: {
    flexGrow: 1,
    flexBasis: '50%',
    paddingHorizontal: 8,
  },
   sectionColumnFull: {
    flexGrow: 1,
    flexBasis: '100%',
    paddingHorizontal: 8,
  },
   sectionColumnThird: {
    flexGrow: 1,
    flexBasis: '33.33%',
    paddingHorizontal: 8,
  },
  // Stile per i bordi verticali tra le colonne
  verticalDivider: {
    borderRight: '0.5 solid #ccc',
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
    color: colors.on_background,
    marginBottom: 5,
  },
   sectionSubtitle: {
    fontSize: 9,
    color: colors.on_surface_variant,
    marginBottom: 5,
   },
  checkboxGroup: {
    marginTop: 5,
  },
  checkboxOption: {
    marginBottom: 3,
    color: colors.on_surface,
  },
  noteText: {
    fontSize: 8,
    color: colors.on_surface_variant,
    marginTop: 10,
  }
});

interface PDFDocumentProps {
  data: FormInputs;
}

const PDFDocument: React.FC<PDFDocumentProps> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header} fixed>
        <View style={styles.logoRow}>
          <Image
            src="/image001.png"
            style={styles.logo}
          />
          <Text style={styles.companyName}>Redesco Progetti srl</Text>
        </View>
        <View style={styles.headerDividerThick}></View>
        <View style={styles.headerTitleContainer}>
           <Text style={styles.headerTitle}>SCHEDA DI VERIFICA</Text>
           <Text style={styles.headerSubtitle}>Posa/Installazione/Lavoro</Text>
        </View>
         <View style={styles.headerDividerThin}></View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Rimuovo i vecchi titoli che ora sono nell'header */}
        {/* <Text style={styles.title}>SCHEDA DI VERIFICA</Text> */}
        {/* <Text style={styles.subtitle}>Posa/Installazione/Lavoro</Text> */}

        {/* Sezione PROGETTO */}
        <View style={styles.borderedSection}>
          <View style={styles.grayBackground}>
             <Text style={styles.sectionTitle}>PROGETTO: {data.nomeProgetto}</Text>
          </View>
           <View style={styles.sectionRowLast}> {/* Ultima riga senza bordo inferiore */}
             <View style={[styles.sectionColumn, styles.verticalDivider]}>
               <Text style={styles.sectionSubtitle}>Data</Text>
               <Text style={styles.value}>{data.dataIspezione}</Text>
             </View>
             <View style={[styles.sectionColumn, styles.verticalDivider]}>
               <Text style={styles.sectionSubtitle}>N. progressivo</Text>
               <Text style={styles.value}>{data.numero}</Text>
             </View>
             <View style={styles.sectionColumn}>
               <Text style={styles.sectionSubtitle}>DLS</Text>
                {/* Spazio per DLS, non nel form */}
               <Text style={styles.value}></Text>
             </View>
           </View>
        </View>

        {/* Sezione Dati Lavorazione */}
         <View style={styles.borderedSection}>
            <View style={styles.sectionRow}>
              <View style={[styles.sectionColumn, styles.verticalDivider]}>
                <Text style={styles.label}>Lavorazione Verificata</Text>
              </View>
              <View style={styles.sectionColumn}>
                <Text style={styles.value}>{data.lavorazioneVerificata}</Text>
              </View>
            </View>
             <View style={styles.sectionRow}>
              <View style={[styles.sectionColumn, styles.verticalDivider]}>
                <Text style={styles.label}>Verifica materiale previsto</Text>
              </View>
              <View style={styles.sectionColumn}>
                <Text style={styles.value}>{data.verificaMateriale}</Text>
              </View>
            </View>
             <View style={styles.sectionRow}>
              <View style={[styles.sectionColumn, styles.verticalDivider]}>
                <Text style={styles.label}>Riferimento Progetto costruttivo</Text>
              </View>
              <View style={styles.sectionColumn}>
                <Text style={styles.value}>{data.riferimentoProgetto}</Text>
              </View>
            </View>
             <View style={styles.sectionRow}>
              <View style={[styles.sectionColumn, styles.verticalDivider]}>
                <Text style={styles.label}>Ubicazione - Localizzazione</Text>
              </View>
              <View style={styles.sectionColumn}>
                <Text style={styles.value}>{data.ubicazione}</Text>
              </View>
            </View>
             <View style={styles.sectionRowLast}> {/* Ultima riga senza bordo inferiore */}
              <View style={[styles.sectionColumn, styles.verticalDivider]}>
                <Text style={styles.label}>Scheda controllo lavorazione</Text>
              </View>
              <View style={styles.sectionColumn}>
                <Text style={styles.value}>{data.schedaControllo}</Text>
              </View>
            </View>
         </View>


        {/* Sezione METODO DI VERIFICA */}
        <View style={styles.borderedSection}>
           <Text style={styles.sectionTitle}>METODO DI VERIFICA</Text>
           <View style={[styles.sectionRowLast, { justifyContent: 'space-around' }]}> {/* Ultima riga senza bordo inferiore */}
              {Object.entries(data.tipoIspezione).map(([key, value]) => value && 
                 <Text key={key} style={styles.checkboxOption}>▢ {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}</Text>
              )}
           </View>
        </View>

        {/* Sezione OGGETTO DEL SOPRALLUOGO */}
        <View style={styles.borderedSection}>
           <Text style={styles.sectionTitle}>OGGETTO DEL SOPRALLUOGO</Text>
           <View style={styles.sectionRowLast}> {/* Ultima riga senza bordo inferiore */}
             <View style={styles.sectionColumnFull}>
                <Text style={styles.value}>{data.oggettoSopralluogo}</Text>
             </View>
           </View>
        </View>

         {/* Sezione ESITO CONTROLLO */}
        <View style={styles.borderedSection}>
           <Text style={styles.sectionTitle}>ESITO CONTROLLO</Text>
           <View style={styles.sectionRow}> {/* Ultima riga senza bordo inferiore */}
              <View style={[styles.sectionColumn, styles.verticalDivider]}>
                 {Object.entries(data.esito).map(([key, value]) => value && 
                  <Text key={key} style={styles.checkboxOption}>▢ {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}</Text>
                 )}
              </View>
               <View style={styles.sectionColumn}>
                 {/* Colonna vuota per allineamento */}
               </View>
           </View>
            <Text style={styles.noteText}>* Tale osservazione è da considerarsi prescrittiva – da ottemperare</Text>
        </View>


      </View>

      {/* Footer */}
      <View style={styles.footer} fixed>
        <Text>Pagina <Text render={({ pageNumber, totalPages }) => `${pageNumber} di ${totalPages}`} /></Text>
      </View>
    </Page>
  </Document>
);

export default PDFDocument 