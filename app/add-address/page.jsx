"use client";
import { useState, useEffect } from "react";
import { useAppContext } from "../../context/AppContext";
import toast from "react-hot-toast";
import axios from "axios";
import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";
import dynamic from "next/dynamic";

// Dynamically import the map component to avoid SSR issues
const MapModal = dynamic(() => import("./MapModal"), {
  ssr: false,
  loading: () => (
    <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
      Loading map...
    </div>
  ),
});

const AddAddress = () => {
  const { getToken, router } = useAppContext();
  const [address, setAddress] = useState({
    fullName: "",
    phoneNumber: "",
    pincode: "",
    area: "",
    city: "",
    state: "",
    latitude: "",
    longitude: "",
  });
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Function to get user's current location using OpenStreetMap
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          await reverseGeocode(latitude, longitude);
          toast.success("Location detected successfully!");
        } catch (error) {
          setLocationError(
            "Failed to get address from location. Please enter manually or select from map."
          );
          console.error("Geocoding error:", error);
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError(
              "Location access denied. Please enable location permissions or select from map."
            );
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            setLocationError("The request to get location timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  // Reverse geocoding function
  const reverseGeocode = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch location data");
      }

      const data = await response.json();

      if (data && data.address) {
        const addr = data.address;

        setAddress((prev) => ({
          ...prev,
          area:
            addr.neighbourhood ||
            addr.suburb ||
            addr.city_district ||
            addr.road ||
            "",
          city: addr.city || addr.town || addr.village || addr.county || "",
          state: addr.state || "",
          pincode: addr.postcode || "",
          latitude: latitude.toString(),
          longitude: longitude.toString(),
        }));

        setSelectedLocation({ lat: latitude, lng: longitude });
      } else {
        throw new Error("Could not determine address from coordinates.");
      }
    } catch (error) {
      throw error;
    }
  };

  // Open map modal with current location if available
  const openMapModal = () => {
    if (selectedLocation) {
      setShowMapModal(true);
    } else if (address.latitude && address.longitude) {
      setSelectedLocation({
        lat: parseFloat(address.latitude),
        lng: parseFloat(address.longitude),
      });
      setShowMapModal(true);
    } else {
      // Try to get approximate location based on other address fields or use default
      const defaultLocation = { lat: 20.5937, lng: 78.9629 }; // India center
      setSelectedLocation(defaultLocation);
      setShowMapModal(true);
    }
  };

  // Handle location selection from map
  const handleMapLocationSelect = async (latlng) => {
    try {
      setSelectedLocation(latlng);
      await reverseGeocode(latlng.lat, latlng.lng);
      setShowMapModal(false);
      toast.success("Location selected from map!");
    } catch (error) {
      toast.error(
        "Could not get address for selected location. Please enter manually."
      );
    }
  };

  useEffect(() => {
    // Automatically try to get location when component mounts
    getCurrentLocation();
  }, []);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const { data } = await axios.post(
        "/api/user/add-address",
        { address },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success(data.message);
        router.push("/cart");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="md:flex">
            <div className="md:flex-1 p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">
                Add Shipping Address
              </h2>
              <p className="text-gray-600 mb-6">
                Please fill in your details below.
              </p>

              {/* Location Detection Section */}
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <h3 className="text-lg font-semibold text-gray-700">
                    Location Options
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isLocating}
                      className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition disabled:bg-blue-300"
                    >
                      {isLocating ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Detecting...
                        </>
                      ) : (
                        <>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                              clipRule="evenodd"
                            />
                          </svg>
                          Auto-Detect
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={openMapModal}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M12 1.586l-4 4v12.828l4-4V1.586zM3.707 3.293A1 1 0 002 4v10a1 1 0 00.293.707L6 18.414V5.586L3.707 3.293zM17.707 5.293A1 1 0 0118 6v10a1 1 0 01-.293.707L14 14.586V3.586l3.707 1.707z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Choose on Map
                    </button>
                  </div>
                </div>

                {locationError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
                    {locationError}
                  </div>
                )}

                {/* Selected Coordinates Display */}
                {(address.latitude || address.longitude) && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <span>📍 Location coordinates saved:</span>
                      <code className="bg-green-100 px-2 py-1 rounded">
                        Lat: {address.latitude}, Lng: {address.longitude}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              <form onSubmit={onSubmitHandler} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      onChange={(e) =>
                        setAddress({ ...address, fullName: e.target.value })
                      }
                      value={address.fullName}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      placeholder="+1 234 567 8900"
                      onChange={(e) =>
                        setAddress({ ...address, phoneNumber: e.target.value })
                      }
                      value={address.phoneNumber}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pin Code
                    </label>
                    <input
                      type="text"
                      placeholder="123456"
                      onChange={(e) =>
                        setAddress({ ...address, pincode: e.target.value })
                      }
                      value={address.pincode}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      placeholder="New York"
                      onChange={(e) =>
                        setAddress({ ...address, city: e.target.value })
                      }
                      value={address.city}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address (Area and Street)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="123 Main St, Apt 4B"
                    onChange={(e) =>
                      setAddress({ ...address, area: e.target.value })
                    }
                    value={address.area}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    placeholder="California"
                    onChange={(e) =>
                      setAddress({ ...address, state: e.target.value })
                    }
                    value={address.state}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>

                {/* Hidden coordinates fields */}
                <input type="hidden" name="latitude" value={address.latitude} />
                <input
                  type="hidden"
                  name="longitude"
                  value={address.longitude}
                />

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white py-3 rounded-lg font-semibold shadow-lg transition-all mt-6"
                >
                  Save Address
                </button>
              </form>
            </div>

            <div className="md:flex-1 bg-gradient-to-br from-blue-500 to-indigo-700 p-8 text-white flex flex-col justify-center">
              <div className="text-center">
                <div className="inline-block p-4 bg-white/20 rounded-full mb-6">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold mb-4">
                  Multiple Location Options
                </h3>
                <p className="mb-6">
                  Choose how you want to provide your location for accurate
                  delivery.
                </p>
                <ul className="space-y-3 text-left">
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Auto-detect using your device GPS
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Select precisely on interactive map
                  </li>
                  <li className="flex items-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Enter manually for complete control
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Map Modal */}
      {showMapModal && (
        <MapModal
          selectedLocation={selectedLocation}
          onLocationSelect={handleMapLocationSelect}
          onClose={() => setShowMapModal(false)}
        />
      )}

      <Footer />
    </>
  );
};

export default AddAddress;
