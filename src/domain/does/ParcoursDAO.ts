import type { Parcours } from '../entities/Parcours'; 
import type { IDAO } from './IDAO'; 

const STORAGE_KEY = 'parcoursList';

export class ParcoursDAO implements IDAO<Parcours> { 
  private static instance: ParcoursDAO | null = null;

  private constructor() {
    // Ne rien faire dans le constructeur
  }

  public static getInstance(): ParcoursDAO { 
    if (!ParcoursDAO.instance) { 
      ParcoursDAO.instance = new ParcoursDAO(); 
    } 
    return ParcoursDAO.instance; 
  }

  private loadFromStorage(): Parcours[] {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return [
      { ID: 1, NomParcours: 'Parcours 1', AnneeFormation: 2024 },
    ];
  }

  private saveToStorage(parcoursList: Parcours[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(parcoursList));
  }

  public async create(data: Parcours): Promise<Parcours> { 
    const parcoursList = this.loadFromStorage();
    const newParcours = { ...data, ID: Date.now() };
    parcoursList.push(newParcours);
    this.saveToStorage(parcoursList);
    return newParcours;
  }
  
  public async get(id: number): Promise<Parcours> {   
    const parcoursList = this.loadFromStorage();
    const parcours = parcoursList.find(p => p.ID === id);
    if (!parcours) throw new Error('Parcours non trouvé');
    return parcours;
  } 
 
  public async update(id: number, data: Parcours): Promise<Parcours> { 
    const parcoursList = this.loadFromStorage();
    const index = parcoursList.findIndex(p => p.ID === id);
    if (index !== -1) {
      parcoursList[index] = { ...data, ID: id };
      this.saveToStorage(parcoursList);
    }
    return data; 
  } 

  public async delete(id: number): Promise<void> { 
    const parcoursList = this.loadFromStorage();
    const filtered = parcoursList.filter(p => p.ID !== id);
    this.saveToStorage(filtered);
  } 
 
  public async list(): Promise<Parcours[]> { 
    return this.loadFromStorage();
  } 
}