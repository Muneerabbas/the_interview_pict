'use client';

import { useEffect, useState } from 'react';

export default function ProfileViewTracker({ email }) {
    const [viewCountSent, setViewCountSent] = useState(false);

    useEffect(() => {
        const incrementView = async () => {
            if (!viewCountSent && email) {
                try {
                    const response = await fetch('/api/profile/view', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ email }),
                    });

                    if (response.ok) {
                        setViewCountSent(true);
                    }
                } catch (error) {
                    console.error("Error sending profile view count:", error);
                }
            }
        };

        incrementView();
    }, [email, viewCountSent]);

    return null;
}
