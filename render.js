const content = window.siteContent;

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element) element.textContent = text;
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text) element.textContent = text;
  return element;
}

function addExternalBehavior(link) {
  if (!link.href.startsWith("http")) return;
  link.target = "_blank";
  link.rel = "noopener";
}

function renderEntryLink(entryData) {
  if (entryData.url) {
    const link = createElement("a", null, entryData.name);
    link.href = entryData.url;
    addExternalBehavior(link);
    return link;
  }

  return createElement("span", null, entryData.name);
}

document.title = content.pageTitle;
document.getElementById("year").textContent = new Date().getFullYear();

document.querySelectorAll('[data-content="name"]').forEach((element) => {
  element.textContent = content.name;
});

const header = document.querySelector(".site-header");
const buildingSection = document.getElementById("building");
function updateHeaderState() {
  if (!header || !buildingSection) return;
  const headerHeight = header.getBoundingClientRect().height;
  const showLogo = buildingSection.getBoundingClientRect().top <= headerHeight;
  header.classList.toggle("show-logo", showLogo);
}
updateHeaderState();
window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", updateHeaderState);

document.querySelectorAll('[data-content="initials"]').forEach((element) => {
  element.textContent = content.initials;
});

setText("#intro-title", content.introHeading);
const introText = document.getElementById("intro-text");
if (Array.isArray(content.introText)) {
  introText.replaceWith(
    ...content.introText.map((paragraph) => createElement("p", "intro", paragraph)),
  );
} else {
  setText("#intro-text", content.introText);
}

const portrait = document.querySelector(".portrait-art");
if (portrait && content.portraitImage) {
  portrait.innerHTML = "";
  const image = createElement("img");
  image.src = content.portraitImage;
  image.alt = `${content.name} portrait`;
  portrait.append(image);
}

const buildingCards = document.getElementById("building-cards");
content.building.cards
  .filter((card) => !card.hidden)
  .forEach((card) => {
  const article = createElement("article", "case-card");
  article.append(createElement("p", "card-kicker", card.label));

  if (card.image) {
    article.classList.add("has-image");
    const imageWrap = createElement("div", "case-image");
    const image = createElement("img");
    image.src = card.image;
    image.alt = card.imageAlt || `${card.title} image`;
    imageWrap.append(image);
    article.append(imageWrap);
  }

  article.append(createElement("h3", null, card.title));
  if (card.meta) article.append(createElement("p", "card-meta", card.meta));
  article.append(createElement("p", null, card.description));

  const list = createElement("ul");
  card.details.forEach((detail) => list.append(createElement("li", null, detail)));
  article.append(list);

  const linkText = card.linkText.includes("→") ? card.linkText : `${card.linkText} →`;
  const link = createElement("a", null, linkText);
  link.className = "case-link";
  link.href = card.linkUrl;
  addExternalBehavior(link);
  article.append(link);

  buildingCards.append(article);
});

const speakingList = document.getElementById("speaking-list");
content.speaking.items.forEach((item) => {
  const article = createElement("article");
  article.append(createElement("span", null, `${item.event} · ${item.date}`));
  const heading = createElement("h3");
  if (item.url) {
    const link = createElement("a", null, item.title);
    link.href = item.url;
    addExternalBehavior(link);
    heading.append(link);
  } else {
    heading.textContent = item.title;
  }
  article.append(heading);
  if (item.description) article.append(createElement("p", null, item.description));
  speakingList.append(article);
});

const writingList = document.getElementById("writing-list");
if (writingList) {
  content.writing.items.forEach((item) => {
    const link = createElement("a");
    link.href = item.url;
    addExternalBehavior(link);
    link.append(createElement("span", null, item.label));
    link.append(createElement("strong", null, item.title));
    writingList.append(link);
  });
}

const favoritesList = document.getElementById("favorites-list");
if (content.favoriting.intro) {
  const intro = createElement("p", "section-note", content.favoriting.intro);
  favoritesList.before(intro);
}

content.favoriting.items.forEach((item) => {
  const article = createElement("article");
  article.append(createElement("h3", null, item.title));

  if (item.description) {
    article.append(createElement("p", null, item.description));
  }

  if (item.intro) {
    article.append(createElement("p", "section-note", item.intro));
  }

  if (item.entries) {
    const list = createElement("ul", "favorite-items");
    item.entries.forEach((entry) => {
      const listItem = createElement("li");
      const entryData = typeof entry === "string" ? { name: entry } : entry;

      if (item.title === "Books" && entryData.note) {
        listItem.append(createElement("span", null, `${entryData.name} by ${entryData.note}`));
      } else {
        listItem.append(renderEntryLink(entryData));
      }

      if (entryData.note && item.title !== "Books") {
        listItem.append(createElement("small", null, entryData.note));
      }

      list.append(listItem);
    });
    article.append(list);
  }

  if (item.map && item.places) {
    article.classList.add("places-card");
    const map = createElement("div", "places-map");
    const panel = createElement("div", "place-panel");

    function showPlace(place, activeMarker) {
      panel.innerHTML = "";
      panel.append(createElement("h4", null, place.name));
      if (place.note) panel.append(createElement("p", null, place.note));

      if (place.links) {
        const list = createElement("ul", "favorite-items");
        place.links.forEach((entry) => {
          const listItem = createElement("li");
          listItem.append(renderEntryLink(entry));
          if (entry.note) listItem.append(createElement("small", null, entry.note));
          list.append(listItem);
        });
        panel.append(list);
      }

      map.querySelectorAll(".place-marker, .leaflet-marker-icon").forEach((marker) => {
        marker.classList.remove("is-active");
      });
      if (activeMarker) activeMarker.classList.add("is-active");
    }

    const mapWrap = createElement("div", "places-layout");
    mapWrap.append(map, panel);
    article.append(mapWrap);

    if (window.L) {
      const leafletMap = L.map(map, {
        scrollWheelZoom: false,
        zoomControl: false,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(leafletMap);

      const markerIcon = L.divIcon({
        className: "leaflet-place-pin",
        html:
          '<svg viewBox="0 0 64 88" aria-hidden="true"><path fill="currentColor" d="M32 0C14.4 0 0 14.4 0 32c0 22.8 32 56 32 56s32-33.2 32-56C64 14.4 49.6 0 32 0Zm0 45a13 13 0 1 1 0-26 13 13 0 0 1 0 26Z"/></svg>',
        iconSize: [16, 22],
        iconAnchor: [8, 22],
      });

      const bounds = [];
      item.places.forEach((place) => {
        const marker = L.marker([place.lat, place.lng], { icon: markerIcon }).addTo(leafletMap);
        marker.on("click", () => showPlace(place, marker.getElement()));
        bounds.push([place.lat, place.lng]);
      });

      leafletMap.fitBounds(bounds, { padding: [26, 26] });
      window.setTimeout(() => {
        leafletMap.invalidateSize();
        leafletMap.fitBounds(bounds, { padding: [26, 26] });
      }, 0);
    } else {
      map.append(createElement("p", "map-fallback", "Map unavailable. Places are listed here."));
      item.places.forEach((place) => {
        const button = createElement("button", "place-marker", place.name);
        button.type = "button";
        button.addEventListener("click", () => showPlace(place, button));
        map.append(button);
      });
    }
  }

  favoritesList.append(article);
});

const footerLinks = document.getElementById("footer-links");
/*
content.links.forEach((item) => {
  const link = createElement("a", null, item.label);
  link.href = item.url;
  addExternalBehavior(link);
  footerLinks.append(link);
});
*/
