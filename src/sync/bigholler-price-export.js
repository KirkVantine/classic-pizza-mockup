/*
  Big Holler price export for Classic Pizza.

  Big Holler blocks automated (non-browser) requests, so prices are pulled
  from a normal browser session instead:

    1. Open https://ordering.bigholler.com/ClassicPizza/
    2. Click "Order as Guest", choose Pick-up and any date, then "Jump Right To Menu".
    3. Open the browser console (F12 > Console), paste this whole file, press Enter.
    4. A file named menu-prices.json downloads. Drop it into the site's /data folder.

  Nothing is added to a cart or ordered; the script only reads the menu pages.
*/
(async () => {
  const menuDoc = [document, ...[...document.querySelectorAll('frame,iframe')]
    .map(f => { try { return f.contentDocument; } catch { return null; } })]
    .find(d => d && d.querySelector('a[href^="javascript:handleMenuChange"]'));
  if (!menuDoc) { alert('Open the Big Holler menu first (step 2), then run this again.'); return; }

  const menus = [...menuDoc.querySelectorAll('a[href^="javascript:handleMenuChange"]')]
    .map(a => ({ name: a.textContent.trim(), id: a.getAttribute('href').match(/\d+/)[0] }));

  const out = { source: 'https://ordering.bigholler.com/ClassicPizza/', syncedAt: new Date().toISOString(), categories: {} };
  const clean = s => s.replace(/\s+/g, ' ').trim();

  for (const m of menus) {
    const html = await (await fetch(`/Menu/MenuList.asp?MNU=${m.id}&VMO=`, { credentials: 'include' })).text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const headings = {};
    doc.querySelectorAll('td.hdg[id^="td_hdg_"]').forEach(td => {
      const [, grp, idx] = td.id.match(/td_hdg_(\d+)_(\d+)/);
      (headings[grp] ||= [])[+idx] = clean(td.textContent);
    });
    const items = [];
    doc.querySelectorAll('td.item[id^="td_item_"]').forEach(td => {
      const desc = td.querySelector('.itemdesc');
      const name = clean([...td.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent).join(' '));
      const prices = {};
      td.parentElement.querySelectorAll('td.itemprc[id^="td_prc_"]').forEach(p => {
        const [, grp, , ord] = p.id.match(/td_prc_(\d+)_(\d+)_(\d+)/);
        const label = headings[grp]?.[+ord - 1] || 'Price';
        const value = parseFloat(p.textContent);
        if (!isNaN(value)) prices[label] = value;
      });
      if (name && Object.keys(prices).length) items.push({ name, description: desc ? clean(desc.textContent) : '', prices });
    });
    out.categories[m.name] = items;
  }

  const blob = new Blob([JSON.stringify(out, null, 2)], { type: 'application/json' });
  const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'menu-prices.json' });
  document.body.appendChild(a); a.click(); a.remove();
  window.__classicPrices = out;
  console.log(`Exported ${Object.values(out.categories).flat().length} items from ${menus.length} categories.`);
})();
