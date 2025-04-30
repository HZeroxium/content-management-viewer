// /src/modules/content/schemas/content.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema, Types } from 'mongoose';

export type ContentDocument = Content & Document;

/** Sub-document for a single block */
export class Block {
  @Prop({ required: true, enum: ['text', 'image', 'video', 'audio'] })
  type: 'text' | 'image' | 'video' | 'audio';

  @Prop() text?: string; // for text blocks
  @Prop() url?: string; // for image/video/audio blocks
  @Prop({ type: MongooseSchema.Types.Mixed }) metadata?: Record<string, any>; // e.g. alt text or dimensions
}

@Schema({ timestamps: true })
export class Content {
  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: [Block], _id: false })
  blocks: Block[];

  @Prop({ type: MongooseSchema.Types.Mixed })
  metadata?: Record<string, any>;

  @Prop() createdBy: string;
  @Prop() updatedBy: string;

  // Soft delete properties
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  @Prop({ type: String, default: null })
  deletedBy: string | null;
}

export const ContentSchema = SchemaFactory.createForClass(Content);
