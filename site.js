// Tuning dial on the home page
(function(){
  var dial=document.querySelector('.dial'); if(!dial) return;
  var needle=dial.querySelector('.needle'), q=dial.querySelector('.sample q'), label=dial.querySelector('.sample small');
  var btns=[].slice.call(dial.querySelectorAll('.station'));
  function tune(b){
    var i=btns.indexOf(b);
    btns.forEach(function(x){x.setAttribute('aria-pressed', x===b?'true':'false')});
    var band=needle.parentNode.getBoundingClientRect(), r=b.getBoundingClientRect();
    needle.style.left=((r.left+r.width/2-band.left)/band.width*100)+'%';
    label.textContent='Example script for '+b.dataset.for+':';
    q.textContent=b.dataset.script;
  }
  btns.forEach(function(b){b.addEventListener('click',function(){tune(b)});b.addEventListener('mouseenter',function(){tune(b)})});
  setTimeout(function(){tune(btns[2])},500);
  window.addEventListener('resize',function(){var a=dial.querySelector('.station[aria-pressed=true]');if(a)tune(a)});
})();
// Forms
(function(){
  var ENDPOINT=window.HMFF_FORM_ENDPOINT||'';
  [].forEach.call(document.querySelectorAll('form[data-form]'),function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      var s=f.querySelector('.status'), btn=f.querySelector('button[type=submit]');
      if(f.querySelector('.hp input').value){return}
      var data={form:f.dataset.form,page:location.pathname,sent:new Date().toISOString()};
      new FormData(f).forEach(function(v,k){if(k!=='website')data[k]=v});
      if(!ENDPOINT){s.className='status err';s.textContent='This form is not connected yet. Please try again soon.';return}
      btn.disabled=true;s.className='status';s.textContent='Sending.';
      fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
        .then(function(r){if(!r.ok)throw 0;f.reset();s.className='status ok';s.textContent=f.dataset.done||'Sent. We will be in touch.'})
        .catch(function(){s.className='status err';s.textContent='That did not send. Check your connection and send it again.'})
        .then(function(){btn.disabled=false});
    });
  });
})();

// Hero sound waves: slow rings spreading from behind the photo
(function(){
  var c=document.querySelector('canvas.waves'); if(!c) return;
  var x=c.getContext('2d'), w=0, h=0, d=Math.min(window.devicePixelRatio||1,2), t=0, GAP=74;
  var still=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function size(){var r=c.getBoundingClientRect(); if(!r.width) return; w=r.width; h=r.height; c.width=w*d; c.height=h*d; x.setTransform(d,0,0,d,0,0)}
  function draw(){
    if(!w){size(); if(!w) return}
    x.clearRect(0,0,w,h);
    var narrow=w<700, ox=narrow?w*.5:w*.76, oy=narrow?h*.8:h*.52, max=Math.max(w,h)*(narrow?.95:.8);
    for(var r=(t%GAP); r<max; r+=GAP){
      var k=r/max, a=Math.sin(Math.min(1,k*3)*Math.PI/2)*Math.pow(1-k,1.6)*(narrow?.09:.11);
      x.beginPath(); x.arc(ox,oy,r,0,Math.PI*2);
      x.strokeStyle='rgba(0,148,176,'+a.toFixed(3)+')'; x.lineWidth=1+1.5*(1-k); x.stroke();
    }
  }
  function loop(){t+=.1; draw(); requestAnimationFrame(loop)}
  size(); window.addEventListener('resize',function(){size(); draw()});
  if(still){t=30; draw()} else loop();
})();
// Sponsor portal lists
(function(){
  var V=window.FRP_VOICES||{}, pick=document.getElementById('voice-pick');
  function esc(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML}
  [].forEach.call(document.querySelectorAll('[data-voices]'),function(box){
    var kind=box.dataset.voices, list=V[kind]||[];
    if(!list.length){
      box.innerHTML=kind==='waiting'
        ?'<p class="empty">No one is waiting yet. Applications have just opened, and each approved cause will appear here.</p><div class="voice sample"><span class="meta">Example of a listing</span><h4>Name of the cause</h4><p>One or two sentences in their own words about what they want listeners to hear.</p><span class="meta">Town, and how long they have waited</span></div>'
        :'<p class="empty">No ads are on the air yet. The first sponsored ads will be listed here with the sponsor who paid for them.</p>';
      return;
    }
    box.innerHTML=list.map(function(v){
      return '<div class="voice"><h4>'+esc(v.name)+'</h4><p>'+esc(v.message)+'</p><span class="meta">'+esc(v.town)+(v.sponsor?' · Airtime paid for by '+esc(v.sponsor):'')+'</span>'+(kind==='waiting'?'<a class="btn small" href="#sponsor" data-pick="'+esc(v.id)+'">Sponsor this voice</a>':'')+'</div>';
    }).join('');
    if(kind==='waiting'&&pick) list.forEach(function(v){var o=document.createElement('option');o.value=v.id;o.textContent=v.name;pick.appendChild(o)});
  });
  document.addEventListener('click',function(e){var b=e.target.closest('[data-pick]'); if(b&&pick) pick.value=b.dataset.pick});
})();

