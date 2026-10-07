// AI Product Descriptions — Shopify App
// Built by AliceLabs LLC
// Generates AI product descriptions for Shopify merchants
// Uses z-ai-web-dev-sdk for AI generation
// Deployable on Cloudflare Workers

// Scopes sincronizados con Partner Dashboard → App → Versions → Access scopes
const SCOPES = 'read_products,write_products,read_product_feeds,write_product_feeds,read_product_listings,write_product_listings,unauthenticated_read_product_pickup_locations,unauthenticated_read_product_inventory,unauthenticated_read_product_listings,unauthenticated_read_product_tags';
const APP_URL = 'https://shopify-app.eddyflores100.workers.dev';
const SHOPIFY_API_VERSION = '2024-10';

// === SHOPIFY OAUTH INSTALL ===
async function handleInstall(request, url) {
  let shop = url.searchParams.get('shop') || '';
  // Normaliza: quita https://, http://, paths, etc. Solo deja el dominio .myshopify.com
  shop = shop.trim().toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
  if (!shop.endsWith('.myshopify.com')) {
    shop = `${shop}.myshopify.com`.replace(/\.myshopify\.myshopify\.com$/, '.myshopify.com');
  }
  if (!shop || shop === '.myshopify.com') {
    return new Response(installFormHTML(), { headers: { 'Content-Type': 'text/html' } });
  }

  const clientId = env_ShopifyClientId();
  if (!clientId || clientId === 'YOUR_APP_CLIENT_ID') {
    return new Response(errorHTML('SHOPIFY_CLIENT_ID no configurado en el Worker. Ejecuta: wrangler secret put SHOPIFY_CLIENT_ID'), { headers: { 'Content-Type': 'text/html' } });
  }

  const redirectUri = `${APP_URL}/auth/callback`;
  // State con nonce simple para CSRF protection
  const state = `${btoa(shop)}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${encodeURIComponent(state)}`;

  // Guarda state en cookie para verificar en callback (CSRF protection)
  return new Response(null, {
    status: 302,
    headers: {
      Location: installUrl,
      'Set-Cookie': `oauth_state=${state}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=600`,
    },
  });
}

// === SHOPIFY OAUTH CALLBACK ===
async function handleCallback(request, url) {
  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop');
  const state = url.searchParams.get('state');
  const error = url.searchParams.get('error');
  const errorDescription = url.searchParams.get('error_description');

  if (error) {
    return new Response(errorHTML(`Shopify rechazó la instalación: ${error} - ${errorDescription || ''}`), { headers: { 'Content-Type': 'text/html' } });
  }
  if (!code || !shop) {
    return new Response(errorHTML('Falta code o shop en el callback. Vuelve a intentarlo desde /install'), { headers: { 'Content-Type': 'text/html' } });
  }

  // Verifica state CSRF (si cookie existe)
  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
  if (cookies.oauth_state && cookies.oauth_state !== state) {
    return new Response(errorHTML('State CSRF mismatch. Vuelve a intentarlo desde /install'), { headers: { 'Content-Type': 'text/html' } });
  }

  const clientId = env_ShopifyClientId();
  const clientSecret = env_ShopifyClientSecret();
  if (!clientId || !clientSecret) {
    return new Response(errorHTML('Credenciales Shopify no configuradas en el Worker.'), { headers: { 'Content-Type': 'text/html' } });
  }

  // Exchange code for access token
  let tokenData;
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(errorHTML(`No se obtuvo access_token. Respuesta Shopify: ${JSON.stringify(tokenData)}`), { headers: { 'Content-Type': 'text/html' } });
    }
  } catch (e) {
    return new Response(errorHTML(`Error intercambiando code por token: ${e.message}`), { headers: { 'Content-Type': 'text/html' } });
  }

  const accessToken = tokenData.access_token;
  const scope = tokenData.scope || SCOPES;

  // Guarda token en KV (clave por shop)
  try {
    if (env_TOKENS && env_TOKENS.put) {
      await env_TOKENS.put(shop, JSON.stringify({ accessToken, scope, installedAt: new Date().toISOString() }));
    }
  } catch (e) {
    // KV no configurado — no es fatal, el token se puede usar en esta sesión
    console.log('KV no disponible, token no persistido:', e.message);
  }

  // Redirige a la app embedded dentro del admin de Shopify
  const appEmbeddedUrl = `https://${shop}/admin/apps/ai-product-descriptions`;
  return new Response(successHTML(shop), {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': `shop=${shop}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`,
    },
  });
}

