const crypto = require('node:crypto');
const fileSystem = require('node:fs');
const fs = require('node:fs/promises');
const http = require('node:http');
const path = require('node:path');
const { promisify } = require('node:util');

const ROOT = __dirname;
const DATA_DIR = path.resolve(process.env.DATA_DIR || path.join(ROOT, 'data'));
const DATABASE_PATH = path.join(DATA_DIR, 'accounts.json');
const SECRET_PATH = path.join(DATA_DIR, 'session-secret');
const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || '0.0.0.0';
const TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 30;
const PASSWORD_ITERATIONS = 210_000;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
};

const deriveKey = promisify(crypto.pbkdf2);
let signingSecret;
let databaseQueue = Promise.resolve();

function sendJson(response, status, value) {
  const body = JSON.stringify(value);
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff',
  });
  response.end(body);
}

function fail(status, code, message) {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  return error;
}

async function readBody(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > MAX_BODY_BYTES) throw fail(413, 'BODY_TOO_LARGE', 'Requisição muito grande.');
    chunks.push(chunk);
  }
  let body;
  try {
    body = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw fail(400, 'INVALID_JSON', 'Corpo JSON inválido.');
  }
  if (body === null || typeof body !== 'object' || Array.isArray(body)) {
    throw fail(400, 'INVALID_BODY', 'O corpo da requisição deve ser um objeto JSON.');
  }
  return body;
}

function withDatabaseLock(operation) {
  const result = databaseQueue.then(operation, operation);
  databaseQueue = result.then(() => undefined, () => undefined);
  return result;
}

async function readDatabase() {
  let database;
  try {
    database = JSON.parse(await fs.readFile(DATABASE_PATH, 'utf8'));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
    return { accounts: Object.create(null) };
  }
  if (!database || typeof database !== 'object' || !database.accounts || typeof database.accounts !== 'object' || Array.isArray(database.accounts)) {
    throw new Error('Banco de contas inválido.');
  }
  database.accounts = Object.assign(Object.create(null), database.accounts);
  return database;
}

async function writeDatabase(database) {
  await fs.mkdir(DATA_DIR, { recursive: true });
  const temporaryPath = `${DATABASE_PATH}.${process.pid}.${crypto.randomUUID()}.tmp`;
  try {
    await fs.writeFile(temporaryPath, JSON.stringify(database), { mode: 0o600 });
    await fs.rename(temporaryPath, DATABASE_PATH);
  } catch (error) {
    await fs.rm(temporaryPath, { force: true }).catch(() => {});
    throw error;
  }
}

function normalizeCredentials(body) {
  const username = typeof body.username === 'string' ? body.username.trim().toLowerCase() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (username.length < 3 || username.length > 16 || /[\u0000-\u001f\u007f]/.test(username) || ['__proto__', 'prototype', 'constructor', 'tostring', 'valueof', 'hasownproperty'].includes(username)) {
    throw fail(400, 'INVALID_USERNAME', 'O usuário deve ter de 3 a 16 caracteres.');
  }
  if (password.length < 4 || password.length > 128) {
    throw fail(400, 'INVALID_PASSWORD', 'A senha deve ter de 4 a 128 caracteres.');
  }
  return { username, password };
}

