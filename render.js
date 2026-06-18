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

  if (card.image || card.reserveImageSpace) {
    article.classList.add("has-image");
    const imageWrap = createElement("div", "case-image");
    if (card.imageFrame) imageWrap.classList.add(`${card.imageFrame}-frame`);
    if (!card.image) imageWrap.classList.add("empty-image");
    if (card.image) {
      const image = createElement("img");
      image.src = card.image;
      image.alt = card.imageAlt || `${card.title} image`;
      imageWrap.append(image);
    }
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
  if (item.thumbnail && item.url) {
    article.classList.add("has-thumbnail");
    const mediaLink = createElement("a", "talk-thumbnail");
    mediaLink.href = item.url;
    addExternalBehavior(mediaLink);
    mediaLink.setAttribute("aria-label", `Watch ${item.title}`);

    const image = createElement("img");
    image.src = item.thumbnail;
    image.alt = `${item.title} YouTube preview`;
    image.loading = "lazy";
    mediaLink.append(image);
    article.append(mediaLink);
  }

  const copy = createElement("div", "talk-copy");
  copy.append(createElement("span", null, `${item.event} · ${item.date}`));
  const heading = createElement("h3");
  if (item.url) {
    const link = createElement("a", null, item.title);
    link.href = item.url;
    addExternalBehavior(link);
    heading.append(link);
  } else {
    heading.textContent = item.title;
  }
  copy.append(heading);
  if (item.description) copy.append(createElement("p", null, item.description));
  article.append(copy);
  speakingList.append(article);
});

