import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { FiSearch, FiEdit2, FiTrash2, FiUser, FiMail, FiUserCheck } from "react-icons/fi";
import './ListUser.css'; // Create this CSS file

const ListUser = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchField, setSearchField] = useState("firstName");
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(5);
  const navigate = useNavigate();

  // Fetch users based on search criteria
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.post(
          "https://usermanagementbackend-v9en.onrender.com/users/search",
          { [searchField]: searchQuery },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Basic ${localStorage.getItem("base64Credentials")}`
            }
          }
      );
      // Filter out the admin user
      const nonAdminUsers = data.filter(user => user.email !== "");
      setFilteredUsers(nonAdminUsers);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to fetch users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, searchField]);

  // Handle user deletion with confirmation
  const handleDelete = async (userId) => {

    try {
      await axios.delete(
          `https://usermanagementbackend-v9en.onrender.com/users/${userId}`,
          {
            headers: {
              'Authorization': `Basic ${localStorage.getItem("base64Credentials")}`
            }
          }
      );
      toast.success("User deleted successfully");
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete user");
    }
  };

  // Handle user edit navigation
  const handleEdit = (userId) => {
    navigate(`/edituser/${userId}`);
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
      <div className="list-users-container">
        <div className="list-users-header">

          <div className="search-controls">
            <div className="search-field">
              <select
                  className="form-select"
                  value={searchField}
                  onChange={(e) => setSearchField(e.target.value)}
              >
                <option value="firstName">First Name</option>
                <option value="lastName">Last Name</option>
                <option value="email">Email</option>
                <option value="username">Username</option>
              </select>
            </div>

            <div className="search-input">
              <FiSearch className="search-icon" />
              <input
                  type="text"
                  placeholder={`Search by ${searchField}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                  <button
                      className="clear-search"
                      onClick={() => setSearchQuery("")}
                  >
                    Clear
                  </button>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <span>Loading users...</span>
            </div>
        ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                <tr>
                  <th><FiUser /> First Name</th>
                  <th><FiUser /> Last Name</th>
                  <th><FiMail /> Email</th>
                  <th><FiUserCheck /> Username</th>
                  <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {Array.isArray(currentUsers) && currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                        <tr key={user.id}>
                          <td>{user.first_name}</td>
                          <td>{user.last_name}</td>
                          <td>{user.email}</td>
                          <td>{user.username}</td>
                          <td className="actions-cell">
                            <button
                                className="edit-btn"
                                onClick={() => handleEdit(user.id)}
                                title="Edit user"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                                className="delete-btn"
                                onClick={() => handleDelete(user.id)}
                                title="Delete user"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr className="no-users">
                      <td colSpan="5">
                        <div className="no-users-message">
                          No users found
                        </div>
                      </td>
                    </tr>
                )}
                </tbody>
              </table>

              {filteredUsers.length > usersPerPage && (
                  <div className="pagination">
                    <button
                        onClick={() => paginate(currentPage > 1 ? currentPage - 1 : 1)}
                        disabled={currentPage === 1}
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => (
                        <button
                            key={i + 1}
                            onClick={() => paginate(i + 1)}
                            className={currentPage === i + 1 ? 'active' : ''}
                        >
                          {i + 1}
                        </button>
                    ))}

                    <button
                        onClick={() => paginate(currentPage < totalPages ? currentPage + 1 : totalPages)}
                        disabled={currentPage === totalPages}
                    >
                      Next
                    </button>
                  </div>
              )}
            </div>
        )}
      </div>
  );
};

export default ListUser;
