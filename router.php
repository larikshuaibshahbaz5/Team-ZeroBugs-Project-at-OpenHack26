<?php
declare(strict_types=1);

$requestPath = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
$requestPath = is_string($requestPath) ? rawurldecode($requestPath) : '/';

if (str_contains($requestPath, "\0")
    || preg_match('~(?:^|/)\.\.?(/|$)~', $requestPath) === 1
    || preg_match('~(?:^|/)(?:\.env(?:\.[^/]*)?|\.git|\.vscode|database)(?:/|$)~i', $requestPath) === 1
    || preg_match('~(?:^|/)config\.php$~i', $requestPath) === 1) {
    http_response_code(404);
    exit('Not found.');
}

$file = __DIR__ . str_replace('/', DIRECTORY_SEPARATOR, $requestPath);
if ($requestPath !== '/' && is_file($file)) {
    return false;
}

if ($requestPath === '/' || $requestPath === '/index.php') {
    require __DIR__ . '/index.php';
    exit;
}

http_response_code(404);
echo 'Not found.';
