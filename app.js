const STORAGE_KEY = "student-success-platform-v1";
const account = window.STUDENT_ACCOUNT || null;

const quizQuestions = [
  { topic: "Variables & data", prompt: "Which JavaScript keyword declares a variable that can be reassigned?", options: ["const", "let", "static"], answer: "let" },
  { topic: "Variables & data", prompt: "What is the value of typeof 42 in JavaScript?", options: ["number", "integer", "string"], answer: "number" },
  { topic: "Conditionals", prompt: "Which operator checks both value and type for equality?", options: ["==", "===", "="], answer: "===" },
  { topic: "Conditionals", prompt: "What does an else block do?", options: ["Runs when the if condition is false", "Repeats the if block", "Stops the program"], answer: "Runs when the if condition is false" },
  { topic: "Loops", prompt: "Which loop is commonly used when you know how many times to repeat?", options: ["for loop", "if statement", "switch statement"], answer: "for loop" },
  { topic: "Loops", prompt: "What does break do inside a loop?", options: ["Skips one iteration", "Exits the loop", "Restarts the loop"], answer: "Exits the loop" },
  { topic: "Functions", prompt: "What does a return statement do inside a function?", options: ["Sends a value back to the caller", "Prints a value on screen", "Creates a new function"], answer: "Sends a value back to the caller" },
  { topic: "Functions", prompt: "A function parameter is best described as…", options: ["A value the function can receive", "A loop condition", "A browser setting"], answer: "A value the function can receive" }
];

const topics = [
  { name: "Variables & data", lessons: 4, prereq: null, resource: "Review variable types", effort: "12 min" },
  { name: "Conditionals", lessons: 3, prereq: "Variables & data", resource: "Practice branching logic", effort: "15 min" },
  { name: "Loops", lessons: 5, prereq: "Conditionals", resource: "Build a repetition pattern", effort: "20 min" },
  { name: "Functions", lessons: 4, prereq: "Variables & data", resource: "Write your first function", effort: "18 min" }
];

const roles = {
  "Frontend developer": [
    { name: "HTML & CSS", target: 4, weight: 1.1, evidence: "Build and deploy a responsive page" },
    { name: "JavaScript", target: 4, weight: 1.3, evidence: "Create an interactive web project" },
    { name: "Accessibility", target: 3, weight: 1, evidence: "Audit a page with keyboard navigation" },
    { name: "Git & collaboration", target: 3, weight: .8, evidence: "Contribute to a shared repository" },
    { name: "Problem solving", target: 4, weight: 1, evidence: "Document your approach to a coding challenge" }
  ],
  "Data analyst": [
    { name: "Spreadsheets", target: 4, weight: 1, evidence: "Build a clean, documented analysis" },
    { name: "SQL", target: 4, weight: 1.3, evidence: "Query a sample dataset" },
    { name: "Data visualization", target: 3, weight: 1, evidence: "Explain a chart to a non-technical audience" },
    { name: "Statistics", target: 4, weight: 1.2, evidence: "Summarize an experiment with uncertainty" },
    { name: "Communication", target: 3, weight: .8, evidence: "Present a concise findings brief" }
  ],
  "UX designer": [
    { name: "User research", target: 4, weight: 1.2, evidence: "Run and summarize a small user interview" },
    { name: "Prototyping", target: 4, weight: 1.2, evidence: "Share a clickable prototype" },
    { name: "Visual design", target: 3, weight: 1, evidence: "Create a consistent interface system" },
    { name: "Accessibility", target: 3, weight: 1, evidence: "Check a flow against accessibility basics" },
    { name: "Communication", target: 3, weight: .8, evidence: "Explain a design decision with evidence" }
  ],
  "Product manager": [
    { name: "Communication", target: 4, weight: 1.2, evidence: "Write a one-page product brief" },
    { name: "User research", target: 3, weight: 1.1, evidence: "Summarize user needs and open questions" },
    { name: "Data literacy", target: 3, weight: 1, evidence: "Choose a metric and interpret its movement" },
    { name: "Prioritization", target: 4, weight: 1.2, evidence: "Explain a decision using impact and effort" },
    { name: "Collaboration", target: 4, weight: .9, evidence: "Plan a small cross-functional project" }
  ]
};

const defaultState = {
  profile: { name: "Jordan Davis", email: "jordan.davis@example.edu", program: "BSc Computer Science", year: "Year 2" },
  mastery: { "Variables & data": 75, Conditionals: 60, Loops: null, Functions: null },
  attempts: [],
  assignment: null,
  role: "Frontend developer",
  skills: { "HTML & CSS": 3, JavaScript: 2, Accessibility: 1, "Git & collaboration": 2, "Problem solving": 3, Spreadsheets: 1, SQL: 1, "Data visualization": 1, Statistics: 1, Communication: 2, "User research": 1, Prototyping: 1, "Visual design": 1, "Data literacy": 1, Prioritization: 1, Collaboration: 2 },
  milestones: [],
  activity: [
    { icon: "✓", tone: "green", title: "Variables & data diagnostic", detail: "You reached 75% mastery", time: "Yesterday" },
    { icon: "↗", tone: "blue", title: "Career path started", detail: "Frontend developer selected", time: "2 days ago" },
    { icon: "▤", tone: "amber", title: "Welcome to your learning space", detail: "Your next step is ready", time: "This week" }
  ]
};

let state = loadState();
let currentPage = "dashboard";
let focusInterval = null;
let focusSeconds = 20 * 60;

