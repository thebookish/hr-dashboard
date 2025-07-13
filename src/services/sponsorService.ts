import axiosInstance from "@/utils/axiosInstance";

export interface SponsorModel {
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
}

export interface SponsorData {
  name: string;
  industry: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  logoUrl?: string;
}

class SponsorService {
  async addSponsor(data: SponsorData): Promise<SponsorModel> {
    try {
      const response = await axiosInstance.post("sponsors/add-sponsor", data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to add sponsor:", error);
      throw new Error(error.response?.data?.message || "Failed to add sponsor");
    }
  }

  async getSponsor(email: string): Promise<SponsorModel> {
    try {
      const response = await axiosInstance.get(
        `/sponsors/?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch sponsor:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch sponsor",
      );
    }
  }

  async updateSponsor(
    email: string,
    data: Partial<SponsorData>,
  ): Promise<SponsorModel> {
    try {
      // Use the same endpoint as addSponsor since backend creates/updates
      const sponsorData = {
        ...data,
        email: email,
      };
      const response = await axiosInstance.post(
        "sponsors/add-sponsor",
        sponsorData,
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to update sponsor:", error);
      throw new Error(
        error.response?.data?.message || "Failed to update sponsor",
      );
    }
  }
}

export default new SponsorService();
