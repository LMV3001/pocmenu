import { Figures, Triangle} from "./figures";
import { Indices } from "./indices";
import {Point} from './point';

export class Grille {

  private readonly typeFigures: number = 0; // 0: losange, 1: triangle, 2 : triangle rectangle, 3: hexagone, 4: octogone
  private readonly tailleFigures: number;
  private readonly largeurFigures: number;
  private readonly hauteurFigures: number;
  private readonly nombreFiguresParCase: Array<Array<number>>; // à modifier par une formule plus complexe ou un paramètre d'environnement
  public readonly figures: Figures[] = [];
  private readonly nombreLignes: number;
  private readonly nombreColonnes: number;
    //private scrollCible : number = 0;
   // private scrollActuel : number = 0;

  constructor(nombreColonnes: number, nombreLignes: number, typeFigures: number, tailleFigures: number, figures?: Figures[]) {
    this.nombreColonnes = nombreColonnes;
    this.nombreLignes = nombreLignes;   
    this.typeFigures = typeFigures;
    this.tailleFigures = tailleFigures;
    this.largeurFigures = this.tailleFigures; //calculLargeurFigures(this.tailleFigures);
    this.hauteurFigures = this.tailleFigures; //calculHauteurFigures(this.tailleFigures, this.typeFigures);
    this.nombreFiguresParCase = this.calculFiguresParCase(); // à remplir par une formule plus complexe ou un paramètre d'environnement
    console.log("Nombre de figures par case : ", this.nombreFiguresParCase);
    this.figures = figures ?? [];

    //this.ajouterTriangleGrille(); // à modifier par une formule plus complexe ou un paramètre d'environnement
    this.AjouterTriangleCase(new Indices(1,0),new Point(this.largeurFigures/2,0,0)) // à modifier par une formule plus complexe ou un paramètre d'environnement;
    //this.AjouterTriangleCase(new Indices(0,0),new Point(0,0,0)); // à modifier par une formule plus complexe ou un paramètre d'environnement
  }

private ajouterTriangleGrille(): void {
        let xInitial: number = 0;

        for (let i = 0; i < this.nombreColonnes; i++) {
            for (let j = 0; j < this.nombreLignes; j++) {
                const indice: Indices = new Indices(i, j);
                const pointInitial: Point = new Point(0,0,0); // à modifier par une formule plus complexe ou un paramètre d'environnement
                const pointCible: Point = new Point(0,0,0); //

                pointInitial.x = i * this.largeurFigures/2; // à modifier par une formule plus complexe ou un paramètre d'environnement
                pointInitial.y = j * this.hauteurFigures;
                pointInitial.z = -this.largeurFigures; // à modifier par une formule plus complexe ou un paramètre d'environnement
          
                this.AjouterTriangleCase(indice, pointInitial, pointCible);
            }
      
        }
}

    private AjouterTriangleCase(indiceCase : Indices, pointInitial: Point, pointCible?: Point): void {

    const nbreFigureCase = this.nombreFiguresParCase[indiceCase.colonne][indiceCase.ligne];
  
    const echelle : number = 1/nbreFigureCase;
    const hauteur : number = this.hauteurFigures * echelle;
    const largeur : number = this.largeurFigures * echelle;  
    const symetrieAxiale : number = (indiceCase.colonne % 2 === 0 && indiceCase.ligne % 2 === 0) || (indiceCase.colonne % 2 !== 0 && indiceCase.ligne % 2 !== 0) ? 1 : -1;
 // Inverse le sens de remplissage pour les colonnes impaires

    for (let i = 0; i < nbreFigureCase; i++) {
        for (let j = 0; j <(i*2)+1; j++) {
       const point: Point = new Point(0,0,0); 
       const pointCible: Point = new Point(0,0,0); 

       let facteurSymetrie : number = (j % 2 === 0) ? symetrieAxiale : symetrieAxiale*-1;

           point.x = pointInitial.x; // à modifier par une formule plus complexe ou un paramètre d'environnement
           point.y = pointInitial.y; // à modifier par une formule plus complexe ou un paramètre d'environnement
           point.z = pointInitial.z ; // à modifier par une formule plus complexe ou un paramètre d'environnement

          pointCible.x = point.x;
          pointCible.y = point.y;
          pointCible.z = 1000; // à modifier par une formule plus complexe ou un paramètre d'environnement
        this.figures.push(new Triangle(largeur, hauteur, point, pointCible, indiceCase, facteurSymetrie));
      }
    }
  }

  private calculFiguresParCase(): Array<Array<number>> {
    const nombreFigures: Array<Array<number>> = [];
    for (let i = 0; i < this.nombreColonnes; i++) {
      const colonne: Array<number> = [];
      for (let j = 0; j < this.nombreLignes; j++) {
        colonne.push(Math.floor(Math.random() * 1)+1); // Exemple de génération aléatoire
      }
      nombreFigures.push(colonne);
    }
    return nombreFigures;
  }

}
