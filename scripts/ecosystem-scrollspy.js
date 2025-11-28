(function () {
    if (!window.React || !window.ReactDOM) return;
    const { useEffect, useState } = React;
    const h = React.createElement;

    function EcosystemScrollSpy() {
        const [activeStage, setActiveStage] = useState(1);

        useEffect(() => {
            const sections = [1, 2, 3, 4, 5]
                .map((n) => document.getElementById(`ecosystem-stage-${n}`))
                .filter(Boolean);

            if (!('IntersectionObserver' in window)) {
                return undefined;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const id = entry.target.id;
                        const num = parseInt(id.replace('ecosystem-stage-', ''), 10);
                        if (!Number.isNaN(num)) {
                            setActiveStage(num);
                        }
                    }
                });
            }, { threshold: 0.3 });

            sections.forEach((section) => observer.observe(section));

            return () => observer.disconnect();
        }, []);

        useEffect(() => {
            const buttons = Array.from(document.querySelectorAll('.pipeline-stage'));
            document.body.dataset.ecosystemActiveStage = activeStage ? String(activeStage) : '';

            buttons.forEach((btn) => {
                const stageNumber = parseInt(btn.dataset.stage || '', 10);
                const isActive = stageNumber === activeStage;

                btn.classList.toggle('is-active', isActive);
                if (isActive) {
                    btn.setAttribute('aria-current', 'step');
                    btn.setAttribute('aria-pressed', 'true');
                } else {
                    btn.removeAttribute('aria-current');
                    btn.setAttribute('aria-pressed', 'false');
                }
            });
        }, [activeStage]);

        return null;
    }

    const mount = document.createElement('div');
    mount.id = 'ecosystem-scrollspy-root';
    mount.setAttribute('aria-hidden', 'true');
    document.body.appendChild(mount);
    ReactDOM.createRoot(mount).render(h(EcosystemScrollSpy));
})();
