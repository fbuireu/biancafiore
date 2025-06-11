export function followMouse() {
  document.body.addEventListener('mousemove', (event) => {
    document.body.style.setProperty('--client-x', `${event.clientX}px`);
    document.body.style.setProperty('--client-y', `${event.clientY}px`);
  });
}
