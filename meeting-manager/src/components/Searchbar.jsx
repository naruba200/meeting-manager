import React from "react";
import "../assets/styles/MeetingRoomList.css";

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  onAddRoom,
}) => {
  return (
    <header className="header">
      <div className="header-actions">
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search..."
          className="search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Sort Select */}
        <select
          className="sort-select"
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="roomIdDesc">Sort: ID: High → Low</option>
          <option value="nameAsc">Sort: Name A-Z</option>
          <option value="nameDesc">Sort: Name Z-A</option>
        </select>

        {/* Filter Button */}
        <button className="filter-button">Filter Options</button>

        {/* Add Button */}
        <button className="add-user-button" onClick={onAddRoom}>
          ✚ Add
        </button>
      </div>
    </header>
  );
};

export default SearchBar;
