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
const ECHELLE_TAILLE_HEXAGONES: number = Number(import.meta.env.VITE_ECHELLE_TAILLE_HEXAGONES);
const TAUX_HEXAGONES_TRANSPARENTS: number = Number(import.meta.env.VITE_TAUX_HEXAGONES_TRANSPARENTS);
const TAUX_REDUCTION_HEXAGONES_ANIMATION: number = Number(import.meta.env.VITE_TAUX_REDUCTION_HEXAGONES_ANIMATION);
const TAUX_HEXAGONES_DISPARITION: number = Number(import.meta.env.VITE_TAUX_HEXAGONES_DISPARITION);
const LIGNE_FIN_ANIMATION: number = Number(import.meta.env.VITE_LIGNE_FIN_ANIMATION);
const COULEUR_HEXAGONES: string = import.meta.env.VITE_COULEUR_HEXAGONES;
const COULEUR_BORD_HEXAGONES: string = import.meta.env.VITE_COULEUR_BORD_HEXAGONES;
const COULEUR_FINAL_HEXAGONES: string = import.meta.env.VITE_COULEUR_FINAL_HEXAGONES;
const COULEUR_FINAL_BORD_HEXAGONES: string = import.meta.env.VITE_COULEUR_FINAL_BORD_HEXAGONES;
// const COULEUR_SURVOL_HEXAGONE = "#e74c3c";
// const COULEUR_SURVOL_HEXAGONE_RGB = hexVersRgb(COULEUR_SURVOL_HEXAGONE);Z

// Canvas principal et contexte 2D: tout le dessin passe par cet objet ctx.
const canvas = document.getElementById("scene") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

// Types
interface Hexagone {
  left: number;
  top: number;
  centerX: number;
  centerY: number;
  remonteeMax: number;
  distanceBordDroit: number;
  alea: number;
  estTransparent: boolean;
  doitDisparaitre: boolean;
}

let hexagones: Hexagone[] = [];
let borneInf: number[] = [];
let dureeParHexagone: number = window.innerHeight * 2;
let inverseDureeParHexagone: number = 1 / Math.max(1, dureeParHexagone);
let rafId: number | null = null;
let layout: any = null;

let indexHexagoneSurvole: number | null = null;
let survolTimestamps: (number | null)[] = [];
const DUREE_TRANSITION_SURVOL = 200;

// fonction utilitaire pour limiter une valeur entre un minimum et un maximum
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function obtenirTailleViewport(): { width: number; height: number } {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  return {
    width: Math.round(vw),
    height: Math.round(vh),
  };
}

function hexVersRgb(hex: string | undefined): { r: number; g: number; b: number } {
  if (!hex) {
    console.error("hexVersRgb: couleur non définie !");
    return { r: 0, g: 0, b: 0 };
  }
  const valeur = hex.replace("#", "");
  const r = Number.parseInt(valeur.slice(0, 2), 16);
  const g = Number.parseInt(valeur.slice(2, 4), 16);
  const b = Number.parseInt(valeur.slice(4, 6), 16);
  return { r, g, b };
}

