const czas = document.getElementById('czas');
const start = document.getElementById('start');
const stop = document.getElementById('stop');
const reset = document.getElementById('reset');

let sekundy = 0;
let interwal = null;

function pokazCzas() {
  const minuty = Math.floor(sekundy / 60);
  const pozostaleSekundy = sekundy % 60;
  if (minuty === 0) {
    czas.textContent = pozostaleSekundy + 's';
  } else {
    czas.textContent = minuty + 'min ' + pozostaleSekundy + 's';
  }
}

start.addEventListener('click', function () {
  if (interwal !== null) {
    return;
  }

  interwal = window.setInterval(function () {
    sekundy += 1;
    pokazCzas();
  }, 1000);
});

stop.addEventListener('click', function () {
  window.clearInterval(interwal);
  interwal = null;
});

reset.addEventListener('click', function () {
  window.clearInterval(interwal);
  interwal = null;
  sekundy = 0;
  pokazCzas();
});
