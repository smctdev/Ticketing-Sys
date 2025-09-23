import { CONFIG } from "@/config";
import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { api } from "./api";

const pusherClient = new Pusher(CONFIG.REVERB_APP_KEY, {
  wsHost: CONFIG.REVERB_HOST || "127.0.0.1",
  wsPort: CONFIG.REVERB_PORT || 8080,
  wssPort: CONFIG.REVERB_PORT || 8080,
  forceTLS: false,
  disableStats: true,
  cluster: "mt1",
  authEndpoint: CONFIG.REVERB_AUTH_END_POINT,
  enabledTransports: ["ws", "wss"],
  auth: {
    headers: {},
  },
  authorizer: (channel: any) => {
    async function authorize(socketId: any, callback: any) {
      try {
        const response = await api.post("/broadcasting/auth", {
          socket_id: socketId,
          channel_name: channel.name,
        });
        callback(false, response.data);
      } catch (error: any) {
        console.error("Broadcast auth error:", error);
        callback(true, error);
      }
    }

    return {
      authorize,
    };
  },
});

const echo = new Echo({
  broadcaster: "reverb",
  client: pusherClient,
});

export default echo;
