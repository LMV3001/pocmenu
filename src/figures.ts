
import { Indices } from "./indices";
import { clamp } from "./utils";
import { Point } from './point';

export abstract class Figures {
  protected readonly largeur : number;
  protected readonly hauteur : number;
  protected readonly pointInitial : Point; // à utiliser pour une animation de profondeur éventuelle
  protected readonly symetrieAxiale: number; // 1 pour les figures régulières et -1 pour les figures inversées
  protected readonly pointCible: Point;
  protected readonly rotationInitiale: Point; // Rotation de départ pour l'animation
  protected readonly rotationCible: Point; // Rotation cible pour l'animation
  protected readonly facteurAleatoire: number; // une génération aléatoire optimisée performance devra être trouvée
  protected readonly reductionCible : number;
  protected readonly couleurInitiale: {h: number, s: number, l: number}; 
  //protected readonly couleurStrokeInitiale: string; 
  protected readonly couleurFinale: {h: number, s: number, l: number}; 
  //protected readonly couleurStrokeFinale: string; 
  protected readonly indice : Indices;
  protected readonly colonneImpaire: number ; 
  protected readonly ligneImpaire: number ; // Temps écoulé depuis le début de l'animation, à utiliser pour les calculs d'animation

  constructor(largeur : number, hauteur : number, pointInitial: Point, pointCible: Point, indice : Indices, symetrieAxiale: number) {
    this.largeur = largeur;
    this.hauteur = hauteur;
    this.pointInitial = pointInitial;
    this.pointCible = pointCible;
    this.indice = indice;
    this.colonneImpaire = this.indice.colonne % 2 === 0 ? 0 : 1; // Alternance de la hauteur pour créer un effet de grille
    this.ligneImpaire = this.indice.ligne % 2 === 0 ? 0 : 1; // Alternance de la hauteur pour créer un effet de grille
    this.symetrieAxiale = symetrieAxiale; // 1 pour les figures régulières et -1 pour les figures inversées
    this.facteurAleatoire = 0.5 + Math.random();
    this.rotationInitiale = new Point(0, 0, 0); // Rotation de départ pour l'animation
    this.rotationCible = new Point(2 * Math.PI, 2 * Math.PI, 2 * Math.PI); // Rotation cible pour l'animation
    this.reductionCible = 1; 
    this.couleurInitialePaire = {h:210, s:15, l:85}; //hsl -> plus sombre que la couleur finale pour un effet de révélation
    this.couleurFinalePaire = {h:210, s:15, l:85}; //hsl -> plus clair que la couleur initiale pour un effet de révélation
    this.couleurInitialeImpaire ={h:180, s:20, l:65}; //hsl -> plus sombre que la couleur finale pour un effet de révélation
    this.couleurFinaleImpaire = {h:180, s:20, l:65}; //hsl -> plus clair que la couleur initiale pour un effet de révélation
    
    //this.couleurStrokeInitiale = '';
    //this.couleurStrokeFinale = '';
  }

