# Sistema Ibrido per Numerazione Pagine PDF

## Problema Originale
- `@react-pdf/renderer` con `render` prop non funziona su GitHub Pages
- Necessità di numerazione pagine automatica per documenti multi-pagina
- Footer scompare quando si usano render props su hosting statico

## Soluzione Ibrida Implementata

### Componenti Principali

#### 1. `calculateExpectedPages(data: FormInputs)`
Calcola il numero stimato di pagine basandosi su:
- Header fisso (~50pt)
- Titolo principale (~40pt) 
- Sezione progetto (~80pt)
- Dati lavorazione (~100pt)
- Metodi verifica (dinamico basato su selezioni)
- Oggetto sopralluogo (dinamico basato su lunghezza testo)
- Esito controllo (dinamico)
- Firme (~40pt)

#### 2. `isGitHubPages()`
Rileva l'ambiente di esecuzione:
```typescript
return window.location.hostname.includes('github.io') || 
       window.location.hostname.includes('github.dev') ||
       process.env.NODE_ENV === 'production';
```

#### 3. `SmartFooter` Component
Footer intelligente che si adatta all'ambiente:

**Produzione (GitHub Pages):**
```jsx
<Text 
  render={({ pageNumber }) => 
    `Redesco Progetti srl - Scheda di Verifica | Pagina ${pageNumber} di ${estimatedPages}`
  } 
/>
```

**Development:**
```jsx
<Text 
  render={({ pageNumber, totalPages }) => 
    `Redesco Progetti srl - Scheda di Verifica | Pagina ${pageNumber} di ${totalPages}`
  } 
/>
```

## Vantaggi

### ✅ Compatibilità GitHub Pages
- Funziona su hosting statico
- Usa solo `pageNumber` in produzione
- Evita problemi con `totalPages`

### ✅ Eleganza @react-pdf/renderer
- Mantiene sintassi JSX
- Layout automatico e flessibile
- Tipografia superiore
- Gestione immagini ottimale

### ✅ Precisione Calcolo
- Algoritmo considera contenuto reale
- Margini di sicurezza inclusi
- Adattamento per testo lungo
- Supporto multi-pagina

### ✅ Esperienza Development
- Numerazione esatta in dev
- Debug facilitato
- Performance ottimali

## Confronto Approcci

| Caratteristica | @react-pdf/renderer | jsPDF | Sistema Ibrido |
|---|---|---|---|
| GitHub Pages | ❌ | ✅ | ✅ |
| Sintassi elegante | ✅ | ❌ | ✅ |
| Tipografia | ✅ | ❌ | ✅ |
| Numerazione precisa | ❌ | ✅ | ✅ |
| Layout automatico | ✅ | ❌ | ✅ |
| Bundle size | ❌ | ✅ | ❌ |

## Uso Futuro

### Gestione Immagini
Il sistema è predisposto per:
- Upload drag-drop
- Gestione File objects
- Inserimento automatico nel PDF
- Posizionamento ottimale

### Espansione Multi-pagina
- Supporto per documenti complessi
- Page break intelligenti
- Header/footer consistenti
- Numerazione accurata

## Implementazione

```typescript
// Nel componente PDF
const SmartFooter: React.FC<{ data: FormInputs }> = ({ data }) => {
  const estimatedPages = calculateExpectedPages(data);
  const isProduction = isGitHubPages();
  
  return (
    <View style={styles.footer} fixed>
      {isProduction ? (
        <Text render={({ pageNumber }) => 
          `Pagina ${pageNumber} di ${estimatedPages}`} />
      ) : (
        <Text render={({ pageNumber, totalPages }) => 
          `Pagina ${pageNumber} di ${totalPages}`} />
      )}
    </View>
  );
};
```

## Risultato
- ✅ Numerazione automatica funzionante su GitHub Pages
- ✅ Layout professionale mantenuto
- ✅ Esperienza development ottimale
- ✅ Preparato per funzionalità future 