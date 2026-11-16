'use strict';
/* =========================================================
 * CONTATTI DEL SITO: cambiate solo queste righe.
 * whatsapp e telefono: con il prefisso, senza spazi né "+" (es. 393331234567)
 * ========================================================= */
const CONTATTI = {
  whatsapp: '',                 // es. '393331234567'
  telefono: '',                 // es. '393331234567'
  email: 'info@ne-da.it',
  titolare: '',                 // es. 'Eusebiu Nechita' o la ragione sociale
  piva: '',                     // es. '01234567890'
  sede: '',                     // es. 'Via Roma 1, 23900 Lecco (LC)'
  demo: 'https://gestione-palestra-demo.onrender.com/gestionale/',
  accedi: 'https://gestione-palestra-demo.onrender.com/gestionale/',
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const telLeggibile = n => n.startsWith('39') ? '+39 ' + n.slice(2).replace(/(\d{3})(\d{3})(\d+)/, '$1 $2 $3') : '+' + n;

// Contatti, collegamenti e anno
$$('[data-link]').forEach(a => { const u = CONTATTI[a.dataset.link]; if (u) a.href = u; });
$$('[data-c]').forEach(el => {
  const k = el.dataset.c, v = CONTATTI[k];
  if (!v) {
    // Dato non ancora inserito: nascondo la riga intera invece di mostrare il segnaposto
    const riga = el.closest('li, .riga');
    if (riga) riga.remove(); else el.remove();
    return;
  }
  if (k === 'whatsapp') { el.textContent = telLeggibile(v); el.href = 'https://wa.me/' + v; el.target = '_blank'; el.rel = 'noopener'; }
  else if (k === 'telefono') { el.textContent = telLeggibile(v); el.href = 'tel:+' + v; }
  else if (k === 'email') { el.textContent = v; el.href = 'mailto:' + v; }
  else el.textContent = v;
});
const anno = $('#anno'); if (anno) anno.textContent = new Date().getFullYear();

// Carnet: ogni clic su "Fai il check-in" timbra la lezione successiva
const punch = $('#punch');
if (punch) {
  const btn = $('#punch-btn'), txt = $('#punch-txt'), caselle = $$('li', punch);
  const scrivi = () => {
    const fatte = caselle.filter(li => li.classList.contains('on')).length, rimaste = caselle.length - fatte;
    txt.textContent = rimaste
      ? `${fatte} ${fatte === 1 ? 'lezione fatta' : 'lezioni fatte'}, ${rimaste} ${rimaste === 1 ? 'rimasta' : 'rimaste'}.`
      : 'Carnet finito: a Giulia arriva il promemoria per rinnovarlo.';
    btn.textContent = rimaste ? 'Fai il check-in' : 'Rinnova il carnet';
  };
  btn.addEventListener('click', () => {
    const libera = caselle.find(li => !li.classList.contains('on'));
    if (!libera) {
      caselle.forEach(li => { li.className = ''; li.innerHTML = ''; });
    } else {
      libera.className = 'on new';
      libera.innerHTML = '<i></i>';
    }
    scrivi();
  });
}

// Pulsanti dei piani: preselezionano il piano nel modulo
$$('[data-piano]').forEach(a => a.addEventListener('click', () => {
  const sel = $('#ask select[name="piano"]'); if (sel) sel.value = a.dataset.piano;
  aggiorna();
}));

// Modulo: compone il messaggio per WhatsApp o per email (il sito non salva niente)
const form = $('#ask');
function testo() {
  const d = Object.fromEntries(new FormData(form));
  const righe = [
    `Ciao, sono ${d.nome.trim()} di ${d.palestra.trim()}${d.citta.trim() ? ' (' + d.citta.trim() + ')' : ''}.`,
    'Vorrei vedere NeDa con la mia palestra.',
  ];
  if (d.soci.trim()) righe.push(`Abbiamo circa ${d.soci.trim()} soci.`);
  if (d.piano) righe.push(`Mi interessa il piano ${d.piano}.`);
  if (d.nota.trim()) righe.push('', d.nota.trim());
  return righe.join('\n');
}
function valido() {
  let ok = true;
  ['nome', 'palestra'].forEach(n => {
    const el = form.elements[n], vuoto = !el.value.trim();
    el.setAttribute('aria-invalid', vuoto ? 'true' : 'false');
    if (vuoto) ok = false;
  });
  $('#ask-err').textContent = ok ? '' : 'Scrivi il tuo nome e il nome della palestra.';
  return ok;
}
function aggiorna() {
  if (!form) return;
  const t = encodeURIComponent(testo());
  if ($('#ask-wa')) $('#ask-wa').href = CONTATTI.whatsapp ? `https://wa.me/${CONTATTI.whatsapp}?text=${t}` : `https://wa.me/?text=${t}`;
  $('#ask-mail').href = `mailto:${CONTATTI.email}?subject=${encodeURIComponent('Richiesta informazioni NeDa')}&body=${t}`;
}
if (form && !CONTATTI.whatsapp) {
  // Senza numero WhatsApp resta solo l'invio per email
  $('#ask-wa').remove();
  $('#ask-mail').className = 'btn blue';
  $('#ask-note').firstChild.textContent = 'Il messaggio si apre già scritto nella tua app di posta: lo invii tu. Questo sito non salva i dati che inserisci.';
}
if (form) {
  form.addEventListener('input', () => { aggiorna(); if ($('#ask-err').textContent) valido(); });
  form.addEventListener('submit', e => e.preventDefault());
  ['#ask-wa', '#ask-mail'].filter(s => $(s)).forEach(s => $(s).addEventListener('click', e => { if (!valido()) { e.preventDefault(); form.querySelector('[aria-invalid="true"]').focus(); } }));
  aggiorna();
}
