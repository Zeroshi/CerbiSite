(function () {
    const mounts = document.querySelectorAll('[data-video-card]');
    if (!mounts.length || !window.React || !window.ReactDOM) return;

    const h = React.createElement;

    const videoCatalog = {
        'brief-overview': {
            title: 'Cerbi — Brief Overview',
            description: 'Quick walkthrough of how Cerbi enforces governed, PII-safe logging across your .NET services.',
            youtubeId: 'JAUk8hr6fkY'
        },
        'cerbistream-demo': {
            title: 'CerbiStream — Demo Overview',
            description: 'Deeper look at CerbiStream implementation details, governance hooks, and the async logging pipeline.',
            youtubeId: 'M3ErdPnub4k'
        },
        'cerbisuite-story': {
            title: 'Why I Built CerbiSuite',
            description: 'Where Cerbi fits for leaders and architects: the problem it solves and how it plugs into existing stacks.',
            youtubeId: '4YsEgMs2Xs4'
        }
    };

    const VideoPlaceholder = ({ title, description }) => h('div', { className: 'video-placeholder' },
        h('div', { className: 'video-placeholder-title' }, title),
        description ? h('p', { className: 'video-placeholder-text' }, description) : null,
        h('div', { className: 'video-coming-soon' }, 'Video coming soon')
    );

    const VideoCard = ({ title, description, youtubeId }) => {
        const hasVideo = Boolean(youtubeId);
        const frameContent = hasVideo
            ? h('iframe', {
                src: `https://www.youtube.com/embed/${youtubeId}`,
                title,
                allow: 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
                allowFullScreen: true,
                loading: 'lazy'
            })
            : h(VideoPlaceholder, { title, description });

        return h('div', { className: 'react-video-card' },
            h('div', { className: 'video-frame' }, frameContent),
            description ? h('p', { className: 'video-caption' }, description) : null
        );
    };

    mounts.forEach((mount) => {
        const key = mount.dataset.videoCard;
        const video = videoCatalog[key];
        if (!video) return;

        const root = ReactDOM.createRoot(mount);
        root.render(h(VideoCard, video));
    });
})();
