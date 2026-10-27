const form = document.querySelector("#contact-form");
form.addEventListener("submit", (event) => {
  event.preventDefault();
  alert("Dziękuję za wiadomość!");
  form.reset();
});
