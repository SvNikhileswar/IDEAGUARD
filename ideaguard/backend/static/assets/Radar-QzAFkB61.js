import{r as V,j as _e}from"./index-CkgV0M9J.js";const Z=`#version 300 es
in vec2 aPosition;
void main() {
  gl_Position = vec4(aPosition, 0.0, 1.0);
}`,Ve=`
uniform vec2 uResolution;
uniform vec2 uCenter;
uniform float uViewHeight;
uniform float uFocal;
uniform float uDistance;
uniform float uTilt;
`,it=`#version 300 es
precision highp float;
${Ve}
uniform float uMode;
uniform float uSweep;
uniform float uSwept;
uniform float uDirection;
uniform float uCycle;
uniform float uTrail;
uniform float uRings;
uniform float uSpokes;
uniform float uTicks;
uniform float uGrid;
uniform float uLine;
uniform float uClutter;
uniform float uTime;
uniform vec3 uAccent;
uniform vec3 uHeat;
uniform float uIntro;
uniform float uRange;
uniform float uPixel;
out vec4 outColor;

const float TAU = 6.28318531;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float stroke(float distance, float width) {
  float w = max(width, 1.0) * 0.5;
  return clamp(w + 0.5 - distance, 0.0, 1.0) * min(width, 1.0);
}

void main() {
  vec2 s = (gl_FragCoord.xy - uCenter) / uViewHeight;
  float ct = cos(uTilt);
  float st = sin(uTilt);
  vec3 forward = vec3(0.0, st, -ct);
  vec3 up = vec3(0.0, ct, st);
  vec3 dir = forward * uFocal + vec3(s.x, 0.0, 0.0) + up * s.y;
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);
  float hit = -eye.z / min(dir.z, -0.00001);
  vec2 p = eye.xy + dir.xy * hit;
  float r = length(p);
  vec2 dpdx = dFdx(p);
  vec2 dpdy = dFdy(p);
  if (dir.z > -0.0001 || r > 1.3) {
    outColor = vec4(0.0);
    return;
  }
  vec2 radial = p / max(r, 0.00001);
  vec2 tangent = vec2(radial.y, -radial.x);
  float pxR = max(length(vec2(dot(radial, dpdx), dot(radial, dpdy))), 0.000001);
  float pxT = max(length(vec2(dot(tangent, dpdx), dot(tangent, dpdy))), 0.000001);
  float bearing = atan(p.x, p.y);
  float turn = fract(bearing / TAU + 1.0);
  float inside = 1.0 - smoothstep(1.0 - pxR, 1.0 + pxR, r);

  float ringCoord = r * uRings;
  float ringIndex = clamp(floor(ringCoord + 0.5), 1.0, max(uRings - 1.0, 1.0));
  float rings = stroke(abs(ringCoord - ringIndex) / uRings / pxR, uLine) * step(ringIndex, uRings - 0.5);
  float arc = clamp(uIntro * (uRings + 3.0) - ringIndex, 0.0, 1.0) * 1.02;
  rings *= 1.0 - smoothstep(arc - 0.01, arc, turn);
  float outerArc = clamp(uIntro * (uRings + 3.0) - uRings, 0.0, 1.0) * 1.02;
  float outer = stroke(abs(r - 1.0) / pxR, uLine * 1.15) * (1.0 - smoothstep(outerArc - 0.01, outerArc, turn));

  float tickCoord = turn * 180.0;
  float tickIndex = floor(tickCoord + 0.5);
  float major = 1.0 - step(0.5, mod(tickIndex, 15.0));
  float middle = 1.0 - step(0.5, mod(tickIndex, 5.0));
  float tickLength = mix(mix(0.016, 0.03, middle), 0.05, major);
  float tickRadial = clamp((r - 1.0) / pxR + 0.5, 0.0, 1.0) * clamp((1.0 + tickLength - r) / pxR + 0.5, 0.0, 1.0);
  float spacing = TAU / 180.0 * r / pxT;
  float ticks = stroke(abs(tickCoord - tickIndex) / 180.0 * TAU * r / pxT, uLine) * tickRadial;
  ticks *= mix(mix(0.42 * smoothstep(2.5, 5.0, spacing), 0.7, middle), 1.0, major) * uTicks;
  ticks *= smoothstep(0.55, 0.9, uIntro);

  float spokeTotal = max(uSpokes, 1.0);
  float spokeCoord = turn * spokeTotal;
  float spokeIndex = floor(spokeCoord + 0.5);
  float spokes = stroke(abs(spokeCoord - spokeIndex) / spokeTotal * TAU * r / pxT, uLine) * smoothstep(0.05, 0.16, r);
  spokes *= inside * step(0.5, uSpokes);
  float cardinalCoord = turn * 4.0;
  float cardinal = stroke(abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT, uLine) * smoothstep(0.02, 0.08, r) * inside;
  float hub = stroke(abs(r - 0.022) / pxR, uLine);
  float spokesIn = smoothstep(0.35, 0.8, uIntro);
  float axisDistance = abs(cardinalCoord - floor(cardinalCoord + 0.5)) / 4.0 * TAU * r / pxT;
  float rangeCoord = r * uRings * 5.0;
  float rangeMark = stroke(abs(rangeCoord - floor(rangeCoord + 0.5)) / (uRings * 5.0) / pxR, uLine);
  rangeMark *= 1.0 - smoothstep(3.0 * uPixel - 0.5, 3.0 * uPixel + 0.5, axisDistance);
  rangeMark *= smoothstep(0.06, 0.12, r) * inside;
  float bezel = stroke(abs(r - 1.065) / pxR, uLine) * uTicks * smoothstep(0.6, 0.95, uIntro);

  float grid = rings * 0.12 + outer * 0.24 + ticks * 0.22 + bezel * 0.08;
  grid += (spokes * 0.05 + cardinal * 0.08 + hub * 0.22 + rangeMark * 0.16) * spokesIn;
  grid *= uGrid;

  float behind;
  float edge;
  float trail;
  float lastPass;
  if (uMode < 0.5) {
    float ahead = fract((bearing - uSweep) / TAU + 0.5) - 0.5;
    behind = fract(uDirection * (uSweep - bearing) / TAU) * TAU;
    edge = stroke(abs(ahead) * TAU * r / pxT, uLine * 1.4) * smoothstep(0.0, 0.04, r) * inside;
    trail = exp(-behind / uTrail) * (1.0 - smoothstep(uSwept - 0.15, uSwept, behind));
    lastPass = floor(uCycle - behind / TAU);
  } else {
    behind = uSweep - r;
    edge = stroke(abs(behind) / pxR, uLine * 1.4) * inside;
    trail = behind >= 0.0 ? exp(-behind / uTrail) : 0.0;
    lastPass = behind >= 0.0 ? uCycle : uCycle - 1.0;
  }
  float sweepIn = smoothstep(0.45, 1.0, uIntro);
  trail *= inside * sweepIn;
  edge *= sweepIn;
  float glowTrail = pow(trail, 0.45);

  float returns = 0.0;
  if (uClutter > 0.0 && trail > 0.004) {
    float radialBin = floor(r * 120.0);
    float count = max(8.0, floor(radialBin * 5.0));
    float angularBin = floor(turn * count);
    vec2 drift = vec2(lastPass * 0.173, lastPass * 0.291);
    float weather = noise(p * 3.2 + drift) * 0.65 + noise(p * 7.1 - drift) * 0.35;
    float cluster = smoothstep(0.5, 0.78, weather);
    float density = uClutter * (0.02 + 0.35 * cluster) * (1.0 - smoothstep(0.55, 1.0, r));
    vec2 binSeed = vec2(radialBin, angularBin) + lastPass * 17.13;
    float speck = step(1.0 - density, hash(binSeed));
    vec2 inBin = vec2(fract(r * 120.0), fract(turn * count)) - 0.5;
    float shape = 1.0 - smoothstep(0.18, 0.5, length(inBin));
    speck *= shape * (0.45 + 0.55 * hash(binSeed + 7.7));
    returns = (speck * 1.1 + cluster * 0.16 * uClutter) * trail;
  }

  float heat = uHeat.z * exp(-dot(p - uHeat.xy, p - uHeat.xy) / 0.035);
  float lit = clamp(glowTrail * 0.9 + heat * 0.55, 0.0, 1.0);
  vec3 lineColor = mix(vec3(1.0), uAccent, lit);
  vec3 light = lineColor * grid * (1.0 + glowTrail * 3.0 + heat * 2.4);
  float fill = trail * 0.11 * (0.35 + 0.65 * smoothstep(0.0, 0.6, r));
  light += uAccent * (fill + returns * 0.55);
  light += mix(uAccent, vec3(1.0), 0.3) * edge * 1.3;
  outColor = vec4(light * uRange, 1.0);
}`,st=`#version 300 es
in vec2 aCorner;
in vec4 aSprite;
in vec4 aStyle;
${Ve}
out vec2 vLocal;
out vec4 vStyle;
out float vKind;
void main() {
  float ct = cos(uTilt);
  float st = sin(uTilt);
  float c = cos(aStyle.w);
  float s = sin(aStyle.w);
  vec2 local = aCorner * 1.25;
  vec2 offset = vec2(c * local.x - s * local.y, s * local.x + c * local.y) * aSprite.z;
  vec3 world = vec3(aSprite.xy + offset, 0.0);
  vec3 eye = vec3(0.0, -uDistance * st, uDistance * ct);
  vec3 rel = world - eye;
  float xc = rel.x;
  float yc = dot(rel, vec3(0.0, ct, st));
  float zc = max(dot(rel, vec3(0.0, st, -ct)), 0.0001);
  vec2 center = uCenter / uResolution * 2.0 - 1.0;
  gl_Position = vec4(center * zc + 2.0 * uFocal * uViewHeight * vec2(xc, yc) / uResolution, 0.0, zc);
  vLocal = local;
  vStyle = aStyle;
  vKind = aSprite.w;
}`,ut=`#version 300 es
precision highp float;
in vec2 vLocal;
in vec4 vStyle;
in float vKind;
uniform vec3 uAccent;
uniform float uRange;
out vec4 outColor;
void main() {
  float shape;
  vec3 tint;
  if (vKind < 0.5) {
    float d = length(vLocal * vec2(0.62, 1.0));
    float aa = max(fwidth(d), 0.0001);
    shape = clamp((1.0 - d) / aa + 0.5, 0.0, 1.0);
    shape *= 0.5 + 0.5 * exp(-d * d * 2.5);
    tint = mix(uAccent, vec3(1.0), vStyle.y * 0.45 * exp(-d * d * 5.0));
  } else {
    float d = length(vLocal);
    float aa = max(fwidth(d), 0.0001);
    shape = clamp(1.0 - abs(d - 1.0) / (aa * 0.75), 0.0, 1.0);
    tint = mix(uAccent, vec3(1.0), 0.2);
  }
  outColor = vec4(tint * shape * vStyle.x * uRange, 1.0);
}`,ct=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec4 sum = texture(uSource, uv) * 4.0;
  sum += texture(uSource, uv - uTexel);
  sum += texture(uSource, uv + uTexel);
  sum += texture(uSource, uv + vec2(uTexel.x, -uTexel.y));
  sum += texture(uSource, uv - vec2(uTexel.x, -uTexel.y));
  outColor = sum / 8.0;
}`,lt=`#version 300 es
precision highp float;
uniform sampler2D uSource;
uniform sampler2D uBase;
uniform vec2 uTexel;
uniform vec2 uTarget;
out vec4 outColor;
void main() {
  vec2 uv = gl_FragCoord.xy / uTarget;
  vec2 h = uTexel * 0.5;
  vec4 sum = texture(uSource, uv + vec2(-h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(h.x * 2.0, 0.0));
  sum += texture(uSource, uv + vec2(0.0, -h.y * 2.0));
  sum += texture(uSource, uv + vec2(0.0, h.y * 2.0));
  sum += texture(uSource, uv + vec2(-h.x, h.y)) * 2.0;
  sum += texture(uSource, uv + h) * 2.0;
  sum += texture(uSource, uv + vec2(h.x, -h.y)) * 2.0;
  sum += texture(uSource, uv - h) * 2.0;
  outColor = sum / 12.0 + texture(uBase, uv);
}`,ft=`#version 300 es
precision highp float;
uniform sampler2D uScene;
uniform sampler2D uBloom;
uniform vec2 uResolution;
uniform float uExposure;
uniform float uGlow;
uniform float uGrain;
uniform float uFade;
uniform float uOpacity;
uniform float uTime;
uniform float uLightMode;
uniform vec4 uBackground;
out vec4 outColor;

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float smootherstep(float edge, float x) {
  float t = clamp(x / max(edge, 0.0001), 0.0, 1.0);
  return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  vec3 hdr = texelFetch(uScene, ivec2(gl_FragCoord.xy), 0).rgb * uExposure;
  vec3 bloom = texture(uBloom, uv).rgb * uExposure * uGlow * 0.5;
  float edge = uFade * 0.5;
  float mask = smootherstep(edge, uv.x) * smootherstep(edge, 1.0 - uv.x) * smootherstep(edge, uv.y) * smootherstep(edge, 1.0 - uv.y);
  mask *= uOpacity;
  float grain = (hash(gl_FragCoord.xy + fract(uTime * 7.31) * 113.0) - 0.5) * uGrain;
  vec4 color;
  if (uLightMode > 0.5) {
    float bloomPeak = max(bloom.r, max(bloom.g, bloom.b));
    float bloomLow = min(bloom.r, min(bloom.g, bloom.b));
    vec3 total = hdr + bloom * 0.3 * (bloomPeak - bloomLow) / max(bloomPeak, 0.0001);
    float peak = max(total.r, max(total.g, total.b));
    vec3 hue = total / max(peak, 0.0001);
    float tone = dot(hue, vec3(0.2126, 0.7152, 0.0722));
    float depth = mix(0.36, 0.09, smoothstep(0.06, 0.7, peak));
    vec3 ink = pow(clamp(hue * min(1.0, depth / max(tone, 0.001)), 0.0, 1.0), vec3(1.0 / 2.2));
    float alpha = clamp((1.0 - exp(-peak * 2.6)) * (1.0 + grain), 0.0, 1.0) * mask;
    color = vec4(ink * alpha, alpha);
  } else {
    vec3 mapped = 1.0 - exp(-(hdr + bloom));
    float level = max(mapped.r, max(mapped.g, mapped.b));
    mapped = clamp(mapped + grain * level, 0.0, 1.0) * mask;
    color = vec4(mapped, max(mapped.r, max(mapped.g, mapped.b)));
  }
  vec4 back = vec4(uBackground.rgb * uBackground.a, uBackground.a);
  outColor = color + back * (1.0 - color.a);
}`,k=Math.PI*2,Le=16,Ie=4,Be=2,dt=2.2,De=2560,X=5,A=(s,b,d)=>Math.min(d,Math.max(b,s)),mt=s=>{let b=s>>>0;return()=>{b=b+1831565813>>>0;let d=b;return d=Math.imul(d^d>>>15,d|1),d^=d+Math.imul(d^d>>>7,d|61),((d^d>>>14)>>>0)/4294967296}},Ue=(s,b,d)=>{const R=s.createShader(b);return R?(s.shaderSource(R,d),s.compileShader(R),s.getShaderParameter(R,s.COMPILE_STATUS)?R:(s.deleteShader(R),null)):null},H=(s,b,d,R)=>{const C=Ue(s,s.VERTEX_SHADER,b),G=Ue(s,s.FRAGMENT_SHADER,d),y=s.createProgram();if(!C||!G||!y)return null;if(s.attachShader(y,C),s.attachShader(y,G),R.forEach((F,P)=>s.bindAttribLocation(y,P,F)),s.linkProgram(y),s.deleteShader(C),s.deleteShader(G),!s.getProgramParameter(y,s.LINK_STATUS))return s.deleteProgram(y),null;const j={},ee=s.getProgramParameter(y,s.ACTIVE_UNIFORMS);for(let F=0;F<ee;F++){const P=s.getActiveUniform(y,F);P&&(j[P.name]=s.getUniformLocation(y,P.name))}return{program:y,uniforms:j}},Oe=(s,b)=>{const d=s()*k,R=b?.94:.2+s()*.68,C=b?d+Math.PI+(s()-.5)*1.6:s()*k;return{x:Math.sin(d)*R,y:Math.cos(d)*R,heading:C,velocity:.012+s()*.03,turn:(s()-.5)*.18}};function pt({color:s="#3ef09a",backgroundColor:b="transparent",mode:d="sweep",speed:R=1,trail:C=.35,scale:G=.9,ringCount:y=6,spokeCount:j=12,ticks:ee=!0,targets:F=6,clutter:P=.35,glow:Xe=1,brightness:Ge=1,gridOpacity:Ne=1,lineWidth:ze=1,tilt:Ye=0,centerX:He=.5,centerY:je=.5,mouseInteraction:We=!0,intro:qe=!0,grain:Ke=.03,fade:$e=0,opacity:Qe=1,lightMode:Je=!1,paused:Ze=!1,dpr:et,className:de="",...tt}){const me=V.useRef(null),he=V.useRef(null),te=V.useRef(null),pe={color:String(s),backgroundColor:String(b),mode:d==="pulse"?"pulse":"sweep",speed:R,trail:A(C,.02,1),scale:Math.max(.05,G),ringCount:Math.round(A(y,1,24)),spokeCount:Math.round(A(j,0,72)),ticks:ee,targets:Math.round(A(F,0,Le)),clutter:A(P,0,1),glow:Math.max(0,Xe),brightness:Math.max(0,Ge),gridOpacity:A(Ne,0,2),lineWidth:A(ze,.25,4),tilt:A(Ye,0,80)*Math.PI/180,centerX:He,centerY:je,mouseInteraction:We,intro:qe,grain:Math.max(0,Ke),fade:A($e,0,1),opacity:A(Qe,0,1),lightMode:Je,paused:Ze,dpr:et},M=V.useRef(pe);return M.current=pe,V.useEffect(()=>{const L=me.current,x=he.current,e=x?.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,stencil:!1});if(!L||!x||!e)return;const N=!!e.getExtension("EXT_color_buffer_float"),oe=N?1:.25,v={scene:H(e,Z,it,["aPosition"]),sprite:H(e,st,ut,["aCorner","aSprite","aStyle"]),down:H(e,Z,ct,["aPosition"]),up:H(e,Z,lt,["aPosition"]),composite:H(e,Z,ft,["aPosition"])};if(Object.values(v).some(t=>!t))return;const xe=e.createBuffer(),W=e.createVertexArray();e.bindVertexArray(W),e.bindBuffer(e.ARRAY_BUFFER,xe),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0);const ge=e.createBuffer(),re=e.createBuffer(),ae=e.createVertexArray();e.bindVertexArray(ae),e.bindBuffer(e.ARRAY_BUFFER,ge),e.bufferData(e.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),e.STATIC_DRAW),e.enableVertexAttribArray(0),e.vertexAttribPointer(0,2,e.FLOAT,!1,0,0),e.bindBuffer(e.ARRAY_BUFFER,re);for(let t=1;t<=2;t++)e.enableVertexAttribArray(t),e.vertexAttribPointer(t,4,e.FLOAT,!1,32,(t-1)*16),e.vertexAttribDivisor(t,1);e.bindVertexArray(null);const ne=()=>({texture:e.createTexture(),framebuffer:e.createFramebuffer(),width:0,height:0}),ie=(t,r,a)=>{t.width===r&&t.height===a||(t.width=r,t.height=a,e.bindTexture(e.TEXTURE_2D,t.texture),N?e.texImage2D(e.TEXTURE_2D,0,e.RGBA16F,r,a,0,e.RGBA,e.HALF_FLOAT,null):e.texImage2D(e.TEXTURE_2D,0,e.RGBA,r,a,0,e.RGBA,e.UNSIGNED_BYTE,null),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.LINEAR),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.bindFramebuffer(e.FRAMEBUFFER,t.framebuffer),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,t.texture,0))},z=ne(),I=Array.from({length:X+1},ne),q=Array.from({length:X},ne),B=document.createElement("canvas").getContext("2d",{willReadFrequently:!0}),K=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches??!1,se=new Map,ve=t=>{if(se.has(t))return se.get(t);let r=[1,1,1,1];if(B){B.clearRect(0,0,1,1),B.fillStyle="rgba(0, 0, 0, 0)",B.fillStyle=t,B.fillRect(0,0,1,1);const[a,c,o,l]=B.getImageData(0,0,1,1).data;r=l?[a/l,c/l,o/l,l/255]:[0,0,0,0]}return se.set(t,r),r},ot=t=>ve(t).slice(0,3).map(r=>Math.pow(r,2.2)),Te=mt(7919),be=Array.from({length:Le},()=>({...Oe(Te,!1),echoes:[]})),S={x:0,y:0,inside:!1,echoes:[]},w={x:0,y:0,inside:!1},T={width:1,height:1,ratio:1},i={time:0,sweep:0,swept:0,cycle:0,intro:M.current.intro&&!K?0:1,heat:0,heatVelocity:0,heatX:0,heatY:0},ue=new Float32Array(1280);let _=0,D=0,$=!0;const Re=t=>t.scale*Math.min(T.width,T.height)/T.height,ye=t=>({distance:2*Be/Re(t),focal:Be,tilt:t.tilt}),rt=(t,r,a)=>{const{distance:c,focal:o,tilt:l}=ye(t),m=(r-t.centerX*T.width)/T.height,h=(t.centerY*T.height-a)/T.height,f=Math.cos(l),p=Math.sin(l),n=m,u=o*p+h*f,g=-o*f+h*p;if(g>-1e-4)return null;const E=-c*p,J=-(c*f)/g;return[n*J,E+u*J]},Ae=t=>t.mode==="pulse"?3.2:6,at=(t,r)=>{const a=r*Math.abs(t.speed),c=t.mode==="pulse",o=c?1.15:k,l=a/Ae(t)*o,m=t.speed<0&&!c?-1:1,h=i.sweep;i.swept+=l;const f=n=>{n.echoes.unshift({x:n.x,y:n.y,time:i.time}),n.echoes.length>Ie&&(n.echoes.length=Ie)},p=(n,u)=>{if(c){const O=Math.hypot(n,u),J=h,fe=h+l;return O>J&&O<=fe||fe>o&&O<=fe-o}const g=Math.atan2(n,u),E=(m*(g-h)%k+k)%k;return E>0&&E<=l};for(let n=0;n<t.targets;n++){const u=be[n];u.heading+=u.turn*a,u.x+=Math.sin(u.heading)*u.velocity*a,u.y+=Math.cos(u.heading)*u.velocity*a,Math.hypot(u.x,u.y)>.96&&Object.assign(u,Oe(Te,!0)),p(u.x,u.y)&&f(u)}for(S.inside&&p(S.x,S.y)&&f(S),i.sweep+=m*l;i.sweep>=o;)i.sweep-=o,i.cycle+=1;for(;i.sweep<0;)i.sweep+=o,i.cycle+=1},nt=t=>{const r=2/(Re(t)*T.height),a=Ae(t)/Math.max(Math.abs(t.speed),.05)*1.1;let c=0;const o=(m,h,f,p,n,u,g)=>{c*8+8>ue.length||(ue.set([m,h,f,p,n,u,0,g],c*8),c++)},l=(m,h)=>{m.echoes.forEach((f,p)=>{const n=i.time-f.time,u=Math.exp(-n/a)*(p===0?1:.8);if(u<.01)return;const g=-Math.atan2(f.x,f.y);if(o(f.x,f.y,r*(p===0?3.4:2.4),0,u*h*2.2,p===0?1:.3,g),p===0&&n<1.4){const E=n/1.4,O=1-Math.pow(1-E,3);o(f.x,f.y,r*(4+26*O),1,(1-E)*(1-E)*h*1.4,0,0)}})};for(let m=0;m<t.targets;m++)l(be[m],1);return l(S,1.3),c},Q=(t,r,a,c)=>{e.bindFramebuffer(e.FRAMEBUFFER,r?r.framebuffer:null),e.viewport(0,0,a,c),e.useProgram(t.program),e.drawArrays(e.TRIANGLES,0,3)},Y=(t,r,a,c)=>{e.activeTexture(e.TEXTURE0+a),e.bindTexture(e.TEXTURE_2D,c),e.uniform1i(t.uniforms[r],a)},we=(t,r)=>{const a=t.uniforms,{distance:c,focal:o,tilt:l}=ye(r);e.uniform2f(a.uResolution,x.width,x.height),e.uniform2f(a.uCenter,r.centerX*x.width,(1-r.centerY)*x.height),e.uniform1f(a.uViewHeight,x.height),e.uniform1f(a.uFocal,o),e.uniform1f(a.uDistance,c),e.uniform1f(a.uTilt,l)},ce=()=>{const t=M.current,r=ot(t.color),a=i.intro;ie(z,x.width,x.height);const c=v.scene,o=c.uniforms;e.useProgram(c.program),we(c,t),e.uniform1f(o.uMode,t.mode==="pulse"?1:0),e.uniform1f(o.uSweep,i.sweep),e.uniform1f(o.uSwept,Math.min(i.swept,k+1)),e.uniform1f(o.uDirection,t.speed<0&&t.mode!=="pulse"?-1:1),e.uniform1f(o.uCycle,i.cycle),e.uniform1f(o.uTrail,t.mode==="pulse"?t.trail*.22:t.trail*k*.5),e.uniform1f(o.uRings,t.ringCount),e.uniform1f(o.uSpokes,t.spokeCount),e.uniform1f(o.uTicks,t.ticks?1:0),e.uniform1f(o.uGrid,t.gridOpacity),e.uniform1f(o.uLine,t.lineWidth*T.ratio),e.uniform1f(o.uClutter,t.clutter*(t.lightMode?.6:1)),e.uniform1f(o.uTime,i.time),e.uniform3fv(o.uAccent,r),e.uniform3f(o.uHeat,i.heatX,i.heatY,i.heat),e.uniform1f(o.uIntro,a),e.uniform1f(o.uRange,oe),e.uniform1f(o.uPixel,T.ratio),e.bindVertexArray(W),Q(c,z,x.width,x.height);const l=nt(t);if(l>0){const n=v.sprite;e.useProgram(n.program),we(n,t),e.uniform3fv(n.uniforms.uAccent,r),e.uniform1f(n.uniforms.uRange,oe*Math.min(1,a*2)),e.enable(e.BLEND),e.blendFunc(e.ONE,e.ONE),e.bindVertexArray(ae),e.bindBuffer(e.ARRAY_BUFFER,re),e.bufferData(e.ARRAY_BUFFER,ue.subarray(0,l*8),e.DYNAMIC_DRAW),e.drawArraysInstanced(e.TRIANGLE_STRIP,0,4,l),e.disable(e.BLEND)}e.bindVertexArray(W);let m=z;for(let n=0;N&&n<=X;n++){const u=I[n],g=n===0?Math.round(T.width/2):m.width>>1,E=n===0?Math.round(T.height/2):m.height>>1;ie(u,Math.max(1,g),Math.max(1,E)),e.useProgram(v.down.program),e.uniform2f(v.down.uniforms.uTexel,1/m.width,1/m.height),e.uniform2f(v.down.uniforms.uTarget,u.width,u.height),Y(v.down,"uSource",0,m.texture),Q(v.down,u,u.width,u.height),m=u}for(let n=X-1;N&&n>=0;n--){const u=n===X-1?I[X]:q[n+1],g=q[n];ie(g,I[n].width,I[n].height),e.useProgram(v.up.program),e.uniform2f(v.up.uniforms.uTexel,1/u.width,1/u.height),e.uniform2f(v.up.uniforms.uTarget,g.width,g.height),Y(v.up,"uSource",0,u.texture),Y(v.up,"uBase",1,I[n].texture),Q(v.up,g,g.width,g.height)}const h=v.composite,f=h.uniforms;e.useProgram(h.program),e.uniform2f(f.uResolution,x.width,x.height),e.uniform1f(f.uExposure,1.5*t.brightness/oe),e.uniform1f(f.uGlow,N?t.glow:0),e.uniform1f(f.uGrain,t.grain),e.uniform1f(f.uFade,t.fade),e.uniform1f(f.uOpacity,t.opacity),e.uniform1f(f.uTime,i.time%1e3),e.uniform1f(f.uLightMode,t.lightMode?1:0);const p=ve(t.backgroundColor);e.uniform4f(f.uBackground,p[0],p[1],p[2],p[3]),Y(h,"uScene",0,z.texture),Y(h,"uBloom",1,q[0].texture),Q(h,null,x.width,x.height)},Ee=t=>{if(_=0,!$||document.hidden)return;const r=M.current,a=D?Math.min(.05,(t-D)/1e3):1/60;D=t;const c=!r.paused&&!K;!r.intro||K?i.intro=1:i.intro<1&&(i.intro=Math.min(1,i.intro+a/dt));const o=r.mouseInteraction&&w.inside&&!K?rt(r,w.x,w.y):null;S.inside=!!o&&Math.hypot(o[0],o[1])<.98,o&&(S.x=o[0],S.y=o[1],i.heatX+=(o[0]-i.heatX)*(1-Math.exp(-a*10)),i.heatY+=(o[1]-i.heatY)*(1-Math.exp(-a*10)));const l=S.inside?1:0;if(i.heatVelocity+=(120*(l-i.heat)-19*i.heatVelocity)*a,i.heat=A(i.heat+i.heatVelocity*a,0,1.2),c){i.time+=a;const h=.25+.75*A((i.intro-.35)/.65,0,1);at(r,a*h)}ce();const m=i.intro<1||i.heat>.001||Math.abs(i.heatVelocity)>.001;c||m?_=requestAnimationFrame(Ee):D=0},U=()=>{!_&&$&&!document.hidden&&(_=requestAnimationFrame(Ee))},le=()=>{const t=M.current,r=Math.max(1,L.clientWidth),a=Math.max(1,L.clientHeight),c=Math.min(t.dpr||window.devicePixelRatio||1,2),o=Math.max(r,a)*c,l=o>De?c*De/o:c;T.width=r,T.height=a,T.ratio=l,x.width=Math.max(1,Math.round(r*l)),x.height=Math.max(1,Math.round(a*l)),_||ce(),U()},Se=t=>{const r=L.getBoundingClientRect();w.x=t.clientX-r.left,w.y=t.clientY-r.top,w.inside=w.x>=0&&w.y>=0&&w.x<=r.width&&w.y<=r.height,U()},Me=()=>{w.inside=!1,U()},ke=()=>{D=0,U()},Ce=new ResizeObserver(le);Ce.observe(L);const Fe=new IntersectionObserver(t=>{$=t.some(r=>r.isIntersecting),$&&(D=0,U())});Fe.observe(L),window.addEventListener("pointermove",Se,{passive:!0}),document.documentElement.addEventListener("pointerleave",Me),document.addEventListener("visibilitychange",ke),le();let Pe=M.current.dpr;return te.current=()=>{if(M.current.dpr!==Pe){Pe=M.current.dpr,le();return}_||ce(),U()},()=>{cancelAnimationFrame(_),te.current=null,Ce.disconnect(),Fe.disconnect(),window.removeEventListener("pointermove",Se),document.documentElement.removeEventListener("pointerleave",Me),document.removeEventListener("visibilitychange",ke);for(const t of[z,...I,...q])e.deleteTexture(t.texture),e.deleteFramebuffer(t.framebuffer);for(const t of Object.values(v))e.deleteProgram(t.program);e.deleteBuffer(xe),e.deleteBuffer(ge),e.deleteBuffer(re),e.deleteVertexArray(W),e.deleteVertexArray(ae),e.getExtension("WEBGL_lose_context")?.loseContext()}},[]),V.useEffect(()=>{te.current?.()}),_e.jsx("div",{ref:me,className:`radar-container${de?` ${de}`:""}`,...tt,children:_e.jsx("canvas",{ref:he,className:"radar-canvas","aria-hidden":"true"})})}export{pt as default};
