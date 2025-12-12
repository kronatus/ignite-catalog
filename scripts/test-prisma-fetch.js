const https = require('https');

const url = 'https://binaries.prisma.sh/all_commits/2ba551f319ab1df4bc874a89965d8b3641056773/windows/query_engine.dll.node.gz.sha256';

https.get(url, (res) => {
  console.log('statusCode:', res.statusCode);
  console.log('headers:', res.headers);
  res.on('data', () => {}); // drain
  res.on('end', () => process.exit(0));
}).on('error', (err) => {
  console.error('fetch error:', err);
  process.exit(1);
});