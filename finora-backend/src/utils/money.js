/** Rupees (may be fractional) -> integer paise */
function toPaise(rupees) {
  return Math.round(Number(rupees) * 100);
}

/** Integer paise -> rupees (number) */
function toRupees(paise) {
  return paise / 100;
}

module.exports = { toPaise, toRupees };
