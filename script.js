/* ================= ALOKA MULTY SYSTEM — DARAZ STYLE SHOP ================= */
const WA = "94753534777";

const PRODUCTS = [
  {id:1, name:"Melamine Half Door Cupboard — 4ft Wardrobe Storage", cat:"cupboards", price:19500, old:24500, rating:4.8, sold:124, img:"assets/cupboard-1.jpg", badge:"HOT"},
  {id:2, name:"Melamine 3 Door Wardrobe with Drawers — Lockable", cat:"wardrobes", price:38500, old:45000, rating:4.9, sold:86, img:"assets/cupboard-2.jpg", badge:"-14%"},
  {id:3, name:"2 Door Wardrobe White — 4 Shelves & Drawer (Pre-Assembled)", cat:"wardrobes", price:29900, old:36000, rating:4.7, sold:63, img:"assets/wardrobe-2door.png", badge:"-17%"},
  {id:4, name:"4 Door Family Wardrobe White — Hanging + Drawers", cat:"wardrobes", price:52000, old:60000, rating:4.8, sold:41, img:"assets/wardrobe-4door.png", badge:"-13%"},
  {id:5, name:"Modern 3 Door Wardrobe — White with Oak Handles", cat:"wardrobes", price:41500, old:null, rating:4.6, sold:29, img:"assets/wardrobe-3door-white.png"},
  {id:6, name:"Chest of Drawers 6-Drawer — Wood Top Dresser", cat:"drawers", price:34900, old:39900, rating:4.7, sold:52, img:"assets/drawers-chest.png", badge:"-13%"},
  {id:7, name:"Fluted Wooden Drawer Dresser — 9 Drawer Premium", cat:"drawers", price:48500, old:null, rating:4.9, sold:17, img:"assets/dresser-fluted.png", badge:"NEW"},
  {id:8, name:"Shoe Cabinet Oak 2-Door — 5 Shelf Shoe Storage", cat:"shoe", price:16900, old:21500, rating:4.7, sold:98, img:"assets/shoe-cabinet.png", badge:"-21%"},
  {id:9, name:"Open Shelf Melamine Storage Cupboard — Books & Files", cat:"cupboards", price:22500, old:null, rating:4.5, sold:34, img:"assets/cupboard-open-shelf.png"},
  {id:10, name:"Custom Full-Wall Wardrobe — Made to Measure (Per Project)", cat:"custom", price:95000, old:115000, rating:5.0, sold:12, img:"assets/custom-wall-wardrobe.png", badge:"-17%"},
];

const fmt = n => "Rs. " + n.toLocaleString("en-US");
const $ = s => document.querySelector(s);
let activeCat = "all", query = "", cart = [], liked = new Set();

/* ---------- render ---------- */
function cardHTML(p, small=false){
  const disc = p.old ? Math.round((1 - p.price/p.old)*100) : 0;
  return `
  <article class="p-card" data-id="${p.id}">
    <div class="p-img">
      <span class="badge ${p.badge==='HOT'||p.badge==='NEW' ? 'hot':''}">${p.badge || (disc ? '-'+disc+'%' : '')}</span>
      <button class="heart ${liked.has(p.id)?'liked':''}" data-like="${p.id}">❤</button>
      <img src="${p.img}" alt="${p.name}" loading="lazy">
    </div>
    <div class="p-body">
      <div class="p-title">${p.name}</div>
      <div><span class="p-price">${fmt(p.price)}</span>${p.old?`<span class="p-old">${fmt(p.old)}</span>`:''}</div>
      <div class="p-rating"><span class="stars">★★★★★</span> ${p.rating} | ${p.sold} Sold</div>
      <div class="p-loc">📍 Meegoda <span class="free">• 🚚 Free Delivery</span></div>
      <div class="p-actions">
        <button class="buy-btn" data-buy="${p.id}">Buy Now</button>
        <button class="cart-add" data-cart="${p.id}" title="Add to cart">🛒</button>
      </div>
    </div>
  </article>`;
}

function render(){
  const grid = $("#productGrid");
  const list = PRODUCTS.filter(p =>
    (activeCat==="all" || p.cat===activeCat) &&
    p.name.toLowerCase().includes(query)
  );
  grid.innerHTML = list.map(p => cardHTML(p)).join("");
  $("#noResults").hidden = list.length > 0;
  $("#resultCount").textContent = list.length + " products";

  const deals = PRODUCTS.filter(p => p.old);
  $("#flashGrid").innerHTML = deals.map(p => cardHTML(p, true)).join("");
}

