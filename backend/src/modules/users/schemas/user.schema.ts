// /src/modules/users/schemas/user.schema.ts

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  [x: string]: any;
  // Add explicit _id field to make TypeScript aware of it
  _id: Types.ObjectId;

  @Prop({ unique: true, required: true })
  email: string;

  @Prop({ required: true })
  password: string; // hashed via bcrypt

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, enum: ['admin', 'editor', 'client'] })
  role: string;

  @Prop()
  createdBy: string;

  @Prop()
  updatedBy: string;

  // Soft delete properties
  @Prop({ type: Date, default: null })
  deletedAt: Date | null;

  // Fix: Explicitly specify String type for deletedBy field
  @Prop({ type: String, default: null })
  deletedBy: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Hash password before saving
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await import('bcrypt').then(({ genSalt }) => genSalt(10));
  this.password = await import('bcrypt').then(({ hash }) =>
    hash(this.password, salt),
  );
  next();
});
