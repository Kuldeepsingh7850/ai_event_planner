/**
 * JAGAH — AI Event Planner
 * Professional & Modern PPT Generator Script
 * Premium Light Theme, High-End Card Layouts, Shape Mockups
 * No embedded screenshot files (uses beautiful modern placeholders with generous space)
 */

const pptxgen = require("pptxgenjs");
const path = require("path");

const prs = new pptxgen();
prs.layout = "LAYOUT_WIDE";

// ─── Modern Color Palette (Tailwind Slate / Ice Blue) ─────────────
const C = {
  BG:           "F8FAFC",  // Slate 50 - extremely light grey/blue for background
  WHITE:        "FFFFFF",  // Card background
  CARD_BORDER:  "E2E8F0",  // Slate 200 - light border
  TITLE:        "0F172A",  // Slate 900 - dark title
  TEXT:         "334155",  // Slate 700 - medium body text
  SUBTITLE:     "64748B",  // Slate 500 - muted text
  ACCENT:       "3B82F6",  // Blue 500 - primary accent (modern blue)
  ACCENT_LIGHT: "EFF6FF",  // Blue 50 - light highlight
  ACCENT_BORDER:"BFDBFE",  // Blue 200 - accent border
  PURPLE:       "8B5CF6",  // Purple 500 - secondary accent for admin
  PURPLE_LIGHT: "F5F3FF",  // Purple 50
  GREEN:        "10B981",  // Green 500 - success / roadmap accent
  GREEN_LIGHT:  "ECFDF5",  // Green 50
  ORANGE:       "F59E0B",  // Orange 500
  BG_DECO_1:    "E0F2FE",  // Sky 100 - soft shapes
  BG_DECO_2:    "E0E7FF",  // Indigo 100 - soft shapes
};

// ─── Helpers ────────────────────────────────────────────────────

function addSlideNum(slide, num, total = 18) {
  slide.addText(`${num} / ${total}`, {
    x: 11.8, y: 7.05, w: 1.2, h: 0.3,
    fontSize: 9, color: C.SUBTITLE, fontFace: "Segoe UI", align: "right",
  });
}

function applySlideTheme(slide, title, category = "JAGAH — AI Event Planner") {
  slide.background = { fill: C.BG };
  
  // Decorative background shapes (very subtle)
  // Top right subtle oval
  slide.addShape(prs.shapes.OVAL, {
    x: 11.0, y: -1.0, w: 4.0, h: 4.0,
    fill: { color: C.BG_DECO_1, transparency: 85 },
    line: { width: 0 },
  });
  // Bottom left subtle oval
  slide.addShape(prs.shapes.OVAL, {
    x: -2.0, y: 5.5, w: 5.0, h: 5.0,
    fill: { color: C.BG_DECO_2, transparency: 85 },
    line: { width: 0 },
  });

  if (title) {
    // Left vertical indicator bar
    slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
      x: 0.6, y: 0.5, w: 0.08, h: 0.6,
      fill: { color: C.ACCENT }, line: { width: 0 },
      rectRadius: 0.5,
    });

    // Slide Title
    slide.addText(title, {
      x: 0.85, y: 0.42, w: 8.0, h: 0.7,
      fontSize: 28, color: C.TITLE, bold: true,
      fontFace: "Segoe UI",
    });

    // Top right category
    slide.addText(category.toUpperCase(), {
      x: 9.0, y: 0.5, w: 3.5, h: 0.4,
      fontSize: 9, color: C.SUBTITLE, bold: true,
      fontFace: "Segoe UI", align: "right",
    });
  }
}

function addCard(slide, x, y, w, h, options = {}) {
  const borderColor = options.accentBorder ? C.ACCENT_BORDER : C.CARD_BORDER;
  const fill = options.bgColor || C.WHITE;
  
  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: fill },
    line: { color: borderColor, width: 1 },
    rectRadius: 0.04, // Very clean minimal rounded corner
    shadow: { type: "outer", blur: 10, offset: 3, color: "000000", opacity: 0.04 },
  });

  // Top accent bar if requested
  if (options.topBarColor) {
    slide.addShape(prs.shapes.RECTANGLE, {
      x: x + 0.01, y: y + 0.01, w: w - 0.02, h: 0.08,
      fill: { color: options.topBarColor }, line: { width: 0 },
    });
  }
}

function addBrowserPlaceholder(slide, x, y, w, h, title) {
  // Main container (outer frame)
  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: C.WHITE },
    line: { color: C.CARD_BORDER, width: 1.5 },
    rectRadius: 0.04,
    shadow: { type: "outer", blur: 12, offset: 4, color: "000000", opacity: 0.06 },
  });

  // Browser Header Bar background
  const headerHeight = 0.35;
  slide.addShape(prs.shapes.RECTANGLE, {
    x: x + 0.01, y: y + 0.01, w: w - 0.02, h: headerHeight,
    fill: { color: "F1F5F9" }, // Light slate header
    line: { width: 0 },
  });

  // Divider line
  slide.addShape(prs.shapes.RECTANGLE, {
    x: x, y: y + headerHeight + 0.01, w: w, h: 0.015,
    fill: { color: C.CARD_BORDER }, line: { width: 0 },
  });

  // Mac control buttons (Red, Yellow, Green circles)
  const dotSize = 0.08;
  const dotY = y + 0.14;
  slide.addShape(prs.shapes.OVAL, {
    x: x + 0.15, y: dotY, w: dotSize, h: dotSize,
    fill: { color: "EF4444" }, line: { width: 0 },
  });
  slide.addShape(prs.shapes.OVAL, {
    x: x + 0.28, y: dotY, w: dotSize, h: dotSize,
    fill: { color: "F59E0B" }, line: { width: 0 },
  });
  slide.addShape(prs.shapes.OVAL, {
    x: x + 0.41, y: dotY, w: dotSize, h: dotSize,
    fill: { color: "10B981" }, line: { width: 0 },
  });

  // Small browser URL bar
  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x: x + 0.8, y: y + 0.07, w: w - 1.2, h: 0.2,
    fill: { color: C.WHITE },
    line: { color: C.CARD_BORDER, width: 0.5 },
    rectRadius: 0.1,
  });
  slide.addText("https://jagah-event-planner.local/" + title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), {
    x: x + 0.9, y: y + 0.07, w: w - 1.4, h: 0.2,
    fontSize: 7.5, color: C.SUBTITLE, fontFace: "Segoe UI",
    valign: "middle",
  });

  // Inner placeholder background (soft blue-gray area with camera icon text)
  const innerMargin = 0.15;
  const innerX = x + innerMargin;
  const innerY = y + headerHeight + innerMargin + 0.02;
  const innerW = w - (innerMargin * 2);
  const innerH = h - headerHeight - (innerMargin * 2) - 0.02;

  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x: innerX, y: innerY, w: innerW, h: innerH,
    fill: { color: "F8FAFC" },
    line: { color: "CBD5E1", width: 1.0, dashType: "dash" },
    rectRadius: 0.03,
  });

  // Placeholder Icon / Text
  slide.addText("📷 [ Screen Snapshot Placeholder ]", {
    x: innerX + 0.2, y: innerY + (innerH / 2) - 0.4, w: innerW - 0.4, h: 0.4,
    fontSize: 13, color: C.ACCENT, bold: true, fontFace: "Segoe UI", align: "center",
  });
  slide.addText(`Drop '${title}' Desktop screenshot here`, {
    x: innerX + 0.2, y: innerY + (innerH / 2), w: innerW - 0.4, h: 0.4,
    fontSize: 10, color: C.SUBTITLE, fontFace: "Segoe UI", align: "center",
  });
}

