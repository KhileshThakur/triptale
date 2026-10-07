import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaCheck,
  FaTimes,
  FaUserClock,
  FaTrash
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "";

const GalleryRequests = () => {

  const [requests, setRequests] = useState([]);
  const [accessUsers, setAccessUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD PENDING REQUESTS
  // ==========================================

  const loadRequests = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/gallery/requests/incoming`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRequests(
        Array.isArray(res.data) ? res.data : []
      );

    } catch (err) {

      console.error(
        "Failed to load requests:",
        err.response?.data || err
      );

      setRequests([]);

    }
  };


  // ==========================================
  // LOAD ACCEPTED USERS
  // ==========================================

  const loadAccessUsers = async () => {
    try {

      const token = localStorage.getItem("token");

      const res = await axios.get(
        `${API_URL}/api/gallery/requests/accepted`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Accepted users:", res.data);

      setAccessUsers(
        Array.isArray(res.data) ? res.data : []
      );

    } catch (err) {

      console.error(
        "Failed to load accepted users:",
        err.response?.data || err
      );

      setAccessUsers([]);

    }
  };


  // ==========================================
  // LOAD EVERYTHING
  // ==========================================

  const loadAll = async () => {

    setLoading(true);

    await Promise.all([
      loadRequests(),
      loadAccessUsers()
    ]);

    setLoading(false);
  };


  useEffect(() => {
    loadAll();
  }, []);


  // ==========================================
  // ACCEPT / REJECT
  // ==========================================

  const updateRequest = async (
    requestId,
    action
  ) => {

    try {

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/api/gallery/requests/${requestId}/${action}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reload from database
      await loadAll();

      toast.success(
        action === "accept"
          ? "Gallery access granted!"
          : "Request rejected"
      );

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message ||
        "Unable to update request"
      );
    }
  };


  // ==========================================
  // REMOVE ACCESS
  // ==========================================

  const removeAccess = async (requestId) => {

    const confirmed = window.confirm(
      "Remove gallery access for this person?"
    );

    if (!confirmed) return;

    try {

      const token = localStorage.getItem("token");

      await axios.patch(
        `${API_URL}/api/gallery/requests/${requestId}/revoke`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      // Reload from database
      await loadAll();

      toast.success("Gallery access removed");

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message ||
        "Unable to remove access"
      );
    }
  };


  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="gallery-requests-loading">
        Loading requests...
      </div>
    );
  }


  return (
    <div className="gallery-requests">

      {/* ==========================================
          PENDING REQUESTS
      ========================================== */}

      <div className="gallery-requests-title">

        <div>
          <h3>Gallery Requests</h3>

          <p>
            People who want to explore your journey.
          </p>
        </div>

        <FaUserClock />

      </div>


      {requests.length === 0 ? (

        <div className="no-gallery-requests">
          No pending requests.
        </div>

      ) : (

        requests.map(request => {

          const requester = request.requester;

          return (
            <div
              className="gallery-request-item"
              key={request._id}
            >

              <div className="request-avatar">
                {(requester?.name ||
                  requester?.username ||
                  "U")
                  .charAt(0)
                  .toUpperCase()}
              </div>


              <div className="request-user-info">

                <strong>
                  {requester?.name ||
                    requester?.username ||
                    "Unknown User"}
                </strong>

                <span>
                  @{requester?.username || "unknown"}
                </span>

              </div>


              <div className="request-actions">

                <button
                  className="request-accept"
                  title="Accept"
                  onClick={() =>
                    updateRequest(
                      request._id,
                      "accept"
                    )
                  }
                >
                  <FaCheck />
                </button>


                <button
                  className="request-reject"
                  title="Reject"
                  onClick={() =>
                    updateRequest(
                      request._id,
                      "reject"
                    )
                  }
                >
                  <FaTimes />
                </button>

              </div>

            </div>
          );

        })

      )}


      {/* ==========================================
          PEOPLE WITH ACCESS
      ========================================== */}

      <div className="gallery-access-section">

        <div className="gallery-requests-title">

          <div>
            <h3>People With Access</h3>

            <p>
              People who can currently view your gallery.
            </p>
          </div>

        </div>


        {accessUsers.length === 0 ? (

          <div className="no-gallery-requests">
            No one has access yet.
          </div>

        ) : (

          accessUsers.map(request => {

            const user = request.requester;

            return (
              <div
                className="gallery-request-item"
                key={request._id}
              >

                <div className="request-avatar">
                  {(user?.name ||
                    user?.username ||
                    "U")
                    .charAt(0)
                    .toUpperCase()}
                </div>


                <div className="request-user-info">

                  <strong>
                    {user?.name ||
                      user?.username ||
                      "Unknown User"}
                  </strong>

                  <span>
                    @{user?.username || "unknown"}
                  </span>

                </div>


                <div className="request-actions">

                  <button
                    className="request-reject"
                    title="Remove Access"
                    onClick={() =>
                      removeAccess(request._id)
                    }
                  >
                    <FaTrash />
                  </button>

                </div>

              </div>
            );

          })

        )}

      </div>

    </div>
  );
};

export default GalleryRequests;