function isSave(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

async function passwordHash(password, salt) {
  return deriveKey(password, salt, PASSWORD_ITERATIONS, 32, 'sha256');
}

function issueToken(username) {
  const payload = Buffer.from(JSON.stringify({
    username,
    expires: Math.floor(Date.now() / 1000) + TOKEN_LIFETIME_SECONDS,
    nonce: crypto.randomBytes(12).toString('base64url'),
  })).toString('base64url');
  const signature = crypto.createHmac('sha256', signingSecret).update(payload).digest('base64url');
  return `${payload}.${signature}`;
}

function tokenUsername(request) {
  const authorization = request.headers.authorization || '';
  const match = /^Bearer ([A-Za-z0-9_.-]+)$/.exec(authorization);
  if (!match) throw fail(401, 'UNAUTHENTICATED', 'Faça login novamente.');
  const [payload, suppliedSignature] = match[1].split('.');
  if (!payload || !suppliedSignature) throw fail(401, 'UNAUTHENTICATED', 'Sessão inválida.');
  const expectedSignature = crypto.createHmac('sha256', signingSecret).update(payload).digest();
  let actualSignature;
  try {
    actualSignature = Buffer.from(suppliedSignature, 'base64url');
  } catch {
    throw fail(401, 'UNAUTHENTICATED', 'Sessão inválida.');
  }
  if (actualSignature.length !== expectedSignature.length || !crypto.timingSafeEqual(actualSignature, expectedSignature)) {
    throw fail(401, 'UNAUTHENTICATED', 'Sessão inválida.');
  }
  let claims;
  try {
    claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
  } catch {
    throw fail(401, 'UNAUTHENTICATED', 'Sessão inválida.');
  }
  if (typeof claims.username !== 'string' || claims.expires <= Date.now() / 1000) {
    throw fail(401, 'UNAUTHENTICATED', 'Sessão expirada. Faça login novamente.');
  }
  return claims.username;
}

async function authenticate(mode, body) {
  const { username, password } = normalizeCredentials(body);
  if (mode === 'register') {
    if (!isSave(body.save)) throw fail(400, 'INVALID_SAVE', 'Dados do personagem inválidos.');
    return withDatabaseLock(async () => {
      const database = await readDatabase();
      if (Object.hasOwn(database.accounts, username)) throw fail(409, 'ACCOUNT_EXISTS', 'Esse nome de usuário já está cadastrado.');
      const salt = crypto.randomBytes(16);
      const hash = await passwordHash(password, salt);
      database.accounts[username] = {
        salt: salt.toString('base64url'),
        passwordHash: hash.toString('base64url'),
        save: body.save,
        createdAt: new Date().toISOString(),
      };
      await writeDatabase(database);
      return { token: issueToken(username), username, save: body.save };
    });
  }

  if (mode === 'login') {
    const database = await readDatabase();
    const account = Object.hasOwn(database.accounts, username) ? database.accounts[username] : null;
    if (!account) throw fail(404, 'ACCOUNT_NOT_FOUND', 'Conta não encontrada.');
    const salt = Buffer.from(account.salt, 'base64url');
    const actualHash = await passwordHash(password, salt);
    const expectedHash = Buffer.from(account.passwordHash, 'base64url');
    if (actualHash.length !== expectedHash.length || !crypto.timingSafeEqual(actualHash, expectedHash)) {
      throw fail(401, 'INVALID_CREDENTIALS', 'Usuário ou senha incorretos.');
    }
    return { token: issueToken(username), username, save: account.save };
  }

  throw fail(404, 'NOT_FOUND', 'Rota não encontrada.');
}

async function handleApi(request, response, url) {
  if (request.method === 'POST' && url.pathname === '/api/auth/register') {
    const result = await authenticate('register', await readBody(request));
    return sendJson(response, 201, result);
  }
  if (request.method === 'POST' && url.pathname === '/api/auth/login') {
    const result = await authenticate('login', await readBody(request));
    return sendJson(response, 200, result);
  }

  if (url.pathname === '/api/save') {
    const username = tokenUsername(request);
    if (request.method === 'GET') {
      const database = await readDatabase();
      const account = Object.hasOwn(database.accounts, username) ? database.accounts[username] : null;
      if (!account) throw fail(404, 'ACCOUNT_NOT_FOUND', 'Conta não encontrada.');
      return sendJson(response, 200, { username, save: account.save });
    }
    if (request.method === 'PUT') {
      const body = await readBody(request);
      if (!isSave(body.save)) throw fail(400, 'INVALID_SAVE', 'Dados do personagem inválidos.');
      await withDatabaseLock(async () => {
        const database = await readDatabase();
        const account = Object.hasOwn(database.accounts, username) ? database.accounts[username] : null;
        if (!account) throw fail(404, 'ACCOUNT_NOT_FOUND', 'Conta não encontrada.');
        account.save = body.save;
        await writeDatabase(database);
      });
      return sendJson(response, 200, { ok: true });
    }
  }

  if (request.method === 'DELETE' && url.pathname === '/api/account') {
    const username = tokenUsername(request);
    await withDatabaseLock(async () => {
      const database = await readDatabase();
      delete database.accounts[username];
      await writeDatabase(database);
    });
    return sendJson(response, 200, { ok: true });
  }

  return sendJson(response, 404, { error: 'NOT_FOUND', message: 'Rota não encontrada.' });
}

async function serveStatic(request, response, url) {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    response.writeHead(400).end();
    return;
  }
  pathname = path.posix.normalize(pathname);
  if (pathname === '/') pathname = '/index.html';
  if (!(pathname === '/index.html' || pathname.startsWith('/js/') || pathname.startsWith('/css/') || pathname.startsWith('/assets/'))) {
    response.writeHead(404).end();
    return;
  }
  const filePath = path.resolve(ROOT, `.${pathname}`);
  if (!filePath.startsWith(`${ROOT}${path.sep}`)) {
    response.writeHead(404).end();
    return;
  }
  try {
    const info = await fs.stat(filePath);
    if (!info.isFile()) throw new Error('Not a file');
    response.writeHead(200, {
      'Content-Type': MIME_TYPES[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else {
      const stream = fileSystem.createReadStream(filePath);
      stream.on('error', error => {
        console.error('Falha ao enviar arquivo estático:', error);
        if (response.headersSent) response.destroy();
        else response.writeHead(404).end();
      });
      response.on('close', () => stream.destroy());
      stream.pipe(response);
    }
  } catch (error) {
    if (response.headersSent) {
      console.error('Falha ao enviar arquivo estático:', error);
      response.destroy();
      return;
    }
    response.writeHead(404).end();
  }
}

async function loadSigningSecret() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  try {
    return await fs.readFile(SECRET_PATH);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const secret = crypto.randomBytes(32);
  try {
    await fs.writeFile(SECRET_PATH, secret, { flag: 'wx', mode: 0o600 });
    return secret;
  } catch (error) {
    if (error.code !== 'EEXIST') throw error;
    return fs.readFile(SECRET_PATH);
  }
}

async function main() {
  signingSecret = await loadSigningSecret();
  const server = http.createServer(async (request, response) => {
    let url;
    try {
      url = new URL(request.url, 'http://127.0.0.1');
    } catch {
      sendJson(response, 400, { error: 'INVALID_URL', message: 'URL inválida.' });
      return;
    }
    try {
      if (url.pathname.startsWith('/api/')) await handleApi(request, response, url);
      else await serveStatic(request, response, url);
    } catch (error) {
      if (!response.headersSent) {
        sendJson(response, error.status || 500, {
          error: error.code || 'SERVER_ERROR',
          message: error.status ? error.message : 'Erro interno do servidor.',
        });
      } else {
        response.destroy();
      }
      if (!error.status) console.error(error);
    }
  });
  server.listen(PORT, HOST, () => console.log(`Crônicas de Westeros em http://${HOST}:${PORT}`));
}

main().catch(error => {
  console.error('Não foi possível iniciar o servidor:', error);
  process.exitCode = 1;
});