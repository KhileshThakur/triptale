import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaTimes, FaUser } from "react-icons/fa";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "";

const UserListModal = ({ onClose, onSelectUser }) => {

  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const loadUsers = async () => {

      try {

        const token = localStorage.getItem("token");

        const res = await axios.get(
          `${API_URL}/api/gallery/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        setUsers(res.data);

      } catch (err) {

        console.error(err);

        toast.error(
          err.response?.data?.message ||
          "Unable to load users"
        );

      } finally {

        setLoading(false);

      }
    };

    loadUsers();

  }, []);


  const filteredUsers = users.filter(user => {

    const text = query.toLowerCase();

    return (
      user.username?.toLowerCase().includes(text) ||
      user.name?.toLowerCase().includes(text)
    );

  });


  return (
    <div className="social-modal-overlay">

      <div className="social-modal">

        <div className="social-modal-header">

          <div>
            <h2>Explore Travelers</h2>
            <p>Find people and explore their journeys.</p>
          </div>

          <button
            className="social-close-btn"
            onClick={onClose}
          >
            <FaTimes />
          </button>

        </div>


        <div className="user-search-box">

          <FaSearch />

          <input
            type="text"
            placeholder="Search username or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />

        </div>


        <div className="user-list">

          {loading && (
            <div className="social-empty">
              Loading travelers...
            </div>
          )}


          {!loading && filteredUsers.length === 0 && (
            <div className="social-empty">
              <FaUser />
              <span>No travelers found.</span>
            </div>
          )}


          {!loading && filteredUsers.map(user => (

            <button
              key={user._id}
              className="user-list-item"
              onClick={() => onSelectUser(user)}
            >

              <div className="user-avatar">
                {(user.name || user.username)
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div className="user-list-info">

                <strong>
                  {user.name || user.username}
                </strong>

                <span>
                  @{user.username}
                </span>

              </div>

              <span className="user-arrow">
                →
              </span>

            </button>

          ))}

        </div>

      </div>

    </div>
  );
};

export default UserListModal;