// === AI DESCRIPTION GENERATION ===
async function generateDescription(productTitle, productType, tags, language = 'es') {
  const prompt = language === 'es'
    ? `Escribe una descripción de producto atractiva para "${productTitle}" (tipo: ${productType}, tags: ${tags}). Máximo 500 caracteres. Estilo comercial persuasivo. Sin emojis.`
    : language === 'pt'
    ? `Escreva uma descrição de produto atraente para "${productTitle}" (tipo: ${productType}, tags: ${tags}). Máximo 500 caracteres. Estilo comercial persuasivo. Sem emojis.`
    : `Write an attractive product description for "${productTitle}" (type: ${productType}, tags: ${tags}). Max 500 characters. Persuasive commercial style. No emojis.`;

  try {
    const res = await fetch('https://chat.z.ai/api/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No se pudo generar la descripción';
  } catch (e) {
    return `Error generando descripción: ${e.message}`;
  }
}

// === WEBHOOK HANDLER ===
async function handleWebhook(request, url) {
  const shop = request.headers.get('X-Shopify-Shop-Domain');
  const topic = request.headers.get('X-Shopify-Topic');
  const hmac = request.headers.get('X-Shopify-Hmac-Sha256');

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  if (topic === 'products/create' || topic === 'products/update') {
    // Recupera el token de la tienda desde KV
    let token = null;
    try {
      if (env_TOKENS && env_TOKENS.get) {
        const raw = await env_TOKENS.get(shop);
        if (raw) token = JSON.parse(raw).accessToken;
      }
    } catch (e) { console.log('KV get failed:', e.message); }

    const description = await generateDescription(
      body.title,
      body.product_type || 'general',
      body.tags || '',
      'es'
    );

    if (token) {
      await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${body.id}.json`, {
        method: 'PUT',
        headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: { id: body.id, body_html: `<p>${description}</p>` } }),
      });
    }
  }

  return json({ received: true });
}

// === EMBEDDED APP FRONTEND ===
function generateAppHTML(shop) {
  return `<!DOCTYPE html>
<html>
<head>
  <title>AI Product Descriptions</title>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">AI Product Descriptions</h1>
    <p class="text-gray-600 mb-2">Genera descripciones de producto con IA — multilingüe (ES/EN/PT)</p>
    <p class="text-sm text-gray-400 mb-8">Instalada en: <code class="bg-gray-200 px-2 py-0.5 rounded">${shop || 'tienda no detectada'}</code></p>

    <div class="bg-white rounded-xl shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">How it works</h2>
      <ol class="space-y-3 text-gray-700 list-decimal list-inside">
        <li>Install app on your Shopify store</li>
        <li>Select products that need descriptions</li>
        <li>Choose language (Spanish, English, Portuguese)</li>
        <li>Click "Generate Descriptions"</li>
        <li>AI writes professional descriptions in seconds</li>
        <li>Review and publish</li>
      </ol>
    </div>

    <div class="bg-white rounded-xl shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Pricing</h2>
      <div class="grid grid-cols-3 gap-4">
        <div class="border rounded-lg p-4 text-center">
          <h3 class="font-bold">Starter</h3>
          <p class="text-2xl font-bold my-2">$9/mo</p>
          <p class="text-sm text-gray-500">100 descriptions/mo</p>
          <p class="text-sm text-gray-500">1 language</p>
        </div>
        <div class="border-2 border-blue-500 rounded-lg p-4 text-center relative">
          <span class="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">Popular</span>
          <h3 class="font-bold">Pro</h3>
          <p class="text-2xl font-bold my-2">$29/mo</p>
          <p class="text-sm text-gray-500">1,000 descriptions/mo</p>
          <p class="text-sm text-gray-500">3 languages</p>
        </div>
        <div class="border rounded-lg p-4 text-center">
          <h3 class="font-bold">Unlimited</h3>
          <p class="text-2xl font-bold my-2">$49/mo</p>
          <p class="text-sm text-gray-500">Unlimited descriptions</p>
          <p class="text-sm text-gray-500">All languages</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl shadow p-6">
      <h2 class="text-xl font-semibold mb-4">Try it</h2>
      <textarea id="title" class="w-full border rounded-lg p-3 mb-3" rows="3" placeholder="Enter product title (e.g. 'Wireless Bluetooth Headphones')"></textarea>
      <select id="lang" class="border rounded-lg p-2 mb-3 w-full">
        <option value="es">Spanish</option>
        <option value="en">English</option>
        <option value="pt">Portuguese</option>
      </select>
      <button class="bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-2 rounded-lg" onclick="generateDesc()">
        Generate Description
      </button>
      <div id="result" class="mt-4 p-4 bg-gray-100 rounded-lg hidden"></div>
    </div>
  </div>

  <script>
    async function generateDesc() {
      const title = document.getElementById('title').value;
      const lang = document.getElementById('lang').value;
      if (!title) return alert('Enter a product title');

      const r = document.getElementById('result');
      r.classList.remove('hidden');
      r.innerHTML = 'Generating...';

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, language: lang })
        });
        const data = await res.json();
        r.innerHTML = data.description || data.error || 'Error generating description';
      } catch (e) {
        r.innerHTML = 'Error: ' + e.message;
      }
    }
  </script>
