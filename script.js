(function(){
  var params=new URLSearchParams(window.location.search);
  var fields={};
  var paramMap={
    'first_name':'firstName','last_name':'lastName','full_name':'fullName',
    'email':'email','phone':'phone','company':'company',
    'city':'city','state':'state','country':'country'
  };
  var skipTags={'SCRIPT':1,'STYLE':1,'NOSCRIPT':1,'TEXTAREA':1,'CODE':1,'PRE':1};
  var hasUrlFields=false;
  for(var p in paramMap){
    var v=params.get(p);
    if(v){fields[paramMap[p]]=v;hasUrlFields=true;}
  }
  var contactId=params.get('contact_id');
  function esc(s){
    if(!s)return s;
    var d=document.createElement('div');
    d.appendChild(document.createTextNode(s));
    return d.innerHTML;
  }
  function doReplace(data){
    var r={};
    r['{{full_name}}']=esc(((data.firstName||'')+' '+(data.lastName||'')).trim()||((data.fullName||data.name)||''));
    r['{{first_name}}']=esc(data.firstName||(data.name?data.name.split(' ')[0]:'')||'');
    r['{{last_name}}']=esc(data.lastName||(data.name&&data.name.indexOf(' ')>-1?data.name.substring(data.name.indexOf(' ')+1):'')||'');
    r['{{email}}']=esc(data.email||'');
    r['{{phone}}']=esc(data.phone||'');
    r['{{company}}']=esc(data.company||'');
    r['{{city}}']=esc(data.city||'');
    r['{{state}}']=esc(data.state||'');
    r['{{country}}']=esc(data.country||'');
    r['{{date}}']=new Date().toLocaleDateString();
    r['{{time}}']=new Date().toLocaleTimeString();
    r['{{location}}']=[data.city,data.state,data.country].filter(Boolean).join(', ');
    r['{{tracking_id}}']=esc(data.trackingId||'');
    r['{{lastClickedProduct}}']=esc(data.lastClickedProduct||'');
    r['{{lastProductClickDate}}']=esc(data.lastProductClickDate||'');
    r['{{lastClickedProductPrice}}']=esc(data.lastClickedProductPrice||'');
    r['{{lastClickedProductURL}}']=esc(data.lastClickedProductURL||'');
    r['{{productsClickedCount}}']=esc(data.productsClickedCount||'0');
    r['{{ip_address}}']=esc(data.ipAddress||'');
    r['{{ip}}']=esc(data.ipAddress||'');
    if(data.customFields){
      for(var k in data.customFields){
        r['{{'+k+'}}']=esc(String(data.customFields[k]||''));
      }
    }
    params.forEach(function(v,k){
      if(!paramMap[k]&&k!=='contact_id'&&k!=='page_id'&&k.indexOf('utm_')!==0){
        r['{{'+k+'}}']=esc(v);
      }
    });
    var hasValues=false;
    for(var key in r){if(r[key]){hasValues=true;break;}}
    if(!hasValues)return;
    var walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{
      acceptNode:function(n){
        var p=n.parentNode;
        if(p&&skipTags[p.nodeName])return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var node;
    while(node=walker.nextNode()){
      var txt=node.nodeValue;
      if(txt&&txt.indexOf('{{')>-1){
        var changed=txt;
        for(var ph in r){
          if(r[ph]&&changed.indexOf(ph)>-1){
            changed=changed.split(ph).join(r[ph]);
          }
        }
        if(changed!==txt)node.nodeValue=changed;
      }
    }
    var attrs=['value','placeholder','content','alt','title'];
    attrs.forEach(function(attr){
      var els=document.querySelectorAll('['+attr+'*="{{"]');
      for(var i=0;i<els.length;i++){
        var tag=els[i].tagName;
        if(skipTags[tag])continue;
        var val=els[i].getAttribute(attr);
        if(val){
          var nv=val;
          for(var ph in r){
            if(r[ph]&&nv.indexOf(ph)>-1){
              nv=nv.split(ph).join(r[ph]);
            }
          }
          if(nv!==val)els[i].setAttribute(attr,nv);
        }
      }
    });
  }
  function run(){
    if(contactId){
      var xhr=new XMLHttpRequest();
      xhr.open('GET','https://app.macknified.com/api/landing/context/'+encodeURIComponent(contactId)+'?page_id=2748');
      xhr.onload=function(){
        if(xhr.status===200){
          try{
            var resp=JSON.parse(xhr.responseText);
            if(resp.success&&resp.contact){
              var merged=resp.contact;
              for(var k in fields){merged[k]=fields[k];}
              doReplace(merged);
              return;
            }
          }catch(e){}
        }
        if(hasUrlFields)doReplace(fields);
      };
      xhr.onerror=function(){if(hasUrlFields)doReplace(fields);};
      xhr.send();
    }else if(hasUrlFields){
      doReplace(fields);
    }
  }
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',run);}
  else{run();}
})();

(function(){
  var slug='xsGPgFNWr';
  var apiBase='https://app.macknified.com';
  function findEmail(){
    var ids=['email','emailAddress','buyer-email','buyerEmail','user-email','userEmail','checkout-email','customer-email','contact-email'];
    for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&el.value&&el.value.includes('@'))return el.value.trim();}
    var inputs=document.querySelectorAll('input[type="email"],input[name*="email"],input[placeholder*="email"],input[placeholder*="Email"]');
    for(var j=0;j<inputs.length;j++){if(inputs[j].value&&inputs[j].value.includes('@'))return inputs[j].value.trim();}
    return '';
  }
  function findName(){
    var ids=['name','fullName','full-name','buyer-name','buyerName','customer-name','userName','user-name'];
    for(var i=0;i<ids.length;i++){var el=document.getElementById(ids[i]);if(el&&el.value)return el.value.trim();}
    var inputs=document.querySelectorAll('input[name*="name"]:not([name*="email"]):not([type="email"]),input[placeholder*="name"]:not([placeholder*="email"]):not([type="email"]),input[placeholder*="Name"]:not([type="email"])');
    for(var j=0;j<inputs.length;j++){if(inputs[j].value)return inputs[j].value.trim();}
    return '';
  }
  var __realProcessPayment=function(a,b,c,d,e){
    var amountCents,email,productName,productDescription,customerName,quantity;
    if(a&&typeof a==='object'){
      amountCents=a.amountCents;email=a.email;productName=a.productName;
      productDescription=a.productDescription||'';customerName=a.name||'';quantity=a.quantity||1;
    }else{
      amountCents=typeof a==='number'?a:0;productName=typeof b==='string'?b:'';
      productDescription=typeof c==='string'?c:'';email='';customerName='';quantity=1;
    }
    if(!email)email=findEmail();
    if(!customerName)customerName=findName();
    if(!productName){alert('Product name is required.');return Promise.reject('no_product_name');}
    if(!amountCents||amountCents<100){alert('Amount must be at least $1.00');return Promise.reject('invalid_amount');}
    if(!email){alert('Please enter your email address.');return Promise.reject('no_email');}
    var successBase=window.location.href.split('?')[0];
    return fetch(apiBase+'/api/landing-pages/public/'+slug+'/payment/checkout',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:email,name:customerName,amountCents:amountCents,productName:productName,productDescription:productDescription,quantity:quantity,successUrl:successBase+'?payment=success&product='+encodeURIComponent(productName)+'&session_id={CHECKOUT_SESSION_ID}',cancelUrl:successBase+'?payment=cancelled'})
    }).then(function(r){return r.json();}).then(function(d){
      if(d.checkoutUrl){window.location.href=d.checkoutUrl;}
      else{alert(d.error||'Failed to process payment');throw new Error(d.error);}
    });
  };
  Object.defineProperty(window,'__processPayment',{value:__realProcessPayment,writable:false,configurable:false});
  document.addEventListener('DOMContentLoaded',function(){
    var urlParams=new URLSearchParams(window.location.search);
    if(urlParams.get('payment')==='success'){
      var pName=urlParams.get('product')||'your item';
      var overlay=document.createElement('div');overlay.id='payment-success-overlay';
      overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,-apple-system,sans-serif;';
      overlay.innerHTML='<div style="background:white;border-radius:16px;padding:40px;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Payment Successful!</h2><p style="margin:0 0 24px;color:#6b7280;font-size:16px;">Thank you for purchasing '+pName.replace(/</g,'&lt;').replace(/>/g,'&gt;')+'.</p><button onclick="document.getElementById(\'payment-success-overlay\').remove();window.history.replaceState({},\'\',window.location.pathname);" style="padding:12px 32px;font-size:16px;font-weight:600;background:#16a34a;color:white;border:none;border-radius:8px;cursor:pointer;">Continue</button></div>';
      document.body.appendChild(overlay);
    }
  });
})();

