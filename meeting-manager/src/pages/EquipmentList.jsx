import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CreateEquipmentForm from './CreateEquipmentForm';
import EditEquipmentForm from './EditEquipmentForm';
import Modal from '../components/Modal.jsx';
import { getAllEquipment, searchEquipment, getEquipmentByStatus, updateEquipment, deleteEquipment } from '../services/equipmentService';
import '../assets/styles/EquipmentList.css';

const EquipmentList = () => {
    const [isMainSidebarOpen, setIsMainSidebarOpen] = useState(true);
    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [touchStartX, setTouchStartX] = useState(null);
    const [touchCurrentX, setTouchCurrentX] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [editEquipment, setEditEquipment] = useState(null);
    const [deleteEquipment, setDeleteEquipment] = useState(null);
    const [equipments, setEquipments] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    // Check authentication on mount
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    // Fetch equipments from API
    useEffect(() => {
        const fetchEquipments = async () => {
            setIsLoading(true);
            try {
                const response = await getAllEquipment();
                if (Array.isArray(response)) {
                    setEquipments(response);
                } else {
                    setError('Dữ liệu từ API không đúng định dạng.');
                }
            } catch (error) {
                const errorMessage = error.response?.status === 401
                    ? 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.'
                    : 'Không thể tải danh sách thiết bị. Vui lòng kiểm tra kết nối.';
                setError(errorMessage);
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    navigate('/login');
                }
            } finally {
                setIsLoading(false);
            }
        };
        fetchEquipments();
    }, [navigate]);

    // Handle search and filter
    useEffect(() => {
        const fetchFilteredEquipments = async () => {
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
                } else {
                    setError('Dữ liệu từ API không đúng định dạng.');
                }
            } catch (error) {
                setError('Không thể tải dữ liệu. Vui lòng thử lại.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchFilteredEquipments();
    }, [searchQuery, statusFilter]);

    // Handle edit equipment save
    const handleSaveEquipment = async (updatedEquipmentData) => {
        try {
            const payload = {
                equipmentName: updatedEquipmentData.equipmentName,
                description: updatedEquipmentData.description,
                totalQuantity: parseInt(updatedEquipmentData.totalQuantity, 10),
                status: updatedEquipmentData.status
            };
            await updateEquipment(editEquipment.equipmentId, payload);
            setEquipments((prev) =>
                prev.map((e) =>
                    e.equipmentId === editEquipment.equipmentId ? { ...e, ...payload } : e
                )
            );
            setEditEquipment(null);
            alert('Cập nhật thành công!');
        } catch (err) {
            alert('Cập nhật thất bại: ' + (err.response?.data?.message || err.message));
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    // Handle delete equipment
    const handleDeleteEquipmentConfirm = async () => {
        try {
            await deleteEquipment(deleteEquipment.equipmentId);
            setEquipments((prev) => prev.filter((e) => e.equipmentId !== deleteEquipment.equipmentId));
            setDeleteEquipment(null);
            alert('Xóa thành công!');
        } catch (err) {
            alert('Xóa thất bại: ' + (err.response?.data?.message || err.message));
            if (err.response?.status === 401) {
                localStorage.removeItem('token');
                navigate('/login');
            }
        }
    };

    // Handle logout
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('tokenType');
        localStorage.removeItem('user');
        navigate('/login');
    };

    // Swipe sidebar
    const handleTouchStart = (e) => {
        setTouchStartX(e.touches[0].clientX);
        setTouchCurrentX(e.touches[0].clientX);
    };
    const handleTouchMove = (e) => setTouchCurrentX(e.touches[0].clientX);
    const handleTouchEnd = () => {
        if (touchStartX !== null && touchCurrentX !== null) {
            const deltaX = touchCurrentX - touchStartX;
            const swipeThreshold = 100;
            if (deltaX > swipeThreshold) setIsMainSidebarOpen(true);
            else if (deltaX < -swipeThreshold) setIsMainSidebarOpen(false);
        }
        setTouchStartX(null);
        setTouchCurrentX(null);
    };

    useEffect(() => {
        window.addEventListener('touchstart', handleTouchStart);
        window.addEventListener('touchmove', handleTouchMove);
        window.addEventListener('touchend', handleTouchEnd);
        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
        };
    }, [touchStartX, touchCurrentX]);

    // Close user menu when clicking outside
    useEffect(() => {
        const closeMenu = (e) => {
            if (!e.target.closest('.user-menu-wrapper')) setShowUserMenu(false);
        };
        document.addEventListener('click', closeMenu);
        return () => document.removeEventListener('click', closeMenu);
    }, []);

    // Format date for display
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    // Handle edit and delete
    const handleEditEquipment = (equipmentId) => {
        const equipment = equipments.find(e => e.equipmentId === equipmentId);
        setEditEquipment(equipment);
    };
    const handleDeleteEquipment = (equipmentId) => {
        const equipment = equipments.find(e => e.equipmentId === equipmentId);
        setDeleteEquipment(equipment);
    };

    return (
        <div className="app-container">
            <nav className="top-navbar">
                <span className="nav-icon">✉︎</span>
                <div className="user-menu-wrapper">
                    <span className="nav-icon" onClick={() => setShowUserMenu((prev) => !prev)}>🜲</span>
                    {showUserMenu && (
                        <div className="user-menu">
                            <div className="user-menu-item">Thông tin tài khoản</div>
                            <div className="user-menu-item" onClick={logout}>Đăng xuất</div>
                        </div>
                    )}
                </div>
            </nav>

            <aside className={`main-sidebar ${isMainSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <span>Views</span>
                    <span className="menu-toggle" onClick={() => setIsMainSidebarOpen(!isMainSidebarOpen)}>≡</span>
                </div>
                <nav className="sidebar-nav">
                    <div className="nav-item"><span className="nav-icon">🏠︎</span> Home</div>
                    <div className="nav-item"><span className="nav-icon">☺</span> User Management</div>
                    <div className="nav-item active"><span className="nav-icon">🖥</span> Equipment Management</div>
                    <div className="nav-item"><span className="nav-icon">⏻</span> Settings</div>
                </nav>
            </aside>

            {isCreateFormOpen && <CreateEquipmentForm onClose={() => setIsCreateFormOpen(false)} />}

            <main className={`main-content ${!isMainSidebarOpen ? 'full' : ''}`}>
                <header className="header">
                    <div className="header-actions">
                        <input
                            type="text"
                            placeholder="Search equipment (name)..."
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
                        <button className="filter-button">Filter Options</button>
                        <button className="add-user-button" onClick={() => setIsCreateFormOpen(true)}>
                            ✚ Add Equipment
                        </button>
                    </div>
                </header>

                <section className="content">
                    <h1 className="page-title">EQUIPMENT LIST</h1>
                    {isLoading && <div style={{ textAlign: 'center', padding: '20px' }}>Loading...</div>}
                    {error && <div style={{ color: 'red', textAlign: 'center', padding: '10px' }}>{error}</div>}
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
                                    <td style={{ fontWeight: '600', color: '#3498db' }}>{equipment.equipmentId}</td>
                                    <td style={{ fontWeight: '500' }}>{equipment.equipmentName}</td>
                                    <td style={{ color: '#7f8c8d' }}>{equipment.description}</td>
                                    <td>{equipment.totalQuantity}</td>
                                    <td>
                      <span style={{
                          background: equipment.status === 'AVAILABLE' ? '#f0fff0' : equipment.status === 'DAMAGED' ? '#fff0f0' : '#fefcbf',
                          color: equipment.status === 'AVAILABLE' ? '#27ae60' : equipment.status === 'DAMAGED' ? '#e74c3c' : '#d69e2e',
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '600'
                      }}>
                        {equipment.status}
                      </span>
                                    </td>
                                    <td style={{ color: '#95a5a6', fontSize: '13px' }}>
                                        {formatDate(equipment.createdAt)}
                                    </td>
                                    <td style={{ color: '#95a5a6', fontSize: '13px' }}>
                                        {formatDate(equipment.updatedAt)}
                                    </td>
                                    <td>
                                        <div className="action-buttons">
                                            <button
                                                className="edit-button"
                                                onClick={() => handleEditEquipment(equipment.equipmentId)}
                                                title="Edit equipment"
                                            >
                                                ✎
                                            </button>
                                            <button
                                                className="delete-button"
                                                onClick={() => handleDeleteEquipment(equipment.equipmentId)}
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
                                    <td colSpan={8} style={{ textAlign: 'center', padding: '24px', color: '#718096' }}>
                                        No equipment found.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </section>
            </main>

            {editEquipment && (
                <EditEquipmentForm
                    equipmentData={editEquipment}
                    onClose={() => setEditEquipment(null)}
                    onSave={handleSaveEquipment}
                />
            )}

            {deleteEquipment && (
                <Modal title="Xác nhận xóa" onClose={() => setDeleteEquipment(null)}>
                    <p>Bạn chắc chắn muốn xóa <b>{deleteEquipment.equipmentName}</b>?</p>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
                        <button onClick={() => setDeleteEquipment(null)}>Hủy</button>
                        <button
                            style={{ background: '#e74c3c', color: '#fff' }}
                            onClick={handleDeleteEquipmentConfirm}
                        >
                            Xóa
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default EquipmentList;