import { auth } from "@/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const session = await auth();
  return session?.user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

export async function requireRole(...roles: UserRole[]) {
  const user = await requireAuth();
  if (!roles.includes(user.role as UserRole)) {
    redirect("/unauthorized");
  }
  return user;
}

export function hasRole(userRole: UserRole, requiredRoles: UserRole[]) {
  return requiredRoles.includes(userRole);
}

export function isAdmin(role: UserRole) {
  return role === UserRole.ADMIN;
}

export function isApprover(role: UserRole) {
  const approverRoles = [
    UserRole.OPERATIONAL_DIRECTOR,
    UserRole.FINANCE_DIRECTOR,
    UserRole.HRD,
    UserRole.LOVECORE,
    UserRole.ABN,
    UserRole.PURCHASING,
    UserRole.DIRECTOR_ASSISTANT,
  ];
  return approverRoles.includes(role);
}

export function getApproverLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    [UserRole.ADMIN]: "Administrator",
    [UserRole.STAFF]: "Staff",
    [UserRole.OPERATIONAL_DIRECTOR]: "Operational Director",
    [UserRole.FINANCE_DIRECTOR]: "Finance Director",
    [UserRole.HRD]: "HRD Manager",
    [UserRole.LOVECORE]: "Lovecore Manager",
    [UserRole.ABN]: "ABN Manager",
    [UserRole.PURCHASING]: "Purchasing Manager",
    [UserRole.DIRECTOR_ASSISTANT]: "Director's Assistant",
  };
  return labels[role];
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    DRAFT: "bg-gray-100 text-gray-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    PENDING_APPROVAL: "bg-yellow-100 text-yellow-800",
    APPROVED: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    COMPLETED: "bg-green-100 text-green-800",
    PENDING: "bg-yellow-100 text-yellow-800",
  };
  return colors[status] || "bg-gray-100 text-gray-800";
}

export function getStatusIcon(status: string): string {
  const icons: Record<string, string> = {
    DRAFT: "📝",
    SUBMITTED: "📤",
    PENDING_APPROVAL: "⏳",
    APPROVED: "✅",
    REJECTED: "❌",
    COMPLETED: "✔️",
    PENDING: "⏳",
  };
  return icons[status] || "📄";
}

export function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function generateSubmissionNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DOC-${random}-${timestamp.slice(-6)}`;
}

export function getFileIcon(fileName: string): string {
  const extension = fileName.split(".").pop()?.toLowerCase();
  const icons: Record<string, string> = {
    pdf: "📄",
    doc: "📄",
    docx: "📄",
    xls: "📊",
    xlsx: "📊",
    jpg: "🖼️",
    jpeg: "🖼️",
    png: "🖼️",
    gif: "🖼️",
  };
  return icons[extension || ""] || "📎";
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
