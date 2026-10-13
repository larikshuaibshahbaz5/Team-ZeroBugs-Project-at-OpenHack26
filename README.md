# Student Success

A responsive, interactive prototype based on the Smart Student Success Platform specification. It brings together an adaptive learning path, an assignment-writing practice checklist, and a career skill-gap navigator.

## Student accounts (PHP/MySQL)

Requires PHP 8.1+ with `pdo_mysql`, and MySQL. Starter connection defaults match the existing local SQLTools profile: database `smart_student_success` on port `3380`, username `root`.

1. Run `database/schema.sql` in MySQL to create the database and account tables. Confirm that your MySQL server listens on port `3380`.
2. Copy `.env.example` to `.env` and set your MySQL username and password. `.env` is excluded from Git. Never put database credentials in frontend JavaScript or share them in chat.
3. In PowerShell, from this project directory, start the protected local PHP server: `C:\xampp\php\php.exe -S localhost:8000 router.php`. The router blocks direct browser access to `.env`, `database/`, `.vscode/`, and `config.php`.
4. Visit `http://localhost:8000`, create a student account, and sign in. Use **Sign out** in the dashboard header to end your session.

New registrations receive the `student` role on the server; browser-submitted roles are never trusted. Passwords use PHP `password_hash()` / `password_verify()`, authentication uses prepared PDO statements, forms use CSRF tokens, and sessions regenerate their ID after sign-in.

`index.html` remains the standalone browser-only demo. Use `index.php` and `dashboard.php` through PHP for the database-backed student login flow.

## Working prototype features

- Student dashboard, responsive sidebar navigation, study timer, activity feed, and progress summaries. The starter dashboard's weekly study chart is illustrative sample data.
- Eight-question JavaScript diagnostic, automatic scoring by topic, mastery bands, attempt history, and explainable next-topic recommendations.
- Writing practice form with a visible, deterministic checklist rubric. It is explicitly not an AI service or an official grade.
- Four sample career roles, editable 0–5 skill estimates, weighted skill gaps, project milestones, and explicit source/verification caveats.
- Editable student profile and local reset.

## Prototype boundaries

Account creation and student authentication use PHP/MySQL. Learning progress is still browser-side local storage, namespaced per signed-in email; it does not sync between devices. Learning quiz, writing practice, and career planner remain demonstration features. Teacher review, file uploads, external AI feedback, employer data verification, password reset, email verification, and server-side progress sync are not implemented.

Use sample data until deploying with HTTPS and a least-privilege database account. Do not collect sensitive student information in this prototype.
