export function followMouse() {
  document.body.addEventListener('mousemove', (event) => {
    document.body.style.setProperty('--inline-client-x', `${event.clientX}px`);
    document.body.style.setProperty('--inline-client-y', `${event.clientY}px`);
  });
}