function loadState() {
  if (account) {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}:${account.email}`);
      const initialState = structuredClone(defaultState);
      initialState.profile = {
        ...initialState.profile,
        name: account.name || initialState.profile.name,
        email: account.email || ""
      };
      if (!saved) return initialState;
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed, profile: { ...initialState.profile, ...parsed.profile } };
    } catch (error) {
      console.error("Could not read this student's saved progress.", error);
      return structuredClone(defaultState);
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return structuredClone(defaultState);
    return { ...structuredClone(defaultState), ...JSON.parse(saved) };
  } catch (error) {
    console.error("Could not read saved student progress.", error);
    return structuredClone(defaultState);
  }
}

function saveState() {
  try {
    const key = account ? `${STORAGE_KEY}:${account.email}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.error("Could not save student progress.", error);
    showToast("Your browser could not save this change. Check available storage.");
  }
}

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[character]);
}

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase() || "").join("") || "JD";
}

function scoreLabel(score) {
  if (score === null || score === undefined) return "Not assessed";
  if (score < 50) return "Needs practice";
  if (score < 75) return "Developing";
  return "Strong";
}

function scoreTone(score) {
  if (score === null || score === undefined) return "badge-slate";
  if (score < 50) return "badge-amber";
  if (score < 75) return "badge-blue";
  return "badge-mint";
}

function setCurrentPage(page) {
  const allowed = ["dashboard", "learning", "assignments", "career", "profile", "notifications"];
  currentPage = allowed.includes(page) ? page : "dashboard";
  if (location.hash !== `#${currentPage}`) history.replaceState(null, "", `#${currentPage}`);
  document.querySelectorAll(".nav-link").forEach((link) => {
    const active = link.dataset.page === currentPage;
    link.classList.toggle("is-active", active);
    if (active) link.setAttribute("aria-current", "page");
    else link.removeAttribute("aria-current");
  });
  const labels = { dashboard: "Dashboard", learning: "My learning", assignments: "Assignments", career: "Career path", profile: "My profile", notifications: "Notifications" };
  document.getElementById("breadcrumb-current").textContent = labels[currentPage];
  document.title = `${labels[currentPage]} — Student Success`;
  document.getElementById("sidebar").classList.remove("is-open");
  document.getElementById("mobile-menu").setAttribute("aria-expanded", "false");
  renderPage();
}

function navigate(page) {
  if (location.hash === `#${page}`) {
    setCurrentPage(page);
  } else {
    location.hash = page;
  }
}

function renderPage() {
  const main = document.getElementById("main-content");
  const pages = { dashboard: renderDashboard, learning: renderLearning, assignments: renderAssignments, career: renderCareer, profile: renderProfile, notifications: renderNotifications };
  main.innerHTML = (pages[currentPage] || renderDashboard)();
  updateNames();
  if (currentPage === "assignments" && state.assignment) fillSavedAssignment();
}

function updateNames() {
  const name = state.profile.name || "Student";
  document.getElementById("sidebar-name").textContent = name;
  document.getElementById("topbar-name").textContent = name;
  document.querySelectorAll(".avatar-small, [data-user-initials]").forEach((avatar) => { avatar.textContent = initials(name); });
  document.getElementById("learning-count").textContent = topics.filter((topic) => state.mastery[topic.name] === null).length || "✓";
}

function pageHeading(kicker, title, subtitle, action = "") {
  return `<div class="page-heading"><div><p class="eyebrow">${kicker}</p><h1>${title}</h1><p class="page-subtitle">${subtitle}</p></div>${action}</div>`;
}

function statCard(icon, tone, label, value, suffix, note) {
  return `<div class="surface stat-card"><span class="stat-icon ${tone}" aria-hidden="true">${icon}</span><div class="stat-copy"><span class="stat-label">${label}</span><div class="stat-value">${value}<small>${suffix}</small></div><div class="stat-note">${note}</div></div></div>`;
}

function masteryAverage() {
  const scored = Object.values(state.mastery).filter((score) => score !== null && score !== undefined);
  return scored.length ? Math.round(scored.reduce((sum, score) => sum + score, 0) / scored.length) : 0;
}

