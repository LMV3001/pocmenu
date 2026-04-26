export class Indices {
    colonne : number;
    ligne : number;

    constructor(colonne: number, ligne: number) {
        this.colonne = colonne;
        this.ligne = ligne;
    }
    
}

export abstract class Figures {
  protected readonly largeur : number;
  protected readonly hauteur : number;
  protected readonly xInitial: number;
  protected readonly yInitial: number;
  protected readonly xCible: number;
  protected readonly yCible: number;
  protected readonly RotationCible: number;
  protected readonly facteurAleatoire: number; // une génération aléatoire optimisée performance devra être trouvée
  protected readonly reductionCible : number;
  protected readonly couleurFillInitiale: string; 
  protected readonly couleurStrokeInitiale: string; 
  protected readonly couleurFillFinale: string; 
  protected readonly couleurStrokeFinale: string; 
  protected readonly indice : Indices;
  protected readonly colonneImpaire: number ; 
  protected readonly ligneImpaire: number ; // Temps écoulé depuis le début de l'animation, à utiliser pour les calculs d'animation

  constructor(largeur : number, hauteur : number, xInitial: number, yInitial: number, xCible: number, yCible: number, indice : Indices) {
    this.largeur = largeur;
    this.hauteur = hauteur;
    this.xInitial = xInitial;
    this.yInitial = yInitial;
    this.xCible = xCible;
    this.yCible = yCible;
    this.indice = indice;
    this.colonneImpaire = this.indice.colonne % 2 === 0 ? 0 : 1; // Alternance de la hauteur pour créer un effet de grille
    this.ligneImpaire = this.indice.ligne % 2 === 0 ? 0 : 1; // Alternance de la hauteur pour créer un effet de grille
    this.facteurAleatoire = 0.5 + Math.random();
    this.RotationCible = 2 * Math.PI; 
    this.reductionCible = 1; 
    this.couleurFillInitiale = '';
    this.couleurStrokeInitiale = '';
    this.couleurFillFinale = '';
    this.couleurStrokeFinale = '';
  }

  public calculerProgression(ctx : CanvasRenderingContext2D, ScrollActuelle: number, tempsEcoule: number): void {
    
    const startX = this.xInitial + (ScrollActuelle * this.facteurAleatoire);
    const startY = this.yInitial + (ScrollActuelle * this.facteurAleatoire);
   
    const easeOut = 1 - Math.pow(1 - tempsEcoule, 3);

    const x = startX + (this.xCible - startX) * easeOut;
    const y = startY + (this.yCible - startY) * easeOut;
    
    this.dessiner(ctx, x, y); // Pass the index value
  }
 
  protected abstract dessiner(ctx : CanvasRenderingContext2D, x: number, y: number): void;
  
}

export class Losange extends Figures{

  protected dessiner (ctx : CanvasRenderingContext2D, x: number, y: number): void {
    
    ctx.beginPath();// supprimer après test
    ctx.moveTo(x, y +(this.colonneImpaire * -this.hauteur/2)); // Point haut du losange
    ctx.lineTo(x - this.largeur/2, y + this.hauteur/2 * (1 - this.colonneImpaire));
    ctx.lineTo(x, y + this.hauteur * (1 - this.colonneImpaire/2)); // Point bas du losange
    ctx.lineTo(x + this.largeur/2, y + this.hauteur/2 * (1 - this.colonneImpaire));
    ctx.fillStyle = this.colonneImpaire ? "#3498db" : "#2ecc71"; // Couleur de remplissage basée sur la parité
    ctx.fill(); // supprimer après test
    ctx.closePath(); 
  }
}

export class Triangle extends Figures {
 
  protected dessiner (ctx : CanvasRenderingContext2D, x: number, y: number): void {
    ctx.beginPath(); // supprimer après test
    ctx.moveTo(x, y + (this.colonneImpaire * this.hauteur)); // Point de départ du triangle
    ctx.lineTo(x - this.largeur/2, y+this.hauteur*(1 - this.colonneImpaire)); // Point gauche du triangle
    ctx.lineTo(x + this.largeur/2, y+this.hauteur*(1 - this.colonneImpaire)); // Point droit du triangle
    ctx.fillStyle = this.colonneImpaire ? "#3498db" : "#2ecc71"; // supprimer après test
    ctx.fill(); // supprimer après test
    ctx.closePath(); 
 
  }

}

export class Hexagone extends Figures {

  private readonly rayon: number;

  constructor(largeur : number, hauteur : number, xInitial: number, yInitial: number, xCible: number, yCible: number, indice : Indices) {
    const rayon = largeur / 2; 
    const espacementX = rayon * 1.5;
    const espacementY = rayon * Math.sqrt(3);
    const colonneImpaire = indice.colonne % 2 === 0 ? 0 : 1;

    // Coordonnées idéales en nid d'abeille calculées AVANT l'instanciation du parent
    const vraiX = indice.colonne * espacementX;
    const vraiY = (indice.ligne * espacementY) + (colonneImpaire * (espacementY / 2));
    
    super(largeur, hauteur, vraiX, vraiY, xCible, yCible, indice);
    this.rayon = rayon;
  }
  