(function(){
  var slug='xsGPgFNWr';
  var apiBase='https://app.macknified.com';
  var currency='USD';
  var minAmt=100;var maxAmt=1000000;
  function fmtD(c){return new Intl.NumberFormat('en-US',{style:'currency',currency:currency}).format(c/100);}
  window.__donationConfig={currency:currency,presets:[25,50,100,250],minAmount:100/100,maxAmount:1000000/100,formatAmount:fmtD,buttonColor:'#4f46e5',buttonText:'Donate Now',thankYouMessage:'Thank you for your generous donation!'};
  window.__processDonation=function(amountCents,email,name,donorMessage){
    if(!amountCents||amountCents<minAmt){alert('Minimum donation is '+fmtD(minAmt));return Promise.reject('below_min');}
    if(amountCents>maxAmt){alert('Maximum donation is '+fmtD(maxAmt));return Promise.reject('above_max');}
    if(!email){alert('Please enter your email address.');return Promise.reject('no_email');}
    var successBase=window.location.href.split('?')[0];
    fetch(apiBase+'/api/landing-pages/public/'+slug+'/donate/checkout',{
      method:'POST',headers:{'Content-Type':'application/json'},
      body:JSON.stringify({email:email,name:name||'',amountCents:amountCents,message:donorMessage||'',successUrl:successBase+'?donation=success&email='+encodeURIComponent(email)+'&session_id={CHECKOUT_SESSION_ID}',cancelUrl:successBase+'?donation=cancelled'})
    }).then(function(r){return r.json();}).then(function(d){
      if(d.checkoutUrl){window.location.href=d.checkoutUrl;}
      else{alert(d.error||'Failed to process donation');}
    }).catch(function(){alert('Failed to connect to payment server.');});
  };
  document.addEventListener('DOMContentLoaded',function(){
    var urlParams=new URLSearchParams(window.location.search);
    if(urlParams.get('donation')==='success'){
      var overlay=document.createElement('div');overlay.id='donation-success-overlay';
      overlay.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:999999;font-family:system-ui,-apple-system,sans-serif;';
      overlay.innerHTML='<div style="background:white;border-radius:16px;padding:40px;max-width:420px;width:90%;text-align:center;box-shadow:0 20px 60px rgba(0,0,0,0.15);"><div style="width:64px;height:64px;border-radius:50%;background:#dcfce7;margin:0 auto 20px;display:flex;align-items:center;justify-content:center;"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg></div><h2 style="margin:0 0 12px;font-size:24px;font-weight:700;color:#111827;">Thank You!</h2><p style="margin:0 0 24px;color:#6b7280;font-size:16px;">Thank you for your generous donation!</p><button onclick="document.getElementById(\'donation-success-overlay\').remove();window.history.replaceState({},\'\',window.location.pathname);" style="padding:12px 32px;font-size:16px;font-weight:600;background:#16a34a;color:white;border:none;border-radius:8px;cursor:pointer;">Continue</button></div>';
      document.body.appendChild(overlay);
    }
  });
})();

