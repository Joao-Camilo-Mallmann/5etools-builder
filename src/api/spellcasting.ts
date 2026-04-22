import axios from "@/plugins/axios";

const spellcastingApi = {
  async getIndex() {
    const response = await axios.get("/data/spells/index.json");
    return response.data;
  },

  async getSpellFile(fileName: string) {
    const response = await axios.get(`/data/spells/${fileName}`);
    return response.data;
  },

  async getSourceLookup() {
    const response = await axios.get(
      "/data/generated/gendata-spell-source-lookup.json",
    );
    return response.data;
  },
};

export default spellcastingApi;
