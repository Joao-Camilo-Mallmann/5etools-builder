import axios from "@/plugins/axios";
import type { UpstreamRaceFile } from "@/types/upstream";

const racesApi = {
  async getRaces(): Promise<UpstreamRaceFile> {
    const response = await axios.get<UpstreamRaceFile>("/data/races.json");
    return response.data;
  },

  async getFluffRaces(): Promise<unknown> {
    const response = await axios.get<unknown>("/data/fluff-races.json");
    return response.data;
  },
};

export default racesApi;
