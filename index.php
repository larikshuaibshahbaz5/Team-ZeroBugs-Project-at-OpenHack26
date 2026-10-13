<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if (isset($_SESSION['student']) && ($_SESSION['student']['role'] ?? '') === 'student') {
    redirectTo('dashboard.php');
}

$mode = ($_GET['mode'] ?? '') === 'register' ? 'register' : 'login';
$errorMessage = $_SESSION['auth_error'] ?? '';
unset($_SESSION['auth_error']);
$token = csrfToken();
?><!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#172b4d">
    <title><?= $mode === 'register' ? 'Create student account' : 'Student sign in' ?> — Student Success</title>
    <link rel="stylesheet" href="styles.css">
  </head>
  <body class="auth-page">
    <main class="auth-layout">
      <section class="auth-brand-panel">
        <a class="brand auth-brand" href="index.php" aria-label="Student Success">
          <span class="brand-mark" aria-hidden="true">s<span>.</span></span>
          <span class="brand-copy"><strong>student<span>success</span></strong><small>LEARNING PLATFORM</small></span>
        </a>
        <div class="auth-message">
          <p class="eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h1>A little progress, every day.</h1>
          <p>Find your learning rhythm, get better at your craft, and take the next step toward a future you choose.</p>
          <div class="auth-benefits"><span>✓ &nbsp;Your own adaptive learning path</span><span>✓ &nbsp;A space to practice and reflect</span><span>✓ &nbsp;Career goals that grow with you</span></div>
        </div>
        <span class="auth-panel-caption">Your learning, in motion.</span>
      </section>
      <section class="auth-form-panel">
        <div class="auth-card">
          <p class="eyebrow"><?= $mode === 'register' ? 'LET’S GET YOU STARTED' : 'WELCOME BACK' ?></p>
          <h2><?= $mode === 'register' ? 'Create your account' : 'Sign in to your space' ?></h2>
          <p class="auth-intro"><?= $mode === 'register' ? 'Create a student account to save your learning progress.' : 'Your next step is waiting whenever you’re ready.' ?></p>
          <?php if ($errorMessage !== ''): ?>
            <div class="auth-error" role="alert"><?= escapeHtml((string) $errorMessage) ?></div>
          <?php endif; ?>
          <form class="auth-form" action="auth.php" method="post">
            <input type="hidden" name="csrf_token" value="<?= escapeHtml($token) ?>">
            <input type="hidden" name="action" value="<?= $mode === 'register' ? 'register' : 'login' ?>">
            <?php if ($mode === 'register'): ?>
              <div class="field"><label for="name">Full name</label><input id="name" name="name" type="text" autocomplete="name" maxlength="120" placeholder="Your name" required></div>
            <?php endif; ?>
            <div class="field"><label for="email">Student email</label><input id="email" name="email" type="email" autocomplete="email" maxlength="190" placeholder="you@example.edu" required></div>
            <div class="field"><label for="password">Password <?php if ($mode === 'register'): ?><span class="field-hint">— at least 10 characters</span><?php endif; ?></label><input id="password" name="password" type="password" autocomplete="<?= $mode === 'register' ? 'new-password' : 'current-password' ?>" minlength="<?= $mode === 'register' ? '10' : '1' ?>" maxlength="72" placeholder="<?= $mode === 'register' ? 'Choose a strong password' : 'Enter your password' ?>" required></div>
            <button class="button button-primary auth-submit" type="submit"><?= $mode === 'register' ? 'Create student account' : 'Sign in' ?> <span aria-hidden="true">→</span></button>
          </form>
          <p class="auth-switch"><?= $mode === 'register' ? 'Already have an account?' : 'New to Student Success?' ?> <a href="<?= $mode === 'register' ? 'index.php' : 'index.php?mode=register' ?>"><?= $mode === 'register' ? 'Sign in' : 'Create a student account' ?></a></p>
          <p class="auth-privacy">Your password is stored as a secure hash. Never share your password with anyone.</p>
        </div>
      </section>
    </main>
  </body>
</html>
