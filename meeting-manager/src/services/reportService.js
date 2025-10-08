import axios from "axios";

// Base URL for API (can be configured via environment variables)
const API_BASE_URL = "/api";

// Service to handle report-related API calls
const reportService = {
  // Fetch total number of meetings from the /api/meetings endpoint
  async getTotalMeetings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings`);
      const meetings = response.data;
      return meetings.length; // Return the total count of meetings
    } catch (error) {
      console.error("Error fetching total meetings:", error);
      throw error;
    }
  },

  // Fetch total number of meetings for a specific physical room and date range
  async getPhysicalRoomTotalMeetings(physicalRoomId, startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/physical-room-usage`, {
        params: {
          physicalRoomId,
          startDate: startDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
          endDate: endDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
        },
      });
      const report = response.data;
      // Assume PhysicalRoomUsageReportDTO has a 'meetings' array
      return report.meetings ? report.meetings.length : 0;
    } catch (error) {
      console.error("Error fetching physical room total meetings:", error);
      throw error;
    }
  },

  // Fetch total number of meetings for a specific physical room for the current month
  async getCurrentMonthPhysicalRoomTotalMeetings(physicalRoomId) {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/physical-room-usage/current-month`, {
        params: { physicalRoomId },
      });
      const report = response.data;
      // Assume PhysicalRoomUsageReportDTO has a 'meetings' array
      return report.meetings ? report.meetings.length : 0;
    } catch (error) {
      console.error("Error fetching current month physical room total meetings:", error);
      throw error;
    }
  },

  // Fetch total number of cancelled meetings for a date-time range
  async getCancelledMeetingsTotal(startDate, endDate) {
    try {
      const response = await axios.get(`${API_BASE_URL}/reports/cancelled-meetings`, {
        params: {
          startDate: startDate.toISOString(), // Format as YYYY-MM-DDTHH:mm:ss
          endDate: endDate.toISOString(), // Format as YYYY-MM-DDTHH:mm:ss
        },
      });
      const stats = response.data;
      // Assume CancelledMeetingStatsDTO has a 'totalCancelled' field or 'meetings' array
      return stats.totalCancelled !== undefined ? stats.totalCancelled : (stats.meetings ? stats.meetings.length : 0);
    } catch (error) {
      console.error("Error fetching cancelled meetings total:", error);
      throw error;
    }
  },

  // Fetch all meetings for the table
  async getAllMeetings() {
    try {
      const response = await axios.get(`${API_BASE_URL}/meetings`);
      return response.data; // Return the array of meetings
    } catch (error) {
      console.error("Error fetching all meetings:", error);
      throw error;
    }
  },
};

export default reportService;