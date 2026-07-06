#!/usr/bin/env python3
"""Apply Cerbi.io privacy-site wiring to index.html.

This script is intentionally idempotent. It removes eager GA4/Amplitude loading,
adds a consent-managed analytics loader, fixes contact-form legal links, and
adds footer links to the new trust/privacy paperwork.
"""

from __future__ import annotations

import re
from pathlib import Path

INDEX = Path("index.html")
GA_ID = "G-HQ6M9SCWYH"
AMPLITUDE_KEY = "3dd27a1e247a95da81f5247d5d117069"

CONSENT_MANAGER = r'''
    <script id="cerbi-cookie-consent-manager">
        (function () {
            const CONSENT_KEY = 'cerbi.cookieConsent.v1';
            const GA_ID = 'G-HQ6M9SCWYH';
            const AMPLITUDE_KEY = '3dd27a1e247a95da81f5247d5d117069';

            function readConsent() {
                try { return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null'); }
                catch (_) { return null; }
            }

            function writeConsent(value) {
                const record = Object.assign({ version: 1, updatedAt: new Date().toISOString() }, value);
                localStorage.setItem(CONSENT_KEY, JSON.stringify(record));
                return record;
            }

            function loadGoogleAnalytics() {
                if (window.__cerbiGaLoaded || !GA_ID) return;
                window.__cerbiGaLoaded = true;
                window.dataLayer = window.dataLayer || [];
                window.gtag = window.gtag || function gtag(){ dataLayer.push(arguments); };
                gtag('js', new Date());
                gtag('config', GA_ID, { anonymize_ip: true });
                const script = document.createElement('script');
                script.async = true;
                script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
                document.head.appendChild(script);
            }

            function loadAmplitude() {
                if (window.__cerbiAmplitudeLoaded || !AMPLITUDE_KEY) return;
                window.__cerbiAmplitudeLoaded = true;
                const script = document.createElement('script');
                script.async = true;
                script.crossOrigin = 'anonymous';
                script.src = 'https://cdn.amplitude.com/libs/analytics-browser-2.11.5-min.js.gz';
                script.onload = function () {
                    try { window.amplitude && amplitude.init(AMPLITUDE_KEY); }
                    catch (_) { console.warn('[Cerbi] Amplitude init skipped'); }
                };
                document.head.appendChild(script);
            }

            function applyConsent(consent) {
                if (!consent) return;
                if (consent.analytics) loadGoogleAnalytics();
                if (consent.productAnalytics) loadAmplitude();
            }

            function ensureStyles() {
                if (document.getElementById('cerbi-cookie-consent-styles')) return;
                const style = document.createElement('style');
                style.id = 'cerbi-cookie-consent-styles';
                style.textContent = `
                    .cerbi-cookie-banner{position:fixed;left:16px;right:16px;bottom:16px;z-index:9999;max-width:980px;margin:auto;background:#fff;border:1px solid rgba(20,40,72,.14);box-shadow:0 18px 50px rgba(10,16,30,.2);border-radius:18px;padding:18px;color:#182235;display:grid;gap:14px}
                    .cerbi-cookie-banner h2{margin:0;font-size:18px}.cerbi-cookie-banner p{margin:0;color:#5a6a88;font-size:14px;line-height:1.5}.cerbi-cookie-actions{display:flex;gap:10px;flex-wrap:wrap}.cerbi-cookie-actions button,.cerbi-cookie-settings-panel button{border-radius:999px;border:1px solid rgba(20,40,72,.16);background:#fff;color:#182235;padding:9px 14px;font-weight:700;cursor:pointer}.cerbi-cookie-actions .primary,.cerbi-cookie-settings-panel .primary{background:#ff4d00;color:#fff;border-color:#ff4d00}.cerbi-cookie-actions .muted{background:#f6f8fb}.cerbi-cookie-settings-panel{position:fixed;inset:0;z-index:10000;background:rgba(10,16,30,.5);display:grid;place-items:center;padding:20px}.cerbi-cookie-modal{max-width:620px;background:#fff;border-radius:18px;padding:22px;box-shadow:0 20px 60px rgba(0,0,0,.28);display:grid;gap:16px}.cerbi-cookie-option{display:flex;gap:12px;align-items:flex-start;border:1px solid rgba(20,40,72,.1);border-radius:12px;padding:12px}.cerbi-cookie-option strong{display:block}.cerbi-cookie-option span{display:block;color:#5a6a88;font-size:13px}.cerbi-cookie-footer-links{display:flex;gap:10px;flex-wrap:wrap;align-items:center}`;
                document.head.appendChild(style);
            }

            function banner() {
                ensureStyles();
                document.querySelectorAll('.cerbi-cookie-banner,.cerbi-cookie-settings-panel').forEach(el => el.remove());
                const el = document.createElement('section');
                el.className = 'cerbi-cookie-banner';
                el.setAttribute('aria-label', 'Cookie preferences');
                el.innerHTML = `
                    <div>
                        <h2>Cookie preferences</h2>
                        <p>Cerbi uses strictly necessary storage for site preferences. Analytics tools such as Google Analytics and Amplitude load only if you allow them.</p>
                    </div>
                    <div class="cerbi-cookie-actions">
                        <button type="button" class="primary" data-cookie-accept>Accept all</button>
                        <button type="button" class="muted" data-cookie-reject>Reject all</button>
                        <button type="button" data-cookie-manage>Manage preferences</button>
                        <a class="chip" href="/docs/cookies/">Cookie Policy</a>
                    </div>`;
                document.body.appendChild(el);
                el.querySelector('[data-cookie-accept]').addEventListener('click', () => saveAndClose({ necessary: true, analytics: true, productAnalytics: true }));
                el.querySelector('[data-cookie-reject]').addEventListener('click', () => saveAndClose({ necessary: true, analytics: false, productAnalytics: false }));
                el.querySelector('[data-cookie-manage]').addEventListener('click', settingsPanel);
            }

            function settingsPanel() {
                ensureStyles();
                document.querySelectorAll('.cerbi-cookie-settings-panel').forEach(el => el.remove());
                const current = readConsent() || { analytics: false, productAnalytics: false };
                const panel = document.createElement('section');
                panel.className = 'cerbi-cookie-settings-panel';
                panel.setAttribute('aria-label', 'Cookie settings');
                panel.innerHTML = `
                    <div class="cerbi-cookie-modal" role="dialog" aria-modal="true" aria-labelledby="cookieSettingsTitle">
                        <h2 id="cookieSettingsTitle">Cookie settings</h2>
                        <label class="cerbi-cookie-option"><input type="checkbox" checked disabled><span><strong>Strictly necessary</strong><span>Required for site operation, security, and preference storage.</span></span></label>
                        <label class="cerbi-cookie-option"><input type="checkbox" data-pref="analytics" ${current.analytics ? 'checked' : ''}><span><strong>Website analytics</strong><span>Allows Google Analytics to measure aggregate traffic and page performance.</span></span></label>
                        <label class="cerbi-cookie-option"><input type="checkbox" data-pref="productAnalytics" ${current.productAnalytics ? 'checked' : ''}><span><strong>Product/demo analytics</strong><span>Allows Amplitude to measure product, demo, and behavior events.</span></span></label>
                        <div class="cerbi-cookie-actions">
                            <button type="button" class="primary" data-save>Save preferences</button>
                            <button type="button" data-reject>Reject all</button>
                            <button type="button" data-close>Close</button>
                        </div>
                    </div>`;
                document.body.appendChild(panel);
                panel.querySelector('[data-save]').addEventListener('click', () => {
                    saveAndClose({
                        necessary: true,
                        analytics: panel.querySelector('[data-pref="analytics"]').checked,
                        productAnalytics: panel.querySelector('[data-pref="productAnalytics"]').checked
                    });
                });
                panel.querySelector('[data-reject]').addEventListener('click', () => saveAndClose({ necessary: true, analytics: false, productAnalytics: false }));
                panel.querySelector('[data-close]').addEventListener('click', () => panel.remove());
            }

            function saveAndClose(consent) {
                const saved = writeConsent(consent);
                document.querySelectorAll('.cerbi-cookie-banner,.cerbi-cookie-settings-panel').forEach(el => el.remove());
                applyConsent(saved);
            }

            window.CerbiCookieSettings = settingsPanel;
            document.addEventListener('click', function (event) {
                const trigger = event.target.closest('[data-cookie-settings]');
                if (!trigger) return;
                event.preventDefault();
                settingsPanel();
            });

            if (navigator.globalPrivacyControl) {
                const existing = readConsent();
                if (!existing) writeConsent({ necessary: true, analytics: false, productAnalytics: false, globalPrivacyControl: true });
            }

            const consent = readConsent();
            if (consent) applyConsent(consent);
            else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', banner);
            else banner();
        })();
    </script>
'''

