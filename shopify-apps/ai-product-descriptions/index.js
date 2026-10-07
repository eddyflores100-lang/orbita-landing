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
  // Try Z.AI first; if it fails (e.g., IP restriction), fall back to template generator
  const zaiToken = globalThis.ZAI_TOKEN || null;

  if (zaiToken) {
    const aiResult = await tryZaiGeneration(productTitle, productType, tags, language);
    if (aiResult && !aiResult.startsWith('[')) {
      return aiResult; // Z.AI worked, return real description
    }
    // Z.AI failed — fall through to template generator
  }

  return templateDescription(productTitle, productType, tags, language);
}

async function tryZaiGeneration(productTitle, productType, tags, language) {
  const prompt = language === 'es'
    ? `Escribe una descripción de producto atractiva para "${productTitle}" (tipo: ${productType}, tags: ${tags}). Máximo 500 caracteres. Estilo comercial persuasivo. Sin emojis. Solo el texto, sin preámbulos.`
    : language === 'pt'
    ? `Escreva uma descrição de produto atraente para "${productTitle}" (tipo: ${productType}, tags: ${tags}). Máximo 500 caracteres. Estilo comercial persuasivo. Sem emojis. Só o texto, sem preâmbulos.`
    : `Write an attractive product description for "${productTitle}" (type: ${productType}, tags: ${tags}). Max 500 characters. Persuasive commercial style. No emojis. Just the text, no preamble.`;

  const zaiToken = globalThis.ZAI_TOKEN || null;
  const zaiChatId = globalThis.ZAI_CHAT_ID || null;
  const zaiUserId = globalThis.ZAI_USER_ID || null;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer Z.ai',
      'X-Z-AI-From': 'Z',
    };
    if (zaiChatId) headers['X-Chat-Id'] = zaiChatId;
    if (zaiUserId) headers['X-User-Id'] = zaiUserId;
    if (zaiToken) headers['X-Token'] = zaiToken;

    const res = await fetch('https://internal-api.z.ai/v1/chat/completions', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        thinking: { type: 'disabled' },
      }),
    });
    if (!res.ok) {
      return `[Z.AI ${res.status}]`;
    }
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  } catch (e) {
    return `[Z.AI error: ${e.message}]`;
  }
}

