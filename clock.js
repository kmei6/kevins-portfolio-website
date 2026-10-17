function updateClock() {
  const time = new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
  }).format(new Date());

  document.querySelectorAll(".clock").forEach((clock) => {
    clock.textContent = time;
  });
}

updateClock();
window.setInterval(updateClock, 1000);
