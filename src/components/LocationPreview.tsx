"use client";

import { useState, useEffect } from "react";

interface Props {
  url: string;
  className?: string;
}

interface LocationData {
  placeName?: string;
  embedUrl?: string;
  isGoogleMaps: boolean;
}

export default function LocationPreview({ url, className = "" }: Props) {
  const [locationData, setLocationData] = useState<LocationData | null>(null);

  useEffect(() => {
    const parseGoogleMapsUrl = (mapUrl: string): LocationData => {
      try {
        const urlObj = new URL(mapUrl);
        
        // Check if it's a Google Maps URL
        const isGoogleMaps = 
          urlObj.hostname.includes('google.com') || 
          urlObj.hostname.includes('goo.gl') ||
          urlObj.hostname.includes('maps.app.goo.gl');

        if (!isGoogleMaps) {
          return { isGoogleMaps: false };
        }

        // Extract place name from URL path or query
        let placeName = "Location";
        
        // Try to get place name from /maps/place/ pattern
        const placeMatch = mapUrl.match(/\/maps\/place\/([^\/]+)/);
        if (placeMatch) {
          placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
        }
        
        // Try to get from query parameter
        const qParam = urlObj.searchParams.get('q');
        if (qParam) {
          placeName = qParam;
        }

        // Create embed URL  
        // Note: For best results with embedded maps, add a Google Maps API key
        // For now, we'll use the standard embed format
        let embedUrl = "";
        
        // Extract coordinates or place ID
        const coordMatch = mapUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
        if (coordMatch) {
          const [, lat, lng] = coordMatch;
          // Use standard Google Maps embed (works without API key for basic functionality)
          embedUrl = `https://maps.google.com/maps?q=${lat},${lng}&output=embed`;
        } else if (placeName !== "Location") {
          // Use place query embed
          embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&output=embed`;
        }

        // Fallback: try to extract from the original URL
        if (!embedUrl) {
          const placeQuery = urlObj.searchParams.get('q');
          if (placeQuery) {
            embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(placeQuery)}&output=embed`;
          }
        }

        return {
          placeName,
          embedUrl: embedUrl || undefined,
          isGoogleMaps: true,
        };
      } catch (e) {
        return { isGoogleMaps: false };
      }
    };

    const data = parseGoogleMapsUrl(url);
    setLocationData(data);
  }, [url]);

  if (!locationData?.isGoogleMaps) {
    // Not a Google Maps URL, show regular link
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`bg-blue-50 text-blue-700 border-2 border-blue-400 font-bold text-sm px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-100 transition-colors ${className}`}
      >
        <span className="material-symbols-outlined text-base">link</span>
        View Link
      </a>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Map Preview - Always Shown */}
      {locationData.embedUrl ? (
        <div className="h-40 border-b-3 border-slate-900 relative overflow-hidden">
          <iframe
            src={locationData.embedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      ) : (
        <div className="h-40 bg-gradient-to-br from-slate-50 to-white border-b-3 border-slate-900 flex items-center justify-center">
          <div className="text-center">
            <span className="material-symbols-outlined text-5xl text-slate-200 block mb-2">
              map
            </span>
            <p className="text-xs font-medium text-slate-400">Map preview unavailable</p>
          </div>
        </div>
      )}
    </div>
  );
}
