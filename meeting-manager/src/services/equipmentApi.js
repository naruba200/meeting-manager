
import apiClient from "./apiClient";

// Lấy tất cả thiết bị
export const getAllEquipment = async () => {
    const res = await apiClient.get("/equipment");
    return res.data;
};

// Lấy thiết bị theo ID
export const getEquipmentById = async (equipmentId) => {
    const res = await apiClient.get(`/equipment/${equipmentId}`);
    return res.data;
};

// Tìm kiếm thiết bị theo tên
export const searchEquipment = async (name) => {
    const res = await apiClient.get(`/equipment/search?name=${name}`);
    return res.data;
};

// Tìm thiết bị theo trạng thái
export const getEquipmentByStatus = async (status) => {
    const res = await apiClient.get(`/equipment/status/${status}`);
    return res.data;
};

// ✅ Lấy trạng thái thiết bị trong khoảng thời gian
export const getEquipmentAvailability = async (startTime, endTime) => {
    const res = await apiClient.get(`/equipment-bookings/availability`, {
        params: {
            startTime: startTime.format("YYYY-MM-DDTHH:mm"),
            endTime: endTime.format("YYYY-MM-DDTHH:mm")
        },
        headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',  // ✅ Disable cache
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
    return res.data;
};

// Tạo thiết bị mới
export const createEquipment = async (equipmentData) => {
    const res = await apiClient.post("/equipment", equipmentData);
    return res.data;
};

// Cập nhật thiết bị theo ID
export const updateEquipment = async (equipmentId, equipmentData) => {
    const res = await apiClient.put(`/equipment/${equipmentId}`, equipmentData);
    return res.data;
};

// Xóa thiết bị theo ID
export const deleteEquipment = async (equipmentId) => {
    const res = await apiClient.delete(`/equipment/${equipmentId}`);
    return res.data;
};