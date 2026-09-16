const config = window.TEMPLE_CONFIG || {};
const sb = window.supabase && config.supabaseUrl && config.supabaseKey ? window.supabase.createClient(config.supabaseUrl, config.supabaseKey) : null;
const $ = selector => document.querySelector(selector);
const $$ = selector => Array.from(document.querySelectorAll(selector));
const store = { ann: new Map(), sch: new Map(), event: new Map(), gallery: new Map(), media: new Map(), enquiry: new Map() };

const contentGroups = [
  ["Site identity & Google search", [
    ["site_title", "Website title", "text", "મા અન્નપૂર્ણા મંદિર, અંતરોલી"],
    ["site_description", "Search description", "textarea", "મા અન્નપૂર્ણા મંદિર, અંતરોલી — દર્શન, આરતી, ઉત્સવો, સેવા અને આધ્યાત્મિક માહિતી."]
  ]],
  ["Hero section", [
    ["hero_badge", "Hero badge", "text", "પાવન ધામ · અંતરોલી"],
    ["hero_eyebrow", "Hero small heading", "text", "શ્રી મા અન્નપૂર્ણા"],
    ["hero_title", "Hero main heading", "textarea", "અન્નપૂર્ણા માતાના\nપાવન દર્શન"],
    ["hero_subtitle", "Hero subtitle", "textarea", "અન્ન, સેવા અને આશીર્વાદની પવિત્ર પરંપરાથી જોડાયેલું ધામ."]
  ]],
  ["About & sacred form", [
    ["intro_kicker", "About small heading", "text", "પાવન ધામ"],
    ["intro_heading", "About heading", "textarea", "મા અન્નપૂર્ણા\nમંદિર અંતરોલી"],
    ["intro_lead", "About introduction", "textarea", "માતા અન્નપૂર્ણા સમૃદ્ધિ, અન્ન અને કરુણાના પવિત્ર સ્વરૂપ તરીકે ભક્તોના હૃદયમાં વસે છે."],
    ["intro_body", "About body", "textarea", "આ વેબસાઈટ મંદિરના દર્શન, દૈનિક આરતી, ઉત્સવો, સેવા પ્રવૃત્તિઓ અને ભક્તોને જરૂરી માહિતી એક જ સ્થળે પહોંચાડવા માટે બનાવવામાં આવી છે."],
    ["feature_kicker", "Feature small heading", "text", "માતાનું સ્વરૂપ"],
    ["feature_heading", "Feature heading", "textarea", "અન્નમાં આશીર્વાદ,\nહૃદયમાં ભક્તિ"],
    ["feature_body", "Feature body", "textarea", "માતાના પાવન દર્શન સાથે ભક્તિ અને સેવા વચ્ચેનું સુંદર જોડાણ અનુભવીએ. આ વિભાગમાં મંદિરની વિશેષ પરંપરા, સેવા અને આધ્યાત્મિક સંદેશ રજૂ કરી શકાય છે."]
  ]],
  ["Services & statistics", [
    ["services_kicker", "Services small heading", "text", "ભક્તિથી સેવા સુધી"],
    ["services_heading", "Services heading", "textarea", "મંદિરની\nસેવા અને પ્રવૃત્તિઓ"],
    ["service_1_title", "Service 1 title", "text", "દર્શન સેવા"],
    ["service_1_body", "Service 1 text", "textarea", "માતાજીના પાવન દર્શન અને આરતીની માહિતી."],
    ["service_2_title", "Service 2 title", "text", "અન્ન સેવા"],
    ["service_2_body", "Service 2 text", "textarea", "અન્નપૂર્ણા માતાની ભાવનાથી સેવા અને પ્રસાદ સાથે જોડાવાનો માર્ગ."],
    ["service_3_title", "Service 3 title", "text", "ઉત્સવ અને આરતી"],
    ["service_3_body", "Service 3 text", "textarea", "તહેવારો, વિશેષ પૂજા અને મંદિર કાર્યક્રમોની માહિતી."],
    ["stat_1_value", "Statistic 1 value", "text", "દૈનિક"], ["stat_1_label", "Statistic 1 label", "text", "દર્શન"],
    ["stat_2_value", "Statistic 2 value", "text", "નિયમિત"], ["stat_2_label", "Statistic 2 label", "text", "આરતી"],
    ["stat_3_value", "Statistic 3 value", "text", "વિશેષ"], ["stat_3_label", "Statistic 3 label", "text", "ઉત્સવો"],
    ["stat_4_value", "Statistic 4 value", "text", "સતત"], ["stat_4_label", "Statistic 4 label", "text", "સેવા ભાવ"]
  ]],
  ["Message & contact", [
    ["message_kicker", "Message small heading", "text", "માતાનો સંદેશ"],
    ["message_heading", "Message heading", "textarea", "જ્યાં અન્ન છે,\nત્યાં આશીર્વાદ છે."],
    ["message_body", "Message text", "textarea", "ભક્તિ માત્ર દર્શન નથી; તે સેવા, કરુણા અને વહેંચણીમાં પણ જીવંત બને છે."],
    ["contact_kicker", "Contact small heading", "text", "સંપર્ક"],
    ["contact_heading", "Contact heading", "textarea", "ભક્તો માટે\nસહાય અને માહિતી"],
    ["contact_body", "Contact text", "textarea", "દાન, સેવા, કાર્યક્રમ, દર્શન અથવા અન્ય મંદિર સંબંધિત પૂછપરછ માટે સંદેશ મોકલો."],
    ["contact_address", "Temple address", "textarea", "મા અન્નપૂર્ણા મંદિર, અંતરોલી, ગુજરાત"]
  ]]
];

