// RecoveryMail AI — Shopify App MVP
// Built by AliceLabs LLC
// Generates personalized abandoned cart recovery emails using AI
// Stack: Cloudflare Workers + KV + Z.AI + Shopify Admin API + Shopify Email API

const SCOPES = 'read_products,write_products,read_customers,read_orders,write_orders,read_inventory,write_inventory';
const APP_URL = 'https://recoverymail-ai.eddyflores100.workers.dev';
const SHOPIFY_API_VERSION = '2024-10';
const FREE_LIMIT = 10; // 10 emails/mes free tier

// === SHOPIFY OAUTH INSTALL ===
async function handleInstall(request, url) {
  let shop = url.searchParams.get('shop') || '';
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

  const clientId = globalThis.SHOPIFY_CLIENT_ID;
  if (!clientId) {
    return new Response(errorHTML('SHOPIFY_CLIENT_ID no configurado en el Worker'), { headers: { 'Content-Type': 'text/html' } });
  }

  const redirectUri = `${APP_URL}/auth/callback`;
  const state = `${btoa(shop)}.${Date.now()}.${Math.random().toString(36).slice(2)}`;
  const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${clientId}&scope=${encodeURIComponent(SCOPES)}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&state=${encodeURIComponent(state)}`;

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

  if (error) return new Response(errorHTML(`Shopify rechazó la instalación: ${error} - ${errorDescription || ''}`), { headers: { 'Content-Type': 'text/html' } });
  if (!code || !shop) return new Response(errorHTML('Falta code o shop en el callback'), { headers: { 'Content-Type': 'text/html' } });

  const cookieHeader = request.headers.get('Cookie') || '';
  const cookies = Object.fromEntries(cookieHeader.split(';').map(c => c.trim().split('=')));
  if (cookies.oauth_state && cookies.oauth_state !== state) {
    return new Response(errorHTML('State CSRF mismatch'), { headers: { 'Content-Type': 'text/html' } });
  }

  const clientId = globalThis.SHOPIFY_CLIENT_ID;
  const clientSecret = globalThis.SHOPIFY_CLIENT_SECRET;
  if (!clientId || !clientSecret) return new Response(errorHTML('Credenciales Shopify no configuradas'), { headers: { 'Content-Type': 'text/html' } });

  let tokenData;
  try {
    const tokenRes = await fetch(`https://${shop}/admin/oauth/access_token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code }),
    });
    tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return new Response(errorHTML(`No se obtuvo access_token: ${JSON.stringify(tokenData)}`), { headers: { 'Content-Type': 'text/html' } });
    }
  } catch (e) {
    return new Response(errorHTML(`Error: ${e.message}`), { headers: { 'Content-Type': 'text/html' } });
  }

  const accessToken = tokenData.access_token;
  const scope = tokenData.scope || SCOPES;

  // Save token in KV
  try {
    if (globalThis.env_STORE && globalThis.env_STORE.put) {
      await globalThis.env_STORE.put(shop, JSON.stringify({
        accessToken, scope,
        installedAt: new Date().toISOString(),
        plan: 'free',
        emailsSentThisMonth: 0,
        monthYear: new Date().toISOString().slice(0, 7)
      }));
    }
  } catch (e) { console.log('KV put failed:', e.message); }

  // Register webhook for abandoned carts
  await registerWebhooks(shop, accessToken);

  return new Response(successHTML(shop), {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Set-Cookie': `shop=${shop}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`,
    },
  });
}

