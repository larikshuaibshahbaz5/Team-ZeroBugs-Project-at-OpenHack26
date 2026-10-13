<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

$student = $_SESSION['student'] ?? null;
if (!is_array($student) || ($student['role'] ?? '') !== 'student' || !isset($student['id'])) {
    redirectTo('index.php');
}

$token = csrfToken();
$name = escapeHtml((string) ($student['name'] ?? 'Student'));
?><!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#172b4d">
    <meta name="description" content="Your personal Smart Student Success learning dashboard.">
    <title>Student dashboard — Student Success</title>
    <link rel="stylesheet" href="styles.css">
    <script src="app.js" defer></script>
  </head>
  <body>
    <script>
      window.STUDENT_ACCOUNT = Object.freeze({ name: <?= json_encode((string) ($student['name'] ?? 'Student'), JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) ?>, email: <?= json_encode((string) ($student['email'] ?? ''), JSON_HEX_TAG | JSON_HEX_APOS | JSON_HEX_AMP | JSON_HEX_QUOT) ?> });
    </script>
    <div class="app-shell">
      <aside class="sidebar" id="sidebar">
        <a class="brand" href="dashboard.php" aria-label="Student Success home">
          <span class="brand-mark" aria-hidden="true">s<span>.</span></span>
          <span class="brand-copy"><strong>student<span>success</span></strong><small>LEARNING PLATFORM</small></span>
        </a>
        <div class="workspace-label">WORKSPACE</div>
        <nav class="primary-nav" aria-label="Main navigation">
          <a class="nav-link" href="#dashboard" data-page="dashboard"><span class="nav-icon">⌂</span><span>Dashboard</span></a>
          <a class="nav-link" href="#learning" data-page="learning"><span class="nav-icon">▤</span><span>My learning</span><span class="nav-count" id="learning-count">4</span></a>
          <a class="nav-link" href="#assignments" data-page="assignments"><span class="nav-icon">▧</span><span>Assignments</span><span class="nav-dot" aria-label="New"></span></a>
          <a class="nav-link" href="#career" data-page="career"><span class="nav-icon">↗</span><span>Career path</span></a>
        </nav>
        <div class="sidebar-divider"></div>
        <div class="workspace-label">YOUR SPACE</div>
        <nav class="primary-nav" aria-label="Personal navigation">
          <a class="nav-link" href="#profile" data-page="profile"><span class="nav-icon">◎</span><span>My profile</span></a>
        </nav>
        <div class="sidebar-bottom">
          <div class="help-card">
            <span class="help-spark" aria-hidden="true">✳</span>
            <strong>Small steps add up.</strong>
            <p>Your next focused session is just 20 minutes away.</p>
            <button class="help-link" data-action="start-focus">Start a focus session <span>→</span></button>
          </div>
          <div class="user-mini">
            <span class="avatar avatar-small" data-user-initials></span>
            <span class="user-mini-copy"><strong id="sidebar-name"><?= $name ?></strong><small>Student account</small></span>
          </div>
        </div>
      </aside>
      <div class="main-column">
        <header class="topbar">
          <button class="mobile-menu" id="mobile-menu" aria-label="Open navigation" aria-expanded="false">☰</button>
          <div class="breadcrumb"><span>Workspace</span><span class="breadcrumb-slash">/</span><strong id="breadcrumb-current">Dashboard</strong></div>
          <div class="topbar-actions">
            <span class="today-label" id="today-label"></span>
            <button class="icon-button notification-button" aria-label="Notifications" data-action="notifications"><span>♧</span><i></i></button>
            <div class="top-profile"><span class="avatar avatar-small" data-user-initials></span><span id="topbar-name"><?= $name ?></span></div>
            <form class="logout-form" action="auth.php" method="post">
              <input type="hidden" name="csrf_token" value="<?= escapeHtml($token) ?>">
              <input type="hidden" name="action" value="logout">
              <button type="submit">Sign out</button>
            </form>
          </div>
        </header>
        <main id="main-content" tabindex="-1"></main>
        <footer class="app-footer"><span>Made for your next big step.</span><span>Learning is a journey <span class="footer-heart">♥</span></span></footer>
      </div>
    </div>
    <div class="toast-region" id="toast-region" aria-live="polite" aria-atomic="true"></div>
    <dialog class="focus-dialog" id="focus-dialog">
      <form method="dialog"><button class="dialog-close" aria-label="Close">×</button></form>
      <span class="focus-orbit">◷</span>
      <p class="eyebrow">A LITTLE SPACE TO FOCUS</p>
      <h2 id="focus-title">Your 20-minute focus session</h2>
      <p id="focus-copy">Put one small task first. You can do more than you think.</p>
      <div class="timer" id="focus-timer">20:00</div>
      <button class="button button-primary" id="focus-start">Start timer</button>
    </dialog>
  </body>
</html>