function addMobilePlaceholder(slide, x, y, w, h, title) {
  // Phone outer body
  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x, y, w, h,
    fill: { color: "0F172A" }, // Dark Slate/Black phone frame
    line: { color: "334155", width: 1 },
    rectRadius: 0.06,
    shadow: { type: "outer", blur: 15, offset: 5, color: "000000", opacity: 0.1 },
  });

  // Speaker notch at the top
  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x: x + (w / 2) - 0.4, y: y + 0.12, w: 0.8, h: 0.12,
    fill: { color: "334155" }, line: { width: 0 },
    rectRadius: 0.5,
  });

  // Screen area
  const screenMargin = 0.12;
  const screenX = x + screenMargin;
  const screenY = y + 0.35;
  const screenW = w - (screenMargin * 2);
  const screenH = h - 0.35 - 0.3; // leaves space at bottom

  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x: screenX, y: screenY, w: screenW, h: screenH,
    fill: { color: "F8FAFC" },
    line: { color: "CBD5E1", width: 1.0, dashType: "dash" },
    rectRadius: 0.02,
  });

  // Bottom home indicator bar
  slide.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x: x + (w / 2) - 0.5, y: y + h - 0.15, w: 1.0, h: 0.04,
    fill: { color: "334155" }, line: { width: 0 },
    rectRadius: 0.5,
  });

  // Inner placeholder text
  slide.addText("📱 Mobile Screenshot", {
    x: screenX + 0.1, y: screenY + (screenH / 2) - 0.5, w: screenW - 0.2, h: 0.4,
    fontSize: 11, color: C.ACCENT, bold: true, fontFace: "Segoe UI", align: "center",
  });
  slide.addText(`[ ${title} ]`, {
    x: screenX + 0.1, y: screenY + (screenH / 2), w: screenW - 0.2, h: 0.6,
    fontSize: 9, color: C.SUBTITLE, fontFace: "Segoe UI", align: "center",
  });
}


// ═════════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE (MODERN SPLIT DESIGN WITH VECTOR MOCKUP)
// ═════════════════════════════════════════════════════════════════

let s1 = prs.addSlide();
s1.background = { fill: C.BG };

// Overlapping background shapes for a final premium touch
s1.addShape(prs.shapes.OVAL, {
  x: -1.5, y: -1.5, w: 5.5, h: 5.5,
  fill: { color: C.BG_DECO_1, transparency: 75 }, line: { width: 0 },
});
s1.addShape(prs.shapes.OVAL, {
  x: 4.5, y: 4.5, w: 5.0, h: 5.0,
  fill: { color: C.BG_DECO_2, transparency: 80 }, line: { width: 0 },
});

// Left Side Content
s1.addText("MAJOR PROJECT PRESENTATION ON", {
  x: 0.8, y: 1.6, w: 5.5, h: 0.4,
  fontSize: 13, color: C.ACCENT, bold: true, fontFace: "Segoe UI",
});

