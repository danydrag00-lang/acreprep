import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const read = name => readFileSync(new URL('../' + name, import.meta.url),'utf8');
test('question generator uses structured endpoint instead of old regex', () => {
 const agent=read('agent.js');
 assert.ok(agent.includes("fetch('/api/questions'"));
 assert.ok(!agent.includes('AI did not return the expected question format'));
 assert.ok(!agent.includes('output.match('));
});
test('transient errors clear on app load while progress remains', () => {
 const agent=read('agent.js');
 assert.ok(agent.includes("model.error='';"));
 assert.ok(agent.includes('App build: 2.0.2'));
});
test('scripts bypass stale caches and the old worker is retired', () => {
 const html=read('index.html'),app=read('app.js'),sw=read('sw.js');
 for(const f of ['agent.js','app.js','coach-content.js'])assert.ok(html.includes(f+'?v=20261122-202'));
 assert.ok(!app.includes('serviceWorker.register('));
 assert.ok(app.includes('reg.unregister()'));
 assert.ok(sw.includes('registration.unregister()'));
});
