// /src/modules/content/schemas/content.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ContentDocument = Content & Document;

/** Sub-document for a single block */
export class Block {
  @Prop({ required: true, enum: ['text', 'image', 'video'] })
  type: 'text' | 'image' | 'video';

  @Prop() text?: string; // for text blocks
  @Prop() url?: string; // for image/video blocks
  @Prop({ type: MongooseSchema.Types.Mixed }) metadata?: Record<string, any>; // e.g. alt text or dimensions
}

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true })
  title: string;

  @Prop({ type: [Block], _id: false })
  blocks: Block[];

  @Prop() createdBy: string;
  @Prop() updatedBy: string;

  // Soft delete properties
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: String, default: null })
  deletedBy: string | null;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
