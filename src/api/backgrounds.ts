import axios from "@/plugins/axios";

const backgroundsApi = {
  async get() {
    const response = await axios.get("/data/backgrounds.json");
    return response.data;
  },
};

export default backgroundsApi;
