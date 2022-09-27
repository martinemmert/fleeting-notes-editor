import { pbClient } from "../api/pb-client";

export default {
  login(email: string, password: string) {
    return pbClient().users.authViaEmail(email, password);
  },

  async logout() {
    pbClient().authStore.clear();
  },

  get currentUserId() {
    return pbClient().authStore.model?.id;
  },

  get hasValidSession() {
    return pbClient().authStore.isValid;
  },
};
