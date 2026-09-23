import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { UpdateUserDto } from './dto/update-user.dto';

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private toPublic(user: UserDocument): PublicUser {
    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }

  async create(name: string, email: string, hashedPassword: string) {
    const existing = await this.userModel.findOne({ email });
    if (existing) {
      throw new ConflictException('An account with this email already exists');
    }
    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });
    return this.toPublic(user);
  }

  // Login ku mattum use pannuvom - password field um include pannitu return pannum
  async findByEmailWithPassword(email: string) {
    return this.userModel.findOne({ email }).select('+password');
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.userModel.find().sort({ createdAt: -1 });
    return users.map((u) => this.toPublic(u));
  }

  async findById(id: string): Promise<PublicUser> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublic(user);
  }

  async updateOwn(id: string, dto: UpdateUserDto): Promise<PublicUser> {
    if (dto.email) {
      const existing = await this.userModel.findOne({
        email: dto.email,
        _id: { $ne: id },
      });
      if (existing) {
        throw new ConflictException('That email is already in use');
      }
    }

    const user = await this.userModel.findByIdAndUpdate(
      id,
      { $set: dto },
      { new: true, runValidators: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublic(user);
  }

  async removeOwn(id: string): Promise<void> {
    const result = await this.userModel.findByIdAndDelete(id);
    if (!result) {
      throw new NotFoundException('User not found');
    }
  }
}