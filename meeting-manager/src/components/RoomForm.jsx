import React from "react";
import "../assets/styles/RoomForm.css";

const RoomForm = ({ formRoom, setFormRoom, onSave, onCancel, isEditing }) => {
  return (
    <div className="room-modal-overlay" onClick={onCancel}>
      <div className="room-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="room-modal-header">
          <h2>{isEditing ? "Edit Physical Room" : "Create Physical Room"}</h2>
          <button className="room-modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="room-modal-body">
          <div className="room-form-group">
            <label>Capacity</label>
            <input
              type="number"
              value={formRoom.capacity}
              onChange={(e) => setFormRoom({ ...formRoom, capacity: e.target.value })}
            />
          </div>
          <div className="room-form-group">
            <label>Location</label>
            <input
              type="text"
              value={formRoom.location}
              onChange={(e) => setFormRoom({ ...formRoom, location: e.target.value })}
            />
          </div>
          <div className="room-form-group" style={{ gridColumn: "1 / -1" }}>
            <label>Equipment</label>
            <textarea
              value={formRoom.equipment}
              onChange={(e) => setFormRoom({ ...formRoom, equipment: e.target.value })}
            />
          </div>
          <div className="room-form-group">
            <label>Status</label>
            <select
              value={formRoom.status}
              onChange={(e) => setFormRoom({ ...formRoom, status: e.target.value })}
            >
              <option value="AVAILABLE">AVAILABLE</option>
              <option value="UNAVAILABLE">UNAVAILABLE</option>
            </select>
          </div>
        </div>

        <div className="room-modal-footer">
          <button className="room-cancel-button" onClick={onCancel}>Cancel</button>
          <button className="room-save-button" onClick={onSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default RoomForm;
