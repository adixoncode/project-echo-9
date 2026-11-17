// Owner approval fixes the input poses/route; copy was frozen before HDR implementation.
import {test} from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
import {VIEWS,FLIGHT_POINTS,WORLD_SEED} from '../src/math.js';import {CORRIDOR_HERO} from '../src/corridor.js';
const baseline=JSON.parse(await readFile(new URL('../docs/qa/overhaul-v1/iteration-2/scope-baseline.json',import.meta.url),'utf8'));
test('iteration2 retains approved world seed, all six camera poses and full deterministic route',()=>{
 assert.equal(WORLD_SEED,baseline.seed);assert.deepEqual(VIEWS.map(({position,target})=>({position,target})),baseline.poses);assert.deepEqual(FLIGHT_POINTS,baseline.flight);assert.deepEqual(CORRIDOR_HERO,baseline.hero);
});
