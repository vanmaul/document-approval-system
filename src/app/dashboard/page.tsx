"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogOut, FileText, BarChart3, Users } from "lucide-react";
import Link from "next/link";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-slate-700 border-t-blue-500 rounded-full"
        />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Document System</h1>
            <p className="text-sm text-slate-400">Welcome, {session.user?.name}</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => signOut({ redirect: true, callbackUrl: "/login" })}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </motion.button>
        </div>
      </header>

      {/* Main content */}
      <motion.main
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto px-6 py-12 space-y-8"
      >
        {/* Stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <motion.div variants={itemVariants} className="group">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all hover:shadow-lg hover:shadow-blue-500/20">
              <FileText className="w-8 h-8 text-blue-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-1">Submissions</h3>
              <p className="text-3xl font-bold text-blue-400">0</p>
              <p className="text-sm text-slate-400 mt-2">Your submissions</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-purple-500/50 transition-all hover:shadow-lg hover:shadow-purple-500/20">
              <BarChart3 className="w-8 h-8 text-purple-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-1">Pending</h3>
              <p className="text-3xl font-bold text-purple-400">0</p>
              <p className="text-sm text-slate-400 mt-2">Awaiting approval</p>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="group">
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-slate-700/50 rounded-xl p-6 hover:border-green-500/50 transition-all hover:shadow-lg hover:shadow-green-500/20">
              <Users className="w-8 h-8 text-green-400 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-white mb-1">Completed</h3>
              <p className="text-3xl font-bold text-green-400">0</p>
              <p className="text-sm text-slate-400 mt-2">Approved submissions</p>
            </div>
          </motion.div>
        </div>

        {/* Actions */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link href="/submissions/new">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-8 cursor-pointer hover:shadow-lg hover:shadow-blue-500/30 transition-all"
            >
              <FileText className="w-12 h-12 text-white mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">New Submission</h3>
              <p className="text-blue-100">Create a new document submission</p>
            </motion.div>
          </Link>

          <Link href="/submissions">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-8 cursor-pointer hover:shadow-lg hover:shadow-slate-500/30 transition-all border border-slate-600"
            >
              <BarChart3 className="w-12 h-12 text-slate-300 mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">View Submissions</h3>
              <p className="text-slate-300">Track your submissions</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Quick links */}
        <motion.div variants={itemVariants} className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Access</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/submissions"
              className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
            >
              View All Submissions
            </Link>
            {session.user?.role && ["ADMIN", "OPERATIONAL_DIRECTOR", "FINANCE_DIRECTOR", "HRD", "LOVECORE", "ABN", "PURCHASING", "DIRECTOR_ASSISTANT"].includes(session.user.role) && (
              <Link
                href="/approvals"
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Pending Approvals
              </Link>
            )}
            {session.user?.role === "ADMIN" && (
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                User Management
              </Link>
            )}
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}
