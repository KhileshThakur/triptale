import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaTimes,
  FaUser,
  FaCheck,
  FaClock,
  FaLock
} from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "";

const UserProfileModal = ({
  user,
  onClose,
  onGallery
}) => {

  const [status, setStatus] = useState("loading");
  const [sending, setSending] = useState(false);


  useEffect(() => {

    const loadStatus = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/api/gallery/users/${user.username}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setStatus(res.data.requestStatus);

      } catch (err) {

        console.error(err);

        setStatus("none");

      }
    };

    loadStatus();

  }, [user]);


  const sendRequest = async () => {

    try {

      setSending(true);

      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/api/gallery/requests/${user.username}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setStatus("pending");

      toast.success("Gallery request sent!");

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Unable to send request"
      );

    } finally {

      setSending(false);

    }
  };


  return (
    <div className="social-modal-overlay">

      <div className="user-profile-modal">

        <button
          className="social-close-btn"
          onClick={onClose}
        >
          <FaTimes />
        </button>


        <div className="large-user-avatar">
          {(user.name || user.username)
            .charAt(0)
            .toUpperCase()}
        </div>


        <h2>
          {user.name || user.username}
        </h2>

        <p className="profile-username">
          @{user.username}
        </p>


        <div className="gallery-access-box">

          {status === "loading" && (
            <p>Checking gallery access...</p>
          )}


          {status === "none" && (
            <>
              <FaLock className="access-icon" />

              <h3>Private Gallery</h3>

              <p>
                Send a request to see
                {user.name
                  ? ` ${user.name}'s`
                  : " this user's"}{" "}
                travel memories.
              </p>

              <button
                className="gallery-primary-btn"
                onClick={sendRequest}
                disabled={sending}
              >
                {sending
                  ? "Sending..."
                  : "Send Gallery Request"}
              </button>
            </>
          )}


          {status === "pending" && (
            <>
              <FaClock className="access-icon pending" />

              <h3>Request Pending</h3>

              <p>
                Waiting for @{user.username}
                to approve your request.
              </p>

              <button
                className="gallery-disabled-btn"
                disabled
              >
                Request Sent
              </button>
            </>
          )}


          {status === "accepted" && (
            <>
              <FaCheck className="access-icon accepted" />

              <h3>Gallery Access Granted</h3>

              <p>
                You can now explore their
                complete travel map.
              </p>

              <button
                className="gallery-primary-btn"
                onClick={() => onGallery(user)}
              >
                See Gallery →
              </button>
            </>
          )}


          {status === "rejected" && (
            <>
              <FaLock className="access-icon" />

              <h3>Request Not Approved</h3>

              <p>
                You can send another request
                later.
              </p>

              <button
                className="gallery-primary-btn"
                onClick={sendRequest}
                disabled={sending}
              >
                Request Again
              </button>
            </>
          )}

        </div>

      </div>

    </div>
  );
};

export default UserProfileModal;