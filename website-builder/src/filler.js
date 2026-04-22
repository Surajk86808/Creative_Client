const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { ensureDir } = require("./utils");
const { logErrorToFile } = require("./logger");
const { normalizeReviewStatus } = require("./review");

// Supports both "{{PLACEHOLDER}}" (HTML-friendly) and "[[PLACEHOLDER]]" (JSX-friendly)
const PLACEHOLDER_RE = /(?:\{\{|\[\[)([A-Z0-9_]+)(?:\}\}|\]\])/g;

const SKIP_DIR_NAMES = new Set(["node_modules", "dist", ".git", "build", "coverage", ".npm-cache"]);
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_TEXT_MODEL = process.env.GROQ_TEXT_MODEL || process.env.GROQ_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

function normalizeWhitespace(s) {
  return String(s || "").replace(/\s+/g, " ").trim();
}

function clampWords(s, maxWords) {
  if (!maxWords || maxWords <= 0) return "";
  const text = normalizeWhitespace(s);
  if (!text) return "";
  const parts = text.split(" ");
  if (parts.length <= maxWords) return text;
  return `${parts.slice(0, maxWords).join(" ")}...`;
}

function clampChars(s, maxChars) {
  if (!maxChars || maxChars <= 0) return "";
  const text = normalizeWhitespace(s);
  if (text.length <= maxChars) return text;
  if (maxChars <= 3) return ".".repeat(maxChars);
  return `${text.slice(0, maxChars - 3).trimEnd()}...`;
}

function clampText(s, { maxWords, maxChars } = {}) {
  let out = normalizeWhitespace(s);
  if (maxWords) out = clampWords(out, maxWords);
  if (maxChars) out = clampChars(out, maxChars);
  return out;
}

function cleanShopName(rawName) {
  let name = normalizeWhitespace(rawName);
  if (!name) return "";

  // Common scrape pattern: "Brand (tagline...)" — keep just the brand for UI.
  const parenIdx = name.indexOf("(");
  if (parenIdx > 0 && name.length > 36) name = name.slice(0, parenIdx).trim();

  // Also trim long suffixes like " - Something" / " | Something".
  for (const sep of [" - ", " | ", " • ", " — ", " – ", ": "]) {
    const idx = name.indexOf(sep);
    if (idx > 0 && name.length > 36) {
      name = name.slice(0, idx).trim();
      break;
    }
  }

  return clampText(name, { maxWords: 6, maxChars: 42 });
}

function listFilesRecursively(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIR_NAMES.has(entry.name)) continue;
      out.push(...listFilesRecursively(full));
    }
    else out.push(full);
  }
  return out;
}

function copyDir(src, dest) {
  ensureDir(dest);
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.isDirectory() && SKIP_DIR_NAMES.has(entry.name)) continue;
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(from, to);
    else fs.copyFileSync(from, to);
  }
}

function extractPlaceholders(text) {
  const set = new Set();
  PLACEHOLDER_RE.lastIndex = 0;
  let match;
  while ((match = PLACEHOLDER_RE.exec(text)) !== null) set.add(match[1]);
  return [...set];
}

function applyReplacements(text, replacements) {
  return text.replace(PLACEHOLDER_RE, (full, name) => {
    if (Object.prototype.hasOwnProperty.call(replacements, name)) return String(replacements[name]);
    return full;
  });
}

function repairMojibakeText(text) {
  const raw = String(text || "");
  if (!/[ÃÂâð]/.test(raw)) return raw;
  try {
    const repaired = Buffer.from(raw, "latin1").toString("utf8");
    const rawMarkers = (raw.match(/[ÃÂâð]/g) || []).length;
    const repairedMarkers = (repaired.match(/[ÃÂâð]/g) || []).length;
    return repairedMarkers < rawMarkers ? repaired : raw;
  } catch {
    return raw;
  }
}