window.WidgetConfig = {"widgetId":"37114762","launcherType":"tab","primaryColor":"#4890ed","tabPosition":"right","tabLabel":"Chat","customFooterText":"Powered by Macknified AI"};

let currentStep = 1;
        const TOTAL_STEPS = 4;

        let selectedServices = { chatbot: false, webapp: false, automation: false, consulting: false };
        let quoteData = { total: 0, timeline: '—', breakdown: [], services: [] };

        // ── Service Selection ──────────────────────────────────────────────────
        function toggleService(key, el) {
            selectedServices[key] = !selectedServices[key];
            el.classList.toggle('selected', selectedServices[key]);
        }

        // ── Checkbox Toggle ────────────────────────────────────────────────────
        function toggleCb(el, id) {
            el.classList.toggle('checked');
            const cb = document.getElementById(id);
            if (cb) { cb.checked = el.classList.contains('checked'); recalc(); }
        }
        function isChecked(id) { const el = document.getElementById(id); return el && el.checked; }

        // ── Consulting Type Change ─────────────────────────────────────────────
        function handleConsultingChange() {
            const t = document.getElementById('consultingType').value;
            document.getElementById('hoursGroup').style.display = t === 'hourly' ? 'block' : 'none';
            recalc();
        }

        // ── Calculate ──────────────────────────────────────────────────────────
        function recalc() {
            let total = 0, breakdown = [], services = [], timelines = [];

            if (selectedServices.chatbot) {
                services.push('AI Agent');
                const complexity = document.getElementById('chatbotComplexity').value;
                const p = { basic: 500, standard: 800, advanced: 1200, enterprise: 2000 };
                const n = { basic: 'AI Agent — Basic', standard: 'AI Agent — Standard', advanced: 'AI Agent — Advanced', enterprise: 'AI Agent — Enterprise' };
                total += p[complexity]; breakdown.push({ label: n[complexity], value: p[complexity] });
                const kb = document.getElementById('knowledgeBase').value;
                const kbp = { small: 0, medium: 150, large: 300, xlarge: 500 };
                if (kbp[kb]) { total += kbp[kb]; breakdown.push({ label: 'Knowledge Base (' + kb + ')', value: kbp[kb] }); }
                if (isChecked('multiLanguage')) { total += 200; breakdown.push({ label: 'Multi-language Support', value: 200 }); }
                if (isChecked('crmIntegration')) { total += 300; breakdown.push({ label: 'CRM Integration', value: 300 }); }
                if (isChecked('customBranding')) { total += 150; breakdown.push({ label: 'Custom Branding', value: 150 }); }
                if (isChecked('priorityTraining')) { total += 200; breakdown.push({ label: 'Priority Training', value: 200 }); }
                timelines.push(complexity === 'basic' ? 1 : complexity === 'standard' ? 2 : complexity === 'advanced' ? 3 : 5);
            }

            if (selectedServices.webapp) {
                services.push('Web App');
                const wt = document.getElementById('webType').value;
                const wp = { landing: 800, multipage: 1500, interactive: 2500, custom: 4000 };
                const wn = { landing: 'Landing Page', multipage: 'Multi-Page Site', interactive: 'Interactive Web App', custom: 'Custom Platform' };
                total += wp[wt]; breakdown.push({ label: wn[wt], value: wp[wt] });
                const dl = document.getElementById('designLevel').value;
                const dlp = { standard: 0, premium: 400, ultra: 800 };
                if (dlp[dl]) { total += dlp[dl]; breakdown.push({ label: 'Design — ' + dl.charAt(0).toUpperCase() + dl.slice(1), value: dlp[dl] }); }
                if (isChecked('animations')) { total += 300; breakdown.push({ label: 'Advanced Animations', value: 300 }); }
                if (isChecked('formIntegration')) { total += 150; breakdown.push({ label: 'Form Integration', value: 150 }); }
                if (isChecked('seoSetup')) { total += 200; breakdown.push({ label: 'SEO Optimization', value: 200 }); }
                if (isChecked('thirdParty')) { total += 250; breakdown.push({ label: 'Third-party Integrations', value: 250 }); }
                timelines.push(wt === 'landing' ? 1 : wt === 'multipage' ? 2 : wt === 'interactive' ? 3 : 5);
            }

            if (selectedServices.automation) {
                services.push('Automation');
                const scope = document.getElementById('automationScope').value;
                const sp = { single: 1000, multi: 1800, system: 3000 };
                const sn = { single: 'Single Workflow', multi: 'Multiple Workflows', system: 'Full System Integration' };
                total += sp[scope]; breakdown.push({ label: sn[scope], value: sp[scope] });
                const ic = document.getElementById('integrationCount').value;
                const ip = { '1-2': 0, '3-4': 400, '5+': 800 };
                if (ip[ic]) { total += ip[ic]; breakdown.push({ label: 'Integrations (' + ic + ')', value: ip[ic] }); }
                if (isChecked('customApi')) { total += 500; breakdown.push({ label: 'Custom API Development', value: 500 }); }
                if (isChecked('dataMapping')) { total += 350; breakdown.push({ label: 'Complex Data Mapping', value: 350 }); }
                if (isChecked('errorHandling')) { total += 200; breakdown.push({ label: 'Advanced Error Handling', value: 200 }); }
                timelines.push(scope === 'single' ? 1 : scope === 'multi' ? 3 : 5);
            }

            if (selectedServices.consulting) {
                services.push('Consulting');
                const ct = document.getElementById('consultingType').value;
                if (ct === 'hourly') {
                    const hrs = parseInt(document.getElementById('consultingHours').value) || 2;
                    const cv = hrs * 150;
                    total += cv; breakdown.push({ label: hrs + ' hrs @ $150/hr', value: cv });
                    timelines.push(Math.ceil(hrs / 8));
                } else {
                    const cp = { halfday: 500, fullday: 900, strategy: 1350 };
                    const cn = { halfday: 'Half-Day Workshop', fullday: 'Full-Day Workshop', strategy: 'Strategy Package (10hrs)' };
                    total += cp[ct]; breakdown.push({ label: cn[ct], value: cp[ct] });
                    timelines.push(ct === 'strategy' ? 2 : 1);
                }
                if (isChecked('writtenReport')) { total += 200; breakdown.push({ label: 'Written Strategy Report', value: 200 }); }
                if (isChecked('roadmap')) { total += 150; breakdown.push({ label: 'Implementation Roadmap', value: 150 }); }
            }

            let timelineText = '—';
            if (timelines.length > 0) {
                const maxW = Math.max(...timelines);
                const sumW = timelines.reduce((a,b) => a+b, 0);
                const estW = Math.max(maxW, Math.ceil(sumW * 0.7));
                timelineText = estW <= 1 ? '1–2 weeks' : estW <= 3 ? '2–4 weeks' : estW <= 5 ? '4–6 weeks' : '6–8 weeks';
            }

            quoteData = { total, timeline: timelineText, breakdown, services };

            // Update live bar
            document.getElementById('livePrice').textContent = '$' + total.toLocaleString();
            document.getElementById('liveTimeline').textContent = timelineText;
        }

        // ── Step Navigation ────────────────────────────────────────────────────
        function setStep(n) {
            // Update panels
            document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('panel-' + n).classList.add('active');
            currentStep = n;

            // Update stepper nodes
            for (let i = 1; i <= TOTAL_STEPS; i++) {
                const node = document.getElementById('stepNode-' + i);
                node.classList.remove('active', 'done');
                if (i < n) node.classList.add('done');
                else if (i === n) node.classList.add('active');
            }
            // Update lines
            for (let i = 1; i < TOTAL_STEPS; i++) {
                const line = document.getElementById('line-' + i + '-' + (i+1));
                line.classList.remove('done', 'active');
                if (i < n) line.classList.add('done');
                else if (i === n - 1) line.classList.add('active');
            }

            // Footer
            document.getElementById('btnPrev').disabled = n === 1;
            document.getElementById('footerNote').textContent = 'Step ' + n + ' of ' + TOTAL_STEPS;
            const btnNext = document.getElementById('btnNext');
            const btnSubmit = document.getElementById('btnSubmit');
            if (n === TOTAL_STEPS) {
                btnNext.style.display = 'none';
                btnSubmit.style.display = 'flex';
            } else {
                btnNext.style.display = 'flex';
                btnSubmit.style.display = 'none';
            }

            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function nextStep() {
            if (currentStep === 1) {
                const hasService = Object.values(selectedServices).some(v => v);
                if (!hasService) { showToast('Please select at least one service to continue.', 'error'); return; }
                // Show config sections for selected services
                ['chatbot','webapp','automation','consulting'].forEach(s => {
                    document.getElementById('cfg-' + s).style.display = selectedServices[s] ? 'block' : 'none';
                });
                recalc();
            }
            if (currentStep === 2) {
                // Nothing to validate here
            }
            if (currentStep === 3) {
                if (!validateContact()) return;
            }
            if (currentStep === 3) {
                buildSummary();
            }
            if (currentStep < TOTAL_STEPS) setStep(currentStep + 1);
        }

        function prevStep() {
            if (currentStep > 1) setStep(currentStep - 1);
        }

        // ── Validation ─────────────────────────────────────────────────────────
        function validateContact() {
            let ok = true;
            const name = document.getElementById('clientName');
            const email = document.getElementById('clientEmail');
            const desc = document.getElementById('projectDescription');

            const setErr = (el, errId, show) => {
                el.classList.toggle('input-invalid', show);
                document.getElementById(errId).classList.toggle('show', show);
            };

            setErr(name, 'err-name', !name.value.trim());
            if (!name.value.trim()) ok = false;

            const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
            setErr(email, 'err-email', !emailOk);
            if (!emailOk) ok = false;

            setErr(desc, 'err-desc', !desc.value.trim());
            if (!desc.value.trim()) ok = false;

            return ok;
        }

        // Clear errors on input
        ['clientName','clientEmail','projectDescription'].forEach(id => {
            document.addEventListener('DOMContentLoaded', () => {
                const el = document.getElementById(id);
                if (el) el.addEventListener('input', () => { el.classList.remove('input-invalid'); });
            });
        });

        // ── Build Summary ──────────────────────────────────────────────────────
        function buildSummary() {
            document.getElementById('summaryPrice').textContent = '$' + quoteData.total.toLocaleString();
            document.getElementById('summaryTimeline').textContent = quoteData.timeline;

            const name = document.getElementById('clientName').value.trim();
            const email = document.getElementById('clientEmail').value.trim();
            const phone = document.getElementById('clientPhone').value.trim();
            const company = document.getElementById('clientCompany').value.trim();

            let html = `
                <div class="summary-section">
                    <h4>Contact Info</h4>
                    <div class="summary-line"><span class="lbl">Name</span><span class="val">${name}</span></div>
                    <div class="summary-line"><span class="lbl">Email</span><span class="val">${email}</span></div>
                    ${phone ? `<div class="summary-line"><span class="lbl">Phone</span><span class="val">${phone}</span></div>` : ''}
                    ${company ? `<div class="summary-line"><span class="lbl">Company</span><span class="val">${company}</span></div>` : ''}
                </div>
                <div class="summary-section">
                    <h4>Services Selected</h4>
                    ${quoteData.services.map(s => `<div class="summary-line"><span class="lbl">✓</span><span class="val">${s}</span></div>`).join('')}
                </div>
                <div class="summary-section full">
                    <h4>Price Breakdown</h4>
                    ${quoteData.breakdown.map(item => `
                        <div class="breakdown-item">
                            <span class="lbl">${item.label}</span>
                            <span class="val">$${item.value.toLocaleString()}</span>
                        </div>
                    `).join('')}
                </div>
            `;
            document.getElementById('summaryGrid').innerHTML = html;
        }

        // ── Submit ─────────────────────────────────────────────────────────────
        async function submitQuote() {
            const btn = document.getElementById('btnSubmit');
            const txt = document.getElementById('submitBtnText');
            btn.disabled = true;
            txt.innerHTML = '<div class="spinner"></div> Sending...';

            const clientName    = document.getElementById('clientName').value.trim();
            const clientEmail   = document.getElementById('clientEmail').value.trim();
            const clientPhone   = document.getElementById('clientPhone').value.trim() || '';
            const clientCompany = document.getElementById('clientCompany').value.trim() || '';
            const projectDesc   = document.getElementById('projectDescription').value.trim();
            const breakdown     = quoteData.breakdown.map(i => i.label + ': $' + i.value.toLocaleString()).join(' | ');
            const totalFormatted = '$' + quoteData.total.toLocaleString();
            const nameParts     = clientName.split(' ');
            const firstName     = nameParts[0];
            const lastName      = nameParts.slice(1).join(' ') || '';
            const servicesStr   = quoteData.services.join(', ');

            // Build thank you page URL params
            const params = new URLSearchParams({
                first_name:          firstName,
                email:               clientEmail,
                phone:               clientPhone || 'Not provided',
                company:             clientCompany || 'Not provided',
                selected_services:   servicesStr,
                estimated_total:     totalFormatted,
                estimated_timeline:  quoteData.timeline,
                quote_breakdown:     breakdown,
                project_description: projectDesc
            });

            // Submit to Macknified form 419 — triggers automation 389 which fires email flow 1708
            fetch('https://app.macknified.com/api/public/forms/419/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name:        firstName,
                    last_name:         lastName,
                    full_name:         clientName,
                    email:             clientEmail,
                    phone:             clientPhone,
                    company:           clientCompany,
                    selected_services: servicesStr,
                    estimated_total:   totalFormatted,
                    estimated_timeline: quoteData.timeline,
                    price_breakdown:   breakdown,
                    project_description: projectDesc,
                    ref:               'pricing-calculator'
                })
            }).finally(function() {
                window.location.href = 'https://macknifiedai.github.io/project-thank-you-page/?' + params.toString();
            });
        }

                // ── Toast ──────────────────────────────────────────────────────────────
        function showToast(msg, type) {
            const t = document.getElementById('toast');
            const icon = document.getElementById('toastIcon');
            document.getElementById('toastMsg').textContent = msg;
            t.className = 'toast ' + type + ' show';
            icon.innerHTML = type === 'success'
                ? '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'
                : '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>';
            setTimeout(() => t.classList.remove('show'), 4500);
        }

        // Init

        window.addEventListener('scroll', function() {
            var navbar = document.getElementById('navbar');
            if (window.scrollY > 100) { navbar.classList.add('scrolled'); }
            else { navbar.classList.remove('scrolled'); }
        });
        setStep(1);