import axios from "@/plugins/axios";

const classesApi = {
  async getIndex() {
    const response = await axios.get("/data/class/index.json");
    return response.data;
  },

  async getClassFile(fileName: string) {
    const response = await axios.get(`/data/class/${fileName}`);
    return response.data;
  },
};

export default classesApi;