// Scroll reveals and photo drift
(function(){
  document.documentElement.classList.add('js');
  if(!('IntersectionObserver' in window)||(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches)) return;
  var groups=['main h2','main h3','main p.measure','.band .wrap>div>p','.plain li','.steps li','.tiles figure','img.wide','.who-head>div','.faq details','.voice','.ledger tbody tr','main form','.note','.bleed-wrap','main section .btn','img.badge','.embed'];
  var seen=[];
  groups.forEach(function(sel){
    [].forEach.call(document.querySelectorAll(sel),function(el){
      if(el.closest('.hero-grid')||el.closest('[data-rv]')||seen.indexOf(el)>-1) return;
      seen.push(el); el.setAttribute('data-rv','');
      var sibs=[].filter.call(el.parentNode.children,function(s){return s.matches(sel.split(' ').pop())});
      var i=sibs.indexOf(el); if(i>0) el.style.setProperty('--d',Math.min(i,6)*0.09+'s');
    });
  });
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});
  seen.forEach(function(el){io.observe(el)});
  var bw=document.querySelector('.bleed-wrap img'), tick=false;
  function drift(){tick=false; if(!bw) return; var w=bw.parentNode, r=w.getBoundingClientRect(), vh=window.innerHeight; if(r.bottom<-50||r.top>vh+50) return; var p=Math.max(0,Math.min(1,(vh-r.top)/(vh+r.height))); bw.style.setProperty('--py',(-p*(bw.offsetHeight-r.height)).toFixed(1)+'px')}
  window.addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(drift)}},{passive:true}); window.addEventListener('resize',drift); drift();
})();

