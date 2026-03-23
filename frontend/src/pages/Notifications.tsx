import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  RefreshCw,
  CheckCircle2,
  Clock,
  Inbox,
  ShieldAlert
} from "lucide-react";
import API from "../services/api";

interface Notification {
  id: number;
  message: string;
  is_read: number;
  created_at: string;
}

const Notifications = () => {

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await API.get("/notifications");
      setNotifications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await API.put(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: 1 } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-6">

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-5xl mx-auto space-y-8"
      >

        {/* HEADER */}
        <div className="flex justify-between items-center">

          <div>
            <div className="flex items-center gap-2 text-indigo-500 mb-2">
              <Bell size={18}/>
              <span className="text-xs font-black tracking-widest uppercase">
                Notification Center
              </span>
            </div>

            <h1 className="text-4xl font-black text-slate-900 dark:text-white">
              Alerts
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              System activity and analysis notifications
            </p>
          </div>

          <button
            onClick={fetchNotifications}
            className="p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm hover:rotate-180 transition"
          >
            <RefreshCw size={18}/>
          </button>

        </div>

        {/* CONTENT */}
        <AnimatePresence mode="wait">

          {loading ? (

            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-slate-400"
            >
              <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"/>
              <p className="text-xs font-bold tracking-widest uppercase">
                Syncing Alerts...
              </p>
            </motion.div>

          ) : notifications.length === 0 ? (

            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-16 text-center"
            >

              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center">
                  <Inbox className="text-slate-400"/>
                </div>
              </div>

              <p className="font-semibold text-slate-500">
                No new notifications
              </p>

            </motion.div>

          ) : (

            <motion.div
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-4"
            >

              {notifications.map((notif, index) => (

                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`group relative p-6 rounded-2xl border transition
                  ${
                    notif.is_read
                      ? "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
                      : "bg-indigo-50 dark:bg-indigo-900/10 border-indigo-200 dark:border-indigo-800 shadow-lg"
                  }`}
                >

                  {/* unread highlight */}
                  {!notif.is_read && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-500 rounded-l-2xl"/>
                  )}

                  <div className="flex justify-between gap-4">

                    <div className="flex gap-4">

                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-xl
                        ${
                          notif.is_read
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-400"
                            : "bg-indigo-600 text-white"
                        }`}
                      >
                        {notif.is_read
                          ? <CheckCircle2 size={18}/>
                          : <ShieldAlert size={18}/>
                        }
                      </div>

                      <div>

                        <p className={`font-semibold ${
                          notif.is_read
                            ? "text-slate-500"
                            : "text-slate-900 dark:text-white"
                        }`}>
                          {notif.message}
                        </p>

                        <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                          <Clock size={12}/>
                          {formatDate(notif.created_at)}
                        </div>

                      </div>

                    </div>

                    {!notif.is_read && (
                      <button
                        onClick={() => markAsRead(notif.id)}
                        className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition"
                      >
                        Mark Read
                      </button>
                    )}

                  </div>

                </motion.div>

              ))}

            </motion.div>

          )}

        </AnimatePresence>

      </motion.div>

    </div>
  );
};

export default Notifications;