s1.addText("JAGAH — AI Event Planner", {
  x: 0.8, y: 2.0, w: 5.5, h: 1.2,
  fontSize: 38, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

s1.addText("An intelligent web application for event coordination, budget tracking, and custom recommendations powered by LLM Orchestration.", {
  x: 0.8, y: 3.2, w: 5.5, h: 1.0,
  fontSize: 13.5, color: C.TEXT, fontFace: "Segoe UI",
  lineSpacingMultiple: 1.2,
});

// Horizontal dividing accent line
s1.addShape(prs.shapes.RECTANGLE, {
  x: 0.8, y: 4.4, w: 4.5, h: 0.02,
  fill: { color: C.CARD_BORDER }, line: { width: 0 },
});

// Submitted By details in a beautiful modern layout
s1.addText("SUBMITTED BY:", {
  x: 0.8, y: 4.7, w: 5.0, h: 0.25,
  fontSize: 9, color: C.SUBTITLE, bold: true, fontFace: "Segoe UI",
});

s1.addText("Mangal Sharma", {
  x: 0.8, y: 4.95, w: 5.0, h: 0.35,
  fontSize: 17, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

s1.addText("Major Project Submission (BCA)", {
  x: 0.8, y: 5.3, w: 5.0, h: 0.3,
  fontSize: 11.5, color: C.TEXT, fontFace: "Segoe UI",
});

// Right Side - Interactive Dashboard Mockup using Shapes
// Outer Frame
addCard(s1, 7.0, 1.4, 5.0, 4.4, { accentBorder: true });

// Mock Browser Header
s1.addShape(prs.shapes.RECTANGLE, {
  x: 7.01, y: 1.41, w: 4.98, h: 0.35,
  fill: { color: "F1F5F9" }, line: { width: 0 },
});
const dY = 1.54;
s1.addShape(prs.shapes.OVAL, { x: 7.15, y: dY, w: 0.08, h: 0.08, fill: { color: "EF4444" }, line: { width: 0 } });
s1.addShape(prs.shapes.OVAL, { x: 7.28, y: dY, w: 0.08, h: 0.08, fill: { color: "F59E0B" }, line: { width: 0 } });
s1.addShape(prs.shapes.OVAL, { x: 7.41, y: dY, w: 0.08, h: 0.08, fill: { color: "10B981" }, line: { width: 0 } });

s1.addText("JAGAH Dashboard", {
  x: 7.6, y: 1.41, w: 4.0, h: 0.35,
  fontSize: 9, color: C.SUBTITLE, bold: true, fontFace: "Segoe UI", valign: "middle",
});

// Mock Stats Cards
addCard(s1, 7.3, 2.0, 2.1, 1.0, { bgColor: C.ACCENT_LIGHT, accentBorder: true });
s1.addText("TOTAL BUDGET", { x: 7.4, y: 2.1, w: 1.9, h: 0.2, fontSize: 8, color: C.ACCENT, bold: true, fontFace: "Segoe UI" });
s1.addText("₹1,50,000", { x: 7.4, y: 2.3, w: 1.9, h: 0.3, fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI" });
s1.addText("15 Expenses Logged", { x: 7.4, y: 2.6, w: 1.9, h: 0.2, fontSize: 8, color: C.SUBTITLE, fontFace: "Segoe UI" });

addCard(s1, 9.6, 2.0, 2.1, 1.0, { bgColor: C.GREEN_LIGHT, accentBorder: false });
s1.addText("GUEST RSVPs", { x: 9.7, y: 2.1, w: 1.9, h: 0.2, fontSize: 8, color: C.GREEN, bold: true, fontFace: "Segoe UI" });
s1.addText("84 / 120", { x: 9.7, y: 2.3, w: 1.9, h: 0.3, fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI" });
s1.addText("70% Confirmed", { x: 9.7, y: 2.6, w: 1.9, h: 0.2, fontSize: 8, color: C.SUBTITLE, fontFace: "Segoe UI" });

// Mock AI Suggestion Card
addCard(s1, 7.3, 3.2, 4.4, 2.2, { bgColor: C.WHITE, accentBorder: false });
s1.addShape(prs.shapes.RECTANGLE, { x: 7.31, y: 3.21, w: 4.38, h: 0.08, fill: { color: C.PURPLE }, line: { width: 0 } });
s1.addText("🪄 AI EVENT PLANNER SUGGESTIONS", {
  x: 7.5, y: 3.4, w: 4.0, h: 0.3,
  fontSize: 9, color: C.PURPLE, bold: true, fontFace: "Segoe UI",
});
s1.addText("Theme: Classic Royal Gold & Ivory\nVenue Option: Shanti Garden, Agra\nMenu Style: Indo-Italian Fusion", {
  x: 7.5, y: 3.8, w: 4.0, h: 0.9,
  fontSize: 10, color: C.TEXT, fontFace: "Segoe UI",
  lineSpacingMultiple: 1.2,
});
addCard(s1, 7.5, 4.8, 1.6, 0.4, { bgColor: C.PURPLE_LIGHT, accentBorder: false });
s1.addText("Regenerate Menu", {
  x: 7.5, y: 4.8, w: 1.6, h: 0.4,
  fontSize: 9, color: C.PURPLE, bold: true, fontFace: "Segoe UI", align: "center", valign: "middle",
});
addCard(s1, 9.3, 4.8, 1.6, 0.4, { bgColor: C.ACCENT_LIGHT, accentBorder: false });
s1.addText("Apply Theme", {
  x: 9.3, y: 4.8, w: 1.6, h: 0.4,
  fontSize: 9, color: C.ACCENT, bold: true, fontFace: "Segoe UI", align: "center", valign: "middle",
});

addSlideNum(s1, 1);


// ═════════════════════════════════════════════════════════════════
// SLIDE 2 — TABLE OF CONTENTS (GRID SYSTEM)
// ═════════════════════════════════════════════════════════════════

let s2 = prs.addSlide();
applySlideTheme(s2, "Table of Contents");

const groups = [
  { num: "01", title: "PROJECT OVERVIEW", items: ["Introduction", "Project Objectives", "System Functionalities"] },
  { num: "02", title: "SYSTEM ARCHITECTURE", items: ["Technology Stack", "Software Requirements", "Hardware Requirements"] },
  { num: "03", title: "DATABASE & WORKFLOWS", items: ["Database Design (MySQL)", "User & Admin Workflows"] },
  { num: "04", title: "SYSTEM SNAPSHOTS", items: ["Desktop Homepage & Entry", "Dashboard & Event Details", "AI Recommendations & Admin", "Mobile Responsive Design"] },
  { num: "05", title: "SUMMARY", items: ["Conclusion & Achievements", "Future Scope & Roadmap", "Q&A Session"] },
];

groups.forEach((g, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.6 + col * 4.1;
  const y = 1.6 + row * 2.7;
  const w = 3.8;
  const h = 2.4;

  addCard(s2, x, y, w, h, { topBarColor: C.ACCENT });

  // Big group number in top right
  s2.addText(g.num, {
    x: x + w - 0.9, y: y + 0.15, w: 0.7, h: 0.4,
    fontSize: 20, color: C.ACCENT_BORDER, bold: true, fontFace: "Segoe UI", align: "right",
  });

  // Group title
  s2.addText(g.title, {
    x: x + 0.2, y: y + 0.2, w: 2.8, h: 0.35,
    fontSize: 13, color: C.TITLE, bold: true, fontFace: "Segoe UI",
  });

  // Items
  g.items.forEach((item, idx) => {
    s2.addText(`•  ${item}`, {
      x: x + 0.2, y: y + 0.75 + idx * 0.38, w: w - 0.4, h: 0.3,
      fontSize: 11, color: C.TEXT, fontFace: "Segoe UI",
    });
  });
});

addSlideNum(s2, 2);


// ═════════════════════════════════════════════════════════════════
// SLIDE 3 — INTRODUCTION (SPLIT CARD LAYOUT)
// ═════════════════════════════════════════════════════════════════

let s3 = prs.addSlide();
applySlideTheme(s3, "Introduction");

// Left highlighted panel
addCard(s3, 0.6, 1.6, 5.2, 5.0, { bgColor: C.ACCENT_LIGHT, accentBorder: true });
s3.addText("JAGAH is an AI-orchestrated event management application designed to centralize event planning and offer intelligent automation while maintaining database high availability.", {
  x: 1.0, y: 2.2, w: 4.4, h: 3.5,
  fontSize: 18, color: C.TEXT, fontFace: "Segoe UI",
  lineSpacingMultiple: 1.3,
});

// Right stack of cards
const introCards = [
  { title: "Unified Management Dashboard", desc: "Consolidates RSVP tracking, guest lists, task checklists, vendors, and expenses in one single real-time portal." },
  { title: "Multi-LLM Suggestion Engine", desc: "Integrates Google Gemini, Groq, and Grok APIs to generate customized themes, menus, and timelines instantly." },
  { title: "Resilient Dual-Mode Storage", desc: "Features a fallback SQL emulator that dynamically activates when MySQL is offline, enabling zero-config execution." },
];

introCards.forEach((c, i) => {
  const y = 1.6 + i * 1.7;
  addCard(s3, 6.2, y, 6.2, 1.5);
  
  // Left border line inside card
  s3.addShape(prs.shapes.RECTANGLE, {
    x: 6.21, y: y + 0.1, w: 0.08, h: 1.3,
    fill: { color: i === 0 ? C.ACCENT : i === 1 ? C.PURPLE : C.GREEN }, line: { width: 0 },
  });

  s3.addText(c.title, {
    x: 6.5, y: y + 0.15, w: 5.5, h: 0.3,
    fontSize: 14, color: C.TITLE, bold: true, fontFace: "Segoe UI",
  });

  s3.addText(c.desc, {
    x: 6.5, y: y + 0.5, w: 5.5, h: 0.8,
    fontSize: 11, color: C.TEXT, fontFace: "Segoe UI",
    lineSpacingMultiple: 1.15, valign: "top",
  });
});

addSlideNum(s3, 3);


// ═════════════════════════════════════════════════════════════════
// SLIDE 4 — OBJECTIVES (GRID BADGE CARDS)
// ═════════════════════════════════════════════════════════════════

let s4 = prs.addSlide();
applySlideTheme(s4, "Project Objectives");

const objectives = [
  { num: "01", title: "Centralized CRUD", desc: "Enable full management of guest RSVPs, budgets, schedules, checklist deadlines, and vendor directories in a single database." },
  { num: "02", title: "AI Suggestions", desc: "Employ advanced LLM models (Gemini, Groq, Grok) to auto-generate personalized themes, menus, vendor types, and timelines." },
  { num: "03", title: "Interactive AI Chat", desc: "Embed a contextual chat assistant in the frontend that answers queries and updates planning components interactively." },
  { num: "04", title: "JWT & OAuth Security", desc: "Protect user accounts using stateless JSON Web Tokens (JWT), bcrypt password hashing, and Google OAuth 2.0 logins." },
  { num: "05", title: "SQL Mock Fallback", desc: "Build an active database driver fallback that mimics SQL queries in memory, allowing instant local developer setup." },
  { num: "06", title: "Moderation Controls", desc: "Provide admins with a comprehensive panel to monitor platform stats, toggle user status, alter roles, and audit events." },
];

objectives.forEach((obj, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.6 + col * 4.1;
  const y = 1.6 + row * 2.7;
  const w = 3.8;
  const h = 2.4;

  addCard(s4, x, y, w, h);

  // Tiny accent badge
  s4.addShape(prs.shapes.ROUNDED_RECTANGLE, {
    x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.4,
    fill: { color: C.ACCENT_LIGHT },
    line: { color: C.ACCENT_BORDER, width: 0.5 },
    rectRadius: 0.2,
  });
  s4.addText(obj.num, {
    x: x + 0.2, y: y + 0.2, w: 0.6, h: 0.4,
    fontSize: 11, color: C.ACCENT, bold: true, fontFace: "Segoe UI", align: "center", valign: "middle",
  });

  s4.addText(obj.title, {
    x: x + 0.95, y: y + 0.23, w: 2.65, h: 0.35,
    fontSize: 13, color: C.TITLE, bold: true, fontFace: "Segoe UI",
  });

  s4.addText(obj.desc, {
    x: x + 0.2, y: y + 0.8, w: 3.4, h: 1.4,
    fontSize: 10.5, color: C.TEXT, fontFace: "Segoe UI",
    lineSpacingMultiple: 1.15, valign: "top",
  });
});

addSlideNum(s4, 4);


// ═════════════════════════════════════════════════════════════════
// SLIDE 5 — TECH STACK (COLUMN CARDS SYSTEM)
// ═════════════════════════════════════════════════════════════════

let s5 = prs.addSlide();
applySlideTheme(s5, "Technology Stack");

const techStack = [
  {
    title: "Frontend & Styling",
    color: C.ACCENT,
    techs: [
      { name: "Next.js (React)", desc: "Client-side SPA architecture with Pages Router." },
      { name: "Tailwind CSS v4", desc: "Utility-first modern layout, variables, dark/light toggle." },
      { name: "Axios", desc: "Promise-based HTTP client for calling backend endpoints." }
    ]
  },
  {
    title: "Backend API",
    color: C.PURPLE,
    techs: [
      { name: "Node.js Runtime", desc: "Asynchronous, event-driven JavaScript environment." },
      { name: "Express.js Framework", desc: "Minimalist server, router, and middleware controller." },
      { name: "CORS & dotenv", desc: "Cross-origin resource sharing and environment management." }
    ]
  },
  {
    title: "Data Storage",
    color: C.GREEN,
    techs: [
      { name: "MySQL 8.0 Database", desc: "Primary relational storage with transactional support." },
      { name: "In-Memory SQL Mock", desc: "Local database simulation, no system config required." },
      { name: "InnoDB Engine", desc: "Enforces strict ACID properties and foreign key safety." }
    ]
  },
  {
    title: "Intelligence & Auth",
    color: C.ORANGE,
    techs: [
      { name: "LLM Orchestration", desc: "Calls Google Gemini, Groq, and Grok APIs." },
      { name: "JWT Sessions", desc: "Secure token-based logins stored locally on client." },
      { name: "bcryptjs", desc: "High-entropy salt hashing for storing secure passwords." }
    ]
  }
];

techStack.forEach((cat, i) => {
  const x = 0.6 + i * 3.05;
  const y = 1.6;
  const w = 2.85;
  const h = 5.0;

  addCard(s5, x, y, w, h);

  // Top header color indicator bar
  s5.addShape(prs.shapes.RECTANGLE, {
    x: x + 0.01, y: y + 0.01, w: w - 0.02, h: 0.12,
    fill: { color: cat.color }, line: { width: 0 },
  });

  // Category Title
  s5.addText(cat.title.toUpperCase(), {
    x: x + 0.15, y: y + 0.25, w: w - 0.3, h: 0.4,
    fontSize: 12, color: C.TITLE, bold: true, fontFace: "Segoe UI",
  });

  // Divider
  s5.addShape(prs.shapes.RECTANGLE, {
    x: x + 0.15, y: y + 0.7, w: w - 0.3, h: 0.015,
    fill: { color: C.CARD_BORDER }, line: { width: 0 },
  });

  // Technologies list
  cat.techs.forEach((t, idx) => {
    const tY = y + 0.85 + idx * 1.35;
    
    // Tech name
    s5.addText(t.name, {
      x: x + 0.15, y: tY, w: w - 0.3, h: 0.25,
      fontSize: 11, color: cat.color, bold: true, fontFace: "Segoe UI",
    });
    
    // Tech desc
    s5.addText(t.desc, {
      x: x + 0.15, y: tY + 0.26, w: w - 0.3, h: 0.9,
      fontSize: 9.5, color: C.TEXT, fontFace: "Segoe UI",
      lineSpacingMultiple: 1.1, valign: "top",
    });
  });
});

addSlideNum(s5, 5);


// ═════════════════════════════════════════════════════════════════
// SLIDE 6 — SYSTEM FUNCTIONALITIES (SIDE-BY-SIDE PANELS)
// ═════════════════════════════════════════════════════════════════

let s6 = prs.addSlide();
applySlideTheme(s6, "System Functionalities");

// User Features Card
const ux = 0.6;
const uy = 1.6;
const uw = 5.8;
const uh = 5.0;

addCard(s6, ux, uy, uw, uh, { topBarColor: C.ACCENT });
s6.addText("USER CAPABILITIES", {
  x: ux + 0.3, y: uy + 0.2, w: 4.0, h: 0.4,
  fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

const userFeats = [
  "Local & Google OAuth Signup / Authentication",
  "Interactive Planning Dashboard for managing multiple events",
  "Real-time guest RSVP tracking (Going / Pending / Not Going)",
  "Expense ledger logs with automatic budget recalculation",
  "Task checklists with priority levels and deadline reminders",
  "On-demand AI recommendations for themes, menus, and venues",
  "Contextual chatbot assistant for planning guidance",
];

userFeats.forEach((f, idx) => {
  const fY = uy + 0.8 + idx * 0.58;
  s6.addText("✓", {
    x: ux + 0.3, y: fY, w: 0.3, h: 0.3,
    fontSize: 12, color: C.ACCENT, bold: true, fontFace: "Segoe UI", align: "center",
  });
  s6.addText(f, {
    x: ux + 0.7, y: fY, w: uw - 0.9, h: 0.4,
    fontSize: 11, color: C.TEXT, fontFace: "Segoe UI",
  });
});

// Admin Features Card
const ax = 6.8;
const ay = 1.6;
const aw = 5.8;
const ah = 5.0;

addCard(s6, ax, ay, aw, ah, { topBarColor: C.PURPLE });
s6.addText("ADMINISTRATION PORTAL", {
  x: ax + 0.3, y: ay + 0.2, w: 4.0, h: 0.4,
  fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

const adminFeats = [
  "Centralized Control Panel for checking application health",
  "User account audits & real-time activity tracking",
  "Block / Unblock moderation controls for user credentials",
  "User role alteration (elevating users to administrators)",
  "Global event supervision and metadata statistics",
  "Direct database row deletion and record management",
];

adminFeats.forEach((f, idx) => {
  const fY = ay + 0.8 + idx * 0.58;
  s6.addText("⚙", {
    x: ax + 0.3, y: fY, w: 0.3, h: 0.3,
    fontSize: 12, color: C.PURPLE, bold: true, fontFace: "Segoe UI", align: "center",
  });
  s6.addText(f, {
    x: ax + 0.7, y: fY, w: aw - 0.9, h: 0.4,
    fontSize: 11, color: C.TEXT, fontFace: "Segoe UI",
  });
});

addSlideNum(s6, 6);


// ═════════════════════════════════════════════════════════════════
// SLIDE 7 — SOFTWARE REQUIREMENTS (GRID SPEC SYSTEM)
// ═════════════════════════════════════════════════════════════════

let s7 = prs.addSlide();
applySlideTheme(s7, "Software Requirements");

const swSpecs = [
  { title: "Operating System", value: "Windows 10/11, macOS Big Sur+, or Linux (Ubuntu 20.04 LTS+)", icon: "💻" },
  { title: "Runtime Environment", value: "Node.js (v18.0.0+ LTS recommended) and NPM (v9.0.0+)", icon: "📦" },
  { title: "Database Systems", value: "MySQL Community Server 8.0+ or MariaDB 10.5+ equivalent", icon: "🗄️" },
  { title: "IDE & Editors", value: "Visual Studio Code with ESLint and Prettier formatting plugins", icon: "📝" },
  { title: "API Testing Suite", value: "Postman Desktop Client or VS Code Thunder Client extension", icon: "🧪" },
  { title: "Web Browsers", value: "Chrome 100+, Firefox 98+, or Edge (modern Chromium rendering)", icon: "🌐" },
];

swSpecs.forEach((s, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const x = 0.6 + col * 4.1;
  const y = 1.8 + row * 2.5;
  const w = 3.8;
  const h = 2.1;

  addCard(s7, x, y, w, h);

  // Accent bar on the left inside card
  s7.addShape(prs.shapes.RECTANGLE, {
    x: x + 0.01, y: y + 0.1, w: 0.06, h: h - 0.2,
    fill: { color: C.ACCENT }, line: { width: 0 },
  });

  // Icon
  s7.addText(s.icon, {
    x: x + 0.2, y: y + 0.15, w: 0.5, h: 0.4,
    fontSize: 16, fontFace: "Segoe UI",
  });

  s7.addText(s.title, {
    x: x + 0.8, y: y + 0.18, w: 2.8, h: 0.35,
    fontSize: 13, color: C.TITLE, bold: true, fontFace: "Segoe UI",
  });

  s7.addText(s.value, {
    x: x + 0.2, y: y + 0.75, w: 3.4, h: 1.2,
    fontSize: 10.5, color: C.TEXT, fontFace: "Segoe UI",
    lineSpacingMultiple: 1.15, valign: "top",
  });
});

addSlideNum(s7, 7);


// ═════════════════════════════════════════════════════════════════
// SLIDE 8 — HARDWARE REQUIREMENTS (COMPARATIVE LAYOUT)
// ═════════════════════════════════════════════════════════════════

let s8 = prs.addSlide();
applySlideTheme(s8, "Hardware Requirements");

// Left Column: Development Workstation
const lx = 0.6;
const ly = 1.6;
const lw = 5.8;
const lh = 5.0;

addCard(s8, lx, ly, lw, lh, { topBarColor: C.ACCENT });
s8.addText("DEVELOPMENT WORKSTATION", {
  x: lx + 0.3, y: ly + 0.2, w: 4.5, h: 0.4,
  fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

const devSpecs = [
  { label: "Processor", val: "Intel Core i5 / AMD Ryzen 5 or higher (minimum 4 physical cores)" },
  { label: "Memory (RAM)", val: "8 GB DDR4 RAM (16 GB recommended for concurrent docker/ide execution)" },
  { label: "Storage", val: "10 GB of available SSD storage space for node_modules and DB instances" },
  { label: "Network", val: "Standard network adapter for localhost binding and API orchestration" },
];

devSpecs.forEach((spec, idx) => {
  const sY = ly + 0.8 + idx * 1.0;
  
  s8.addText(spec.label.toUpperCase(), {
    x: lx + 0.3, y: sY, w: 5.2, h: 0.25,
    fontSize: 9, color: C.ACCENT, bold: true, fontFace: "Segoe UI",
  });

  s8.addText(spec.val, {
    x: lx + 0.3, y: sY + 0.26, w: 5.2, h: 0.65,
    fontSize: 11, color: C.TEXT, fontFace: "Segoe UI",
    lineSpacingMultiple: 1.1, valign: "top",
  });
});

// Right Column: Cloud Deployment Server
const rx = 6.8;
const ry = 1.6;
const rw = 5.8;
const rh = 5.0;

addCard(s8, rx, ry, rw, rh, { topBarColor: C.GREEN });
s8.addText("PRODUCTION CLOUD SERVER (VPS)", {
  x: rx + 0.3, y: ry + 0.2, w: 4.5, h: 0.4,
  fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

const prodSpecs = [
  { label: "Processor", val: "1 Virtual CPU (vCPU) on standard cloud architectures (AWS EC2, DigitalOcean)" },
  { label: "Memory (RAM)", val: "1 GB RAM (2 GB recommended if hosting MySQL locally on the instance)" },
  { label: "Storage", val: "20 GB Solid State Drive (SSD) for operating system files and backups" },
  { label: "Network", val: "High-speed broadband network interface with a static public IPv4 address" },
];

prodSpecs.forEach((spec, idx) => {
  const sY = ry + 0.8 + idx * 1.0;
  
  s8.addText(spec.label.toUpperCase(), {
    x: rx + 0.3, y: sY, w: 5.2, h: 0.25,
    fontSize: 9, color: C.GREEN, bold: true, fontFace: "Segoe UI",
  });

  s8.addText(spec.val, {
    x: rx + 0.3, y: sY + 0.26, w: 5.2, h: 0.65,
    fontSize: 11, color: C.TEXT, fontFace: "Segoe UI",
    lineSpacingMultiple: 1.1, valign: "top",
  });
});

addSlideNum(s8, 8);


// ═════════════════════════════════════════════════════════════════
// SLIDE 9 — DATABASE DESIGN (MySQL BADGES + SCHEMA DIAGRAM PLACEHOLDER)
// ═════════════════════════════════════════════════════════════════

let s9 = prs.addSlide();
applySlideTheme(s9, "Database Schema Design");

// Left side info card
const d_lx = 0.6;
const d_ly = 1.6;
const d_lw = 5.8;
const d_lh = 5.0;

addCard(s9, d_lx, d_ly, d_lw, d_lh);

s9.addText("9 RELATIONAL TABLES (MYSQL)", {
  x: d_lx + 0.3, y: d_ly + 0.2, w: 5.2, h: 0.3,
  fontSize: 11, color: C.ACCENT, bold: true, fontFace: "Segoe UI",
});

// Display table names in modern badges
const dbTables = ["users", "events", "guests", "budget", "expenses", "tasks", "vendors", "notifications", "feedback"];
dbTables.forEach((t, i) => {
  const col = i % 3;
  const row = Math.floor(i / 3);
  const tx = d_lx + 0.3 + col * 1.75;
  const ty = d_ly + 0.6 + row * 0.55;
  const tw = 1.6;
  const th = 0.45;
  
  addCard(s9, tx, ty, tw, th, { bgColor: "F1F5F9" });
  s9.addText(t, {
    x: tx, y: ty, w: tw, h: th,
    fontSize: 10, color: C.TITLE, fontFace: "Consolas", align: "center", valign: "middle",
  });
});

s9.addText("KEY RELATIONSHIPS & CONSTRAINTS", {
  x: d_lx + 0.3, y: d_ly + 2.5, w: 5.2, h: 0.3,
  fontSize: 11, color: C.ACCENT, bold: true, fontFace: "Segoe UI",
});

const relations = [
  "Users ➔ Events (1 : N relation via user_id)",
  "Events ➔ Budget (1 : 1 relation via event_id)",
  "Events ➔ Guests, Expenses, Tasks, Vendors (1 : N)",
  "Referential Integrity: ON DELETE CASCADE constraints",
  "Normalization: Structured up to 3NF for zero redundancy",
];

relations.forEach((r, idx) => {
  const rY = d_ly + 2.8 + idx * 0.42;
  s9.addText("•", {
    x: d_lx + 0.3, y: rY, w: 0.2, h: 0.3,
    fontSize: 11, color: C.ACCENT, bold: true, fontFace: "Segoe UI",
  });
  s9.addText(r, {
    x: d_lx + 0.5, y: rY, w: d_lw - 0.8, h: 0.35,
    fontSize: 10.5, color: C.TEXT, fontFace: "Segoe UI",
  });
});

// Right side - ER Diagram Browser Placeholder
addBrowserPlaceholder(s9, 6.8, 1.6, 5.8, 5.0, "Entity Relationship (ER) Diagram");

addSlideNum(s9, 9);


// ═════════════════════════════════════════════════════════════════
// SLIDE 10 — SYSTEM WORKFLOWS (SIDE-BY-SIDE PLACEHOLDERS)
// ═════════════════════════════════════════════════════════════════

let s10 = prs.addSlide();
applySlideTheme(s10, "System Workflows");

addBrowserPlaceholder(s10, 0.6, 1.6, 5.8, 5.0, "User Flow Diagram");
addBrowserPlaceholder(s10, 6.8, 1.6, 5.8, 5.0, "Admin Moderation Flow Diagram");

addSlideNum(s10, 10);


// ═════════════════════════════════════════════════════════════════
// SLIDE 11 — SNAPSHOTS: HOMEPAGE (FULL WIDTH PLACEHOLDER)
// ═════════════════════════════════════════════════════════════════

let s11 = prs.addSlide();
applySlideTheme(s11, "Snapshots — Homepage");
addBrowserPlaceholder(s11, 0.8, 1.6, 11.2, 5.0, "Desktop Homepage & Features");
addSlideNum(s11, 11);


// ═════════════════════════════════════════════════════════════════
// SLIDE 12 — SNAPSHOTS: LOGIN & REGISTRATION
// ═════════════════════════════════════════════════════════════════

let s12 = prs.addSlide();
applySlideTheme(s12, "Snapshots — Login & Registration");
addBrowserPlaceholder(s12, 0.6, 1.6, 5.8, 5.0, "Secure User Login Page");
addBrowserPlaceholder(s12, 6.8, 1.6, 5.8, 5.0, "New Account Registration Page");
addSlideNum(s12, 12);


// ═════════════════════════════════════════════════════════════════
// SLIDE 13 — SNAPSHOTS: DASHBOARD & EVENTS
// ═════════════════════════════════════════════════════════════════

let s13 = prs.addSlide();
applySlideTheme(s13, "Snapshots — Dashboard & Events");
addBrowserPlaceholder(s13, 0.6, 1.6, 5.8, 5.0, "User Dashboard with Stats & Checklists");
addBrowserPlaceholder(s13, 6.8, 1.6, 5.8, 5.0, "Detailed Event View (Guests & Budget)");
addSlideNum(s13, 13);


// ═════════════════════════════════════════════════════════════════
// SLIDE 14 — SNAPSHOTS: AI FEATURES & PROFILE
// ═════════════════════════════════════════════════════════════════

let s14 = prs.addSlide();
applySlideTheme(s14, "Snapshots — AI Recommendations & Profile");
addBrowserPlaceholder(s14, 0.6, 1.6, 5.8, 5.0, "AI Orchestration suggestions (Gemini & Groq)");
addBrowserPlaceholder(s14, 6.8, 1.6, 5.8, 5.0, "User Profile & Security Settings");
addSlideNum(s14, 14);


// ═════════════════════════════════════════════════════════════════
// SLIDE 15 — SNAPSHOTS: ADMIN PANEL
// ═════════════════════════════════════════════════════════════════

let s15 = prs.addSlide();
applySlideTheme(s15, "Snapshots — Admin Moderation Panel");
addBrowserPlaceholder(s15, 0.6, 1.6, 5.8, 5.0, "Admin Control Panel & System Metrics");
addBrowserPlaceholder(s15, 6.8, 1.6, 5.8, 5.0, "User Management & Role Moderation Portal");
addSlideNum(s15, 15);


// ═════════════════════════════════════════════════════════════════
// SLIDE 16 — SNAPSHOTS: MOBILE RESPONSIVE MOCKUPS
// ═════════════════════════════════════════════════════════════════

let s16 = prs.addSlide();
applySlideTheme(s16, "Snapshots — Mobile Responsive Views");
addMobilePlaceholder(s16, 2.2, 1.5, 3.4, 5.2, "Mobile Home & Navigation View");
addMobilePlaceholder(s16, 7.2, 1.5, 3.4, 5.2, "Mobile Dashboard & Planner View");
addSlideNum(s16, 16);


// ═════════════════════════════════════════════════════════════════
// SLIDE 17 — CONCLUSION & FUTURE SCOPE
// ═════════════════════════════════════════════════════════════════

let s17 = prs.addSlide();
applySlideTheme(s17, "Conclusion & Future Scope");

// Achievements Card
const lcx = 0.6;
const lcy = 1.6;
const lcw = 5.8;
const lch = 5.0;

addCard(s17, lcx, lcy, lcw, lch, { topBarColor: C.GREEN });
s17.addText("KEY ACHIEVEMENTS", {
  x: lcx + 0.3, y: lcy + 0.2, w: 4.5, h: 0.4,
  fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

const achievements = [
  "Developed a fully-functional full-stack web application using Next.js, Node.js, Express.js, and MySQL.",
  "Successfully implemented multi-model AI Orchestration calling Gemini, Groq, and Grok APIs.",
  "Engineered a resilient active-fallback SQL mock driver for zero-config database execution during testing.",
  "Achieved clean JWT credentials authorization with Google OAuth 2.0 single sign-on integration.",
  "Validated application reliability through comprehensive testing of authentication, database, and API logic.",
];

achievements.forEach((a, idx) => {
  const fY = lcy + 0.8 + idx * 0.82;
  s17.addText("⭐", {
    x: lcx + 0.3, y: fY, w: 0.3, h: 0.3,
    fontSize: 11, color: C.GREEN, bold: true, fontFace: "Segoe UI", align: "center",
  });
  s17.addText(a, {
    x: lcx + 0.7, y: fY, w: lcw - 0.9, h: 0.75,
    fontSize: 10.5, color: C.TEXT, fontFace: "Segoe UI",
    lineSpacingMultiple: 1.15, valign: "top",
  });
});

// Future Scope Card
const rcx = 6.8;
const rcy = 1.6;
const rcw = 5.8;
const rch = 5.0;

addCard(s17, rcx, rcy, rcw, rch, { topBarColor: C.PURPLE });
s17.addText("FUTURE ROADMAP", {
  x: rcx + 0.3, y: rcy + 0.2, w: 4.5, h: 0.4,
  fontSize: 16, color: C.TITLE, bold: true, fontFace: "Segoe UI",
});

const futureItems = [
  "Payment gateway integration (Stripe / Razorpay) for direct vendor booking and ticket purchases.",
  "Automated digital invitation dispatch via Email, SMS, and WhatsApp using Twilio API suite.",
  "Real-time cooperative planning workspaces using WebSockets for concurrent editing by co-hosts.",
  "Localized vendor marketplace module with reviews, ratings, portfolios, and direct quote messaging.",
  "Cross-platform mobile application development utilizing the React Native core framework.",
];

futureItems.forEach((f, idx) => {
  const fY = rcy + 0.8 + idx * 0.82;
  s17.addText("🚀", {
    x: rcx + 0.3, y: fY, w: 0.3, h: 0.3,
    fontSize: 11, color: C.PURPLE, bold: true, fontFace: "Segoe UI", align: "center",
  });
  s17.addText(f, {
    x: rcx + 0.7, y: fY, w: rcw - 0.9, h: 0.75,
    fontSize: 10.5, color: C.TEXT, fontFace: "Segoe UI",
    lineSpacingMultiple: 1.15, valign: "top",
  });
});

addSlideNum(s17, 17);


// ═════════════════════════════════════════════════════════════════
// SLIDE 18 — THANK YOU (CENTERED BADGE DESIGN WITH BACKDROP)
// ═════════════════════════════════════════════════════════════════

let s18 = prs.addSlide();
s18.background = { fill: C.BG };

// Overlapping background shapes for a final premium touch
s18.addShape(prs.shapes.OVAL, {
  x: -1.0, y: -1.0, w: 6.0, h: 6.0,
  fill: { color: C.BG_DECO_1, transparency: 75 }, line: { width: 0 },
});
s18.addShape(prs.shapes.OVAL, {
  x: 8.5, y: 2.5, w: 6.0, h: 6.0,
  fill: { color: C.BG_DECO_2, transparency: 75 }, line: { width: 0 },
});

// A clean centered card
const tx = 2.0;
const ty = 1.2;
const tw = 9.33;
const th = 4.8;

addCard(s18, tx, ty, tw, th);

// Top highlight line on card
s18.addShape(prs.shapes.RECTANGLE, {
  x: tx + 0.01, y: ty + 0.01, w: tw - 0.02, h: 0.1,
  fill: { color: C.ACCENT }, line: { width: 0 },
});

s18.addText("THANK YOU", {
  x: tx + 0.5, y: ty + 0.8, w: tw - 1.0, h: 1.0,
  fontSize: 48, color: C.TITLE, bold: true, fontFace: "Segoe UI", align: "center",
});

s18.addText("Questions & Answers Session", {
  x: tx + 0.5, y: ty + 1.9, w: tw - 1.0, h: 0.4,
  fontSize: 16, color: C.SUBTITLE, fontFace: "Segoe UI", align: "center",
});

// Divider line
s18.addShape(prs.shapes.RECTANGLE, {
  x: tx + tw/2 - 1.5, y: ty + 2.5, w: 3.0, h: 0.02,
  fill: { color: C.CARD_BORDER }, line: { width: 0 },
});

s18.addText("PROJECT: JAGAH — AI Event Planner", {
  x: tx + 0.5, y: ty + 2.8, w: tw - 1.0, h: 0.4,
  fontSize: 13, color: C.TITLE, bold: true, fontFace: "Segoe UI", align: "center",
});

s18.addText("Candidate Name: Mangal Sharma  •  Major Project Submission", {
  x: tx + 0.5, y: ty + 3.3, w: tw - 1.0, h: 0.4,
  fontSize: 11, color: C.SUBTITLE, fontFace: "Segoe UI", align: "center",
});

addSlideNum(s18, 18, 18);


// ─── Save ───────────────────────────────────────────────────────

const outputPath = path.join(__dirname, "JAGAH_AI_Event_Planner_Modern.pptx");
prs.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`\n✅ Modern Design PPT generated successfully!`);
    console.log(`   📁 Path: ${outputPath}`);
    console.log(`   📊 Total slides: 18`);
    console.log(`   🎨 Theme: High-end Light Slate & Blue Accent`);
    console.log(`   📸 Image Placeholders: 8 slides with clean Mac browser & mobile frames`);
  })
  .catch((err) => {
    console.error("❌ Error generating PPT:", err);
  });