// === REGISTER WEBHOOKS ===
async function registerWebhooks(shop, accessToken) {
  const topics = [
    'carts/update',
    'carts/create',
    'checkouts/create',
    'checkouts/update',
    'orders/create'
  ];
  const webhookUrl = `${APP_URL}/webhooks/abandoned-cart`;

  for (const topic of topics) {
    try {
      await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/webhooks.json`, {
        method: 'POST',
        headers: {
          'X-Shopify-Access-Token': accessToken,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          webhook: {
            topic,
            address: webhookUrl,
            format: 'json'
          }
        })
      });
    } catch (e) { console.log(`Webhook ${topic} failed:`, e.message); }
  }
}

// === ABANDONED CART WEBHOOK HANDLER ===
async function handleAbandonedCartWebhook(request, url) {
  const shop = request.headers.get('X-Shopify-Shop-Domain');
  const topic = request.headers.get('X-Shopify-Topic');

  let body;
  try { body = await request.json(); } catch { return json({ error: 'Invalid JSON' }, 400); }

  if (!shop) return json({ error: 'No shop header' }, 400);

  // Only process carts/checkouts (not orders/create)
  if (!topic || (!topic.startsWith('carts/') && !topic.startsWith('checkouts/'))) {
    return json({ received: true, skipped: true });
  }

  // If order created, remove from pending abandoned
  if (topic === 'orders/create') {
    if (body.customer && body.customer.id) {
      try {
        const cartKey = `pending_cart:${shop}:${body.customer.id}`;
        if (globalThis.env_STORE && globalThis.env_STORE.delete) {
          await globalThis.env_STORE.delete(cartKey);
        }
      } catch (e) {}
    }
    return json({ received: true, action: 'removed_pending' });
  }

  // Extract cart info
  const cartId = body.id;
  const customer = body.customer || {};
  const customerId = customer.id;
  const customerEmail = customer.email;
  const lineItems = body.line_items || [];
  const total = body.total_price || body.subtotal_price || '0.00';
  const currency = body.currency || 'USD';

  if (!customerEmail || lineItems.length === 0) {
    return json({ received: true, skipped: 'no_email_or_items' });
  }

  // Save cart as pending (will be processed by cron or after delay)
  const cartData = {
    shop,
    cartId,
    customerId,
    customerEmail,
    customerName: `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Customer',
    lineItems: lineItems.map(li => ({
      title: li.title,
      quantity: li.quantity,
      price: li.price,
      variant_id: li.variant_id,
      product_id: li.product_id
    })),
    total,
    currency,
    createdAt: body.created_at || new Date().toISOString(),
    updatedAt: body.updated_at || new Date().toISOString(),
    receivedAt: new Date().toISOString()
  };

  try {
    if (globalThis.env_STORE && globalThis.env_STORE.put) {
      await globalThis.env_STORE.put(
        `pending_cart:${shop}:${customerId}`,
        JSON.stringify(cartData),
        { expirationTtl: 86400 * 7 } // Keep for 7 days
      );
    }
  } catch (e) {}

  return json({ received: true, action: 'saved_pending' });
}

// === CRON: SWEEP ABANDONED CARTS AFTER 1 HOUR ===
async function handleScheduled(event, env) {
  // Find all pending carts that are older than 1 hour
  // Generate AI email for each
  // Queue for sending
  try {
    if (!env.STORE || !env.STORE.list) return;

    // List all pending carts (this is a KV list, paginated)
    let cursor;
    let processed = 0;
    while (cursor !== null && processed < 50) {
      const result = await env.STORE.list({ prefix: 'pending_cart:', cursor, limit: 100 });
      cursor = result.list_complete ? null : result.cursor;

      for (const key of result.keys) {
        const parts = key.name.split(':');
        if (parts.length !== 3) continue;
        const shop = parts[1];
        const customerId = parts[2];

        const rawCart = await env.STORE.get(key.name);
        if (!rawCart) continue;

        const cart = JSON.parse(rawCart);
        const updatedDate = new Date(cart.updatedAt);
        const now = new Date();
        const hoursSinceUpdate = (now - updatedDate) / (1000 * 60 * 60);

        if (hoursSinceUpdate < 1) continue; // Wait 1 hour before sending

        // Check if we already generated an email for this cart
        const emailKey = `email:${shop}:${customerId}`;
        const existing = await env.STORE.get(emailKey);
        if (existing) continue; // Already sent

        // Get shop token
        const shopData = await env.STORE.get(shop);
        if (!shopData) continue;
        const shopInfo = JSON.parse(shopData);
        const accessToken = shopInfo.accessToken;

        // Generate AI email
        const generated = await generateRecoveryEmail(cart, shop, accessToken);
        if (!generated) continue;

        // Save generated email (pending merchant approval)
        await env.STORE.put(emailKey, JSON.stringify({
          ...cart,
          emailSubject: generated.subject,
          emailBody: generated.body,
          generatedAt: new Date().toISOString(),
          status: 'pending_approval'
        }), { expirationTtl: 86400 * 30 });

        processed++;
      }
    }
  } catch (e) {
    console.log('Cron error:', e.message);
  }
}

// === AI EMAIL GENERATION ===
async function generateRecoveryEmail(cart, shop, accessToken) {
  // Get product details for richer context
  let productDetails = [];
  try {
    const productIds = [...new Set(cart.lineItems.map(li => li.product_id))].slice(0, 5);
    for (const pid of productIds) {
      if (!pid) continue;
      const res = await fetch(`https://${shop}/admin/api/${SHOPIFY_API_VERSION}/products/${pid}.json`, {
        headers: { 'X-Shopify-Access-Token': accessToken }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.product) {
          productDetails.push({
            title: data.product.title,
            type: data.product.product_type,
            tags: data.product.tags
          });
        }
      }
    }
  } catch (e) {}

  // Detect customer language based on shop domain or customer locale
  const language = detectLanguage(shop, cart);

  const items = cart.lineItems.map((li, i) => {
    const detail = productDetails[i] || {};
    return `${li.title} (qty: ${li.quantity}, price: ${cart.currency} ${li.price})${detail.tags ? ` [tags: ${detail.tags}]` : ''}`;
  }).join('; ');

  const customerName = cart.customerName;
  const total = `${cart.currency} ${cart.total}`;

  const prompt = language === 'es'
    ? `Eres un copywriter de e-commerce. Genera un email de recuperación de carrito abandonado para ${customerName}.

Contexto del carrito:
- Productos: ${items}
- Total: ${total}
- Tienda: ${shop}

Genera respuesta en formato JSON con dos campos:
{
  "subject": "subject line atractivo, max 60 caracteres, sin emojis",
  "body": "email body persuasivo, max 500 caracteres, addressing customer by name, mentioning specific products, offering help or gentle incentive. Sin emojis. Estilo comercial pero humano."
}

Solo responde con JSON válido, sin markdown.`
    : language === 'pt'
    ? `Você é um copywriter de e-commerce. Gere um email de recuperação de carrinho abandonado para ${customerName}.

Contexto do carrinho:
- Produtos: ${items}
- Total: ${total}
- Loja: ${shop}

Gere resposta em formato JSON com dois campos:
{
  "subject": "subject line atraente, máx 60 caracteres, sem emojis",
  "body": "email body persuasivo, máx 500 caracteres, addressing customer by name, mentioning specific products, offering help or gentle incentive. Sem emojis. Estilo comercial mas humano."
}

Só responda com JSON válido, sem markdown.`
    : `You are an e-commerce copywriter. Generate an abandoned cart recovery email for ${customerName}.

Cart context:
- Products: ${items}
- Total: ${total}
- Store: ${shop}

Generate response in JSON format with two fields:
{
  "subject": "attractive subject line, max 60 chars, no emojis",
  "body": "persuasive email body, max 500 chars, addressing customer by name, mentioning specific products, offering help or gentle incentive. No emojis. Commercial but human style."
}

Only respond with valid JSON, no markdown.`;

  // Try Z.AI first
  const zaiResult = await tryZaiGeneration(prompt);
  if (zaiResult) return zaiResult;

  // Fall back to template
  return templateRecoveryEmail(cart, productDetails, language);
}

function detectLanguage(shop, cart) {
  // Simple heuristic: LATAM stores use Spanish
  if (shop.includes('.mx.') || shop.includes('.ar.') || shop.includes('.cl.') || shop.includes('.co.')) return 'es';
  if (shop.includes('.br.') || shop.includes('.pt.')) return 'pt';
  // Check for common Spanish store names
  if (shop.startsWith('tienda') || shop.startsWith('mi-tienda')) return 'es';
  return 'en'; // Default to English
}

async function tryZaiGeneration(prompt) {
  const zaiToken = globalThis.ZAI_TOKEN || null;
  if (!zaiToken) return null;

  try {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer Z.ai',
      'X-Z-AI-From': 'Z',
    };
    if (globalThis.ZAI_CHAT_ID) headers['X-Chat-Id'] = globalThis.ZAI_CHAT_ID;
    if (globalThis.ZAI_USER_ID) headers['X-User-Id'] = globalThis.ZAI_USER_ID;
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
    if (!res.ok) return null;
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    // Try to parse JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.subject && parsed.body) return parsed;
      } catch (e) {}
    }
    return null;
  } catch (e) { return null; }
}