function status(selector, message, type) {
  const element = $(selector);
  element.textContent = message || "";
  element.className = "form-status" + (type ? " " + type : "");
}

function ready(selector) {
  if (sb) return true;
  status(selector, "Supabase configuration is missing.", "error");
  return false;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function showView(view) {
  $$("aside nav button").forEach(button => button.classList.toggle("active", button.dataset.view === view));
  $$(".view").forEach(section => section.hidden = section.id !== view);
  const loader = { dashboard: loadCounts, content: loadContent, hero: loadHero, announcements: loadAnnouncements, darshan: loadSchedule, events: loadEvents, gallery: loadGallery, media: loadMedia, social: loadSocial, enquiries: loadEnquiries }[view];
  if (loader) loader();
}

function renderContentFields() {
  const target = $("#contentFields");
  target.replaceChildren();
  contentGroups.forEach(group => {
    const fieldset = element("fieldset");
    fieldset.append(element("legend", "", group[0]));
    const grid = element("div", "field-grid");
    group[1].forEach(field => {
      const label = element("label", "", field[1]);
      const input = document.createElement(field[2] === "textarea" ? "textarea" : "input");
      input.dataset.setting = field[0];
      if (input.tagName === "TEXTAREA") input.rows = 3;
      else input.type = "text";
      label.append(input);
      grid.append(label);
    });
    fieldset.append(grid);
    target.append(fieldset);
  });
}

async function saveSettings(entries) {
  return sb.from("site_settings").upsert(entries.map(entry => ({ key: entry[0], value: entry[1], updated_at: new Date().toISOString() })), { onConflict: "key" });
}

async function loadContent() {
  if (!sb) return;
  const keys = contentGroups.flatMap(group => group[1].map(field => field[0]));
  const defaults = Object.fromEntries(contentGroups.flatMap(group => group[1].map(field => [field[0], field[3]])));
  const { data, error } = await sb.from("site_settings").select("key,value").in("key", keys);
  if (error) return status("#contentStatus", error.message, "error");
  const values = Object.assign({}, defaults, Object.fromEntries((data || []).map(item => [item.key, item.value])));
  $$("[data-setting]").forEach(input => input.value = values[input.dataset.setting] || "");
}

async function loadHero() {
  if (!sb) return;
  const { data, error } = await sb.from("site_settings").select("value").eq("key", "hero_image_url").maybeSingle();
  if (error) return status("#heroStatus", error.message, "error");
  $("#heroImageUrl").value = data ? data.value : "";
}

async function uploadImage(file, folder) {
  const path = folder + "/" + Date.now() + "-" + crypto.randomUUID() + "-" + file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
  const { error } = await sb.storage.from("temple-gallery").upload(path, file, { upsert: false });
  if (error) throw error;
  return { path, url: sb.storage.from("temple-gallery").getPublicUrl(path).data.publicUrl };
}

$$("aside nav button").forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
$$("[data-jump]").forEach(button => button.addEventListener("click", () => showView(button.dataset.jump)));
$("#logout").addEventListener("click", async () => {
  if (sb) await sb.auth.signOut();
  location.reload();
});

$("#loginForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!ready("#loginStatus")) return;
  status("#loginStatus", "Signing in…");
  const { data, error } = await sb.auth.signInWithPassword({ email: $("#email").value.trim(), password: $("#password").value });
  if (error) return status("#loginStatus", error.message, "error");
  const role = await sb.rpc("is_temple_admin");
  if (role.error || !role.data) {
    await sb.auth.signOut();
    return status("#loginStatus", "This account does not have temple admin access.", "error");
  }
  $("#loginView").hidden = true;
  $("#appView").hidden = false;
  $("#userEmail").textContent = data.user.email || "";
  showView("dashboard");
});

