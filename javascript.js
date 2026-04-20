const octogone = document.getElementById("1");

let rafId = null;
let currentAngle = 0;
let currentOffsetX = 0;

function renderFromScroll() {
  const scrollY = window.scrollY;
  const targetAngle = scrollY * 0.2;
  const targetOffsetX = Math.min(scrollY * 0.06, 70);

  currentAngle += (targetAngle - currentAngle) * 0.14;
  currentOffsetX += (targetOffsetX - currentOffsetX) * 0.14;

  octogone.style.transform = `translate(-50%, -50%) translateX(${currentOffsetX}px) rotate(${currentAngle}deg)`;

  const angleDelta = Math.abs(targetAngle - currentAngle);
  const offsetDelta = Math.abs(targetOffsetX - currentOffsetX);

  if (angleDelta > 0.05 || offsetDelta > 0.05) {
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