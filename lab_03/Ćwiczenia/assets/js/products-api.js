const tabelaProduktow = document.getElementById('produkty');
const poleSzukania = document.getElementById('szukaj');
const sortowanie = document.getElementById('sortowanie');
const status = document.getElementById('status');

let produkty = [];

function wyswietlProdukty() {
  const fraza = poleSzukania.value.trim().toLocaleLowerCase('pl');
  let wynik = produkty.filter(function (produkt) {
    const tekst = (produkt.title + ' ' + produkt.description).toLocaleLowerCase('pl');
    return tekst.includes(fraza);
  });

  if (sortowanie.value === 'ascending') {
    wynik.sort(function (a, b) {
      return a.title.localeCompare(b.title, 'pl');
    });
  } else if (sortowanie.value === 'descending') {
    wynik.sort(function (a, b) {
      return b.title.localeCompare(a.title, 'pl');
    });
  }

  tabelaProduktow.replaceChildren();

  wynik.forEach(function (produkt) {
    const wiersz = document.createElement('tr');
    const komorkaZdjecia = document.createElement('td');
    const zdjecie = document.createElement('img');
    const komorkaTytulu = document.createElement('td');
    const komorkaOpisu = document.createElement('td');

    zdjecie.src = produkt.thumbnail || produkt.images[0];
    zdjecie.alt = produkt.title;
    zdjecie.width = 80;
    komorkaZdjecia.appendChild(zdjecie);

    komorkaTytulu.textContent = produkt.title;
    komorkaOpisu.textContent = produkt.description;

    wiersz.appendChild(komorkaZdjecia);
    wiersz.appendChild(komorkaTytulu);
    wiersz.appendChild(komorkaOpisu);
    tabelaProduktow.appendChild(wiersz);
  });

  status.textContent = 'Wyświetlono ' + wynik.length + ' z ' + produkty.length + ' produktów.';
}

poleSzukania.addEventListener('input', wyswietlProdukty);
sortowanie.addEventListener('change', wyswietlProdukty);

fetch('https://dummyjson.com/products?limit=30')
  .then(function (odpowiedz) {
    if (!odpowiedz.ok) {
      throw new Error('Błąd pobierania danych');
    }
    return odpowiedz.json();
  })
  .then(function (dane) {
    produkty = dane.products.slice(0, 30);
    poleSzukania.disabled = false;
    sortowanie.disabled = false;
    wyswietlProdukty();
  })
  .catch(function () {
    status.textContent = 'Nie udało się pobrać produktów z API.';
  });
