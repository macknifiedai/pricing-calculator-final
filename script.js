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
            document.querySelectorAll('.step-panel').forEach(p => p.classList.remove('active'));
            document.getElementById('panel-' + n).classList.add('active');
            currentStep = n;

            for (let i = 1; i <= TOTAL_STEPS; i++) {
                const node = document.getElementById('stepNode-' + i);
                node.classList.remove('active', 'done');
                if (i < n) node.classList.add('done');
                else if (i === n) node.classList.add('active');
            }
            for (let i = 1; i < TOTAL_STEPS; i++) {
                const line = document.getElementById('line-' + i + '-' + (i+1));
                line.classList.remove('done', 'active');
                if (i < n) line.classList.add('done');
                else if (i === n - 1) line.classList.add('active');
            }

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

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        function nextStep() {
            if (currentStep === 1) {
                const hasService = Object.values(selectedServices).some(v => v);
                if (!hasService) { showToast('Please select at least one service to continue.', 'error'); return; }
                ['chatbot','webapp','automation','consulting'].forEach(s => {
                    document.getElementById('cfg-' + s).style.display = selectedServices[s] ? 'block' : 'none';
                });
                recalc();
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

            // Build thank you page URL params — updated to macknified.com subdirectory
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
                // ✅ Correct thank-you page URL
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

        window.addEventListener('scroll', function() {
            var navbar = document.getElementById('navbar');
            if (window.scrollY > 100) { navbar.classList.add('scrolled'); }
            else { navbar.classList.remove('scrolled'); }
        });
        setStep(1);
