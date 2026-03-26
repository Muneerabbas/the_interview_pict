'use client'; // Mark this component as a client component

import { useEffect, useState } from 'react';

export default function ScrollViewTracker({ id }) {
  const [viewCountSent, setViewCountSent] = useState(false);

  useEffect(() => {
    const handleScroll = async () => {
      if (!viewCountSent) {
        try {
          const apiUrl = `/api/view`;

          const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id }),
          });

          if (!response.ok) {
            console.error("Error sending view count to /api/view:", response.status, response.statusText);
            // Optionally handle error, maybe retry or display a message
          } else {
            setViewCountSent(true);
            // Optionally handle success, maybe update UI if needed based on response
            // const data = await response.json(); // If /api/exp returns updated data
            // console.log("View count updated:", data);
          }

        } catch (viewCountError) {
          console.error("Error sending view count to /api/exp:", viewCountError);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { once: true, passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [id, viewCountSent]);

  return null; // No visible rendering needed
}