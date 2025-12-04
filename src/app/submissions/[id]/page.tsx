"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Download, CheckCircle, XCircle, Clock } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { approveSubmission, rejectSubmission, getSubmissionDetails } from "@/app/actions/submissions";

export default function SubmissionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const submissionId = params.id as string;

  const [submission, setSubmission] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const result = await getSubmissionDetails(submissionId);
        if (result.success) {
          setSubmission(result.submission);
        } else {
          setError(result.error);
        }
      } catch (err) {
        setError("Failed to load submission");
      } finally {
        setIsLoading(false);
      }
    }

    if (submissionId && status === "authenticated") {
      fetchSubmission();
    }
  }, [submissionId, status]);

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      const result = await approveSubmission(submissionId);
      if (result.success) {
        alert("Submission approved successfully!");
        setSubmission(result.submission);
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to approve");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await rejectSubmission(submissionId, rejectReason);
      if (result.success) {
        alert("Submission rejected");
        setSubmission(result.submission);
        setShowRejectForm(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to reject");
    } finally {
      setIsSubmitting(false);
    }
  };

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

  if (!submission) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Submission not found</h1>
          <Link href="/submissions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
            >
              Back to Submissions
            </motion.button>
          </Link>
        </div>
      </div>
    );
  }

  const isApprover = session?.user?.role && [
    "OPERATIONAL_DIRECTOR",
    "FINANCE_DIRECTOR",
    "HRD",
    "LOVECORE",
    "ABN",
    "PURCHASING",
    "DIRECTOR_ASSISTANT",
  ].includes(session.user.role);

  const hasApprovalPending = submission.approvalSteps?.some(
    (step: any) => step.approverRole === session?.user?.role && step.status === "PENDING"
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800/50 backdrop-blur-lg sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link href="/submissions">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-400" />
            </motion.button>
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{submission.title}</h1>
            <p className="text-sm text-slate-400">
              {submission.submissionNumber} • {submission.department}
            </p>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-8">
        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-red-400"
          >
            {error}
          </motion.div>
        )}

        {/* Basic Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6 space-y-4"
        >
          <h2 className="text-lg font-semibold text-white">Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-400 mb-1">Status</p>
              <p className="text-white font-medium">{submission.finalStatus}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Department</p>
              <p className="text-white font-medium">{submission.department}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Requester</p>
              <p className="text-white font-medium">{submission.requester?.name}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Created</p>
              <p className="text-white font-medium">
                {new Date(submission.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          {submission.description && (
            <div className="border-t border-slate-700 pt-4">
              <p className="text-sm text-slate-400 mb-2">Description</p>
              <p className="text-white">{submission.description}</p>
            </div>
          )}
        </motion.div>

        {/* Attachments */}
        {submission.attachments?.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Attachments</h2>
            <div className="space-y-2">
              {submission.attachments.map((file: any) => (
                <motion.div
                  key={file.id}
                  whileHover={{ x: 5 }}
                  className="flex items-center justify-between bg-slate-700/30 p-3 rounded-lg hover:bg-slate-700/40 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-4 h-4 text-blue-400" />
                    <div>
                      <p className="text-white font-medium">{file.fileName}</p>
                      <p className="text-sm text-slate-400">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <a
                    href={file.fileUrl}
                    download
                    className="text-blue-400 hover:text-blue-300"
                  >
                    Download
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Approval Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Approval Timeline</h2>
          <div className="space-y-4">
            {submission.approvalSteps?.map((step: any, idx: number) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex gap-4"
              >
                <div className="flex flex-col items-center">
                  <motion.div
                    animate={{
                      scale: step.status === "APPROVED" ? [1, 1.2, 1] : 1,
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: step.status === "APPROVED" ? Infinity : 0,
                      repeatDelay: 2,
                    }}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step.status === "APPROVED"
                        ? "bg-green-500/20 text-green-400"
                        : step.status === "REJECTED"
                        ? "bg-red-500/20 text-red-400"
                        : "bg-slate-700 text-slate-400"
                    }`}
                  >
                    {step.status === "APPROVED" && <CheckCircle className="w-5 h-5" />}
                    {step.status === "REJECTED" && <XCircle className="w-5 h-5" />}
                    {step.status === "PENDING" && <Clock className="w-5 h-5" />}
                  </motion.div>
                  {idx < submission.approvalSteps.length - 1 && (
                    <div className="w-0.5 h-12 bg-slate-700 my-1" />
                  )}
                </div>
                <div className="flex-1 pt-1">
                  <p className="text-white font-medium">{step.approverRole.replace(/_/g, " ")}</p>
                  {step.approver && (
                    <p className="text-sm text-slate-400">{step.approver.name}</p>
                  )}
                  {step.approvedAt && (
                    <p className="text-xs text-slate-500 mt-1">
                      {new Date(step.approvedAt).toLocaleString()}
                    </p>
                  )}
                  {step.note && (
                    <p className="text-sm text-slate-300 mt-2 bg-slate-700/30 p-2 rounded">
                      {step.note}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Approval Actions */}
        {isApprover && hasApprovalPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-blue-600/10 border border-blue-500/50 rounded-xl p-6"
          >
            {showRejectForm ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Rejection Reason</h3>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Provide a reason for rejection..."
                  className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-red-500 resize-none"
                  rows={4}
                />
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleReject}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Confirm Rejection"}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRejectForm(false)}
                    className="px-6 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleApprove}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Processing..." : "✓ Approve"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowRejectForm(true)}
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  ✗ Reject
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </main>
    </div>
  );
}
