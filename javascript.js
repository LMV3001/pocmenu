//-----generation des hexagones-----

const container = document.getElementById("container");

function calculerNombreHexagones() {
  const nombreLignes = 4;
  const hauteur = hauteurHexagoneAvantCreation();
  const largeur = (Math.sqrt(3) / 2) * hauteur;
  const chevauchementX = 0.6;
  const pasX = largeur - chevauchementX;
  const decalageGauche = 10;
  const nombreColonnes = Math.ceil((window.innerWidth - decalageGauche) / pasX);
  return nombreColonnes * nombreLignes;
}

const nombreHexagones = calculerNombreHexagones();

function hauteurHexagoneAvantCreation() {
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
  const hauteurBrute = 6.25 * vmin;
  return Math.min(80, Math.max(28, hauteurBrute)); // clamp(min,max)
}

if (container) {
  const nombreLignes = 4;
  const hauteur = hauteurHexagoneAvantCreation();
  const largeur = (Math.sqrt(3) / 2) * hauteur;
  const decalageGauche = 10;
  const decalageHauteur = 10;
  const chevauchementX = 0.6; // compense les interstices visuels (anti-aliasing + stroke)
  const chevauchementY = 0.3;
  const pasX = largeur - chevauchementX;
  const pasY = (3 * hauteur) / 4 - chevauchementY;

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

    const ligne = i % nombreLignes;
    const colonne = Math.floor(i / nombreLignes);
    const decalageLigneX = (ligne % 2) * (largeur / 2);
    const remonteeMax = ligne * pasY;

    hexagone.style.top = `${ligne * pasY + decalageHauteur}px`;
    hexagone.style.left = `${colonne * pasX + decalageLigneX + decalageGauche}px`;
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
    container.appendChild(hexagone);
  }
}

//-----animation hexagone-----

const hexagones = Array.from(document.querySelectorAll(".hexagone"));
let distanceHexagoneBordDroit = [];

// Paramètres de la répartition des délais de départ.
const typeCourbeDelai = "easeOut"; // "lineaire" | "easeIn" | "easeOut" | "easeInOut"
const forceCourbeDelai = 1.8; // >1 accentue l'effet de la courbe
const etalementDelaiEnVh = 2; // 2 => départs étalés sur 2 hauteurs d'écran

const indexInverse = hexagones.map((_, index) => nombreHexagones - 1 - index); // Inverse pour que les hexagones de droite commencent à tourner avant ceux de gauche

let borneInf = [];
let borneSup = [];
let dureeAnimation = [];
let rafId = null;
const rotationActuelle = hexagones.map(() => 0);
const translationActuelle = hexagones.map(() => 0);

function recalculerTimeline() {
  const spanDepart = window.innerHeight * etalementDelaiEnVh;
  const dureeParHexagone = window.innerHeight * 2;
  const denominateur = Math.max(1, nombreHexagones - 1);

  function courbeDelai(t) {
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

  borneInf = hexagones.map((_, index) => {
    const t = indexInverse[index] / denominateur;
    return courbeDelai(t) * spanDepart;
  });

  borneSup = hexagones.map((_, index) => borneInf[index] + dureeParHexagone); // fin de l'animation pour cet hexagone selon sa position dans la liste
  dureeAnimation = hexagones.map((_, index) => borneSup[index] - borneInf[index]);

  // Garantit une zone de scroll suffisante pour que le dernier hexagone atteigne sa position finale.
  const scrollNecessaire = Math.max(0, ...borneSup);
  const hauteurMinimaleBody = Math.ceil(scrollNecessaire + window.innerHeight + 32);
  document.body.style.minHeight = `${hauteurMinimaleBody}px`;
}

function calculerDistances() {
  distanceHexagoneBordDroit = hexagones.map((hexagone) => {
    const rect = hexagone.getBoundingClientRect();
    return window.innerWidth - rect.left - rect.width - 10;
  });
}

calculerDistances();
recalculerTimeline();

  function renderFromScroll() {
    const scrollY = window.scrollY;
    hexagones.forEach((hexagone, index) => {
      const temps = scrollY - borneInf[index]; // temps écoulé depuis le début de l'animation de cet hexagone exprimé en pixel de scroll
      const progression = Math.max(0, Math.min(1, temps / dureeAnimation[index]));
      const rotationCible = progression * 360;
      const translationCible = progression * distanceHexagoneBordDroit[index];
      const remonteeMax = Number(hexagone.dataset.remonteeMax || 0);
      const translationYCible = -progression * remonteeMax;
      const progressionEaseOut = 1 - Math.pow(1 - progression, 2); // accélère la réduction au début
      const echelle = 1 - progressionEaseOut * 0.75; // 1 → 0.25 au cours de l'animation
      rotationActuelle[index] = rotationCible;
      translationActuelle[index] = translationCible;
      hexagone.style.transform = `translate(${translationActuelle[index]}px, ${translationYCible}px) rotate(${rotationActuelle[index]}deg) scale(${echelle})`;
    });

    rafId = null;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(renderFromScroll);
      }
    },
    { passive: true },
  );

  window.addEventListener("resize", () => {
    recalculerTimeline();
    calculerDistances();
    renderFromScroll();
  });

  renderFromScroll();

