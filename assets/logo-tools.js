/* Removes only near-white pixels connected to an image edge. Interior whites stay intact. */
(function(root){
function removeWhiteBackground(pixels,width,height){
 const out=new Uint8ClampedArray(pixels),seen=new Uint8Array(width*height),queue=new Int32Array(width*height);let head=0,tail=0,removed=0;
 const visit=n=>{if(seen[n])return;seen[n]=1;const i=n*4,min=Math.min(out[i],out[i+1],out[i+2]),max=Math.max(out[i],out[i+1],out[i+2]);if(out[i+3]===0||(min>=232&&max-min<=18))queue[tail++]=n;};
 for(let x=0;x<width;x++){visit(x);visit((height-1)*width+x)}for(let y=0;y<height;y++){visit(y*width);visit(y*width+width-1)}
 while(head<tail){const n=queue[head++],i=n*4;if(out[i+3]){out[i+3]=0;removed++}const x=n%width,y=Math.floor(n/width);if(x)visit(n-1);if(x<width-1)visit(n+1);if(y)visit(n-width);if(y<height-1)visit(n+width)}
 return {pixels:out,removed};
}
const api={removeWhiteBackground};if(typeof module==='object'&&module.exports)module.exports=api;else root.GGLogoTools=api;
})(typeof window==='undefined'?this:window);
