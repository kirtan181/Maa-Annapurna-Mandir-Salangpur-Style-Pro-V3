const config = window.TEMPLE_CONFIG || {};
const sb = window.supabase && config.supabaseUrl && config.supabaseKey
  ? window.supabase.createClient(config.supabaseUrl, config.supabaseKey)
  : null;

const $ = selector => document.querySelector(selector);
const CONTENT_KEYS = [
  "site_title", "site_description", "hero_badge", "hero_eyebrow", "hero_title", "hero_subtitle", "hero_image_url",
  "intro_kicker", "intro_heading", "intro_lead", "intro_body", "feature_kicker", "feature_heading", "feature_body",
  "services_kicker", "services_heading", "service_1_title", "service_1_body", "service_2_title", "service_2_body", "service_3_title", "service_3_body",
  "stat_1_value", "stat_1_label", "stat_2_value", "stat_2_label", "stat_3_value", "stat_3_label", "stat_4_value", "stat_4_label",
  "message_kicker", "message_heading", "message_body", "contact_kicker", "contact_heading", "contact_body", "contact_address"
];

$("#year").textContent = new Date().getFullYear();
$("#todayLabel").textContent = new Intl.DateTimeFormat("gu-IN", { dateStyle: "long" }).format(new Date());

$("#menuBtn").addEventListener("click", () => $(".site-header").classList.toggle("nav-open"));
document.querySelectorAll("#mainNav a").forEach(link => link.addEventListener("click", () => $(".site-header").classList.remove("nav-open")));

const observer = new IntersectionObserver(entries => entries.forEach(entry => {
  if (entry.isIntersecting) entry.target.classList.add("visible");
}), { threshold: 0.1 });
document.querySelectorAll(".reveal").forEach(element => observer.observe(element));

function escapeHtml(value = "") {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}

function safeUrl(value) {
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function setText(selector, value) {
  if (value) $(selector).textContent = value;
}

function setHeading(selector, value) {
  if (!value) return;
  const lines = String(value).split("\n").filter(Boolean).map(escapeHtml);
  $(selector).innerHTML = lines.map((line, index) => index === lines.length - 1 && lines.length > 1 ? `<em>${line}</em>` : line).join("<br>");
}

function youtubeId(url) {
  if (!url) return null;
  const matched = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/|live\/))([^?&/]+)/);
  return matched ? matched[1] : null;
}

function embedVideo(element, url, isShort = false) {
  const id = youtubeId(url);
  if (!id) return false;
  element.innerHTML = `<iframe src="https://www.youtube.com/embed/${id}?rel=0&modestbranding=1" title="Maa Annapurna Mandir ${isShort ? "Short" : "Video"}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
  return true;
}

function applyContent(settings) {
  if (settings.site_title) document.title = settings.site_title;
  if (settings.site_description) document.querySelector('meta[name="description"]')?.setAttribute("content", settings.site_description);
  setText("#heroBadgeLabel", settings.hero_badge);
  setText("#heroEyebrow", settings.hero_eyebrow);
  setHeading(".hero h1", settings.hero_title);
  setText(".hero-copy", settings.hero_subtitle);
  const heroImage = safeUrl(settings.hero_image_url);
  if (heroImage) $(".hero-image-a").style.backgroundImage = `url("${heroImage}")`;

  setText("#introKicker", settings.intro_kicker);
  setHeading("#introHeading", settings.intro_heading);
  setText("#introLead", settings.intro_lead);
  setText("#introBody", settings.intro_body);
  setText("#featureKicker", settings.feature_kicker);
  setHeading("#featureHeading", settings.feature_heading);
  setText("#featureBody", settings.feature_body);
  setText("#servicesKicker", settings.services_kicker);
  setHeading("#servicesHeading", settings.services_heading);

  [1, 2, 3].forEach(number => {
    setText(`#service${number}Title`, settings[`service_${number}_title`]);
    setText(`#service${number}Body`, settings[`service_${number}_body`]);
  });
  [1, 2, 3, 4].forEach(number => {
    setText(`#stat${number}Value`, settings[`stat_${number}_value`]);
    setText(`#stat${number}Label`, settings[`stat_${number}_label`]);
  });

  setText("#messageKicker", settings.message_kicker);
  setHeading("#messageHeading", settings.message_heading);
  setText("#messageBody", settings.message_body);
  setText("#contactKicker", settings.contact_kicker);
  setHeading("#contactHeading", settings.contact_heading);
  setText("#contactBody", settings.contact_body);
  setText("#contactAddress", settings.contact_address);
}

