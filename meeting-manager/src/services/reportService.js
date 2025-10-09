import apiClient from "./apiClient";

const reportService = {
  // Fetch all meetings
  async getAllMeetings() {
    try {
      const response = await apiClient.get("/meetings");
      // Handle both array or wrapped response
      const meetings = Array.isArray(response.data)
        ? response.data
        : response.data.data || response.data.meetings || [];
      return meetings;
    } catch (error) {
      console.error("Error fetching all meetings:", error);
      throw error;
    }
  },

  // Fetch total number of meetings
  async getTotalMeetings() {
    try {
      const meetings = await this.getAllMeetings();
      return meetings.length;
    } catch (error) {
      console.error("Error fetching total meetings:", error);
      throw error;
    }
  },

  // Fetch total meetings for a specific room & date range
  async getPhysicalRoomTotalMeetings(physicalRoomId, startDate, endDate) {
    try {
      const response = await apiClient.get("/reports/physical-room-usage", {
        params: {
          physicalRoomId,
          startDate: startDate.toISOString().split("T")[0],
          endDate: endDate.toISOString().split("T")[0],
        },
      });
      const report = response.data;
      return report.meetings ? report.meetings.length : 0;
    } catch (error) {
      console.error("Error fetching physical room total meetings:", error);
      throw error;
    }
  },

  // Fetch current month's total meetings for a specific room
  async getCurrentMonthPhysicalRoomTotalMeetings(physicalRoomId) {
    try {
      const response = await apiClient.get("/reports/physical-room-usage/current-month", {
        params: { physicalRoomId },
      });
      const report = response.data;
      return report.meetings ? report.meetings.length : 0;
    } catch (error) {
      console.error("Error fetching current month physical room total meetings:", error);
      throw error;
    }
  }, 
};

export default reportService;