/* ---------- events ---------- */
document.addEventListener("click", e => {
  const likeBtn = e.target.closest("[data-like]");
  const cartBtn = e.target.closest("[data-cart]");
  const buyBtn  = e.target.closest("[data-buy]");
  const card    = e.target.closest(".p-card");

  if (likeBtn){
    const id = +likeBtn.dataset.like;
    liked.has(id) ? liked.delete(id) : liked.add(id);
    likeBtn.classList.toggle("liked");
    toast(liked.has(id) ? "❤ Added to wishlist" : "Removed from wishlist");
  }
  if (cartBtn){ addToCart(+cartBtn.dataset.cart); }
  if (buyBtn){
    const p = PRODUCTS.find(x => x.id === +buyBtn.dataset.buy);
    window.open(`https://wa.me/${WA}?text=${encodeURIComponent("Hello Aloka Multy System, I want to buy:\n\n• " + p.name + "\nPrice: " + fmt(p.price) + "\n\nPlease confirm availability. Thank you!")}`, "_blank");
  }
  if (card && !likeBtn && !cartBtn && !buyBtn){
    const p = PRODUCTS.find(x => x.id === +card.dataset.id);
    showZoom(p.img, p.name);
  }
});

/* category pills */
$("#catPills").addEventListener("click", e => {
  const btn = e.target.closest(".pill"); if(!btn) return;
  document.querySelectorAll(".pill").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
  activeCat = btn.dataset.cat;
  render();
});

/* search */
const doSearch = () => { query = $("#searchInput").value.trim().toLowerCase(); render(); };
$("#searchBtn").addEventListener("click", doSearch);
$("#searchInput").addEventListener("input", doSearch);

/* ---------- cart ---------- */
function addToCart(id){
  const item = cart.find(i => i.id === id);
  item ? item.qty++ : cart.push({id, qty:1});
  updateCart();
  toast("🛒 Added to cart");
}
function changeQty(id, d){
  const item = cart.find(i => i.id === id); if(!item) return;
  item.qty += d;
  if (item.qty <= 0) cart = cart.filter(i => i.id !== id);
  updateCart();
}
function updateCart(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  $("#cartCount").textContent = count;
  $("#cartItems").textContent = count;
  const body = $("#cartBody");
  if (!cart.length){
    body.innerHTML = `<div class="cart-empty">🛒<br>Your cart is empty.<br>Shop flash deals above!</div>`;
    $("#cartTotal").textContent = "Rs. 0";
    return;
  }
  let total = 0;
  body.innerHTML = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id); total += p.price * i.qty;
    return `<div class="cart-item">
      <img src="${p.img}" alt="${p.name}">
      <div class="cart-item-info">
        <h4>${p.name}</h4>
        <span class="p-price">${fmt(p.price)}</span>
        <div class="qty">
          <button data-dec="${p.id}">−</button><span>${i.qty}</span><button data-inc="${p.id}">+</button>
          <button class="remove" data-del="${p.id}" title="Remove">🗑</button>
        </div>
      </div>
    </div>`;
  }).join("");
  $("#cartTotal").textContent = fmt(total);
}
$("#cartBody").addEventListener("click", e => {
  const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]"), del = e.target.closest("[data-del]");
  if (inc) changeQty(+inc.dataset.inc, 1);
  if (dec) changeQty(+dec.dataset.dec, -1);
  if (del){ cart = cart.filter(i => i.id !== +del.dataset.del); updateCart(); }
});

const openCart  = () => { $("#cartDrawer").classList.add("open"); $("#overlay").classList.add("show"); };
const closeCart = () => { $("#cartDrawer").classList.remove("open"); $("#overlay").classList.remove("show"); };
$("#cartOpen").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

$("#checkoutBtn").addEventListener("click", () => {
  if (!cart.length){ toast("Cart is empty!"); return; }
  let total = 0;
  const lines = cart.map(i => {
    const p = PRODUCTS.find(x => x.id === i.id); total += p.price * i.qty;
    return `• ${p.name} x${i.qty} — ${fmt(p.price*i.qty)}`;
  });
  const msg = "Hello Aloka Multy System, I want to order:\n\n" + lines.join("\n") + "\n\nSubtotal: " + fmt(total) + "\n\nPlease confirm my order. Thank you!";
  window.open(`https://wa.me/${WA}?text=${encodeURIComponent(msg)}`, "_blank");
});

/* ---------- countdown to midnight ---------- */
function tick(){
  const now = new Date(), end = new Date(); end.setHours(23,59,59,999);
  let s = Math.max(0, Math.floor((end - now)/1000));
  const h = String(Math.floor(s/3600)).padStart(2,"0"),
        m = String(Math.floor(s%3600/60)).padStart(2,"0"),
        sec = String(s%60).padStart(2,"0");
  $("#cdH").textContent = h; $("#cdM").textContent = m; $("#cdS").textContent = sec;
}
setInterval(tick, 1000); tick();

/* ---------- zoom ---------- */
function showZoom(src, alt){
  const ov = document.createElement("div");
  ov.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:200;display:grid;place-items:center;padding:24px;cursor:zoom-out";
  const big = document.createElement("img");
  big.src = src; big.alt = alt;
  big.style.cssText = "max-width:94vw;max-height:90vh;border-radius:12px;object-fit:contain;background:#fff";
  ov.appendChild(big); document.body.appendChild(ov);
  ov.addEventListener("click", () => ov.remove());
}

/* ---------- misc ---------- */
let toastT;
function toast(msg){
  const t = $("#toast"); t.textContent = msg; t.classList.add("show");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("show"), 1800);
}
$("#year").textContent = new Date().getFullYear();
render(); updateCart();
