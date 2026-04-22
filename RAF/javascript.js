//-----generation des hexagones-----

const container = document.getElementById("container");
// La grille est pensée en 4 lignes fixes, puis le nombre de colonnes est adapté à la largeur écran.
const NOMBRE_LIGNES = 4;
const DECALAGE_GAUCHE = 10;
const DECALAGE_HAUTEUR = 10;
// Léger recouvrement pour éviter les fentes visuelles dues au rendu sous-pixel des SVG.
const CHEVAUCHEMENT_X = 0.6;
const CHEVAUCHEMENT_Y = 0.3;
const DISTANCE_BORD_DROIT = 10;
const ROTATION_MAX = 360;
const REDUCTION_ECHELLE = 0.75;

function calculerNombreHexagones() {
  const hauteur = hauteurHexagoneAvantCreation();
  // Hexagone "pointy top": largeur = sqrt(3)/2 * hauteur.
  const largeur = (Math.sqrt(3) / 2) * hauteur;
  const pasX = largeur - CHEVAUCHEMENT_X;
  // On couvre la largeur utile écran; le total final = colonnes * lignes.
  const nombreColonnes = Math.ceil((window.innerWidth - DECALAGE_GAUCHE) / pasX);
  return nombreColonnes * NOMBRE_LIGNES;
}

const nombreHexagones = calculerNombreHexagones();

function hauteurHexagoneAvantCreation() {
  // vmin: taille responsive basée sur le plus petit côté de la fenêtre.
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
  const hauteurBrute = 6.25 * vmin;
  // Garde des hexagones lisibles sur petit écran et raisonnables sur grand écran.
  return Math.min(80, Math.max(28, hauteurBrute)); // clamp(min,max)
}

if (container) {
  const hauteur = hauteurHexagoneAvantCreation();
  const largeur = (Math.sqrt(3) / 2) * hauteur;
  // Pas de placement d'une grille hexagonale pointy-top.
  const pasX = largeur - CHEVAUCHEMENT_X;
  const pasY = (3 * hauteur) / 4 - CHEVAUCHEMENT_Y;
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < nombreHexagones; i++) {
    const hexagone = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "svg",
    );
    hexagone.setAttribute("class", "hexagone");
    hexagone.setAttribute("viewBox", "0 0 173.205 200");
    hexagone.setAttribute("aria-label", "Hexagone");
    hexagone.style.width = `${largeur}px`;
    hexagone.style.height = `${hauteur}px`;
    // Voisin diagonal affleurant pour un hexagone "pointy top": dx = largeur/2, dy = 3*hauteur/4.

    const ligne = i % NOMBRE_LIGNES;
    const colonne = Math.floor(i / NOMBRE_LIGNES);
    // Une ligne sur deux est décalée d'une demi-largeur pour l'effet nid d'abeille.
    const decalageLigneX = (ligne % 2) * (largeur / 2);
    // Mémoire de la remontée verticale maximale pour converger vers la ligne 1 pendant l'animation.
    const remonteeMax = ligne * pasY;

    hexagone.style.top = `${ligne * pasY + DECALAGE_HAUTEUR}px`;
    hexagone.style.left = `${colonne * pasX + decalageLigneX + DECALAGE_GAUCHE}px`;
    hexagone.dataset.remonteeMax = `${remonteeMax}`;
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    polygon.setAttribute(
      "points",
      "86.6025,0 173.205,50 173.205,150 86.6025,200 0,150 0,50",
    );
    polygon.setAttribute("fill", "#3498db");
    polygon.setAttribute("stroke", "#2980b9");
    polygon.setAttribute("stroke-width", "2");
    polygon.setAttribute("shape-rendering", "geometricPrecision");

    hexagone.appendChild(polygon);
    fragment.appendChild(hexagone);
  }

  container.appendChild(fragment);
}

//-----animation hexagone-----

const hexagones = Array.from(document.querySelectorAll(".hexagone"));
if (hexagones.length === 0) {
  // Rien à animer si aucun hexagone n'a été généré.
}
let distanceHexagoneBordDroit = [];
const remonteeMaxParHexagone = hexagones.map((hexagone) => Number(hexagone.dataset.remonteeMax || 0));

// Paramètres de la répartition des délais de départ.
// La courbe définit la structure temporelle globale, l'aléatoire casse la régularité.
const typeCourbeDelai = "easeOut"; // "lineaire" | "easeIn" | "easeOut" | "easeInOut"
const forceCourbeDelai = 1.8; // >1 accentue l'effet de la courbe
const etalementDelaiEnVh = 2; // 2 => départs étalés sur 2 hauteurs d'écran

// borneInf[index]: position de scroll à partir de laquelle l'hexagone index commence son animation.
let borneInf = [];
// Durée commune à tous les hexagones, exprimée en pixels de scroll.
let dureeParHexagone = window.innerHeight * 2;
let inverseDureeParHexagone = 1 / Math.max(1, dureeParHexagone);
// Verrou requestAnimationFrame pour éviter de lancer plusieurs rendus simultanés sur un burst de scroll.
let rafId = null;

