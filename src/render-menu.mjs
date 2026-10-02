// Renders the menu to static HTML at build time: our names and order, Big Holler's prices.
// Usage: node render-menu.mjs > fragments.json   (build.ps1 runs this and fills the page placeholders)
import { readFileSync } from 'node:fs';

const PRICE_DATA = JSON.parse(readFileSync(new URL('./data/menu-prices.json', import.meta.url), 'utf8'));
const PRICES = {};
for (const [cat, items] of Object.entries(PRICE_DATA.categories))
  for (const it of items) PRICES[`${cat}/${it.name}`] = it;

const money = n => '$' + n.toFixed(2);
const PHONE = '<a href="tel:+17344261900">(734) 426-1900</a>';
const LABELS = {"12'": '12"', '5': '5 sticks', '10': '10 sticks'};
const tidy = s => (s || '').replace(/\.?\s*No Sauce$/i, '. No sauce.').replace(/([^.])$/, '$1.');
const missing = [];
function lookup(key) {
  const hit = PRICES[key];
  if (!hit) missing.push(key);
  return hit;
}
function priceCells(prices) {
  const entries = Object.entries(prices);
  if (entries.length === 1 && entries[0][0] === 'Price') return `<span class="pc solo"><b>${money(entries[0][1])}</b></span>`;
  return entries.map(([k, v]) => `<span class="pc"><small>${LABELS[k] || k}</small><b>${money(v)}</b></span>`).join('');
}

/* ---------- Build your own ---------- */
const TOPPINGS = ['Pepperoni','Ham','Bacon','Beef','Italian sausage','Chicken','Crab','Shrimp','Anchovies','Onions','Green peppers','Mild peppers','Jalapeños','Fresh mushrooms','Canned mushrooms','Green olives','Ripe olives','Tomatoes','Spinach','Broccoli','Pineapple','Artichokes','Feta cheese','Cheddar cheese','Double cheese'];
const CRUSTS = ['The Works','Butter','Garlic butter','Cajun','Parmesan','Sesame seed'];

function renderSizes() {
  const cheese = lookup('Pizza/Cheese Pizza'), ny = lookup('Pizza/NY Style Cheese Pizza'), gf = lookup('Pizza/Gluten Free Pizza');
  let html = '';
  if (cheese) html += Object.entries(cheese.prices).map(([k, v]) => `<div class="size"><span class="sz">${LABELS[k] || k}</span><span class="kind">Classic round, hand-tossed, pan, or thin</span><b>${money(v)}</b></div>`).join('');
  if (ny) html += `<div class="size"><span class="sz">18"</span><span class="kind">New York style, 6 big slices</span><b>${money(ny.prices.Price)}</b></div>`;
  if (gf) html += `<div class="size"><span class="sz">10"</span><span class="kind">Gluten-free cauliflower crust (contains egg)</span><b>${money(gf.prices.Price)}</b></div>`;
  html += `<div class="size phone"><span class="sz">Chicago</span><span class="kind">Deep dish in 10", 12", or 14"</span><a href="tel:+17344261900">Call to order</a></div>`;
  return html;
}

