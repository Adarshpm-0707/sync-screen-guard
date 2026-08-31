// add-purchasing-price.cjs
// Adds purchasing_price column to products table
// Usage: node add-purchasing-price.cjs <service_role_key>
// OR:    SUPABASE_SERVICE_ROLE_KEY=<key> node add-purchasing-price.cjs

const https = require('https');

const PROJECT_REF = 'homjibmcpficbooybizb';
const SERVICE_KEY = process.argv[2] || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY || !SERVICE_KEY.startsWith('eyJ')) {
  console.error('\n❌ A real service_role key is required.');
  console.error('   Get it from: https://supabase.com/dashboard/project/' + PROJECT_REF + '/settings/api');
  console.error('   Project API keys → service_role → Reveal\n');
  console.error('   Then run:');
  console.error('   node add-purchasing-price.cjs eyJhbGciOiJIUzI1NiIsInR5cCI6...\n');
  process.exit(1);
}

function runSQL(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const req = https.request({
      hostname: 'api.supabase.com',
      path: `/v1/projects/${PROJECT_REF}/database/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Authorization': `Bearer ${SERVICE_KEY}`,
      }
    }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('\n🔧 Adding purchasing_price column to products table...\n');

  const sql = `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS purchasing_price NUMERIC(10, 2) DEFAULT NULL`;

  const res = await runSQL(sql);

  let parsed;
  try { parsed = JSON.parse(res.body); } catch { parsed = { message: res.body }; }

  if (res.status >= 200 && res.status < 300) {
    console.log('✅ Column purchasing_price added (or already existed) successfully!');
    console.log('\n🎉 Done! Refresh your admin panel — the purchasing price field will now save correctly.\n');
  } else {
    const msg = parsed?.message || parsed?.error || res.body;
    if (msg && msg.toLowerCase().includes('already exists')) {
      console.log('✅ Column purchasing_price already exists — nothing to do!');
      console.log('\n🎉 Done! The field should work. Try refreshing the schema cache in Supabase.\n');
    } else {
      console.error(`❌ HTTP ${res.status}: ${msg}`);
      console.error('\nTip: Make sure you are using the service_role key (not the anon key).');
      process.exit(1);
    }
  }
}

main().catch(console.error);
