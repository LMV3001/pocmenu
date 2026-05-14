import {Triangle} from './figures';
import { Indices } from './indices';


export class Lettres {

  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly typeFigures: number = 0; // 0: losange, 1: triangle, 2: triangle rectangle, 3: hexagone, 4: octogone
  private readonly tailleFigures: number;
  private readonly largeurFigures: number;
  private readonly hauteurFigures: number;
  private readonly figures: Figures[] = [];
  private readonly nombreLignes: number = 0;
  private readonly nombreColonnes: number = 0;
  //private scrollCible : number = 0;
 // private scrollActuel : number = 0;


  constructor(canvasId: string, typeFigures: number, tailleFigures: number) {
    this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d")!;
    this.canvas.width = tailleFigures * 10; // Largeur fixe pour les lettres
    this.canvas.height = tailleFigures * 10; // Hauteur fixe pour les lettres
    this.typeFigures = typeFigures;
    this.tailleFigures = tailleFigures;
    this.nombreColonnes = 10;
    this.nombreLignes = 10;

    this.construireGrille();

    //this.initEventListeners();

  }

  /******************************************Construction de la grille*****************************************************/

  private construireGrille(): void {

    let createFigure: (largeur: number, hauteur: number, x: number, y: number, xc: number, yc: number, ind: Indices) => Figures;
    
    if (this.typeFigures === 0) {
      createFigure = (largeur, hauteur, x, y, xc, yc, ind) => new Losange(largeur, hauteur, x, y, xc, yc, ind);
    } else if (this.typeFigures === 1) {
      createFigure = (largeur, hauteur, x, y, xc, yc, ind) => new Triangle(largeur, hauteur, x, y, xc, yc, ind);
    } else if (this.typeFigures === 2) {
      createFigure = (largeur, hauteur, x, y, xc, yc, ind) => new TriangleRectangle(largeur, hauteur, x, y, xc, yc, ind);
    } else if (this.typeFigures === 3) {
      createFigure = (largeur, hauteur, x, y, xc, yc, ind) => new Hexagone(largeur, hauteur, x, y, xc, yc, ind);
    } else if (this.typeFigures === 4) {
      createFigure = (largeur, hauteur, x, y, xc, yc, ind) => new Octogone(largeur, hauteur, x, y, xc, yc, ind);     
    }


    for (let i = 0; i < this.nombreColonnes; i++) {
      for (let j = 0; j < this.nombreLignes; j++) {
        const xInitial: number = i * this.largeurFigures/2;
        const yInitial: number = j * this.hauteurFigures; // à modifier par une formule plus complexe ou un paramètre d'environnement
        const xCible : number = this.canvas.width - this.largeurFigures; // à modifier par une formule plus complexe ou un paramètre d'environnement
        const yCible : number = this.hauteurFigures; // à modifier par une formule plus complexe ou un paramètre d'environnement
        const indice: Indices = new Indices(i, j);
        this.figures.push(createFigure(this.largeurFigures, this.hauteurFigures, xInitial, yInitial, xCible, yCible, indice));
      }
    }
  }

  /*
  private initEventListeners(): void {
    window.addEventListener("scroll", () => {
      this.scrollCible = window.scrollY;
    }, { passive: true });

    window.addEventListener("resize", () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
      this.nombreColonnes = Math.ceil(this.canvas.width / (this.largeurFigures/2)) + 2; // à modifer par une formule plus complexe ou un paramètre d'environnement
      this.nombreLignes = Math.ceil(this.canvas.height / this.hauteurFigures) + 2; // à modifer par une formule plus complexe ou un paramètre d'environnement
    });

  } 

  public start(): void {
      this.loop();
  }

  private loop(): void {
    this.scrollActuel += (this.scrollCible - this.scrollActuel) * 0.1; // Lissage du scroll
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    const tempsEcoule = Math.min(this.scrollActuel / 2000, 1); // Temps écoulé en secondes
    // this.ctx.beginPath(); à remettre après test
    // this.ctx.fillStyle = COULEUR_FILL_LOSANGES; à 
    this.figures.forEach((figure) => figure.calculerProgression(this.ctx, this.scrollActuel, tempsEcoule, this.canvas.width, this.canvas.height));
    //this.ctx.fill(); à remettre après test
    requestAnimationFrame(() => this.loop()); // Continue la boucle d'animation
  }
*/
}