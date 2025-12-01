import React from "react";
import "../assets/styles/Searchbar.css";

const SearchBar = ({
  searchQuery,
  setSearchQuery,
  sortOption,
  setSortOption,
  onAddRoom,
  showSearch = true,   // 👈 default: hiển thị
  showSort = true,
  showAdd = true
}) => {
  return (
    <header className="header">
      <div className="header-actions">
        {/* Search Input */}
        {showSearch && (
          <input
            type="text"
            placeholder="Search..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        )}

        {/* Sort Select */}
        {showSort && (
          <select
            className="sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
          >
            <option value="roomIdDesc">Sort: ID: High → Low</option>
            <option value="nameAsc">Sort: Name A-Z</option>
            <option value="nameDesc">Sort: Name Z-A</option>
          </select>
        )}

        {/* Add Button */}
        {showAdd && (
          <button className="add-user-button" onClick={onAddRoom}>
            ✚ Add
          </button>
        )}
      </div>
    </header>
  );
};

export default SearchBar;
