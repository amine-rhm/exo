// @/domain/entities/Etudiant.ts

export interface IParcours {
  ID: number;
  NomParcours: string;
}

export interface IEtudiant {
  ID: number | null;
  Nom: string;
  Prenom: string;
  Email: string;
  Parcours: IParcours | null;
}

export class Etudiant implements IEtudiant {
  ID: number | null;
  Nom: string;
  Prenom: string;
  Email: string;
  Parcours: IParcours | null;

  constructor(
    ID: number | null = null,
    Nom: string = '',
    Prenom: string = '',
    Email: string = '',
    Parcours: IParcours | null = null
  ) {
    this.ID = ID;
    this.Nom = Nom;
    this.Prenom = Prenom;
    this.Email = Email;
    this.Parcours = Parcours;
  }

  // Créer une instance depuis un objet JSON
  static fromJSON(data: any): Etudiant {
    return new Etudiant(
      data.ID || null,
      data.Nom || '',
      data.Prenom || '',
      data.Email || '',
      data.Parcours || null
    );
  }

  // Convertir en objet simple pour l'API
  toPlainObject() {
    return {
      ID: this.ID,
      Nom: this.Nom,
      Prenom: this.Prenom,
      Email: this.Email,
      Parcours: this.Parcours,
    };
  }
}