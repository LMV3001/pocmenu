
//-----generation des hexagones-----

const container = document.getElementById("container");
const nombreHexagones = 24;

function hauteurHexagoneAvantCreation() {
  const vmin = Math.min(window.innerWidth, window.innerHeight) / 100;
  const hauteurBrute = 8.75 * vmin;
  return Math.min(105, Math.max(40, hauteurBrute)); // clamp(min,max)
}

if (container) {
  const hauteur = hauteurHexagoneAvantCreation();
  const largeur = (Math.sqrt(3) / 2) * hauteur;
  const decalageGauche = 10;
  const decalageHauteur = 10;
  const pasX = largeur / 2 - 0.35; // ajout d'un petit espace pour éviter les chevauchements
  const pasY = (3 * hauteur) / 4 - 0.2; // ajout d'un petit espace pour éviter les chevauchements

  for (let i = 0; i < nombreHexagones; i++) {
    const hexagone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    hexagone.setAttribute("class", "hexagone");
    hexagone.setAttribute("viewBox", "0 0 173.205 200");
    hexagone.setAttribute("aria-label", "Hexagone");
    hexagone.style.width = `${largeur}px`;
    hexagone.style.height = `${hauteur}px`;
    // Voisin diagonal affleurant pour un hexagone "pointy top": dx = largeur/2, dy = 3*hauteur/4.
    
    if(i % 2 === 0) {
        hexagone.style.top = `${decalageHauteur}px`;
      hexagone.style.left = `${i * pasX + decalageGauche}px`;
    } else {
      hexagone.style.top = `${pasY + decalageHauteur}px`;
      hexagone.style.left = `${i * pasX + decalageGauche}px`;  
    }
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", "86.6025,0 173.205,50 173.205,150 86.6025,200 0,150 0,50");
    polygon.setAttribute("fill", "#3498db");
    polygon.setAttribute("stroke", "#2980b9");
    polygon.setAttribute("stroke-width", "2");

    hexagone.appendChild(polygon);
    container.appendChild(hexagone);
  }
}


//-----animation hexagone-----

const hexagones = Array.from(document.querySelectorAll(".hexagone"));

if (hexagones.length > 0) {
  // Distance maximale entre la position initiale et le bord droit.
  const distanceHexagoneBordDroit = hexagones.map((hexagone) => {
    const rect = hexagone.getBoundingClientRect();
    return window.innerWidth - rect.left - rect.width - 10;
  });

  let rafId = null;
  const rotationActuelle = hexagones.map(() => 0);
  const translationActuelle = hexagones.map(() => 0);

  function renderFromScroll() {
    const scrollY = window.scrollY;
    let needAnotherFrame = false;

    hexagones.forEach((hexagone, index) => {
      const rotationCible = (scrollY * 360) / (window.innerHeight * 2);
      const translationCible = (scrollY * distanceHexagoneBordDroit[index]) / (window.innerHeight * 2);

      rotationActuelle[index] += (rotationCible - rotationActuelle[index]) * 0.14;
      translationActuelle[index] += (translationCible - translationActuelle[index]) * 0.14;

      hexagone.style.transform = `translateX(${translationActuelle[index]}px) rotate(${rotationActuelle[index]}deg)`;

      const angleDelta = Math.abs(rotationCible - rotationActuelle[index]);
      const translationDelta = Math.abs(translationCible - translationActuelle[index]);

      if (angleDelta > 0.05 || translationDelta > 0.05) {
        needAnotherFrame = true;
      }
    });

    if (needAnotherFrame) {
      rafId = requestAnimationFrame(renderFromScroll);
    } else {
      rafId = null;
    }
  }

  window.addEventListener(
    "scroll",
    () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(renderFromScroll);
      }
    },
    { passive: true }
  );

  renderFromScroll();
}