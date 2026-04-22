import axios from "@/plugins/axios";
import type {
    UpstreamIndexFile,
    UpstreamSpellFile,
    UpstreamSpellSourceLookup,
} from "@/types/upstream";

const spellcastingApi = {
  async getIndex(): Promise<UpstreamIndexFile> {
    const response = await axios.get<UpstreamIndexFile>(
      "/data/spells/index.json",
    );
    return response.data;
  },

  async getSpellFile(fileName: string): Promise<UpstreamSpellFile> {
    const response = await axios.get<UpstreamSpellFile>(
      `/data/spells/${fileName}`,
    );
    return response.data;
  },

  async getSourceLookup(): Promise<UpstreamSpellSourceLookup> {
    const response = await axios.get<UpstreamSpellSourceLookup>(
      "/data/generated/gendata-spell-source-lookup.json",
    );
    return response.data;
  },
};

export default spellcastingApi;
