import axios from "@/plugins/axios";

const racesApi = {
  async getRaces() {
    const response = await axios.get("/data/races.json");
    return response.data;
  },

  async getFluffRaces() {
    const response = await axios.get("/data/fluff-races.json");
    return response.data;
  },
};

export default racesApi;
