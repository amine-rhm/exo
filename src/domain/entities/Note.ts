// src/domain/entities/Note.ts
import type { IEtudiant } from './Etudiant';
import type { IUE } from './Ue';

export interface INote {
  ID?: number|null;
  Valeur: number | null; // 0..20
  Etudiant: IEtudiant;
  UE: IUE;
}
