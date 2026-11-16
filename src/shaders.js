export const COMMON = /* wgsl */`
struct Uniforms {
  viewProjection: mat4x4<f32>,
  camera: vec4<f32>,
  right: vec4<f32>,
  up: vec4<f32>,
  forward: vec4<f32>,
  resolution: vec4<f32>,
  settings: vec4<f32>,
};
@group(0) @binding(0) var<uniform> u: Uniforms;
fn hash(p: vec3<f32>) -> f32 {
  var a=fract(p*.1031); a += dot(a,a.yzx+33.33); return fract((a.x+a.y)*a.z);
}
fn noise(p:vec3<f32>) -> f32 {
  let i=floor(p);var f=fract(p);f=f*f*(3.-2.*f);
  return mix(mix(mix(hash(i),hash(i+vec3(1.,0.,0.)),f.x),mix(hash(i+vec3(0.,1.,0.)),hash(i+vec3(1.,1.,0.)),f.x),f.y),mix(mix(hash(i+vec3(0.,0.,1.)),hash(i+vec3(1.,0.,1.)),f.x),mix(hash(i+vec3(0.,1.,1.)),hash(i+vec3(1.,1.,1.)),f.x),f.y),f.z);
}
fn tone(color:vec3<f32>) -> vec3<f32> {
  let c=max(color,vec3(0.));
  return pow(clamp((c*(2.51*c+.03))/(c*(2.43*c+.59)+.14),vec3(0.),vec3(1.)),vec3(.4545));
}
`;
export const SKY_SHADER = COMMON + /* wgsl */`
struct SkyOut {@builtin(position) position:vec4<f32>,@location(0) uv:vec2<f32>};
@vertex fn skyVertex(@builtin(vertex_index) i:u32)->SkyOut{
  let p=array<vec2<f32>,3>(vec2(-1.,-1.),vec2(3.,-1.),vec2(-1.,3.));
  var o:SkyOut;o.position=vec4(p[i],.99999,1.);o.uv=p[i];return o;
}
@fragment fn skyFragment(input:SkyOut)->@location(0) vec4<f32>{
  let ray=normalize(u.forward.xyz+u.right.xyz*input.uv.x*u.resolution.z+u.up.xyz*input.uv.y*u.resolution.w);
  // Astronomical objects use actual world directions; turning around reveals the same sky.
  let center=vec3(16.,47.,-172.);let radius=89.;let oc=u.camera.xyz-center;
  let b=dot(oc,ray);let c=dot(oc,oc)-radius*radius;let disc=b*b-c;
  var color=vec3(.0018,.004,.011);
  let cloud=pow(max(0.,1.-abs(ray.y*.8+ray.x*.31+.13)),12.);
  color+=vec3(.009,.016,.03)*cloud*(.35+.65*noise(ray*6.));
  // Sparse deterministic stars, with a compact halo around the brightest points.
  let grid=ray*720.;let cell=floor(grid);let star=hash(cell);
  let d=length(fract(grid)-vec3(.5));
  color+=vec3(.5,.7,1.)*pow(max(0.,1.-d*2.),10.)*step(.996,star)*4.;
  let bright=pow(max(0.,dot(ray,normalize(vec3(-.62,.38,-.9)))),900.);
  color+=vec3(.6,.8,1.)*bright*.7;
  var planetDistance=1.e6;
  if(disc>0. && b<0.){
    planetDistance=-b-sqrt(disc);
    let normal=normalize(oc+ray*planetDistance);
    let swirl=noise(normal*vec3(14.,35.,14.)+vec3(u.camera.w*.002,0.,0.));
    let fine=noise(normal*vec3(55.,110.,55.));
    let latitude=normal.y+(.55*swirl+.13*fine)*.045;
    let band=.5+.5*sin(latitude*83.+swirl*2.8+sin(latitude*35.)*2.);
    let streak=.5+.5*sin(latitude*205.+swirl*6.);
    var albedo=mix(vec3(.085,.16,.23),vec3(.49,.59,.59),smoothstep(.15,.9,band));
    albedo=mix(albedo,vec3(.43,.32,.22),smoothstep(.67,.85,band)*.3);
    albedo*=.87+.16*streak+.13*fine;
    let storm=length((normal.xy-vec2(-.25,-.18))*vec2(1.,2.6));
    let stormLine=.5+.5*sin(storm*135.-swirl*2.);
    albedo=mix(albedo,vec3(.5,.42,.3)*(.7+.3*stormLine),(1.-smoothstep(.08,.19,storm))*.7);
    let sun=normalize(vec3(-.72,.65,.75));let diffuse=max(0.,dot(normal,sun));
    color=albedo*(.055+diffuse*.9);
    let limb=pow(1.-max(0.,dot(normal,-ray)),4.);
    color+=vec3(.07,.3,.45)*limb*pow(diffuse+.15,.6)*.55;
    // Thin projected shadow of the ring plane across cloud bands.
    let ringNormal=normalize(vec3(.14,.91,.39));let shadowT=-dot(normal*radius,ringNormal)/dot(sun,ringNormal);
    let shadowP=normal*radius+sun*shadowT;
    let shadowR=length(shadowP);
    if(shadowT>0. && shadowR>radius*1.3 && shadowR<radius*1.9){color*=.62;}
  }
  let rn=normalize(vec3(.14,.91,.39));let den=dot(ray,rn);
  let safeDen=select(-max(abs(den),.0001),max(abs(den),.0001),den>=0.);
  let ringT=dot(center-u.camera.xyz,rn)/safeDen;
  let ringR=length(u.camera.xyz+ray*ringT-center)/radius;
  // Filter radial optical-depth bands by their screen footprint. Unresolved detail converges
  // to its average rather than shimmering as a hard, subpixel vinyl-record pattern.
  let footprint=max(fwidth(ringR),.00001);
  let detail417=cos(ringR*417.)*exp(-.5*pow(footprint*417.,2.));
  let detail763=cos(ringR*763.)*exp(-.5*pow(footprint*763.,2.));
  let detail1000=sin(ringR*1000.)*exp(-.5*pow(footprint*1000.,2.));
  if(abs(den)>.0001 && ringT>0. && ringT<planetDistance && ringR>1.29 && ringR<2.02){
    let bands=.48+.12*cos(ringR*42.)+.06*cos(ringR*119.)+.045*(detail417-detail763);
    let gap=1.-smoothstep(.014,.025,abs(ringR-1.68));
    let fade=smoothstep(1.29,1.34,ringR)*(1.-smoothstep(1.96,2.02,ringR));
    let ring=mix(vec3(.14,.2,.23),vec3(.56,.56,.44),bands)*(.88+.025*detail1000);
    color=mix(color,ring,fade*(.82-gap*.7));
  }
  let vignette=1.-.17*dot(input.uv,input.uv);
  return vec4(tone(color*vignette),1.);
}
`;
export const MESH_SHADER = COMMON + /* wgsl */`
struct MeshIn {@location(0) position:vec3<f32>,@location(1) normal:vec3<f32>,@location(2) color:vec3<f32>,@location(3) material:vec3<f32>};
struct MeshOut {@builtin(position) position:vec4<f32>,@location(0) world:vec3<f32>,@location(1) normal:vec3<f32>,@location(2) color:vec3<f32>,@location(3) material:vec3<f32>};
@vertex fn meshVertex(input:MeshIn)->MeshOut{
  var world=input.position;
  if(input.material.y>5.5){let phase=input.material.y*73.;world+=vec3(sin(u.camera.w*.13+phase)*.2,sin(u.camera.w*.11+phase)*.27,cos(u.camera.w*.09+phase)*.16);}
  var o:MeshOut;o.position=u.viewProjection*vec4(world,1.);o.world=world;o.normal=input.normal;o.color=input.color;o.material=input.material;return o;
}
fn localLight(p:vec3<f32>,n:vec3<f32>,view:vec3<f32>,light:vec3<f32>,col:vec3<f32>,power:f32,roughness:f32)->vec3<f32>{
  let delta=light-p;let d2=dot(delta,delta);let l=normalize(delta);
  let diff=max(0.,dot(n,l));let spec=pow(max(0.,dot(n,normalize(l+view))),mix(65.,12.,roughness));
  return col*(diff+spec*.65)*power/(1.+d2);
}
@fragment fn meshFragment(input:MeshOut,@builtin(front_facing) front:bool)->@location(0) vec4<f32>{
  var n=normalize(input.normal);if(!front){n=-n;}
  let p=input.world;let eye=u.camera.xyz;let view=normalize(eye-p);
  let distance=length(eye-p);let emission=input.material.x;let material=input.material.y;
  var base=input.color;var rough=.65;
  if(u.settings.w>1.5){return vec4(.05,.2,.3,1.);}
  if(u.settings.w>.5){return vec4(n*.5+.5,1.);}
  // World-space brushed alloy, panel seams and wear, without textures or UV assets.
  let grain=hash(floor(p*vec3(105.,83.,105.)))*.09;
  base*=.94+grain;
  if(material>.5 && material<1.5){
    let panel=abs(fract(p.xz/3.)-.5);
    let seam=smoothstep(.478,.49,max(panel.x,panel.y));
    base*=1.-seam*.58;
    let edgeWear=smoothstep(.46,.48,max(panel.x,panel.y))*(1.-seam);
    base+=vec3(.025,.035,.04)*edgeWear;
    // Fine grating in the center walkway and inspection plates.
    let grate=step(.78,fract(p.z*8.))*step(.3,fract(p.x*4.));
    base*=1.-grate*.15;rough=.44;
  }
  if(material>1.5 && material<2.5){
    let lines=step(.94,fract(p.y*1.5))+step(.97,fract((p.x+p.z)*.5));
    base*=1.-min(lines,1.)*.32;
  }
  var light=vec3(.085,.13,.18);
  light+=vec3(.13,.23,.29)*max(0.,n.y)*.9;
  // Distant planetlight and a sharp star key produce broad dimensional metal surfaces.
  let key=normalize(vec3(-.55,.7,-.6));let diffuse=max(0.,dot(n,key));
  let spec=pow(max(0.,dot(n,normalize(key+view))),42.);
  light+=vec3(.43,.6,.68)*(diffuse*.45+spec*.28);
  if(p.z<24.){
    light+=localLight(p,n,view,vec3(0.,8.,-8.),vec3(.09,.73,1.),65.,rough);
    light+=localLight(p,n,view,vec3(-15.,8.,-15.),vec3(.1,.65,.9),75.,rough);
    light+=localLight(p,n,view,vec3(15.,8.,5.),vec3(.15,.65,1.),85.,rough);
    light+=localLight(p,n,view,vec3(0.,7.,21.),vec3(1.,.4,.08),36.,rough);
  }else if(p.z<72.){
    let z=floor((p.z-24.)/7.8)*7.8+27.;
    light+=localLight(p,n,view,vec3(-3.7,4.5,z),vec3(1.,.32,.055),24.,rough);
    light+=localLight(p,n,view,vec3(3.7,5.,z+4.),vec3(.13,.6,1.),29.,rough);
    light+=localLight(p,n,view,vec3(0.,7.4,z+1.),vec3(1.,.57,.22),22.,rough);
    light*=.78;
  }else{
    light+=localLight(p,n,view,vec3(0.,23.,101.),vec3(.53,.77,1.),170.,rough);
    light+=localLight(p,n,view,vec3(-15.,11.,85.),vec3(.12,.6,1.),140.,rough);
    light+=localLight(p,n,view,vec3(12.,9.,112.),vec3(1.,.4,.08),115.,rough);
    light+=localLight(p,n,view,vec3(0.,12.,128.),vec3(.1,.6,1.),150.,rough);
  }
  var color=base*light;
  if(emission>.01){
    var pulse=1.;
    if(base.r>base.b*2.){pulse=.88+.12*sin(u.camera.w*1.5+p.z*.2);}
    color+=base*emission*pulse;
  }
  if(material>2.5 && material<3.5){
    let px=fract(p.x*.6+p.z*.35);let py=fract(p.y*6.+p.z*.4);
    let line=step(.8,py)*step(.13,px);
    let graph=step(abs(fract(p.x*1.5+p.z*.21)-.5),.025);
    color=base*(.25+line*.7+graph*.25)*(1.+.08*sin(u.camera.w*.4+p.x));
  }
  if(material>3.5 && material<4.5){
    let stripe=pow(.5+.5*sin(p.y*24.),12.);
    let latitude=pow(.5+.5*sin(p.x*14.+p.z*8.),20.);
    color=base*(.5+stripe*2.+latitude*.65);
  }
  if(material>4.5){color+=vec3(.02,.1,.15)*pow(1.-max(0.,dot(n,view)),3.);}
  // Analytic contact shadow below the instrument plinth and the salvage vessel.
  if(p.y<.8){
    let observatory=1.-exp(-dot(p.xz-vec2(0.,-6.),p.xz-vec2(0.,-6.))*.045);
    let vessel=1.-exp(-dot((p.xz-vec2(0.,102.))*vec2(1.,.48),(p.xz-vec2(0.,102.))*vec2(1.,.48))*.045);
    color*=min(observatory,vessel)*.5+.5;
    // Broad reflected cyan pools from the architecture; deliberately subtle.
    color+=vec3(.006,.035,.047)*exp(-abs(p.x)*.25)*max(0.,1.-abs(p.z+6.)*.04);
  }
  let fog=1.-exp(-distance*select(.004,.007,p.z>24. && p.z<72.));
  color=mix(color,vec3(.012,.027,.043),fog);
  // Soft, stationary shafts through the upper observatory. Tiny density keeps surfaces readable.
  if(u.settings.x>0. && p.z<20.){
    let shaft=pow(max(0.,sin((p.x+p.y*.42)*.22+1.)),18.);
    color+=vec3(.014,.035,.048)*shaft*(1.-exp(-distance*.03));
  }
  return vec4(tone(color),1.);
}
`;
export const DUST_SHADER = COMMON + /* wgsl */`
struct DustOut {@builtin(position) position:vec4<f32>,@location(0) uv:vec2<f32>,@location(1) alpha:f32};
@group(0) @binding(1) var<storage,read> particles:array<vec4<f32>>;
@vertex fn dustVertex(@builtin(vertex_index) v:u32,@builtin(instance_index) i:u32)->DustOut{
  let corners=array<vec2<f32>,6>(vec2(-1.,-1.),vec2(1.,-1.),vec2(-1.,1.),vec2(-1.,1.),vec2(1.,-1.),vec2(1.,1.));
  let data=particles[i];var p=data.xyz;
  p.x+=sin(u.camera.w*.06+f32(i))*.13;p.y+=sin(u.camera.w*.045+f32(i)*.7)*.11;
  let size=.012+data.w*.018;let corner=corners[v];
  var o:DustOut;o.position=u.viewProjection*vec4(p+(u.right.xyz*corner.x+u.up.xyz*corner.y)*size,1.);
  o.uv=corner;o.alpha=.13+data.w*.2;return o;
}
@fragment fn dustFragment(i:DustOut)->@location(0) vec4<f32>{let a=exp(-dot(i.uv,i.uv)*3.)*i.alpha;return vec4(.4,.7,.83,a);}
`;
