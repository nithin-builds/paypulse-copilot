import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../worker/index-v2.js';

test('ships parseable dashboard JavaScript', async () => {
  const response = await worker.fetch(new Request('https://paypulse.test/'), {});
  const html = await response.text();
  const script = html.match(/<script>([\s\S]*?)<\/script>/)?.[1];
  assert.ok(script, 'dashboard script is present');
  assert.doesNotThrow(() => new Function(script));
});

test('evidence staging requires explicit approval and complete fields', async () => {
  const request = body => new Request('https://paypulse.test/api/evidence/prepare', {
    method: 'POST',
    headers: {'content-type': 'application/json', 'oai-authenticated-user-email': 'owner@example.com'},
    body: JSON.stringify(body)
  });
  const incomplete = await worker.fetch(request({approved: false}), {});
  assert.equal(incomplete.status, 400);
  const complete = await worker.fetch(request({invoiceId:'INV-204',carrier:'DHL',tracking:'TEST-123',evidenceType:'PROOF_OF_FULFILLMENT',note:'Sandbox delivery record.',approved:true}), {});
  assert.equal(complete.status, 200);
  const result = await complete.json();
  assert.equal(result.status, 'STAGED_NOT_SUBMITTED');
  assert.equal(result.audit.event, 'HUMAN_APPROVED_EVIDENCE_STAGED');
});

