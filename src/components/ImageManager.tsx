import React, { useCallback, useState } from 'react';
import { ImageData } from '../types/form';

interface ImageManagerProps {
  images: ImageData[];
  onImagesChange: (images: ImageData[]) => void;
  colors: any;
}

const ImageManager: React.FC<ImageManagerProps> = ({ images, onImagesChange, colors }) => {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Genera ID unico per le immagini
  const generateId = () => `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Funzione per comprimere un'immagine e ottenere sia File che base64
  const compressImage = (file: File, maxSizeBytes: number = 2 * 1024 * 1024): Promise<{file: File, base64: string}> => {
    return new Promise((resolve, reject) => {
      if (file.size <= maxSizeBytes) {
        console.log(`Immagine ${file.name} già ottimizzata (${file.size} bytes)`)
        // Per file non compressi, convertiamo in base64 qui per evitare il doppio passaggio
        const reader = new FileReader()
        reader.onload = () => {
          resolve({
            file: file,
            base64: reader.result as string
          })
        }
        reader.onerror = () => reject(new Error('Errore lettura file originale'))
        reader.readAsDataURL(file)
        return
      }

      console.log(`Compressione immagine ${file.name} (${file.size} bytes)...`)
      
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        // Calcola nuove dimensioni mantenendo l'aspect ratio
        const maxDimension = 1920 // Max larghezza/altezza
        let { width, height } = img
        
        if (width > height && width > maxDimension) {
          height = (height * maxDimension) / width
          width = maxDimension
        } else if (height > maxDimension) {
          width = (width * maxDimension) / height
          height = maxDimension
        }
        
        canvas.width = width
        canvas.height = height
        
        // Disegna l'immagine ridimensionata
        ctx?.drawImage(img, 0, 0, width, height)
        
        // Converti in blob E in base64 direttamente
        canvas.toBlob((blob) => {
          if (blob) {
            const compressedFile = new File([blob], file.name, { 
              type: 'image/jpeg',
              lastModified: file.lastModified 
            })
            
            // Converte il blob direttamente in base64 per evitare problemi iOS
            const reader = new FileReader()
            reader.onload = () => {
              console.log(`Immagine compressa da ${file.size} a ${compressedFile.size} bytes`)
              resolve({
                file: compressedFile,
                base64: reader.result as string
              })
            }
            reader.onerror = () => reject(new Error('Errore conversione blob compressa'))
            reader.readAsDataURL(blob)
          } else {
            reject(new Error('Errore nella compressione'))
          }
        }, 'image/jpeg', 0.8) // Qualità 80%
      }
      
      img.onerror = () => reject(new Error('Errore nel caricamento immagine per compressione'))
      img.src = URL.createObjectURL(file)
    })
  }

  // Gestione caricamento file con compressione automatica
  const handleFileChange = useCallback(async (files: FileList | null) => {
    if (!files) return;

    setProcessing(true);
    const newImages: ImageData[] = [];
    
    try {
      for (const file of Array.from(files)) {
        if (file.type.startsWith('image/')) {
          try {
            // Comprimi l'immagine e ottieni sia file che base64
            const { file: compressedFile, base64 } = await compressImage(file);
            
            const imageData: ImageData = {
              id: generateId(),
              file: compressedFile,
              preview: URL.createObjectURL(compressedFile),
              caption: '',
              rotation: 0,
              timestamp: Date.now()
            };
            
            // Aggiungi il base64 come proprietà aggiuntiva per evitare la ri-conversione
            (imageData as any).cachedBase64 = base64;
            
            newImages.push(imageData);
          } catch (error) {
            console.error(`Errore nella compressione di ${file.name}:`, error);
            // In caso di errore, usa l'originale
            const imageData: ImageData = {
              id: generateId(),
              file,
              preview: URL.createObjectURL(file),
              caption: '',
              rotation: 0,
              timestamp: Date.now()
            };
            newImages.push(imageData);
          }
        }
      }
    } finally {
      setProcessing(false);
    }

    onImagesChange([...images, ...newImages]);
  }, [images, onImagesChange]);

  // Drag & Drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileChange(e.dataTransfer.files);
  }, [handleFileChange]);

  // Rotazione immagine
  const rotateImage = useCallback((id: string, direction: 'left' | 'right') => {
    const updatedImages = images.map(img => {
      if (img.id === id) {
        const newRotation = direction === 'right' 
          ? (img.rotation + 90) % 360 
          : (img.rotation - 90 + 360) % 360;
        return { ...img, rotation: newRotation };
      }
      return img;
    });
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  // Aggiorna didascalia
  const updateCaption = useCallback((id: string, caption: string) => {
    const updatedImages = images.map(img => 
      img.id === id ? { ...img, caption } : img
    );
    onImagesChange(updatedImages);
  }, [images, onImagesChange]);

  // Rimuovi immagine
  const removeImage = useCallback((id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
    }
    onImagesChange(images.filter(img => img.id !== id));
  }, [images, onImagesChange]);

  // Riordina immagini
  const moveImage = useCallback((id: string, direction: 'up' | 'down') => {
    const currentIndex = images.findIndex(img => img.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= images.length) return;

    const newImages = [...images];
    [newImages[currentIndex], newImages[newIndex]] = [newImages[newIndex], newImages[currentIndex]];
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  return (
    <div className="space-y-6">
      {/* Area di caricamento */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="space-y-4">
          <div className="text-4xl">📸</div>
          <div>
            <p className="text-lg font-medium" style={{ color: colors.on_surface }}>
              {processing ? 'Elaborazione immagini...' : 'Carica le tue immagini'}
            </p>
            <p className="text-sm" style={{ color: colors.on_surface_variant }}>
              {processing 
                ? 'Compressione automatica in corso per ottimizzare le prestazioni'
                : 'Trascina qui le immagini, carica dalla galleria o scatta una foto. Le immagini grandi verranno automaticamente compresse.'
              }
            </p>
          </div>
          
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            id="gallery-upload"
            disabled={processing}
            onChange={(e) => handleFileChange(e.target.files)}
          />
          
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <label
              htmlFor={processing ? undefined : "gallery-upload"}
              className={`image-upload-btn px-4 py-2 rounded-md transition-colors ${
                processing 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'cursor-pointer bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {processing ? '⏳ Elaborazione...' : '📂 Carica da Galleria'}
            </label>
            <br /> <br />
            {/* Pulsante fotocamera per mobile */}
            <label
              htmlFor={processing ? undefined : "camera-capture"}
              className={`image-upload-btn px-4 py-2 rounded-md transition-colors ${
                processing 
                  ? 'bg-gray-400 cursor-not-allowed text-white' 
                  : 'cursor-pointer bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {processing ? '⏳ Elaborazione...' : '📷 Scatta Foto'}
            </label>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              id="camera-capture"
              disabled={processing}
              onChange={(e) => handleFileChange(e.target.files)}
            />
          </div>
        </div>
      </div>

      {/* Griglia immagini */}
      {images.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.on_surface }}>
            Immagini Caricate ({images.length})
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {images.map((image, index) => (
              <div
                key={image.id}
                className="border rounded-lg p-4 bg-white shadow-sm"
                style={{ borderColor: colors.outline }}
              >
                                {/* Intestazione */}
                <div className="mb-2">
                  <span className="text-sm font-medium" style={{ color: colors.on_surface }}>
                    Immagine {index + 1}
                  </span>
                </div>
                
                {/* Controlli */}
                <div className="flex justify-between items-center mb-3">
                  <div className="flex gap-1">
                    {/* Pulsanti riordino */}
                    <button
                      onClick={() => moveImage(image.id, 'up')}
                      disabled={index === 0}
                      className="image-control-btn p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      title="Sposta su"
                    >
                      ⬆️
                    </button>
                    <button
                      onClick={() => moveImage(image.id, 'down')}
                      disabled={index === images.length - 1}
                      className="image-control-btn p-1 text-gray-500 hover:text-gray-700 disabled:opacity-30"
                      title="Sposta giù"
                    >
                      ⬇️
                    </button>
                    
                    {/* Pulsanti rotazione */}
                    <button
                      onClick={() => rotateImage(image.id, 'left')}
                      className="image-control-btn p-1 text-blue-600 hover:text-blue-800"
                      title="Ruota a sinistra"
                    >
                      ↺
                    </button>
                    <button
                      onClick={() => rotateImage(image.id, 'right')}
                      className="image-control-btn p-1 text-blue-600 hover:text-blue-800"
                      title="Ruota a destra"
                    >
                      ↻
                    </button>
                    
                    {/* Pulsante rimozione */}
                    <button
                      onClick={() => removeImage(image.id)}
                      className="image-control-btn p-1 text-red-600 hover:text-red-800"
                      title="Rimuovi"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                {/* Anteprima immagine */}
                <div className="relative mb-6 flex justify-center">
                  <div 
                    className="relative rounded-md flex items-center justify-center"
                    style={{
                      backgroundColor: '#f8f9fa'
                    }}
                  >
                    <img
                      src={image.preview}
                      alt={`Anteprima ${index + 1}`}
                      className="rounded-md"
                      style={{
                        transform: `rotate(${image.rotation}deg)`,
                        transition: 'transform 0.3s ease'
                      }}
                    />
                    {image.rotation !== 0 && (
                      <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                        {image.rotation}°
                      </div>
                    )}
                  </div>
                </div>

                {/* Campo didascalia */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: colors.on_surface }}>
                    Didascalia (Figura {index + 1})
                  </label>
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) => updateCaption(image.id, e.target.value)}
                    placeholder="Aggiungi una descrizione..."
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ borderColor: colors.outline }}
                  />
                  <div className="mt-1 text-xs" style={{ color: colors.on_surface_variant }}>
                    {image.caption 
                      ? `Nel PDF: "Figura ${index + 1} - ${image.caption}"`
                      : `Nel PDF: "Figura ${index + 1}"`
                    }
                  </div>
                </div>

                {/* Info file */}
                <div className="mt-2 text-xs" style={{ color: colors.on_surface_variant }}>
                  {image.file.name} • {(image.file.size / 1024 / 1024).toFixed(2)} MB
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Riassunto */}
      {images.length > 0 && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-2">
          <p className="text-sm" style={{ color: colors.on_surface_variant }}>
            {images.length} immagine{images.length !== 1 ? 'i' : ''} caricata{images.length !== 1 ? 'e' : ''}
            {images.length > 0 && ` • ${Math.ceil(images.length / 2)} pagina${Math.ceil(images.length / 2) !== 1 ? 'e' : ''} aggiuntive nel PDF`}
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageManager; 