function templateRecoveryEmail(cart, productDetails, language) {
  const firstName = cart.customerName.split(' ')[0] || 'there';
  const topProduct = cart.lineItems[0]?.title || 'your items';
  const total = `${cart.currency} ${cart.total}`;

  if (language === 'es') {
    return {
      subject: `${firstName}, tu carrito te espera`,
      body: `Hola ${firstName},\n\nNotamos que dejaste ${topProduct} en tu carrito por ${total}. Queremos ayudarte a completar tu compra.\n\nSi tuviste alguna duda sobre el producto, envío, o pago, solo responde a este email y te ayudamos enseguida.\n\nTu carrito sigue guardado. Vuelve cuando quieras: https://${cart.shop}/cart\n\nSaludos,\nEl equipo de la tienda`
    };
  }
  if (language === 'pt') {
    return {
      subject: `${firstName}, seu carrinho está esperando`,
      body: `Olá ${firstName},\n\nNotamos que você deixou ${topProduct} no seu carrinho por ${total}. Queremos ajudar a completar sua compra.\n\nSe teve alguma dúvida sobre o produto, envio, ou pagamento, só responder a este email e ajudamos na hora.\n\nSeu carrinho continua guardado. Volte quando quiser: https://${cart.shop}/cart\n\nAtenciosamente,\nA equipe da loja`
    };
  }
  return {
    subject: `${firstName}, your cart is waiting`,
    body: `Hi ${firstName},\n\nWe noticed you left ${topProduct} in your cart for ${total}. We want to help you complete your purchase.\n\nIf you had any question about the product, shipping, or payment, just reply to this email and we'll help right away.\n\nYour cart is still saved. Come back anytime: https://${cart.shop}/cart\n\nBest,\nThe store team`
  };
}

