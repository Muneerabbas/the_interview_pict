'use client'; // Mark this component as a client component

import { useEffect, useState } from 'react';

export default function ScrollViewTracker({ id }) {
  const [viewCountSent, setViewCountSent] = useState(false);

  useEffect(() => {
    const incrementView = async () => {
      if (!viewCountSent && id) {
        try {
          const response = await fetch('/api/view', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });

          if (response.ok) {
            setViewCountSent(true);
          }
        } catch (error) {
          console.error("Error sending article view count:", error);
        }
      }
    };

    incrementView();
  }, [id, viewCountSent]);

  return null; // No visible rendering needed
}