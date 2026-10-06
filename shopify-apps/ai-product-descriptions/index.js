// AI Product Descriptions — Shopify App
// Built by AliceLabs LLC
// Generates AI product descriptions for Shopify merchants
// Uses z-ai-web-dev-sdk for AI generation
// Deployable on Cloudflare Workers

const PORT = 3004;

// === SHOPIFY OAUTH ===
// Shopify redirects merchants here to install the app
async function handleInstall(request, url) {
  const shop = url.searchParams.get('shop');
  if (!shop) return json({ error: 'Missing shop param' }, 400);
  
  const scopes = 'read_products,write_products';
  const clientId = process.env.SHOPIFY_CLIENT_ID || 'YOUR_APP_CLIENT_ID';
  const redirectUri = process.env.SHOPIFY_APP_URL || `https://shopify-app.eddyflores100.workers.dev/auth/callback`;
  
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${scopes}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${btoa(shop)}`;
  
  return Response.redirect(installUrl, 302);
}

// === SHOPIFY OAUTH CALLBACK ===
async function handleCallback(url) {
  const code = url.searchParams.get('code');
  const shop = url.searchParams.get('shop');
  const state = url.searchParams.get('state');
  
  if (!code || !shop) return json({ error: 'Missing code or shop' }, 400);
  
  // Exchange code for access token
  const clientId = process.env.SHOPIFY_CLIENT_ID || 'YOUR_APP_CLIENT_ID';
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET || 'YOUR_APP_SECRET';
  
  const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
  });
  const tokenData = await tokenRes.json();
  const accessToken = tokenData.access_token;
  
  // Store token (in production: save to DB/KV)
  // For now: return success page
  return new Response(generateSuccessHTML(shop), { headers: { 'Content-Type': 'text/html' } });
}

// === AI DESCRIPTION GENERATION ===
async function generateDescription(productTitle, productType, tags, language = 'es') {
  // Uses z-ai-web-dev-sdk for AI generation
  // In Cloudflare Workers: use fetch to our AI endpoint
  const prompt = language === 'es' 
    ? `Escribe una descripción de producto atractiva para "${productTitle}" (tipo: ${productType}, tags: ${tags}). Máximo 500 caracteres. Estilo comercial persuasivo.`
    : `Write an attractive product description for "${productTitle}" (type: ${productType}, tags: ${tags}). Max 500 characters. Persuasive commercial style.`;
  
  // Call our AI endpoint
  const res = await fetch('https://z.ai/api/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    }),
  });
  const data = await res.json();
  return data.choices?.[0]?.message?.content || 'Failed to generate description';
}

// === WEBHOOK HANDLER ===
async function handleWebhook(request) {
  const body = await request.json();
  const topic = request.headers.get('X-Shopify-Topic');
  
  if (topic === 'products/create' || topic === 'products/update') {
    // Auto-generate description for new/updated products
    const product = body;
    const description = await generateDescription(
      product.title,
      product.product_type,
      product.tags,
    );
    
    // Update product with AI description
    const shop = request.headers.get('X-Shopify-Shop-Domain');
    const token = process.env[`SHOP_TOKEN_${shop}`];
    if (token) {
      await fetch(`https://${shop}/admin/api/2024-10/products/${product.id}.json`, {
        method: 'PUT',
        headers: { 'X-Shopify-Access-Token': token, 'Content-Type': 'application/json' },
        body: JSON.stringify({ product: { id: product.id, body_html: `<p>${description}</p>` } }),
      });
    }
  }
  
  return json({ received: true });
}

// === EMBEDDED APP FRONTEND ===
function generateAppHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <title>AI Product Descriptions</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen p-8">
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-2">AI Product Descriptions</h1>
    <p class="text-gray-600 mb-8">Genera descripciones de producto con IA — multilingue (ES/EN/PT)</p>
    
    <div class="bg-white rounded-xl shadow p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">How it works</h2>
      <ol class="space-y-3 text-gray-700">
        <li>1. Install app on your Shopify store</li>
        <li>2. Select products that need descriptions</li>
        <li>3. Choose language (Spanish, English, Portuguese)</li>
        <li>4. Click "Generate Descriptions"</li>
        <li>5. AI writes professional descriptions in seconds</li>
        <li>6. Review and publish</li>
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
      <textarea class="w-full border rounded-lg p-3 mb-3" rows="3" placeholder="Enter product title (e.g. 'Wireless Bluetooth Headphones')"></textarea>
      <select class="border rounded-lg p-2 mb-3 w-full">
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
      const title = document.querySelector('textarea').value;
      const lang = document.querySelector('select').value;
      if (!title) return alert('Enter a product title');
      
      document.getElementById('result').classList.remove('hidden');
      document.getElementById('result').innerHTML = 'Generating...';
      
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, language: lang })
      });
      const data = await res.json();
      document.getElementById('result').innerHTML = data.description || data.error || 'Error generating description';
    }
  </script>
</body>
</html>`;
}

function generateSuccessHTML(shop) {
  return `<!DOCTYPE html><html><head><title>App Installed</title><script src="https://cdn.tailwindcss.com"></script></head>
<body class="bg-gray-50 min-h-screen grid place-items-center">
<div class="text-center">
<h1 class="text-3xl font-bold text-green-600 mb-2">App Installed!</h1>
<p class="text-gray-600 mb-4">AI Product Descriptions is now active on ${shop}</p>
<a href="https://${shop}/admin/apps" class="bg-blue-500 text-white px-6 py-2 rounded-lg">Go to your store</a>
</div></body></html>`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

// === CLOUDFLARE WORKERS ENTRY ===
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // Routes
    if (url.pathname === '/install') return await handleInstall(request, url);
    if (url.pathname === '/auth/callback') return await handleCallback(url);
    if (url.pathname === '/webhooks/products') return await handleWebhook(request);
    if (url.pathname === '/api/generate') {
      const body = await request.json();
      const desc = await generateDescription(body.title, body.product_type || 'general', body.tags || '', body.language || 'es');
      return json({ description: desc });
    }
    if (url.pathname === '/' || url.pathname === '/app') {
      return new Response(generateAppHTML(), { headers: { 'Content-Type': 'text/html' } });
    }
    
    return json({ name: 'ai-product-descriptions', version: '1.0.0', endpoints: ['/install', '/auth/callback', '/webhooks/products', '/api/generate', '/app'] });
  }
};
