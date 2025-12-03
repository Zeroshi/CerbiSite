(function () {
    if (!window.React || !window.ReactDOM) return;
    const { useEffect, useState, useRef } = React;
    const h = React.createElement;

    function EcosystemScrollSpy() {
        const [activeStage, setActiveStage] = useState(1);
        const activeStageRef = useRef(activeStage);

        const stageSections = [
            { id: 'ecosystem-stage-overview', stage: 1 },
            { id: 'ecosystem-stage-1', stage: 1 },
            { id: 'ecosystem-stage-2', stage: 2 },
            { id: 'ecosystem-stage-3', stage: 3 },
            { id: 'ecosystem-stage-4', stage: 4 },
            { id: 'ecosystem-stage-5', stage: 5 }
        ];

        const sectionStageLookup = new Map(stageSections.map(({ id, stage }) => [id, stage]));
        const stageTargetLookup = new Map([
            [1, 'ecosystem-stage-1'],
            [2, 'ecosystem-stage-2'],
            [3, 'ecosystem-stage-3'],
            [4, 'ecosystem-stage-4'],
            [5, 'ecosystem-stage-5']
        ]);

        const moveHighlight = (stageValue) => {
            const highlight = document.querySelector('.pipeline-stage-highlight');
            const wrapper = document.querySelector('.pipeline-stages-wrapper');
            if (!highlight || !wrapper) return;

            const styles = getComputedStyle(wrapper);
            const itemHeight = parseFloat(styles.getPropertyValue('--pipeline-stage-height')) || 88;
            const itemGap = parseFloat(styles.getPropertyValue('--pipeline-stage-gap')) || 14;
            const offset = Math.max(0, stageValue - 1) * (itemHeight + itemGap);

            highlight.style.height = `${itemHeight}px`;
            highlight.style.transform = `translateY(${offset}px)`;
        };

        useEffect(() => {
            const sections = stageSections
                .map(({ id }) => document.getElementById(id))
                .filter(Boolean);

            if (!('IntersectionObserver' in window)) {
                return undefined;
            }

            const observer = new IntersectionObserver(
                (entries) => {
                    const sorted = entries
                        .filter((entry) => entry.isIntersecting || entry.intersectionRatio >= 0.35)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

                    if (sorted.length === 0) return;

                    const topEntry = sorted[0];
                    const nextStage = sectionStageLookup.get(topEntry.target.id);

                    if (nextStage && nextStage !== activeStageRef.current) {
                        setActiveStage(nextStage);
                    }
                },
                {
                    threshold: [0.25, 0.5, 0.75],
                    rootMargin: '-20% 0px -20% 0px'
                }
            );

            sections.forEach((section) => observer.observe(section));

            return () => observer.disconnect();
        }, []);

        useEffect(() => {
            const buttons = Array.from(document.querySelectorAll('.pipeline-stage'));
            let ignoreNextClick = false;

            const handleActivate = (event) => {
                if (event.type === 'click' && ignoreNextClick) {
                    event.preventDefault();
                    ignoreNextClick = false;
                    return;
                }

                const targetButton = event.currentTarget;
                const stageNumber = parseInt(targetButton.dataset.stage || '', 10);
                if (Number.isNaN(stageNumber)) return;

                const targetId = stageTargetLookup.get(stageNumber);
                const target = targetId ? document.getElementById(targetId) : null;

                if (target) {
                    event.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    setActiveStage(stageNumber);
                }
            };

            const handleKeydown = (event) => {
                const isActivationKey = event.key === 'Enter' || event.key === ' ';
                if (!isActivationKey) return;
                ignoreNextClick = true;
                handleActivate(event);
            };

            buttons.forEach((btn) => {
                btn.addEventListener('click', handleActivate);
                btn.addEventListener('keydown', handleKeydown);
            });

            return () =>
                buttons.forEach((btn) => {
                    btn.removeEventListener('click', handleActivate);
                    btn.removeEventListener('keydown', handleKeydown);
                });
        }, []);

        useEffect(() => {
            const buttons = Array.from(document.querySelectorAll('.pipeline-stage'));
            activeStageRef.current = activeStage;
            document.body.dataset.ecosystemActiveStage = activeStage ? String(activeStage) : '';
            moveHighlight(activeStage);

            buttons.forEach((btn) => {
                const stageNumber = parseInt(btn.dataset.stage || '', 10);
                const isActive = stageNumber === activeStage;
                const targetId = stageTargetLookup.get(stageNumber);

                btn.classList.toggle('is-active', isActive);
                if (targetId) {
                    btn.setAttribute('aria-controls', targetId);
                }
                if (isActive) {
                    btn.setAttribute('aria-current', 'step');
                    btn.setAttribute('aria-selected', 'true');
                } else {
                    btn.removeAttribute('aria-current');
                    btn.setAttribute('aria-selected', 'false');
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