const workWithMeContent = document.getElementById("work-with-me-content");
if (workWithMeContent && content.workWithMe) {
  const article = createElement("article");
  const invitation = createElement("div", "work-invitation");
  const areasPanel = createElement("div", "work-areas");

  invitation.append(createElement("p", "work-lede", content.workWithMe.intro));

  if (content.workWithMe.closing) {
    invitation.append(createElement("p", null, content.workWithMe.closing));
  }

  areasPanel.append(createElement("p", "work-areas-intro", content.workWithMe.areasIntro));
  const areas = createElement("ul");
  content.workWithMe.areas.forEach((area) => areas.append(createElement("li", null, area)));
  areasPanel.append(areas);

  let contact;
  if (content.workWithMe.contactType === "tally") {
    contact = createElement("button", "work-contact", content.workWithMe.contactLabel);
    contact.type = "button";
    if (content.workWithMe.tallyFormId) {
      contact.dataset.tallyOpen = content.workWithMe.tallyFormId;
      contact.dataset.tallyLayout = "modal";
      contact.dataset.tallyWidth = "520";
      contact.dataset.tallyEmojiText = "👋";
      contact.dataset.tallyEmojiAnimation = "wave";
      contact.dataset.tallyAutoClose = "0";
      contact.dataset.tallyFormEventsForwarding = "1";
    } else {
      contact.disabled = true;
      contact.title = "Add a Tally form ID to activate this button.";
    }
  } else if (content.workWithMe.contactUrl) {
    contact = createElement("a", "work-contact", content.workWithMe.contactLabel);
    contact.href = content.workWithMe.contactUrl;
    addExternalBehavior(contact);
  } else {
    contact = createElement("button", "work-contact", content.workWithMe.contactLabel);
    contact.type = "button";
    contact.disabled = true;
  }
  invitation.append(contact);
  article.append(invitation, areasPanel);

  workWithMeContent.append(article);
  if (window.Tally) window.Tally.loadEmbeds();
}

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
        list.classList.add("book-list", "book-carousel");
        if (entryData.cover) {
          const cover = createElement("img");
          cover.src = entryData.cover;
          cover.alt = `${entryData.name} book cover`;
          cover.loading = "lazy";
          const coverFrame = createElement("div", "book-cover");
          coverFrame.append(cover);
          listItem.append(coverFrame);
        }
        const meta = createElement("div", "book-meta");
        meta.append(createElement("span", "book-title", entryData.name));
        meta.append(createElement("span", "book-author", entryData.note));
        listItem.append(meta);
      } else {
        listItem.append(renderEntryLink(entryData));
      }

      if (entryData.note && item.title !== "Books") {
        listItem.append(createElement("small", null, entryData.note));
      }

      list.append(listItem);
    });
    if (item.title === "Books") {
      const carousel = createElement("div", "book-carousel-wrap");
      carousel.append(list);
      article.append(carousel);
    } else {
      article.append(list);
    }
  }

  if (item.map && item.places) {
    article.classList.add("places-card");
    const usePopupMap = item.mapStyle === "popup";
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

    function createPlacePopup(place) {
      const popup = createElement("div", "place-popup");
      popup.append(createElement("h4", null, place.name));
      if (place.note) popup.append(createElement("p", null, place.note));

      if (place.links) {
        const list = createElement("ul");
        place.links.forEach((entry) => {
          const listItem = createElement("li");
          listItem.append(renderEntryLink(entry));
          if (entry.note) listItem.append(createElement("small", null, entry.note));
          list.append(listItem);
        });
        popup.append(list);
      }

      return popup;
    }

    const mapWrap = createElement("div", "places-layout");
    if (usePopupMap) {
      mapWrap.classList.add("popup-map-layout");
      mapWrap.append(map);
    } else {
      mapWrap.append(map, panel);
    }
    article.append(mapWrap);

    if (window.L) {
      const worldBounds = [
        [-85, -180],
        [85, 180],
      ];
      const displayBounds = [
        [-68, -180],
        [80, 180],
      ];
      const mobileDisplayBounds = [
        [-58, -180],
        [80, 180],
      ];
      const isMobileMap = window.matchMedia("(max-width: 560px)").matches;
      const activeDisplayBounds = isMobileMap ? mobileDisplayBounds : displayBounds;
      const leafletMap = L.map(map, {
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        touchZoom: false,
        boxZoom: false,
        keyboard: false,
        zoomSnap: 0.05,
        zoomDelta: 0.25,
        zoomControl: false,
        maxBounds: worldBounds,
        maxBoundsViscosity: 1,
      });

      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        noWrap: true,
        bounds: worldBounds,
      }).addTo(leafletMap);

      const markerIcon = L.divIcon({
        className: "leaflet-place-pin",
        html:
          '<svg viewBox="0 0 64 88" aria-hidden="true"><path fill="currentColor" d="M32 0C14.4 0 0 14.4 0 32c0 22.8 32 56 32 56s32-33.2 32-56C64 14.4 49.6 0 32 0Zm0 45a13 13 0 1 1 0-26 13 13 0 0 1 0 26Z"/></svg>',
        iconSize: [12, 17],
        iconAnchor: [6, 17],
      });

      item.places.forEach((place) => {
        const marker = L.marker([place.lat, place.lng], { icon: markerIcon }).addTo(leafletMap);
        if (usePopupMap) {
          marker.bindPopup(createPlacePopup(place), {
            closeButton: true,
            maxWidth: isMobileMap ? 190 : 240,
            minWidth: isMobileMap ? 145 : 180,
            autoPan: false,
            closeOnClick: true,
            autoClose: true,
            className: "place-leaflet-popup",
          });
          if (window.matchMedia("(hover: hover)").matches) {
            marker.on("mouseover", () => marker.openPopup());
          }
          marker.on("click", () => {
            leafletMap.closePopup();
            marker.openPopup();
          });
          marker.on("popupopen", () => marker.getElement()?.classList.add("is-active"));
          marker.on("popupclose", () => marker.getElement()?.classList.remove("is-active"));
        } else {
          marker.on("click", () => showPlace(place, marker.getElement()));
        }
      });

      if (usePopupMap) {
        leafletMap.on("click", () => {
          leafletMap.closePopup();
        });
      }

      leafletMap.fitBounds(activeDisplayBounds, { padding: [0, 0] });
      window.setTimeout(() => {
        leafletMap.invalidateSize();
        leafletMap.fitBounds(activeDisplayBounds, { padding: [0, 0] });
      }, 0);
    } else {
      map.append(createElement("p", "map-fallback", "Map unavailable. Places are listed here."));
      item.places.forEach((place) => {
        const button = createElement("button", "place-marker", place.name);
        button.type = "button";
        if (usePopupMap) {
          button.addEventListener("click", () => {
            map.append(createPlacePopup(place));
          });
        } else {
          button.addEventListener("click", () => showPlace(place, button));
        }
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
