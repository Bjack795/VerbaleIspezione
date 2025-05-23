import tkinter as tk
from tkinter import filedialog, messagebox
import tkinter.ttk as ttk
import customtkinter as ctk
import json
import os
import sys
import subprocess
import datetime
import threading
from PIL import Image, ImageTk, ImageOps
from docx_generator import generate_document
import io

# Importazione condizionale di tkcalendar
try:
    from tkcalendar import DateEntry
except ImportError:
    try:
        messagebox.showinfo("Installazione dipendenze", "Il pacchetto tkcalendar non è installato. Sto provando ad installarlo...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tkcalendar"])
        from tkcalendar import DateEntry
        messagebox.showinfo("Successo", "tkcalendar installato con successo!")
    except Exception as e:
        messagebox.showerror("Errore", f"Impossibile installare tkcalendar: {str(e)}\nUsare il formato GG/MM/AAAA per la data.")

# Configura customtkinter con tema minimo
ctk.set_appearance_mode("light")
ctk.set_default_color_theme("blue")

# Funzione per gestire i percorsi quando l'app è in formato .exe
def resource_path(relative_path):
    try:
        base_path = sys._MEIPASS
    except Exception:
        base_path = os.path.abspath(".")
    return os.path.join(base_path, relative_path)

# Funzione per ottimizzare le immagini dopo aver corretto l'orientamento
def optimize_image(img, max_size=(800, 800), quality=85):
    """Ottimizza un'immagine PIL Image per ridurre la dimensione del file"""
    try:
        # Ridimensiona l'immagine mantenendo le proporzioni
        img.thumbnail(max_size, Image.LANCZOS)
        
        # Converti in RGB se necessario
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
            
        # Salva l'immagine ottimizzata in un buffer
        output = io.BytesIO()
        img.save(output, format='JPEG', quality=quality, optimize=True)
        output.seek(0);
        
        # Riapri l'immagine dal buffer
        return Image.open(output)
    except Exception:
        # Se l'ottimizzazione fallisce, restituisci l'immagine originale (corretta per EXIF)
        return img

