import React, { useEffect, useState } from "react";

import {
    useNavigate,
    useParams
} from "react-router-dom";

import {
    MapContainer,
    TileLayer,
    Marker,
    Tooltip,
    useMap
} from "react-leaflet";

import axios from "axios";
import L from "leaflet";

import TripDetails from "./TripDetails";

import {
    FaArrowLeft,
    FaLock,
    FaLayerGroup
} from "react-icons/fa";

import { toast } from "react-hot-toast";

import "leaflet/dist/leaflet.css";


const API_URL = import.meta.env.VITE_API_URL || "";


// =====================================================
// SAME MARKER CONFIG AS MAIN MAP
// =====================================================

const iconConfig = {
    iconSize: [20, 32],
    iconAnchor: [10, 32],
    popupAnchor: [0, -32],
    tooltipAnchor: [0, -32],
    shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    shadowSize: [28, 28],
    shadowAnchor: [8, 28]
};


const visitedIcon = new L.Icon({
    ...iconConfig,
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png"
});


const bucketIcon = new L.Icon({
    ...iconConfig,
    iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png"
});


// =====================================================
// FIT MAP TO ALL PLACES
// =====================================================

const FitGalleryBounds = ({ places }) => {

    const map = useMap();

    useEffect(() => {

        if (!places || places.length === 0) {
            return;
        }

        const bounds = places.map(place => [
            place.location.lat,
            place.location.lng
        ]);

        map.fitBounds(bounds, {
            padding: [50, 50],
            maxZoom: 8
        });

    }, [places, map]);

    return null;
};


// =====================================================
// USER GALLERY
// =====================================================