LEGAL_LINKS = '''
                <div class="cerbi-cookie-footer-links" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
                    <a class="chip" href="/docs/privacy/">Privacy</a>
                    <a class="chip" href="/docs/cookies/">Cookies</a>
                    <button type="button" class="chip" data-cookie-settings style="width:fit-content">Cookie Settings</button>
                    <a class="chip" href="/docs/security/">Security</a>
                    <a class="chip" href="/docs/subprocessors/">Subprocessors</a>
                    <a class="chip" href="/docs/dpa/">DPA</a>
                    <a class="chip" href="/docs/trust/">Trust</a>
                    <a class="chip" href="/docs/terms/">Terms</a>
                </div>'''


def remove_eager_analytics(text: str) -> str:
    if 'id="cerbi-cookie-consent-manager"' in text:
        return text
    pattern = re.compile(
        r"\s*<!-- Google tag \(gtag\.js\) -->\s*"
        r"<script async src=\"https://www\.googletagmanager\.com/gtag/js\?id=G-HQ6M9SCWYH\"></script>\s*"
        r"<script>.*?gtag\('config', 'G-HQ6M9SCWYH'\);\s*</script>\s*"
        r"<script type=\"text/javascript\">.*?amplitude\.init\(\"3dd27a1e247a95da81f5247d5d117069\"\);\s*</script>",
        re.DOTALL,
    )
    text, count = pattern.subn("", text, count=1)
    if count != 1:
        raise RuntimeError("Expected to remove exactly one eager GA4/Amplitude block")
    return text


