// Canvas principal et contexte 2D: tout le dessin passe par cet objet ctx.
const canvas = document.getElementById("scene");
const ctx = canvas.getContext("2d");

// Parametres de la grille hexagonale.
// On garde x lignes fixes, puis on calcule automatiquement le nombre de colonnes.
const NOMBRE_LIGNES = 30;
const DECALAGE_GAUCHE = -20;
const DECALAGE_HAUTEUR = -20;
const CHEVAUCHEMENT_X = 0.6; // évite les fentes visuelles dues au rendu sous-pixel des SVG.
const CHEVAUCHEMENT_Y = 0.3; // chevauchement horizontal et vertical entre les hexagones pour un rendu sans fentes.
const DISTANCE_BORD_DROIT = 10;

// Parametres de la timeline d'animation (declenchement dans le temps/scroll).
const TYPE_COURBE_DELAI = "easeOut";
const FORCE_COURBE_DELAI = 1.8;
const ETALEMENT_DELAI_EN_VH = 2; // Combien de viewport height pour etaler les delais de depart des hexagones.
const AMPLITUDE_ALEA = 0.3; // amplitude de l'alea de placement des delais de depart (en proportion du span d'etalement), pour casser le cote trop mecanique.
const ECHELLE_TAILLE_HEXAGONES = 1;// Taille de l'hexagone à la création 1 = taille normale, <1 = hexagones plus petits, >1 = hexagones plus grands.
const TAUX_HEXAGONES_TRANSPARENTS = 0.0;
const TAUX_REDUCTION_HEXAGONES_ANIMATION = 0; // 0.75 = 75% de reduction (taille finale = 25%).
const COULEUR_HEXAGONES = "#3498db";
const COULEUR_BORD_HEXAGONES = "#2980b9";
const COULEUR_FINAL_HEXAGONES = "#2ecc71";
const COULEUR_FINAL_BORD_HEXAGONES = "#27ae60";
// Donnees d'etat mises a jour au chargement et au resize.

let hexagones = [];
let borneInf = [];
let dureeParHexagone = window.innerHeight * 2;
let inverseDureeParHexagone = 1 / Math.max(1, dureeParHexagone);
let rafId = null;
let layout = null;

// Survol souris : index de l'hexagone survolé ou null
let indexHexagoneSurvole = null;
// Pour chaque hexagone, temps de survol (timestamp ou null)
let survolTimestamps = [];
const DUREE_TRANSITION_SURVOL = 200; // ms

// Couleur de survol
const COULEUR_SURVOL_HEXAGONE = "#e74c3c";
const COULEUR_SURVOL_HEXAGONE_RGB = hexVersRgb(COULEUR_SURVOL_HEXAGONE);

// Utilitaire simple: garde une valeur entre min et max.
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function obtenirTailleViewport() {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  return {
    width: Math.round(vw),
    height: Math.round(vh),
  };
}

// Convertit une couleur hex en objet {r, g, b} pour faciliter les calculs de melange de couleurs.
function hexVersRgb(hex) {
  const valeur = hex.replace("#", "");
  const r = Number.parseInt(valeur.slice(0, 2), 16);
  const g = Number.parseInt(valeur.slice(2, 4), 16);
  const b = Number.parseInt(valeur.slice(4, 6), 16);
  return { r, g, b };
}

// Melange lineaire de deux couleurs RGB: t=0 -> c1, t=1 -> c2. ou t entre 0 et 1 pour un melange progressif.
function melangerCouleursRgb(c1, c2, t) {
  return {
    r: Math.round(c1.r + (c2.r - c1.r) * t),
    g: Math.round(c1.g + (c2.g - c1.g) * t),
    b: Math.round(c1.b + (c2.b - c1.b) * t),
  };
}

// Convertit une couleur RGB en string CSS "rgb(r, g, b)".
function rgbVersCss(couleur) {
  return `rgb(${couleur.r}, ${couleur.g}, ${couleur.b})`;
}

const COULEUR_HEXAGONES_RGB = hexVersRgb(COULEUR_HEXAGONES);
const COULEUR_FINAL_HEXAGONES_RGB = hexVersRgb(COULEUR_FINAL_HEXAGONES);
const COULEUR_BORD_HEXAGONES_RGB = hexVersRgb(COULEUR_BORD_HEXAGONES);
const COULEUR_FINAL_BORD_HEXAGONES_RGB = hexVersRgb(COULEUR_FINAL_BORD_HEXAGONES);

// Taille responsive des hexagones:
// - basee sur la taille de la fenetre
// - bornee pour rester lisible (ni trop petit ni trop grand)
function hauteurHexagoneAvantCreation() {
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
  const hauteurBrute = 6.25 * vmin;
  return clamp(hauteurBrute, 28, 80) * ECHELLE_TAILLE_HEXAGONES; // les min et max seront à revoir selon les cas de test
}

