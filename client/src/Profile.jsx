import React, { useState } from "react";
import {
  FaTimes, FaUser, FaLock, FaTrash, FaEnvelope,
  FaShieldAlt, FaAt, FaInbox
} from "react-icons/fa";
import axios from "axios";
import { toast } from "react-hot-toast";
import GalleryRequests from "./GalleryRequests";

const API_URL = import.meta.env.VITE_API_URL || "";

const Profile = ({
  onClose,
  currentUser,
  currentUserDisplayName,
  setCurrentUser,
  setCurrentUserDisplayName,
  onLogout
}) => {
  const [activeTab, setActiveTab] = useState("general");
  const [loading, setLoading] = useState(false);

  const email = localStorage.getItem("user_email") || "No Email";

  const [name, setName] = useState(
    localStorage.getItem("user_display_name") || currentUserDisplayName || ""
  );

  const [username, setUsername] = useState(currentUser || "");

  const [passData, setPassData] = useState({
    oldPassword: "",
    newPassword: ""
  });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem("user_id");

    try {
      const nameRes = await axios.put(
        `${API_URL}/api/users/update-name`,
        { userId, newName: name.trim() }
      );

      const usernameRes = await axios.put(
        `${API_URL}/api/users/update-username`,
        { userId, newUsername: username.trim() }
      );

      const updatedUser = usernameRes.data;

      localStorage.setItem("user_display_name", nameRes.data.name);
      localStorage.setItem("user_name", updatedUser.username);

      setCurrentUser(updatedUser.username);

      if (setCurrentUserDisplayName) {
        setCurrentUserDisplayName(nameRes.data.name);
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(err.response?.data || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!passData.oldPassword || !passData.newPassword) {
      toast.error("Please fill both password fields");
      return;
    }

    setLoading(true);
    const userId = localStorage.getItem("user_id");

    try {
      await axios.post(
        `${API_URL}/api/users/update-password`,
        {
          userId,
          oldPassword: passData.oldPassword,
          newPassword: passData.newPassword
        }
      );

      toast.success("Password changed successfully!");

      setPassData({
        oldPassword: "",
        newPassword: ""
      });
    } catch (err) {
      toast.error(err.response?.data || "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure? This will permanently delete your account, pins and photos."
    );

    if (!confirmed) return;

    setLoading(true);
    const userId = localStorage.getItem("user_id");

    try {
      await axios.delete(
        `${API_URL}/api/users/delete-account/${userId}`
      );

      toast.success("Account deleted. Safe travels!");
      onClose();
      onLogout();
    } catch (err) {
      toast.error("Failed to delete account");
      setLoading(false);
    }
  };

  const firstLetter = (name || currentUser || "U")
    .charAt(0)
    .toUpperCase();

  return (
    <div className="profile-overlay">
      <div className="profile-modal">

        <div className="profile-header">
          <div className="profile-user">
            <div className="profile-avatar">{firstLetter}</div>

            <div className="profile-user-info">
              <h2>{name || "Your Name"}</h2>
              <span>@{username || "username"}</span>
            </div>
          </div>

          <button
            className="profile-close"
            onClick={onClose}
            aria-label="Close profile"
          >
            <FaTimes />
          </button>
        </div>

        {/* 3 TABS */}
        <div className="profile-tabs">
          <button
            className={activeTab === "general" ? "active" : ""}
            onClick={() => setActiveTab("general")}
          >
            <FaUser />
            <span>General</span>
          </button>

          <button
            className={activeTab === "security" ? "active" : ""}
            onClick={() => setActiveTab("security")}
          >
            <FaShieldAlt />
            <span>Security</span>
          </button>

          <button
            className={activeTab === "requests" ? "active" : ""}
            onClick={() => setActiveTab("requests")}
          >
            <FaInbox />
            <span>Requests</span>
          </button>
        </div>

        <div className="profile-content">

          {/* GENERAL */}
          {activeTab === "general" && (
            <div className="profile-section">
              <div className="profile-section-title">
                <h3>Profile Information</h3>
                <p>
                  Update your personal information and how people see you on TripTale.
                </p>
              </div>

              <form onSubmit={handleUpdateProfile} className="profile-form">

                <div className="profile-field">
                  <label>Full Name</label>
                  <div className="profile-input-wrap">
                    <FaUser />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label>Username</label>
                  <div className="profile-input-wrap">
                    <FaAt />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter your username"
                    />
                  </div>
                  <span className="profile-field-hint">
                    This is how people find you on TripTale.
                  </span>
                </div>

                <div className="profile-field">
                  <label>Email Address</label>
                  <div className="profile-input-wrap disabled">
                    <FaEnvelope />
                    <input type="text" value={email} disabled />
                  </div>
                  <span className="profile-field-hint">
                    Email cannot be changed.
                  </span>
                </div>

                <button className="profile-primary-btn" disabled={loading}>
                  {loading ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </div>
          )}

          {/* SECURITY */}
          {activeTab === "security" && (
            <div className="profile-section">
              <div className="profile-section-title">
                <h3>Security</h3>
                <p>Keep your TripTale account secure.</p>
              </div>

              <form onSubmit={handleChangePassword} className="profile-form">

                <div className="profile-field">
                  <label>Current Password</label>
                  <div className="profile-input-wrap">
                    <FaLock />
                    <input
                      type="password"
                      placeholder="Current password"
                      value={passData.oldPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          oldPassword: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <div className="profile-field">
                  <label>New Password</label>
                  <div className="profile-input-wrap">
                    <FaLock />
                    <input
                      type="password"
                      placeholder="New password"
                      value={passData.newPassword}
                      onChange={(e) =>
                        setPassData({
                          ...passData,
                          newPassword: e.target.value
                        })
                      }
                    />
                  </div>
                </div>

                <button className="profile-primary-btn" disabled={loading}>
                  {loading ? "Updating..." : "Update Password"}
                </button>
              </form>

              <div className="profile-danger">
                <div>
                  <h3>Danger Zone</h3>
                  <p>Permanently delete your TripTale account and data.</p>
                </div>

                <button
                  type="button"
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="profile-delete-btn"
                >
                  <FaTrash />
                  Delete Account
                </button>
              </div>
            </div>
          )}

          {/* REQUESTS */}
          {activeTab === "requests" && (
            <div className="profile-section">
              <div className="profile-section-title">
                <h3>Gallery Requests</h3>
                <p>
                  Manage people requesting access to your travel gallery.
                </p>
              </div>

              <div className="profile-requests">
                <GalleryRequests />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default Profile;