async function groqChatCompletion(messages, temperature) {
  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: GROQ_TEXT_MODEL,
      temperature,
      messages
    })
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Groq HTTP error ${response.status}: ${errorBody}`);
  }

  const payload = await response.json();
  return payload?.choices?.[0]?.message?.content || "";
}

function buildBaseReplacements(businessData) {
  return {
    SHOP_ID: businessData.shop_id || "",
    SHOP_NAME: cleanShopName(businessData.shop_name) || "",
    CATEGORY: clampText(businessData.category || "", { maxWords: 8, maxChars: 60 }),
    ADDRESS: clampText(businessData.address || "", { maxWords: 18, maxChars: 120 }),
    PHONE: clampText(businessData.phone || "", { maxWords: 6, maxChars: 30 }),
    EMAIL: clampText(businessData.email || "", { maxWords: 6, maxChars: 64 }),
    CITY: clampText(businessData.city || "", { maxWords: 4, maxChars: 32 })
  };
}

function enforceGeneratedLimits(values) {
  const out = { ...(values || {}) };
  for (const [key, val] of Object.entries(out)) {
    if (val == null) continue;
    if (key === "TAGLINE") out[key] = clampText(val, { maxWords: 10, maxChars: 80 });
    else if (key === "HERO_KICKER") out[key] = clampText(val, { maxWords: 8, maxChars: 56 });
    else if (key === "HERO_HEADLINE" || key === "ABOUT_HEADLINE") out[key] = clampText(val, { maxWords: 12, maxChars: 96 });
    else if (key === "ABOUT_TEXT") out[key] = clampText(val, { maxWords: 50, maxChars: 320 });
    else if (key === "FOOTER_DESCRIPTION") out[key] = clampText(val, { maxWords: 28, maxChars: 180 });
    else if (key.startsWith("SERVICE_")) out[key] = clampText(val, { maxWords: 8, maxChars: 56 });
    else if (key.startsWith("VALUE_PROP_")) out[key] = clampText(val, { maxWords: 8, maxChars: 56 });
    else if (/^STAT_\d+_VALUE$/.test(key)) out[key] = clampText(val, { maxWords: 4, maxChars: 24 });
    else if (/^STAT_\d+_LABEL$/.test(key)) out[key] = clampText(val, { maxWords: 6, maxChars: 48 });
    else if (/^SERVICE_\d+_(TEXT|DESC)$/.test(key)) out[key] = clampText(val, { maxWords: 18, maxChars: 120 });
    else if (/^SERVICE_\d+_BADGE$/.test(key)) out[key] = clampText(val, { maxWords: 3, maxChars: 24 });
    else if (/^OFFER_\d+_TITLE$/.test(key)) out[key] = clampText(val, { maxWords: 8, maxChars: 56 });
    else if (/^OFFER_\d+_(TAG|SUBTITLE)$/.test(key)) out[key] = clampText(val, { maxWords: 6, maxChars: 48 });
    else if (/^OFFER_\d+_PRICE$/.test(key)) out[key] = clampText(val, { maxWords: 4, maxChars: 24 });
    else if (/^OFFER_\d+_ALT$/.test(key)) out[key] = clampText(val, { maxWords: 12, maxChars: 80 });
    else if (/^TESTIMONIAL_\d+_NAME$/.test(key)) out[key] = clampText(val, { maxWords: 4, maxChars: 36 });
    else if (/^TESTIMONIAL_\d+_ROLE$/.test(key)) out[key] = clampText(val, { maxWords: 6, maxChars: 48 });
    else if (/^TESTIMONIAL_\d+_QUOTE$/.test(key)) out[key] = clampText(val, { maxWords: 28, maxChars: 220 });
    else if (/^TESTIMONIAL_\d+_INITIALS$/.test(key)) out[key] = clampText(val, { maxWords: 2, maxChars: 4 });
    else if (key === "CTA_TEXT") out[key] = clampText(val, { maxWords: 4, maxChars: 24 });
    else if (key === "CTA_PRIMARY" || key === "CTA_SECONDARY") out[key] = clampText(val, { maxWords: 4, maxChars: 24 });
    else if (key === "META_TITLE") out[key] = clampText(val, { maxWords: 12, maxChars: 60 });
    else if (key === "META_DESCRIPTION") out[key] = clampText(val, { maxWords: 28, maxChars: 160 });
    else if (key.endsWith("_TEXT")) out[key] = clampText(val, { maxWords: 40, maxChars: 260 });
    else out[key] = clampText(val, { maxWords: 18, maxChars: 180 });
  }
  return out;
}

function toCategoryQuery(raw) {
  const cleaned = String(raw || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
  if (!cleaned) return "";
  return cleaned.split(" ").filter(Boolean).slice(0, 6).join(",");
}

function unsplashUrl(w, h, query) {
  const q = String(query || "").replace(/\s+/g, ",").replace(/,+/g, ",").replace(/^,|,$/g, "");
  const safe = q || "business,office";
  return `https://source.unsplash.com/${w}x${h}/?${safe}`;
}

function fillImageSlots(out, prefix, count, w, h, queries, fallbackQuery) {
  const list = Array.isArray(queries) ? queries.filter(Boolean) : [];
  const fallback = fallbackQuery || "business,office";
  for (let i = 1; i <= count; i += 1) {
    const q = list[i - 1] || list[list.length - 1] || fallback;
    out[`${prefix}${i}`] = unsplashUrl(w, h, q);
  }
}

function buildCategoryImageSet({
  heroQuery,
  imageQueries,
  itemQueries,
  galleryQueries,
  avatarQueries,
  fallbackQuery
}) {
  const out = {};
  out.HERO_IMAGE_URL = unsplashUrl(2000, 1200, heroQuery || fallbackQuery);

  fillImageSlots(out, "IMAGE_", 6, 1200, 900, imageQueries, fallbackQuery);
  fillImageSlots(out, "ITEM_IMAGE_", 12, 1000, 800, itemQueries, fallbackQuery);
  fillImageSlots(out, "GALLERY_IMAGE_", 12, 900, 1200, galleryQueries, fallbackQuery);
  fillImageSlots(out, "AVATAR_IMAGE_", 6, 200, 200, avatarQueries, "portrait,person");

  return out;
}

