<?php
declare(strict_types=1);

function loadEnvironment(string $path): void
{
    if (!is_file($path) || !is_readable($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    if ($lines === false) {
        throw new RuntimeException('Unable to read application environment file.');
    }

    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$name, $value] = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);
        if ($name !== '' && getenv($name) === false) {
            putenv($name . '=' . $value);
            $_ENV[$name] = $value;
        }
    }
}

loadEnvironment(__DIR__ . '/.env');

function environment(string $name, string $default = ''): string
{
    $value = getenv($name);
    return $value === false ? $default : $value;
}

$https = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';
session_name('student_success_session');
session_set_cookie_params([
    'lifetime' => 0,
    'path' => '/',
    'secure' => $https,
    'httponly' => true,
    'samesite' => 'Lax',
]);

if (session_status() !== PHP_SESSION_ACTIVE && !session_start()) {
    throw new RuntimeException('Unable to start a secure student session.');
}

function database(): PDO
{
    static $pdo;
    if ($pdo instanceof PDO) {
        return $pdo;
    }

    $host = environment('DB_HOST', '127.0.0.1');
    $port = environment('DB_PORT', '3380');
    $name = environment('DB_DATABASE', 'smart_student_success');
    $username = environment('DB_USERNAME', 'root');
    $password = environment('DB_PASSWORD');

    if (!preg_match('/^[A-Za-z0-9_.-]+$/', $host)
        || !preg_match('/^\d{1,5}$/', $port)
        || (int) $port < 1
        || (int) $port > 65535
        || !preg_match('/^[A-Za-z0-9_$-]+$/', $name)) {
        throw new RuntimeException('Database configuration contains an invalid host, port, or name.');
    }

    $dsn = sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', $host, $port, $name);
    $pdo = new PDO($dsn, $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $pdo;
}

function csrfToken(): string
{
    if (!isset($_SESSION['csrf_token']) || !is_string($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    return $_SESSION['csrf_token'];
}

function escapeHtml(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function redirectTo(string $location): never
{
    header('Location: ' . $location, true, 303);
    exit;
}
