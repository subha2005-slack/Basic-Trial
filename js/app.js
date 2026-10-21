(function(){
var KEY="linksaver.v1",GR=[["#8b6bff","#5b8bff"],["#ff6ba8","#ff9a6b"],["#35d6ff","#4b6bff"],["#3de8a8","#2bb3d6"],["#ffc857","#ff7a59"],["#c26bff","#ff6bd6"]];
var S={folders:[],active:null},q="",scope="one",fmt="md",editing=null,color=0;
var $=function(i){return document.getElementById(i)};
function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
function uid(){return Math.random().toString(36).slice(2,9)}
function load(){try{var r=localStorage.getItem(KEY);if(r){var d=JSON.parse(r);if(d&&d.folders&&d.folders.length){S=d;return}}}catch(e){}
  S={folders:[{id:uid(),name:"Start here",c:0,links:[{id:uid(),url:"https://developer.mozilla.org",title:"MDN Web Docs",t:Date.now()},{id:uid(),url:"https://www.wikipedia.org",title:"Wikipedia",t:Date.now()}]},{id:uid(),name:"Read later",c:1,links:[]}]};S.active=S.folders[0].id}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}
function cur(){return S.folders.find(function(f){return f.id===S.active})||S.folders[0]}
function grad(i){var g=GR[i%GR.length];return "linear-gradient(135deg,"+g[0]+","+g[1]+")"}
function host(u){try{return new URL(u).hostname.replace(/^www\./,"")}catch(e){return u}}
function norm(u){u=u.trim();if(!u)return"";if(!/^[a-z][a-z0-9+.-]*:\/\//i.test(u))u="https://"+u;try{var p=new URL(u);if(!/^https?:$/.test(p.protocol))return"";return p.href}catch(e){return""}}
function toast(m){var t=$("toast");t.textContent=m;t.classList.add("on");clearTimeout(toast.h);toast.h=setTimeout(function(){t.classList.remove("on")},2200)}
var FI='<svg viewBox="0 0 24 24"><path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>';
function render(){
  var f=cur();S.active=f.id;
  $("folders").innerHTML=S.folders.map(function(x){return '<button class="f'+(x.id===f.id?' on':'')+'" data-id="'+x.id+'"><span class="gem" style="background:'+grad(x.c)+'">'+FI+'</span><div><b>'+esc(x.name)+'</b><small>'+x.links.length+(x.links.length===1?' link':' links')+'</small></div></button>'}).join("");
  $("title").textContent=f.name;
  $("sub").textContent=f.links.length?f.links.length+(f.links.length===1?" saved link":" saved links"):"Nothing saved yet";
  var n=q.toLowerCase(),L=f.links.filter(function(l){return !n||(l.title+" "+l.url).toLowerCase().indexOf(n)>-1});
  if(!L.length){$("grid").innerHTML='<div class="empty glass" style="grid-column:1/-1"><h2>'+(f.links.length?'No matches':'This folder is empty')+'</h2>'+(f.links.length?'Try a different search.':'Paste a link above and press Save link.')+'</div>'}
  else $("grid").innerHTML=L.map(function(l,i){return '<article class="card glass" style="animation-delay:'+Math.min(i,8)*30+'ms"><div class="top"><span class="ic" style="background:'+grad(host(l.url).length+f.c)+'">'+esc(host(l.url).charAt(0))+'</span><div style="min-width:0"><h3>'+esc(l.title)+'</h3><div class="host">'+esc(host(l.url))+'</div></div></div><div class="row">'+(embed(l.url)?'<button class="btn pri" data-play="'+l.id+'" style="flex:1;justify-content:center;padding:8px 12px">Watch</button><a class="btn icb" style="flex:none" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer" aria-label="Open in new tab">Open</a>':'<a class="btn" href="'+esc(l.url)+'" target="_blank" rel="noopener noreferrer">Open</a>')+'<button class="btn icb" data-copy="'+l.id+'" aria-label="Copy link">Copy</button><button class="btn icb dng" data-rm="'+l.id+'" aria-label="Delete link">Delete</button></div></article>'}).join("")
}
function copy(text,ok){
  function fb(){var t=document.createElement("textarea");t.value=text;t.style.cssText="position:fixed;opacity:0";document.body.appendChild(t);t.select();try{document.execCommand("copy");toast(ok)}catch(e){toast("Select the text and copy it")}document.body.removeChild(t)}
  try{navigator.clipboard.writeText(text).then(function(){toast(ok)},fb)}catch(e){fb()}
}
function data(){return scope==="all"?S.folders:[cur()]}
function enc(s){return btoa(unescape(encodeURIComponent(s)))}
function dec(s){return decodeURIComponent(escape(atob(s)))}
function payload(){return data().map(function(f){return {name:f.name,c:f.c,links:f.links.map(function(l){return {url:l.url,title:l.title}})}})}
function build(){
  var d=payload();
  if(fmt==="md")return d.map(function(f){return "## "+f.name+"\n\n"+(f.links.map(function(l){return "- ["+l.title.replace(/[\[\]]/g,"")+"]("+l.url+")"}).join("\n")||"_No links_")}).join("\n\n");
  var j=JSON.stringify({app:"linksaver",v:1,folders:d},null,2);
  return fmt==="json"?j:enc(JSON.stringify({app:"linksaver",v:1,folders:d}));
}
var hints={md:"Readable list that works in chat, docs and notes.",json:"Full backup you can import into Link Saver later.",code:"One short code. Send it to anyone and they can paste it into Import links."};
function refExp(){$("out").value=build();$("hint").textContent=hints[fmt];
  [].forEach.call($("scope").children,function(b){b.classList.toggle("on",b.dataset.v===scope)});
  [].forEach.call($("fmt").children,function(b){b.classList.toggle("on",b.dataset.v===fmt)})}
function open(id){$(id).classList.add("on")}
function closeAll(){$("pframe").innerHTML="";[].forEach.call(document.querySelectorAll(".scrim"),function(m){m.classList.remove("on")})}
function folderModal(f){editing=f||null;$("fh").textContent=f?"Rename folder":"New folder";$("fname").value=f?f.name:"";color=f?f.c:S.folders.length%GR.length;
  $("sw").innerHTML=GR.map(function(g,i){return '<button type="button" role="radio" aria-label="Color '+(i+1)+'" data-c="'+i+'" class="'+(i===color?'on':'')+'" style="background:'+grad(i)+'"></button>'}).join("");open("mF");setTimeout(function(){$("fname").focus()},50)}
function addLink(){
  var u=norm($("url").value);if(!u){toast("Enter a valid web link");$("url").focus();return}
  var f=cur();if(f.links.some(function(l){return l.url===u})){toast("Already saved in this folder");return}
  f.links.unshift({id:uid(),url:u,title:$("ttl").value.trim()||host(u),t:Date.now()});
  $("url").value="";$("ttl").value="";save();render();toast("Link saved")
}
function embed(u){var p;try{p=new URL(u)}catch(e){return null}var h=p.hostname.replace(/^www\.|^m\./,""),m=null,v,d;
  if(h==="youtu.be")m=p.pathname.slice(1).split("/")[0];
  else if(h==="youtube.com"||h==="music.youtube.com"){if(p.pathname==="/watch")m=p.searchParams.get("v");else{var x=p.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{6,})/);m=x&&x[1]}}
  if(m&&/^[\w-]{6,}$/.test(m))return{k:"i",s:"https://www.youtube-nocookie.com/embed/"+m+"?rel=0&autoplay=1"};
  if(h==="vimeo.com"){v=p.pathname.match(/\/(\d+)/);if(v)return{k:"i",s:"https://player.vimeo.com/video/"+v[1]+"?autoplay=1"}}
  if(h==="dailymotion.com"){d=p.pathname.match(/\/video\/(\w+)/);if(d)return{k:"i",s:"https://www.dailymotion.com/embed/video/"+d[1]}}
  if(/\.(mp4|webm|ogv|mov)$/i.test(p.pathname))return{k:"v",s:u};
  return null}
function play(id){var l=cur().links.find(function(x){return x.id===id}),e=l&&embed(l.url);if(!e)return;
  $("ptitle").textContent=l.title;$("pori").href=l.url;
  $("pframe").innerHTML=e.k==="v"?'<video controls autoplay playsinline src="'+esc(e.s)+'"></video>':'<iframe src="'+esc(e.s)+'" title="'+esc(l.title)+'" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>';
  open("mP")}
$("add").onclick=addLink;
$("url").onkeydown=$("ttl").onkeydown=function(e){if(e.key==="Enter")addLink()};
$("q").oninput=function(e){q=e.target.value;render()};
$("folders").onclick=function(e){var b=e.target.closest(".f");if(b){S.active=b.dataset.id;q="";$("q").value="";save();render()}};
$("grid").onclick=function(e){var f=cur(),r=e.target.closest("[data-rm]"),c=e.target.closest("[data-copy]");
  if(r){f.links=f.links.filter(function(l){return l.id!==r.dataset.rm});save();render();toast("Link deleted")}
  if(c){var l=f.links.find(function(x){return x.id===c.dataset.copy});if(l)copy(l.url,"Link copied")}
  var p=e.target.closest("[data-play]");if(p)play(p.dataset.play)};
$("newF").onclick=function(){folderModal()};
$("ren").onclick=function(){folderModal(cur())};
$("sw").onclick=function(e){var b=e.target.closest("[data-c]");if(b){color=+b.dataset.c;[].forEach.call($("sw").children,function(x){x.classList.toggle("on",x===b)})}};
$("fok").onclick=function(){var n=$("fname").value.trim();if(!n){toast("Name the folder");return}
  if(editing){editing.name=n;editing.c=color}else{var f={id:uid(),name:n,c:color,links:[]};S.folders.push(f);S.active=f.id}
  save();closeAll();render();toast("Folder saved")};
$("fname").onkeydown=function(e){if(e.key==="Enter")$("fok").click()};
$("del").onclick=function(){var f=cur();if(S.folders.length<2){toast("Keep at least one folder");return}
  if(confirm('Delete "'+f.name+'" and its '+f.links.length+' links?')){S.folders=S.folders.filter(function(x){return x!==f});S.active=S.folders[0].id;save();render();toast("Folder deleted")}};
$("exp").onclick=function(){scope="one";fmt="md";refExp();$("nshare").style.display=navigator.share?"":"none";open("mExp")};
$("scope").onclick=function(e){var b=e.target.closest("[data-v]");if(b){scope=b.dataset.v;refExp()}};
$("fmt").onclick=function(e){var b=e.target.closest("[data-v]");if(b){fmt=b.dataset.v;refExp()}};
$("copy").onclick=function(){copy($("out").value,"Copied to clipboard")};
$("nshare").onclick=function(){try{navigator.share({title:"Link Saver",text:$("out").value}).catch(function(){})}catch(e){}};
$("out").onfocus=function(){this.select()};
$("imp").onclick=function(){$("inp").value="";open("mImp")};
$("doImp").onclick=function(){
  var raw=$("inp").value.trim(),d=null;
  try{d=JSON.parse(raw)}catch(e){try{d=JSON.parse(dec(raw))}catch(e2){}}
  if(!d||!d.folders||!d.folders.length){toast("That doesn’t look like a Link Saver export");return}
  var n=0;d.folders.forEach(function(f){var u=[];(f.links||[]).forEach(function(l){var h=norm(l.url||"");if(h){u.push({id:uid(),url:h,title:String(l.title||host(h)).slice(0,200),t:Date.now()});n++}});
    S.folders.push({id:uid(),name:String(f.name||"Imported").slice(0,40),c:(+f.c||0)%GR.length,links:u})});
  S.active=S.folders[S.folders.length-1].id;save();closeAll();render();toast("Imported "+n+" links")};
document.addEventListener("click",function(e){if(e.target.hasAttribute&&e.target.hasAttribute("data-close")||e.target.classList.contains("scrim"))closeAll()});
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeAll()});
load();render();
})();
