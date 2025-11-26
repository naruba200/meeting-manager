// src/pages/EquipmentList.jsx
import React, { useState, useEffect, useMemo } from "react";
import CreateEquipmentForm from "./CreateEquipmentForm";
import EditEquipmentForm from "./EditEquipmentForm";
import Modal from "../../components/Modal.jsx";
import {
  getAllEquipment,
  updateEquipment,
  deleteEquipment,
} from "../../services/equipmentService.js";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import "../../assets/styles/UserTable.css";

const EquipmentList = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortType, setSortType] = useState("equipmentName-asc"); // e.g., 'equipmentName-asc', 'equipmentName-desc', 'createdAt-desc', 'createdAt-asc'
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch all equipment
  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    setIsLoading(true);
    try {
      const response = await getAllEquipment();
      if (Array.isArray(response)) {
        setEquipments(response);
      } else {
        setError("Invalid data format received from API.");
      }
    } catch {
      setError("Unable to load equipment list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter, search, and sort client-side
  const visibleEquipments = useMemo(() => {
    let list = equipments.slice();

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (e) =>
          (e.equipmentName || "").toLowerCase().includes(q) ||
          (e.description || "").toLowerCase().includes(q) ||
          String(e.equipmentId).includes(q) ||
          String(e.totalQuantity).includes(q)
      );
    }

    if (statusFilter !== "all") {
      list = list.filter((e) => e.status === statusFilter);
    }

    // Sort based on sortType
    const [sortBy, sortOrder] = sortType.split('-');
    if (sortBy === 'equipmentName') {
      list.sort((a, b) => {
        const nameA = (a.equipmentName || "").toLowerCase();
        const nameB = (b.equipmentName || "").toLowerCase();
        if (sortOrder === "asc") {
          return nameA.localeCompare(nameB);
        } else {
          return nameB.localeCompare(nameA);
        }
      });
    } else if (sortBy === 'createdAt') {
      list.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.updatedAt).getTime();
        const dateB = new Date(b.createdAt || b.updatedAt).getTime();
        if (sortOrder === "asc") {
          return dateA - dateB; // Oldest first
        } else {
          return dateB - dateA; // Newest first
        }
      });
    }

    return list;
  }, [equipments, searchQuery, statusFilter, sortType]);

  // Save update
  const handleSaveEquipment = async (updatedData) => {
    try {
      const payload = {
        equipmentName: updatedData.equipmentName,
        description: updatedData.description,
        totalQuantity: parseInt(updatedData.totalQuantity, 10),
        status: updatedData.status,
      };
      await updateEquipment(editEquipment.equipmentId, payload);
      setEquipments((prev) =>
        prev.map((e) =>
          e.equipmentId === editEquipment.equipmentId ? { ...e, ...payload } : e
        )
      );
      setEditEquipment(null);
      alert("Equipment updated successfully!");
    } catch (err) {
      alert("Failed to update: " + (err.response?.data?.message || err.message));
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    try {
      await deleteEquipment(deleteTarget.equipmentId);
      setEquipments((prev) =>
        prev.filter((e) => e.equipmentId !== deleteTarget.equipmentId)
      );
      setDeleteTarget(null);
      alert("Equipment deleted successfully!");
    } catch (err) {
      alert("Failed to delete: " + (err.response?.data?.message || err.message));
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // Status options
  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "AVAILABLE", label: "Available" },
    { value: "IN_USE", label: "In Use" },
    { value: "DAMAGED", label: "Damaged" },
  ];

  // Sort options
  const sortOptions = [
    { value: "equipmentName-asc", label: "Equipment Name A-Z" },
    { value: "equipmentName-desc", label: "Equipment Name Z-A" },
    { value: "createdAt-desc", label: "Created Date Newest" },
    { value: "createdAt-asc", label: "Created Date Oldest" },
  ];

  if (isLoading) {
    return (
      <div className="user-list-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading equipment list...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {/* Header */}
      <div className="user-list-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">Equipment List</h1>
          </div>
          <div className="filter-bar">
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="filter-select"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <button className="add-user-btn" onClick={() => setIsCreateFormOpen(true)}>
              Add Equipment
            </button>
          </div>
        </div>
      </div>

      {/* TABLE */}
      <section className="content-section">
        {error && <div className="error-message">{error}</div>}
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Total Quantity</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleEquipments.map((equipment) => (
                <tr key={equipment.equipmentId}>
                  <td>{equipment.equipmentId}</td>
                  <td>{equipment.equipmentName}</td>
                  <td>{equipment.description || "-"}</td>
                  <td>{equipment.totalQuantity}</td>
                  <td>
                    <span
                      className={`status-badge ${equipment.status === "AVAILABLE" ? "active" : equipment.status === "DAMAGED" ? "blocked" : "active"}`}
                    >
                      {equipment.status}
                    </span>
                  </td>
                  <td className="last-online">{formatDate(equipment.createdAt)}</td>
                  <td className="last-online">{formatDate(equipment.updatedAt)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => setEditEquipment(equipment)}
                        title="Edit equipment"
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => setDeleteTarget(equipment)}
                        title="Delete equipment"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visibleEquipments.length === 0 && !isLoading && !error && (
                <tr>
                  <td colSpan={8} className="no-data">
                    No equipment found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Create Form */}
      {isCreateFormOpen && (
        <CreateEquipmentForm onClose={() => setIsCreateFormOpen(false)} />
      )}

      {/* Edit Form */}
      {editEquipment && (
        <EditEquipmentForm
          equipmentData={editEquipment}
          onClose={() => setEditEquipment(null)}
          onSave={handleSaveEquipment}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal title="Delete Confirmation" onClose={() => setDeleteTarget(null)}>
          <div className="delete-modal-content">
            <div className="warning-icon">⚠️</div>
            <p>
              Are you sure you want to delete <b>{deleteTarget.equipmentName}</b>?
            </p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteConfirm}>
                Delete
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EquipmentList;