  protected dessiner (ctx : CanvasRenderingContext2D, x: number, y: number): void {
    const angle: number = Math.PI / 3; // 60 degrés en radians
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const xOffset = this.rayon * Math.cos(i * angle);
      const yOffset = this.rayon * Math.sin(i * angle);
      if (i === 0) {
        ctx.moveTo(x + xOffset, y + yOffset);
      } else {
        ctx.lineTo(x + xOffset, y + yOffset);
      }
    }
    ctx.closePath(); // Clôture AVANT de dessiner la bordure (stroke)

    ctx.fillStyle = this.colonneImpaire ? "#3498db" : "#2ecc71"; // supprimer après test
    ctx.fill(); // supprimer après test
    ctx.strokeStyle = this.colonneImpaire ? "#2980b9" : "#27ae60"; // supprimer après test
    ctx.stroke(); // supprimer après test
  } 
}

export class Octogone extends Figures {

  private readonly rayon: number;
  private readonly espacement: number;
  private readonly losangeRayon: number;

  constructor(largeur : number, hauteur : number, xInitial: number, yInitial: number, xCible: number, yCible: number, indice : Indices) {
    const rayon = largeur / 2; 
    const espacement = 2 * rayon * Math.cos(Math.PI / 8);

    // Positionnement sur une grille carrée simple
    const vraiX = indice.colonne * espacement;
    const vraiY = indice.ligne * espacement;
    
    super(largeur, hauteur, vraiX, vraiY, xCible, yCible, indice);
    this.rayon = rayon;
    this.espacement = espacement;
    
    // La demi-diagonale du losange (pour combler parfaitement l'interstice géométrique)
    this.losangeRayon = Math.SQRT2 * rayon * Math.sin(Math.PI / 8);
  }

  public calculerProgression(ctx : CanvasRenderingContext2D, ScrollActuelle: number, tempsEcoule: number): void {
    const easeOut = 1 - Math.pow(1 - tempsEcoule, 3);

    // 1. Calcul d'animation standard pour l'octogone
    const startX = this.xInitial + (ScrollActuelle * this.facteurAleatoire);
    const startY = this.yInitial + (ScrollActuelle * this.facteurAleatoire);
    const x = startX + (this.xCible - startX) * easeOut;
    const y = startY + (this.yCible - startY) * easeOut;
    
    // 2. Calcul d'animation spécifique pour le losange (interstice)
    const facteurLosange = this.facteurAleatoire * 2.5; // Se déplace beaucoup plus vite lors du scroll
    // On ajoute le décalage du pavage dès le point de départ
    const startXLosange = this.xInitial + (this.espacement / 2) + (ScrollActuelle * facteurLosange);
    const startYLosange = this.yInitial + (this.espacement / 2) + (ScrollActuelle * facteurLosange);
    // Le losange converge ainsi exactement vers la cible (xCible, yCible)
    const xl = startXLosange + (this.xCible - startXLosange) * easeOut;
    const yl = startYLosange + (this.yCible - startYLosange) * easeOut;
    const angleLosange = (1 - easeOut) * Math.PI * 2; // Fait un tour complet (360°) en arrivant
    
    this.dessiner(ctx, x, y); 
    this.dessinerLosange(ctx, xl, yl, angleLosange);
  }
  
  protected dessiner (ctx : CanvasRenderingContext2D, x: number, y: number): void {
    const angleOffset = Math.PI / 8;
    
    // 1. Tracer l'octogone
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI / 4) + angleOffset;
      const xOffset = this.rayon * Math.cos(angle);
      const yOffset = this.rayon * Math.sin(angle);
      if (i === 0) {
        ctx.moveTo(x + xOffset, y + yOffset);
      } else {
        ctx.lineTo(x + xOffset, y + yOffset);
      }
    }
    ctx.closePath(); 

    ctx.fillStyle = this.ligneImpaire ? "#3498db" : "#2ecc71"; // supprimer après test
    ctx.fill(); 
    ctx.strokeStyle = this.colonneImpaire ? "#2980b9" : "#27ae60"; // supprimer après test
    ctx.stroke(); 
  } 

  private dessinerLosange(ctx: CanvasRenderingContext2D, cx: number, cy: number, angle: number): void {
    ctx.save();
    ctx.translate(cx, cy); // Déplace directement le contexte au centre interpolé du losange
    ctx.rotate(angle);     // Applique la rotation calculée

    ctx.beginPath();
    ctx.moveTo(0, -this.losangeRayon);
    ctx.lineTo(this.losangeRayon, 0);
    ctx.lineTo(0, this.losangeRayon);
    ctx.lineTo(-this.losangeRayon, 0);
    ctx.closePath();

    // Inverser les couleurs pour le losange pour le différencier des octogones
    ctx.fillStyle = this.ligneImpaire ? "#2ecc71" : "#3498db"; 
    ctx.fill(); 
    ctx.strokeStyle = this.ligneImpaire ? "#27ae60" : "#2980b9"; 
    ctx.stroke(); 

    ctx.restore(); // Restaure le contexte pour ne pas affecter les autres figures
  } 
}
