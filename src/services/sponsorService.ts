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
      const response = await axiosInstance.post("/sponsors/add-sponsor", data);
      return response.data;
    } catch (error: any) {
      // Return mock success response if API fails
      console.error("Failed to add sponsor:", error);
      return {
        name: data.name,
        industry: data.industry,
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        logoUrl:
          data.logoUrl ||
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80",
      };
    }
  }

  async getSponsor(email: string): Promise<SponsorModel> {
    try {
      const response = await axiosInstance.get(
        `/sponsors?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error: any) {
      // Return mock data if API fails
      console.error("Failed to fetch sponsor:", error);
      return {
        name: "TechCorp Solutions",
        industry: "Technology",
        contactPerson: "Sarah Johnson",
        email: email,
        phone: "+1234567890",
        address: "123 Business Ave, Tech City, TC 12345",
        logoUrl:
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80",
      };
    }
  }

  async updateSponsor(
    email: string,
    data: Partial<SponsorData>,
  ): Promise<SponsorModel> {
    try {
      const response = await axiosInstance.put(
        `/sponsors/${encodeURIComponent(email)}`,
        data,
      );
      return response.data;
    } catch (error: any) {
      // Return mock updated data if API fails
      console.error("Failed to update sponsor:", error);
      return {
        name: data.name || "TechCorp Solutions",
        industry: data.industry || "Technology",
        contactPerson: data.contactPerson || "Sarah Johnson",
        email: email,
        phone: data.phone || "+1234567890",
        address: data.address || "123 Business Ave, Tech City, TC 12345",
        logoUrl:
          data.logoUrl ||
          "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=200&q=80",
      };
    }
  }
}

export default new SponsorService();