def add_consent_manager(text: str) -> str:
    if 'id="cerbi-cookie-consent-manager"' in text:
        return text
    if "</body>" not in text:
        raise RuntimeError("Missing </body> marker")
    return text.replace("</body>", CONSENT_MANAGER + "\n</body>", 1)


def fix_legal_links(text: str) -> str:
    text = text.replace('href="docs/terms.md"', 'href="/docs/terms/"')
    text = text.replace('href="docs/privacy.md"', 'href="/docs/privacy/"')
    text = text.replace('href="/docs/privacy.md"', 'href="/docs/privacy/"')
    text = text.replace('href="/docs/terms.md"', 'href="/docs/terms/"')
    return text


def add_footer_legal_links(text: str) -> str:
    if 'data-cookie-settings' in text and '/docs/subprocessors/' in text:
        return text
    marker = '                <div style="display:flex;gap:16px">\n                    <a href="https://github.com/Zeroshi"'
    if marker not in text:
        raise RuntimeError("Could not find footer social link marker")
    return text.replace(marker, LEGAL_LINKS + "\n" + marker, 1)


def main() -> None:
    text = INDEX.read_text(encoding="utf-8")
    original = text
    text = remove_eager_analytics(text)
    text = add_consent_manager(text)
    text = fix_legal_links(text)
    text = add_footer_legal_links(text)

    required = [
        'id="cerbi-cookie-consent-manager"',
        '/docs/privacy/',
        '/docs/cookies/',
        '/docs/subprocessors/',
        '/docs/dpa/',
        '/docs/trust/',
        'data-cookie-settings',
    ]
    missing = [item for item in required if item not in text]
    if missing:
        raise RuntimeError(f"Missing expected site wiring: {missing}")
    if "googletagmanager.com/gtag/js?id=G-HQ6M9SCWYH" in text.split('<body', 1)[0]:
        raise RuntimeError("GA4 still loads eagerly in the head")
    if "cdn.amplitude.com/libs/analytics-browser" in text.split('<body', 1)[0]:
        raise RuntimeError("Amplitude still loads eagerly in the head")

    if text != original:
        INDEX.write_text(text, encoding="utf-8")
        print("Updated index.html privacy wiring")
    else:
        print("index.html privacy wiring already applied")


if __name__ == "__main__":
    main()