function melangerCouleursRgb(c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }, t: number): { r: number; g: number; b: number } {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

function rgbVersCss(couleur: { r: number; g: number; b: number }): string {
  return `rgb(${couleur.r}, ${couleur.g}, ${couleur.b})`;
}

console.log('COULEUR_HEXAGONES', COULEUR_HEXAGONES);
console.log('COULEUR_FINAL_HEXAGONES', COULEUR_FINAL_HEXAGONES);
console.log('COULEUR_BORD_HEXAGONES', COULEUR_BORD_HEXAGONES);
console.log('COULEUR_FINAL_BORD_HEXAGONES', COULEUR_FINAL_BORD_HEXAGONES);
const COULEUR_HEXAGONES_RGB = hexVersRgb(COULEUR_HEXAGONES);
const COULEUR_FINAL_HEXAGONES_RGB = hexVersRgb(COULEUR_FINAL_HEXAGONES);
const COULEUR_BORD_HEXAGONES_RGB = hexVersRgb(COULEUR_BORD_HEXAGONES);
const COULEUR_FINAL_BORD_HEXAGONES_RGB = hexVersRgb(COULEUR_FINAL_BORD_HEXAGONES);

function hauteurHexagoneAvantCreation(): number {
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
  const hauteurBrute = 6.25 * vmin;
  return clamp(hauteurBrute, 28, 80) * ECHELLE_TAILLE_HEXAGONES;
}

function courbeDelai(t: number): number {
  if (TYPE_COURBE_DELAI === "easeIn") {
    return Math.pow(t, FORCE_COURBE_DELAI);
  }
  if (TYPE_COURBE_DELAI === "easeOut") {
    return 1 - Math.pow(1 - t, FORCE_COURBE_DELAI);
  }
  if (TYPE_COURBE_DELAI === "easeInOut") {
    if (t < 0.5) {
      return 0.5 * Math.pow(2 * t, FORCE_COURBE_DELAI);
    }
    return 1 - 0.5 * Math.pow(2 * (1 - t), FORCE_COURBE_DELAI);
  }
  return t;
}

function calculerLayout() {
  const hauteur = hauteurHexagoneAvantCreation();
  const largeur = (Math.sqrt(3) / 2) * hauteur;
  const pasX = largeur - CHEVAUCHEMENT_X;
  const pasY = (3 * hauteur) / 4 - CHEVAUCHEMENT_Y;
  const nombreLignes = Math.ceil((window.innerHeight * TAILLE_GRILLE_VP - DECALAGE_HAUTEUR) / pasY) + 2;
  const nombreColonnes = Math.ceil((window.innerWidth * TAILLE_GRILLE_VP - DECALAGE_GAUCHE) / pasX);
  return {
    hauteur,
    largeur,
    pasX,
    pasY,
    nombreColonnes,
    nombreLignes,
    nombreHexagones: nombreColonnes * nombreLignes,
    rayon: hauteur / 2,
  };
}

function genererMasqueHexagonesTransparents(nombre: number, tauxTransparent: number): boolean[] {
  const masque = new Array<boolean>(nombre).fill(false);
  const indices = Array.from({ length: nombre }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = indices[i];
    indices[i] = indices[j];
    indices[j] = tmp;
  }
  const nombreTransparents = Math.floor(nombre * tauxTransparent);
  for (let i = 0; i < nombreTransparents; i++) {
    masque[indices[i]] = true;
  }
  return masque;
}

function initialiserHexagones(): void {
  layout = calculerLayout();
  hexagones = new Array<Hexagone>(layout.nombreHexagones);
  const masqueTransparents = genererMasqueHexagonesTransparents(layout.nombreHexagones, TAUX_HEXAGONES_TRANSPARENTS);
  const indices = Array.from({ length: layout.nombreHexagones }, (_, i) => i);
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  const nombreADisparaitre = Math.floor(layout.nombreHexagones * TAUX_HEXAGONES_DISPARITION);
  const masqueDisparaitre = new Array<boolean>(layout.nombreHexagones).fill(false);
  for (let i = 0; i < nombreADisparaitre; i++) {
    masqueDisparaitre[indices[i]] = true;
  }
  for (let i = 0; i < layout.nombreHexagones; i++) {
    const ligne = i % layout.nombreLignes;
    const colonne = Math.floor(i / layout.nombreLignes);
    const decalageLigneX = (ligne % 2) * (layout.largeur / 2);
    const left = colonne * layout.pasX + decalageLigneX + DECALAGE_GAUCHE;
    const top = ligne * layout.pasY + DECALAGE_HAUTEUR;
    hexagones[i] = {
      left,
      top,
      centerX: left + layout.largeur / 2,
      centerY: top + layout.hauteur / 2,
      remonteeMax: (ligne - LIGNE_FIN_ANIMATION) * layout.pasY,
      distanceBordDroit: window.innerWidth - left - layout.largeur - DISTANCE_BORD_DROIT,
      alea: (Math.random() - 0.5) * 2,
      estTransparent: masqueTransparents[i],
      doitDisparaitre: masqueDisparaitre[i],
    };
  }
  survolTimestamps = new Array<number | null>(layout.nombreHexagones).fill(null);
  recalculerTimeline();
}

function recalculerTimeline(): void {
  const spanDepart = window.innerHeight * ETALEMENT_DELAI_EN_VH;
  dureeParHexagone = window.innerHeight * 2;
  inverseDureeParHexagone = 1 / Math.max(1, dureeParHexagone);
  const denominateur = Math.max(1, hexagones.length - 1);
  let maxBorneInf = 0;
  borneInf = new Array<number>(hexagones.length);
  for (let i = 0; i < hexagones.length; i++) {
    const indexInverse = hexagones.length - 1 - i;
    const t = indexInverse / denominateur;
    const base = courbeDelai(t) * spanDepart;
    const offset = hexagones[i].alea * AMPLITUDE_ALEA * spanDepart;
    const borne = Math.max(0, base + offset);
    borneInf[i] = borne;
    if (borne > maxBorneInf) {
      maxBorneInf = borne;
    }
  }
  const scrollNecessaire = maxBorneInf + dureeParHexagone;
  const hauteurMinimaleBody = Math.ceil(scrollNecessaire + window.innerHeight + 32);
  (document.body as HTMLBodyElement).style.minHeight = `${hauteurMinimaleBody}px`;
}

function resizeCanvas(): void {
  const dpr = window.devicePixelRatio || 1;
  const viewport = obtenirTailleViewport();
  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

function dessinerHexagone(
  cx: number,
  cy: number,
  rayon: number,
  rotation: number,
  echelle: number,
  estTransparent: boolean,
  couleurFond: string,
  couleurBord: string
): void {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    const angle = -Math.PI / 2 + k * (Math.PI / 3) + rotation;
    const x = cx + rayon * echelle * Math.cos(angle);
    const y = cy + rayon * echelle * Math.sin(angle);
    if (k === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.closePath();
  ctx.fillStyle = estTransparent ? "rgba(255, 255, 255, 0)" : couleurFond;
  ctx.strokeStyle = estTransparent ? "rgba(41, 128, 185, 0)" : couleurBord;
  ctx.lineWidth = Math.max(0.5, 2 * echelle);
  ctx.fill();
  ctx.stroke();
}

function renderFromScroll(): void {
  const scrollY = window.scrollY;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const now = performance.now();
  for (let i = 0; i < hexagones.length; i++) {
    const hex = hexagones[i];
    const temps = scrollY - borneInf[i];
    const progression = clamp(temps * inverseDureeParHexagone, 0, 1);
    const rotation = progression * Math.PI * 2;
    const translationX = progression * hex.distanceBordDroit;
    const translationY = -progression * hex.remonteeMax;
    const progressionEaseOut = 1 - Math.pow(1 - progression, 2);
    let echelle = clamp(1 - progressionEaseOut * TAUX_REDUCTION_HEXAGONES_ANIMATION, 0.05, 1);
    if (hex.doitDisparaitre) {
      echelle = 1 - progressionEaseOut;
      if (echelle < 0.01) echelle = 0.01;
    }
    const progressionCouleur = clamp(progressionEaseOut * 1.4, 0, 1);
    let couleurFond = rgbVersCss(
      melangerCouleursRgb(COULEUR_HEXAGONES_RGB, COULEUR_FINAL_HEXAGONES_RGB, progressionCouleur),
    );
    let couleurBord = rgbVersCss(
      melangerCouleursRgb(COULEUR_BORD_HEXAGONES_RGB, COULEUR_FINAL_BORD_HEXAGONES_RGB, progressionCouleur),
    );
    let tSurvol = 0;
    if (indexHexagoneSurvole === i) {
      if (!survolTimestamps[i]) {
        survolTimestamps[i] = now;
      }
      tSurvol = clamp((now - survolTimestamps[i]!) / DUREE_TRANSITION_SURVOL, 0, 1);
    } else {
      survolTimestamps[i] = null;
    }
    if (tSurvol > 0) {
      couleurFond = rgbVersCss(
        melangerCouleursRgb(
          melangerCouleursRgb(COULEUR_HEXAGONES_RGB, COULEUR_FINAL_HEXAGONES_RGB, progressionCouleur),
          COULEUR_FINAL_HEXAGONES_RGB,
          tSurvol
        )
      );
      couleurBord = rgbVersCss(
        melangerCouleursRgb(
          melangerCouleursRgb(COULEUR_BORD_HEXAGONES_RGB, COULEUR_FINAL_BORD_HEXAGONES_RGB, progressionCouleur),
          COULEUR_FINAL_BORD_HEXAGONES_RGB,
          tSurvol
        )
      );
      if (tSurvol < 1) rafId = null;
    }
    const cx = hex.centerX + translationX;
    const cy = hex.centerY + translationY;
    dessinerHexagone(
      cx,
      cy,
      layout.rayon,
      rotation,
      echelle,
      hex.estTransparent,
      couleurFond,
      couleurBord,
    );
  }
  /*if (indexHexagoneSurvole !== null && survolTimestamps[indexHexagoneSurvole]) {
    const tSurvol = clamp((now - survolTimestamps[indexHexagoneSurvole]!) / DUREE_TRANSITION_SURVOL, 0, 1);
    if (tSurvol < 1) {
      rafId = null;
      scheduleRender();
    }
  }*/
  rafId = null;
}

function scheduleRender(): void {
  if (rafId === null) {
    rafId = requestAnimationFrame(renderFromScroll);
  }
}

function initialiser(): void {
  resizeCanvas();
  initialiserHexagones();
  renderFromScroll();
}

window.addEventListener("scroll", scheduleRender, { passive: true });

let lastWidth = window.innerWidth;
window.addEventListener("resize", () => {
  if (window.innerWidth !== lastWidth) {
    lastWidth = window.innerWidth;
    resizeCanvas();
    initialiserHexagones();
    renderFromScroll();
  }
});

function trouverHexagoneSousSouris(x: number, y: number): number | null {
  for (let i = 0; i < hexagones.length; i++) {
    const hex = hexagones[i];
    const cx = hex.centerX;
    const cy = hex.centerY;
    const dx = x - cx;
    const dy = y - cy;
    if (Math.sqrt(dx * dx + dy * dy) <= layout.rayon) {
      return i;
    }
  }
  return null;
}

canvas.addEventListener("mousemove", (e: MouseEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const idx = trouverHexagoneSousSouris(x, y);
  if (idx !== indexHexagoneSurvole) {
    indexHexagoneSurvole = idx;
    scheduleRender();
  }
});

canvas.addEventListener("mouseleave", () => {
  if (indexHexagoneSurvole !== null) {
    indexHexagoneSurvole = null;
    scheduleRender();
  }
});

initialiser();