function pickCategoryImages(categoryRaw = "") {
  const category = String(categoryRaw || "").toLowerCase();
  const has = (s) => category.includes(s);
  const base = toCategoryQuery(categoryRaw) || "business,office";

  if (has("coffee") || has("cafe") || has("café") || has("tea") || has("bakery")) {
    return buildCategoryImageSet({
      heroQuery: `${base},coffee,cafe`,
      imageQueries: [`${base},cafe,interior`, "coffee,beans", "map,city", "barista", "latte,art", "bakery,pastry"],
      itemQueries: ["espresso,coffee", "latte,cafe", "pastry,bakery", "cappuccino", "croissant", "cold,brew", `${base},coffee`],
      galleryQueries: ["barista", "coffee,cup", "coffee,shop", "latte,art", "bakery,pastry", "brunch,cafe"],
      avatarQueries: ["portrait,smile", "portrait,person", "portrait,professional"],
      fallbackQuery: "coffee,cafe"
    });
  }

  if (has("pizza") || has("restaurant") || has("food") || has("burger") || has("diner") || has("catering")) {
    return buildCategoryImageSet({
      heroQuery: `${base},restaurant,food`,
      imageQueries: ["chef,cooking", "restaurant,interior", "map,city", "plating,gourmet", "kitchen,chef", "table,restaurant"],
      itemQueries: ["pizza", "pasta", "dessert", "burger", "salad", "steak", `${base},food`],
      galleryQueries: ["restaurant,table", "chef,cooking", "dessert", "fresh,ingredients", "wine,glass", "food,plating"],
      avatarQueries: ["portrait,person", "portrait,smile", "portrait,professional"],
      fallbackQuery: "restaurant,food"
    });
  }

  if (has("salon") || has("spa") || has("beauty") || has("barber") || has("tattoo")) {
    return buildCategoryImageSet({
      heroQuery: `${base},salon,spa`,
      imageQueries: ["haircut,salon", "skincare,spa", "map,city", "barber,shop", "tattoo,studio", "beauty,products"],
      itemQueries: ["haircut,salon", "beard,trim", "skincare,spa", "tattoo,artist", "barber,tools", `${base},beauty`],
      galleryQueries: ["barber,shop", "hair,styling", "tattoo,art", "salon,interior", "spa,relax", "grooming"],
      avatarQueries: ["portrait,person", "portrait,style", "portrait,professional"],
      fallbackQuery: "salon,spa"
    });
  }

  if (has("medical") || has("clinic") || has("doctor") || has("dent") || has("dental") || has("hospital")) {
    return buildCategoryImageSet({
      heroQuery: `${base},clinic,doctor`,
      imageQueries: ["doctor,consultation", "clinic,interior", "map,city", "medical,team", "dental,clinic", "stethoscope,doctor"],
      itemQueries: ["doctor,clinic", "medical,checkup", "dental,care", "hospital,interior", "health,care", `${base},health`],
      galleryQueries: ["clinic,interior", "doctor,patient", "medical,team", "dental,tools", "health,care", "reception,clinic"],
      avatarQueries: ["doctor,portrait", "nurse,portrait", "doctor,portrait,smile"],
      fallbackQuery: "doctor,clinic"
    });
  }

  if (has("gym") || has("fitness") || has("yoga") || has("pilates") || has("crossfit")) {
    return buildCategoryImageSet({
      heroQuery: `${base},gym,fitness`,
      imageQueries: ["gym,interior", "workout,training", "map,city", "dumbbell,gym", "personal,trainer", "fitness,class"],
      itemQueries: ["gym,workout", "dumbbell", "treadmill,gym", "yoga", "pilates", `${base},fitness`],
      galleryQueries: ["gym,training", "fitness,class", "weights,gym", "cardio,workout", "stretching,yoga", "boxing,training"],
      avatarQueries: ["portrait,athlete", "portrait,trainer", "portrait,person"],
      fallbackQuery: "gym,fitness"
    });
  }

  if (has("auto") || has("car") || has("garage") || has("mechanic") || has("bike")) {
    return buildCategoryImageSet({
      heroQuery: `${base},auto,repair`,
      imageQueries: ["mechanic,car", "garage,service", "map,city", "car,engine", "tools,mechanic", "auto,workshop"],
      itemQueries: ["car,service", "oil,change", "tire,service", "engine,repair", "diagnostics,car", `${base},auto`],
      galleryQueries: ["mechanic,workshop", "car,engine", "auto,tools", "garage,interior", "car,repair", "tire,change"],
      avatarQueries: ["portrait,mechanic", "portrait,person", "portrait,professional"],
      fallbackQuery: "auto,repair"
    });
  }

  if (has("real estate") || has("property") || has("realtor") || has("broker")) {
    return buildCategoryImageSet({
      heroQuery: `${base},real,estate`,
      imageQueries: ["luxury,interior", "city,skyline", "map,city", "modern,architecture", "apartment,interior", "house,exterior"],
      itemQueries: ["house,exterior", "apartment,interior", "villa,exterior", "living,room", "kitchen,interior", `${base},property`],
      galleryQueries: ["architecture,building", "living,room", "kitchen,interior", "bedroom,interior", "city,skyline", "house,exterior"],
      avatarQueries: ["portrait,professional", "portrait,person", "portrait,smile"],
      fallbackQuery: "real,estate"
    });
  }

  if (has("law") || has("lawyer") || has("attorney") || has("legal")) {
    return buildCategoryImageSet({
      heroQuery: `${base},law,office`,
      imageQueries: ["law,office", "meeting,boardroom", "map,city", "courthouse", "legal,documents", "handshake,business"],
      itemQueries: ["law,office", "legal,documents", "court,judge", "consultation,meeting", `${base},legal`, "contract,signing"],
      galleryQueries: ["law,office", "courthouse", "meeting,boardroom", "legal,documents", "scales,justice", "library,law"],
      avatarQueries: ["portrait,professional", "portrait,person", "portrait,smile"],
      fallbackQuery: "law,office"
    });
  }

  if (has("school") || has("academy") || has("coaching") || has("tutor") || has("training")) {
    return buildCategoryImageSet({
      heroQuery: `${base},school,campus`,
      imageQueries: ["classroom,students", "teacher,teaching", "map,city", "books,study", "graduation", "library,school"],
      itemQueries: ["students,study", "classroom", "teacher", "books", "computer,class", `${base},education`],
      galleryQueries: ["school,campus", "classroom", "students,study", "graduation", "library,books", "teacher,teaching"],
      avatarQueries: ["portrait,student", "portrait,teacher", "portrait,person"],
      fallbackQuery: "education,school"
    });
  }

  if (has("event") || has("wedding") || has("planner")) {
    return buildCategoryImageSet({
      heroQuery: `${base},wedding,event`,
      imageQueries: ["event,planner", "wedding,decor", "map,city", "flowers,wedding", "table,setting", "wedding,cake"],
      itemQueries: ["wedding,decor", "event,planner", "flowers,wedding", "table,setting", "wedding,cake", `${base},event`],
      galleryQueries: ["wedding,table", "wedding,couple", "wedding,cake", "floral,arch", "wedding,invitation", "wedding,night"],
      avatarQueries: ["portrait,person", "portrait,smile", "portrait,professional"],
      fallbackQuery: "wedding,event"
    });
  }

  if (has("retail") || has("store") || has("shop")) {
    return buildCategoryImageSet({
      heroQuery: `${base},retail,store`,
      imageQueries: ["store,interior", "shopping,products", "map,city", "boutique,store", "shelf,products", "checkout,store"],
      itemQueries: [`${base},product`, "shopping,bag", "product,display", "boutique", "packaging", "store,aisle", "fashion,product", "electronics,product"],
      galleryQueries: ["store,interior", "product,display", "shopping", "boutique", "checkout", "retail,storefront"],
      avatarQueries: ["portrait,person", "portrait,smile", "portrait,professional"],
      fallbackQuery: "retail,store"
    });
  }

  if (has("tech") || has("it") || has("software") || has("agency")) {
    return buildCategoryImageSet({
      heroQuery: `${base},technology`,
      imageQueries: ["data,center", "developer,workspace", "map,city", "server,rack", "code,screen", "network,hardware"],
      itemQueries: ["server,rack", "code,screen", "laptop,workspace", "cloud,computing", "network,hardware", `${base},technology`],
      galleryQueries: ["data,center", "developer,workspace", "server,rack", "code,screen", "team,meeting", "cybersecurity"],
      avatarQueries: ["portrait,professional", "portrait,person", "portrait,smile"],
      fallbackQuery: "technology"
    });
  }

  if (has("travel") || has("hotel") || has("resort")) {
    return buildCategoryImageSet({
      heroQuery: `${base},travel`,
      imageQueries: ["luxury,hotel", "travel,landscape", "map,city", "resort,pool", "beach,resort", "city,travel"],
      itemQueries: ["beach,resort", "mountains,travel", "city,travel", "luxury,hotel", "suite,hotel", `${base},travel`],
      galleryQueries: ["travel,landscape", "luxury,hotel", "resort,pool", "beach,resort", "city,skyline", "mountain,view"],
      avatarQueries: ["portrait,person", "portrait,smile", "portrait,professional"],
      fallbackQuery: "travel,hotel"
    });
  }

  if (has("finance") || has("account") || has("tax") || has("insurance") || has("audit")) {
    return buildCategoryImageSet({
      heroQuery: `${base},finance`,
      imageQueries: ["finance,meeting", "accounting,team", "map,city", "office,workspace", "calculator,finance", "charts,analysis"],
      itemQueries: ["finance,meeting", "accounting", "tax,documents", "office,team", "charts,analysis", `${base},finance`],
      galleryQueries: ["finance,meeting", "office,team", "charts,analysis", "documents,contract", "handshake,business", "city,office"],
      avatarQueries: ["portrait,professional", "portrait,person", "portrait,smile"],
      fallbackQuery: "finance,office"
    });
  }

  if (has("home") || has("construction") || has("plumb") || has("electric") || has("clean") || has("repair")) {
    return buildCategoryImageSet({
      heroQuery: `${base},home,service`,
      imageQueries: ["home,interior", "tools,repair", "map,city", "plumber,work", "electrician,work", "cleaning,home"],
      itemQueries: ["home,repair", "cleaning,service", "tools,repair", "kitchen,interior", "bathroom,repair", `${base},home`],
      galleryQueries: ["home,interior", "tools,repair", "plumber,work", "electrician,work", "cleaning,home", "renovation,home"],
      avatarQueries: ["portrait,professional", "portrait,person", "portrait,smile"],
      fallbackQuery: "home,service"
    });
  }

  return buildCategoryImageSet({
    heroQuery: `${base},business`,
    imageQueries: [`${base},interior`, "team,work", "map,city"],
    itemQueries: [`${base},product`, "service,customer", "office,workspace"],
    galleryQueries: [`${base},storefront`, "workspace,team", "city,street"],
    avatarQueries: ["portrait,person", "portrait,smile", "portrait,professional"],
    fallbackQuery: "business,office"
  });
}