  public calculerProgression(ctx : CanvasRenderingContext2D, ScrollActuelle: number, tempsEcoule: number, canvasWidth: number, canvasHeight: number): void {
    
    const startX = this.pointInitial.x + (ScrollActuelle * this.facteurAleatoire);
    const startY = this.pointInitial.y + (ScrollActuelle * this.facteurAleatoire);
    const startZ = this.pointInitial.z + (ScrollActuelle * this.facteurAleatoire);
    const couleurActuelle = '';
    const durée = 500; // Durée de l'animation en millisecondes
    const rotation = new Point(0, 0, 0);
    const facteurDelai = 0.8;
    const delai = (canvasWidth - this.pointInitial.x) * facteurDelai;
    const duréeAnimation = 500;
    let t = clamp((ScrollActuelle - delai) / duréeAnimation, 0, 1);
    const easeOut = Math.pow(t, 2)*(3-2*t); 
    const easeOutColor = Math.sqrt(easeOut);

    // Interpolation linéaire de la rotation en fonction du temps écoulé

    const rotationX = this.rotationInitiale.x + (this.rotationCible.x - this.rotationInitiale.x) * ScrollActuelle / durée;
    const rotationY = this.rotationInitiale.y + (this.rotationCible.y - this.rotationInitiale.y) * ScrollActuelle / durée;
    const rotationZ = this.rotationInitiale.z + (this.rotationCible.z - this.rotationInitiale.z) * ScrollActuelle / durée;
    rotation.x = rotationX*(this.facteurAleatoire-0.5)*2; // Rotation aléatoire pour chaque figure
    rotation.y = rotationY*(this.facteurAleatoire-0.5)*2;
    rotation.z = rotationZ*(this.facteurAleatoire-0.5)*2;
   
   // Interpolation linéaire de la couleur en fonction du temps écoulé
    const couleurIntermediairePaire = {
      h: this.couleurInitialePaire.h + (this.couleurFinalePaire.h - this.couleurInitialePaire.h) * easeOutColor,
      s: this.couleurInitialePaire.s + (this.couleurFinalePaire.s - this.couleurInitialePaire.s) * easeOutColor,
      l: this.couleurInitialePaire.l + (this.couleurFinalePaire.l - this.couleurInitialePaire.l) * easeOutColor
    };
    const couleurIntermediaireImpaire = {
      h: this.couleurInitialeImpaire.h + (this.couleurFinaleImpaire.h - this.couleurInitialeImpaire.h) * easeOutColor,
      s: this.couleurInitialeImpaire.s + (this.couleurFinaleImpaire.s - this.couleurInitialeImpaire.s) * easeOutColor,
      l: this.couleurInitialeImpaire.l + (this.couleurFinaleImpaire.l - this.couleurInitialeImpaire.l) * easeOutColor
    };
    const couleurIntermediaire = this.indice.colonne % 2 === 0 ? couleurIntermediairePaire : couleurIntermediaireImpaire;
    
    // Interpolation linéaire des points en fonction du temps écoulé

    const x = startX + (this.pointCible.x - startX) * easeOut;
    const y = startY + (this.pointCible.y - startY) * easeOut;
    const z = Math.max(startZ + (this.pointCible.z - startZ) * easeOut, this.hauteur*2); // Assure que z ne devient pas négatif
    const pointIntermediaire = new Point(x, y, z);
    
    // Application de la rotation interpolée en fonction de tempsEcoule
    const angle = this.RotationCible * easeOut;
    
    // Dessin de la figure avec la couleur intermédiaire  

    this.dessiner(ctx, pointIntermediaire, rotation, couleurIntermediaire); // Dessine la figure avec la couleur intermédiaire

  }
 
  protected abstract dessiner(ctx : CanvasRenderingContext2D, pointInitial: Point, rotation: Point, couleur: {h: number, s: number, l: number}): void;
  

}

export class Triangle extends Figures {
 
