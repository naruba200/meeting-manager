// src/pages/EquipmentList.jsx
import React, { useState, useEffect } from "react";
import CreateEquipmentForm from "./CreateEquipmentForm";
import EditEquipmentForm from "./EditEquipmentForm";
import Modal from "../../components/Modal.jsx";
import {
  getAllEquipment,
  searchEquipment,
  getEquipmentByStatus,
  updateEquipment,
  deleteEquipment,
} from "../../services/equipmentService.js";
import "../../assets/styles/EquipmentList.css";

const EquipmentList = () => {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editEquipment, setEditEquipment] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [equipments, setEquipments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
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
    } catch (err) {
      setError("Unable to load equipment list. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Search & Filter
  useEffect(() => {
    const fetchFiltered = async () => {
      setIsLoading(true);
      try {
        let response;
        if (searchQuery) {
          response = await searchEquipment(searchQuery);
        } else if (statusFilter) {
          response = await getEquipmentByStatus(statusFilter);
        } else {
          response = await getAllEquipment();
        }
        if (Array.isArray(response)) {
          setEquipments(response);
        }
      } catch (err) {
        setError("Unable to load filtered data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchFiltered();
  }, [searchQuery, statusFilter]);

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

  return (
    <div className="equipment-container">
      {/* Header: Search + Filter + Add */}
      <header className="header">
        <div className="header-actions">
          <input
            type="text"
            placeholder="Search equipment by name..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            className="sort-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="DAMAGED">Damaged</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <button
            className="add-user-button"
            onClick={() => setIsCreateFormOpen(true)}
          >
            ✚ Add Equipment
          </button>
        </div>
      </header>

      {/* Content */}
      <section className="content">
        <h1 className="page-title">EQUIPMENT LIST</h1>
        {isLoading && (
          <div style={{ textAlign: "center", padding: "20px" }}>Loading...</div>
        )}
        {error && (
          <div style={{ color: "red", textAlign: "center", padding: "10px" }}>
            {error}
          </div>
        )}
        <div className="table-container">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Quantity</th>
                <th>Status</th>
                <th>Created At</th>
                <th>Updated At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {equipments.map((equipment) => (
                <tr key={equipment.equipmentId}>
                  <td style={{ fontWeight: "600", color: "#3498db" }}>
                    {equipment.equipmentId}
                  </td>
                  <td style={{ fontWeight: "500" }}>{equipment.equipmentName}</td>
                  <td style={{ color: "#7f8c8d" }}>{equipment.description}</td>
                  <td>{equipment.totalQuantity}</td>
                  <td>
                    <span
                      style={{
                        background:
                          equipment.status === "AVAILABLE"
                            ? "#f0fff0"
                            : equipment.status === "DAMAGED"
                            ? "#fff0f0"
                            : "#fefcbf",
                        color:
                          equipment.status === "AVAILABLE"
                            ? "#27ae60"
                            : equipment.status === "DAMAGED"
                            ? "#e74c3c"
                            : "#d69e2e",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                      }}
                    >
                      {equipment.status}
                    </span>
                  </td>
                  <td style={{ color: "#95a5a6", fontSize: "13px" }}>
                    {formatDate(equipment.createdAt)}
                  </td>
                  <td style={{ color: "#95a5a6", fontSize: "13px" }}>
                    {formatDate(equipment.updatedAt)}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="edit-button"
                        onClick={() => setEditEquipment(equipment)}
                        title="Edit equipment"
                      >
                        ✎
                      </button>
                      <button
                        className="delete-button"
                        onClick={() => setDeleteTarget(equipment)}
                        title="Delete equipment"
                      >
                        ✗
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {equipments.length === 0 && !isLoading && !error && (
                <tr>
                  <td
                    colSpan={8}
                    style={{
                      textAlign: "center",
                      padding: "24px",
                      color: "#718096",
                    }}
                  >
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
          <p>
            Are you sure you want to delete <b>{deleteTarget.equipmentName}</b>?
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "10px",
              marginTop: "15px",
            }}
          >
            <button onClick={() => setDeleteTarget(null)}>Cancel</button>
            <button
              style={{ background: "#e74c3c", color: "#fff" }}
              onClick={handleDeleteConfirm}
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default EquipmentList;