const UserGallery = () => {

    const { username } = useParams();

    const navigate = useNavigate();


    const [user, setUser] = useState(null);

    const [places, setPlaces] = useState([]);

    const [selectedPlace, setSelectedPlace] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [currentLayer, setCurrentLayer] =
        useState("streets");

    const [showLayerMenu, setShowLayerMenu] =
        useState(false);


    // =================================================
    // LOAD GALLERY
    // =================================================

    useEffect(() => {

        loadGallery();

    }, [username]);


    const loadGallery = async () => {

        try {

            const token =
                localStorage.getItem("token");


            const [
                profileRes,
                galleryRes
            ] = await Promise.all([

                axios.get(
                    `${API_URL}/api/gallery/users/${username}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                ),

                axios.get(
                    `${API_URL}/api/gallery/gallery/${username}`,
                    {
                        headers: {
                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                )

            ]);


            setUser(profileRes.data.user);


            const galleryData =
                galleryRes.data;


            setPlaces(
                Array.isArray(galleryData)
                    ? galleryData
                    : galleryData.places || []
            );


        } catch (err) {

            console.error(err);


            if (err.response?.status === 403) {

                toast.error(
                    "You don't have access to this gallery."
                );

                navigate("/");

            } else {

                toast.error(
                    "Unable to load gallery."
                );

            }

        } finally {

            setLoading(false);

        }

    };


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (

            <div className="gallery-page-loading">

                <div className="gallery-loading-spinner" />

                <span>
                    Loading gallery...
                </span>

            </div>

        );

    }


    if (!user) {
        return null;
    }


    // =================================================
    // DEFAULT MAP CENTER
    // =================================================

    const center = places.length
        ? [
            places[0].location.lat,
            places[0].location.lng
        ]
        : [20, 0];


    // =================================================
    // RENDER
    // =================================================

    return (

        <div className="user-gallery-page">


            {/* =========================================
                TOP HEADER
            ========================================= */}

            <header className="gallery-header">

                <button
                    className="gallery-back"
                    onClick={() => navigate("/")}
                >

                    <FaArrowLeft />

                    <span>
                        Back to Map
                    </span>

                </button>


                <div className="gallery-profile">

                    <div className="gallery-avatar">

                        {(user.name || user.username)
                            .charAt(0)
                            .toUpperCase()}

                    </div>


                    <div className="gallery-user-info">

                        <strong>
                            {user.name || user.username}
                        </strong>

                        <span>
                            @{user.username}
                        </span>

                    </div>

                </div>


                <div className="gallery-header-stats">

                    <div>

                        <strong>
                            {places.length}
                        </strong>

                        <span>
                            Places
                        </span>

                    </div>

                </div>

            </header>


            {/* =========================================
                MAP SECTION
            ========================================= */}

            <section className="gallery-map-section">

                <div className="gallery-map-card">


                    <MapContainer

                        center={center}

                        zoom={
                            places.length
                                ? 6
                                : 3
                        }

                        scrollWheelZoom={true}

                        doubleClickZoom={true}

                        zoomControl={true}

                        style={{
                            height: "100%",
                            width: "100%"
                        }}

                    >


                        {/* =================================
                            SAME MAP LAYERS AS MAIN MAP
                        ================================= */}

                        {currentLayer === "streets" ? (

                            <TileLayer

                                url="https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"

                                maxZoom={20}

                                subdomains={[
                                    "mt0",
                                    "mt1",
                                    "mt2",
                                    "mt3"
                                ]}

                                attribution="&copy; Google Maps"

                            />

                        ) : (

                            <TileLayer

                                url="https://{s}.google.com/vt/lyrs=s,h&x={x}&y={y}&z={z}"

                                maxZoom={20}

                                subdomains={[
                                    "mt0",
                                    "mt1",
                                    "mt2",
                                    "mt3"
                                ]}

                                attribution="&copy; Google Maps"

                            />

                        )}


                        {/* Automatically show all places */}

                        <FitGalleryBounds
                            places={places}
                        />


                        {/* =================================
                            MARKERS
                        ================================= */}

                        {places.map(place => (

                            <Marker

                                key={place._id}

                                position={[
                                    place.location.lat,
                                    place.location.lng
                                ]}

                                icon={
                                    place.status === "visited"
                                        ? visitedIcon
                                        : bucketIcon
                                }

                                eventHandlers={{

                                    click: () => {

                                        setSelectedPlace(
                                            place
                                        );

                                    },

                                    mouseover: (e) => {

                                        e.target.openTooltip();

                                    },

                                    mouseout: (e) => {

                                        e.target.closeTooltip();

                                    }

                                }}

                            >

                                <Tooltip

                                    direction="top"

                                    offset={[
                                        0,
                                        -5
                                    ]}

                                    opacity={1}

                                    className="custom-tooltip"

                                >

                                    <div className="tooltip-content">

                                        <div className="tooltip-title">

                                            {place.title}

                                        </div>


                                        <div className="tooltip-date">

                                            {place.status === "visited"
                                                ? (
                                                    place.visitDate
                                                        ? new Date(
                                                            place.visitDate
                                                        ).getFullYear()
                                                        : "Visited"
                                                )
                                                : "Dream"}

                                        </div>

                                    </div>

                                </Tooltip>

                            </Marker>

                        ))}

                    </MapContainer>


                    {/* =================================
                        MAP LAYER BUTTON
                    ================================= */}

                    <div className="gallery-layer-control">

                        <button

                            className={
                                `gallery-layer-btn ${
                                    showLayerMenu
                                        ? "active"
                                        : ""
                                }`
                            }

                            onClick={() =>
                                setShowLayerMenu(
                                    !showLayerMenu
                                )
                            }

                            title="Change map layer"

                        >

                            <FaLayerGroup />

                            <span>
                                Map
                            </span>

                        </button>


                        {showLayerMenu && (

                            <div className="gallery-layer-menu">

                                <button

                                    className={
                                        currentLayer ===
                                        "streets"
                                            ? "selected"
                                            : ""
                                    }

                                    onClick={() => {

                                        setCurrentLayer(
                                            "streets"
                                        );

                                        setShowLayerMenu(
                                            false
                                        );

                                    }}

                                >

                                    <span>
                                        🗺️
                                    </span>

                                    Streets

                                </button>


                                <button

                                    className={
                                        currentLayer ===
                                        "satellite"
                                            ? "selected"
                                            : ""
                                    }

                                    onClick={() => {

                                        setCurrentLayer(
                                            "satellite"
                                        );

                                        setShowLayerMenu(
                                            false
                                        );

                                    }}

                                >

                                    <span>
                                        🛰️
                                    </span>

                                    Satellite

                                </button>

                            </div>

                        )}

                    </div>


                    {/* MAP LABEL */}

                    <div className="gallery-map-label">

                        <span className="visited-dot" />

                        Visited

                        <span className="bucket-dot" />

                        Bucket List

                    </div>

                </div>

            </section>


            {/* =========================================
                MEMORIES
            ========================================= */}

            <section className="gallery-memories">


                <div className="gallery-section-heading">

                    <div>

                        <span className="gallery-eyebrow">
                            TRAVEL JOURNEY
                        </span>

                        <h2>
                            {user.name || user.username}'s
                            Memories
                        </h2>

                        <p>
                            Explore the places they've
                            visited and want to discover.
                        </p>

                    </div>


                    <div className="gallery-memory-count">

                        <strong>
                            {places.length}
                        </strong>

                        <span>
                            Memories
                        </span>

                    </div>

                </div>


                {places.length === 0 ? (

                    <div className="gallery-empty">

                        <FaLock />

                        <h3>
                            No memories yet
                        </h3>

                        <p>
                            This traveler hasn't added
                            any places yet.
                        </p>

                    </div>

                ) : (

                    <div className="gallery-place-grid">

                        {places.map(place => {

                            const image =
                                place.images?.[0]?.url;


                            return (

                                <button

                                    key={place._id}

                                    className="gallery-place-card"

                                    onClick={() =>
                                        setSelectedPlace(
                                            place
                                        )
                                    }

                                >

                                    <div className="gallery-card-image">

                                        {image ? (

                                            <img
                                                src={image}
                                                alt={place.title}
                                            />

                                        ) : (

                                            <div className="gallery-no-image">

                                                <FaLock />

                                            </div>

                                        )}


                                        <span

                                            className={
                                                `gallery-card-status ${
                                                    place.status ===
                                                    "visited"
                                                        ? "visited"
                                                        : "bucket"
                                                }`
                                            }

                                        >

                                            {place.status ===
                                            "visited"
                                                ? "Visited"
                                                : "Bucket List"}

                                        </span>

                                    </div>


                                    <div className="gallery-card-info">

                                        <strong>
                                            {place.title}
                                        </strong>

                                        <span>

                                            {place.location
                                                ?.address ||
                                                "Location"}

                                        </span>

                                    </div>

                                </button>

                            );

                        })}

                    </div>

                )}

            </section>


            {/* =========================================
                TRIP DETAILS
            ========================================= */}

            <TripDetails

                place={selectedPlace}

                onClose={() =>
                    setSelectedPlace(null)
                }

                onUpdateMap={
                    loadGallery
                }

                readOnly={true}

            />

        </div>

    );

};


export default UserGallery;