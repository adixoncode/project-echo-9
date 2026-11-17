import {test} from 'node:test';
import assert from 'node:assert/strict';
import {CORRIDOR_LIGHT_TABLE} from '../src/corridor-lights.js';
import {projectShadow,receiverPlaneGradient,planeDepthAtUv} from './helpers/shadow-plane.mjs';
test('receiver-plane PCF matches ray-plane projected depth and prevents the observed flat-wall acne',()=>{
  // Preserve the exact historical wide-cone reproduction as well as validating
  // current optics. A narrower production cone alone need not exhibit that acne.
  const historicalRed={...CORRIDOR_LIGHT_TABLE[1],fov:148,outerCos:Math.cos(74*Math.PI/180)};
  const cases=[[CORRIDOR_LIGHT_TABLE[1],[3.82,2.276,45.919],[-1,0,0]],[CORRIDOR_LIGHT_TABLE[1],[3.82,2.107,46.384],[-1,0,0]],[CORRIDOR_LIGHT_TABLE[0],[-3.9,2.4,35.3],[0,0,-1]],[CORRIDOR_LIGHT_TABLE[1],[0,.065,39],[0,1,0]],[historicalRed,[3.82,2.276,45.919],[-1,0,0]],[historicalRed,[3.82,2.107,46.384],[-1,0,0]]];let falseCentreComparisons=0;
  for(const[light,point,normal]of cases){
    const receiver=point.map((v,i)=>v+normal[i]*.006),centre=projectShadow(receiver,light),gradient=receiverPlaneGradient(point,normal,light);
    for(let y=-1;y<=2;y++)for(let x=-1;x<=2;x++){
      const uv=[centre.uv[0]+x/2048,centre.uv[1]+y/2048],expected=centre.depth+gradient[0]*x/2048+gradient[1]*y/2048;
      assert.ok(Math.abs(expected-planeDepthAtUv(uv,receiver,normal,light))<1e-9,'analytic gradient must match independently intersected plane');
      const stored=planeDepthAtUv(uv,point,normal,light);
      assert.ok(expected-.000012<stored+1e-9,'unoccluded geometric plane must be lit at every PCF tap');
      if(centre.depth-.000012>stored)falseCentreComparisons++;
    }
  }
  assert.ok(falseCentreComparisons>0,'old fixed-centre PCF recreates false shadow comparisons on these receivers');
});
test('receiver-plane correction retains a real caster ahead of the receiver',()=>{
  const light=CORRIDOR_LIGHT_TABLE[1],point=[3.82,2.276,45.919],normal=[-1,0,0],receiver=point.map((v,i)=>v+normal[i]*.006),caster=point.map((v,i)=>v+normal[i]*.15),centre=projectShadow(receiver,light),gradient=receiverPlaneGradient(point,normal,light);
  for(let y=0;y<2;y++)for(let x=0;x<2;x++){
    const du=(x-.5)/2048,dv=(y-.5)/2048,uv=[centre.uv[0]+du,centre.uv[1]+dv],expected=centre.depth+gradient[0]*du+gradient[1]*dv-.000012;
    assert.ok(expected>planeDepthAtUv(uv,caster,normal,light),'actual nearer geometry must remain shadowing');
  }
});
