// Importation des constantes depuis import.meta.env (Vite)
const TAILLE_GRILLE_VP = Number(import.meta.env.VITE_TAILLE_GRILLE_VP);
const DECALAGE_GAUCHE = Number(import.meta.env.VITE_DECALAGE_GAUCHE);
const DECALAGE_HAUTEUR = Number(import.meta.env.VITE_DECALAGE_HAUTEUR);
const CHEVAUCHEMENT_X = Number(import.meta.env.VITE_CHEVAUCHEMENT_X);
const CHEVAUCHEMENT_Y = Number(import.meta.env.VITE_CHEVAUCHEMENT_Y);
const DISTANCE_BORD_DROIT = Number(import.meta.env.VITE_DISTANCE_BORD_DROIT);
const TYPE_COURBE_DELAI = import.meta.env.VITE_TYPE_COURBE_DELAI;
const FORCE_COURBE_DELAI = Number(import.meta.env.VITE_FORCE_COURBE_DELAI);
const ETALEMENT_DELAI_EN_VH = Number(import.meta.env.VITE_ETALEMENT_DELAI_EN_VH);
const AMPLITUDE_ALEA = Number(import.meta.env.VITE_AMPLITUDE_ALEA);
const ECHELLE_TAILLE_HEXAGONES = Number(import.meta.env.VITE_ECHELLE_TAILLE_HEXAGONES);
const TAUX_HEXAGONES_TRANSPARENTS = Number(import.meta.env.VITE_TAUX_HEXAGONES_TRANSPARENTS);
const TAUX_REDUCTION_HEXAGONES_ANIMATION = Number(import.meta.env.VITE_TAUX_REDUCTION_HEXAGONES_ANIMATION);
const TAUX_HEXAGONES_DISPARITION = Number(import.meta.env.VITE_TAUX_HEXAGONES_DISPARITION);
const LIGNE_FIN_ANIMATION = Number(import.meta.env.VITE_LIGNE_FIN_ANIMATION);
const COULEUR_HEXAGONES = import.meta.env.VITE_COULEUR_HEXAGONES;
const COULEUR_BORD_HEXAGONES = import.meta.env.VITE_COULEUR_BORD_HEXAGONES;
const COULEUR_FINAL_HEXAGONES = import.meta.env.VITE_COULEUR_FINAL_HEXAGONES;
const COULEUR_FINAL_BORD_HEXAGONES = import.meta.env.VITE_COULEUR_FINAL_BORD_HEXAGONES;

// Canvas principal et contexte 2D: tout le dessin passe par cet objet ctx.
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

// ...existing code...
