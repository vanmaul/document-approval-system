"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";

export default function ApprovalsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [approvals, setApprovals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    // TODO: Fetch pending approvals for current user role
    setIsLoading(false);
  }, []);

  if (status === "loading" || isLoading) {
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

  // Check if user is an approver
  const isApprover = session?.user?.role && [
    "OPERATIONAL_DIRECTOR",
    "FINANCE_DIRECTOR",
    "HRD",
    "LOVECORE",
    "ABN",
    "PURCHASING",
    "DIRECTOR_ASSISTANT",
    "ADMIN"
  ].includes(session.user.role);

  if (!isApprover) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-slate-400">You don't have approval permissions</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-white">Pending Approvals</h1>
          <p className="text-sm text-slate-400">Review submissions assigned to your role</p>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {approvals.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">All caught up!</h2>
            <p className="text-slate-400">No pending approvals for your role</p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {/* TODO: Render approval cards */}
          </div>
        )}
      </main>
    </div>
  );
}
