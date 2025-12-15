import type { IEtudiant } from '../entities/Etudiant'; 
import type { IDAO } from './IDAO'; 
import { ParcoursDAO } from './ParcoursDAO';

const STORAGE_KEY = 'EtudiantList';

export class EtudiantDAO implements IDAO<IEtudiant> { 
  private static instance: EtudiantDAO | null = null;
  private parcoursDAO = ParcoursDAO.getInstance();

  private constructor() {
    // Ne rien faire dans le constructeur
  }

  public static getInstance(): EtudiantDAO { 
    if (!EtudiantDAO.instance) { 
      EtudiantDAO.instance = new EtudiantDAO(); 
    } 
    return EtudiantDAO.instance; 
  }

  /**
   * Charge les étudiants depuis localStorage
   * IMPORTANT: Reconstruit l'objet Parcours à partir de l'ID stocké
   */
  private async loadFromStorage(): Promise<IEtudiant[]> {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const allParcours = await this.parcoursDAO.list();
        
        // Reconstruire les étudiants avec l'objet Parcours complet
        return data.map((etudiantData: any) => {
          const parcours = etudiantData.ParcoursId 
            ? allParcours.find(p => p.ID === etudiantData.ParcoursId) || null
            : null;
          
          return {
            ID: etudiantData.ID,
            Nom: etudiantData.Nom,
            Prenom: etudiantData.Prenom,
            Email: etudiantData.Email,
            Parcours: parcours
          };
        });
      } catch (error) {
        console.error('Erreur lors du chargement des étudiants:', error);
        return [];
      }
    }
    
    // Données par défaut si localStorage est vide
    return [];
  }

  /**
   * Sauvegarde les étudiants dans localStorage
   * IMPORTANT: Stocke seulement l'ID du Parcours, pas l'objet complet
   */
  private saveToStorage(etudiantList: IEtudiant[]): void {
    try {
      // Transformer les étudiants pour ne stocker que l'ID du parcours
      const dataToStore = etudiantList.map(etudiant => ({
        ID: etudiant.ID,
        Nom: etudiant.Nom,
        Prenom: etudiant.Prenom,
        Email: etudiant.Email,
        ParcoursId: etudiant.Parcours?.ID || null
      }));
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToStore));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des étudiants:', error);
      throw new Error('Impossible de sauvegarder les étudiants');
    }
  }

  public async create(data: IEtudiant): Promise<IEtudiant> { 
    const etudiantList = await this.loadFromStorage();
    
    // Générer un ID unique
    const newEtudiant = { 
      ...data, 
      ID: Date.now()
    };
    
    etudiantList.push(newEtudiant);
    this.saveToStorage(etudiantList);
    
    return newEtudiant;
  }
  
  public async get(id: number): Promise<IEtudiant> {   
    const etudiantList = await this.loadFromStorage();
    const etudiant = etudiantList.find(e => e.ID === id);
    
    if (!etudiant) {
      throw new Error('Étudiant non trouvé');
    }
    
    return etudiant;
  } 
 
  public async update(id: number, data: IEtudiant): Promise<IEtudiant> { 
    const etudiantList = await this.loadFromStorage();
    const index = etudiantList.findIndex(e => e.ID === id);
    
    if (index === -1) {
      throw new Error('Étudiant non trouvé');
    }
    
    // Mettre à jour l'étudiant en conservant l'ID
    etudiantList[index] = { ...data, ID: id };
    this.saveToStorage(etudiantList);
    
    return etudiantList[index];
  } 

  public async delete(id: number): Promise<void> { 
    const etudiantList = await this.loadFromStorage();
    const filtered = etudiantList.filter(e => e.ID !== id);
    
    if (filtered.length === etudiantList.length) {
      throw new Error('Étudiant non trouvé');
    }
    
    this.saveToStorage(filtered);
  } 
 
  public async list(): Promise<IEtudiant[]> { 
    return this.loadFromStorage();
  }
  
  /**
   * Méthode utilitaire pour rechercher des étudiants par parcours
   */
  public async findByParcours(parcoursId: number): Promise<IEtudiant[]> {
    const allEtudiants = await this.loadFromStorage();
    return allEtudiants.filter(etudiant => 
      etudiant.Parcours?.ID === parcoursId
    );
  }
}