"use client";
import { useState, useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
  ZoomControl,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create a custom icon for better visibility
const customIcon = new L.Icon({
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to handle map clicks and location selection
function LocationMarker({ onLocationSelect, initialPosition }) {
  const [position, setPosition] = useState(initialPosition);
  const map = useMapEvents({
    click(e) {
      const newPosition = e.latlng;
      setPosition(newPosition);
      onLocationSelect(newPosition);
      map.flyTo(newPosition, map.getZoom());
    },
    locationfound(e) {
      const newPosition = e.latlng;
      setPosition(newPosition);
      onLocationSelect(newPosition);
      map.flyTo(newPosition, 16);
    },
  });

  // Center map on user's current location if available
  useEffect(() => {
    if (initialPosition) {
      setPosition(initialPosition);
      map.flyTo(initialPosition, 16);
    }
  }, [initialPosition, map]);

  return position ? (
    <Marker position={position} icon={customIcon}>
      <Popup>
        <div className="text-center">
          <strong>Selected Location</strong>
          <br />
          Lat: {position.lat.toFixed(6)}
          <br />
          Lng: {position.lng.toFixed(6)}
        </div>
      </Popup>
    </Marker>
  ) : null;
}

// Component for map controls
function MapControls({ onLocateMe, onZoomIn, onZoomOut }) {
  return (
    <div className="leaflet-top leaflet-right">
      <div className="leaflet-control leaflet-bar bg-white">
        <button
          className="p-2 hover:bg-gray-100 border-b"
          onClick={onLocateMe}
          title="Locate Me"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </button>
        <button
          className="p-2 hover:bg-gray-100 border-b"
          onClick={onZoomIn}
          title="Zoom In"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>
        <button
          className="p-2 hover:bg-gray-100"
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 12H6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}

const MapModal = ({ selectedLocation, onLocationSelect, onClose }) => {
  const [isClient, setIsClient] = useState(false);
  const mapRef = useRef();
  const [currentZoom, setCurrentZoom] = useState(13);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newPosition = { lat: latitude, lng: longitude };
          onLocationSelect(newPosition);
          if (mapRef.current) {
            mapRef.current.flyTo(newPosition, 16);
          }
        },
        (error) => {
          alert(
            "Unable to get your location. Please make sure location services are enabled."
          );
        }
      );
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom() + 1;
      mapRef.current.setZoom(newZoom);
      setCurrentZoom(newZoom);
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      const newZoom = mapRef.current.getZoom() - 1;
      mapRef.current.setZoom(newZoom);
      setCurrentZoom(newZoom);
    }
  };

  if (!isClient) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-6xl w-full mx-4">
          <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
            Loading map...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-blue-50">
          <div>
            <h3 className="text-xl font-semibold text-gray-800">
              Select Your Location on Map
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Click anywhere on the map or use "Locate Me" to set your precise
              location
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl bg-white rounded-full p-1 shadow"
          >
            ×
          </button>
        </div>

        {/* Map Container */}
        <div className="flex-1 p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-full">
            {/* Instructions Panel */}
            <div className="lg:col-span-1 bg-gray-50 p-4 rounded-lg">
              <h4 className="font-semibold text-gray-800 mb-3">How to use:</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">1.</span>
                  <span>Click anywhere on the map to drop a pin</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">2.</span>
                  <span>Use the +/- buttons to zoom in/out</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">3.</span>
                  <span>Click "Locate Me" to find your current position</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">4.</span>
                  <span>Drag the map to navigate</span>
                </li>
              </ul>

              <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                <h5 className="font-medium text-blue-800 mb-2">
                  Selected Location:
                </h5>
                {selectedLocation ? (
                  <div className="text-sm">
                    <p>
                      <strong>Latitude:</strong>{" "}
                      {selectedLocation.lat.toFixed(6)}
                    </p>
                    <p>
                      <strong>Longitude:</strong>{" "}
                      {selectedLocation.lng.toFixed(6)}
                    </p>
                    <p>
                      <strong>Zoom Level:</strong> {currentZoom}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-blue-600">
                    No location selected yet
                  </p>
                )}
              </div>
            </div>

            {/* Map */}
            <div className="lg:col-span-3 h-96 lg:h-full rounded-lg overflow-hidden border-2 border-blue-300 shadow-lg">
              <MapContainer
                center={selectedLocation || [20.5937, 78.9629]}
                zoom={13}
                style={{ height: "100%", width: "100%" }}
                zoomControl={false}
                ref={mapRef}
                whenCreated={(mapInstance) => {
                  mapRef.current = mapInstance;
                  setCurrentZoom(mapInstance.getZoom());
                }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <ZoomControl position="bottomright" />

                <MapControls
                  onLocateMe={handleLocateMe}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                />

                <LocationMarker
                  onLocationSelect={onLocationSelect}
                  initialPosition={selectedLocation}
                />
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="border-t p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-600">
              {selectedLocation ? (
                <span className="text-green-600 font-medium">
                  ✓ Location selected: Lat {selectedLocation.lat.toFixed(6)},
                  Lng {selectedLocation.lng.toFixed(6)}
                </span>
              ) : (
                <span className="text-orange-600">
                  Please select a location on the map
                </span>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLocateMe}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                Locate Me
              </button>

              <button
                onClick={onClose}
                disabled={!selectedLocation}
                className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition"
              >
                Confirm Selection
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
