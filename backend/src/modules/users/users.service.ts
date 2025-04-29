// /src/modules/users/users.service.ts

import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { hash, compare } from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  /** Create a new user, hashing password, setting audit fields */
  async create(dto: CreateUserDto, createdBy: string): Promise<User> {
    const hashed = await hash(dto.password, 10);
    const created = new this.userModel({
      ...dto,
      password: hashed,
      createdBy,
      updatedBy: createdBy,
    });
    return created.save();
  }

  /** Find all users (admin-only) */
  findAll(): Promise<User[]> {
    return this.userModel.find().select('-password').lean().exec();
  }

  /** Find one by ID, throw if not found */
  async findOne(id: string): Promise<User> {
    const user = await this.userModel
      .findById(id)
      .select('-password')
      .lean()
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** Update fields; re-hash password if provided, update audit */
  async update(
    id: string,
    dto: UpdateUserDto,
    updatedBy: string,
  ): Promise<User> {
    const update: Partial<UpdateUserDto & { updatedBy: string }> = {
      ...dto,
      updatedBy,
    };
    if (dto.password) {
      update.password = await hash(dto.password, 10);
    }
    const user = await this.userModel
      .findByIdAndUpdate(id, update, { new: true })
      .select('-password')
      .lean()
      .exec();
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  /** Remove user by ID */
  async remove(id: string): Promise<void> {
    const res = await this.userModel.findByIdAndDelete(id).exec();
    if (!res) throw new NotFoundException(`User ${id} not found`);
  }

  /** Used by AuthService to check credentials */
  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email }).exec();
  }

  /** Compare plain text to hashed */
  async verifyPassword(user: UserDocument, plain: string): Promise<boolean> {
    return compare(plain, user.password);
  }
}
