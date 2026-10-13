<?php
declare(strict_types=1);

require __DIR__ . '/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    http_response_code(405);
    exit('Method not allowed.');
}

$submittedToken = $_POST['csrf_token'] ?? '';
if (!is_string($submittedToken) || !hash_equals(csrfToken(), $submittedToken)) {
    $_SESSION['auth_error'] = 'Your session expired. Please try again.';
    redirectTo('index.php');
}

$action = $_POST['action'] ?? '';

try {
    if ($action === 'register') {
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');

        if ($name === '' || mb_strlen($name) > 120) {
            $_SESSION['auth_error'] = 'Enter your name (up to 120 characters).';
            redirectTo('index.php?mode=register');
        }
        if (mb_strlen($email) > 190 || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $_SESSION['auth_error'] = 'Enter a valid email address.';
            redirectTo('index.php?mode=register');
        }
        if (strlen($password) < 10 || strlen($password) > 72) {
            $_SESSION['auth_error'] = 'Choose a password between 10 and 72 characters.';
            redirectTo('index.php?mode=register');
        }

        $statement = database()->prepare(
            'INSERT INTO users (name, email, password_hash, role, is_active) VALUES (:name, :email, :password_hash, \'student\', 1)'
        );
        $statement->execute([
            'name' => $name,
            'email' => $email,
            'password_hash' => password_hash($password, PASSWORD_DEFAULT),
        ]);

        session_regenerate_id(true);
        $_SESSION['student'] = [
            'id' => (int) database()->lastInsertId(),
            'name' => $name,
            'email' => $email,
            'role' => 'student',
        ];
        unset($_SESSION['csrf_token']);
        redirectTo('dashboard.php');
    }

    if ($action === 'login') {
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');

        if (mb_strlen($email) > 190 || !filter_var($email, FILTER_VALIDATE_EMAIL) || $password === '') {
            $_SESSION['auth_error'] = 'The email or password you entered is incorrect.';
            redirectTo('index.php');
        }

        $statement = database()->prepare(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = :email AND is_active = 1 LIMIT 1'
        );
        $statement->execute(['email' => $email]);
        $student = $statement->fetch();

        if (!$student || $student['role'] !== 'student' || !password_verify($password, $student['password_hash'])) {
            $_SESSION['auth_error'] = 'The email or password you entered is incorrect.';
            redirectTo('index.php');
        }

        if (password_needs_rehash($student['password_hash'], PASSWORD_DEFAULT)) {
            $rehash = database()->prepare('UPDATE users SET password_hash = :password_hash WHERE id = :id');
            $rehash->execute([
                'password_hash' => password_hash($password, PASSWORD_DEFAULT),
                'id' => $student['id'],
            ]);
        }

        session_regenerate_id(true);
        $_SESSION['student'] = [
            'id' => (int) $student['id'],
            'name' => $student['name'],
            'email' => $student['email'],
            'role' => 'student',
        ];
        unset($_SESSION['csrf_token']);
        redirectTo('dashboard.php');
    }

    if ($action === 'logout') {
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $cookie = session_get_cookie_params();
            setcookie(session_name(), '', [
                'expires' => time() - 42000,
                'path' => $cookie['path'],
                'domain' => $cookie['domain'],
                'secure' => $cookie['secure'],
                'httponly' => $cookie['httponly'],
                'samesite' => $cookie['samesite'] ?? 'Lax',
            ]);
        }
        session_destroy();
        redirectTo('index.php');
    }

    http_response_code(400);
    exit('Invalid authentication action.');
} catch (PDOException $error) {
    error_log('Student authentication database error: ' . $error->getMessage());
    if ($action === 'register' && $error->getCode() === '23000') {
        $_SESSION['auth_error'] = 'An account with that email already exists. Try signing in instead.';
        redirectTo('index.php?mode=register');
    }

    $_SESSION['auth_error'] = 'We could not complete that request. Check that the database is set up, then try again.';
    redirectTo($action === 'register' ? 'index.php?mode=register' : 'index.php');
} catch (Throwable $error) {
    error_log('Student authentication error: ' . $error->getMessage());
    $_SESSION['auth_error'] = 'We could not complete that request. Please try again.';
    redirectTo($action === 'register' ? 'index.php?mode=register' : 'index.php');
}
