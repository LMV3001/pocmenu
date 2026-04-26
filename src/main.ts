import './style.css';
import { Scene } from './canvas';

// Importation des constantes depuis import.meta.env (Vite)
const TAILLE_GRILLE_VP: number = Number(import.meta.env.VITE_TAILLE_GRILLE_VP);
const DECALAGE_GAUCHE: number = Number(import.meta.env.VITE_DECALAGE_GAUCHE); 
const DECALAGE_HAUTEUR: number = Number(import.meta.env.VITE_DECALAGE_HAUTEUR);
const CHEVAUCHEMENT_X: number = Number(import.meta.env.VITE_CHEVAUCHEMENT_X); 
const CHEVAUCHEMENT_Y: number = Number(import.meta.env.VITE_CHEVAUCHEMENT_Y);
const DISTANCE_BORD_DROIT: number = Number(import.meta.env.VITE_DISTANCE_BORD_DROIT);
const TYPE_COURBE_DELAI: string = import.meta.env.VITE_TYPE_COURBE_DELAI;
const FORCE_COURBE_DELAI: number = Number(import.meta.env.VITE_FORCE_COURBE_DELAI);
const ETALEMENT_DELAI_EN_VH: number = Number(import.meta.env.VITE_ETALEMENT_DELAI_EN_VH);
const AMPLITUDE_ALEA: number = Number(import.meta.env.VITE_AMPLITUDE_ALEA);
const ECHELLE_TAILLE_FIGURES: number = Number(import.meta.env.VITE_ECHELLE_TAILLE_FIGURES);
const TAUX_FIGURES_TRANSPARENTS: number = Number(import.meta.env.VITE_TAUX_FIGURES_TRANSPARENTS);
const TAUX_REDUCTION_FIGURES_ANIMATION: number = Number(import.meta.env.VITE_TAUX_REDUCTION_FIGURES_ANIMATION);
const TAUX_FIGURES_DISPARITION: number = Number(import.meta.env.VITE_TAUX_FIGURES_DISPARITION);
const LIGNE_FIN_ANIMATION: number = Number(import.meta.env.VITE_LIGNE_FIN_ANIMATION);
export const COULEUR_FILL_FIGURES: string = import.meta.env.VITE_COULEUR_FIGURES || "#3498db";
export const COULEUR_STROKE_FIGURES: string = import.meta.env.VITE_COULEUR_BORD_FIGURES || "#2980b9";
export const COULEUR_FINAL_FILL_FIGURES: string = import.meta.env.VITE_COULEUR_FINAL_FIGURES || "#2ecc71";
export const COULEUR_FINAL_STROKE_FIGURES: string = import.meta.env.VITE_COULEUR_FINAL_BORD_FIGURES || "#27ae60";



// Canvas principal et contexte 2D: tout le dessin passe par cet objet ctx.
const canvas = document.getElementById("scene") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

const scene = new Scene("scene", 3, 30); // 2eme paramètre(type de figures) 0: losange, 1: triangle, 2: hexagone, 3: octogone
scene.start();