</body>
</html>`;
}

function installFormHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>AI Product Descriptions — Install</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen grid place-items-center p-4">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
    <div class="text-center mb-6">
      <div class="inline-block bg-green-100 p-3 rounded-full mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-green-600" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.4 8.6c-.4-.4-.4-1 0-1.4.4-.4 1-.4 1.4 0 1.6 1.6 2.6 3.8 2.6 6.3 0 .2 0 .5-.1.7.5.6.7 1.4.7 2.2 0 2.2-1.8 4-4 4-1.1 0-2.1-.4-2.8-1.2C13.9 19.6 12.9 20 12 20s-1.9-.4-2.7-1.1c-.7.7-1.7 1.1-2.8 1.1-2.2 0-4-1.8-4-4 0-.8.2-1.6.7-2.2-.1-.2-.1-.5-.1-.7 0-2.5 1-4.7 2.6-6.3.4-.4 1-.4 1.4 0 .4.4.4 1 0 1.4-1 1-1.7 2.4-1.9 3.9.6-.3 1.3-.5 2-.5 1.1 0 2.1.4 2.8 1.1.8-.7 1.7-1.1 2.7-1.1s1.9.4 2.7 1.1c.7-.7 1.7-1.1 2.8-1.1.7 0 1.4.2 2 .5-.2-1.5-.9-2.9-1.9-3.9z"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">AI Product Descriptions</h1>
      <p class="text-gray-600 mt-1">Por AliceLabs LLC</p>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 text-sm text-blue-800">
      <strong>Para instalar:</strong> entra el nombre de tu tienda Shopify (sin <code>.myshopify.com</code>) y haz clic en <em>Install</em>.
    </div>

    <form method="GET" action="/install" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de tu tienda</label>
        <div class="flex rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-green-500 focus-within:border-green-500">
          <input type="text" name="shop" required class="flex-1 px-3 py-2 outline-none" placeholder="mi-tienda">
          <span class="bg-gray-100 px-3 py-2 text-gray-500 border-l border-gray-300">.myshopify.com</span>
        </div>
        <p class="text-xs text-gray-500 mt-1">Ej: <code>alicelabs</code> si tu tienda es <code>alicelabs.myshopify.com</code></p>
      </div>
      <button type="submit" class="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition">
        Install App
      </button>
    </form>

    <div class="mt-5 pt-5 border-t border-gray-200 text-xs text-gray-500 space-y-1">
      <p>1. Te redirige al admin de Shopify</p>
      <p>2. Aparecen los permisos: <code>read_products, write_products</code></p>
      <p>3. Clic en <strong>Install app</strong></p>
      <p>4. La app queda instalada y lista para usar</p>
    </div>
  </div>
</body>
</html>`;
}

