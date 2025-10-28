import apiClient from "./apiClient";

/**
 * TẠO BUỔI HỌP ĐỊNH KỲ
 * Flow: init → create room → assign physical → update recurrence
 * @param {Object} payload - Dữ liệu từ form
 * @returns {Promise<Object>} Meeting data
 */
export const createRecurringMeeting = async (payload) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const organizerId = user?.userId;

  // === KIỂM TRA NGƯỜI DÙNG ===
  if (!organizerId) {
    const errorMsg = "Không tìm thấy thông tin người dùng. Vui lòng đăng nhập lại.";
    console.error("[RecurringService] Lỗi:", errorMsg);
    throw new Error(errorMsg);
  }

  // BỎ CẢNH BÁO ROLE → AI CŨNG ĐƯỢC TẠO

  try {
    // === BƯỚC 1: KHỞI TẠO BUỔI HỌP CƠ BẢN ===
    const initPayload = {
      title: payload.title?.trim() || "Buổi họp định kỳ",
      description: payload.description?.trim() || "",
      startTime: payload.startTime,
      endTime: payload.endTime,
      organizerId: organizerId,
    };

    console.log("[RecurringService] INIT PAYLOAD:\n", JSON.stringify(initPayload, null, 2));
    const initRes = await apiClient.post("/meetings/init", initPayload);
    const meetingId = initRes.data?.meetingId;

    if (!meetingId) {
      throw new Error("Không nhận được meetingId từ backend.");
    }

    // === BƯỚC 2: TẠO PHÒNG HỌP ===
    const roomPayload = {
      meetingId,
      type: "PHYSICAL",
      roomName: `${payload.title?.trim() || "Buổi họp"} - Recurring`,
    };

    console.log("[RecurringService] ROOM PAYLOAD:\n", JSON.stringify(roomPayload, null, 2));
    const roomRes = await apiClient.post("/meeting-rooms", roomPayload);
    const roomId = roomRes.data?.roomId;

    if (!roomId) {
      throw new Error("Không tạo được phòng họp.");
    }

    // === BƯỚC 3: GÁN PHÒNG VẬT LÝ (nếu có chọn) ===
    if (payload.roomId && payload.roomId !== "0") {
      const assignPayload = {
        roomId: roomId,
        physicalId: parseInt(payload.roomId),
      };

      console.log("[RecurringService] ASSIGN PAYLOAD:\n", JSON.stringify(assignPayload, null, 2));
      await apiClient.post("/meeting-rooms/assign", assignPayload);
    }

    // === BƯỚC 4: CẬP NHẬT THÔNG TIN ĐỊNH KỲ ===
    const updatePayload = {
      title: payload.title?.trim(),
      description: payload.description?.trim() || null,
      recurrenceType: payload.recurrence,
      recurrenceUntil: payload.recurUntil,
      maxOccurrences: payload.maxOccurrences ? parseInt(payload.maxOccurrences) : null,
    };

    console.log("[RecurringService] UPDATE PAYLOAD:\n", JSON.stringify(updatePayload, null, 2));
    const updateRes = await apiClient.put(`/meetings/${meetingId}`, updatePayload);

    console.log("[RecurringService] TẠO RECURRING THÀNH CÔNG:\n", JSON.stringify(updateRes.data, null, 2));
    return updateRes.data;

  } catch (error) {
    // === XỬ LÝ LỖI CHI TIẾT ===
    const status = error.response?.status;
    const backendMsg = error.response?.data?.message || error.response?.data || "";
    const errorMsg = error.message || "Unknown error";

    let finalError = "Lỗi không xác định khi tạo buổi họp định kỳ.";

    const msgStr = String(backendMsg).toLowerCase();

    if (status === 400) {
      if (msgStr.includes("daily meeting limit")) {
        finalError = "Bạn đã đạt giới hạn 2 buổi họp/ngày. Vui lòng hủy buổi cũ trước!";
      } else if (msgStr.includes("organizerid")) {
        finalError = "Thiếu thông tin người tổ chức. Vui lòng đăng nhập lại.";
      } else {
        finalError = backendMsg || "Dữ liệu không hợp lệ.";
      }
    } else if (status === 401) {
      finalError = "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.";
    } else if (status === 404) {
      finalError = "API không tồn tại. Vui lòng kiểm tra backend.";
    } else if (status === 500) {
      finalError = "Lỗi server. Vui lòng thử lại sau.";
    } else if (backendMsg) {
      finalError = backendMsg;
    } else {
      finalError = errorMsg;
    }

    console.error("[RecurringService] CHI TIẾT LỖI:", {
      status,
      backendMsg: backendMsg || "N/A",
      errorMsg,
      payload: JSON.stringify(payload, null, 2),
      finalError,
    });

    throw new Error(finalError);
  }
};

/**
 * LẤY DANH SÁCH PHÒNG HỌP
 * @returns {Promise<Array>} Danh sách phòng
 */
export const fetchRooms = async () => {
  try {
    const res = await apiClient.get("/meeting-rooms");
    const data = res.data;

    console.log("[RecurringService] DANH SÁCH PHÒNG (raw):", data);

    if (Array.isArray(data)) {
      return data;
    } else if (data && Array.isArray(data.content)) {
      return data.content;
    } else {
      console.warn("[RecurringService] Dữ liệu phòng không đúng định dạng:", data);
      return [];
    }
  } catch (error) {
    console.error("[RecurringService] Lỗi tải danh sách phòng:", error);
    throw new Error("Không tải được danh sách phòng họp.");
  }
};