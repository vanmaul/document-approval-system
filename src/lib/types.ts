import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
  }

  interface Session extends DefaultSession {
    user: User & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    role: UserRole;
  }
}

export interface SubmissionWithRelations {
  id: string;
  submissionNumber: string;
  title: string;
  description?: string;
  department: string;
  finalStatus: string;
  barcodeData?: string;
  createdAt: Date;
  updatedAt: Date;
  requesterId: string;
  requester: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
  };
  attachments: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    uploadedAt: Date;
  }[];
  approvalSteps: {
    id: string;
    approverRole: UserRole;
    stepOrder: number;
    status: string;
    approverId?: string;
    approvedAt?: Date;
    note?: string;
    signaturePath?: string;
    approver?: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  activityLogs: {
    id: string;
    action: string;
    description?: string;
    timestamp: Date;
    user: {
      id: string;
      name: string;
      email: string;
    };
  }[];
  versions: {
    id: string;
    versionNumber: number;
    title: string;
    description?: string;
    updatedAt: Date;
    updatedByUser: {
      id: string;
      name: string;
      email: string;
    };
  }[];
}

export interface ApprovalConfig {
  role: UserRole;
  stepOrder: number;
  description: string;
}

export const APPROVAL_ORDER: ApprovalConfig[] = [
  { role: UserRole.OPERATIONAL_DIRECTOR, stepOrder: 1, description: "Operational Director" },
  { role: UserRole.FINANCE_DIRECTOR, stepOrder: 2, description: "Finance Director" },
  { role: UserRole.HRD, stepOrder: 3, description: "HRD Manager" },
  { role: UserRole.LOVECORE, stepOrder: 4, description: "Lovecore Manager" },
  { role: UserRole.ABN, stepOrder: 5, description: "ABN Manager" },
  { role: UserRole.PURCHASING, stepOrder: 6, description: "Purchasing Manager" },
  { role: UserRole.DIRECTOR_ASSISTANT, stepOrder: 7, description: "Director's Assistant" },
];

export const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/gif",
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export type FileUploadResponse = {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
};
