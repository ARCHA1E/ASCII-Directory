import { verifyAdminPassword, generateSessionToken, verifySessionToken, checkLoginRateLimit, recordFailedLogin, recordSuccessfulLogin } from '../src/server/auth.js';
import { storage } from '../src/server/storage.js';
import { config } from '../src/server/config.js';

async function runAudit() {
  console.log('\x1b[36m╔════════════════════════════════════════════════════════════════════╗\x1b[0m');
  console.log('\x1b[36m║                  FULL SYSTEM & SECURITY AUDIT                      ║\x1b[0m');
  console.log('\x1b[36m╚════════════════════════════════════════════════════════════════════╝\x1b[0m\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, label: string) {
    if (condition) {
      console.log(`\x1b[32m  [PASS]\x1b[0m ${label}`);
      passed++;
    } else {
      console.error(`\x1b[31m  [FAIL]\x1b[0m ${label}`);
      failed++;
    }
  }

  // 1. Password Timing & Verification
  console.log('\x1b[33m--- [1] Authentication & Timing-Safe Checks ---\x1b[0m');
  assert(verifyAdminPassword(config.adminPassword), 'Valid configured password verifies true');
  assert(!verifyAdminPassword('wrong-password-xyz'), 'Invalid password verifies false');
  assert(!verifyAdminPassword(''), 'Empty password returns false');
  assert(!verifyAdminPassword(' '), 'Blank space password returns false');

  // 2. JWT Session Security
  console.log('\n\x1b[33m--- [2] JWT Session & Token Security ---\x1b[0m');
  const token = generateSessionToken();
  assert(typeof token === 'string' && token.length > 20, 'Generates valid JWT signature');
  assert(verifySessionToken(token), 'Authenticates valid signed session token');
  assert(!verifySessionToken('invalid.jwt.token'), 'Rejects tampered JWT token');
  assert(!verifySessionToken(''), 'Rejects empty token');

  // 3. Brute Force Rate Limiter
  console.log('\n\x1b[33m--- [3] Rate Limiting & Brute-Force Defense ---\x1b[0m');
  const testIp = '198.51.100.42';
  recordSuccessfulLogin(testIp);
  assert(checkLoginRateLimit(testIp).allowed, 'New IP starts unblocked');
  for (let i = 0; i < 10; i++) {
    recordFailedLogin(testIp);
  }
  const rateLimitStatus = checkLoginRateLimit(testIp);
  assert(!rateLimitStatus.allowed, 'Rate limiter blocks after 10 failed attempts');
  assert(typeof rateLimitStatus.remainingWaitSec === 'number' && rateLimitStatus.remainingWaitSec > 0, 'Returns lockout countdown seconds');
  recordSuccessfulLogin(testIp);
  assert(checkLoginRateLimit(testIp).allowed, 'Reset clears IP lock after successful login');

  // 4. Tag Management System
  console.log('\n\x1b[33m--- [4] Tag Management System Storage Audit ---\x1b[0m');
  const initialTags = await storage.getAllTags();
  assert(Array.isArray(initialTags) && initialTags.length > 0, `Retrieves all tags (found ${initialTags.length} tags)`);
  assert(initialTags.every(t => typeof t.tag === 'string' && typeof t.count === 'number'), 'All tag entries have valid schema');

  // Add custom tag
  const testTag = 'audit-test-tag-' + Date.now();
  const tagsAfterAdd = await storage.addCustomTag(testTag);
  assert(tagsAfterAdd.some(t => t.tag === testTag), 'Custom tag successfully added to global pool');

  // Rename tag
  const renamedTag = testTag + '-renamed';
  await storage.renameTag(testTag, renamedTag);
  const tagsAfterRename = await storage.getAllTags();
  assert(tagsAfterRename.some(t => t.tag === renamedTag) && !tagsAfterRename.some(t => t.tag === testTag), 'Tag successfully renamed across global pool');

  // Delete tag
  await storage.deleteTag(renamedTag);
  const tagsAfterDel = await storage.getAllTags();
  assert(!tagsAfterDel.some(t => t.tag === renamedTag), 'Tag successfully purged from global pool');

  // 5. Category & Entry Manipulation
  console.log('\n\x1b[33m--- [5] Category & Entry CRUD & Cross-Category Movement ---\x1b[0m');
  const cat1 = await storage.addCategory('AUDIT CAT A');
  const cat2 = await storage.addCategory('AUDIT CAT B');
  assert(cat1 && cat1.name === 'AUDIT CAT A', 'Created category A');
  assert(cat2 && cat2.name === 'AUDIT CAT B', 'Created category B');

  const entry = await storage.addEntry(cat1.id, {
    title: 'Audit Entry 1',
    url: 'https://audit.example.local',
    description: 'Testing entry operations',
    tags: ['infra', 'test']
  });
  assert(entry !== null && entry.title === 'Audit Entry 1', 'Created entry in Category A');

  // Move entry across categories
  if (entry) {
    const updated = await storage.updateEntry(entry.id, { categoryId: cat2.id });
    assert(updated !== null, 'Updated entry with new categoryId');
    const data = await storage.getData();
    const c1 = data.categories.find(c => c.id === cat1.id);
    const c2 = data.categories.find(c => c.id === cat2.id);
    assert(!c1?.entries.some(e => e.id === entry.id), 'Entry removed from origin category A');
    assert(c2?.entries.some(e => e.id === entry.id), 'Entry added to target category B');
  }

  // Cleanup test categories
  await storage.deleteCategory(cat1.id);
  await storage.deleteCategory(cat2.id);

  console.log('\n\x1b[36m════════════════════════════════════════════════════════════════════\x1b[0m');
  console.log(`\x1b[32mAUDIT SUMMARY: ${passed} PASSED\x1b[0m | \x1b[${failed > 0 ? '31' : '32'}m${failed} FAILED\x1b[0m`);
  console.log('\x1b[36m════════════════════════════════════════════════════════════════════\x1b[0m\n');

  if (failed > 0) process.exit(1);
}

runAudit().catch(err => {
  console.error(err);
  process.exit(1);
});