function inferServices(categoryRaw) {
  const category = String(categoryRaw || "").toLowerCase();
  const has = (s) => category.includes(s);

  if (has("pizza") || has("restaurant") || has("cafe") || has("food") || has("burger")) {
    return ["Dine-in & takeaway", "Online ordering", "Catering & events"];
  }
  if (has("salon") || has("barber") || has("hair") || has("spa") || has("beauty")) {
    return ["Haircut & styling", "Grooming & spa", "Bridal & party packages"];
  }
  if (has("clinic") || has("doctor") || has("dent") || has("medical") || has("hospital")) {
    return ["Consultations", "Diagnostics & checkups", "Pharmacy & support"];
  }
  if (has("gym") || has("fitness") || has("yoga") || has("pilates") || has("crossfit")) {
    return ["Personal training", "Group classes", "Nutrition guidance"];
  }
  if (has("auto") || has("car") || has("garage") || has("mechanic") || has("bike")) {
    return ["Repairs & servicing", "Inspection & diagnostics", "Pickup & drop"];
  }
  if (has("law") || has("lawyer") || has("attorney") || has("legal")) {
    return ["Legal consultation", "Documentation & filing", "Representation & advice"];
  }
  if (has("real estate") || has("property") || has("realtor") || has("broker")) {
    return ["Buy & sell assistance", "Rentals & leasing", "Property evaluation"];
  }
  if (has("hotel") || has("resort") || has("guest")) {
    return ["Room booking", "Amenities & dining", "Events & stays"];
  }
  if (has("school") || has("tutor") || has("coaching") || has("academy") || has("training")) {
    return ["Courses & programs", "1:1 tutoring", "Test preparation"];
  }
  if (has("clean") || has("laundry") || has("housekeeping")) {
    return ["Home cleaning", "Deep cleaning", "Laundry & care"];
  }
  if (has("construction") || has("plumb") || has("electric") || has("contractor") || has("interior")) {
    return ["Installation & repairs", "Renovation projects", "On-site inspection"];
  }
  if (has("pet") || has("vet") || has("veter")) {
    return ["Vet consultation", "Grooming services", "Pet supplies"];
  }
  if (has("finance") || has("account") || has("tax") || has("insurance") || has("audit")) {
    return ["Tax filing", "Accounting & bookkeeping", "Advisory services"];
  }
  if (has("tech") || has("software") || has("computer") || has("repair") || has("it")) {
    return ["Device repair", "IT support", "Website & marketing"];
  }

  return ["Consultation", "Service & support", "Custom solutions"];
}

