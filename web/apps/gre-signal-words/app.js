/* Signal Word Trainer: spot contrast, continuation, cause and emphasis signals, then predict the blank. */
(function () {
  'use strict';
  const KINDS = { contrast: 'Contrast: the blank goes the opposite way', continuation: 'Continuation: the blank keeps the same direction', cause: 'Cause and effect: the blank follows from a reason', emphasis: 'Emphasis: the blank is a stronger version' };
  const LIST = [
    ['Contrast', 'although, though, but, yet, however, despite, while, whereas, far from, rather than, once ... now, unlike, usually ... but'],
    ['Continuation', 'and, also, moreover, furthermore, in addition, similarly, likewise, just as, not only ... but also, a colon or semicolon'],
    ['Cause and effect', 'because, since, so, thus, therefore, consequently, hence, as a result, so ... that'],
    ['Emphasis', 'indeed, in fact, not merely ... but, not just ... even, positively'],
  ];
  const predictItems = (bank, n, seed) => SK.sample(SK.rng(seed), bank, n).map((x) => SK.shuffleItem(SK.rng(seed + x.id.length), { id: x.id, type: 'single', topic: KINDS[x.kind].split(':')[0], stem: x.sentence + '\n\nWhich word or phrase best fits the blank?', choices: x.choices, answer: x.answer, explanation: 'Signal: **' + x.signal + '** (' + KINDS[x.kind].toLowerCase() + '). ' + x.explanation }));
  const kindItems = (bank, n, seed) => SK.sample(SK.rng(seed), bank, n).map((x) => ({ id: 'k-' + x.id, type: 'single', topic: 'Signal type', stem: x.sentence.replace(x.signal.split(' ')[0], '[[' + x.signal.split(' ')[0] + ']]') + '\n\nWhat kind of signal is **' + x.signal + '**?', choices: Object.values(KINDS), answer: Object.keys(KINDS).indexOf(x.kind), fixedOrder: true, explanation: KINDS[x.kind] + '. ' + x.explanation }));
  const App = {
    about: 'Text Completion and Sentence Equivalence questions are built around signal words that tell you which way the sentence turns. This app trains two skills: naming the kind of signal, and predicting the missing word before you look at the choices.',
    how: ['Learn the four kinds in **Signal list**.', 'In **Name the signal**, say whether a sentence turns, continues, explains or intensifies.', 'In **Predict**, choose the word that fits, then check the reason.'],
    tabs: [
      { id: 'predict', label: 'Predict', render(el, ctx) { SK.quizStarter(el, { title: 'Predict the blank', sizes: [8, 16, 24], make: (t, n, s) => predictItems(ctx.data.signals, n, s), seconds: (n) => n * 30 }); } },
      { id: 'kind', label: 'Name the signal', render(el, ctx) { SK.quizStarter(el, { title: 'Name the signal', sizes: [8, 16, 24], make: (t, n, s) => kindItems(ctx.data.signals, n, s), seconds: (n) => n * 20 }); } },
      { id: 'list', label: 'Signal list', render(el) { el.appendChild(SK.card('Signal words', SK.table(['Kind', 'Words and phrases'], LIST, false))); } },
    ],
    checks: {
      'every sentence names a known kind of signal and has four options': (data, assert) => {
        for (const x of data.signals) { assert.ok(KINDS[x.kind], x.id); assert.equal(x.choices.length, 4); assert.ok(x.sentence.toLowerCase().includes(x.signal.split(' ')[0].toLowerCase()) || x.signal === 'colon', x.id); }
        for (let s = 1; s < 20; s++) for (const it of predictItems(data.signals, 10, s).concat(kindItems(data.signals, 10, s))) assert.deepEqual(SK.validateItem(it), []);
      },
    },
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = App; else SK.start(App);
})();