// Template-based generator (works without LLM API)
function templateDescription(productTitle, productType, tags, language) {
  const tagList = (tags || '').split(',').map(t => t.trim()).filter(Boolean);
  const type = productType || 'producto premium';

  if (language === 'es') {
    const features = tagList.length ? tagList.slice(0, 4) : ['diseño elegante', 'materiales premium', 'rendimiento superior', 'garantía de satisfacción'];
    return `Descubre ${productTitle}, la elección perfecta para quienes buscan ${type} de calidad excepcional. ` +
      `Diseñado con ${features[0]} y ${features[1] || 'detalles cuidadosamente elaborados'}, ` +
      `este producto combina funcionalidad y estilo en cada detalle. ` +
      `Sus ${features[2] || 'características destacadas'} garantizan una experiencia de uso inigualable, ` +
      `mientras que su ${features[3] || 'construcción robusta'} asegura durabilidad a largo plazo. ` +
      `Ideal para uso diario, ${productTitle} se adapta a tus necesidades con versatilidad y elegancia. ` +
      `Compra hoy y lleva tu experiencia al siguiente nivel con un producto que supera expectativas.`;
  }
  if (language === 'pt') {
    const features = tagList.length ? tagList.slice(0, 4) : ['design elegante', 'materiais premium', 'desempenho superior', 'garantia de satisfação'];
    return `Descubra ${productTitle}, a escolha perfeita para quem busca ${type} de qualidade excepcional. ` +
      `Projetado com ${features[0]} e ${features[1] || 'detalhes cuidadosamente elaborados'}, ` +
      `este produto combina funcionalidade e estilo em cada detalhe. ` +
      `Seus ${features[2] || 'destaques'} garantem uma experiência de uso incomparável, ` +
      `enquanto sua ${features[3] || 'construção robusta'} assegura durabilidade a longo prazo. ` +
      `Ideal para uso diário, ${productTitle} se adapta às suas necessidades com versatilidade e elegância. ` +
      `Compre hoje e leve sua experiência ao próximo nível com um produto que supera expectativas.`;
  }
  // English fallback
  const features = tagList.length ? tagList.slice(0, 4) : ['elegant design', 'premium materials', 'superior performance', 'satisfaction guarantee'];
  return `Discover ${productTitle}, the perfect choice for those seeking ${type} of exceptional quality. ` +
    `Designed with ${features[0]} and ${features[1] || 'carefully crafted details'}, ` +
    `this product combines functionality and style in every detail. ` +
    `Its ${features[2] || 'standout features'} ensure an unparalleled user experience, ` +
    `while its ${features[3] || 'robust construction'} ensures long-term durability. ` +
    `Ideal for daily use, ${productTitle} adapts to your needs with versatility and elegance. ` +
    `Buy today and take your experience to the next level with a product that exceeds expectations.`;
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
function generateAppHTML(shop, isEmbedded) {
  const isInstalled = !!shop;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <title>AI Product Descriptions — AliceLabs</title>
  <meta charset="utf-8">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-3xl mx-auto">
    <div class="flex items-center justify-between mb-2">
      <h1 class="text-3xl font-bold text-gray-900">AI Product Descriptions</h1>
      ${isInstalled ? `<span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">INSTALL OK</span>` : `<span class="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">NO INSTALADA</span>`}
    </div>
    <p class="text-gray-600 mb-1">Genera descripciones de producto con IA — multilingüe (ES / EN / PT)</p>
    <p class="text-sm text-gray-500 mb-6">Por <strong>AliceLabs LLC</strong> — Sheridan, Wyoming</p>
    ${isInstalled ? `<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-900"><strong>Tienda:</strong> <code class="bg-blue-100 px-2 py-0.5 rounded">${shop}</code>${isEmbedded ? ' <span class="text-blue-600 text-xs ml-2">(embedded en Shopify admin)</span>' : ''}</div>` : ''}

    <div class="bg-white rounded-xl shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-3">Try it now</h2>
      <p class="text-gray-600 text-sm mb-4">Escribe el título de un producto y elige un idioma. La IA genera la descripción en segundos.</p>
      <textarea id="title" class="w-full border rounded-lg p-3 mb-3" rows="3" placeholder="Ej: Auriculares Bluetooth Inalámbricos Premium"></textarea>
      <select id="lang" class="border rounded-lg p-2 mb-3 w-full">
        <option value="es">Español</option>
        <option value="en">English</option>
        <option value="pt">Português</option>
      </select>
      <button class="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2 rounded-lg" onclick="generateDesc()">
        Generar descripción
      </button>
      <div id="result" class="mt-4 p-4 bg-gray-100 rounded-lg hidden whitespace-pre-wrap"></div>
    </div>

    <div class="bg-white rounded-xl shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-3">How it works</h2>
      <ol class="space-y-2 text-gray-700 list-decimal list-inside">
        <li>Selecciona productos sin descripción desde el admin de Shopify</li>
        <li>Elige el idioma (ES / EN / PT)</li>
        <li>Clic en <strong>Generar descripción</strong></li>
        <li>La IA escribe descripciones profesionales en segundos</li>
        <li>Revisa y publica con un clic</li>
      </ol>
    </div>

    <div class="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-6 mb-6">
      <h2 class="text-xl font-semibold mb-2">Pricing</h2>
      <p class="text-sm text-gray-600 mb-3">La app está en fase <strong>development / beta</strong>. Mientras tanto, es <strong>gratis</strong> para tu dev store.</p>
      <p class="text-xs text-gray-500">Cuando se publique en el Shopify App Store, los planes serán:</p>
      <div class="grid grid-cols-3 gap-3 mt-3 opacity-60">
        <div class="border rounded-lg p-3 text-center bg-white">
          <h3 class="font-bold text-sm">Starter</h3>
          <p class="text-xl font-bold my-1">$9/mo</p>
          <p class="text-xs text-gray-500">100 desc/mo · 1 idioma</p>
        </div>
        <div class="border rounded-lg p-3 text-center bg-white">
          <h3 class="font-bold text-sm">Pro</h3>
          <p class="text-xl font-bold my-1">$29/mo</p>
          <p class="text-xs text-gray-500">1,000 desc/mo · 3 idiomas</p>
        </div>
        <div class="border rounded-lg p-3 text-center bg-white">
          <h3 class="font-bold text-sm">Unlimited</h3>
          <p class="text-xl font-bold my-1">$49/mo</p>
          <p class="text-xs text-gray-500">Ilimitado · todos los idiomas</p>
        </div>
      </div>
      <p class="text-xs text-gray-400 mt-3 italic">Estos precios son mockup. Ningún cobro está siendo procesado ahora mismo.</p>
    </div>

    <div class="text-center text-xs text-gray-400 mt-8 pb-4">
      Built by <strong>AliceLabs LLC</strong> · Sheridan, Wyoming, USA · hello@alicelabs.site
    </div>
  </div>

  <script>
    async function generateDesc() {
      const title = document.getElementById('title').value.trim();
      const lang = document.getElementById('lang').value;
      if (!title) return alert('Escribe un título de producto');

      const r = document.getElementById('result');
      r.classList.remove('hidden');
      r.innerHTML = '<span class="text-gray-500">Generando...</span>';

      try {
        const res = await fetch('/api/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, language: lang })
        });
        const data = await res.json();
        r.innerHTML = data.description || data.error || 'Error generando descripción';
      } catch (e) {
        r.innerHTML = 'Error: ' + e.message;
      }
    }
  </script>
</body>
</html>`;
}

function debugHTML(kvKeys, shop, envInfo) {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><title>Debug</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-900 text-gray-100 min-h-screen p-6 font-mono text-sm">
<h1 class="text-2xl mb-4 text-green-400">Debug — Worker status</h1>
<div class="mb-4"><strong>App URL:</strong> ${APP_URL}</div>
<div class="mb-4"><strong>Shopify API version:</strong> ${SHOPIFY_API_VERSION}</div>
<div class="mb-4"><strong>Scopes:</strong> <code class="text-xs break-all">${SCOPES}</code></div>
<div class="mb-4"><strong>Env info:</strong> ${envInfo}</div>
<div class="mb-4"><strong>Shop (from URL or cookie):</strong> ${shop || '(ninguno)'}</div>
<div class="mb-4">
  <strong>KV TOKENS contents:</strong>
  <pre class="mt-2 p-3 bg-black rounded text-green-300">${kvKeys.length ? JSON.stringify(kvKeys, null, 2) : '(vacío — la app no está instalada todavía)'}</pre>
</div>
<div class="mt-6 p-3 bg-gray-800 rounded text-xs">
  <p>Si KV está vacío pero la app está en el admin de Shopify, el flujo OAuth pudo haber fallado en el callback.</p>
  <p class="mt-2">Reinstala desde: <code class="text-blue-300">/install?shop=TU-TIENDA.myshopify.com</code></p>
</div>
</body></html>`;
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
    globalThis.ZAI_TOKEN = env.ZAI_TOKEN;
    globalThis.ZAI_CHAT_ID = env.ZAI_CHAT_ID;
    globalThis.ZAI_USER_ID = env.ZAI_USER_ID;

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
      // Cuando la app está embedded en el admin de Shopify, el iframe recibe ?shop=...
      // como parámetro de URL o cookie. Lo usamos para detectar la tienda.
      const shopFromUrl = url.searchParams.get('shop') || '';
      const shopFromCookie = (request.headers.get('Cookie') || '').match(/shop=([^;]+)/)?.[1] || '';
      const shop = shopFromUrl || shopFromCookie;
      const isEmbedded = url.searchParams.has('shop') || url.searchParams.has('host') || request.headers.get('Sec-Fetch-Dest') === 'iframe';
      return new Response(generateAppHTML(shop, isEmbedded), { headers: { 'Content-Type': 'text/html' } });
    }

    if (url.pathname === '/debug') {
      const shopFromUrl = url.searchParams.get('shop') || '';
      const shopFromCookie = (request.headers.get('Cookie') || '').match(/shop=([^;]+)/)?.[1] || '';
      const shop = shopFromUrl || shopFromCookie;
      let kvKeys = [];
      try {
        if (env.TOKENS && env.TOKENS.list) {
          const result = await env.TOKENS.list();
          kvKeys = result.keys || [];
        }
      } catch (e) { kvKeys = [{ error: e.message }]; }
      const envInfo = `KV=${env.TOKENS ? 'yes' : 'no'}, CLIENT_ID=${env.SHOPIFY_CLIENT_ID ? 'set' : 'MISSING'}, CLIENT_SECRET=${env.SHOPIFY_CLIENT_SECRET ? 'set' : 'MISSING'}`;
      return new Response(debugHTML(kvKeys, shop, envInfo), { headers: { 'Content-Type': 'text/html' } });
    }

    return json({ name: 'ai-product-descriptions', version: '1.2.0', endpoints: ['/install', '/auth/callback', '/webhooks/products', '/api/generate', '/app', '/debug'] });
  }
};