/* ---------- Menu ---------- */
const CP = 'Classic Pizzas/';
const MENU = [
  {id:'specialty', title:'Classic pizzas', note:'House favorites in five sizes', items:[
    ['Classic Deluxe', CP+'Classic Deluxe'], ['Deluxe', CP+'Deluxe'], ['All Meat', CP+'All Meat Pizza'],
    ['BLT', CP+'BLT'], ['Ham Melt', CP+'Ham Melt'], ['BBQ Chicken', CP+'BBQ Chicken Pizza'], ['BBQ Chicken Deluxe', CP+'BBQ Chicken Deluxe'],
    ['Bacon Double Cheeseburger', CP+'Bacon Dbl Cheeseburger'], ['Hawaiian', CP+'Hawaiian'], ['Hot Hawaiian', CP+'Hot Hawaiian'],
    ['Western', CP+'Western'], ['Sriracha Western', CP+'Sriracha Western'], ['Mexican', CP+'Mexican'], ['Chicken Fajita', CP+'Chicken Fajita'],
    ['Chicken Broccoli', CP+'Chicken Broccoli'], ['Buffalo Chicken', CP+'Buffalo Chicken Pizza'], ['Seafood', CP+'Seafood Pizza'],
    ['Veggie', CP+'Veggie'], ['Zesty Veggie', CP+'Zesty Veggie'], ['Spinach Deluxe', CP+'Spinach Deluxe'], ['Club', CP+'Club Pizza'],
    ['Steak', CP+'Steak Pizza'], ['Dill Pickle', CP+'Dill Pickle Pizza', true], ['Dill Pickle Deluxe', CP+'Dill Pickle Pizza Deluxe', true]
  ], byPhone:'Coney Dog pizza'},
  {id:'subs', title:'Oven-fresh subs', note:'All subs are 10" and served hot. A subzone is any sub baked calzone style.',
    items:['Classic Deluxe','Italian','Steak','Hero','Chicken','Pizza','Roast Beef','Turkey','Ham','Veggie','Meatball','BBQ','BLT','Club'].map(n => [n, 'Oven Subs & Subzones/'+n])},
  {id:'calzones', title:'Calzones & wraps', items:[
    ['Calzone','Calzones/Calzone'], ['Ham & Turkey wrap','Wraps/Ham & Turkey Wrap'], ['Chicken wrap','Wraps/Chicken Wrap'],
    ['Italian Chicken wrap','Wraps/Italian Chicken Wrap'], ['BLT wrap','Wraps/BLT Wrap'], ['Veggie wrap','Wraps/Veggie Wrap']
  ]},
  {id:'wings', title:'Wings', note:'Sauces: BBQ, ranch, blue cheese, sriracha bourbon, hot sauce, tropical habanero. Extra sauce $1.00',
    items:[['Boneless breaded wings','Chicken/Boneless Breaded Wings','','Half pound']], byPhone:'1 lb bone-in wings, BBQ or hot & spicy'},
  {id:'breadsticks', title:'Breadsticks & cheesebread', items:[
    ['Garlic breadsticks','Breadsticks/Garlic Breadsticks'], ['Stuffed cheesebread','Breadsticks/Stuffed Cheesebread']
  ], byPhone:'Cajun and cinnamon breadsticks, plus classic, bacon ranch, stuffed pepperoni, spinach & feta, and jalapeño bacon cheddar cheesebreads'},
  {id:'salads', title:'Salads', note:'Dressings: ranch, Greek, blue cheese, lite Italian',
    items:[['Garden','Salads/Garden Salad'], ['Chicken','Salads/Chicken Salad'], ['Chef','Salads/Chef Salad'], ['Greek','Salads/Greek Salad'], ['Antipasto','Salads/Antipasto']],
    byPhone:'Half and full party salads with 24 hours notice'},
  {id:'kids', title:'Kids & desserts', items:[
    ['Kids meal',"Kid's Menu/Kid's 1 top Mini Pizza",'','Mini pizza with 1 topping, a cookie, and a juice box'],
    ['Apple or cherry calzone','Drinks & Desserts/Apple Calzone'],
    ['Pizza brownie','Drinks & Desserts/Pizza Brownie'],
    ['Cookies','Drinks & Desserts/Chocolate Chunk Cookie','','Chocolate chunk, sugar, white chocolate macadamia nut, peanut butter, oatmeal raisin']
  ], byPhone:'Chocolate chunk pizza cookie'},
  {id:'drinks', title:'Drinks', items:[
    ['20 oz soda','Drinks & Desserts/20 oz. Soda'], ['2 liter soda','Drinks & Desserts/2 Liter','','Plus deposit'], ['Bottled water','Drinks & Desserts/Bottle Water']
  ]}
];

function renderMenu() {
  let html = '';
  MENU.forEach((c, ci) => {
    html += `<section class="cat" id="${c.id}" aria-labelledby="h-${c.id}"><div class="cat-head"><h3 id="h-${c.id}">${c.title}</h3>${c.note ? `<p>${c.note}</p>` : ''}</div>\n`;
    c.items.forEach(([name, key, isNew, desc]) => {
      const hit = lookup(key);
      const d = desc || (hit && hit.description ? tidy(hit.description) : '');
      const price = hit ? `<div class="prices">${priceCells(hit.prices)}</div>` : `<a class="call" href="tel:+17344261900">Call to order</a>`;
      html += `<div class="item"><div><h4>${name}${isNew ? '<span class="new">New</span>' : ''}</h4>${d ? `<p>${d}</p>` : ''}</div>${price}</div>\n`;
    });
    if (c.byPhone) html += `<p class="byphone">Also available by phone: ${c.byPhone}. Call ${PHONE}.</p>\n`;
    html += `</section>\n`;
    if (ci === 0) {
      html += `<div class="party" id="party"><div class="feet">6<small>feet of sub</small></div><div>
        <h3>Party subs for the whole crew</h3>
        <p>2, 4, or 6 feet. Every 2 feet feeds about 8 people. Order by phone at least 24 hours ahead.</p>
        <a class="btn btn-yellow" href="tel:+17344261900">Call (734) 426-1900</a></div></div>
        <figure class="photo"><img src="{{PHOTO}}" alt="A slice of cheese pizza being lifted from the pie" loading="lazy" width="1200" height="480" onerror="this.closest('figure').hidden=true"><figcaption>Fresh from the oven on Huron Street</figcaption></figure>\n`;
    }
  });
  return html;
}

const tabs = [['cheese','Build your own'], ['specialty','Classic pizzas'], ...MENU.slice(1).map(c => [c.id, c.title])];
const synced = new Date(PRICE_DATA.syncedAt).toLocaleDateString('en-US', {month:'long', day:'numeric', year:'numeric', timeZone:'America/Detroit'});

const out = {
  TABS: tabs.map(([id, t]) => `<a href="#${id}" data-t="${id}">${t}</a>`).join(''),
  SIZES: renderSizes(),
  TOPPINGS: TOPPINGS.map(t => `<li>${t}</li>`).join(''),
  CRUSTS: CRUSTS.map(t => `<li>${t}</li>`).join(''),
  MENU_LISTS: renderMenu(),
  SYNC_NOTE: `Prices match our online ordering, updated ${synced}.`
};
if (missing.length) console.error('Not on Big Holler, shown as "Call to order":\n  ' + missing.join('\n  '));
process.stdout.write(JSON.stringify(out));