// === DASHBOARD ===
async function handleDashboard(request, url, env) {
  const shopFromUrl = url.searchParams.get('shop') || '';
  const shopFromCookie = (request.headers.get('Cookie') || '').match(/shop=([^;]+)/)?.[1] || '';
  const shop = shopFromUrl || shopFromCookie;

  // Get pending emails for this shop
  let pendingEmails = [];
  let sentEmails = [];
  let plan = 'free';
  let emailsSent = 0;
  let storeName = '';

  if (shop && env.STORE && env.STORE.list) {
    try {
      // Get shop info
      const shopData = await env.STORE.get(shop);
      if (shopData) {
        const parsed = JSON.parse(shopData);
        plan = parsed.plan || 'free';
        const currentMonth = new Date().toISOString().slice(0, 7);
        if (parsed.monthYear !== currentMonth) {
          emailsSent = 0;
        } else {
          emailsSent = parsed.emailsSentThisMonth || 0;
        }
      }

      // List pending emails
      const listResult = await env.STORE.list({ prefix: `email:${shop}:`, limit: 50 });
      for (const key of listResult.keys) {
        const raw = await env.STORE.get(key.name);
        if (!raw) continue;
        const email = JSON.parse(raw);
        if (email.status === 'pending_approval') {
          pendingEmails.push({
            id: key.name,
            customer: email.customerName,
            email: email.customerEmail,
            total: `${email.currency} ${email.total}`,
            items: email.lineItems?.map(li => li.title).join(', ') || '',
            subject: email.emailSubject,
            bodyPreview: email.emailBody?.slice(0, 200) + '...',
            generatedAt: email.generatedAt
          });
        } else if (email.status === 'sent') {
          sentEmails.push({
            id: key.name,
            customer: email.customerName,
            total: `${email.currency} ${email.total}`,
            subject: email.emailSubject,
            sentAt: email.sentAt
          });
        }
      }
    } catch (e) {}
  }

  return new Response(generateDashboardHTML(shop, plan, emailsSent, pendingEmails, sentEmails), {
    headers: { 'Content-Type': 'text/html' }
  });
}

