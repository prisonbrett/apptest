// types/Depenses.ts
export type DepenseRow = {
  libelle: string;
  montantTTC: number | null;
  datePaiement: Date | null;
  facture: string; // ou string|null si tu préfères
  categorie: string;
  type: string;
  duree: number | null;
  echeance: Date | null;
  joursRestants: string | null;
  estimationAnnuel: number | null;
  url: string;
  mensualite: number | null;
  cumule: number | null;
  id: string;
};