function initialsForName(name) {
  const parts = String(name || "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (!parts.length) return "TB";
  return parts.map((part) => part[0].toUpperCase()).join("");
}

function inferContentProfile(categoryRaw, phone) {
  const category = String(categoryRaw || "").toLowerCase();
  const has = (s) => category.includes(s);

  if (has("pizza") || has("restaurant") || has("cafe") || has("coffee") || has("bakery") || has("food")) {
    return {
      heroKicker: "Fresh flavors, warm service",
      heroHeadline: "Made for repeat visits and easy favorites",
      aboutHeadline: "Good hospitality starts with a memorable experience",
      footerDescription: "Welcoming guests with reliable service, standout flavors, and a smooth ordering experience.",
      ctaPrimary: "Order Now",
      ctaSecondary: "View Menu",
      valueProps: [
        "Freshly prepared selections every day",
        "Comfortable dine-in, takeaway, and pickup",
        "Friendly service that keeps people returning",
        "Easy ordering for busy schedules"
      ],
      stats: [
        { value: "4.8/5", label: "Guest rating" },
        { value: "Fast", label: "Pickup and delivery" },
        { value: "Fresh", label: "Prepared daily" },
        { value: "Local", label: "Neighborhood favorite" }
      ],
      serviceTexts: [
        "A popular option prepared with care, consistency, and strong local appeal.",
        "Built for convenience, value, and a smooth customer experience.",
        "A signature favorite that helps guests come back with confidence."
      ],
      serviceBadges: ["Popular", "Signature", "Favorite"],
      offers: [
        { title: "Signature picks", subtitle: "Most-loved choices", price: "Popular", alt: "Featured menu selection" },
        { title: "Seasonal specials", subtitle: "Freshly prepared", price: "Limited", alt: "Seasonal food and drink offering" },
        { title: "Group orders", subtitle: "Easy to share", price: "Best value", alt: "Shared table spread" }
      ],
      testimonials: [
        { name: "Aarav Mehta", role: "Local customer", quote: "Easy ordering, warm service, and a quality experience every time." },
        { name: "Nisha Rao", role: "Weekend regular", quote: "Consistent quality, great atmosphere, and a team that makes every visit easy." },
        { name: "Rohan Das", role: "Neighborhood guest", quote: "A dependable local favorite with standout service and plenty of return value." }
      ]
    };
  }

  if (has("travel") || has("hotel") || has("resort") || has("hospitality") || has("stay")) {
    return {
      heroKicker: "Stay well. Travel easy.",
      heroHeadline: "Comfortable stays and seamless planning, all in one place",
      aboutHeadline: "Designed for smooth arrivals, confident bookings, and memorable stays",
      footerDescription: "Helping guests book with confidence through flexible options, responsive support, and reliable hospitality.",
      ctaPrimary: "Book Now",
      ctaSecondary: "View Offers",
      valueProps: [
        "Flexible stays for business or leisure",
        "Responsive support before and during every booking",
        "Clear amenities, packages, and planning details",
        "Comfort built around convenience and trust"
      ],
      stats: [
        { value: "24/7", label: "Guest support" },
        { value: "Top rated", label: "Comfort and service" },
        { value: "Flexible", label: "Booking options" },
        { value: "Local", label: "Convenient access" }
      ],
      serviceTexts: [
        "A reliable booking experience built around comfort, convenience, and clear details.",
        "Flexible options that make planning easier for families, teams, and solo guests.",
        "Thoughtful support that keeps every stay or trip smooth from start to finish."
      ],
      serviceBadges: ["Popular", "Flexible", "Guest pick"],
      offers: [
        { title: "Signature stay", subtitle: "Comfort-first booking", price: "Top pick", alt: "Comfortable stay package" },
        { title: "Weekend escape", subtitle: "Relaxed planning", price: "Limited", alt: "Relaxing weekend travel experience" },
        { title: "Business-ready", subtitle: "Smart for teams", price: "Best value", alt: "Business travel or hotel package" }
      ],
      testimonials: [
        { name: "Priya Nair", role: "Frequent traveler", quote: "Clear communication, smooth booking, and a stay that felt thoughtfully managed." },
        { name: "Rahul Sen", role: "Business guest", quote: "Reliable service from inquiry to checkout, with details handled exactly when needed." },
        { name: "Meera Joshi", role: "Family planner", quote: "Comfortable, well-organized, and easy to recommend after a genuinely smooth experience." }
      ]
    };
  }

  return {
    heroKicker: phone ? "Reliable help when it matters" : "Trusted service, clear communication",
    heroHeadline: "Dependable service built around speed, clarity, and trust",
    aboutHeadline: "Clear communication, skilled execution, and support you can rely on",
    footerDescription: "Delivering dependable service with fast response times, clear updates, and a customer-first approach.",
    ctaPrimary: phone ? "Call Now" : "Get Started",
    ctaSecondary: "Learn More",
    valueProps: [
      "Fast response times and dependable scheduling",
      "Clear estimates, updates, and next steps",
      "Experienced professionals focused on quality work",
      "Support tailored to your timeline and needs"
    ],
    stats: [
      { value: "24/7", label: "Support availability" },
      { value: "Same day", label: "Fast response" },
      { value: "Trusted", label: "Customer-first service" },
      { value: "Local", label: "Responsive coverage" }
    ],
    serviceTexts: [
      "A dependable solution designed to keep service quality high and customer effort low.",
      "Clear, practical support built around fast turnaround and transparent communication.",
      "Flexible help that adapts to urgent needs, ongoing maintenance, or planned requests."
    ],
    serviceBadges: ["Core", "Priority", "Trusted"],
    offers: [
      { title: "Priority response", subtitle: "Fast support", price: "Same day", alt: "Priority service option" },
      { title: "Planned service", subtitle: "Easy scheduling", price: "Flexible", alt: "Scheduled service visit" },
      { title: "Ongoing support", subtitle: "Built to last", price: "Popular", alt: "Ongoing support plan" }
    ],
    testimonials: [
      { name: "Karan Patel", role: "Returning customer", quote: "Fast response, clear updates, and a team that made the whole process easier." },
      { name: "Ananya Shah", role: "Operations manager", quote: "Professional from start to finish, with dependable follow-through and strong communication." },
      { name: "Vikram Sethi", role: "Local client", quote: "A straightforward, trustworthy experience with quality results and no unnecessary friction." }
    ]
  };
}

function fallbackGeneratedValues(placeholders, businessData) {
  const city = String(businessData.city || "").trim();
  const category = String(businessData.category || "").trim() || "business";
  const shop = String(businessData.shop_name || "").trim() || "Your Business";
  const address = String(businessData.address || "").trim();
  const phone = String(businessData.phone || "").trim();

  const cityShort = clampText(city, { maxWords: 4, maxChars: 28 });
  const categoryShort = clampText(category, { maxWords: 6, maxChars: 40 }) || "business";
  const shopShort = clampText(shop, { maxWords: 8, maxChars: 48 }) || "Your Business";
  const safeCity = cityShort ? ` in ${cityShort}` : "";

  const [s1, s2, s3] = inferServices(categoryShort);
  const profile = inferContentProfile(categoryShort, phone);

  const values = {};
  for (const p of placeholders) {
    if (p === "TAGLINE") values[p] = clampWords(`Trusted ${categoryShort}${safeCity}`, 10);
    else if (p === "HERO_KICKER") values[p] = profile.heroKicker;
    else if (p === "HERO_HEADLINE") values[p] = profile.heroHeadline;
    else if (p === "ABOUT_HEADLINE") values[p] = profile.aboutHeadline;
    else if (p === "ABOUT_TEXT") {
      const whereRaw = address || (cityShort ? cityShort : "your area");
      const where = clampText(whereRaw, { maxWords: 12, maxChars: 80 }) || "your area";
      const call = phone ? ` Call ${phone} to get started.` : " Contact us to get started.";
      values[p] = clampText(
        `${shopShort} provides professional ${categoryShort} services for customers in ${where}. We focus on quality, clear communication, and great results.${call}`,
        { maxWords: 50, maxChars: 320 }
      );
    } else if (p === "SERVICE_1") values[p] = s1;
    else if (p === "SERVICE_2") values[p] = s2;
    else if (p === "SERVICE_3") values[p] = s3;
    else if (/^SERVICE_(\d+)_(TEXT|DESC)$/.test(p)) {
      const idx = Number(p.match(/^SERVICE_(\d+)_/)?.[1] || 1) - 1;
      values[p] = profile.serviceTexts[idx] || profile.serviceTexts[profile.serviceTexts.length - 1];
    } else if (/^SERVICE_(\d+)_BADGE$/.test(p)) {
      const idx = Number(p.match(/^SERVICE_(\d+)_/)?.[1] || 1) - 1;
      values[p] = profile.serviceBadges[idx] || profile.serviceBadges[profile.serviceBadges.length - 1];
    } else if (/^VALUE_PROP_(\d+)$/.test(p)) {
      const idx = Number(p.match(/^VALUE_PROP_(\d+)$/)?.[1] || 1) - 1;
      values[p] = profile.valueProps[idx] || profile.valueProps[profile.valueProps.length - 1];
    } else if (/^STAT_(\d+)_VALUE$/.test(p)) {
      const idx = Number(p.match(/^STAT_(\d+)_VALUE$/)?.[1] || 1) - 1;
      values[p] = profile.stats[idx]?.value || profile.stats[profile.stats.length - 1].value;
    } else if (/^STAT_(\d+)_LABEL$/.test(p)) {
      const idx = Number(p.match(/^STAT_(\d+)_LABEL$/)?.[1] || 1) - 1;
      values[p] = profile.stats[idx]?.label || profile.stats[profile.stats.length - 1].label;
    } else if (/^OFFER_(\d+)_TITLE$/.test(p)) {
      const idx = Number(p.match(/^OFFER_(\d+)_TITLE$/)?.[1] || 1) - 1;
      values[p] = profile.offers[idx]?.title || profile.offers[profile.offers.length - 1].title;
    } else if (/^OFFER_(\d+)_(TAG|SUBTITLE)$/.test(p)) {
      const idx = Number(p.match(/^OFFER_(\d+)_/)?.[1] || 1) - 1;
      values[p] = profile.offers[idx]?.subtitle || profile.offers[profile.offers.length - 1].subtitle;
    } else if (/^OFFER_(\d+)_PRICE$/.test(p)) {
      const idx = Number(p.match(/^OFFER_(\d+)_PRICE$/)?.[1] || 1) - 1;
      values[p] = profile.offers[idx]?.price || profile.offers[profile.offers.length - 1].price;
    } else if (/^OFFER_(\d+)_ALT$/.test(p)) {
      const idx = Number(p.match(/^OFFER_(\d+)_ALT$/)?.[1] || 1) - 1;
      values[p] = profile.offers[idx]?.alt || profile.offers[profile.offers.length - 1].alt;
    } else if (/^TESTIMONIAL_(\d+)_NAME$/.test(p)) {
      const idx = Number(p.match(/^TESTIMONIAL_(\d+)_NAME$/)?.[1] || 1) - 1;
      values[p] = profile.testimonials[idx]?.name || profile.testimonials[profile.testimonials.length - 1].name;
    } else if (/^TESTIMONIAL_(\d+)_ROLE$/.test(p)) {
      const idx = Number(p.match(/^TESTIMONIAL_(\d+)_ROLE$/)?.[1] || 1) - 1;
      values[p] = profile.testimonials[idx]?.role || profile.testimonials[profile.testimonials.length - 1].role;
    } else if (/^TESTIMONIAL_(\d+)_QUOTE$/.test(p)) {
      const idx = Number(p.match(/^TESTIMONIAL_(\d+)_QUOTE$/)?.[1] || 1) - 1;
      values[p] = profile.testimonials[idx]?.quote || profile.testimonials[profile.testimonials.length - 1].quote;
    } else if (/^TESTIMONIAL_(\d+)_INITIALS$/.test(p)) {
      const idx = Number(p.match(/^TESTIMONIAL_(\d+)_INITIALS$/)?.[1] || 1) - 1;
      const nameValue = profile.testimonials[idx]?.name || profile.testimonials[profile.testimonials.length - 1].name;
      values[p] = initialsForName(nameValue);
    } else if (p === "FOOTER_DESCRIPTION") values[p] = profile.footerDescription;
    else if (p === "META_TITLE") values[p] = clampChars(`${shopShort}${safeCity} | ${categoryShort}`, 60);
    else if (p === "META_DESCRIPTION") {
      const bits = [`${shopShort}${safeCity}`, categoryShort, phone ? `Call ${phone}` : ""].filter(Boolean);
      values[p] = clampChars(bits.join(" | "), 160);
    } else if (p === "CTA_TEXT") values[p] = phone ? "Call Now" : "Get a Quote";
    else if (p === "CTA_PRIMARY") values[p] = profile.ctaPrimary;
    else if (p === "CTA_SECONDARY") values[p] = profile.ctaSecondary;
    else if (p.endsWith("_TEXT") && !values[p]) values[p] = clampText(`${shopShort} - ${categoryShort}${safeCity}.`, { maxWords: 14, maxChars: 120 });
  }

  return enforceGeneratedLimits(values);
}

async function groqGenerateValues(placeholders, businessData, strict = false) {
  if (!config.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const list = placeholders.map((p) => `"${p}"`).join(", ");
  const strictLine = strict
    ? "IMPORTANT: Respond with JSON only. Do not include backticks, markdown, or commentary."
    : "Return valid JSON only (no markdown).";

  const prompt = `
You are filling in a business website template.

Business info:
Name: ${businessData.shop_name}
Category: ${businessData.category}
Address: ${businessData.address}
Phone: ${businessData.phone}
Email: ${businessData.email}
City: ${businessData.city}

Generate appropriate values for these placeholders in a single JSON object:
${list}

Rules:
- TAGLINE: catchy, relevant to category, under 10 words
- HERO_KICKER / HERO_HEADLINE / ABOUT_HEADLINE: short, specific section copy
- ABOUT_TEXT: 2-3 sentences, warm and professional
- SERVICE_1/2/3: specific services relevant to this category
- SERVICE_N_TEXT / SERVICE_N_BADGE: short supporting copy for those services
- VALUE_PROP_N: concise benefit bullets
- STAT_N_VALUE / STAT_N_LABEL: believable proof points or trust metrics
- OFFER_N_TITLE / OFFER_N_SUBTITLE / OFFER_N_PRICE / OFFER_N_ALT: featured packages, rooms, menu items, or offers
- TESTIMONIAL_N_NAME / ROLE / QUOTE / INITIALS: natural-sounding social proof
- FOOTER_DESCRIPTION: one sentence summary of the business
- CTA_TEXT / CTA_PRIMARY / CTA_SECONDARY: action phrases like 'Book Now', 'Visit Us', 'Order Today'
- META_TITLE: SEO optimised, include shop name and city
- META_DESCRIPTION: under 160 chars, include keywords
- Keep SHOP_NAME, ADDRESS, PHONE, EMAIL, CITY, CATEGORY exactly as provided
${strictLine}
`.trim();

  const content = await groqChatCompletion(
    [
      { role: "system", content: "You output only strict JSON objects." },
      { role: "user", content: prompt }
    ],
    0.6
  );
  return JSON.parse(content);
}

async function fillTemplate(templatePath, businessData, opts = {}) {
  const templateAbs = path.isAbsolute(templatePath) ? templatePath : path.join(config.WEBSITES_DIR, templatePath);
  if (!fs.existsSync(templateAbs)) throw new Error(`Template folder not found: ${templateAbs}`);

  const outputFolder = opts.outputDir ? String(opts.outputDir) : path.join(config.OUTPUT_DIR, businessData.shop_id);
  ensureDir(config.OUTPUT_DIR);
  if (fs.existsSync(outputFolder)) fs.rmSync(outputFolder, { recursive: true, force: true });
  copyDir(templateAbs, outputFolder);

  const files = listFilesRecursively(outputFolder);
  const textFiles = files.filter((f) => /\.(html?|css|js|ts|tsx|json|md|txt)$/i.test(f));

  const placeholderSet = new Set();
  for (const f of textFiles) {
    const text = repairMojibakeText(fs.readFileSync(f, "utf8"));
    for (const p of extractPlaceholders(text)) placeholderSet.add(p);
  }

  const placeholders = [...placeholderSet].sort();
  const base = buildBaseReplacements(businessData);
  const remaining = placeholders.filter((p) => !Object.prototype.hasOwnProperty.call(base, p));

  let generated = {};
  if (remaining.length > 0) {
    try {
      generated = await groqGenerateValues(placeholders, businessData, false);
      generated = enforceGeneratedLimits(generated);
    } catch (err) {
      logErrorToFile("Groq JSON parse or API error (retrying once)", {
        shop_id: businessData.shop_id,
        error: String(err && err.message ? err.message : err)
      });
      try {
        generated = await groqGenerateValues(placeholders, businessData, true);
        generated = enforceGeneratedLimits(generated);
      } catch (err2) {
        logErrorToFile("Groq failed twice; using fallback generation", {
          shop_id: businessData.shop_id,
          error: String(err2 && err2.message ? err2.message : err2)
        });
        generated = fallbackGeneratedValues(placeholders, businessData);
      }
    }
  }

  const fallback = fallbackGeneratedValues(remaining, businessData);
  generated = enforceGeneratedLimits({ ...fallback, ...generated });

  const replacements = { ...generated, ...base };
  const extraFields = {
    INSTAGRAM: businessData.instagram || "",
    FACEBOOK: businessData.facebook || "",
    TWITTER: businessData.twitter || "",
    LINKEDIN: businessData.linkedin || "",
    GOOGLE_MAPS_URL: businessData.google_maps_url || "",
    PLACE_ID: businessData.place_id || "",
    RATING: businessData.rating || "",
    REVIEWS_COUNT: businessData.reviews_count || "",
    COUNTRY: businessData.country || "",
    WEBSITE_URL: businessData.website_url || ""
  };
  Object.assign(replacements, extraFields);
  Object.assign(replacements, pickCategoryImages(businessData.category || ""));

  const unresolved = [];

  for (const f of textFiles) {
    const rawText = fs.readFileSync(f, "utf8");
    const text = repairMojibakeText(rawText);
    const hasPlaceholders = PLACEHOLDER_RE.test(text);
    PLACEHOLDER_RE.lastIndex = 0;
    if (!hasPlaceholders && text === rawText) continue;
    const out = hasPlaceholders
      ? repairMojibakeText(applyReplacements(text, replacements))
      : text;
    const remaining = hasPlaceholders ? extractPlaceholders(out) : [];
    if (remaining.length > 0) {
      const issue = {
        file: path.relative(outputFolder, f),
        placeholders: remaining
      };
      unresolved.push(issue);
      logErrorToFile("Unfilled placeholders remain", {
        shop_id: businessData.shop_id,
        file: issue.file,
        placeholders: issue.placeholders
      });
    }
    fs.writeFileSync(f, out, "utf8");
  }

  if (unresolved.length > 0) {
    const details = unresolved
      .map((issue) => `${issue.file}: ${issue.placeholders.join(", ")}`)
      .join("; ");
    throw new Error(`Template fill failed for ${businessData.shop_id}: unresolved placeholders remain (${details})`);
  }

  // If the template has metadata.json, keep it in sync for previews/hosting that read it.
  const metaPath = path.join(outputFolder, "metadata.json");
  if (fs.existsSync(metaPath)) {
    try {
      const raw = repairMojibakeText(fs.readFileSync(metaPath, "utf8"));
      const parsed = JSON.parse(raw);
      const about = replacements.ABOUT_TEXT || `${businessData.shop_name || ""} — ${businessData.category || ""}`.trim();
      parsed.name = businessData.shop_name || parsed.name;
      parsed.description = repairMojibakeText(about || parsed.description);
      fs.writeFileSync(metaPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    } catch (err) {
      logErrorToFile("metadata.json update failed", {
        shop_id: businessData.shop_id,
        error: String(err && err.message ? err.message : err)
      });
    }
  }

  const leadMetaPath = path.join(outputFolder, "_lead_meta.json");
  const previewPath = path.relative(config.OUTPUT_DIR, outputFolder).split(path.sep).join("/");
  fs.writeFileSync(leadMetaPath, JSON.stringify({
    shop_id: businessData.shop_id,
    shop_name: businessData.shop_name,
    category: businessData.category,
    city: businessData.city,
    country: businessData.country || "",
    address: businessData.address,
    phone: businessData.phone,
    email: businessData.email,
    instagram: businessData.instagram || "",
    facebook: businessData.facebook || "",
    twitter: businessData.twitter || "",
    linkedin: businessData.linkedin || "",
    google_maps_url: businessData.google_maps_url || "",
    rating: businessData.rating || "",
    reviews_count: businessData.reviews_count || "",
    website_url: businessData.website_url || "",
    preview_path: previewPath,
    review_status: normalizeReviewStatus("pending"),
    review_notes: "",
    generated_at: new Date().toISOString()
  }, null, 2) + "\n", "utf8");

  return outputFolder;
}

module.exports = { fillTemplate };
