(function () {
    const watermarkMount = document.getElementById('nugetWatermarkMount');

    if (!watermarkMount || !window.React || !window.ReactDOM) return;

    const { useEffect, useState } = React;
    const h = React.createElement;

    const FALLBACK_TOTAL = 33539;
    const CERBI_PACKAGE_IDS = [
        'CerbiStream',
        'Cerbi.MEL.Governance',
        'Cerbi.Governance.Runtime',
        'CerbiStream.GovernanceAnalyzer',
        'Cerbi.Governance.Core',
        'Cerbi.Serilog.GovernanceAnalyzer',
        'Cerbi.Serilog.Governance'
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

    function NugetDownloadWatermark() {
        const [total, setTotal] = useState(null);

        useEffect(() => {
            let cancelled = false;

            (async () => {
                try {
                    const value = await fetchDownloadTotal();
                    if (!cancelled) setTotal(value);
                } catch (err) {
                    console.error('Failed to load NuGet totals', err);
                    if (!cancelled) setTotal(FALLBACK_TOTAL);
                }
            })();

            return () => { cancelled = true; };
        }, []);

        const value = total ?? FALLBACK_TOTAL;
        const formatted = formatTotal(value).toUpperCase();

        return h(
            'div',
            {
                className: 'nuget-watermark',
                'aria-hidden': 'true'
            },
            `${formatted} NUGET DOWNLOADS`
        );
    }

    ReactDOM.createRoot(watermarkMount).render(h(NugetDownloadWatermark));
})();