// Donation widget (preview mode: nothing is charged or saved)
(function(){
  var root=document.getElementById('give'); if(!root) return;
  var GOAL=250;
  var causes=[
    {id:'pantry',name:'Neighborhood Food Pantry',group:'Food',line:'Wants every family nearby to know when the doors are open.',raised:185},
    {id:'fire',name:'Volunteer Fire Company',group:'Safety',line:'Needs new volunteers before the winter call season.',raised:90},
    {id:'rescue',name:'Animal Rescue',group:'Animals',line:'Has twelve dogs ready for homes and an adoption day coming up.',raised:230},
    {id:'soccer',name:'Youth Soccer League',group:'Youth',line:'Is looking for coaches and has free spots for kids who can\'t pay.',raised:40},
    {id:'garden',name:'Community Garden',group:'Neighborhood',line:'Is inviting neighbors to claim a free plot this spring.',raised:125},
    {id:'walk',name:'Walk-to-School Safety Group',group:'Safety',line:'A parent asking drivers to slow down near the elementary school.',raised:0}
  ];
  var groups=['All'].concat(causes.map(function(c){return c.group}).filter(function(g,i,a){return a.indexOf(g)===i}));
  var state={amt:100,group:'All',sel:['rescue']};
  var chips=root.querySelector('.chips'), list=root.querySelector('.cause-list'), split=root.querySelector('.give-split');
  var form=document.getElementById('give-form'), custom=document.getElementById('give-custom'), done=root.querySelector('.give-done');
  function money(n){return '$'+(Math.round(n*100)/100).toLocaleString('en-US',{minimumFractionDigits:n%1?2:0,maximumFractionDigits:2})}
  // Even split across chosen causes; anything a cause doesn't need rolls on to the others, then to the next cause in line.
  function allocate(){
    var out={}, left=state.amt, pool=state.sel.map(function(id){return causes.filter(function(c){return c.id===id})[0]});
    var need={}; pool.forEach(function(c){need[c.id]=Math.max(0,GOAL-c.raised); out[c.id]=0});
    var open=pool.filter(function(c){return need[c.id]>0});
    while(left>0.005&&open.length){
      var share=left/open.length, used=0;
      open.forEach(function(c){var g=Math.min(share,need[c.id]-out[c.id]); out[c.id]+=g; used+=g});
      left-=used; open=open.filter(function(c){return need[c.id]-out[c.id]>0.005});
      if(used<0.005) break;
    }
    return {by:out,extra:Math.max(0,left)};
  }
  function draw(){
    var a=allocate();
    chips.innerHTML=groups.map(function(g){return '<button type="button" data-g="'+g+'"'+(g===state.group?' class="on"':'')+'>'+g+'</button>'}).join('');
    list.innerHTML=causes.filter(function(c){return state.group==='All'||c.group===state.group}).map(function(c){
      var sel=state.sel.indexOf(c.id)>-1, mine=a.by[c.id]||0, total=c.raised+mine, full=total>=GOAL-0.005;
      return '<div class="cause'+(sel?' sel':'')+'"><div><h4>'+c.name+'<span class="tag">'+c.group+'</span><span class="tag eg">Example</span></h4></div>'
        +'<button type="button" class="pick" data-id="'+c.id+'" aria-pressed="'+sel+'">'+(sel?'Chosen':'Choose')+'</button>'
        +'<p>'+c.line+'</p>'
        +'<div class="meter"><div class="track" role="img" aria-label="'+Math.round(total/GOAL*100)+' percent funded"><div class="have" style="width:'+(c.raised/GOAL*100)+'%"></div><div class="yours" style="width:'+(mine/GOAL*100)+'%"></div></div>'
        +'<div class="nums"><span><b>'+Math.round(total/GOAL*100)+'%</b> of the way to the air</span><span'+(full?' class="full">Fully funded with your gift':'>'+money(GOAL-total)+' to go')+'</span></div></div></div>';
    }).join('');
    var rows=state.sel.map(function(id){var c=causes.filter(function(x){return x.id===id})[0], g=a.by[id]||0; return '<li><span>'+c.name+'</span><span'+(c.raised+g>=GOAL-0.005?' class="air">'+money(g)+' · on the air':'>'+money(g))+'</span></li>'}).join('');
    if(a.extra>0.005) rows+='<li><span>Next cause in line</span><span>'+money(a.extra)+'</span></li>';
    var aired=state.sel.filter(function(id){var c=causes.filter(function(x){return x.id===id})[0]; return c.raised<GOAL&&c.raised+(a.by[id]||0)>=GOAL-0.005}).length;
    split.innerHTML=!state.amt?'Choose an amount to see where it goes.':(!state.sel.length?'<strong>'+money(state.amt)+'</strong> goes to whichever cause has waited longest. Choose causes on the left to direct it yourself.':'<strong>'+money(state.amt)+'</strong> split across '+state.sel.length+(state.sel.length===1?' cause':' causes')+(aired?', enough to put '+aired+(aired===1?' ad':' ads')+' on the air':'')+':<ul>'+rows+'</ul>');
  }
  root.addEventListener('click',function(e){
    var t=e.target.closest('button'); if(!t) return;
    if(t.dataset.g){state.group=t.dataset.g; draw()}
    else if(t.dataset.id){var i=state.sel.indexOf(t.dataset.id); if(i>-1) state.sel.splice(i,1); else state.sel.push(t.dataset.id); draw()}
    else if(t.dataset.amt){state.amt=+t.dataset.amt; custom.value=''; [].forEach.call(root.querySelectorAll('.amounts button'),function(b){b.classList.toggle('on',b===t)}); draw()}
    else if(t.dataset.again){done.hidden=true; form.hidden=false; draw()}
  });
  custom.addEventListener('input',function(){var v=parseFloat(custom.value.replace(/[^0-9.]/g,'')); state.amt=isFinite(v)&&v>0?Math.min(v,100000):0; [].forEach.call(root.querySelectorAll('.amounts button'),function(b){b.classList.remove('on')}); draw()});
  form.addEventListener('submit',function(e){
    e.preventDefault(); var st=form.querySelector('.status'), n=form.elements.name.value.trim(), em=form.elements.email.value.trim();
    if(!state.amt){st.textContent='Choose an amount first.'; return}
    if(!n||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)){st.textContent='Add your name and a valid email to preview your account.'; return}
    st.textContent=''; var a=allocate(), who=form.elements.organization.value.trim()||n;
    var esc=function(s){var d=document.createElement('div');d.textContent=s;return d.innerHTML};
    var rows=state.sel.map(function(id){var c=causes.filter(function(x){return x.id===id})[0], g=a.by[id]||0, pct=Math.min(100,Math.round((c.raised+g)/GOAL*100)); return '<li><span>'+c.name+'</span><span>'+money(g)+' · '+(pct>=100?'on the air':pct+'%')+'</span></li>'}).join('');
    if(!state.sel.length) rows='<li><span>Longest-waiting cause</span><span>'+money(state.amt)+'</span></li>';
    else if(a.extra>0.005) rows+='<li><span>Next cause in line</span><span>'+money(a.extra)+'</span></li>';
    done.innerHTML='<h3>Your sponsor account</h3><p class="muted small"><strong>Preview only.</strong> No money was collected and nothing was saved.</p><div class="acct"><ul><li><span>Sponsor</span><span>'+esc(who)+'</span></li><li><span>Total given</span><span>'+money(state.amt)+'</span></li></ul></div><div class="acct"><ul>'+rows+'</ul></div><p class="muted small">Once we are live, this is where you would follow each cause, download your receipt and copy your sponsor badge.</p><button type="button" class="btn ghost" data-again="1">Change my gift</button>';
    form.hidden=true; done.hidden=false;
  });
  draw();
})();