// === SEND EMAIL VIA SHOPIFY EMAIL API ===
async function handleSendEmail(request, url, env) {
  const emailKey = url.searchParams.get('id');
  if (!emailKey) return json({ error: 'Missing id' }, 400);

  // Get email data
  const rawEmail = await env.STORE.get(emailKey);
  if (!rawEmail) return json({ error: 'Email not found' }, 404);
  const email = JSON.parse(rawEmail);

  // Get shop token
  const shopData = await env.STORE.get(email.shop);
  if (!shopData) return json({ error: 'Shop not found' }, 404);
  const shopInfo = JSON.parse(shopData);

  // Check free tier limits
  const currentMonth = new Date().toISOString().slice(0, 7);
  if (shopInfo.plan === 'free' && (shopInfo.monthYear !== currentMonth ? 0 : shopInfo.emailsSentThisMonth || 0) >= FREE_LIMIT) {
    return json({ error: 'Free tier limit reached', limit: FREE_LIMIT, upgrade: '/upgrade' }, 403);
  }

  // Send via Shopify Email API (using admin API to send email)
  // Actually, Shopify doesn't expose Email API for arbitrary content. Use Shopify's "send email" via the admin API.
  // For MVP, we'll use MailChannels API (free in Cloudflare Workers)
  const mailResult = await sendViaMailChannels(email);

  if (!mailResult.success) {
    return json({ error: mailResult.error }, 500);
  }

  // Update email status
  email.status = 'sent';
  email.sentAt = new Date().toISOString();
  await env.STORE.put(emailKey, JSON.stringify(email), { expirationTtl: 86400 * 90 });

  // Increment shop counter
  shopInfo.emailsSentThisMonth = (shopInfo.monthYear === currentMonth ? shopInfo.emailsSentThisMonth : 0) + 1;
  shopInfo.monthYear = currentMonth;
  await env.STORE.put(email.shop, JSON.stringify(shopInfo));

  // Remove pending cart
  await env.STORE.delete(`pending_cart:${email.shop}:${email.customerId}`).catch(() => {});

  return json({ success: true, sentAt: email.sentAt });
}

async function sendViaMailChannels(email) {
  // MailChannels API - free for Cloudflare Workers
  const fromEmail = `recovery@${email.shop}`;
  const subject = email.emailSubject;
  const body = email.emailBody;

  try {
    const res = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'APIKey': globalThis.MAILCHANNELS_API_KEY || ''
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: email.customerEmail, name: email.customerName }]
        }],
        from: { email: fromEmail, name: 'Customer Support' },
        subject: subject,
        content: [{ type: 'text/plain', value: body }]
      })
    });

    if (!res.ok) {
      const errBody = await res.text();
      return { success: false, error: `MailChannels ${res.status}: ${errBody.slice(0, 200)}` };
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e.message };
  }
}