function renderDashboard() {
  const firstName = escapeHtml((state.profile.name || "Student").trim().split(/\s+/)[0]);
  const weekday = new Intl.DateTimeFormat("en", { weekday: "long" }).format(new Date()).toUpperCase();
  const recent = state.activity.slice(0, 3);
  const hours = "3.5";
  const weekly = [32, 52, 39, 73, 46, 28, 19];
  return `${`<section class="welcome-banner"><div class="welcome-content"><p class="eyebrow">${weekday}, ${new Intl.DateTimeFormat("en", { month: "long", day: "numeric" }).format(new Date()).toUpperCase()}</p><h1>Good day, ${firstName} <span aria-hidden="true">✦</span></h1><p>You’re building something great. Pick up where you left off and keep your momentum going.</p><button class="button" data-page-link="learning">Continue learning <span aria-hidden="true">→</span></button></div><div class="welcome-art" aria-hidden="true"><span class="art-chip top">✦ &nbsp; One step at a time</span><div class="art-ring"><span class="art-book">📚</span></div><span class="art-chip bottom">✎ &nbsp; Your path, your pace</span></div></section>`}
    <section class="stats-grid" aria-label="Your progress">
      ${statCard("◷", "mint", "Study time", `${hours}`, "sample hrs/week", "Illustrative dashboard data")}
      ${statCard("▤", "blue", "Topics explored", `${Object.values(state.mastery).filter((score) => score !== null).length}`, "of 4 topics", "Keep your learning streak going")}
      ${statCard("✦", "amber", "Average mastery", `${masteryAverage()}`, "% across topics", "Based on your scored assessments")}
      ${statCard("↗", "rose", "Career readiness", `${careerMatch()}`, "% role match", `For ${escapeHtml(state.role)}`)}
    </section>
    <div class="dashboard-grid">
      <div class="dashboard-primary">
        <section class="surface surface-pad"><div class="section-heading"><div><h2>Your learning space</h2><p>Three ways to move closer to your goals</p></div><button class="section-link" data-page-link="learning">View progress →</button></div>
          <div class="module-list">
            <article class="module-card"><span class="module-icon learn">▤</span><div class="module-content"><strong>Adaptive learning path</strong><p>${nextLearningDescription()}</p></div><button class="module-action" data-page-link="learning" aria-label="Open my learning">→</button></article>
            <article class="module-card"><span class="module-icon assignment">▧</span><div class="module-content"><strong>Assignment studio</strong><p>${state.assignment ? "Your latest practice feedback is ready to revisit." : "Try a writing check with a clear, helpful rubric."}</p></div><button class="module-action" data-page-link="assignments" aria-label="Open assignments">→</button></article>
            <article class="module-card"><span class="module-icon career">↗</span><div class="module-content"><strong>Career navigator</strong><p>${escapeHtml(state.role)} · ${careerGaps().length} skills to keep building</p></div><button class="module-action" data-page-link="career" aria-label="Open career path">→</button></article>
          </div>
        </section>
        <section class="surface surface-pad activity-panel"><div class="section-heading"><div><h2>Recent activity</h2><p>Your progress, all in one place</p></div><button class="section-link" data-page-link="notifications">View all →</button></div>
          <div class="activity-list">${recent.map((item) => `<div class="activity-item"><span class="activity-mark ${item.tone}">${item.icon}</span><div class="activity-info"><strong>${escapeHtml(item.title)}</strong><small>${escapeHtml(item.detail)}</small></div><span class="activity-time">${escapeHtml(item.time)}</span></div>`).join("")}</div>
        </section>
      </div>
      <aside class="dashboard-secondary">
        <section class="surface surface-pad"><div class="section-heading"><div><h2>Your week</h2><p>A little learning, day by day</p></div><span class="badge badge-mint">SAMPLE WEEK</span></div>
          <div class="weekly-chart" role="img" aria-label="Weekly study activity chart: Monday 32, Tuesday 52, Wednesday 39, Thursday 73, Friday 46, Saturday 28, Sunday 19 minutes">${weekly.map((height, index) => `<div class="chart-column"><div class="chart-bar-area"><div class="chart-bar ${index === 1 ? "today" : ""}" style="height:${height}%"></div></div><span class="chart-day">${["M", "T", "W", "T", "F", "S", "S"][index]}</span></div>`).join("")}</div>
          <div class="chart-legend"><div><strong>${hours}h</strong><small>Learning time</small></div><div class="chart-total"><strong>${state.attempts.length + 3}</strong><small>Study sessions</small></div></div>
        </section>
        <section class="surface surface-pad activity-panel"><div class="section-heading"><div><h2>Next up</h2><p>A good place to start today</p></div></div>${renderRoadmap(2)}</section>
      </aside>
    </div>`;
}

function nextLearningDescription() {
  const recommended = recommendTopics()[0];
  return recommended ? `${recommended.name} · ${recommended.score === null ? "Start your first check-in" : `${recommended.score}% mastery — practice makes progress`}` : "Your learning path is up to date.";
}

function recommendTopics() {
  return topics.map((topic) => ({ ...topic, score: state.mastery[topic.name] }))
    .filter((topic) => topic.score === null || topic.score < 75)
    .sort((a, b) => {
      const depthDifference = topicDepth(a) - topicDepth(b);
      if (depthDifference) return depthDifference;
      const aScore = a.score === null ? Infinity : a.score;
      const bScore = b.score === null ? Infinity : b.score;
      return aScore - bScore;
    });
}

function topicDepth(topic, visited = new Set()) {
  if (!topic.prereq || visited.has(topic.name)) return 0;
  visited.add(topic.name);
  const prerequisite = topics.find((candidate) => candidate.name === topic.prereq);
  return prerequisite ? 1 + topicDepth(prerequisite, visited) : 0;
}

function renderRoadmap(limit = Infinity) {
  const recommended = recommendTopics();
  const completed = topics.filter((topic) => state.mastery[topic.name] !== null && state.mastery[topic.name] >= 75);
  const ordered = [...recommended, ...completed].slice(0, limit);
  return `<div>${ordered.map((topic, index) => {
    const score = state.mastery[topic.name];
    const done = score !== null && score >= 75;
    const explanation = score === null ? "Not assessed yet · start with a quick diagnostic" : score < 50 ? `Recommended: ${topic.resource} · ${score}% on your latest check` : score < 75 ? `Build confidence with practice · latest score ${score}%` : "Strong foundation · keep it fresh with a short review";
    return `<div class="roadmap-item ${done ? "completed" : ""}"><span class="roadmap-step">${done ? "✓" : index + 1}</span><div class="roadmap-copy"><strong>${escapeHtml(topic.name)}</strong><small>${escapeHtml(explanation)}</small></div></div>`;
  }).join("")}</div>`;
}

