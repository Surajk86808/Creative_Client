const fs = require("fs");
const path = require("path");
const { config } = require("./config");
const { ensureDir } = require("./utils");
const { logErrorToFile } = require("./logger");

// Supports both "{{PLACEHOLDER}}" (HTML-friendly) and "[[PLACEHOLDER]]" (JSX-friendly)
const PLACEHOLDER_RE = /(?:\{\{|\[\[)([A-Z_]+)(?:\}\}|\]\])/g;

const SKIP_DIR_NAMES = new Set(["node_modules", "dist", ".git", "build", "coverage", ".npm-cache"]);

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

async function loadGroqClient() {
  try {
    // groq-sdk may be ESM-only in some versions
    // eslint-disable-next-line global-require
    const Groq = require("groq-sdk");
    return new Groq({ apiKey: config.GROQ_API_KEY });
  } catch {
    const mod = await import("groq-sdk");
    const Groq = mod.default || mod;
    return new Groq({ apiKey: config.GROQ_API_KEY });
  }
}

function buildBaseReplacements(businessData) {
  return {
    SHOP_ID: businessData.shop_id || "",
    SHOP_NAME: businessData.shop_name || "",
    CATEGORY: businessData.category || "",
    ADDRESS: businessData.address || "",
    PHONE: businessData.phone || "",
    EMAIL: businessData.email || "",
    CITY: businessData.city || ""
  };
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

function fallbackGeneratedValues(placeholders, businessData) {
  const city = String(businessData.city || "").trim();
  const category = String(businessData.category || "").trim() || "business";
  const shop = String(businessData.shop_name || "").trim() || "Your Business";
  const address = String(businessData.address || "").trim();
  const phone = String(businessData.phone || "").trim();
  const safeCity = city ? ` in ${city}` : "";

  const [s1, s2, s3] = inferServices(category);

  const values = {};
  for (const p of placeholders) {
    if (p === "TAGLINE") values[p] = `Trusted ${category}${safeCity}`.split(" ").slice(0, 10).join(" ");
    else if (p === "ABOUT_TEXT") {
      const where = address || (city ? city : "your area");
      const call = phone ? ` Call ${phone} to get started.` : " Contact us to get started.";
      values[p] = `${shop} provides professional ${category} services for customers in ${where}. We focus on quality, clear communication, and great results.${call}`;
    } else if (p === "SERVICE_1") values[p] = s1;
    else if (p === "SERVICE_2") values[p] = s2;
    else if (p === "SERVICE_3") values[p] = s3;
    else if (p === "META_TITLE") values[p] = `${shop}${safeCity} | ${category}`.slice(0, 60);
    else if (p === "META_DESCRIPTION") {
      const bits = [`${shop}${safeCity}`, category, phone ? `Call ${phone}` : ""].filter(Boolean);
      values[p] = bits.join(" • ").slice(0, 160);
    } else if (p === "CTA_TEXT") values[p] = phone ? "Call Now" : "Get a Quote";
    else if (p.endsWith("_TEXT") && !values[p]) values[p] = `${shop} — ${category}${safeCity}.`;
  }
  return values;
}

async function groqGenerateValues(placeholders, businessData, strict = false) {
  if (!config.GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");
  const groq = await loadGroqClient();

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
- ABOUT_TEXT: 2-3 sentences, warm and professional
- SERVICE_1/2/3: specific services relevant to this category
- META_TITLE: SEO optimised, include shop name and city
- META_DESCRIPTION: under 160 chars, include keywords
- CTA_TEXT: action phrase like 'Book Now', 'Visit Us', 'Order Today'
- Keep SHOP_NAME, ADDRESS, PHONE, EMAIL, CITY, CATEGORY exactly as provided
${strictLine}
`.trim();

  const resp = await groq.chat.completions.create({
    model: "llama3-70b-8192",
    messages: [
      { role: "system", content: "You output only strict JSON objects." },
      { role: "user", content: prompt }
    ],
    temperature: 0.6
  });

  const content = resp.choices?.[0]?.message?.content || "";
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
    const text = fs.readFileSync(f, "utf8");
    for (const p of extractPlaceholders(text)) placeholderSet.add(p);
  }

  const placeholders = [...placeholderSet].sort();
  const base = buildBaseReplacements(businessData);
  const remaining = placeholders.filter((p) => !Object.prototype.hasOwnProperty.call(base, p));

  let generated = {};
  if (remaining.length > 0) {
    try {
      generated = await groqGenerateValues(placeholders, businessData, false);
    } catch (err) {
      logErrorToFile("Groq JSON parse or API error (retrying once)", {
        shop_id: businessData.shop_id,
        error: String(err && err.message ? err.message : err)
      });
      try {
        generated = await groqGenerateValues(placeholders, businessData, true);
      } catch (err2) {
        logErrorToFile("Groq failed twice; using fallback generation", {
          shop_id: businessData.shop_id,
          error: String(err2 && err2.message ? err2.message : err2)
        });
        generated = fallbackGeneratedValues(placeholders, businessData);
      }
    }
  }

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

  for (const f of textFiles) {
    const text = fs.readFileSync(f, "utf8");
    if (!PLACEHOLDER_RE.test(text)) continue;
    PLACEHOLDER_RE.lastIndex = 0;
    const out = applyReplacements(text, replacements);
    const remaining = extractPlaceholders(out);
    if (remaining.length > 0) {
      logErrorToFile("Unfilled placeholders remain", {
        shop_id: businessData.shop_id,
        file: path.relative(outputFolder, f),
        placeholders: remaining
      });
    }
    fs.writeFileSync(f, out, "utf8");
  }

  // If the template has metadata.json, keep it in sync for previews/hosting that read it.
  const metaPath = path.join(outputFolder, "metadata.json");
  if (fs.existsSync(metaPath)) {
    try {
      const raw = fs.readFileSync(metaPath, "utf8");
      const parsed = JSON.parse(raw);
      const about = replacements.ABOUT_TEXT || `${businessData.shop_name || ""} — ${businessData.category || ""}`.trim();
      parsed.name = businessData.shop_name || parsed.name;
      parsed.description = about || parsed.description;
      fs.writeFileSync(metaPath, `${JSON.stringify(parsed, null, 2)}\n`, "utf8");
    } catch (err) {
      logErrorToFile("metadata.json update failed", {
        shop_id: businessData.shop_id,
        error: String(err && err.message ? err.message : err)
      });
    }
  }

  const leadMetaPath = path.join(outputFolder, "_lead_meta.json");
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
    generated_at: new Date().toISOString()
  }, null, 2) + "\n", "utf8");

  return outputFolder;
}

module.exports = { fillTemplate };