// === HTML PAGES ===
function installFormHTML() {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>RecoveryMail AI — Install</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen grid place-items-center p-4">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
    <div class="text-center mb-6">
      <div class="inline-block bg-purple-100 p-3 rounded-full mb-3">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M3 8l9 6 9-6M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8M3 8l9-6 9 6"/>
        </svg>
      </div>
      <h1 class="text-2xl font-bold text-gray-900">RecoveryMail AI</h1>
      <p class="text-gray-600 mt-1">by AliceLabs LLC</p>
    </div>

    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-5 text-sm text-blue-800">
      Recupera carritos abandonados con emails personalizados por IA en ES / EN / PT.
    </div>

    <form method="GET" action="/install" class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Nombre de tu tienda</label>
        <div class="flex rounded-lg overflow-hidden border border-gray-300 focus-within:ring-2 focus-within:ring-purple-500">
          <input type="text" name="shop" required class="flex-1 px-3 py-2 outline-none" placeholder="mi-tienda">
          <span class="bg-gray-100 px-3 py-2 text-gray-500 border-l border-gray-300">.myshopify.com</span>
        </div>
      </div>
      <button type="submit" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition">
        Install App
      </button>
    </form>

    <div class="mt-5 pt-5 border-t border-gray-200 text-xs text-gray-500 space-y-1">
      <p><strong>Free:</strong> 10 emails/mes · Pro: $29/mes unlimited</p>
      <p>• Detección automática de abandoned carts</p>
      <p>• IA genera subject + body en tu idioma</p>
      <p>• Dashboard embedded en Shopify admin</p>
      <p>• No compite con Klaviyo — se integra</p>
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
  <title>RecoveryMail AI — Installed</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gradient-to-br from-purple-50 to-blue-100 min-h-screen grid place-items-center p-4">
  <div class="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
    <div class="inline-block bg-green-100 p-4 rounded-full mb-4">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-14 w-14 text-green-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    </div>
    <h1 class="text-3xl font-bold text-purple-700 mb-2">App Installed!</h1>
    <p class="text-gray-600 mb-1">RecoveryMail AI está activa en</p>
    <p class="font-mono text-gray-900 mb-6">${shop}</p>

    <a href="https://${shop}/admin/apps/recoverymail-ai" class="block w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition mb-2">
      Abrir Dashboard
    </a>
    <a href="${APP_URL}/app" class="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-lg transition">
      Ver landing pública
    </a>

    <p class="text-xs text-gray-500 mt-4">Tu plan Free incluye 10 emails/mes. Upgrade a Pro desde el dashboard.</p>
  </div>
</body>
</html>`;
}

function errorHTML(message) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>Error — RecoveryMail AI</title>
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

function generateDashboardHTML(shop, plan, emailsSent, pendingEmails, sentEmails) {
  const isInstalled = !!shop;
  const freeRemaining = Math.max(0, FREE_LIMIT - emailsSent);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>RecoveryMail AI — Dashboard</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 min-h-screen p-6">
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-3xl font-bold text-gray-900">RecoveryMail AI</h1>
        <p class="text-sm text-gray-500">Recupera carritos abandonados con IA · by AliceLabs</p>
      </div>
      <div class="flex items-center gap-2">
        ${isInstalled ? `<span class="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">INSTALL OK</span>` : `<span class="text-xs bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full font-semibold">NO INSTALADA</span>`}
        ${plan === 'free' ? `<span class="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full font-semibold">FREE · ${freeRemaining}/${FREE_LIMIT} emails</span>` : `<span class="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">PRO</span>`}
      </div>
    </div>

    ${isInstalled ? `<div class="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-6 text-sm text-blue-900">
      <strong>Tienda:</strong> <code class="bg-blue-100 px-2 py-0.5 rounded">${shop}</code>
      <span class="ml-4 text-blue-600">${emailsSent} emails enviados este mes</span>
    </div>` : ''}

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
      <div class="bg-white rounded-xl shadow p-5">
        <h2 class="text-lg font-semibold mb-2">Pendientes de aprobación</h2>
        <p class="text-3xl font-bold text-purple-600">${pendingEmails.length}</p>
        <p class="text-xs text-gray-500 mt-1">Emails generados por IA, listos para revisar</p>
      </div>
      <div class="bg-white rounded-xl shadow p-5">
        <h2 class="text-lg font-semibold mb-2">Emails enviados</h2>
        <p class="text-3xl font-bold text-green-600">${sentEmails.length}</p>
        <p class="text-xs text-gray-500 mt-1">Total en el historial</p>
      </div>
    </div>

    ${pendingEmails.length > 0 ? `
      <h2 class="text-xl font-semibold mb-3">Emails pendientes</h2>
      <div class="space-y-3 mb-6">
        ${pendingEmails.map(e => `
          <div class="bg-white rounded-xl shadow p-5">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="font-semibold text-gray-900">${e.customer}</p>
                <p class="text-xs text-gray-500">${e.email} · ${e.total}</p>
              </div>
              <span class="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Pendiente</span>
            </div>
            <p class="text-sm font-medium text-gray-900 mb-1">Subject: ${e.subject}</p>
            <p class="text-xs text-gray-600 mb-3">${e.bodyPreview}</p>
            <div class="flex gap-2">
              <button onclick="sendEmail('${e.id}')" class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium px-4 py-2 rounded-lg">Enviar ahora</button>
              <button onclick="dismissEmail('${e.id}')" class="bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg">Descartar</button>
            </div>
          </div>
        `).join('')}
      </div>
    ` : `
      <div class="bg-white rounded-xl shadow p-8 text-center mb-6">
        <p class="text-gray-500">No hay emails pendientes. Los carritos abandonados aparecerán aquí automáticamente cuando la IA genere los emails de recuperación.</p>
      </div>
    `}

    ${sentEmails.length > 0 ? `
      <h2 class="text-xl font-semibold mb-3">Historial de envíos</h2>
      <div class="bg-white rounded-xl shadow overflow-hidden">
        <table class="w-full text-sm">
          <thead class="bg-gray-100">
            <tr>
              <th class="text-left p-3">Cliente</th>
              <th class="text-left p-3">Total</th>
              <th class="text-left p-3">Subject</th>
              <th class="text-left p-3">Enviado</th>
            </tr>
          </thead>
          <tbody>
            ${sentEmails.slice(0, 10).map(e => `
              <tr class="border-t">
                <td class="p-3">${e.customer}</td>
                <td class="p-3">${e.total}</td>
                <td class="p-3 truncate max-w-xs">${e.subject}</td>
                <td class="p-3 text-xs text-gray-500">${new Date(e.sentAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    ` : ''}

    <div class="mt-8 pt-6 border-t border-gray-200 text-xs text-gray-400 text-center">
      <p>Built by <strong>AliceLabs LLC</strong> · Sheridan, Wyoming · hello@alicelabs.site</p>
    </div>
  </div>

  <script>
    async function sendEmail(id) {
      if (!confirm('Enviar este email al customer?')) return;
      const r = await fetch('/send-email?id=' + encodeURIComponent(id), { method: 'POST' });
      const data = await r.json();
      if (r.ok && data.success) {
        alert('Email enviado!');
        location.reload();
      } else {
        alert('Error: ' + (data.error || 'unknown'));
      }
    }
    async function dismissEmail(id) {
      if (!confirm('Descartar este email? La IA no lo regenerará.')) return;
      await fetch('/dismiss-email?id=' + encodeURIComponent(id), { method: 'POST' });
      location.reload();
    }
  </script>
</body>
</html>`;
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
}

// === CLOUDFLARE WORKERS ENTRY ===
export default {
  async fetch(request, env) {
    globalThis.env_STORE = env.STORE || null;
    globalThis.SHOPIFY_CLIENT_ID = env.SHOPIFY_CLIENT_ID;
    globalThis.SHOPIFY_CLIENT_SECRET = env.SHOPIFY_CLIENT_SECRET;
    globalThis.ZAI_TOKEN = env.ZAI_TOKEN;
    globalThis.ZAI_CHAT_ID = env.ZAI_CHAT_ID;
    globalThis.ZAI_USER_ID = env.ZAI_USER_ID;
    globalThis.MAILCHANNELS_API_KEY = env.MAILCHANNELS_API_KEY;

    const url = new URL(request.url);

    if (url.pathname === '/install') return await handleInstall(request, url);
    if (url.pathname === '/auth/callback') return await handleCallback(request, url);
    if (url.pathname === '/webhooks/abandoned-cart') return await handleAbandonedCartWebhook(request, url);
    if (url.pathname === '/send-email' && request.method === 'POST') return await handleSendEmail(request, url, env);
    if (url.pathname === '/dismiss-email' && request.method === 'POST') return await handleDismissEmail(request, url, env);
    if (url.pathname === '/debug') return await handleDebug(request, url, env);
    if (url.pathname === '/' || url.pathname === '/app') return await handleDashboard(request, url, env);

    return json({ name: 'recoverymail-ai', version: '1.0.0', endpoints: ['/install', '/auth/callback', '/webhooks/abandoned-cart', '/send-email', '/dismiss-email', '/app', '/debug'] });
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(handleScheduled(event, env));
  }
};

async function handleDismissEmail(request, url, env) {
  const emailKey = url.searchParams.get('id');
  if (!emailKey) return json({ error: 'Missing id' }, 400);
  await env.STORE.delete(emailKey).catch(() => {});
  return json({ success: true });
}

async function handleDebug(request, url, env) {
  const shopFromUrl = url.searchParams.get('shop') || '';
  const shopFromCookie = (request.headers.get('Cookie') || '').match(/shop=([^;]+)/)?.[1] || '';
  const shop = shopFromUrl || shopFromCookie;
  let kvKeys = [];
  try {
    if (env.STORE && env.STORE.list) {
      const result = await env.STORE.list({ limit: 50 });
      kvKeys = result.keys || [];
    }
  } catch (e) { kvKeys = [{ error: e.message }]; }
  const envInfo = `KV=${env.STORE ? 'yes' : 'no'}, CLIENT_ID=${env.SHOPIFY_CLIENT_ID ? 'set' : 'MISSING'}, CLIENT_SECRET=${env.SHOPIFY_CLIENT_SECRET ? 'set' : 'MISSING'}, ZAI=${env.ZAI_TOKEN ? 'set' : 'MISSING'}`;
  return new Response(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Debug</title><script src="https://cdn.tailwindcss.com"></script></head><body class="bg-gray-900 text-gray-100 min-h-screen p-6 font-mono text-sm">
<h1 class="text-2xl mb-4 text-purple-400">Debug — RecoveryMail AI</h1>
<div class="mb-4"><strong>App URL:</strong> ${APP_URL}</div>
<div class="mb-4"><strong>Shopify API version:</strong> ${SHOPIFY_API_VERSION}</div>
<div class="mb-4"><strong>Scopes:</strong> <code class="text-xs break-all">${SCOPES}</code></div>
<div class="mb-4"><strong>Env info:</strong> ${envInfo}</div>
<div class="mb-4"><strong>Shop:</strong> ${shop || '(ninguno)'}</div>
<div class="mb-4">
  <strong>KV STORE contents (first 50):</strong>
  <pre class="mt-2 p-3 bg-black rounded text-green-300">${kvKeys.length ? JSON.stringify(kvKeys.slice(0, 20), null, 2) : '(vacío)'}</pre>
</div>
</body></html>`, { headers: { 'Content-Type': 'text/html' } });
}
