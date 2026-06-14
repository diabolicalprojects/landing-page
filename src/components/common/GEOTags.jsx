import React, { useEffect } from 'react';

const GEOTags = ({ data }) => {
    useEffect(() => {
        if (!data.title) return;
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.id = 'geotag-schema';
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ConsultingService",
            "name": data.title,
            "description": data.description,
            "provider": {
                "@type": "Organization",
                "name": "Diabolical Logic",
                "logo": "https://diabolicalservices.tech/logo.svg"
            },
            "serviceType": "AI Automation, Digital Infrastructure",
            "areaServed": "Worldwide",
            "keywords": data.keywords
        });

        const existingScript = document.getElementById('geotag-schema');
        if (existingScript) existingScript.remove();
        document.head.appendChild(script);

        document.title = data.title;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', data.description);

        return () => {
            if (script.parentNode) script.parentNode.removeChild(script);
        };
    }, [data]);

    return null;
};

export default GEOTags;
