import axiosInstance from "@/utils/axiosInstance";

export interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  age: number;
  contact: string;
  employeeEmail: string;
}

export interface FamilyMemberData {
  name: string;
  relation: string;
  age: number;
  contact: string;
  employeeEmail: string;
}

class FamilyService {
  async getFamilyMembers(email: string): Promise<FamilyMember[]> {
    try {
      const response = await axiosInstance.get(
        `/family/get?email=${encodeURIComponent(email)}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Failed to fetch family members:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch family members",
      );
    }
  }

  async addFamilyMember(data: FamilyMemberData): Promise<FamilyMember> {
    try {
      const response = await axiosInstance.post("/family/add", data);
      return response.data;
    } catch (error: any) {
      console.error("Failed to add family member:", error);
      throw new Error(
        error.response?.data?.message || "Failed to add family member",
      );
    }
  }

  async deleteFamilyMember(id: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/family/${id}`);
      return response.data;
    } catch (error: any) {
      console.error("Failed to delete family member:", error);
      throw new Error(
        error.response?.data?.message || "Failed to delete family member",
      );
    }
  }
}

export default new FamilyService();
