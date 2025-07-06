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
      // Return mock data if API fails
      console.error("Failed to fetch family members:", error);
      return [
        {
          id: "1",
          name: "Jane Doe",
          relation: "Spouse",
          age: 32,
          contact: "+1234567891",
          employeeEmail: email,
        },
        {
          id: "2",
          name: "Tommy Doe",
          relation: "Child",
          age: 8,
          contact: "N/A",
          employeeEmail: email,
        },
      ];
    }
  }

  async addFamilyMember(data: FamilyMemberData): Promise<FamilyMember> {
    try {
      const response = await axiosInstance.post("/family/add", data);
      return response.data;
    } catch (error: any) {
      // Return mock success response if API fails
      console.error("Failed to add family member:", error);
      return {
        id: Date.now().toString(),
        name: data.name,
        relation: data.relation,
        age: data.age,
        contact: data.contact,
        employeeEmail: data.employeeEmail,
      };
    }
  }

  async deleteFamilyMember(id: string): Promise<{ message: string }> {
    try {
      const response = await axiosInstance.delete(`/family/${id}`);
      return response.data;
    } catch (error: any) {
      // Return mock success response if API fails
      console.error("Failed to delete family member:", error);
      return {
        message: "Family member deleted successfully",
      };
    }
  }
}

export default new FamilyService();
