const formularz = document.getElementById('formularz');
const minimumInput = document.getElementById('minimum');
const maksimumInput = document.getElementById('maksimum');
const wielkieInput = document.getElementById('wielkie');
const specjalneInput = document.getElementById('specjalne');

function losowyZnak(znaki) {
  return znaki[Math.floor(Math.random() * znaki.length)];
}

function wymieszaj(tablica) {
  for (let i = tablica.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const znak = tablica[i];
    tablica[i] = tablica[j];
    tablica[j] = znak;
  }

  return tablica;
}

formularz.addEventListener('submit', function (event) {
  event.preventDefault();

  const minimum = Number(minimumInput.value);
  const maksimum = Number(maksimumInput.value);

  if (!Number.isInteger(minimum) || !Number.isInteger(maksimum) ||
      minimum < 1 || maksimum > 256 || maksimum < minimum) {
    window.alert('Podaj prawidłowy zakres długości hasła od 1 do 256 znaków.');
    return;
  }

  const grupy = ['abcdefghijklmnopqrstuvwxyz', '0123456789'];

  if (wielkieInput.checked) {
    grupy.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
  }
  if (specjalneInput.checked) {
    grupy.push('!@#$%^&*()-_=+[]{};:,.?');
  }

  if (minimum < grupy.length) {
    window.alert('Minimalna długość hasła musi wynosić co najmniej ' + grupy.length + ' znaków.');
    return;
  }

  const dlugosc = minimum + Math.floor(Math.random() * (maksimum - minimum + 1));
  const haslo = [];

  grupy.forEach(function (grupa) {
    haslo.push(losowyZnak(grupa));
  });

  const wszystkieZnaki = grupy.join('');
  while (haslo.length < dlugosc) {
    haslo.push(losowyZnak(wszystkieZnaki));
  }

  window.alert('Wygenerowane hasło: ' + wymieszaj(haslo).join(''));
});
