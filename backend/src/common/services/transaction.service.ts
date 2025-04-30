// /src/common/services/transaction.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ClientSession } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface TransactionContext {
  session: ClientSession | null;
  transactionId: string;
  useTransaction: boolean;
}

@Injectable()
export class TransactionService {
  private readonly logger = new Logger(TransactionService.name);

  constructor(@InjectConnection() private connection: Connection) {}

  /**
   * Creates a new transaction context with optional MongoDB session
   */
  async createContext(): Promise<TransactionContext> {
    const transactionId = uuidv4();
    let session: ClientSession | null = null;
    let useTransaction = false;

    try {
      // Check for replica set support
      const admin = this.connection.db?.admin();
      if (!admin) {
        throw new Error('Database connection not available');
      }

      const isMaster = await admin.command({ isMaster: 1 });
      if (isMaster.setName) {
        // Replica set detected → enable transactions
        session = await this.connection.startSession();
        session.startTransaction();
        useTransaction = true;
        this.logger.log(
          `[${transactionId}] Replica set detected – using transactions.`,
        );
      } else {
        this.logger.log(
          `[${transactionId}] No replica set detected – proceeding without transactions.`,
        );
      }
    } catch (checkErr) {
      this.logger.log(
        `[${transactionId}] Could not check replica set status (proceeding without transactions): ${checkErr.message}`,
      );
    }

    return {
      session,
      transactionId,
      useTransaction,
    };
  }

  /**
   * Commits a transaction if it's active
   */
  async commitTransaction(context: TransactionContext): Promise<void> {
    if (context.useTransaction && context.session) {
      await context.session.commitTransaction();
      this.logger.log(
        `[${context.transactionId}] Transaction committed successfully.`,
      );
    }
  }

  /**
   * Aborts a transaction if it's active
   */
  async abortTransaction(context: TransactionContext): Promise<void> {
    if (context.useTransaction && context.session) {
      try {
        await context.session.abortTransaction();
        this.logger.log(`[${context.transactionId}] Transaction aborted.`);
      } catch (abortErr) {
        this.logger.error(
          `[${context.transactionId}] Failed to abort transaction: ${abortErr.message}`,
        );
      }
    }
  }

  /**
   * Ends the session if it exists
   */
  async endSession(context: TransactionContext): Promise<void> {
    if (context.session) {
      try {
        await context.session.endSession();
      } catch (endErr) {
        this.logger.error(
          `[${context.transactionId}] Failed to end session: ${endErr.message}`,
        );
      }
    }
  }

  /**
   * Executes a function within a transaction
   * Automatically commits, aborts, and cleans up the session
   */
  async withTransaction<T>(
    operation: (context: TransactionContext) => Promise<T>,
  ): Promise<T> {
    const context = await this.createContext();

    try {
      const result = await operation(context);
      if (context.useTransaction) {
        await this.commitTransaction(context);
      }
      return result;
    } catch (error) {
      if (context.useTransaction) {
        await this.abortTransaction(context);
      }
      throw error;
    } finally {
      await this.endSession(context);
    }
  }
}
