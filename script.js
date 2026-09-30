"use strict";

// ---------- Instellingen ----------
const dagdelen = [
  { naam: "🌙 Nacht",     van: 0,  tot: 6,  kleur: "#3b3b8f" },
  { naam: "🌅 Ochtend",   van: 6,  tot: 12, kleur: "#f59e0b" },
  { naam: "☀️ Middag",    van: 12, tot: 18, kleur: "#f97316" },
  { naam: "🌆 Avond",     van: 18, tot: 24, kleur: "#7c3aed" },
];

const oefeningen = {
  heleHalve: { minuten: [0, 30], label: "Hele en halve uren" },
  kwartieren: { minuten: [0, 15, 30, 45], label: "Kwart voor en kwart over" },
  vijf: { minuten: [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55], label: "5 en 10 minuten" },
  alle: { minuten: null, label: "Alle tijden" },
};

// ---------- Status ----------
let gekozenKlok = null;
let gekozenOefening = null;
let huidigeTijd = null;
let goedCount = 0;
let foutCount = 0;

// ---------- Elementen ----------
const startScherm = document.getElementById("startScherm");
const oefenScherm = document.getElementById("oefenScherm");
const keuzeMelding = document.getElementById("keuzeMelding");
const urenHand = document.getElementById("urenHand");
const minutenHand = document.getElementById("minutenHand");
const wijzerplaat = document.getElementById("wijzerplaat");

// Cijfers op de wijzerplaat tekenen
(function tekenWijzerplaat() {
  for (let i = 0; i < 12; i++) {
    const hoek = (i / 12) * 2 * Math.PI - Math.PI / 2;
    const x = 100 + Math.cos(hoek) * 78;
    const y = 100 + Math.sin(hoek) * 78;
    const tekst = document.createElementNS("http://www.w3.org/2000/svg", "text");
    tekst.setAttribute("x", x);
    tekst.setAttribute("y", y + 5);
    tekst.setAttribute("text-anchor", "middle");
    tekst.textContent = i === 0 ? 12 : i;
    wijzerplaat.appendChild(tekst);
  }
})();

function zetWijzers(uur, minuut) {
  const minuutHoek = (minuut / 60) * 360;
  const uurHoek = ((uur % 12) + minuut / 60) * 30;
  zetHand(minutenHand, minuutHoek);
  zetHand(urenHand, uurHoek);
}

function zetHand(hand, hoek) {
  hand.setAttribute("transform", "rotate(" + hoek + " 100 100)");
}
const dagdeelBadge = document.getElementById("dagdeelBadge");
const antwoordKnoppen = document.getElementById("antwoordKnoppen");
const feedback = document.getElementById("feedback");
const volgendeKnop = document.getElementById("volgendeKnop");
const scoreBord = document.getElementById("scoreBord");

// ---------- Keuzes op startscherm ----------
document.querySelectorAll("[data-klok]").forEach((knop) => {
  knop.addEventListener("click", () => {
    document.querySelectorAll("[data-klok]").forEach((k) => k.classList.remove("geselecteerd"));
    knop.classList.add("geselecteerd");
    gekozenKlok = Number(knop.dataset.klok);
  });
});

document.querySelectorAll("[data-oefening]").forEach((knop) => {
  knop.addEventListener("click", () => {
    document.querySelectorAll("[data-oefening]").forEach((k) => k.classList.remove("geselecteerd"));
    knop.classList.add("geselecteerd");
    gekozenOefening = knop.dataset.oefening;
  });
});

document.getElementById("startKnop").addEventListener("click", () => {
  if (!gekozenKlok || !gekozenOefening) {
    keuzeMelding.textContent = "Kies eerst een klok én een oefening!";
    return;
  }
  startScherm.hidden = true;
  oefenScherm.hidden = false;
  nieuweOefening();
});

document.getElementById("terugKnop").addEventListener("click", () => {
  oefenScherm.hidden = true;
  startScherm.hidden = false;
});

volgendeKnop.addEventListener("click", nieuweOefening);

// ---------- Hulpfuncties ----------
function willekeurig(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function formatTijd(uur, minuut) {
  return (
    String(uur).padStart(2, "0") + ":" + String(minuut).padStart(2, "0")
  );
}

function dagdeelVoor(uur) {
  return dagdelen.find((d) => uur >= d.van && uur < d.tot);
}

// ---------- Oefening ----------
function nieuweOefening() {
  const oefening = oefeningen[gekozenOefening];

  let uur;
  if (gekozenKlok === 12) {
    uur = willekeurig([...Array(12).keys()]); // 0 t/m 11 -> toon 12 uur-stijl
  } else {
    uur = willekeurig([...Array(24).keys()]);
  }

  let minuut;
  if (oefening.minuten) {
    minuut = willekeurig(oefening.minuten);
  } else {
    minuut = willekeurig([...Array(12).keys()]) * 5;
  }

  huidigeTijd = { uur, minuut };

  // Toon de tijd op de analoge klok
  zetWijzers(uur, minuut);

  // Dagdeel alleen bij 24-uursklok
  if (gekozenKlok === 24) {
    const d = dagdeelVoor(uur);
    dagdeelBadge.hidden = false;
    dagdeelBadge.textContent = d.naam;
    dagdeelBadge.style.background = d.kleur;
  } else {
    dagdeelBadge.hidden = true;
  }

  // Antwoorden maken
  const toonUur = gekozenKlok === 12 ? (uur === 0 ? 12 : uur) : uur;
  const juist = formatTijd(toonUur, minuut);
  const opties = new Set([juist]);
  while (opties.size < 4) {
    const afwijkUur = (uur + willekeurig([1, 2, 3, -1, -2]) + 24) % gekozenKlok;
    const afwijkMin = oefening.minuten ? willekeurig(oefening.minuten) : willekeurig([...Array(12).keys()]) * 5;
    let toonAfwijkUur = afwijkUur;
    if (gekozenKlok === 12) toonAfwijkUur = toonAfwijkUur === 0 ? 12 : toonAfwijkUur;
    opties.add(formatTijd(toonAfwijkUur, afwijkMin));
  }

  antwoordKnoppen.innerHTML = "";
  [...opties].sort(() => Math.random() - 0.5).forEach((optie) => {
    const knop = document.createElement("button");
    knop.className = "antwoordKnop";
    knop.textContent = optie;
    knop.addEventListener("click", () => beantwoord(knop, optie, juist));
    antwoordKnoppen.appendChild(knop);
  });

  feedback.textContent = "";
  feedback.className = "feedback";
  volgendeKnop.hidden = true;
}

function beantwoord(knop, antwoord, juist) {
  const alleKnoppen = antwoordKnoppen.querySelectorAll("button");
  alleKnoppen.forEach((k) => (k.disabled = true));

  if (antwoord === juist) {
    knop.classList.add("goed");
    feedback.textContent = "🎉 Goed gedaan!";
    feedback.classList.add("goed");
    goedCount++;
  } else {
    knop.classList.add("fout");
    feedback.textContent = "❌ Helaas! Het was " + juist;
    feedback.classList.add("fout");
    foutCount++;
    alleKnoppen.forEach((k) => {
      if (k.textContent === juist) k.classList.add("goed");
    });
  }

  scoreBord.innerHTML = "✔ " + goedCount + " &nbsp; ✘ " + foutCount;
  volgendeKnop.hidden = false;
  volgendeKnop.focus();
}