function renderLearning() {
  const recommendations = recommendTopics();
  const current = recommendations[0];
  const action = `<button class="button button-primary" data-action="start-diagnostic"><span>＋</span> Take a diagnostic</button>`;
  return `${pageHeading("YOUR LEARNING JOURNEY", "My learning", "A learning path that responds to what you know—and what you’re ready to explore.", action)}
    <div class="learning-grid">
      <section class="surface surface-pad"><div class="section-heading"><div><h2>Topic mastery</h2><p>Progress is based on your latest quiz answers</p></div><span class="badge badge-blue">JAVASCRIPT · 4 TOPICS</span></div>
        <div class="topic-list">${topics.map((topic) => {
          const score = state.mastery[topic.name];
          const width = score === null ? 0 : score;
          return `<article class="topic-card"><div class="topic-top"><div><div class="topic-title">${escapeHtml(topic.name)}</div><div class="topic-meta">${topic.lessons} short lessons · ${topic.prereq ? `Builds on ${escapeHtml(topic.prereq)}` : "Foundational topic"}</div></div><span class="badge ${scoreTone(score)}">${scoreLabel(score)}</span></div><div class="topic-progress"><div class="progress-track" role="progressbar" aria-label="${escapeHtml(topic.name)} mastery" aria-valuenow="${score ?? 0}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill ${score !== null && score < 50 ? "amber" : ""}" style="width:${width}%"></div></div><strong>${score === null ? "—" : `${score}%`}</strong></div><p class="topic-reason">${score === null ? "Take the diagnostic to discover your starting point." : score < 50 ? `Why this is next: your latest result shows room to grow. Try ${escapeHtml(topic.resource.toLowerCase())}.` : score < 75 ? "Why this is next: another example and a few practice questions can help this stick." : "Why revisit: a quick review helps keep this skill fresh."}</p></article>`;
        }).join("")}</div>
      </section>
      <aside><section class="surface surface-pad"><div class="section-heading"><div><h2>Your next steps</h2><p>Ordered around your topic mastery</p></div></div>
          ${current ? `<div class="roadmap-item"><span class="roadmap-step">1</span><div class="roadmap-copy"><strong>${escapeHtml(current.name)}</strong><small>${current.score === null ? "Not assessed yet · start here" : `${current.score}% on your latest quiz · strengthen the fundamentals`}</small></div></div><div class="sidebar-tip"><strong>Why this topic?</strong><br>${current.score === null ? "Topics with no quiz data come first, so your path starts with a real check-in—not a guess." : "Topics with lower mastery are prioritized so your study time goes where it can help most."}</div>` : `<div class="empty-state"><strong>Lovely work.</strong>You have reached the suggested mastery level for every topic. Take another diagnostic whenever you like.</div>`}
          <div style="margin-top:14px"><button class="button button-primary" data-action="start-diagnostic">Start 8-question check-in <span>→</span></button></div>
        </section>
        <section class="surface surface-pad activity-panel"><div class="section-heading"><div><h2>Recent attempts</h2><p>Your learning history stays yours</p></div></div>${state.attempts.length ? `<div class="activity-list">${state.attempts.slice(0, 4).map((attempt) => `<div class="activity-item"><span class="activity-mark green">✓</span><div class="activity-info"><strong>Learning diagnostic</strong><small>${attempt.score}% overall</small></div><span class="activity-time">${escapeHtml(attempt.date)}</span></div>`).join("")}</div>` : `<div class="empty-state"><strong>Your story starts here.</strong>Take a diagnostic to see your topic-level starting points.</div>`}</section>
      </aside>
    </div>`;
}

function renderQuiz() {
  const main = document.getElementById("main-content");
  main.innerHTML = `${pageHeading("A QUICK CHECK-IN", "Diagnostic quiz", "Choose one answer for each question. Your results shape your personal learning path.", '<button class="button button-outline" data-action="cancel-quiz">← Back to learning</button>')}
    <form id="quiz-form" class="surface surface-pad" style="max-width:800px;margin:0 auto"><p class="page-subtitle" style="margin-bottom:17px">8 questions · around 4 minutes · no pressure, this is just a starting point.</p>
      ${quizQuestions.map((question, index) => `<fieldset class="quiz-question" style="padding:15px 0;border:0;border-top:1px solid #edf0f4"><legend style="padding:0 0 9px;color:#344156;font-size:11px;font-weight:700">${index + 1}. ${escapeHtml(question.prompt)} <span class="badge badge-slate" style="margin-left:4px">${escapeHtml(question.topic)}</span></legend><div style="display:grid;gap:7px">${question.options.map((option) => `<label class="quiz-option"><input type="radio" name="question-${index}" value="${escapeHtml(option)}" required><span>${escapeHtml(option)}</span></label>`).join("")}</div></fieldset>`).join("")}
      <div class="form-footer"><span class="privacy-note">Your answers are saved only in this browser.</span><button class="button button-primary" type="submit">See my results →</button></div>
    </form>`;
}

function renderQuizResults(attempt) {
  const byTopic = attempt.byTopic;
  const detail = Object.entries(byTopic).map(([name, result]) => `<article class="topic-card"><div class="topic-top"><div><div class="topic-title">${escapeHtml(name)}</div><div class="topic-meta">${result.correct} of ${result.total} answers correct</div></div><span class="badge ${scoreTone(result.score)}">${scoreLabel(result.score)}</span></div><div class="topic-progress"><div class="progress-track" role="progressbar" aria-label="${escapeHtml(name)} quiz score" aria-valuenow="${result.score}" aria-valuemin="0" aria-valuemax="100"><div class="progress-fill ${result.score < 50 ? "amber" : ""}" style="width:${result.score}%"></div></div><strong>${result.score}%</strong></div></article>`).join("");
  document.getElementById("main-content").innerHTML = `${pageHeading("YOUR CHECK-IN RESULTS", "Look what you know", "Each topic score gives your learning path a better place to begin.", "")}
    <section class="surface surface-pad" style="max-width:800px;margin:0 auto"><div class="career-summary"><span class="match-ring" style="--match:${attempt.score}%"><span>${attempt.score}%</span></span><div><strong>Your overall score</strong><p>${attempt.score >= 75 ? "Great foundation. We’ll suggest the next topic and a little revision." : "A useful first snapshot. Your roadmap will begin with topics where practice can help most."}</p></div></div><div class="topic-list">${detail}</div>
    <div class="form-footer" style="margin-top:17px"><span class="privacy-note">This is guidance to help you study, not a formal grade.</span><button class="button button-primary" data-action="open-learning">See my updated path →</button></div></section>`;
}

