// src/domain/does/NoteDAO.ts
import type { INote } from '../entities/Note';
import type { IDAO } from './IDAO';
import { EtudiantDAO } from './Etudiant';
import { UEDAO } from './UEDAO';

const STORAGE_KEY = 'NoteList';

export class NoteDAO implements IDAO<INote> {
  private static instance: NoteDAO | null = null;

  private etudiantDAO = EtudiantDAO.getInstance();
  private ueDAO = UEDAO.getInstance();
  private initialized = false;

  private constructor() {}

  public static getInstance(): NoteDAO {
    if (!NoteDAO.instance) {
      NoteDAO.instance = new NoteDAO();
    }
    return NoteDAO.instance;
  }

  // Initialise les notes par défaut si nécessaire
  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;
    
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved) {
      const etudiants = await this.etudiantDAO.list();
      const ues = await this.ueDAO.list();
      
      console.log('Étudiants disponibles:', etudiants);
      console.log('UEs disponibles:', ues);
      
      if (etudiants.length > 0 && ues.length > 0) {
        const defaultNotes: any[] = [];
        
        // Pour chaque étudiant, créer une note vide ou avec valeur pour la première UE
etudiants.forEach((etudiant, index) => {
  if (ues[0]?.ID) {
    const notesParDefaut = [11, null, 15, null, 12]; // null = vide
    defaultNotes.push({
      ID: Date.now() + index,
      Valeur: notesParDefaut[index],
      EtudiantId: etudiant.ID,
      UEId: ues[0].ID
    });
  }
});
        console.log('Notes par défaut créées:', defaultNotes);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotes));
      }
    }
    
    this.initialized = true;
  }

  /* ================= STORAGE ================= */

  private async loadFromStorage(): Promise<INote[]> {
    await this.ensureInitialized();
    
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return [];

    try {
      const data = JSON.parse(saved);
      const etudiants = await this.etudiantDAO.list();
      const ues = await this.ueDAO.list();

      return data
        .map((n: any) => {
          const etudiant = etudiants.find(e => e.ID === n.EtudiantId);
          const ue = ues.find(u => u.ID === n.UEId);

          if (!etudiant || !ue) return null;

          return {
            ID: n.ID,
            Valeur: n.Valeur,
            Etudiant: etudiant,
            UE: ue
          } as INote;
        })
        .filter(Boolean) as INote[];
    } catch (error) {
      console.error('Erreur chargement notes :', error);
      return [];
    }
  }

  private async saveToStorage(noteList: INote[]): Promise<void> {
    const dataToStore = noteList.map(n => ({
      ID: n.ID,
      Valeur: n.Valeur,
      EtudiantId: n.Etudiant.ID,
      UEId: n.UE.ID
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
  }

  /* ================= CRUD ================= */

  public async create(data: INote): Promise<INote> {
    const notes = await this.loadFromStorage();

    const exists = notes.some(
      n =>
        n.Etudiant.ID === data.Etudiant.ID &&
        n.UE.ID === data.UE.ID
    );

    if (exists) {
      throw new Error('Note déjà existante pour cet étudiant et cette UE');
    }

    const newNote: INote = {
      ...data,
      ID: Date.now()
    };

    notes.push(newNote);
    await this.saveToStorage(notes);

    return newNote;
  }

  public async update(id: number, data: INote): Promise<INote> {
    const notes = await this.loadFromStorage();
    const index = notes.findIndex(n => n.ID === id);

    if (index === -1) {
      throw new Error('Note non trouvée');
    }

    notes[index] = { ...data, ID: id };
    await this.saveToStorage(notes);

    return notes[index];
  }

  public async get(id: number): Promise<INote> {
    const notes = await this.loadFromStorage();
    const note = notes.find(n => n.ID === id);
    if (!note) throw new Error('Note non trouvée');
    return note;
  }

  public async delete(id: number): Promise<void> {
    const notes = await this.loadFromStorage();
    await this.saveToStorage(notes.filter(n => n.ID !== id));
  }

  public async list(): Promise<INote[]> {
    return this.loadFromStorage();
  }

  /* ================= UTILS ================= */

  public async findByUE(ueId: number): Promise<INote[]> {
    const notes = await this.loadFromStorage();
    return notes.filter(n => n.UE.ID === ueId);
  }

  public async findByEtudiantUE(
    etudiantId: number,
    ueId: number
  ): Promise<INote | null> {
    const notes = await this.loadFromStorage();
    return (
      notes.find(
        n =>
          n.Etudiant.ID === etudiantId &&
          n.UE.ID === ueId
      ) || null
    );
  }
}