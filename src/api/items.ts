import axios from "@/plugins/axios";

const itemsApi = {
  async getItemsBase(): Promise<unknown> {
    const response = await axios.get<unknown>("/data/items-base.json");
    return response.data;
  },

  async getItems(): Promise<unknown> {
    const response = await axios.get<unknown>("/data/items.json");
    return response.data;
  },
};

export default itemsApi;
