"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuth, generateSubmissionNumber } from "@/lib/auth-utils";
import { APPROVAL_ORDER } from "@/lib/types";
import { SubmissionStatus, ApprovalStepStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

interface CreateSubmissionInput {
  title: string;
  description?: string;
  department: string;
}

export async function createSubmission(data: CreateSubmissionInput) {
  try {
    const user = await requireAuth();

    const submissionNumber = generateSubmissionNumber();

    const submission = await prisma.submission.create({
      data: {
        submissionNumber,
        title: data.title,
        description: data.description,
        department: data.department,
        finalStatus: SubmissionStatus.DRAFT,
        requesterId: user.id,
      },
      include: {
        requester: true,
        approvalSteps: true,
        attachments: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        submissionId: submission.id,
        userId: user.id,
        action: "SUBMISSION_CREATED",
        description: `Submission "${submission.title}" created`,
      },
    });

    revalidatePath("/submissions");

    return {
      success: true,
      submission,
    };
  } catch (error) {
    console.error("Create submission error:", error);
    return {
      success: false,
      error: "Failed to create submission",
    };
  }
}

export async function submitSubmission(submissionId: string) {
  try {
    const user = await requireAuth();

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { requester: true },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    if (submission.requesterId !== user.id) {
      return { success: false, error: "Unauthorized" };
    }

    // Create approval steps
    const approvalSteps = await Promise.all(
      APPROVAL_ORDER.map((config) =>
        prisma.approvalStep.create({
          data: {
            submissionId: submission.id,
            approverRole: config.role,
            stepOrder: config.stepOrder,
            status: ApprovalStepStatus.PENDING,
          },
        })
      )
    );

    // Update submission status
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: {
        finalStatus: SubmissionStatus.SUBMITTED,
      },
      include: {
        approvalSteps: true,
        requester: true,
        attachments: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        submissionId: submission.id,
        userId: user.id,
        action: "SUBMISSION_SUBMITTED",
        description: `Submission "${submission.title}" submitted for approval`,
      },
    });

    revalidatePath(`/submissions/${submissionId}`);
    revalidatePath("/submissions");

    return {
      success: true,
      submission: updatedSubmission,
    };
  } catch (error) {
    console.error("Submit submission error:", error);
    return {
      success: false,
      error: "Failed to submit submission",
    };
  }
}

export async function approveSubmission(submissionId: string, note?: string) {
  try {
    const user = await requireAuth();

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { approvalSteps: true },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    // Find the current approval step for this user's role
    const currentStep = submission.approvalSteps
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .find(
        (step) =>
          step.approverRole === user.role &&
          step.status === ApprovalStepStatus.PENDING
      );

    if (!currentStep) {
      return { success: false, error: "No pending approval step for your role" };
    }

    // Update the approval step
    await prisma.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: ApprovalStepStatus.APPROVED,
        approverId: user.id,
        approvedAt: new Date(),
        note,
      },
    });

    // Check if all steps are approved
    const remainingSteps = submission.approvalSteps.filter(
      (step) => step.status !== ApprovalStepStatus.APPROVED && step.id !== currentStep.id
    );

    let newStatus = SubmissionStatus.PENDING_APPROVAL;
    if (remainingSteps.length === 0) {
      newStatus = SubmissionStatus.COMPLETED;
    }

    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { finalStatus: newStatus },
      include: {
        approvalSteps: true,
        requester: true,
        attachments: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        submissionId: submissionId,
        userId: user.id,
        action: "STEP_APPROVED",
        description: `Approved by ${user.name} (${user.role})`,
      },
    });

    revalidatePath(`/submissions/${submissionId}`);
    revalidatePath("/approvals");

    return {
      success: true,
      submission: updatedSubmission,
    };
  } catch (error) {
    console.error("Approve submission error:", error);
    return {
      success: false,
      error: "Failed to approve submission",
    };
  }
}

export async function rejectSubmission(submissionId: string, reason: string) {
  try {
    const user = await requireAuth();

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: { approvalSteps: true },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    // Find the current approval step for this user's role
    const currentStep = submission.approvalSteps
      .sort((a, b) => a.stepOrder - b.stepOrder)
      .find(
        (step) =>
          step.approverRole === user.role &&
          step.status === ApprovalStepStatus.PENDING
      );

    if (!currentStep) {
      return { success: false, error: "No pending approval step for your role" };
    }

    // Update the approval step
    await prisma.approvalStep.update({
      where: { id: currentStep.id },
      data: {
        status: ApprovalStepStatus.REJECTED,
        approverId: user.id,
        approvedAt: new Date(),
        note: reason,
      },
    });

    // Update submission status to REJECTED
    const updatedSubmission = await prisma.submission.update({
      where: { id: submissionId },
      data: { finalStatus: SubmissionStatus.REJECTED },
      include: {
        approvalSteps: true,
        requester: true,
        attachments: true,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        submissionId: submissionId,
        userId: user.id,
        action: "STEP_REJECTED",
        description: `Rejected by ${user.name} (${user.role}). Reason: ${reason}`,
      },
    });

    revalidatePath(`/submissions/${submissionId}`);
    revalidatePath("/approvals");

    return {
      success: true,
      submission: updatedSubmission,
    };
  } catch (error) {
    console.error("Reject submission error:", error);
    return {
      success: false,
      error: "Failed to reject submission",
    };
  }
}

export async function getSubmissionDetails(submissionId: string) {
  try {
    const user = await requireAuth();

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        requester: true,
        attachments: true,
        approvalSteps: {
          include: {
            approver: true,
          },
          orderBy: {
            stepOrder: "asc",
          },
        },
        activityLogs: {
          include: {
            user: true,
          },
          orderBy: {
            timestamp: "desc",
          },
        },
        versions: {
          include: {
            updatedByUser: true,
          },
          orderBy: {
            versionNumber: "desc",
          },
        },
      },
    });

    if (!submission) {
      return { success: false, error: "Submission not found" };
    }

    // Check access permissions
    const isOwner = submission.requesterId === user.id;
    const isAdmin = user.role === "ADMIN";
    const isApprover = submission.approvalSteps.some(
      (step) => step.approverRole === user.role
    );

    if (!isOwner && !isAdmin && !isApprover) {
      return { success: false, error: "Unauthorized" };
    }

    return {
      success: true,
      submission,
    };
  } catch (error) {
    console.error("Get submission details error:", error);
    return {
      success: false,
      error: "Failed to fetch submission",
    };
  }
}
