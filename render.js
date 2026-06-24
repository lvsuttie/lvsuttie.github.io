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

function renderCaseDetail(detail) {
  const paragraph = createElement("p", "case-detail");
  const separatorIndex = detail.indexOf(":");

  if (separatorIndex > -1) {
    const label = createElement("strong", null, `${detail.slice(0, separatorIndex)}:`);
    paragraph.append(label, document.createTextNode(` ${detail.slice(separatorIndex + 1).trim()}`));
    return paragraph;
  }

  paragraph.textContent = detail;
  return paragraph;
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

const nav = document.querySelector(".nav");
const navMoreToggle = document.querySelector(".nav-more-toggle");
if (nav && navMoreToggle) {
  function closeNavMenu() {
    nav.classList.remove("is-open");
    navMoreToggle.setAttribute("aria-expanded", "false");
  }

  navMoreToggle.addEventListener("click", (event) => {
    event.stopPropagation();
    const isOpen = nav.classList.toggle("is-open");
    navMoreToggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll(".nav-more-menu a").forEach((link) => {
    link.addEventListener("click", closeNavMenu);
  });

  document.addEventListener("click", (event) => {
    if (!nav.contains(event.target)) closeNavMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNavMenu();
  });
}

const navLinks = Array.from(document.querySelectorAll(".nav a[href^='#']"));
const navSections = [...new Set(navLinks.map((link) => link.getAttribute("href")))]
  .map((href) => document.querySelector(href))
  .filter(Boolean);

function updateNavCurrent() {
  if (!navLinks.length || !navSections.length) return;
  const offset = (header?.getBoundingClientRect().height || 0) + 24;
  const pageBottom = window.scrollY + window.innerHeight;
  const isNearBottom = pageBottom >= document.documentElement.scrollHeight - 4;
  const currentSection = isNearBottom
    ? navSections.at(-1)
    : navSections.filter((section) => section.getBoundingClientRect().top <= offset).at(-1) ||
      navSections[0];
  const currentHref = `#${currentSection.id}`;

  navLinks.forEach((link) => {
    if (link.getAttribute("href") === currentHref) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  const isSecondaryCurrent = ["#speaking", "#work-with-me"].includes(currentHref);
  navMoreToggle?.classList.toggle("is-active", isSecondaryCurrent);
}

updateNavCurrent();
window.addEventListener("scroll", updateNavCurrent, { passive: true });
window.addEventListener("resize", updateNavCurrent);

document.querySelectorAll('[data-content="initials"]').forEach((element) => {
  element.textContent = content.initials;
});

setText("#intro-title", content.introHeading);
setText("#intro-subtitle", `${content.introStatement}${content.introStatement.endsWith(".") ? "" : "."}`);
const introText = document.getElementById("intro-text");
if (Array.isArray(content.introText)) {
  const paragraphs = content.introText.map((paragraph) => createElement("p", "intro", paragraph));
  introText.replaceWith(...paragraphs);
} else {
  introText.textContent = content.introText;
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
  if (card.imagePosition === "left") article.classList.add("image-left");

  if (card.image || card.reserveImageSpace) {
    article.classList.add("has-image");
    const imageWrap = createElement("div", "case-image");
    if (!card.image) imageWrap.classList.add("empty-image");
    if (card.image) {
      const image = createElement("img");
      image.src = card.image;
      image.alt = card.imageAlt || `${card.title} image`;
      if (card.imageFrame) {
        const imageFrame = createElement("div", `${card.imageFrame}-frame`);
        imageFrame.append(image);
        imageWrap.append(imageFrame);
      } else {
        imageWrap.append(image);
      }
    }
    article.append(imageWrap);
  }

  const copy = createElement("div", "case-copy");
  copy.append(createElement("p", "card-kicker", card.label));
  copy.append(createElement("h3", null, card.title));
  if (card.meta) copy.append(createElement("p", "card-meta", card.meta));
  copy.append(createElement("p", "case-description", card.description));

  const details = createElement("div", "case-details");
  card.details.forEach((detail) => details.append(renderCaseDetail(detail)));
  copy.append(details);

  const linkText = card.linkText.includes("→") ? card.linkText : `${card.linkText} →`;
  const link = createElement("a", null, linkText);
  link.className = "case-link";
  link.href = card.linkUrl;
  addExternalBehavior(link);
  copy.append(link);
  article.append(copy);

  buildingCards.append(article);
});

const speakingList = document.getElementById("speaking-list");
content.speaking.items.forEach((item) => {
  const article = item.url ? createElement("a", "talk-card") : createElement("article", "talk-card");
  if (item.url) {
    article.href = item.url;
    addExternalBehavior(article);
    article.setAttribute("aria-label", `Watch ${item.title}`);
  }

  if (item.thumbnail && item.url) {
    article.classList.add("has-thumbnail");
    const media = createElement("div", "talk-thumbnail");

    const image = createElement("img");
    image.src = item.thumbnail;
    image.alt = `${item.title} YouTube preview`;
    image.loading = "lazy";
    media.append(image);
    article.append(media);
  }

  const copy = createElement("div", "talk-copy");
  copy.append(createElement("span", null, `${item.event} · ${item.date}`));
  const heading = createElement("h3");
  heading.textContent = item.title;
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
        const list = createElement("div", "place-popup-links");
        place.links.forEach((entry) => {
          const link = createElement("a", "place-popup-link");
          link.href = entry.url;
          addExternalBehavior(link);
          link.append(
            createElement("span", "place-link-label", entry.name),
            document.createTextNode(" "),
            createElement("span", "place-link-arrow", "→"),
          );
          list.append(link);
          if (entry.note) list.append(createElement("small", null, entry.note));
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
        dragging: isMobileMap,
        doubleClickZoom: false,
        touchZoom: isMobileMap,
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
        html: '<span class="place-pin-dot" aria-hidden="true"></span>',
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const popupMarkers = [];
      let activePopupMarker = null;

      function getPlaceLabel(place) {
        return `View places in ${place.name.replace(/,.*$/, "")}.`;
      }

      function getMarkerPlace(marker) {
        return popupMarkers.find(({ marker: placeMarker }) => placeMarker === marker)?.place;
      }

      function setMarkerAccessibility(marker, place) {
        const element = marker.getElement();
        if (!element) return;
        element.setAttribute("aria-label", getPlaceLabel(place));
      }

      function setSelectedMarker(marker) {
        popupMarkers.forEach(({ marker: placeMarker }) => {
          const element = placeMarker.getElement();
          element?.classList.remove("is-active");
          element?.removeAttribute("aria-current");
        });
        activePopupMarker = marker;
        const place = getMarkerPlace(marker);
        if (place) setMarkerAccessibility(marker, place);
        const element = marker.getElement();
        element?.classList.add("is-active");
        element?.setAttribute("aria-current", "true");
      }

      function clearSelectedMarker(marker) {
        if (activePopupMarker !== marker) return;
        const element = marker.getElement();
        element?.classList.remove("is-active");
        element?.removeAttribute("aria-current");
        activePopupMarker = null;
      }

      item.places.forEach((place) => {
        const marker = L.marker([place.lat, place.lng], {
          icon: markerIcon,
          title: getPlaceLabel(place),
          alt: getPlaceLabel(place),
        }).addTo(leafletMap);
        popupMarkers.push({ place, marker });
        setMarkerAccessibility(marker, place);
        if (usePopupMap) {
          marker.bindPopup(createPlacePopup(place), {
            closeButton: true,
            maxWidth: isMobileMap ? 145 : 240,
            minWidth: isMobileMap ? 118 : 180,
            autoPan: true,
            autoPanPadding: isMobileMap ? [40, 28] : [36, 32],
            closeOnClick: true,
            autoClose: true,
            keepInView: true,
            className: "place-leaflet-popup",
          });
          if (window.matchMedia("(hover: hover)").matches) {
            marker.on("mouseover", () => marker.openPopup());
          }
          marker.on("click", () => {
            leafletMap.closePopup();
            setSelectedMarker(marker);
            marker.openPopup();
          });
          marker.on("popupopen", () => setSelectedMarker(marker));
          marker.on("popupclose", () => clearSelectedMarker(marker));
        } else {
          marker.on("click", () => showPlace(place, marker.getElement()));
        }
      });

      if (usePopupMap) {
        leafletMap.on("click", () => {
          leafletMap.closePopup();
        });
      }

      function openDefaultPopup() {
        if (!usePopupMap) return;
        const defaultPlace = popupMarkers.find(({ place }) => place.name === "San Diego, California");
        if (!defaultPlace) return;
        setSelectedMarker(defaultPlace.marker);
        defaultPlace.marker.openPopup();
        const popup = defaultPlace.marker.getPopup();
        if (popup && leafletMap.panInside) {
          leafletMap.panInside(popup.getLatLng(), {
            padding: isMobileMap ? [32, 64] : [48, 42],
          });
        }
      }

      leafletMap.fitBounds(activeDisplayBounds, { padding: [0, 0] });
      window.setTimeout(() => {
        leafletMap.invalidateSize();
        leafletMap.fitBounds(activeDisplayBounds, { padding: [0, 0] });
        popupMarkers.forEach(({ marker, place }) => setMarkerAccessibility(marker, place));
        window.setTimeout(openDefaultPopup, 180);
        window.setTimeout(openDefaultPopup, 420);
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
if (footerLinks && Array.isArray(content.links)) {
  content.links.forEach((item) => {
    const link = createElement("a", "social-link");
    link.href = item.url;
    link.setAttribute("aria-label", item.label === "X" ? "Laura Suttie on X" : item.label);
    addExternalBehavior(link);
    if (item.label === "X") {
      link.innerHTML =
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M18.9 2h3.3l-7.2 8.2L23.5 22h-6.6l-5.2-6.8L5.8 22H2.5l7.7-8.8L2 2h6.8l4.7 6.2L18.9 2Zm-1.2 17.9h1.8L7.8 4H5.9l11.8 15.9Z"/></svg>';
    } else {
      link.textContent = item.label;
    }
    footerLinks.append(link);
  });
}
