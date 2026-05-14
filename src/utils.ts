export function calculHauteurFigures(tailleFigures: number, typeFigures: number): number {

    let hauteur = tailleFigures; // Valeur par défaut pour les losanges et triangles
    
    if (typeFigures === 3) {
        hauteur = tailleFigures * 0.75; // Espacement vertical pour hexagones orientés vers le haut
    } else if (typeFigures === 4) {
        hauteur = tailleFigures * Math.cos(Math.PI / 8);
    }
    return hauteur;
  }

export function calculLargeurFigures(tailleFigures: number): number {
    return tailleFigures; 
  }


export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