$("#contentForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!ready("#contentStatus")) return;
  status("#contentStatus", "Saving homepage content…");
  const { error } = await saveSettings($$("[data-setting]").map(input => [input.dataset.setting, input.value.trim()]));
  status("#contentStatus", error ? error.message : "Homepage content published.", error ? "error" : "success");
});

$("#heroForm").addEventListener("submit", async event => {
  event.preventDefault();
  if (!ready("#heroStatus")) return;
  let url = $("#heroImageUrl").value.trim();
  const file = $("#heroFile").files[0];
  try {
    status("#heroStatus", file ? "Uploading hero image…" : "Saving hero image…");
    if (file) url = (await uploadImage(file, "hero")).url;
    if (!/^https?:\/\//.test(url)) return status("#heroStatus", "Add a valid image URL or choose an image file.", "error");
    const { error } = await saveSettings([["hero_image_url", url]]);
    if (!error) $("#heroImageUrl").value = url;
    status("#heroStatus", error ? error.message : "Hero image published.", error ? "error" : "success");
  } catch (error) {
    status("#heroStatus", error.message || "Upload failed.", "error");
  }
});

function formatDate(value) {
  return value ? new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value)) : "No date";
}

function actionButton(text, action, id, danger) {
  const button = element("button", danger ? "danger" : "", text);
  button.type = "button";
  button.dataset.action = action;
  button.dataset.id = id;
  return button;
}

function rowActions(type, item) {
  const actions = element("div", "row-actions");
  actions.append(element("span", "publish-state " + (item.is_published ? "live" : "draft"), item.is_published ? "Published" : "Draft"));
  actions.append(actionButton("Edit", "edit-" + type, item.id));
  actions.append(actionButton(item.is_published ? "Unpublish" : "Publish", "toggle-" + type, item.id));
  actions.append(actionButton("Delete", "delete-" + type, item.id, true));
  return actions;
}

function resetForm(prefix, published) {
  $("#" + prefix + "Form").reset();
  $("#" + prefix + "EditId").value = "";
  const checkbox = $("#" + prefix + "Published");
  if (checkbox) checkbox.checked = published !== false;
  $("#" + prefix + "Cancel").hidden = true;
  status("#" + prefix + "Status", "");
}

