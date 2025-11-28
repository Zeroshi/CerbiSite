(function () {
    const root = document.getElementById('heroMetrics');
    if (!root || !window.React || !window.ReactDOM) return;

    const { useEffect, useRef, useState } = React;
    const h = React.createElement;

    const metrics = [
        {
            id: 'log-cost',
            value: 40,
            suffix: '%',
            label: 'Log spend eliminated',
            note: 'In the first 90 days of rollout.',
            tooltip: 'Based on teams reducing redundant log sinks and lowering ingestion volume with Cerbi rules.',
            start: 0,
        },
        {
            id: 'compliance',
            value: 95,
            suffix: '%',
            label: 'Compliance pass rate',
            note: 'On first audit with Cerbi controls.',
            tooltip: 'Driven by automated control mapping, evidence capture, and scoped audit views.',
            start: 0,
        },
        {
            id: 'incidents',
            value: 3,
            suffix: 'x',
            label: 'Faster incident response',
            note: 'After instrumenting runbooks end-to-end.',
            tooltip: 'Teams speed up containment by codifying incident runbooks and guardrails directly into logging flows.',
            start: 1,
        }
    ];

    function useInView(ref, threshold = 0.35) {
        const [inView, setInView] = useState(false);

        useEffect(() => {
            const node = ref.current;
            if (!node || inView) return;

            if (!('IntersectionObserver' in window)) {
                setInView(true);
                return;
            }

            const observer = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        observer.disconnect();
                    }
                });
            }, { threshold });

            observer.observe(node);
            return () => observer.disconnect();
        }, [inView, ref, threshold]);

        return inView;
    }

    function useCountUp({ target, start = 0, duration = 900, shouldStart }) {
        const [value, setValue] = useState(target);
        const hasAnimated = useRef(false);

        useEffect(() => {
            if (!shouldStart || hasAnimated.current) return;
            const prefersReducedMotion = typeof window !== 'undefined'
                && window.matchMedia
                && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

            if (prefersReducedMotion) {
                setValue(target);
                hasAnimated.current = true;
                return;
            }

            hasAnimated.current = true;

            let raf;
            const startTime = performance.now();

            const easeOut = (t) => 1 - Math.pow(1 - t, 3);
            setValue(start);

            const step = (now) => {
                const progress = Math.min((now - startTime) / duration, 1);
                const next = start + (target - start) * easeOut(progress);
                setValue(next);
                if (progress < 1) raf = requestAnimationFrame(step);
            };

            raf = requestAnimationFrame(step);
            return () => cancelAnimationFrame(raf);
        }, [duration, shouldStart, start, target]);

        return value;
    }

    function formatValue(value, suffix) {
        const rounded = suffix === 'x' ? value.toFixed(1).replace(/\.0$/, '') : Math.round(value).toString();
        return `${rounded}${suffix || ''}`;
    }

    function Tooltip({ id, content, onClose }) {
        const [open, setOpen] = useState(false);
        const bubbleId = `${id}-tooltip`;

        const show = () => setOpen(true);
        const hide = () => { setOpen(false); onClose?.(); };

        return h('span', { className: 'tooltip-wrapper' },
            h('button', {
                type: 'button',
                className: 'info-trigger',
                'aria-label': 'More info',
                'aria-describedby': open ? bubbleId : undefined,
                onMouseEnter: show,
                onMouseLeave: hide,
                onFocus: show,
                onBlur: hide,
                onKeyDown: (e) => { if (e.key === 'Escape') hide(); }
            }, 'ⓘ'),
            open && h('span', {
                role: 'tooltip',
                id: bubbleId,
                className: 'tooltip-bubble'
            }, content)
        );
    }

    function MetricCard({ metric }) {
        const cardRef = useRef(null);
        const inView = useInView(cardRef);
        const animatedValue = useCountUp({
            target: metric.value,
            start: metric.start ?? 0,
            duration: 900,
            shouldStart: inView,
        });

        const displayValue = inView ? animatedValue : metric.value;

        return h('article', { className: 'metric-card', ref: cardRef, tabIndex: 0 },
            h('div', { className: 'metric-number', 'aria-live': 'polite', 'data-final': formatValue(metric.value, metric.suffix) }, formatValue(displayValue, metric.suffix)),
            h('div', { className: 'metric-label' },
                metric.label,
                metric.tooltip ? h(Tooltip, { id: metric.id, content: metric.tooltip }) : null
            ),
            h('p', { className: 'metric-note' }, metric.note)
        );
    }

    const Metrics = () => h('div', { className: 'metrics-grid' }, metrics.map((metric) =>
        h(MetricCard, { key: metric.id, metric })
    ));

    const rootNode = ReactDOM.createRoot(root);
    rootNode.render(h(Metrics));
})();