function successHTML(shop) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>App Installed</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-green-50 to-emerald-100 min-h-screen grid place-items-center p-4">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
    <div class="inline-block bg-green-100 p-4 rounded-full mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <h1 class="text-3xl font-bold text-green-700 mb-2">App Installed!</h1>
    <p class="text-gray-600 mb-1">AI Product Descriptions está activa en</p>
    <p class="font-mono text-gray-900 mb-6">${shop}</p>

    <a href="https://${shop}/admin/apps/ai-product-descriptions" class="block w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition mb-2">
      Abrir la App
    </a>
    <a href="${APP_URL}/app" class="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition">
      Ver landing pública
    </a>
  </div>
</body>
</html>`;
}

function errorHTML(message) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Error de instalación</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-red-50 to-orange-100 min-h-screen grid place-items-center p-4">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
    <div class="inline-block bg-red-100 p-4 rounded-full mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-red-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
    </div>
    <h1 class="text-2xl font-bold text-red-700 mb-2">No se pudo instalar</h1>
    <p class="text-gray-700 mb-6 text-sm break-words">${message}</p>
    <a href="${APP_URL}/install" class="block w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition">
      Reintentar
    </a>
  </div>
</body>
</html>`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

// Lazy env accessors (Cloudflare Workers inject env into fetch handler)
function env_ShopifyClientId() {
  return (typeof SHOPIFY_CLIENT_ID !== 'undefined' && SHOPIFY_CLIENT_ID) || 'YOUR_APP_CLIENT_ID';
}
function env_ShopifyClientSecret() {
  return (typeof SHOPIFY_CLIENT_SECRET !== 'undefined' && SHOPIFY_CLIENT_SECRET) || 'YOUR_APP_SECRET';
}

// === CLOUDFLARE WORKERS ENTRY ===
export default {
  async fetch(request, env) {
    // Expose env to module-scope helpers via global
    globalThis.env_TOKENS = env.TOKENS || null;
    globalThis.SHOPIFY_CLIENT_ID = env.SHOPIFY_CLIENT_ID;
    globalThis.SHOPIFY_CLIENT_SECRET = env.SHOPIFY_CLIENT_SECRET;

    const url = new URL(request.url);

    if (url.pathname === '/install') return await handleInstall(request, url);
    if (url.pathname === '/auth/callback') return await handleCallback(request, url);
    if (url.pathname === '/webhooks/products') return await handleWebhook(request, url);
    if (url.pathname === '/api/generate') {
      const body = await request.json();
      const desc = await generateDescription(body.title, body.product_type || 'general', body.tags || '', body.language || 'es');
      return json({ description: desc });
    }
    if (url.pathname === '/' || url.pathname === '/app') {
      const shop = (request.headers.get('Cookie') || '').match(/shop=([^;]+)/)?.[1] || '';
      return new Response(generateAppHTML(shop), { headers: { 'Content-Type': 'text/html' } });
    }

    return json({ name: 'ai-product-descriptions', version: '1.1.0', endpoints: ['/install', '/auth/callback', '/webhooks/products', '/api/generate', '/app'] });
  }
};