  protected dessiner (ctx : CanvasRenderingContext2D, pointInitial: Point, rotation: Point, couleur: {h: number, s: number, l: number}): void { 
    const x = pointInitial.x;
    const y = pointInitial.y;
    const z = pointInitial.z;
    console.log("Dessin du triangle à la position, x :", x, "y :", y, "z :", z);
    const rotationX = rotation.x;
    const rotationY = rotation.y;
    const rotationZ = rotation.z;
    const focale = 600; // Distance focale pour la projection 3D
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;
    // Le sommet est inversé selon la symétrie axiale
    const sommet : Point = new Point(x, y - this.hauteur/2 * this.symetrieAxiale, z);
    const BaseDevantGauche : Point = new Point(x - this.largeur/2, y + this.hauteur/2*this.symetrieAxiale, z-this.hauteur/2); // Inclinaison en fonction de la rotation sur l'axe X
    const BaseDevantDroite : Point = new Point(x + this.largeur/2, y + this.hauteur/2*this.symetrieAxiale, z-this.hauteur/2); // Inclinaison en fonction de la rotation sur l'axe X
    const BaseDerriereGauche : Point = new Point(x - this.largeur/2, y + this.hauteur/2*this.symetrieAxiale, z+this.hauteur/2); // Inclinaison en fonction de la rotation sur l'axe X
    const BaseDerriereDroite : Point = new Point(x + this.largeur/2, y + this.hauteur/2*this.symetrieAxiale, z+this.hauteur/2); // Inclinaison en fonction de la rotation sur l'axe X

    // Apply rotation to 3D points before projecting to 2D
    sommet.rotateX(rotationX);
    sommet.rotateY(rotationY);
    sommet.rotateZ(rotationZ);
    BaseDevantGauche.rotateX(rotationX);
    BaseDevantGauche.rotateY(rotationY);
    BaseDevantGauche.rotateZ(rotationZ);
    BaseDevantDroite.rotateX(rotationX);
    BaseDevantDroite.rotateY(rotationY);
    BaseDevantDroite.rotateZ(rotationZ);
    BaseDerriereGauche.rotateX(rotationX);
    BaseDerriereGauche.rotateY(rotationY);
    BaseDerriereGauche.rotateZ(rotationZ);
    BaseDerriereDroite.rotateX(rotationX);
    BaseDerriereDroite.rotateY(rotationY);
    BaseDerriereDroite.rotateZ(rotationZ);

    const point2DSommet = sommet.to2D(focale, canvasWidth/2, canvasHeight/2);
    const point2DBaseDevantGauche = BaseDevantGauche.to2D(focale, canvasWidth/2, canvasHeight/2);
    const point2DBaseDevantDroite = BaseDevantDroite.to2D(focale, canvasWidth/2, canvasHeight/2);
    const point2DBaseDerriereGauche = BaseDerriereGauche.to2D(focale, canvasWidth/2, canvasHeight/2);
    const point2DBaseDerriereDroite = BaseDerriereDroite.to2D(focale, canvasWidth/2, canvasHeight/2);

    // Calcul de la luminosité selon l'orientation de la face (éclairage venant de l'utilisateur)
    // Produit des cosinus : maximum quand la face est orientée vers l'utilisateur (x ≈ 0, y ≈ 0)
    // Effet de lumière plus subtil : l'écart de luminosité est réduit
    const lMin = couleur.l * 0.7; // 70% de la luminosité de base
    const lMax = couleur.l;
    const cosAngle = Math.cos(rotation.x) * Math.cos(rotation.y);
    // Clamp pour éviter les valeurs négatives (face cachée très sombre)
    const luminosite = lMin + (lMax - lMin) * Math.max(0, cosAngle);

    ctx.beginPath();
    /*ctx.moveTo(x , y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); // Point de départ du triangle
    ctx.lineTo(x-this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); // Point gauche du triangle     
    ctx.lineTo(x+this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); // Point droit du triangle
    */

    // face avant
    /*
    ctx.moveTo(x , y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); // Point de départ du triangle
    ctx.lineTo(x-this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); // Point gauche du triangle     
    ctx.lineTo(x+this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); 
    
    ctx.moveTo(x , y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); // Point de départ du triangle
    ctx.lineTo(x, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)-this.hauteur/2*this.symetrieAxiale*Math.sin(rotation.x)); // Point gauche du triangle     
    ctx.lineTo(x-this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x));  

    ctx.moveTo(x , y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x));
    ctx.lineTo(x, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)-this.hauteur/2*this.symetrieAxiale*Math.sin(rotation.x)); // Point gauche du triangle     
    ctx.lineTo(x+this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x));

    ctx.moveTo(x , y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)); // Point de départ du triangle
    ctx.lineTo(x, y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)+this.hauteur/2*this.symetrieAxiale*Math.sin(rotation.x)); // Point gauche du triangle     
    ctx.lineTo(x-this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x));  

    ctx.moveTo(x , y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x));
    ctx.lineTo(x, y-this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x)+this.hauteur/2*this.symetrieAxiale*Math.sin(rotation.x)); // Point gauche du triangle     
    ctx.lineTo(x+this.largeur/2*this.symetrieAxiale, y+this.hauteur/2*this.symetrieAxiale*Math.cos(rotation.x));
    */

    
    ctx.moveTo(point2DSommet.x , point2DSommet.y); // Point de départ du triangle
    ctx.lineTo(point2DBaseDevantGauche.x, point2DBaseDevantGauche.y); // Point gauche du triangle
    ctx.lineTo(point2DBaseDevantDroite.x, point2DBaseDevantDroite.y); // Point droit du triangle
    ctx.lineTo(point2DSommet.x , point2DSommet.y); // Point de départ du triangle
    ctx.lineTo(point2DBaseDerriereGauche.x, point2DBaseDerriereGauche.y); // Point gauche du triangle
    ctx.lineTo(point2DBaseDerriereDroite.x, point2DBaseDerriereDroite.y); // Point droit du triangle
    ctx.lineTo(point2DSommet.x , point2DSommet.y);
    ctx.moveTo(point2DBaseDevantGauche.x, point2DBaseDevantGauche.y); // Point de départ du triangle
    ctx.lineTo(point2DBaseDerriereGauche.x, point2DBaseDerriereGauche.y);
    ctx.moveTo(point2DBaseDevantDroite.x, point2DBaseDevantDroite.y); // Point de départ du triangle
    ctx.lineTo(point2DBaseDerriereDroite.x, point2DBaseDerriereDroite.y);


    ctx.fillStyle = `hsl(${couleur.h}, ${couleur.s}%, ${luminosite}%)`;
    ctx.strokeStyle = `white`;
    ctx.fill();
    ctx.stroke();
    ctx.closePath();
  }

  }

