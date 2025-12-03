(function () {
    const desktopMount = document.getElementById('nugetStatDesktop');
    const mobileMount = document.getElementById('nugetStatMobile');

    if ((!desktopMount && !mobileMount) || !window.React || !window.ReactDOM) return;

    const { useEffect, useState } = React;
    const h = React.createElement;

    const FALLBACK_TOTAL = 10000;
    const CERBI_PACKAGE_IDS = [
        'CerbiStream',
        'Cerbi.MEL.Governance',
        'CerbiStream.GovernanceAnalyzer',
        'Cerbi.Governance.Core',
        'Cerbi.Governance.Runtime',
        'Cerbi.Serilog.GovernanceAnalyzer'
    ];

    let cachedTotal = null;
    let pendingPromise = null;

    async function getSearchBaseUrl() {
        const response = await fetch('https://api.nuget.org/v3/index.json');
        if (!response.ok) throw new Error('Failed to load NuGet service index');
        const json = await response.json();
        const resource = (json?.resources || []).find((res) => typeof res['@type'] === 'string' && res['@type'].startsWith('SearchQueryService'));
        const url = resource?.['@id'];
        if (!url) throw new Error('Search service not found');
        return url;
    }

    async function fetchDownloadTotal() {
        if (cachedTotal !== null) return cachedTotal;
        if (pendingPromise) return pendingPromise;

        pendingPromise = (async () => {
            const searchBaseUrl = await getSearchBaseUrl();

            const totals = await Promise.all(CERBI_PACKAGE_IDS.map(async (id) => {
                const res = await fetch(`${searchBaseUrl}?q=packageid:${encodeURIComponent(id)}&prerelease=true&take=1`);
                if (!res.ok) throw new Error(`Failed search for ${id}`);
                const json = await res.json();
                const pkg = json?.data?.[0];
                return typeof pkg?.totalDownloads === 'number' ? pkg.totalDownloads : 0;
            }));

            return totals.reduce((sum, val) => sum + val, 0);
        })();

        try {
            cachedTotal = await pendingPromise;
            return cachedTotal;
        } catch (err) {
            cachedTotal = FALLBACK_TOTAL;
            throw err;
        } finally {
            pendingPromise = null;
        }
    }

    function formatTotal(total) {
        if (total >= 10000) return `${(total / 1000).toFixed(1)}k+`;
        return total.toLocaleString();
    }

    function NugetDownloadStat({ variant }) {
        const [total, setTotal] = useState(null);

        useEffect(() => {
            let active = true;
            fetchDownloadTotal()
                .then((value) => { if (active) setTotal(value); })
                .catch(() => { if (active) setTotal(FALLBACK_TOTAL); });

            return () => { active = false; };
        }, []);

        const displayValue = total ?? FALLBACK_TOTAL;
        const formatted = formatTotal(displayValue);
        const isLoading = total === null;

        const baseProps = {
            className: `nuget-stat-card ${variant === 'desktop' ? 'nuget-stat-desktop' : 'nuget-stat-mobile'}${isLoading ? ' is-loading' : ''}`,
            'aria-label': 'Combined NuGet downloads across Cerbi packages'
        };

        return h('div', baseProps,
            h('div', { className: 'nuget-stat-number', 'aria-live': 'polite' }, formatted),
            h('div', { className: 'nuget-stat-label' }, 'NuGet downloads')
        );
    }

    if (desktopMount) {
        ReactDOM.createRoot(desktopMount).render(h(NugetDownloadStat, { variant: 'desktop' }));
    }

    if (mobileMount) {
        ReactDOM.createRoot(mobileMount).render(h(NugetDownloadStat, { variant: 'mobile' }));
    }
})();