// Offset aléatoire fixe par hexagone (généré une seule fois) pour varier les déclenchements.
const aleaParHexagone = Array.from({ length: hexagones.length }, () => (Math.random() - 0.5) * 2); // entre -1 et 1
const amplitudeAlea = 0.3; // fraction du spanDepart utilisée pour l'aléatoire

function courbeDelai(t) {
  // t est normalisé entre 0 et 1; la sortie module la densité des départs dans le temps.
  if (typeCourbeDelai === "easeIn") {
    return Math.pow(t, forceCourbeDelai);
  }
  if (typeCourbeDelai === "easeOut") {
    return 1 - Math.pow(1 - t, forceCourbeDelai);
  }
  if (typeCourbeDelai === "easeInOut") {
    if (t < 0.5) {
      return 0.5 * Math.pow(2 * t, forceCourbeDelai);
    }
    return 1 - 0.5 * Math.pow(2 * (1 - t), forceCourbeDelai);
  }
  return t;
}

function recalculerTimeline() {
  // Fenêtre globale de départs; tous les borneInf seront distribués dans [0, spanDepart].
  const spanDepart = window.innerHeight * etalementDelaiEnVh;
  dureeParHexagone = window.innerHeight * 2;
  inverseDureeParHexagone = 1 / Math.max(1, dureeParHexagone);
  const denominateur = Math.max(1, hexagones.length - 1);// pour éviter la division par zéro si jamais il n'y a qu'un hexagone
  let maxBorneInf = 0;

  borneInf = new Array(hexagones.length);
  for (let index = 0; index < hexagones.length; index++) {
    // Rang temporel normalisé en tenant compte de l'ordre inversé (droite -> gauche).
    const t = (hexagones.length - 1 - index) / denominateur;
    // Structure de base pilotée par la courbe choisie.
    const base = courbeDelai(t) * spanDepart;
    // Décalage aléatoire symétrique pour éviter les déclenchements trop mécaniques.
    const offset = aleaParHexagone[index] * amplitudeAlea * spanDepart;
    // Sécurité: pas de départ négatif.
    const borne = Math.max(0, base + offset);
    borneInf[index] = borne;
    if (borne > maxBorneInf) {
      maxBorneInf = borne;
    }
  }

  // Garantit une zone de scroll suffisante pour que le dernier hexagone atteigne sa position finale.
  const scrollNecessaire = maxBorneInf + dureeParHexagone;
  const hauteurMinimaleBody = Math.ceil(scrollNecessaire + window.innerHeight + 32);
  document.body.style.minHeight = `${hauteurMinimaleBody}px`;
}

function calculerDistances() {
  // Distance horizontale restante jusqu'au bord droit pour chaque hexagone.
  // Cette distance devient la cible de translationX à progression = 1.
  distanceHexagoneBordDroit = new Array(hexagones.length);
  for (let index = 0; index < hexagones.length; index++) {
    const hexagone = hexagones[index];
    const rect = hexagone.getBoundingClientRect();
    distanceHexagoneBordDroit[index] = window.innerWidth - rect.left - rect.width - DISTANCE_BORD_DROIT;
  }
}

calculerDistances();
recalculerTimeline();

function renderFromScroll() {
  const scrollY = window.scrollY;
  for (let index = 0; index < hexagones.length; index++) {
    const hexagone = hexagones[index];
    const temps = scrollY - borneInf[index]; // temps écoulé depuis le début de l'animation de cet hexagone exprimé en pixel de scroll
    // Normalisation 0..1: avant départ => 0, après fin => 1.
    const progression = Math.max(0, Math.min(1, temps * inverseDureeParHexagone));

    // 1) Rotation complète sur la durée.
    const rotation = progression * ROTATION_MAX;
    // 2) Glissement horizontal jusqu'au bord droit.
    const translationX = progression * distanceHexagoneBordDroit[index];
    // 3) Remontée progressive des lignes 2-4 vers le niveau de la ligne 1.
    const remonteeMax = remonteeMaxParHexagone[index];
    const translationY = -progression * remonteeMax;
    // 4) Réduction rapide au début (easeOut), puis amortie en fin de course.
    const progressionEaseOut = 1 - Math.pow(1 - progression, 2); // accélère la réduction au début
    const echelle = 1 - progressionEaseOut * REDUCTION_ECHELLE; // 1 → 0.25 au cours de l'animation

    // Un seul transform combine toutes les composantes pour limiter le coût de rendu.
    hexagone.style.transform = `translate(${translationX}px, ${translationY}px) rotate(${rotation}deg) scale(${echelle})`;
  }

  rafId = null;
}

if (hexagones.length > 0) {
  window.addEventListener(
    "scroll",
    () => {
      // On regroupe les scroll events d'une frame en un seul rendu.
      if (rafId === null) {
        rafId = requestAnimationFrame(renderFromScroll);
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    // Un resize change à la fois la timeline (hauteur écran) et les distances (largeur écran).
    recalculerTimeline();
    calculerDistances();
    renderFromScroll();
  });

  // Synchronise l'état visuel au chargement selon la position de scroll actuelle.
  renderFromScroll();
}