function startEdit(prefix, item, values) {
  $("#" + prefix + "EditId").value = item.id;
  Object.entries(values).forEach(([id, value]) => {
    const input = $("#" + id);
    if (input.type === "checkbox") input.checked = Boolean(value);
    else input.value = value || "";
  });
  $("#" + prefix + "Cancel").hidden = false;
  status("#" + prefix + "Status", "Editing this item.");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRecords(targetSelector, items, type, createContent) {
  const target = $(targetSelector);
  target.replaceChildren();
  if (!items.length) {
    target.append(element("p", "empty-state", "No items yet."));
    return;
  }
  items.forEach(item => {
    const row = element("article", "record-row");
    row.append(createContent(item));
    row.append(rowActions(type, item));
    target.append(row);
  });
}

async function loadCounts() {
  if (!sb) return;
  const [media, gallery, enquiries] = await Promise.all([
    sb.from("youtube_items").select("*", { count: "exact", head: true }),
    sb.from("gallery").select("*", { count: "exact", head: true }),
    sb.from("enquiries").select("*", { count: "exact", head: true })
  ]);
  $("#mediaCount").textContent = media.count || 0;
  $("#galleryCount").textContent = gallery.count || 0;
  $("#inqCount").textContent = enquiries.count || 0;
}

async function loadAnnouncements() {
  const { data, error } = await sb.from("announcements").select("*").order("created_at", { ascending: false }).limit(50);
  if (error) return $("#annList").textContent = error.message;
  const items = data || [];
  store.ann = new Map(items.map(item => [item.id, item]));
  renderRecords("#annList", items, "ann", item => {
    const content = element("div");
    content.append(element("b", "", item.title));
    if (item.body) content.append(element("p", "", item.body));
    content.append(element("small", "", formatDate(item.created_at)));
    return content;
  });
}

async function loadSchedule() {
  const { data, error } = await sb.from("darshan_schedule").select("*").order("sort_order").limit(50);
  if (error) return $("#schList").textContent = error.message;
  const items = data || [];
  store.sch = new Map(items.map(item => [item.id, item]));
  renderRecords("#schList", items, "sch", item => {
    const content = element("div");
    content.append(element("b", "", item.name));
    content.append(element("p", "", item.time_text + " · Display order " + item.sort_order));
    return content;
  });
}

async function loadEvents() {
  const { data, error } = await sb.from("events").select("*").order("event_date", { ascending: false }).limit(50);
  if (error) return $("#eventList").textContent = error.message;
  const items = data || [];
  store.event = new Map(items.map(item => [item.id, item]));
  renderRecords("#eventList", items, "event", item => {
    const content = element("div");
    content.append(element("b", "", item.title));
    content.append(element("p", "", (item.date_label || "Event") + " · " + formatDate(item.event_date)));
    if (item.description) content.append(element("small", "", item.description));
    return content;
  });
}

async function loadGallery() {
  const { data, error } = await sb.from("gallery").select("*").order("created_at", { ascending: false }).limit(80);
  if (error) return $("#galleryGrid").textContent = error.message;
  const items = data || [];
  store.gallery = new Map(items.map(item => [item.id, item]));
  const target = $("#galleryGrid");
  target.replaceChildren();
  if (!items.length) {
    target.append(element("p", "empty-state", "No gallery images yet."));
    return;
  }
  items.forEach(item => {
    const card = element("article", "gallery-item");
    const image = document.createElement("img");
    image.src = item.image_url;
    image.alt = item.caption || item.category;
    card.append(image);
    const content = element("div");
    content.append(element("b", "", item.caption || "Untitled image"));
    content.append(element("small", "", item.category));
    content.append(rowActions("gallery", item));
    card.append(content);
    target.append(card);
  });
}

async function loadMedia() {
  const { data, error } = await sb.from("youtube_items").select("*").order("created_at", { ascending: false }).limit(60);
  if (error) return $("#ytList").textContent = error.message;
  const items = data || [];
  store.media = new Map(items.map(item => [item.id, item]));
  renderRecords("#ytList", items, "media", item => {
    const content = element("div");
    content.append(element("b", "", item.title || "Untitled"));
    content.append(element("p", "", item.kind + (item.is_featured ? " · Featured homepage media" : "")));
    content.append(element("small", "", item.url));
    return content;
  });
}

async function loadSocial() {
  const { data, error } = await sb.from("social_settings").select("*").limit(1).maybeSingle();
  if (error) return status("#socialStatus", error.message, "error");
  $("#youtubeUrl").value = data ? data.youtube_channel_url : "";
  $("#instagramUrl").value = data ? data.instagram_url : "";
}

async function loadEnquiries() {
  const { data, error } = await sb.from("enquiries").select("*").order("created_at", { ascending: false }).limit(100);
  if (error) return $("#enquiryList").textContent = error.message;
  const items = data || [];
  store.enquiry = new Map(items.map(item => [item.id, item]));
  const target = $("#enquiryList");
  target.replaceChildren();
  if (!items.length) {
    target.append(element("p", "empty-state", "No enquiries yet."));
    return;
  }
  items.forEach(item => {
    const row = element("article", "enquiry");
    const top = element("div", "enquiry-top");
    const details = element("div");
    details.append(element("b", "", item.name));
    details.append(element("span", "", item.mobile));
    details.append(element("span", "", item.enquiry_type));
    top.append(details);
    top.append(actionButton("Delete", "delete-enquiry", item.id, true));
    row.append(top);
    row.append(element("small", "", (item.email || "No email") + " · " + formatDate(item.created_at)));
    row.append(element("p", "", item.message));
    target.append(row);
  });
}

async function toggleItem(table, item, reload) {
  const { error } = await sb.from(table).update({ is_published: !item.is_published, updated_at: new Date().toISOString() }).eq("id", item.id);
  if (error) return alert(error.message);
  reload();
}

async function removeItem(table, id, reload, storagePath) {
  if (!confirm("Delete this item permanently?")) return;
  if (storagePath) {
    const result = await sb.storage.from("temple-gallery").remove([storagePath]);
    if (result.error) return alert(result.error.message);
  }
  const { error } = await sb.from(table).delete().eq("id", id);
  if (error) return alert(error.message);
  reload();
  loadCounts();
}

renderContentFields();
