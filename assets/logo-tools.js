/* Removes only near-white pixels connected to an image edge. Interior whites stay intact. */
(function(root){
function removeBackground(pixels,width,height,color=[255,255,255],tolerance=28){
 const out=new Uint8ClampedArray(pixels),seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0,removed=0;
 const visit=n=>{if(seen[n])return;seen[n]=1;const i=n*4;const distance=Math.max(...color.map((v,c)=>Math.abs(v-out[i+c])));if(out[i+3]===0||distance<=tolerance)queue[tail++]=n;};
 for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x)}for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1)}
 while(head<tail){const n=queue[head++],i=n*4;if(out[i+3]){out[i+3]=0;removed++}const x=n%width,y=Math.floor(n/width);if(x)visit(n-1);if(x<width-1)visit(n+1);if(y)visit(n-width);if(y<height-1)visit(n+width)}
 return {pixels:out,removed};
}
function detectBackground(pixels,width,height){
 const buckets=new Map();const add=n=>{const i=n*4;if(pixels[i+3]<200)return;const rgb=[pixels[i],pixels[i+1],pixels[i+2]],key=rgb.map(v=>Math.round(v/24)).join(',');let b=buckets.get(key);if(!b)buckets.set(key,b={count:0,sum:[0,0,0]});b.count++;rgb.forEach((v,c)=>b.sum[c]+=v)};
 for(let x=0;x<width;x++){add(x);if(height>1)add((height-1)*width+x)}for(let y=1;y<height-1;y++){add(y*width);if(width>1)add(y*width+width-1)}
 const best=[...buckets.values()].sort((a,b)=>b.count-a.count)[0];return best?best.sum.map(v=>Math.round(v/best.count)):null;
}
function removeWhiteBackground(pixels,width,height){return removeBackground(pixels,width,height)}
const api={removeWhiteBackground,removeBackground,detectBackground};if(typeof module==='object'&&module.exports)module.exports=api;else root.GGLogoTools=api;
})(typeof window==='undefined'?this:window);
