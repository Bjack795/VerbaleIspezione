import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer'
import { FormInputs } from '../types/form'
import { colors } from '../constants/theme'
import { format } from 'date-fns'
import { it } from 'date-fns/locale'

// Registra un font (opzionale, dipende se vuoi usare un font specifico)
// Font.register({ family: 'Roboto', src: '/fonts/Roboto-Regular.ttf' });

const styles = StyleSheet.create({
  page: {
    padding: 30,
    paddingBottom: 50,
    fontSize: 10,
    fontFamily: 'Helvetica',
    position: 'relative',
    lineHeight: 1.5, // Migliora la leggibilità
  },
  header: {
    flexDirection: 'column',
    marginBottom: 10,
    paddingTop: 15,
    paddingBottom: 7,
    borderBottom: '1 solid #000',
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
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.on_background,
  },
  headerDividerThick: {
    borderBottom: '1 solid #000',
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
    borderBottom: '0.8 solid #ccc',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'left',
    fontSize: 8,
    color: colors.on_surface_variant,
    borderTop: '1 solid #000',
    paddingTop: 10,
  },
  content: {
    marginTop: 8, // Aumento lo spazio per il nuovo header
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
    border: '1 solid #000',
    /*marginBottom: 15,*/
    marginTop: 15,
  },
  unBorderedSection: {
    /*marginBottom: 15,*/
    marginTop: 15,
  },
  // Stile per le sezioni con sfondo grigio
  grayBackground: {
    backgroundColor: colors.surface_container_highest, // Utilizzo un colore simile al grigio
    borderBottom: '0.5 solid #000',
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
            src={`${import.meta.env.BASE_URL}logo.png`}
            style={styles.logo}
          />
          <Text style={styles.companyName}>Redesco Progetti srl</Text>
        </View>
      
      </View>

      {/* Content */}
      <View style={styles.content}>
        <Text style={styles.title}>SCHEDA DI VERIFICA</Text>
        <Text style={styles.subtitle}>Posa/Installazione/Lavoro</Text>
        {/*<View style={styles.headerDividerThick}></View>*/}
        <View style={styles.headerDividerThin}></View>

        {/* Sezione PROGETTO */}
        <View style={styles.borderedSection}>
          <View style={styles.grayBackground}>
             <Text style={styles.sectionTitle}>PROGETTO: {data.nomeProgetto}</Text>
          </View>
           <View style={styles.sectionRowLast}> {/* Ultima riga senza bordo inferiore */}
             <View style={[styles.sectionColumn, styles.verticalDivider]}>
               <Text style={styles.sectionSubtitle}>Data</Text>
               <Text style={styles.value}>
                 {format(new Date(data.dataIspezione), 'dd/MM/yyyy', { locale: it })}
               </Text>
             </View>
             <View style={[styles.sectionColumn, styles.verticalDivider]}>
               <Text style={styles.sectionSubtitle}>N. progressivo</Text>
               <Text style={styles.value}>{data.numero}</Text>
             </View>
             <View style={styles.sectionColumn}>
                {Object.entries(data.dl).map(([key, value]) => value && 
                  <Text key={key} style={styles.sectionSubtitle}>{key.replace(/_/g, ' ').trim()}</Text>
                )}
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
        <View style={styles.unBorderedSection}>
           <Text style={styles.sectionTitle}>METODO DI VERIFICA</Text>
           <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 12, gap: 20 , alignItems: 'center' }}>
             {Object.entries(data.tipoIspezione).map(([key, value]) => (
               <View key={key} style={{ flexDirection: 'row'}}>
                 <Image
                   src={`${import.meta.env.BASE_URL}images/${value ? 'checkbox_checked' : 'checkbox_unchecked'}.png`}
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
        <View style={styles.borderedSection}>
           <Text style={styles.sectionTitle}>OGGETTO DEL SOPRALLUOGO</Text>
           <View style={styles.sectionRowLast}> {/* Ultima riga senza bordo inferiore */}
             <View style={styles.sectionColumnFull}>
                <Text style={styles.value}>{data.oggettoSopralluogo}</Text>
             </View>
           </View>

           <Text style={styles.sectionTitle}>ESITO CONTROLLO</Text>
           <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginLeft: 12, gap: 20 , alignItems: 'center' }}>
             {Object.entries(data.esito).map(([key, value]) => (
               <View key={key} style={{ flexDirection: 'row'}}>
                 <Image
                   src={`${import.meta.env.BASE_URL}images/${value ? 'checkbox_checked' : 'checkbox_unchecked'}.png`}
                   style={{ width: 12, height: 12, marginRight: 6 }}
                 />
                 <Text style={styles.checkboxOption}>
                   {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                 </Text>
               </View>
             ))}
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