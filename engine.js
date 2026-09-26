/* DeckMath engine - honest deck math. UMD: browser global + Node. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.DeckMath = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var up = function (x) { return Math.ceil(x - 1e-9); };

  // 5.5 in board + 0.25 in gap = 5.75 in of deck per row.
  var ROW_IN = 5.75;

  function rows(widthFt) {
    return up(widthFt * 12 / ROW_IN);
  }

  function deckingLinFt(lengthFt, widthFt) {
    return rows(widthFt) * lengthFt;
  }

  // Decking boards: linear feet plus 10% cut waste, by board length.
  function deckBoards(lengthFt, widthFt, boardLenFt) {
    return up(deckingLinFt(lengthFt, widthFt) * 1.10 / boardLenFt);
  }

  // Joists at 16 in on center, plus the rim - never 24 for 5/4 boards.
  function joistCount(lengthFt) {
    return Math.floor(lengthFt * 12 / 16 + 1e-9) + 1;
  }

  function joistLinFt(lengthFt, widthFt) {
    return joistCount(lengthFt) * widthFt;
  }

  // One beam line carries up to 10 ft of joist span; posts every 6 ft of beam.
  function beamLines(widthFt) {
    return widthFt <= 10 ? 1 : 2;
  }
  function footings(lengthFt, widthFt) {
    return up(lengthFt / 6) * beamLines(widthFt);
  }

  // Two 3-inch screws at every joist crossing; about 75 to the pound.
  function screwLbs(lengthFt, widthFt) {
    return up(rows(widthFt) * joistCount(lengthFt) * 2 / 75);
  }

  function estimate(opts) {
    var L = opts.lengthFt, W = opts.widthFt;
    var boardLen = opts.boardLenFt || 16;
    var composite = !!opts.composite;
    var b = deckBoards(L, W, boardLen);
    var jLf = joistLinFt(L, W);
    var f = footings(L, W);
    var sc = screwLbs(L, W);
    var deckCost = Math.round(deckingLinFt(L, W) * 1.10 * (composite ? 3.5 : 1.5) * 100) / 100;
    var frameCost = Math.round((jLf * 2 + f * 25 + sc * 10) * 100) / 100;
    return {
      area: L * W, rows: rows(W), linFt: deckingLinFt(L, W),
      boards: b, boardLen: boardLen, joists: joistCount(L), joistLinFt: jLf,
      footings: f, screwLbs: sc,
      deckCost: deckCost, frameCost: frameCost,
      total: Math.round((deckCost + frameCost) * 100) / 100, composite: composite
    };
  }

  function advice(est) {
    if (est.composite) {
      return 'Composite costs double up front and gives it back in weekends - no staining, ever. But it still needs the same 16-inch joists and honest footings; the frame outlives two deck surfaces either way.';
    }
    if (est.area > 300) {
      return 'Over 300 sq ft, order one extra board and accept the seam pattern on paper first - the mid-deck seam you improvise is the one your eye finds every morning.';
    }
    if (est.footings >= 6) {
      return 'This many footings means the ledger matters: flashing is where decks fail, not boards. Lag the ledger into rim joist, flash over it, and let the posts carry the outside edge.';
    }
    return 'Pressure-treated means wet: buy early, stack it with spacers, and let it dry a season before stain - staining wet PT peels by the second summer.';
  }

  return {
    ROW_IN: ROW_IN, rows: rows, deckingLinFt: deckingLinFt, deckBoards: deckBoards,
    joistCount: joistCount, joistLinFt: joistLinFt, beamLines: beamLines,
    footings: footings, screwLbs: screwLbs, estimate: estimate, advice: advice
  };
});
