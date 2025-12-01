import type { Parcours } from '../entities/Parcours'; 
import type { IDAO } from './IDAO'; 
//import axios from 'axios'; 

export class ParcoursDAO implements IDAO<Parcours> { 
  private static instance: ParcoursDAO; 
  
  private parcoursList: Parcours[] = [];

  private constructor() {
    // Charger depuis localStorage au démarrage
    const saved = localStorage.getItem('parcoursList');
    if (saved) {
      this.parcoursList = JSON.parse(saved);
    } else {
      this.parcoursList = [
        { ID: 1, NomParcours: 'Parcours 1', AnneeFormation: 2024 },
      ];
      this.save();
    }
  }

  // Sauvegarder dans localStorage
  private save(): void {
    localStorage.setItem('parcoursList', JSON.stringify(this.parcoursList));
  }

  public static getInstance(): ParcoursDAO { 
    if (!ParcoursDAO.instance) { 
      ParcoursDAO.instance = new ParcoursDAO(); 
    } 
    return ParcoursDAO.instance; 
  } 

  public async create(data: Parcours): Promise<Parcours> { 
    // TODO: Backend plus tard
    // try { 
    //   const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/Parcours`, data); 
    //   return response.data; 
    // } catch (error: any) { 
    //   console.error('Erreur Axios:', error.response?.data || error.message);
    //   throw new Error('Impossible de créer le nouveau parcours');
    // }

    const newParcours = { ...data, ID: Date.now() };
    this.parcoursList.push(newParcours);
    this.save();
    return newParcours;
  }
  
  public async get(id: number): Promise<Parcours> {   
    // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Parcours/${id}`);
    // return response.data;

    const parcours = this.parcoursList.find(p => p.ID === id);
    if (!parcours) throw new Error('Parcours non trouvé');
    return parcours;
  } 
 
  public async update(id: number, data: Parcours): Promise<Parcours> { 
    // TODO: Backend plus tard
    // const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/Parcours/${id}`, data);
    // return response.data;

    const index = this.parcoursList.findIndex(p => p.ID === id);
    if (index !== -1) this.parcoursList[index] = { ...data, ID: id };
    this.save();
    return data; 
  } 

  public async delete(id: number): Promise<void> { 
    // TODO: Backend plus tard
    // await axios.delete(`${import.meta.env.VITE_API_URL}/api/Parcours/${id}`);

    this.parcoursList = this.parcoursList.filter(p => p.ID !== id);
    this.save();
  } 
 
  public async list(): Promise<Parcours[]> { 
    // TODO: Backend plus tard
    // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/Parcours`);
    // return response.data;

    return this.parcoursList;
  } 
}