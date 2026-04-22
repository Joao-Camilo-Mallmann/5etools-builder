import axios from "@/plugins/axios";
import type { UpstreamBackgroundFile } from "@/types/upstream";

const backgroundsApi = {
  async get(): Promise<UpstreamBackgroundFile> {
    const response = await axios.get<UpstreamBackgroundFile>(
      "/data/backgrounds.json",
    );
    return response.data;
  },
};

export default backgroundsApi;
