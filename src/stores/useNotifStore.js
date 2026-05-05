import { apiFetch } from "@/lib/api";
import { EventSource } from "eventsource";
import { useAuthStore } from "@/stores/useAuthStore";
import { defineStore } from "pinia";
import { computed, ref, watch } from "vue";

export const useNotifStore = defineStore("notif", () => {
  const notifs = ref([]);
  const loading = ref(false);
  const PAGE = 8;
  const shown = ref(PAGE);

  const unread = computed(() => notifs.value.filter((n) => !n.read).length);
  console.log(unread.value);
  const visible = computed(() => notifs.value.slice(0, shown.value));
  const hasMore = computed(() => shown.value < notifs.value.length);

  const showMore = () => {
    shown.value += PAGE;
  };
  const resetShown = () => {
    shown.value = PAGE;
  };

  // ─────────────────────────────────────────
  // FETCH
  // ─────────────────────────────────────────
  const fetchNotifs = async () => {
    const auth = useAuthStore();
    const uid = auth.userID;
    if (!uid) return;

    // Wait until auth store finishes loading the profile
    if (auth.loading) {
      const unwatch = watch(
        () => auth.loading,
        (val) => {
          if (!val) {
            unwatch();
            fetchNotifs();
          }
        },
      );
      return;
    }

    loading.value = true;
    let results = [];

    try {
      const response = await apiFetch("/notifications/fetch", {
        method: "GET",
      });
      const result = await response.json();
      if (response.ok) results = result?.data;
    } catch (e) {
      console.error("[notifStore] fetchNotifs error:", e);
    } finally {
      loading.value = false;
    }

    results.sort((a, b) => new Date(b.time) - new Date(a.time));
    notifs.value = results;
  };

  // ─────────────────────────────────────────
  // MARK ALL READ
  // ─────────────────────────────────────────
  const markAllRead = async () => {
    // Mark non-registration notifs as read locally
    if (notifs.value.every((n) => n.read === true)) return;
    const auth = useAuthStore();
    if (!auth.userID) return;

    try {
      // Do NOT mass-mark registrations as read here —
      // they are individually marked read only when approved/denied
      if (false) {
        /* intentionally skip account_status mass-read */
      }
      const taskIds = notifs.value
        .filter((n) => n.type.includes("task") || n.type.includes("subtask"))
        .map((n) => parseInt(n.id.replace(/^(task-|subtask-)/, "")));
      const pokeIds = notifs.value
        .filter((n) => n.type === "poke")
        .map((n) => parseInt(n.id.replace("poke-", "")));

      const response = await apiFetch("/notifications/mark_all_as_read", {
        method: "POST",
        body: JSON.stringify({ taskIds, pokeIds }),
      });

      if (response.ok) {
        notifs.value.forEach((n) => {
          if (n.type !== "registration") n.read = true;
        });
      }
    } catch (e) {
      console.error("[notifStore] markAllRead error:", e);
    }
  };

  // ─────────────────────────────────────────
  // APPROVE / DENY
  // ─────────────────────────────────────────
  const approveUser = async (userId) => {
    const n = notifs.value.find((n) => n.id === `reg-${userId}`);
    if (n) n.status = "approving";
    try {
      const response = await apiFetch("/users_info/approve_user", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      if (response.ok)
        notifs.value = notifs.value.filter((n) => n.id !== `reg-${userId}`);
    } catch (e) {
      console.error("[notifStore] approveUser error:", e);
      if (n) n.status = "pending";
    }
  };

  const denyUser = async (userId) => {
    const n = notifs.value.find((n) => n.id === `reg-${userId}`);
    if (n) n.status = "denying";
    try {
      const response = await apiFetch("/users_info/deny_user", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      if (response.ok)
        notifs.value = notifs.value.filter((n) => n.id !== `reg-${userId}`);
    } catch (e) {
      console.error("[notifStore] denyUser error:", e);
      if (n) n.status = "pending";
    }
  };

  // ─────────────────────────────────────────
  // REALTIME (Keep this here until ECO has a proper server)
  // I'll test Railway's Websocket
  // ─────────────────────────────────────────
  let channel = null;
  const setupRealtime = (onNew) => {
    const url = `${import.meta.env.VITE_API_BASE_URL}/notifications/events`;

    channel = new EventSource(url, {
      fetch: (url, options) => {
        // We pass our existing apiFetch configuration here
        return apiFetch(url, {
          ...options,
          method: "GET", // SSE requires GET
        });
      },
    });
    channel.onmessage = (event) => {
      const data = JSON.parse(event.data);
      // Handle notification
      fetchNotifs();
      onNew?.(data);
    };
    channel.onerror = (e) => {
      console.error("SSE Connection failed: ", e.message);
    };
  };
  const teardownRealtime = () => {
    channel?.close();
    channel = null;
  };

  const notifReset = () => {
    notifs.value = [];
  };

  return {
    notifs,
    loading,
    shown,
    unread,
    visible,
    hasMore,
    showMore,
    resetShown,
    fetchNotifs,
    markAllRead,
    approveUser,
    denyUser,
    setupRealtime,
    teardownRealtime,
    notifReset,
  };
});
