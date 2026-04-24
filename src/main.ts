import './style.css';

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
const ECHELLE_TAILLE_losangeS: number = Number(import.meta.env.VITE_ECHELLE_TAILLE_losangeS);
const TAUX_losangeS_TRANSPARENTS: number = Number(import.meta.env.VITE_TAUX_losangeS_TRANSPARENTS);
const TAUX_REDUCTION_losangeS_ANIMATION: number = Number(import.meta.env.VITE_TAUX_REDUCTION_losangeS_ANIMATION);
const TAUX_losangeS_DISPARITION: number = Number(import.meta.env.VITE_TAUX_losangeS_DISPARITION);
const LIGNE_FIN_ANIMATION: number = Number(import.meta.env.VITE_LIGNE_FIN_ANIMATION);
const COULEUR_FILL_LOSANGES: string = import.meta.env.VITE_COULEUR_losangeS;
const COULEUR_STROKE_LOSANGES: string = import.meta.env.VITE_COULEUR_BORD_losangeS;
const COULEUR_FINAL_FILL_LOSANGES: string = import.meta.env.VITE_COULEUR_FINAL_losangeS;
const COULEUR_FINAL_STROKE_LOSANGES: string = import.meta.env.VITE_COULEUR_FINAL_BORD_losangeS;

// Canvas principal et contexte 2D: tout le dessin passe par cet objet ctx.
const canvas = document.getElementById("scene") as HTMLCanvasElement;
const ctx = canvas.getContext("2d");

// Types

class Losange {
  private readonly demiDIagonale : number;
  private readonly xInitial: number;
  private readonly yInitial: number;
  private readonly xCible: number;
  private readonly yCible: number;
  private readonly RotationCible: number;
  private readonly facteurAleatoire: number; // une génération aléatoire optimisé perfonmance devra etre trouver pour eviter de faire du Math.random() dans la boucle de calcul de timeline
  private readonly reductionCilbe : number;
  private readonly couleurFillInitiale: string; // Couleur de remplissage au début de l'animation
  private readonly couleurStrokeInitiale: string; // Couleur du contour au début de l'animation
  private readonly couleurFillFinale: string; // Couleur de remplissage à la fin de l'animation
  private readonly couleurStrokeFinale: string; // Couleur du contour à la fin de l'animation

  constructor(xInitial: number, yInitial: number, xCible: number, yCible: number) {
    this.demiDIagonale = 150; // à modifier par une constante globale ou un paramètre d'environnement
    this.xInitial = xInitial;
    this.yInitial = yInitial;
    this.xCible = xCible;
    this.yCible = yCible;
    this.facteurAleatoire = 0.5 + Math.random(); // a optimiser pour éviter de faire du Math.random() dans la boucle de calcul de timeline
    this.RotationCible = 2 * Math.PI; // à modifier par une constante globale ou un paramètre d'environnement
    this.reductionCilbe = clamp(this.facteurAleatoire, 0.05, 1); // à modifier par une formule plus complexe ou un paramètre d'environnement
    this.couleurFillInitiale = COULEUR_FILL_LOSANGES;
    this.couleurStrokeInitiale = COULEUR_STROKE_LOSANGES;
    this.couleurFillFinale = COULEUR_FINAL_FILL_LOSANGES;
    this.couleurStrokeFinale = COULEUR_FINAL_STROKE_LOSANGES;
  }
  // Méthode pour calculer la progression de l'animation en fonction du temps écoulé

  private calculerProgression(ctx : CanvasRenderingContext2D, PostionScrollActuelle: number, tempsEcoule: number): void {
    
    const startY = this.yInitial + (PositionScrollActuelle * this.facteurAleatoire);
    const x = this.xInitial + (this.xCible - this.xInitial) * (tempsEcoule);
    const y = startY + (this.yCible - startY) * (tempsEcoule);
    
    this.dessiner(ctx, x, y); // Rotation et échelle à 0 et 1 pour l'instant
  
  }
 
  // Méthode pour dessiner le losange à une étape donnée de l'animation dans canvas 
  private dessiner (ctx : CanvasRenderingContext2D, x: number, y: number): void {
    ctx.beginPath();

    ctx.moveTo(x, y);
    ctx.lineTo(x + this.demiDIagonale, y + this.demiDIagonale);
    ctx.lineTo(x + this.demiDIagonale, y - this.demiDIagonale);
    ctx.lineTo(x - this.demiDIagonale, y - this.demiDIagonale);
    ctx.lineTo(x - this.demiDIagonale, y + this.demiDIagonale);
    ctx.closePath(); 
}

class scene {

  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private losanges: Losange[] = [];
  private scrollCible : number = 0;
  private scrollActuel : number = 0;

  constructor(canvasId: string) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.initEventListeners();

  }

  private initEventListeners(): void {
    window.addEventListener("scroll", () => {
      this.scrollCible = window.scrollY;
    }, { passive: true });