function renderAssignments() {
  return `${pageHeading("ASSIGNMENT STUDIO", "Make your next draft stronger", "Try a writing check against a simple rubric. Your draft stays in this browser.", "")}
    <div class="assignment-grid">
      <section class="surface surface-pad"><div class="section-heading"><div><h2>Practice assignment</h2><p>Explain one idea from your current course in your own words</p></div><span class="badge badge-blue">WRITING PRACTICE</span></div>
        <form class="assignment-form" id="assignment-form">
          <div class="field"><label for="assignment-title">What are you working on?</label><input id="assignment-title" maxlength="100" placeholder="e.g. How JavaScript functions work" required></div>
          <div class="field"><label for="assignment-text">Your draft <span class="field-hint">— paste or write at least a few sentences</span></label><textarea id="assignment-text" maxlength="8000" placeholder="Start with the main idea, then add an example in your own words…" required></textarea></div>
          <div class="form-footer"><span class="privacy-note"><span>🔒 Stored locally in this browser.</span><br>Do not paste sensitive or identifying information.</span><button class="button button-primary" type="submit">Review my draft <span>→</span></button></div>
        </form>
        <div id="feedback-container"></div>
      </section>
      <aside><section class="surface surface-pad"><div class="section-heading"><div><h2>What we look for</h2><p>A transparent practice rubric</p></div></div>
        <div class="assignment-brief"><h3>Make a clear, useful explanation</h3><p>In about 100–250 words, explain a course idea, show an example, and tell your reader why it matters.</p><ul><li>Is the main idea easy to find?</li><li>Does an example support your explanation?</li><li>Does the draft use clear, complete sentences?</li><li>Have you checked important terms?</li></ul></div>
        <div style="margin-top:14px"><div class="rubric-row"><span>Clear main idea</span><strong>10 points</strong></div><div class="rubric-row"><span>Useful example</span><strong>10 points</strong></div><div class="rubric-row"><span>Structure & clarity</span><strong>10 points</strong></div></div>
        <div class="demo-disclaimer"><strong>Practice tool, not AI.</strong> This local writing checklist uses visible rules. It does not call an AI service, award an official grade, or replace feedback from your instructor.</div>
      </section></aside>
    </div>`;
}

function fillSavedAssignment() {
  const title = document.getElementById("assignment-title");
  const text = document.getElementById("assignment-text");
  if (!title || !text) return;
  title.value = state.assignment.title;
  text.value = state.assignment.text;
  if (state.assignment.feedback) showFeedback(state.assignment.feedback, state.assignment.title);
}