function renderGallery(items) {
  if (!items?.length) return;
  $("#publicGallery").innerHTML = items.slice(0, 6).map((item, index) => {
    const url = safeUrl(item.image_url);
    if (!url) return "";
    const caption = escapeHtml(item.caption || item.category || "મા અન્નપૂર્ણા મંદિર");
    return `<figure class="${index === 0 ? "gallery-feature" : ""}"><img src="${url}" alt="${caption}" loading="lazy"><figcaption>${caption}</figcaption></figure>`;
  }).join("");
}

async function loadPublicData() {
  if (!sb) return;
  try {
    const [settings, announcements, schedule, events, gallery, videos, social] = await Promise.all([
      sb.from("site_settings").select("key,value").in("key", CONTENT_KEYS),
      sb.from("announcements").select("title,body").eq("is_published", true).order("created_at", { ascending: false }).limit(8),
      sb.from("darshan_schedule").select("name,time_text").eq("is_published", true).order("sort_order"),
      sb.from("events").select("title,event_date,date_label,description,image_url").eq("is_published", true).order("event_date", { ascending: false }).limit(6),
      sb.from("gallery").select("image_url,caption,category").eq("is_published", true).order("created_at", { ascending: false }).limit(6),
      sb.from("youtube_items").select("url,title,kind,is_featured").eq("is_published", true).order("created_at", { ascending: false }).limit(30),
      sb.from("social_settings").select("youtube_channel_url,instagram_url").limit(1).maybeSingle()
    ]);

    const settingsMap = Object.fromEntries((settings.data || []).map(item => [item.key, item.value]));
    applyContent(settingsMap);
    if (announcements.data?.length) $("#announcementTrack").textContent = announcements.data.map(item => item.body ? `${item.title}: ${item.body}` : item.title).join("  •  ");
    if (schedule.data?.length) $("#darshanSchedule").innerHTML = schedule.data.map(item => `<div class="schedule-row"><strong>${escapeHtml(item.name)}</strong><span>${escapeHtml(item.time_text)}</span></div>`).join("");
    if (events.data?.length) $("#eventGrid").innerHTML = events.data.slice(0, 3).map(item => {
      const image = safeUrl(item.image_url);
      return `<article class="event-card reveal visible"><div class="event-image">${image ? `<img src="${image}" alt="${escapeHtml(item.title)}" loading="lazy">` : '<div class="placeholder-image"><span>ઉત્સવ</span></div>'}</div><div class="event-body"><small>${escapeHtml(item.date_label || "મંદિર કાર્યક્રમ")}</small><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.description || "")}</p></div></article>`;
    }).join("");
    renderGallery(gallery.data);

    const items = videos.data || [];
    const live = items.find(item => item.kind === "live") || items.find(item => item.is_featured) || items[0];
    if (live) embedVideo($("#liveVideo"), live.url);
    const message = items.find(item => item.kind === "video" && !item.is_featured);
    if (message) embedVideo($("#messageVideo"), message.url);
    const shorts = items.filter(item => item.kind === "short").slice(0, 4);
    if (shorts.length) {
      $("#shortsGrid").innerHTML = shorts.map(item => `<div class="short-card"><div class="short-frame"></div><div class="short-meta">${escapeHtml(item.title || "YouTube Short")}</div></div>`).join("");
      shorts.forEach((item, index) => embedVideo($("#shortsGrid").children[index].querySelector(".short-frame"), item.url, true));
    }
    if (social.data?.instagram_url) $("#instagramBtn").href = safeUrl(social.data.instagram_url) || "#";
    if (social.data?.youtube_channel_url) document.querySelectorAll("#youtubeChannelBtn,.social-card[href*='youtube.com']").forEach(link => link.href = safeUrl(social.data.youtube_channel_url) || link.href);
  } catch (error) {
    console.warn("Could not load public data.", error);
  }
}

$("#enquiryForm").addEventListener("submit", async event => {
  event.preventDefault();
  const status = $("#formStatus");
  const data = Object.fromEntries(new FormData(event.target).entries());
  if (!sb) {
    status.textContent = "સેવા હાલમાં ઉપલબ્ધ નથી. કૃપા કરીને થોડા સમયમાં ફરી પ્રયાસ કરો.";
    return;
  }
  status.textContent = "સંદેશ મોકલાઈ રહ્યો છે…";
  const { error } = await sb.from("enquiries").insert(data);
  status.textContent = error ? "સંદેશ મોકલી શકાયો નથી. ફરી પ્રયાસ કરો." : "આભાર. તમારો સંદેશ સફળતાપૂર્વક મોકલાયો.";
  if (!error) event.target.reset();
});

loadPublicData();
