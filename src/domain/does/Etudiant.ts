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
   */
  private async loadFromStorage(): Promise<IEtudiant[]> {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const allParcours = await this.parcoursDAO.list();
        
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
    
    return [];
  }

  /**
   * Sauvegarde les étudiants dans localStorage
   */
  private saveToStorage(etudiantList: IEtudiant[]): void {
    try {
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

  /**
   * Vérifie si un étudiant avec le même Nom + Prénom + Email existe déjà
   */
  private async etudiantExists(nom: string, prenom: string, email: string, excludeId?: number): Promise<boolean> {
    const etudiantList = await this.loadFromStorage();
    return etudiantList.some(e => 
      e.Nom.toLowerCase() === nom.toLowerCase() && 
      e.Prenom.toLowerCase() === prenom.toLowerCase() && 
      e.Email.toLowerCase() === email.toLowerCase() &&
      (!excludeId || e.ID !== excludeId)
    );
  }

  public async create(data: IEtudiant): Promise<IEtudiant> { 
    // Vérifier que l'étudiant n'existe pas déjà (Nom + Prénom + Email)
    // Un étudiant ne peut exister qu'une seule fois
    if (await this.etudiantExists(data.Nom, data.Prenom, data.Email)) {
      throw new Error(`L'étudiant "${data.Nom} ${data.Prenom}" avec l'email "${data.Email}" existe déjà et suit déjà un parcours`);
    }

    const etudiantList = await this.loadFromStorage();
    
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

    // Vérifier que le même étudiant n'existe pas ailleurs (même si on change le parcours)
    if (await this.etudiantExists(data.Nom, data.Prenom, data.Email, id)) {
      throw new Error(`Un autre étudiant avec ce nom, prénom et email existe déjà`);
    }
    
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