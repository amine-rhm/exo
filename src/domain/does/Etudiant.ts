import type { IEtudiant } from '../entities/Etudiant'; 
import type { IDAO } from './IDAO'; 
import { ParcoursDAO } from './ParcoursDAO';

const STORAGE_KEY = 'EtudiantList';

export class EtudiantDAO implements IDAO<IEtudiant> { 
  private static instance: EtudiantDAO | null = null;
  private parcoursDAO = ParcoursDAO.getInstance();

  private constructor() {
    this.initDefaultEtudiants();
  }

  // Ajoute cette méthode pour initialiser des étudiants par défaut
  private async initDefaultEtudiants() {
    const saved = localStorage.getItem(STORAGE_KEY);
    
    if (!saved) {
      const parcoursList = await this.parcoursDAO.list();
      
      const defaultEtudiants = [
        { ID: 1, Nom: 'Droz', Prenom: 'Aubin', Email: 'aubin.droz@univ.fr', ParcoursId: parcoursList[0]?.ID || 1 },
        { ID: 2, Nom: 'Dostie', Prenom: 'Alice', Email: 'alice.dostie@univ.fr', ParcoursId: parcoursList[0]?.ID || 1 },
        { ID: 3, Nom: 'Polanco', Prenom: 'Khalil', Email: 'khalil.polanco@univ.fr', ParcoursId: parcoursList[0]?.ID || 1 },
        { ID: 4, Nom: 'Wadham', Prenom: 'Lucinda', Email: 'lucinda.wadham@univ.fr', ParcoursId: parcoursList[1]?.ID || 2 },
        { ID: 5, Nom: 'Martin', Prenom: 'Lucas', Email: 'lucas.martin@univ.fr', ParcoursId: parcoursList[1]?.ID || 2 },
      ];
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultEtudiants));
    }
  }

  public static getInstance(): EtudiantDAO { 
    if (!EtudiantDAO.instance) { 
      EtudiantDAO.instance = new EtudiantDAO(); 
    } 
    return EtudiantDAO.instance; 
  }

  // ... reste du code inchangé
  
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
    if (await this.etudiantExists(data.Nom, data.Prenom, data.Email)) {
      throw new Error(`L'étudiant "${data.Nom} ${data.Prenom}" avec l'email "${data.Email}" existe déjà`);
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
  
  public async findByParcours(parcoursId: number): Promise<IEtudiant[]> {
    const allEtudiants = await this.loadFromStorage();
    return allEtudiants.filter(etudiant => 
      etudiant.Parcours?.ID === parcoursId
    );
  }
}