// Repartition non lineaire des delais de depart.
// t est une valeur normalisee entre 0 et 1.
function courbeDelai(t) {
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

// Calcule les dimensions de la grille pour l'ecran courant.
// On derive largeur/pas a partir de la hauteur pour conserver la geometrie de l'hexagone.
function calculerLayout() {
  const hauteur = hauteurHexagoneAvantCreation();
  const largeur = (Math.sqrt(3) / 2) * hauteur;
  const pasX = largeur - CHEVAUCHEMENT_X;
  const pasY = (3 * hauteur) / 4 - CHEVAUCHEMENT_Y;
  const nombreColonnes = Math.ceil((window.innerWidth - DECALAGE_GAUCHE) / pasX);

  return {
    hauteur,
    largeur,
    pasX,
    pasY,
    nombreColonnes,
    nombreHexagones: nombreColonnes * NOMBRE_LIGNES,
    rayon: hauteur / 2,
  };
}

// Cree un masque booleen qui marque exactement ~30% des hexagones en transparent.
function genererMasqueHexagonesTransparents(nombre, tauxTransparent) {
  const masque = new Array(nombre).fill(false);
  const indices = Array.from({ length: nombre }, (_, i) => i);

  // Melange de Fisher-Yates pour une repartition aleatoire uniforme.
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

// Genere tous les hexagones et pre-calcule leurs valeurs utiles.
// Chaque element stocke sa position de base et ses cibles d'animation.
function initialiserHexagones() {
  layout = calculerLayout();
  hexagones = new Array(layout.nombreHexagones);
  const masqueTransparents = genererMasqueHexagonesTransparents(layout.nombreHexagones, TAUX_HEXAGONES_TRANSPARENTS);

  for (let i = 0; i < layout.nombreHexagones; i++) {
    // Index -> (ligne, colonne) pour remplir la grille.
    const ligne = i % NOMBRE_LIGNES;
    const colonne = Math.floor(i / NOMBRE_LIGNES);
    // Une ligne sur deux est decalee d'une demi-largeur (motif nid d'abeille).
    const decalageLigneX = (ligne % 2) * (layout.largeur / 2);

    const left = colonne * layout.pasX + decalageLigneX + DECALAGE_GAUCHE;
    const top = ligne * layout.pasY + DECALAGE_HAUTEUR;

    hexagones[i] = {
      left,
      top,
      // Centre de l'hexagone: point de reference pour le dessin canvas.
      centerX: left + layout.largeur / 2,
      centerY: top + layout.hauteur / 2,
      // Les lignes 2/3/4 remontent progressivement vers la ligne 1.
      remonteeMax: ligne * layout.pasY,
      // Distance horizontale a parcourir jusqu'au bord droit.
      distanceBordDroit: window.innerWidth - left - layout.largeur - DISTANCE_BORD_DROIT,
      // Aleatoire fixe (une seule fois) pour casser le cote trop mecanique.
      alea: (Math.random() - 0.5) * 2,
      estTransparent: masqueTransparents[i],
    };
  }

  // Init des timestamps de survol
  survolTimestamps = new Array(layout.nombreHexagones).fill(null);

  // Quand la grille change, la timeline doit etre recalculee.
  recalculerTimeline();
}

// Calcule, pour chaque hexagone, le moment de debut de son animation (borneInf).
// L'animation est pilotee par le scroll, donc le temps est exprime en pixels de scroll.
function recalculerTimeline() {
  const spanDepart = window.innerHeight * ETALEMENT_DELAI_EN_VH;
  dureeParHexagone = window.innerHeight * 2;
  inverseDureeParHexagone = 1 / Math.max(1, dureeParHexagone);

  const denominateur = Math.max(1, hexagones.length - 1);
  let maxBorneInf = 0;
  borneInf = new Array(hexagones.length);

  for (let i = 0; i < hexagones.length; i++) {
    // Inversion d'ordre: la droite commence avant la gauche.
    const indexInverse = hexagones.length - 1 - i;
    const t = indexInverse / denominateur;
    // Base structuree + offset aleatoire.
    const base = courbeDelai(t) * spanDepart;
    const offset = hexagones[i].alea * AMPLITUDE_ALEA * spanDepart;
    const borne = Math.max(0, base + offset);

    borneInf[i] = borne;
    if (borne > maxBorneInf) {
      maxBorneInf = borne;
    }
  }

  // Hauteur minimale de page pour garantir que toutes les animations peuvent se terminer.
  const scrollNecessaire = maxBorneInf + dureeParHexagone;
  const hauteurMinimaleBody = Math.ceil(scrollNecessaire + window.innerHeight + 32);
  document.body.style.minHeight = `${hauteurMinimaleBody}px`;
}

// Ajuste la resolution interne du canvas selon le selon de ratio wh et ww de l'utilisateur.

function resizeCanvas() {
  const dpr = window.devicePixelRatio || 1; // dpr -> device pixel ratio pour les ecrans retina et autres.
  const viewport = obtenirTailleViewport();
  canvas.width = Math.floor(viewport.width * dpr);
  canvas.height = Math.floor(viewport.height * dpr);
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

// Dessine un hexagone autour du centre (cx, cy).
// rotation est en radians, echelle est un facteur multiplicatif.
function dessinerHexagone(cx, cy, rayon, rotation, echelle, estTransparent, couleurFond, couleurBord) {
  ctx.beginPath();
  for (let k = 0; k < 6; k++) {
    // Point de chaque sommet de l'hexagone (6 sommets a 60 degres d'ecart).
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

// Rendu principal: convertit la position de scroll en progression 0..1 pour chaque hexagone,
// puis applique translation, rotation et reduction de taille.
function renderFromScroll() {
  const scrollY = window.scrollY;
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  const now = performance.now();

  for (let i = 0; i < hexagones.length; i++) {
    const hex = hexagones[i];
    // Temps ecoule depuis le debut propre a cet hexagone.
    const temps = scrollY - borneInf[i];
    // progression: 0 = pas commence, 1 = termine.
    const progression = clamp(temps * inverseDureeParHexagone, 0, 1);

    // Transformation 1: rotation complete.
    const rotation = progression * Math.PI * 2;
    // Transformation 2: deplacement horizontal vers la droite.
    const translationX = progression * hex.distanceBordDroit;
    // Transformation 3: remontee verticale vers la ligne 1.
    const translationY = -progression * hex.remonteeMax;

    // Transformation 4: reduction de taille (rapide au debut, plus douce ensuite).
    const progressionEaseOut = 1 - Math.pow(1 - progression, 2);
    const echelle = clamp(1 - progressionEaseOut * TAUX_REDUCTION_HEXAGONES_ANIMATION, 0.05, 1);
    // Transition de couleur volontairement accentuée pour etre visible tres vite.
    const progressionCouleur = clamp(progressionEaseOut * 1.4, 0, 1);
    let couleurFond = rgbVersCss(
      melangerCouleursRgb(COULEUR_HEXAGONES_RGB, COULEUR_FINAL_HEXAGONES_RGB, progressionCouleur),
    );
    let couleurBord = rgbVersCss(
      melangerCouleursRgb(COULEUR_BORD_HEXAGONES_RGB, COULEUR_FINAL_BORD_HEXAGONES_RGB, progressionCouleur),
    );

    // Transition douce sur le survol
    let tSurvol = 0;
    if (indexHexagoneSurvole === i) {
      // Si survolé, on démarre ou continue la transition
      if (!survolTimestamps[i]) {
        survolTimestamps[i] = now;
      }
      tSurvol = clamp((now - survolTimestamps[i]) / DUREE_TRANSITION_SURVOL, 0, 1);
    } else {
      // Si plus survolé, on reset la transition
      survolTimestamps[i] = null;
    }
    if (tSurvol > 0) {
      // Interpolation douce vers la couleur finale d'animation
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
      // Redessiner tant que la transition n'est pas terminée
      if (tSurvol < 1) rafId = null;
    }

    // Position finale du centre apres transformation.
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

  // Si une transition est en cours, continuer à animer
  if (indexHexagoneSurvole !== null && survolTimestamps[indexHexagoneSurvole]) {
    const tSurvol = clamp((now - survolTimestamps[indexHexagoneSurvole]) / DUREE_TRANSITION_SURVOL, 0, 1);
    if (tSurvol < 1) {
      rafId = null;
      scheduleRender();
    }
  }

  rafId = null;
}

// Evite de dessiner plusieurs fois dans la meme frame.
function scheduleRender() {
  if (rafId === null) {
    rafId = requestAnimationFrame(renderFromScroll);
  }
}

// Initialisation complete de la scene.
function initialiser() {
  resizeCanvas();
  initialiserHexagones();
  renderFromScroll();
}

// Au scroll: demande un rendu (throttle via requestAnimationFrame).
window.addEventListener("scroll", scheduleRender, { passive: true });

window.addEventListener("resize", () => {
  // Au resize: tout depend de la taille ecran, on recalcule puis on redessine.
  resizeCanvas();
  initialiserHexagones();
  renderFromScroll();
});


// Détecte l'hexagone sous la souris (coordonnées relatives au canvas)
function trouverHexagoneSousSouris(x, y) {
  // Les coordonnées x, y sont déjà dans le repère du canvas (après getBoundingClientRect)
  for (let i = 0; i < hexagones.length; i++) {
    const hex = hexagones[i];
    // On reprend la logique de position finale (sans animation)
    const cx = hex.centerX;
    const cy = hex.centerY;
    const dx = x - cx;
    const dy = y - cy;
    // Test simple: cercle inscrit
    if (Math.sqrt(dx * dx + dy * dy) <= layout.rayon) {
      return i;
    }
  }
  return null;
}

canvas.addEventListener("mousemove", (e) => {
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

// Demarre l'application.
initialiser();
