import { IStorage } from "./storage";
import { InsertAuditLog } from "@shared/schema";

export class AuditLogger {
  constructor(private storage: IStorage) {}

  async logCreate(
    tableName: string,
    recordId: number,
    newData: any,
    userId: number,
    description?: string
  ) {
    const auditLog: InsertAuditLog = {
      tableName,
      recordId,
      action: "created",
      oldData: null,
      newData,
      userId,
      description: description || `${tableName} criado`
    };

    await this.storage.createAuditLog(auditLog);
  }

  async logUpdate(
    tableName: string,
    recordId: number,
    oldData: any,
    newData: any,
    userId: number,
    description?: string
  ) {
    const auditLog: InsertAuditLog = {
      tableName,
      recordId,
      action: "updated",
      oldData,
      newData,
      userId,
      description: description || `${tableName} atualizado`
    };

    await this.storage.createAuditLog(auditLog);
  }

  async logDelete(
    tableName: string,
    recordId: number,
    oldData: any,
    userId: number,
    description?: string
  ) {
    const auditLog: InsertAuditLog = {
      tableName,
      recordId,
      action: "deleted",
      oldData,
      newData: null,
      userId,
      description: description || `${tableName} deletado`
    };

    await this.storage.createAuditLog(auditLog);
  }
} 