class FormApplication:
    def __init__(self, root):
        self.root = root
        self.root.title("Verbale di ispezione")
        self.root.geometry("1274x922")
        
        # Cache per le immagini
        self._image_cache = {}
        self._max_cache_size = 10  # Numero massimo di immagini in cache
        
        # Definizione colori per Material Design 3 con tema rosso
        self.colors = {
            'primary': '#B3261E',
            'primary_light': '#F9DEDC',
            'primary_dark': '#8C1D18',
            'on_primary': '#FFFFFF',
            'secondary': '#625B71',
            'secondary_container': '#E8DEF8',
            'tertiary': '#7D5260',
            'tertiary_container': '#FFD8E4',
            'surface': '#FFFBFE',
            'surface_variant': '#E7E0EC',
            'background': '#FFFBFE',
            'on_background': '#1C1B1F',
            'on_surface': '#1C1B1F',
            'on_surface_variant': '#49454F',
            'error': '#B3261E',
            'on_error': '#FFFFFF',
            'error_container': '#F9DEDC',
            'outline': '#79747E',
            'outline_variant': '#C4C7C5',
            'shadow': '#000000',
            'white': '#FFFFFF'
        }
        
        # Parametri di styling
        self.styling = {
            'corner_radius': 8,
            'button_height': 40,
            'padding': 16,
            'margin': 8,
            'border_width': 1,
            'elevation_low': 1,
            'elevation_medium': 3,
            'elevation_high': 6
        }
        
        # Percorsi predefiniti
        self.default_model_path = r"\\server\public\COMMESSE\QUALI\SISTEMA\01_ISO9001- 2015\04_MOD-2015\MODA_23 - lista_controllo e accettazione\All 4 - Verbale ispezione e registro NC\YYXXZZ - Esempio VI DLS.docx"
        self.default_images_path = os.path.abspath(".")
        self.save_file = os.path.join(os.path.abspath("."), "last.sav")
        
        # Dizionario dei valori predefiniti
        self.default_values = {
            "Data Ispezione": datetime.datetime.now(),
            "Data Verbale": datetime.datetime.now(),
            "Numero": "001",
            "Nome progetto": "00XXX - XXXXXXXXXXXXXX",
            "Lavorazione Verificata": "-",
            "Verifica materiale previsto": "-",
            "Riferimento Progetto costruttivo": "-",
            "Ubicazione": "-",
            "Scheda controllo lavorazione": "-",
            "Oggetto del Sopralluogo": "",
            "Visivo": True,
            "Rilievo/Verifica misure": False,
            "Test/Collaudo": False,
            "Altro": False,
            "Conforme/Positivo": True,
            "Non conforme": False,
            "Osservazione": False,
            "D.L. Generale": False,
            "D.L. Strutture": True,
            "D.L. Facciate": False,
            "D.L. Imp. Elettrici/Speciali": False,
            "D.L. Imp. Meccanici": False
        }
        
        # Setup del frame principale
        self.main_frame = ctk.CTkFrame(self.root, fg_color=self.colors['background'])
        self.main_frame.pack(fill=tk.BOTH, expand=True, padx=20, pady=20)
        
        # Inizializzazione delle variabili di stato
        self.images = []
        self.current_image = None
        self.current_original_image = None
        self.current_rotation = 0
        self.selected_image_index = None
        self.fields = {}
        self.checkboxes = {}
        
        # Setup dell'interfaccia
        self._setup_ui()
        
        # Carica i dati dal file se esiste
        self.load_data_from_file()
        
        # Seleziona il primo tab all'inizio
        self.select_tab("Dati")

    def _setup_ui(self):
        """Setup dell'interfaccia utente"""
        # Titolo applicazione
        title_label = ctk.CTkLabel(self.main_frame, 
                                 text="Verbale di ispezione", 
                                 font=ctk.CTkFont(size=28, weight="bold"),
                                 text_color=self.colors['primary'])
        title_label.pack(pady=20)
        
        # Setup dei tab
        self.tab_container = ctk.CTkFrame(self.main_frame, fg_color=self.colors['surface'], height=600)
        self.tab_container.pack(padx=10, pady=10, fill=tk.BOTH, expand=True)
        
        self.tab_buttons_frame = ctk.CTkFrame(self.tab_container, fg_color=self.colors['surface_variant'], height=40)
        self.tab_buttons_frame.pack(fill=tk.X, padx=0, pady=0)
        
        self.tab_content_frame = ctk.CTkFrame(self.tab_container, fg_color=self.colors['surface'])
        self.tab_content_frame.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)
        
        self.tabs = {}
        self.buttons = {}
        self.current_tab = None
        
        # Creazione dei tab
        self.add_tab("Dati")
        self.add_tab("Immagini")
        
        # Funzione condivisa per creare pulsanti
        self.create_button_func = self.create_button_method
        
        # Setup del frame per il modello
        self._setup_model_frame()

    def _setup_model_frame(self):
        """Setup del frame per la selezione del modello"""
        model_frame = ctk.CTkFrame(self.main_frame, fg_color=self.colors['background'])
        model_frame.pack(side=tk.BOTTOM, fill=tk.X, padx=10, pady=10)
        
        model_label = ctk.CTkLabel(model_frame, text="Modello Word:", fg_color=self.colors['background'], text_color=self.colors['on_surface'])
        model_label.pack(side=tk.LEFT)
        
        self.model_path_var = tk.StringVar(value=self.default_model_path)
        model_entry = ctk.CTkEntry(model_frame, 
                            textvariable=self.model_path_var, 
                            width=250,
                            fg_color=self.colors['surface'],
                            text_color=self.colors['on_surface'],
                            border_color=self.colors['outline'],
                            border_width=1)
        model_entry.pack(side=tk.LEFT, padx=10)
        
        button_frame = ctk.CTkFrame(model_frame, fg_color=self.colors['background'])
        button_frame.pack(side=tk.RIGHT, padx=10)
        
        button_frame2 = ctk.CTkFrame(model_frame, fg_color=self.colors['background'])
        button_frame2.pack(side=tk.LEFT, padx=10)
        
        browse_button = self.create_button_func(button_frame2, 
                                   "Sfoglia...", 
                                   self.browse_model,
                                   is_primary=True,
                                   width=100)
        browse_button.pack(side=tk.LEFT, padx=5)
        
        generate_button = self.create_button_func(button_frame, 
                                    "Genera Documento", 
                                    self.generate_document,
                                    fg_color=self.colors['primary'],
                                    text_color=self.colors['on_primary'],
                                    width=150)
        generate_button.pack(side=tk.LEFT, padx=5)
        
        clear_button = self.create_button_func(button_frame, 
                                 "Cancella Campi", 
                                 self.clear_fields,
                                 is_primary=False,
                                 width=120)
        clear_button.pack(side=tk.LEFT, padx=5)

    def _clear_image_cache(self):
        """Pulisce la cache delle immagini"""
        self._image_cache.clear()

    def _add_to_image_cache(self, key, image):
        """Aggiunge un'immagine alla cache"""
        if len(self._image_cache) >= self._max_cache_size:
            # Rimuovi l'elemento più vecchio
            self._image_cache.pop(next(iter(self._image_cache)))
        self._image_cache[key] = image

    def _get_from_image_cache(self, key):
        """Recupera un'immagine dalla cache"""
        return self._image_cache.get(key)

    def load_data_from_file(self):
        """Carica dati dal file di salvataggio se esiste, altrimenti usa i default"""
        if not os.path.exists(self.save_file):
            return

        try:
            with open(self.save_file, 'r', encoding='utf-8') as f:
                saved_data = json.load(f)
                
            # Aggiorna il numero incrementandolo di 1
            if "Numero" in saved_data:
                try:
                    num = int(saved_data["Numero"])
                    saved_data["Numero"] = f"{num + 1:03d}"
                except (ValueError, TypeError):
                    pass
            
            # Aggiorna i valori di default con quelli salvati
            self.default_values.update(saved_data)
            
            # Carica il percorso del modello se presente
            if "model_path" in saved_data:
                self.model_path_var.set(saved_data["model_path"])
                
        except Exception as e:
            messagebox.showwarning(
                "Avviso", 
                f"Impossibile caricare i dati dal file {self.save_file}:\n{str(e)}\nVerranno utilizzati i valori predefiniti."
            )

    def save_data_to_file(self, data):
        """Salva i dati nel file di salvataggio"""
        try:
            # Campi da salvare
            fields_to_save = [
                "Numero", 
                "Nome progetto", 
                "Lavorazione Verificata", 
                "Verifica materiale previsto",
                "Riferimento Progetto costruttivo",
                "Ubicazione",
                "Scheda controllo lavorazione",
                "Oggetto del Sopralluogo"
            ]
            
            # Crea un dizionario con i dati da salvare
            save_data = {field: data[field] for field in fields_to_save if field in data}
            
            # Salva lo stato dei checkbox
            save_data.update({key: value for key, value in data.items() if isinstance(value, bool)})
            
            # Salva il percorso del modello se diverso dal default
            model_path = self.model_path_var.get()
            if model_path != self.default_model_path:
                save_data["model_path"] = model_path
            
            # Salva i dati su file
            with open(self.save_file, 'w', encoding='utf-8') as f:
                json.dump(save_data, f, ensure_ascii=False, indent=4)
                
        except Exception as e:
            messagebox.showwarning(
                "Avviso", 
                f"Impossibile salvare i dati nel file {self.save_file}:\n{str(e)}"
            )

    def create_button_method(self, parent, text, command, **kwargs):
        """Crea un pulsante con stile Material Design"""
        is_primary = kwargs.pop('is_primary', True)
        
        # Imposta colori predefiniti basati sul tipo di pulsante
        if is_primary:
            fg_color = kwargs.pop('fg_color', self.colors['primary'])
            text_color = kwargs.pop('text_color', self.colors['on_primary'])
            hover_color = self.colors['primary_light']
        else:
            fg_color = kwargs.pop('fg_color', 'transparent')
            text_color = kwargs.pop('text_color', self.colors['primary'])
            hover_color = self.colors['background']
            
        # Font predefinito
        font = kwargs.pop('font', ctk.CTkFont(size=12, weight="bold"))
        
        # Crea il pulsante con CustomTkinter
        btn = ctk.CTkButton(
            parent,
            text=text,
            command=command,
            fg_color=fg_color,
            text_color=text_color,
            hover_color=hover_color,
            corner_radius=self.styling['corner_radius'],
            height=self.styling['button_height'],
            font=font,
            **kwargs
        )
        
        return btn
    
    def set_default_values(self):
        """Imposta i valori predefiniti per tutti i campi"""
        for field, widget in self.fields.items():
            if isinstance(widget, dict) and 'widget' in widget:  # Text con formattazione
                text_widget = widget['widget']
                if field in self.default_values:
                    text_widget.insert("1.0", str(self.default_values[field]))
            elif hasattr(widget, 'set_date'):  # DateEntry widget
                if field in self.default_values:
                    widget.set_date(self.default_values[field])
            elif isinstance(widget, tk.Text):  # Text widget semplice
                if field in self.default_values:
                    text_widget.insert("1.0", str(self.default_values[field]))
            else:  # Entry e altri widget standard
                if field in self.default_values:
                    widget.insert(0, str(self.default_values[field]))
        
        # Imposta i valori predefiniti per i checkbox
        for field, var in self.checkboxes.items():
            if field in self.default_values:
                var.set(self.default_values[field])
    
    def add_images(self):
        """Apre il file dialog per selezionare le immagini da aggiungere"""
        file_paths = filedialog.askopenfilenames(
            title="Seleziona Immagini",
            initialdir=self.default_images_path,
            filetypes=[
                ("Immagini", "*.jpg *.jpeg *.png *.gif *.bmp"),
                ("JPEG", "*.jpg *.jpeg"),
                ("PNG", "*.png"),
                ("Tutti i file", "*.*")
            ]
        )
        
        if file_paths:
            # Memorizza l'ultima directory utilizzata
            self.default_images_path = os.path.dirname(file_paths[0])
            
            # Aggiungi le nuove immagini alla lista
            for path in file_paths:
                # Verifica se l'immagine è già stata aggiunta
                if not any(img["path"] == path for img in self.images):
                    self.images.append({
                        "path": path,
                        "description": "",
                        "rotation": 0,
                        "figure_number": str(len(self.images) + 1)  # Numero figura automatico
                    })
                    filename = os.path.basename(path)
                    self.images_listbox.insert(tk.END, filename)
        
        # Se è la prima immagine, selezionala
        if len(self.images) == 1:
            self.images_listbox.selection_set(0)
            self.on_image_select(None)
    
    def on_image_select(self, event):
        """Gestisce l'evento di selezione di un'immagine dalla lista"""
        selection = self.images_listbox.curselection()
        if not selection:
            self.disable_details_controls()
            return
            
        index = selection[0]
        self.selected_image_index = index
        self.load_image_details(index)
    
    def load_image_details(self, index):
        """Carica i dettagli dell'immagine selezionata"""
        if index < 0 or index >= len(self.images):
            return
            
        self.selected_image_index = index
        image_info = self.images[index]
        
        # Carica l'anteprima dell'immagine
        rotation = image_info.get("rotation", 0)
        self.current_rotation = rotation
        self.load_image_preview(image_info["path"], rotation)
        
        # Imposta la descrizione
        self.caption_text.delete('1.0', tk.END)
        self.caption_text.insert('1.0', image_info.get("description", ""))
        
        # Imposta il numero figura
        self.figure_number_entry.delete(0, tk.END)
        self.figure_number_entry.insert(0, image_info.get("figure_number", ""))
        
        # Abilita i controlli
        self.enable_details_controls()
    
    def load_image_preview(self, image_path, rotation=0):
        """Carica l'anteprima di un'immagine con rotazione"""
        try:
            # Controlla se l'immagine è in cache
            cache_key = f"{image_path}_{rotation}"
            cached_image = self._get_from_image_cache(cache_key)
            if cached_image:
                self.current_image = cached_image
                self.preview_label.config(image=self.current_image, text="")
                return

            # Carica l'immagine originale
            img = Image.open(image_path)
            
            # Applica la correzione automatica dell'orientamento EXIF
            try:
                img = ImageOps.exif_transpose(img)
            except Exception:
                pass # Ignora errori EXIF

            # Salva una copia dell'immagine corretta per le rotazioni manuali
            self.current_original_image = img.copy()

            # Applica la rotazione manuale se presente
            if rotation != 0:
                img = img.rotate(rotation, expand=True)

            # Ottimizza l'immagine per l'anteprima
            img_preview = optimize_image(img.copy(), max_size=(300, 300), quality=85) # Passa una copia

            # Crea uno sfondo bianco per l'immagine
            bg = Image.new('RGB', (300, 300), (255, 255, 255))

            # Calcola la posizione per centrare l'immagine ottimizzata
            x = (300 - img_preview.width) // 2
            y = (300 - img_preview.height) // 2

            # Incolla l'immagine ottimizzata sul background
            bg.paste(img_preview, (x, y))

            # Converti in PhotoImage per Tkinter
            self.current_image = ImageTk.PhotoImage(bg)

            # Salva in cache
            self._add_to_image_cache(cache_key, self.current_image)

            # Visualizza l'anteprima
            self.preview_label.config(image=self.current_image, text="")

        except Exception as e:
            self.preview_label.config(image="", text=f"Errore nel caricamento dell'immagine:\n{str(e)}")
    
    def rotate_left(self):
        """Ruota l'immagine in senso antiorario (90 gradi)"""
        if self.selected_image_index is None or self.current_original_image is None:
            return
        
        # Aggiorna l'angolo di rotazione (aggiungi 90 gradi per rotazione antioraria)
        self.current_rotation = (self.current_rotation + 90) % 360
        
        # Aggiorna l'anteprima caricando l'immagine originale e applicando la nuova rotazione totale
        image_path = self.images[self.selected_image_index]["path"]
        self.load_image_preview_from_original(self.current_original_image, self.current_rotation)
        
        # Salva automaticamente i dettagli (che include l'angolo di rotazione)
        self.auto_save_details()
    
    def rotate_right(self):
        """Ruota l'immagine in senso orario (90 gradi)"""
        if self.selected_image_index is None or self.current_original_image is None:
            return
        
        # Aggiorna l'angolo di rotazione (sottrai 90 gradi per rotazione oraria)
        self.current_rotation = (self.current_rotation - 90) % 360
        
        # Aggiorna l'anteprima caricando l'immagine originale e applicando la nuova rotazione totale
        image_path = self.images[self.selected_image_index]["path"]
        self.load_image_preview_from_original(self.current_original_image, self.current_rotation)
        
        # Salva automaticamente i dettagli (che include l'angolo di rotazione)
        self.auto_save_details()
    
    def load_image_preview_from_original(self, original_img, rotation=0, cache_key=None):
        """Genera e visualizza l'anteprima da un'immagine originale con una data rotazione"""
        try:
            img = original_img.copy() # Lavora su una copia

            # Applica la rotazione manuale
            if rotation != 0:
                img = img.rotate(rotation, expand=True)

            # Ottimizza l'immagine per l'anteprima
            img_preview = optimize_image(img, max_size=(300, 300), quality=85) # Passa l'immagine ruotata e copiata

            # Crea uno sfondo bianco per l'immagine
            bg = Image.new('RGB', (300, 300), (255, 255, 255))

            # Calcola la posizione per centrare l'immagine ottimizzata
            x = (300 - img_preview.width) // 2
            y = (300 - img_preview.height) // 2

            # Incolla l'immagine ottimizzata sul background
            bg.paste(img_preview, (x, y))

            # Converti in PhotoImage per Tkinter
            preview_photo = ImageTk.PhotoImage(bg)

            # Salva in cache se la chiave è fornita
            if cache_key:
                self._add_to_image_cache(cache_key, preview_photo)

            # Visualizza l'anteprima
            self.current_image = preview_photo # Mantieni un riferimento
            self.preview_label.config(image=self.current_image, text="")

        except Exception as e:
            self.preview_label.config(image="", text=f"Errore nella generazione anteprima:\n{str(e)}")
    
    def save_image_details(self):
        """Salva i dettagli dell'immagine corrente"""
        if self.selected_image_index is not None and self.selected_image_index < len(self.images):
            # Ottieni i dettagli dai widget
            caption = self.caption_text.get("1.0", tk.END).strip()
            figure_number = self.figure_number_entry.get().strip()
            
            # Stampa di debug prima del salvataggio
            print(f"\nSalvataggio manuale dettagli immagine #{self.selected_image_index}:")
            print(f"Didascalia da salvare: '{caption}'")
            print(f"Numero figura da salvare: '{figure_number}'")
            print(f"Rotazione da salvare: {self.current_rotation}")
            
            # Aggiorna i dati dell'immagine selezionata
            self.images[self.selected_image_index]["description"] = caption
            self.images[self.selected_image_index]["figure_number"] = figure_number
            self.images[self.selected_image_index]["rotation"] = getattr(self, 'current_rotation', 0)
            
            # Verifica che le informazioni siano state correttamente salvate
            saved_caption = self.images[self.selected_image_index].get("description", "")
            if saved_caption != caption:
                print(f"ERRORE: La didascalia non è stata salvata correttamente!")
                print(f"Valore nel dizionario: '{saved_caption}'")
                print(f"Valore inserito: '{caption}'")
                # Riprova a salvare la didascalia
                self.images[self.selected_image_index]["description"] = caption
            
            # Stampa di debug dopo il salvataggio
            print(f"Didascalia salvata: '{self.images[self.selected_image_index].get('description', '')}'")
            
            # Aggiorna l'elemento nella listbox per riflettere la nuova descrizione
            display_text = f"Fig. {figure_number}" if figure_number else "Figura"
            display_text += f": {caption[:25]}..." if len(caption) > 25 else f": {caption}"
            
            # Aggiungi info sulla rotazione
            rotation = getattr(self, 'current_rotation', 0)
            if rotation != 0:
                display_text += f" (Rotazione: {rotation}°)"
            
            self.images_listbox.delete(self.selected_image_index)
            self.images_listbox.insert(self.selected_image_index, display_text)
            self.images_listbox.selection_set(self.selected_image_index)
            
            # Mostra conferma
            messagebox.showinfo("Informazione", "Dettagli dell'immagine salvati con successo.")
    
    def enable_details_controls(self):
        """Abilita i controlli per la modifica dei dettagli dell'immagine"""
        self.caption_text.config(state=tk.NORMAL)
        self.figure_number_entry.config(state=tk.NORMAL)
    
    def disable_details_controls(self):
        """Disabilita i controlli per la modifica dei dettagli dell'immagine"""
        self.caption_text.delete('1.0', tk.END)
        self.figure_number_entry.delete(0, tk.END)
        
        # Crea un'immagine vuota per mostrare invece della X rossa
        empty_img = Image.new('RGB', (300, 300), color=(240, 240, 240))
        empty_photo = ImageTk.PhotoImage(empty_img)
        self.preview_label.config(image=empty_photo)
        self.preview_label.image = empty_photo  # Mantieni un riferimento
        
        self.selected_image_index = None
        self.current_image = None
        self.current_original_image = None
        self.current_rotation = 0
    
    def remove_image(self):
        """Rimuove l'immagine selezionata dalla lista"""
        if self.images_listbox.curselection():
            index = self.images_listbox.curselection()[0]
            self.images_listbox.delete(index)
            self.images.pop(index)
            
            # Se ci sono ancora immagini, seleziona quella successiva
            if self.images:
                new_index = min(index, len(self.images) - 1)
                self.images_listbox.select_set(new_index)
                self.load_image_details(new_index)
            else:
                # Se non ci sono più immagini, cancella l'anteprima
                self.clear_image_preview()
    
    def browse_model(self):
        """Apre il file dialog per selezionare il modello Word"""
        initial_dir = os.path.dirname(self.default_model_path)
        file_path = filedialog.askopenfilename(
            title="Seleziona Modello Word",
            initialdir=initial_dir,
            initialfile=os.path.basename(self.default_model_path),
            filetypes=[("Word files", "*.docx"), ("All files", "*.*")]
        )
        if file_path:
            self.model_path_var.set(file_path)
        elif not self.model_path_var.get():
            # Se non è stato selezionato nulla e non c'è già un percorso impostato,
            # usa il percorso predefinito
            self.model_path_var.set(self.default_model_path)
    
    def clear_fields(self):
        """Resetta tutti i campi e pulisce la cache delle immagini"""
        # Reset dei campi
        for label, field_info in self.fields.items():
            widget = field_info
            if isinstance(widget, dict) and 'widget' in widget:
                widget = widget['widget']
                
            if isinstance(widget, (tk.Entry, ttk.Entry, ctk.CTkEntry)):
                widget.delete(0, tk.END)
            elif isinstance(widget, (tk.Text, ctk.CTkTextbox)):
                widget.delete('1.0', tk.END)
                
        # Reset dei checkbox
        for label, var in self.checkboxes.items():
            var.set(False)
                
        # Pulisci la lista immagini e la cache
        self.images = []
        self.images_listbox.delete(0, tk.END)
        self.clear_image_preview()
        self._clear_image_cache()
        
        # Carica nuovamente i valori predefiniti
        self.set_default_values()
        
        # Torna alla prima tab
        self.select_tab("Dati")
    
    def generate_document(self):
        """Raccoglie i dati dal form e genera il documento"""
        # Raccolta dati
        data = {}
        
        # Raccogli i dati dai campi
        for field, widget in self.fields.items():
            if isinstance(widget, dict) and 'widget' in widget:  # Text con formattazione
                text_widget = widget['widget']
                text_content = ""
                
                # Raccogli il testo riga per riga con formattazione
                for i in range(1, int(text_widget.index('end').split('.')[0])):
                    line_start = f"{i}.0"
                    line_end = f"{i}.end"
                    line_text = text_widget.get(line_start, line_end)
                    
                    # Elabora ogni carattere nella riga per la formattazione
                    formatted_line = ""
                    for j in range(len(line_text)):
                        char_idx = f"{i}.{j}"
                        char = text_widget.get(char_idx, f"{i}.{j+1}")
                        
                        if char:
                            tags = text_widget.tag_names(char_idx)
                            formatted_char = char
                            if "bold" in tags:
                                formatted_char = f"<b>{formatted_char}</b>"
                            if "italic" in tags:
                                formatted_char = f"<i>{formatted_char}</i>"
                            if "underline" in tags:
                                formatted_char = f"<u>{formatted_char}</u>"
                            
                            formatted_line += formatted_char
                    
                    text_content += formatted_line
                    if i < int(text_widget.index('end').split('.')[0]) - 1:
                        text_content += '\n'
                
                text_content = text_content.strip()
                if not text_content and field in self.default_values:
                    text_content = str(self.default_values[field])
                data[field] = text_content
                
            elif hasattr(widget, 'get_date'):  # DateEntry widget
                date_obj = widget.get_date()
                data[field] = date_obj.strftime('%d/%m/%Y')
                
            elif isinstance(widget, tk.Text):  # Text widget semplice
                text_content = widget.get("1.0", tk.END).strip()
                if not text_content and field in self.default_values:
                    text_content = str(self.default_values[field])
                data[field] = text_content
                
            else:  # Entry e altri widget standard
                value = widget.get().strip()
                if not value and field in self.default_values:
                    value = str(self.default_values[field])
                data[field] = value
        
        # Raccogli gli stati dei checkbox
        data.update({field: var.get() for field, var in self.checkboxes.items()})
        
        # Verifica del modello
        template_path = self.model_path_var.get()
        if not template_path or not os.path.exists(template_path):
            messagebox.showerror("Errore", "Seleziona un modello Word valido.")
            return
        
        # Verifica che le immagini abbiano descrizioni
        missing_descriptions = []
        for i, img in enumerate(self.images):
            if not img.get("description"):
                filename = os.path.basename(img["path"])
                missing_descriptions.append(f"{i+1}: {filename}")
        
        if missing_descriptions:
            result = messagebox.askquestion("Attenzione", 
                              f"Le seguenti immagini non hanno descrizione:\n\n" + 
                              "\n".join(missing_descriptions) + 
                              "\n\nVuoi continuare comunque?")
            if result.lower() != "yes":
                return
        
        # Selezione del percorso di output
        output_path = filedialog.asksaveasfilename(
            title="Salva documento generato",
            defaultextension=".docx",
            filetypes=[("Word files", "*.docx")]
        )
        
        if not output_path:
            return
        
        # Processa le immagini in memoria
        self.preprocess_images_for_document()
        
        # Salva i dati nel file last.sav
        self.save_data_to_file(data)
        
        # Creazione della finestra di caricamento
        self.show_loading_dialog(template_path, output_path, data)
    
    def show_loading_dialog(self, template_path, output_path, data):
        """Mostra una finestra di dialogo con indicatore di caricamento durante la generazione del documento"""
        # Crea una finestra di dialogo modale
        loading_window = ctk.CTkToplevel(self.root)
        loading_window.title("Generazione documento")
        loading_window.geometry("400x200")
        loading_window.resizable(False, False)
        
        # Posiziona la finestra al centro dello schermo
        x = self.root.winfo_x() + (self.root.winfo_width() // 2) - (400 // 2)
        y = self.root.winfo_y() + (self.root.winfo_height() // 2) - (200 // 2)
        loading_window.geometry(f"+{x}+{y}")
        
        # Rendi la finestra modale (blocca l'interazione con la finestra principale)
        loading_window.transient(self.root)
        loading_window.grab_set()
        loading_window.focus_set()
        
        # Aggiunge lo stile Material Design 
        loading_window.configure(fg_color=self.colors['surface'])
        
        # Label con istruzioni
        instruction_label = ctk.CTkLabel(
            loading_window,
            text="Generazione documento in corso...",
            font=ctk.CTkFont(size=18, weight="bold"),
            text_color=self.colors['primary']
        )
        instruction_label.pack(pady=(30, 20))
        
        # Frame per il contenitore della barra di progresso
        progress_container = ctk.CTkFrame(loading_window, fg_color=self.colors['surface'])
        progress_container.pack(fill="x", padx=40, pady=10)
        
        # Barra di progresso indeterminata
        progress_bar = ctk.CTkProgressBar(progress_container, width=300, height=15)
        progress_bar.pack(pady=10)
        
        # Configura la barra come indeterminata (modalità continua)
        progress_bar.configure(
            mode="indeterminate",
            fg_color=self.colors['surface_variant'],
            progress_color=self.colors['primary']
        )
        progress_bar.start()
        
        # Label per testo informativo aggiuntivo
        info_label = ctk.CTkLabel(
            loading_window,
            text="Attendere il completamento del processo...",
            font=ctk.CTkFont(size=12),
            text_color=self.colors['on_surface']
        )
        info_label.pack(pady=10)
        
        # Variabile per memorizzare gli errori nel thread
        error_message = [None]
        
        # Funzione da eseguire in un thread separato
        def generate_in_thread():
            try:
                # Genera il documento
                generate_document(template_path, output_path, data, self.images)
                
                # Rimuovi le immagini processate dalla memoria
                for img_info in self.images:
                    if "processed_image" in img_info:
                        del img_info["processed_image"]
            except Exception as e:
                # Memorizza l'errore per mostrarlo dopo
                error_message[0] = str(e)
            finally:
                # Chiudi la finestra di caricamento dal thread principale
                self.root.after(100, lambda: self.finish_loading(loading_window, error_message[0], output_path))
        
        # Avvia il thread
        threading.Thread(target=generate_in_thread, daemon=True).start()
    
    def finish_loading(self, loading_window, error_message, output_path):
        """Gestisce la chiusura della finestra di caricamento e mostra il risultato"""
        # Chiudi la finestra di caricamento
        loading_window.destroy()
        
        # Mostra messaggio di errore o di successo
        if error_message:
            messagebox.showerror("Errore", f"Errore durante la generazione del documento:\n{error_message}")
        else:
            messagebox.showinfo("Successo", f"Il documento è stato generato correttamente:\n{output_path}")
    
    def preprocess_images_for_document(self):
        """Prepara le immagini ruotate per il documento mantenendole in memoria"""
        for i, img_info in enumerate(self.images):
            try:
                # Controlla se l'immagine è già stata processata
                if "processed_image" in img_info:
                    continue

                # Carica l'immagine originale
                img = Image.open(img_info["path"])
                
                # Applica la correzione automatica dell'orientamento EXIF
                try:
                    img = ImageOps.exif_transpose(img)
                except Exception:
                    pass # Ignora errori EXIF

                # Applica la rotazione manuale se presente
                rotation = img_info.get("rotation", 0)
                if rotation != 0:
                    img = img.rotate(rotation, expand=True)

                # Ottimizza l'immagine per il documento
                img_processed = optimize_image(img.copy(), max_size=(800, 800), quality=85) # Passa una copia

                # Memorizza l'immagine processata
                self.images[i]["processed_image"] = img_processed

            except Exception as e:
                messagebox.showwarning("Avviso", f"Impossibile processare l'immagine {os.path.basename(img_info['path'])}: {str(e)}")
    
    def auto_save_details(self, *args):
        """Salva automaticamente i dettagli dell'immagine quando vengono modificati"""
        if self.selected_image_index is None:
            return
        
        # Ottieni i valori dai controlli
        caption = self.caption_text.get("1.0", tk.END).strip()
        figure_number = self.figure_number_entry.get().strip()
        
        # Aggiorna l'immagine nella lista
        self.images[self.selected_image_index]["description"] = caption
        self.images[self.selected_image_index]["figure_number"] = figure_number
        self.images[self.selected_image_index]["rotation"] = self.current_rotation
        
        # Stampa di debug per verificare il salvataggio
        print(f"\nSalvataggio automatico dettagli immagine #{self.selected_image_index}:")
        print(f"Didascalia: '{caption}'")
        print(f"Numero figura: '{figure_number}'")
        print(f"Rotazione: {self.current_rotation}")
        
        # Verifica che le informazioni siano state correttamente salvate
        saved_caption = self.images[self.selected_image_index].get("description", "")
        if saved_caption != caption:
            print(f"ERRORE: La didascalia non è stata salvata correttamente!")
            print(f"Valore nel dizionario: '{saved_caption}'")
            print(f"Valore inserito: '{caption}'")
            # Riprova a salvare la didascalia
            self.images[self.selected_image_index]["description"] = caption
        
        # Aggiorna la listbox con il nuovo formato
        display_text = f"Fig. {figure_number}" if figure_number else "Figura"
        display_text += f": {caption[:25]}..." if len(caption) > 25 else f": {caption}"
        
        self.images_listbox.delete(self.selected_image_index)
        self.images_listbox.insert(self.selected_image_index, display_text)
        
        # Riseleziona l'elemento
        self.images_listbox.selection_set(self.selected_image_index)
    
    def clear_image_preview(self):
        """Cancella l'anteprima dell'immagine e i campi correlati"""
        # Cancella l'anteprima
        if hasattr(self, 'preview_label'):
            self.preview_label.configure(image='')
            
        # Cancella i campi didascalia e numero figura
        if hasattr(self, 'caption_text'):
            self.caption_text.delete('1.0', tk.END)
            
        if hasattr(self, 'figure_number_entry'):
            self.figure_number_entry.delete(0, tk.END)
            
        # Disabilita i controlli
        self.disable_details_controls()
    
    def add_tab(self, name):
        """Aggiunge un nuovo tab personalizzato"""
        # Crea un pulsante per il tab
        button = ctk.CTkButton(
            self.tab_buttons_frame,
            text=name,
            corner_radius=0,
            fg_color=self.colors['surface_variant'],  # Colore predefinito (non selezionato)
            text_color=self.colors['on_surface'],  # Colore testo normale
            hover_color=self.colors['outline_variant'],
            height=40,
            command=lambda tab_name=name: self.select_tab(tab_name)
        )
        button.pack(side=tk.LEFT, padx=0, pady=0, ipadx=10)
        
        # Crea un frame per il contenuto di questo tab
        frame = ctk.CTkFrame(self.tab_content_frame, fg_color=self.colors['surface'])
        
        # Memorizza i riferimenti
        self.tabs[name] = frame
        self.buttons[name] = button
    
    def select_tab(self, name):
        """Seleziona un tab e visualizza il suo contenuto"""
        # Nascondi il tab corrente
        if self.current_tab:
            self.tabs[self.current_tab].pack_forget()
            # Ripristina lo stile del pulsante deselezionato
            self.buttons[self.current_tab].configure(
                fg_color=self.colors['surface_variant'],
                text_color=self.colors['on_surface']
            )
        
        # Mostra il nuovo tab
        self.tabs[name].pack(fill=tk.BOTH, expand=True)
        
        # Aggiorna lo stile del pulsante selezionato
        self.buttons[name].configure(
            fg_color=self.colors['primary'],  # Colore di sfondo per il tab selezionato
            text_color=self.colors['white']   # Colore del testo in BIANCO quando selezionato
        )
        
        # Aggiorna il riferimento al tab corrente
        self.current_tab = name
        
        # Inizializza i contenuti del tab se necessario
        if name == "Dati" and not hasattr(self, 'form_frame'):
            self.initialize_dati_tab()
        elif name == "Immagini" and not hasattr(self, 'images_list_frame'):
            self.initialize_immagini_tab()

    def initialize_dati_tab(self):
        """Inizializza il contenuto del tab Dati"""
        # Frame del form con stile Material
        self.form_frame = ctk.CTkFrame(self.tabs["Dati"], fg_color=self.colors['surface'])
        self.form_frame.pack(fill="both", expand=True, padx=self.styling['padding'], pady=self.styling['padding'])
        
        # Divido il form in due parti: sinistra (campi) e destra (checkbox)
        form_container = ctk.CTkFrame(self.form_frame, fg_color=self.colors['surface'])
        form_container.pack(fill="both", expand=True, padx=0, pady=0)
        
        # Frame a sinistra per i campi del form
        left_frame = ctk.CTkFrame(form_container, fg_color=self.colors['surface'])
        left_frame.pack(side=tk.LEFT, fill="both", expand=True, padx=0, pady=0)
        
        # Frame a destra per i checkbox
        right_frame = ctk.CTkFrame(form_container, fg_color=self.colors['surface'])
        right_frame.pack(side=tk.RIGHT, fill="both", expand=False, padx=20, pady=0)
        
        # Campi dinamici (esempio)
        example_fields = [
            "Data Ispezione", 
            "Data Verbale", 
            "Numero", 
            "Nome progetto",
            "Lavorazione Verificata",
            "Verifica materiale previsto",
            "Riferimento Progetto costruttivo",
            "Ubicazione",
            "Scheda controllo lavorazione",
            "Oggetto del Sopralluogo",
        ]
        
        # Creazione campi dinamici nel frame di sinistra
        for i, field in enumerate(example_fields):
            # Titoletti con font più grande
            label = ctk.CTkLabel(left_frame, 
                               text=f"{field}:", 
                               font=ctk.CTkFont(size=14, weight="bold"),  # Font più grande per le etichette
                               fg_color=self.colors['surface'], 
                               text_color=self.colors['on_surface'])
            label.grid(row=i, column=0, sticky="w", pady=5)
            
            # Crea un calendario per il campo "Data"
            if field == "Data Ispezione" or field == "Data Verbale":
                # Importa la libreria tkcalendar se disponibile, altrimenti usa una entry normale
                try:
                    # Frame per contenere il DateEntry - senza bordo
                    date_frame = ctk.CTkFrame(left_frame,
                                          fg_color=self.colors['surface'],
                                          border_width=0)  # Rimuovi il bordo
                    date_frame.grid(row=i, column=1, sticky="nsew", padx=5, pady=5)
                    
                    # Stile personalizzato per il DateEntry per armonizzarlo con Material Design
                    date_style = ttk.Style()
                    date_style.configure('my.DateEntry', 
                        fieldbackground=self.colors['surface'],
                        background=self.colors['primary'],
                        foreground=self.colors['on_surface'],
                        arrowcolor=self.colors['on_surface'],
                        bordercolor=self.colors['outline'],
                        darkcolor=self.colors['primary_dark'],
                        lightcolor=self.colors['primary_light'])
                    
                    # Approccio sicuro per il DateEntry con stile
                    date_picker = DateEntry(date_frame, 
                                          width=15,
                                          style='my.DateEntry',
                                          date_pattern='dd/MM/yyyy',
                                          locale='it_IT',
                                          selectbackground=self.colors['primary'],
                                          selectforeground=self.colors['on_primary'])
                    
                    # Configura ancora di più lo stile interno
                    try:
                        # Usa solo le opzioni supportate dal calendario
                        date_picker._top_cal.configure(background=self.colors['surface'])
                        # Non usare tag_configure che non è supportato
                        # date_picker._top_cal.tag_configure('selected', background=self.colors['primary'])
                    except Exception as e:
                        print(f"Avviso: impossibile configurare completamente il calendario: {str(e)}")
                    
                    # Aggiungi il DateEntry al frame
                    date_picker.grid(row=0, column=0, padx=1, pady=1)
                    
                    # Aggiungi l'hover effect
                    date_frame.bind("<Enter>", lambda e, f=date_frame: f.configure(border_color=self.colors['primary']))
                    date_frame.bind("<Leave>", lambda e, f=date_frame: f.configure(border_color=self.colors['outline']))
                    
                    self.fields[field] = date_picker
                except ImportError:
                    # Fallback a una entry normale con messaggio
                    messagebox.showwarning("Avviso", "Il modulo tkcalendar non è disponibile. Usare il formato GG/MM/AAAA per la data.")
                    entry = ctk.CTkEntry(left_frame, width=400, font=("Arial", 10))  # Allungo gli entry
                    entry.grid(row=i, column=1, sticky="w", padx=10, pady=5)
                    self.fields[field] = entry
            
            # Controllo input Text multimea "Oggetto del Sopralluogo"
            elif field == "Oggetto del Sopralluogo":
                # Frame per contenere il text e la scrollbar
                text_frame = ctk.CTkFrame(left_frame,
                                      fg_color=self.colors['surface'],
                                      border_color=self.colors['outline'],
                                      border_width=1)
                text_frame.grid(row=i, column=1, sticky="nsew", padx=5, pady=5)
                left_frame.grid_columnconfigure(1, weight=1)
                
                # Scrollbar verticale con stile Material Design
                scrollbar_y = tk.Scrollbar(text_frame, 
                                        bg=self.colors['background'], 
                                        troughcolor=self.colors['background'],
                                        activebackground=self.colors['primary_light'],
                                        bd=0,
                                        width=10)
                scrollbar_y.pack(side=tk.RIGHT, fill=tk.Y)
                
                # # Scrollbar orizzontale con stile Material Design
                # scrollbar_x = tk.Scrollbar(text_frame, 
                #                         orient='horizontal',
                #                         bg=self.colors['background'], 
                #                         troughcolor=self.colors['background'],
                #                         activebackground=self.colors['primary_light'],
                #                         bd=0,
                #                         width=10)
                # scrollbar_x.pack(side=tk.BOTTOM, fill=tk.X)
                
                # Campo Text con larghezza corrispondente a 477.15 pt
                text_widget = tk.Text(text_frame, 
                                   width=95, 
                                   height=4, 
                                   wrap="word",  # Manteniamo word wrap
                                   yscrollcommand=scrollbar_y.set,
                                   font=("Arial", 10),
                                   bg=self.colors['surface'],
                                   fg=self.colors['on_surface'],
                                   relief='flat',
                                   bd=0,
                                   highlightthickness=1,
                                   highlightbackground=self.colors['outline'],
                                   highlightcolor=self.colors['primary'],
                                   insertbackground=self.colors['primary'],
                                   selectbackground=self.colors['primary_light'],
                                   selectforeground=self.colors['on_primary'],
                                   padx=self.styling['padding']//2,
                                   pady=self.styling['padding']//2)
                text_widget.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
                
                # Configura le scrollbar
                scrollbar_y.config(command=text_widget.yview)
                #scrollbar_x.config(command=text_widget.xview)
                
                # Aggiungi i font per grassetto, corsivo e sottolineato (mantenendo Arial 10pt)
                text_widget.tag_configure("bold", font=("Arial", 10, "bold"))
                text_widget.tag_configure("italic", font=("Arial", 10, "italic"))
                text_widget.tag_configure("underline", font=("Arial", 10), underline=1)
                
                # Funzione per gestire il testo incollato
                def handle_paste(event):
                    try:
                        # Ottieni il testo dagli appunti
                        clipboard_text = text_widget.clipboard_get()
                        
                        # Inserisci il testo normalmente - il widget gestirà il word wrap
                        text_widget.insert(tk.INSERT, clipboard_text)
                        
                        return 'break'  # Previeni l'incollaggio predefinito
                    except Exception as e:
                        print(f"Errore durante l'incollaggio: {str(e)}")
                        # Se qualcosa va storto, lascia che l'incollaggio predefinito funzioni
                        return None
                
                # Binding per l'incollaggio
                text_widget.bind('<<Paste>>', handle_paste)
                
                # Aggiungi una barra degli strumenti per formattazione
                format_frame = ctk.CTkFrame(left_frame, fg_color=self.colors['surface'])
                format_frame.grid(row=i+1, column=1, sticky="w", padx=10, pady=5)
                
                # Funzioni per applicare formattazione con stile Material
                def apply_bold():
                    if text_widget.tag_ranges("sel"):
                        current_tags = text_widget.tag_names("sel.first")
                        if "bold" in current_tags:
                            text_widget.tag_remove("bold", "sel.first", "sel.last")
                            bold_button.configure(fg_color=self.colors['surface'])
                        else:
                            text_widget.tag_add("bold", "sel.first", "sel.last")
                            bold_button.configure(fg_color=self.colors['primary_light'])
                
                def apply_italic():
                    if text_widget.tag_ranges("sel"):
                        current_tags = text_widget.tag_names("sel.first")
                        if "italic" in current_tags:
                            text_widget.tag_remove("italic", "sel.first", "sel.last")
                            italic_button.configure(fg_color=self.colors['surface'])
                        else:
                            text_widget.tag_add("italic", "sel.first", "sel.last")
                            italic_button.configure(fg_color=self.colors['primary_light'])
                
                def apply_underline():
                    if text_widget.tag_ranges("sel"):
                        current_tags = text_widget.tag_names("sel.first")
                        if "underline" in current_tags:
                            text_widget.tag_remove("underline", "sel.first", "sel.last")
                            underline_button.configure(fg_color=self.colors['surface'])
                        else:
                            text_widget.tag_add("underline", "sel.first", "sel.last")
                            underline_button.configure(fg_color=self.colors['primary_light'])
                
                # Pulsanti per formattazione
                bold_button = ctk.CTkButton(format_frame, 
                                          text="B", 
                                          font=ctk.CTkFont(size=12, weight="bold"),
                                          width=30,
                                          height=30,
                                          command=apply_bold,
                                          fg_color=self.colors['surface'],
                                          text_color=self.colors['on_surface'],
                                          hover_color=self.colors['primary'])
                bold_button.pack(side=tk.LEFT, padx=2)
                
                italic_button = ctk.CTkButton(format_frame, 
                                            text="I", 
                                            font=ctk.CTkFont(size=12, slant="italic"),
                                            width=30,
                                            height=30,
                                            command=apply_italic,
                                            fg_color=self.colors['surface'],
                                            text_color=self.colors['on_surface'],
                                            hover_color=self.colors['primary'])
                italic_button.pack(side=tk.LEFT, padx=2)
                
                underline_button = ctk.CTkButton(format_frame, 
                                               text="U", 
                                               font=ctk.CTkFont(size=12, underline=True),
                                               width=30,
                                               height=30,
                                               command=apply_underline,
                                               fg_color=self.colors['surface'],
                                               text_color=self.colors['on_surface'],
                                               hover_color=self.colors['primary'])
                underline_button.pack(side=tk.LEFT, padx=2)
                
                # Salvare il riferimento all'oggetto principale e ai widget di formattazione
                self.fields[field] = {
                    'widget': text_widget,
                    'bold_button': bold_button,
                    'italic_button': italic_button,
                    'underline_button': underline_button
                }
            else:
                # Entry normale per gli altri campi - ripristino dimensione font originale ma aumento width
                entry = ctk.CTkEntry(left_frame, width=400, font=("Arial", 10))  # Allungo gli entry
                entry.grid(row=i, column=1, sticky="w", padx=10, pady=5)
                self.fields[field] = entry
        
        # Aggiungi label per le caselle di controllo nel frame di destra
        checkbox_label = ctk.CTkLabel(right_frame, 
                                text="Caselle di controllo:", 
                                font=ctk.CTkFont(size=14, weight="bold"),
                                fg_color=self.colors['surface'],
                                text_color=self.colors['on_surface'])
        checkbox_label.pack(anchor="w", pady=(20, 10), padx=10)
        
        # Aggiungi una cornice per i checkbox
        checkbox_container = ctk.CTkFrame(right_frame, 
                                     fg_color=self.colors['surface'],
                                     border_color=self.colors['outline'],
                                     border_width=1)
        checkbox_container.pack(fill="both", expand=True, padx=10, pady=10)
        
        # Esempio di checkbox (da personalizzare in base al modello)
        checkbox_fields = [
            ["Visivo", "Rilievo/Verifica misure", "Test/Collaudo", "Altro"],
            ["Conforme/Positivo", "Non conforme", "Osservazione"],
            ["D.L. Generale", "D.L. Strutture", "D.L. Facciate", "D.L. Imp. Elettrici/Speciali", "D.L. Imp. Meccanici"]
        ]
        
        # Creazione dei checkbox nel frame a destra
        for group_index, row_fields in enumerate(checkbox_fields):
            # Frame per contenere i checkbox di questa riga
            checkbox_row_frame = ctk.CTkFrame(checkbox_container, 
                                         fg_color=self.colors['surface'],
                                         border_width=0)
            checkbox_row_frame.pack(fill="x", expand=False, padx=10, pady=5)
            
            # Crea i checkbox per questa riga in formato verticale
            for i, field in enumerate(row_fields):
                var = tk.BooleanVar()
                checkbox = ctk.CTkCheckBox(checkbox_row_frame, 
                                       text=field, 
                                       variable=var,
                                       fg_color=self.colors['primary'],
                                       hover_color=self.colors['primary_dark'],
                                       border_color=self.colors['outline'])
                checkbox.grid(row=i, column=0, sticky="w", padx=5, pady=2)
                self.checkboxes[field] = var
            
            # Aggiungi un separatore dopo ogni gruppo (tranne l'ultimo)
            if group_index < len(checkbox_fields) - 1:
                separator = ttk.Separator(checkbox_container, 
                                      orient='horizontal', 
                                      style='Material.TSeparator')
                separator.pack(fill="x", padx=10, pady=8)
        
        # Dopo aver creato tutti i campi, imposta i valori predefiniti
        self.set_default_values()

    def initialize_immagini_tab(self):
        """Inizializza il contenuto del tab Immagini"""
        # Configurazione layout per la tab delle immagini
        self.tabs["Immagini"].grid_rowconfigure(0, weight=1)
        self.tabs["Immagini"].grid_columnconfigure(0, weight=1)
        self.tabs["Immagini"].grid_columnconfigure(1, weight=1)
        self.tabs["Immagini"].configure(fg_color=self.colors['background'])
        
        # Frame per le immagini - diviso in due parti: lista e dettagli
        self.images_list_frame = ctk.CTkFrame(self.tabs["Immagini"], fg_color=self.colors['surface'])
        self.images_list_frame.grid(row=0, column=0, sticky="nsew", padx=self.styling['padding'], pady=self.styling['padding'])
        
        self.image_details_frame = ctk.CTkFrame(self.tabs["Immagini"], fg_color=self.colors['surface'])
        self.image_details_frame.grid(row=0, column=1, sticky="nsew", padx=self.styling['padding'], pady=self.styling['padding'])
        
        # Lista delle immagini selezionate (frame a sinistra)
        self.images_list_frame.grid_rowconfigure(0, weight=0)
        self.images_list_frame.grid_rowconfigure(1, weight=1)
        self.images_list_frame.grid_columnconfigure(0, weight=1)
        
        # Etichetta "Immagini selezionate" fuori dal contorno
        images_label = ctk.CTkLabel(self.images_list_frame, 
                              text="Immagini selezionate:", 
                              font=ctk.CTkFont(size=14, weight="bold"),  # Font più grande
                              fg_color=self.colors['surface'],
                              text_color=self.colors['on_surface'])
        images_label.grid(row=0, column=0, sticky="w", pady=(0, 5), padx=(20, 0))  # Posizionata più in alto
        
        # List frame per la lista di immagini
        list_frame = ctk.CTkFrame(self.images_list_frame, 
                              fg_color=self.colors['surface'],
                              border_color=self.colors['outline'],
                              border_width=1)
        list_frame.grid(row=1, column=0, sticky="nsew", padx=(20, 0))  # Spostata un po' a destra
        
        # Scrollbar per la lista
        scrollbar = tk.Scrollbar(list_frame)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        
        # Listbox per visualizzare le immagini selezionate - rimuovo il bordo bianco che interrompe
        self.images_listbox = tk.Listbox(list_frame, 
                                       width=40, 
                                       height=15,
                                       font=('Arial', 12),  # Font più grande
                                       borderwidth=0,  # Rimuove il bordo bianco
                                       highlightthickness=0)  # Rimuove l'evidenziazione che interrompe
        self.images_listbox.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.images_listbox.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.images_listbox.yview)
        
        # Binding per la selezione nella listbox
        self.images_listbox.bind('<<ListboxSelect>>', self.on_image_select)
        
        # Frame per i pulsanti delle immagini
        image_buttons_frame = ctk.CTkFrame(self.images_list_frame, fg_color=self.colors['surface'])
        image_buttons_frame.grid(row=2, column=0, pady=10, sticky="e", padx=(0, 20))  # Allineato a destra
        
        # Pulsanti con nuovo stile
        add_images_button = self.create_button_func(image_buttons_frame, "Aggiungi Immagini", self.add_images)
        add_images_button.pack(side=tk.LEFT, padx=5)
        
        remove_image_button = self.create_button_func(image_buttons_frame, "Rimuovi Immagine", self.remove_image, is_primary=False)
        remove_image_button.pack(side=tk.LEFT, padx=5)
        
        # Frame per i dettagli dell'immagine (frame a destra)
        self.image_details_frame.grid_rowconfigure(0, weight=0)  # Anteprima
        self.image_details_frame.grid_rowconfigure(1, weight=0)  # Descrizione
        self.image_details_frame.grid_rowconfigure(2, weight=0)  # Rotazione
        self.image_details_frame.grid_columnconfigure(0, weight=1)
        
        # Frame per l'anteprima dell'immagine con bordo continuo
        preview_container = ctk.CTkFrame(self.image_details_frame, 
                                     fg_color=self.colors['surface'],
                                     border_color=self.colors['outline'],
                                     border_width=1)
        preview_container.grid(row=0, column=0, sticky="nsew", padx=10, pady=10)
        
        # Etichetta per l'anteprima dell'immagine - senza bordo interno
        self.preview_label = tk.Label(preview_container, 
                                   bg=self.colors['background'],
                                   borderwidth=0,  # Rimuove bordo interno
                                   highlightthickness=0)  # Rimuove highlight
        self.preview_label.pack(fill=tk.BOTH, expand=True, padx=0, pady=0)  # No padding
        
        # Frame per informazioni immagine con bordo continuo
        info_frame = ctk.CTkFrame(self.image_details_frame, 
                               fg_color=self.colors['surface'],
                               border_color=self.colors['outline'],
                               border_width=1)
        info_frame.grid(row=1, column=0, sticky="ew", padx=10, pady=10)
        
        # Caption per l'immagine
        caption_label = ctk.CTkLabel(info_frame, 
                                  text="Didascalia:", 
                                  font=ctk.CTkFont(size=12, weight="bold"),  # Font più grande
                                  text_color=self.colors['on_surface'])
        caption_label.grid(row=0, column=0, sticky="w", padx=10, pady=5)
        
        # Area di testo per la didascalia - senza interruzioni
        self.caption_text = tk.Text(info_frame, 
                                 height=4, 
                                 width=50,  # Aumentata larghezza 
                                 wrap="word", 
                                 bg=self.colors['surface'], 
                                 fg=self.colors['on_surface'],
                                 selectbackground=self.colors['primary'],
                                 selectforeground=self.colors['on_primary'],
                                 borderwidth=0,  # Rimuove bordo interno
                                 highlightthickness=0,  # Rimuove highlight
                                 relief="flat")
        self.caption_text.grid(row=1, column=0, padx=10, pady=5, sticky="ew")
        info_frame.grid_columnconfigure(0, weight=1)
        
        # Aggiungo binding per salvare automaticamente le modifiche alla didascalia
        self.caption_text.bind("<KeyRelease>", self.auto_save_details)
        
        # Numero figura
        figure_label = ctk.CTkLabel(info_frame, 
                                 text="Numero Figura:", 
                                 font=ctk.CTkFont(size=12, weight="bold"),  # Font più grande
                                 text_color=self.colors['on_surface'])
        figure_label.grid(row=2, column=0, sticky="w", padx=10, pady=5)
        
        self.figure_number_entry = ctk.CTkEntry(info_frame,
                                            width=400,  # Aumentata larghezza
                                            fg_color=self.colors['surface'],
                                            text_color=self.colors['on_surface'],
                                            border_color=self.colors['outline'],
                                            border_width=1,
                                            font=("Arial", 10))  # Font originale
        self.figure_number_entry.grid(row=3, column=0, padx=10, pady=5, sticky="ew")
        
        # Aggiungo binding per salvare automaticamente le modifiche al numero di figura
        self.figure_number_entry.bind("<KeyRelease>", self.auto_save_details)
        
        # Aggiungo un pulsante per salvare esplicitamente la didascalia
        save_caption_button = self.create_button_func(info_frame, "Salva Didascalia", self.save_image_details)
        save_caption_button.grid(row=4, column=0, padx=10, pady=10, sticky="e")
        
        # Frame per rotazione immagine
        rotation_frame = ctk.CTkFrame(self.image_details_frame, 
                                   fg_color=self.colors['surface'],
                                   border_color=self.colors['outline'],
                                   border_width=0)  # Rimuovi il bordo
        rotation_frame.grid(row=2, column=0, sticky="ew", pady=10)
        
        # Contenitore interno per i radio button, con margini per non toccare i bordi esterni
        rotation_inner_frame = ctk.CTkFrame(rotation_frame, 
                                        fg_color=self.colors['surface'],
                                        border_width=0)
        rotation_inner_frame.pack(fill="both", expand=True, padx=40, pady=5)  # Ampi margini
        
        # Invece dei pulsanti con testo, uso i radio button per la rotazione
        self.rotation_var = tk.StringVar(value="")
        
        rotate_left_radio = ctk.CTkRadioButton(rotation_inner_frame, 
                                           text="Ruota a sinistra", 
                                           command=self.rotate_left,
                                           variable=self.rotation_var,
                                           value="left",
                                           fg_color=self.colors['primary'],
                                           border_color=self.colors['primary_dark'])
        rotate_left_radio.pack(side=tk.LEFT, padx=10, pady=5, expand=True)
        
        rotate_right_radio = ctk.CTkRadioButton(rotation_inner_frame, 
                                             text="Ruota a destra", 
                                             command=self.rotate_right,
                                             variable=self.rotation_var,
                                             value="right",
                                             fg_color=self.colors['primary'],
                                             border_color=self.colors['primary_dark'])
        rotate_right_radio.pack(side=tk.RIGHT, padx=10, pady=5, expand=True)
    
    def _update_tab_text_color(self, button):
        """Aggiorna il colore del testo nei tab in base allo stato"""
        # Se il pulsante è selezionato (stato disabled in CTkSegmentedButton)
        if str(button.cget("state")) == "disabled":
            button.configure(fg_color=self.colors['primary'], text_color=self.colors['on_primary'])
        else:
            button.configure(text_color=self.colors['on_surface'])

if __name__ == "__main__":
    root = ctk.CTk()
    app = FormApplication(root)
    root.mainloop()