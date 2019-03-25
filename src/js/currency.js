/* @author Ulrik Moe, Christian Blach, Joakim Sindholt */
/* global $currency */

const currency_map = {
    DKK: { cur: '% kr', t: '.', d: ',' },
    SEK: { cur: '% kr', t: '.', d: ',' },
    NOK: { cur: '% kr', t: '.', d: ',' },
    EUR: { cur: '€%', t: '.', d: ',' },
    USD: { cur: '$%', t: ',', d: '.' },
    GBP: { cur: '£%', t: '.', d: ',' }
};
const currency_value = {};

function updateCurrency() {

    return fetch('https://kortgebyr.dk/_currency/latest?from=' + $currency)
        .then(res => res.json())
        .then((j) => {
            j.rates[$currency] = 1;

            // Init currency_value
            for (const cur in currency_map) {
                currency_value[cur] = {};
                for (const o in currency_map) {
                    currency_value[cur][o] = j.rates[o] / j.rates[cur];
                }
            }
        }).catch(() => {
            alert('Noget gik galt. Prøv igen eller kontakt ulrik.moe@gmail.com');
        });
}

function Currency(value, code) {
    this.amounts = {};
    if (code) { this.amounts[code] = value; }
}

Currency.prototype.print = function (cur) {
    const n = this.order(cur).toFixed(2).split('.');
    const ints = [];
    const frac = (parseInt(n[1], 10) === 0) ? '' : currency_map[cur].d + n[1];

    for (let i = n[0].length; i > 0; i -= 3) {
        ints.unshift(n[0].substring(i - 3, i));
    }
    return currency_map[cur].cur.replace('%', ints.join(currency_map[cur].t) + frac);
};

Currency.prototype.order = function (cur) {
    let sum = 0;
    for (const code in this.amounts) {
        sum += this.amounts[code] / currency_value[cur][code];
    }
    return sum;
};

Currency.prototype.add = function (rhs) {
    const n = new Currency();
    for (const code in this.amounts) {
        n.amounts[code] = this.amounts[code];
    }
    for (const code in rhs.amounts) {
        const c = n.amounts[code] ? n.amounts[code] : 0;
        n.amounts[code] = c + rhs.amounts[code];
    }
    return n;
};

Currency.prototype.scale = function (rhs) {
    const n = new Currency();
    for (const code in this.amounts) {
        n.amounts[code] = this.amounts[code] * rhs;
    }
    return n;
};