function analyzeDraft(title, text) {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lower = text.toLowerCase();
  const sentences = text.split(/[.!?]+/).filter((sentence) => sentence.trim().length > 0);
  const mainIdea = sentences.length > 0 && sentences[0].trim().split(/\s+/).length >= 5;
  const example = /\b(for example|for instance|such as|e\.g\.|example)\b/i.test(text);
  const transition = /\b(first|next|because|therefore|however|finally|also|for example|in conclusion)\b/i.test(text);
  const terms = /\b(function|variable|code|data|learn|system|user|result|process|value|program|design|student|course)\b/i.test(text);
  const punctuation = /[.!?]["')\]]?\s*$/.test(text.trim());
  const scores = [
    { name: "Clear main idea", score: mainIdea ? 8 : 4, max: 10, feedback: mainIdea ? "Your opening gives the reader a clear place to start." : "Try opening with one complete sentence that states the main point." },
    { name: "Useful example", score: example ? 9 : 3, max: 10, feedback: example ? "We spotted an example cue. Check that the example supports your main point." : "A specific example (try “for example…”) can help make your idea easier to follow." },
    { name: "Structure & clarity", score: Math.min(10, 3 + (words.length >= 50 ? 3 : words.length >= 20 ? 2 : 0) + (sentences.length >= 3 ? 2 : 0) + (transition ? 1 : 0) + (punctuation ? 1 : 0)), max: 10, feedback: `${words.length} words across ${sentences.length} sentence${sentences.length === 1 ? "" : "s"}. ${words.length < 50 ? "Consider adding detail and a little more explanation." : "Your draft has a helpful amount of detail."} ${transition ? "Transitions help connect ideas." : "Try a transition such as “because” or “for example” to link ideas."}` }
  ];
  const score = scores.reduce((sum, item) => sum + item.score, 0);
  return { title, score, max: 30, words: words.length, hasTerms: terms, feedback: scores };
}

function showFeedback(result, title) {
  const container = document.getElementById("feedback-container");
  if (!container) return;
  container.innerHTML = `<section class="feedback-result" aria-live="polite"><div class="section-heading"><div><h3>Your writing check</h3><p>${escapeHtml(title)} · ${result.words} words · ${result.score}/${result.max} practice points</p></div><span class="badge badge-mint">PRIVATE DRAFT</span></div><p>This checklist can spot a few writing signals, but it cannot judge accuracy or understand your meaning. Review each suggestion and decide what fits.</p>${result.feedback.map((item) => `<div class="feedback-criterion"><div><strong>${escapeHtml(item.name)}</strong><p>${escapeHtml(item.feedback)}</p></div><span class="score-pill">${item.score}/${item.max}</span></div>`).join("")}<div class="demo-disclaimer">${result.hasTerms ? "We noticed some course-related vocabulary. Double-check that each term is used accurately." : "Consider using the key vocabulary from your course, where it fits naturally."} This is a private practice draft—not AI-generated, reviewed by a teacher, or official feedback.</div></section>`;
}

function renderCareer() {
  const activeRoles = Object.keys(roles);
  const selectedRole = roles[state.role] ? state.role : activeRoles[0];
  const requirements = roles[selectedRole];
  const gaps = careerGaps(requirements);
  const required = requirements.reduce((sum, skill) => sum + skill.target * skill.weight, 0);
  const achieved = requirements.reduce((sum, skill) => sum + Math.min(state.skills[skill.name] || 0, skill.target) * skill.weight, 0);
  const match = Math.round(achieved / required * 100);
  const action = `<button class="button button-outline" data-action="reset-career">Reset this demo</button>`;
  return `${pageHeading("YOUR FUTURE, MADE PRACTICAL", "Career navigator", "Pick a direction, map your skills, and turn one gap into a project you can show.", action)}
    <section class="surface surface-pad" style="margin-bottom:15px"><div class="section-heading"><div><h2>Explore a role</h2><p>These sample roles are starting points—not promises of employer requirements</p></div></div><div class="role-picker">${activeRoles.map((role) => `<button class="role-chip ${role === selectedRole ? "active" : ""}" data-role="${escapeHtml(role)}" aria-pressed="${role === selectedRole}">${escapeHtml(role)}</button>`).join("")}</div>
      <div class="career-summary"><span class="match-ring" style="--match:${match}%"><span>${match}%</span></span><div><strong>Your ${escapeHtml(selectedRole)} skill snapshot</strong><p>Estimate your current level from 0 to 5. Your match uses each role skill’s target and importance weight.</p></div></div>
      <div class="section-heading"><div><h2>Skills to build</h2><p>Why a skill matters is visible—adjust your level whenever your evidence changes</p></div></div>
      <div class="skill-list">${requirements.map((skill) => {
        const value = state.skills[skill.name] || 0;
        const gap = Math.max(skill.target - value, 0);
        return `<div class="skill-row"><div class="skill-label"><strong>${escapeHtml(skill.name)}</strong><small>${gap ? `${gap} level${gap === 1 ? "" : "s"} to target` : "Target reached"}</small></div><div class="skill-meter"><div class="progress-track" role="progressbar" aria-label="${escapeHtml(skill.name)} level" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="5"><div class="progress-fill ${gap ? "blue" : ""}" style="width:${value * 20}%"></div></div><small>Current ${value}/5 · Target ${skill.target}/5</small></div><label class="small" for="skill-${slug(skill.name)}">Your level<select class="skill-select" id="skill-${slug(skill.name)}" data-skill="${escapeHtml(skill.name)}" aria-label="Set your ${escapeHtml(skill.name)} level">${[0,1,2,3,4,5].map((level) => `<option value="${level}" ${level === value ? "selected" : ""}>${level} / 5</option>`).join("")}</select></label></div>`;
      }).join("")}</div>
      <div class="source-note"><strong>Source & verification:</strong> these sample skill targets are illustrative demo data, not verified employer requirements. Confirm role expectations with current job listings, course advisors, or industry professionals before making important decisions.</div>
    </section>
    <div class="career-layout"><section class="surface surface-pad"><div class="section-heading"><div><h2>Your next milestones</h2><p>Choose a small proof-of-skill activity for your portfolio</p></div><span class="badge badge-amber">${gaps.length} OPEN</span></div><div class="career-steps">${gaps.slice(0, 4).map((skill) => {
      const id = `${selectedRole}:${skill.name}`;
      const done = state.milestones.includes(id);
      return `<div class="career-step ${done ? "done" : ""}"><button class="step-check" data-milestone="${escapeHtml(skill.name)}" aria-label="${done ? "Mark incomplete" : "Complete"}: ${escapeHtml(skill.evidence)}">${done ? "✓" : ""}</button><div><strong>${escapeHtml(skill.evidence)}</strong><small>Build evidence for ${escapeHtml(skill.name)} · ${done ? "Completed" : "Suggested project"}</small></div></div>`;
    }).join("") || `<div class="empty-state"><strong>All role targets reached.</strong>Keep collecting evidence and revisit your level estimates as your skills grow.</div>`}</div></section>
    <aside class="surface surface-pad"><div class="section-heading"><div><h2>Your roadmap</h2><p>Ordered by gap × role importance</p></div></div>${gaps.slice(0, 3).map((skill, index) => `<div class="roadmap-item"><span class="roadmap-step">${index + 1}</span><div class="roadmap-copy"><strong>${escapeHtml(skill.name)}</strong><small>${Math.max(skill.target - (state.skills[skill.name] || 0), 0)} level${Math.max(skill.target - (state.skills[skill.name] || 0), 0) === 1 ? "" : "s"} to target · weight ${skill.weight}</small></div></div>`).join("") || `<p class="page-subtitle">No current skill gaps. Keep your profile up to date.</p>`}<div class="sidebar-tip"><strong>Make it yours.</strong><br>Completion marks and level estimates are only stored on this device. Add a project link in your profile when you have one to share.</div></aside></div>`;
}

function careerGaps(requirements = roles[state.role] || roles["Frontend developer"]) {
  return requirements.map((skill) => ({ ...skill, gap: Math.max(skill.target - (state.skills[skill.name] || 0), 0), weightedGap: Math.max(skill.target - (state.skills[skill.name] || 0), 0) * skill.weight }))
    .filter((skill) => skill.gap > 0)
    .sort((a, b) => b.weightedGap - a.weightedGap);
}

function careerMatch() {
  const requirements = roles[state.role] || roles["Frontend developer"];
  const total = requirements.reduce((sum, skill) => sum + skill.target * skill.weight, 0);
  const achieved = requirements.reduce((sum, skill) => sum + Math.min(state.skills[skill.name] || 0, skill.target) * skill.weight, 0);
  return Math.round(achieved / total * 100);
}

function slug(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderProfile() {
  const profile = state.profile;
  return `${pageHeading("YOUR STUDENT SPACE", "My profile", "Keep your learning profile current. Your details stay in this browser.", "")}
    <div class="profile-grid"><section class="surface surface-pad"><div class="profile-identity"><span class="avatar avatar-large">${initials(profile.name)}</span><div><h2>${escapeHtml(profile.name)}</h2><p>${escapeHtml(profile.program)} · ${escapeHtml(profile.year)}</p></div></div>
      <form id="profile-form"><div class="profile-fields"><div class="field"><label for="profile-name">Your name</label><input id="profile-name" maxlength="80" required value="${escapeHtml(profile.name)}"></div><div class="field"><label for="profile-email">Email address</label><input id="profile-email" type="email" maxlength="120" value="${escapeHtml(profile.email)}"></div><div class="field"><label for="profile-program">Program or course</label><input id="profile-program" maxlength="120" value="${escapeHtml(profile.program)}"></div><div class="field"><label for="profile-year">Study year</label><select id="profile-year"><option ${profile.year === "Year 1" ? "selected" : ""}>Year 1</option><option ${profile.year === "Year 2" ? "selected" : ""}>Year 2</option><option ${profile.year === "Year 3" ? "selected" : ""}>Year 3</option><option ${profile.year === "Year 4" ? "selected" : ""}>Year 4</option><option ${profile.year === "Other" ? "selected" : ""}>Other</option></select></div></div><div style="margin-top:16px"><button class="button button-primary" type="submit">Save profile</button></div></form>
    </section><aside><section class="surface surface-pad"><div class="section-heading"><div><h2>About your data</h2><p>Simple and transparent by design</p></div></div>    <div class="assignment-brief"><p>This demo saves learning progress in this browser, separately for each signed-in student. Your account and password are handled by the server.</p><ul><li>Passwords are hashed by the PHP server</li><li>Learning progress is stored locally in this browser</li><li>No external AI or grading service</li><li>No verified employer or course data</li></ul></div><div style="margin-top:14px"><button class="button button-outline" data-action="reset-demo">Reset demo data</button></div></section></aside></div>`;
}

function renderNotifications() {
  const items = state.activity;
  return `${pageHeading("A MOMENT TO CATCH UP", "Notifications", "A friendly record of the learning steps you’ve taken.", "")}<section class="surface surface-pad"><div class="section-heading"><div><h2>Recent updates</h2><p>Your progress is private to this browser</p></div></div>${items.length ? `<div class="notification-list">${items.map((item) => `<article class="notification-item"><span class="activity-mark ${item.tone}">${item.icon}</span><div><strong>${escapeHtml(item.title)}</strong><p>${escapeHtml(item.detail)} · ${escapeHtml(item.time)}</p></div></article>`).join("")}</div>` : `<div class="empty-state"><strong>All caught up.</strong>New learning activity will appear here.</div>`}</section>`;
}

function showToast(message) {
  const region = document.getElementById("toast-region");
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  region.append(toast);
  window.setTimeout(() => toast.remove(), 3600);
}

function addActivity(title, detail, icon = "✓", tone = "green") {
  state.activity.unshift({ title, detail, icon, tone, time: "Just now" });
  state.activity = state.activity.slice(0, 12);
}

function startDiagnostic() {
  renderQuiz();
  document.getElementById("main-content").focus();
}

function submitDiagnostic(form) {
  const data = new FormData(form);
  const totals = Object.fromEntries(topics.map((topic) => [topic.name, { correct: 0, total: 0 }]));
  quizQuestions.forEach((question, index) => {
    const response = data.get(`question-${index}`);
    totals[question.topic].total += 1;
    if (response === question.answer) totals[question.topic].correct += 1;
  });
  const byTopic = {};
  for (const [name, result] of Object.entries(totals)) {
    byTopic[name] = { ...result, score: Math.round(result.correct / result.total * 100) };
    state.mastery[name] = byTopic[name].score;
  }
  const overall = Math.round(Object.values(byTopic).reduce((sum, result) => sum + result.score, 0) / Object.keys(byTopic).length);
  const attempt = { score: overall, byTopic, date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date()) };
  state.attempts.unshift(attempt);
  addActivity("Learning diagnostic completed", `${overall}% overall · personalized roadmap updated`, "✓", "green");
  saveState();
  updateNames();
  renderQuizResults(attempt);
}

function evaluateAssignment(form) {
  const title = document.getElementById("assignment-title").value.trim();
  const text = document.getElementById("assignment-text").value.trim();
  if (text.split(/\s+/).filter(Boolean).length < 8) {
    document.getElementById("assignment-text").setCustomValidity("Write at least 8 words so the practice checklist has something to review.");
    document.getElementById("assignment-text").reportValidity();
    document.getElementById("assignment-text").setCustomValidity("");
    return;
  }
  const feedback = analyzeDraft(title, text);
  state.assignment = { title, text, feedback, updatedAt: new Date().toISOString() };
  addActivity("Writing practice reviewed", `${feedback.score}/${feedback.max} checklist points · private draft`, "▧", "blue");
  saveState();
  showFeedback(feedback, title);
  showToast("Your private writing check is ready.");
}

function startFocus() {
  const dialog = document.getElementById("focus-dialog");
  focusSeconds = 20 * 60;
  document.getElementById("focus-timer").textContent = "20:00";
  document.getElementById("focus-title").textContent = "Your 20-minute focus session";
  document.getElementById("focus-copy").textContent = "Put one small task first. You can do more than you think.";
  document.getElementById("focus-start").textContent = "Start timer";
  document.getElementById("focus-start").dataset.running = "false";
  if (focusInterval) window.clearInterval(focusInterval);
  dialog.showModal();
}

function toggleFocusTimer(button) {
  if (button.dataset.running === "true") {
    window.clearInterval(focusInterval);
    focusInterval = null;
    button.dataset.running = "false";
    button.textContent = "Resume timer";
    return;
  }
  button.dataset.running = "true";
  button.textContent = "Pause timer";
  focusInterval = window.setInterval(() => {
    focusSeconds -= 1;
    const minutes = String(Math.floor(focusSeconds / 60)).padStart(2, "0");
    const seconds = String(focusSeconds % 60).padStart(2, "0");
    document.getElementById("focus-timer").textContent = `${minutes}:${seconds}`;
    if (focusSeconds <= 0) {
      window.clearInterval(focusInterval);
      focusInterval = null;
      button.dataset.running = "false";
      button.textContent = "Start another session";
      document.getElementById("focus-title").textContent = "You made space to focus.";
      document.getElementById("focus-copy").textContent = "Take a breath, then celebrate the small win.";
      showToast("Focus session complete. Nice work!");
    }
  }, 1000);
}

function resetDemo() {
  const confirmed = window.confirm("Reset all Student Success demo data saved in this browser?");
  if (!confirmed) return;
  if (account) {
    try {
      localStorage.removeItem(`${STORAGE_KEY}:${account.email}`);
    } catch (error) {
      console.error("Could not clear this student's saved progress.", error);
      showToast("Your browser could not clear saved demo progress.");
      return;
    }
    state = loadState();
  } else {
    state = structuredClone(defaultState);
    saveState();
  }
  renderPage();
  updateNames();
  showToast("Demo data has been reset.");
}

function validateStudentProfile() {
  if (!account) return false;
  const requestedEmail = document.getElementById("profile-email").value.trim().toLowerCase();
  const requestedName = document.getElementById("profile-name").value.trim();
  if (requestedEmail !== account.email.toLowerCase()) {
    showToast("Your sign-in email cannot be changed here.");
    return true;
  }
  if (!requestedName || requestedName.length > 120) {
    showToast("Enter a name up to 120 characters.");
    return true;
  }
  showToast("Account profile editing will be available after it is connected to the database.");
  return true;
}

document.addEventListener("click", (event) => {
  const pageLink = event.target.closest("[data-page], [data-page-link]");
  if (pageLink) {
    event.preventDefault();
    navigate(pageLink.dataset.page || pageLink.dataset.pageLink);
    return;
  }
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (action === "start-diagnostic") startDiagnostic();
  if (action === "cancel-quiz" || action === "open-learning") navigate("learning");
  if (action === "start-focus") startFocus();
  if (action === "notifications") navigate("notifications");
  if (action === "reset-demo" || action === "reset-career") resetDemo();
  if (action === "reset-demo" || action === "reset-career") event.preventDefault();

  const role = event.target.closest("[data-role]")?.dataset.role;
  if (role && roles[role]) {
    state.role = role;
    saveState();
    renderPage();
  }
  const milestone = event.target.closest("[data-milestone]")?.dataset.milestone;
  if (milestone) {
    const id = `${state.role}:${milestone}`;
    state.milestones = state.milestones.includes(id) ? state.milestones.filter((item) => item !== id) : [...state.milestones, id];
    addActivity("Career milestone updated", milestone, "↗", "amber");
    saveState();
    renderPage();
  }
});

document.addEventListener("change", (event) => {
  const skillName = event.target.dataset.skill;
  if (skillName) {
    state.skills[skillName] = Number(event.target.value);
    saveState();
    renderPage();
    showToast(`${skillName} level updated.`);
  }
});

document.addEventListener("submit", (event) => {
  if (event.target.id === "quiz-form") {
    event.preventDefault();
    submitDiagnostic(event.target);
  }
  if (event.target.id === "assignment-form") {
    event.preventDefault();
    evaluateAssignment(event.target);
  }
  if (event.target.id === "profile-form") {
    event.preventDefault();
    if (validateStudentProfile()) return;
    state.profile = {
      name: document.getElementById("profile-name").value.trim() || "Student",
      email: document.getElementById("profile-email").value.trim(),
      program: document.getElementById("profile-program").value.trim() || "Student",
      year: document.getElementById("profile-year").value
    };
    saveState();
    renderPage();
    showToast("Your profile has been saved on this device.");
  }
});

document.getElementById("mobile-menu").addEventListener("click", (event) => {
  const open = document.getElementById("sidebar").classList.toggle("is-open");
  event.currentTarget.setAttribute("aria-expanded", String(open));
  event.currentTarget.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
});

document.getElementById("focus-start").addEventListener("click", (event) => toggleFocusTimer(event.currentTarget));
document.getElementById("focus-dialog").addEventListener("close", () => {
  if (focusInterval) window.clearInterval(focusInterval);
  focusInterval = null;
});

window.addEventListener("hashchange", () => setCurrentPage(location.hash.slice(1)));
document.getElementById("today-label").textContent = new Intl.DateTimeFormat("en", { weekday: "short", month: "short", day: "numeric" }).format(new Date());
setCurrentPage(location.hash.slice(1) || "dashboard");
