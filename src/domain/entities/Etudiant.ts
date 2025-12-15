import { Parcours } from './Parcours';

export interface IEtudiant {
  ID: number | null;
  Nom: string | null;
  Prenom: string | null;
  Email: string | null;
  Parcours: Parcours | null;  // un seul parcour pour chaque etudiant

  toJSON(): Object;
}

export class Etudiant implements IEtudiant {
  constructor(
    public ID: number | null,
    public Nom: string | null,
    public Prenom: string | null,
    public Email: string | null,
    public Parcours: Parcours | null
  ) {}

  toJSON(): Object {
    return {
      ID: this.ID,
      Nom: this.Nom,
      Prenom: this.Prenom,
      Email: this.Email,
      ParcoursId: this.Parcours?.ID // Stocker seulement l'ID du parcours
    };
  }
}