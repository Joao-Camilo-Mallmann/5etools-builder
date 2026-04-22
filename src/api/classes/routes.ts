import axios from "@/plugins/axios";
import type { UpstreamClassFile, UpstreamIndexFile } from "@/types/upstream";

const classesApi = {
  async getIndex(): Promise<UpstreamIndexFile> {
    const response = await axios.get<UpstreamIndexFile>(
      "/data/class/index.json",
    );
    return response.data;
  },

  async getClassFile(fileName: string): Promise<UpstreamClassFile> {
    const response = await axios.get<UpstreamClassFile>(
      `/data/class/${fileName}`,
    );
    return response.data;
  },
};

export default classesApi;
