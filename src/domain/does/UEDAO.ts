import type {IUE } from '../entities/Ue'; 
import type { IDAO } from './IDAO'; 
import { ParcoursDAO } from './ParcoursDAO';

const STORAGE_KEY = 'UeListe';

export class UEDAO implements IDAO<IUE> { 
  private static instance: UEDAO | null = null;
  private parcoursDAO = ParcoursDAO.getInstance();

  private constructor() {
    // Ne rien faire dans le constructeur
  }

  public static getInstance(): UEDAO { 
    if (!UEDAO.instance) { 
      UEDAO.instance = new UEDAO(); 
    } 
    return UEDAO.instance; 
  }

  /**
   * Charge les UE depuis localStorage
   */
  private async loadFromStorage(): Promise<IUE[]> {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const allParcours = await this.parcoursDAO.list();
        
        return data.map((ueData: any) => {
          const parcours = ueData.ParcoursIds 
            ? allParcours.filter(p => ueData.ParcoursIds.includes(p.ID))
            : [];
          
          return {
            ID: ueData.ID,
            Intitule: ueData.Intitule,
            NumeroUe: ueData.NumeroUe,
            Parcours: parcours
          };
        });
      } catch (error) {
        console.error('Erreur lors du chargement des UE:', error);
        return [];
      }
    }
    
    return [];
  }

  /**
   * Sauvegarde les UE dans localStorage
   */
  private saveToStorage(UEList: IUE[]): void {
    try {
      const dataToStore = UEList.map(ue => ({
        ID: ue.ID,
        Intitule: ue.Intitule,
        NumeroUe: ue.NumeroUe,
        ParcoursIds: ue.Parcours?.map(p => p.ID) || []
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des UE:', error);
      throw new Error('Impossible de sauvegarder les UE');
    }
  }

  /**
   * Vérifie si une UE avec le même NumeroUe existe déjà
   */
  private async ueExists(numeroUe: string | null, excludeId?: number): Promise<boolean> {
    if (!numeroUe) return false;
    
    const UEList = await this.loadFromStorage();
    return UEList.some(u => 
      u.NumeroUe && u.NumeroUe.toLowerCase() === numeroUe.toLowerCase() &&
      (!excludeId || u.ID !== excludeId)
    );
  }

  public async create(data: IUE): Promise<IUE> { 
    // Vérifier que l'UE n'existe pas déjà (même NumeroUe)
    if (data.NumeroUe && await this.ueExists(data.NumeroUe)) {
      throw new Error(`Une UE avec le numéro "${data.NumeroUe}" existe déjà`);
    }

    const UEList = await this.loadFromStorage();
    
    const newUE = { 
      ...data, 
      ID: Date.now()
    };
    
    UEList.push(newUE);
    this.saveToStorage(UEList);
    
    return newUE;
  }
  
  public async get(id: number): Promise<IUE> {   
    const UEList = await this.loadFromStorage();
    const ue = UEList.find(u => u.ID === id);
    
    if (!ue) {
      throw new Error('UE non trouvée');
    }
    
    return ue;
  } 
 
  public async update(id: number, data: IUE): Promise<IUE> { 
    const UEList = await this.loadFromStorage();
    const index = UEList.findIndex(u => u.ID === id);
    
    if (index === -1) {
      throw new Error('UE non trouvée');
    }

    // Vérifier que le nouveau NumeroUe n'existe pas pour une autre UE
    if (data.NumeroUe && data.NumeroUe !== UEList[index].NumeroUe && await this.ueExists(data.NumeroUe, id)) {
      throw new Error(`Une autre UE avec le numéro "${data.NumeroUe}" existe déjà`);
    }
    
    UEList[index] = { ...data, ID: id };
    this.saveToStorage(UEList);
    
    return UEList[index];
  } 

  public async delete(id: number): Promise<void> { 
    const UEList = await this.loadFromStorage();
    const filtered = UEList.filter(u => u.ID !== id);
    
    if (filtered.length === UEList.length) {
      throw new Error('UE non trouvée');
    }
    
    this.saveToStorage(filtered);
  } 
 
  public async list(): Promise<IUE[]> { 
    return this.loadFromStorage();
  }
  
  /**
   * Méthode utilitaire pour rechercher des UE par parcours
   */
  public async findByParcours(parcoursId: number): Promise<IUE[]> {
    const allUE = await this.loadFromStorage();
    return allUE.filter(ue => 
      ue.Parcours?.some(p => p.ID === parcoursId)
    );
  }
}