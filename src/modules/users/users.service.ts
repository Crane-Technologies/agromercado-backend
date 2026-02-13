import { Inject, Injectable } from '@nestjs/common';
import { DATABASE } from '../database/database.provider';
import Database from '@crane-technologies/database';
import { queries } from '../database/queries';
import * as bcrypt from 'bcrypt';
import { 
  UserNotFoundException, 
  DatabaseException,
  UserAlreadyExistsException,
} from '../auth/exceptions/auth.exceptions';
import { RegisterDto } from '../auth/dto/register.dto';

export interface User {
  app_user_id: string;
  role_id: number;
  email: string;
  phone: string;
  password_hash: string;
  document_type: string;
  document_number: number;
  township_id: number;
  is_verified: boolean;
  reputation_level_id: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async register(registerDto: RegisterDto): Promise<User> {
    try {
      // Verificar que el email no exista
      const emailExists = await this.emailExists(registerDto.email);
      if (emailExists) {
        throw new UserAlreadyExistsException(registerDto.email);
      }

      // Verificar que el teléfono no exista
      const phoneExists = await this.phoneExists(registerDto.phone);
      if (phoneExists) {
        throw new DatabaseException('Phone number already exists');
      }

      // Encriptar contraseña
      const password_hash = await bcrypt.hash(registerDto.password, 10);

      // Crear usuario
      const user = await this.create({
        email: registerDto.email,
        phone: registerDto.phone,
        password_hash,
        document_type: registerDto.document_type,
        document_number: registerDto.document_number,
        township_id: registerDto.township_id,
        role_id: 1,
      });

      return user;
    } catch (error) {
      if (error instanceof UserAlreadyExistsException || error instanceof DatabaseException) {
        throw error;
      }
      throw new DatabaseException('register user');
    }
  }

  
  async findByEmail(email: string): Promise<User | null> {
    try {
      const result = await this.db.query(queries.users.findByEmail, [email]);
      return result.rows.length > 0 ? (result.rows[0] as User) : null;
    } catch (error) {
      throw new DatabaseException('findByEmail');
    }
  }

  async findById(uuid: string): Promise<User | null> {
    try {
      const result = await this.db.query(queries.users.findById, [uuid]);
      return result.rows.length > 0 ? (result.rows[0] as User) : null;
    } catch (error) {
      throw new DatabaseException('findById');
    }
  }

  async create(userData: {
    email: string;
    phone: string;
    password_hash: string;
    document_type: string;
    document_number: number;
    township_id?: number;
    role_id?: number;
  }): Promise<User> {
    try {
      const roleId = userData.role_id || 1;
      const townshipId = userData.township_id || null;
      
      const result = await this.db.query(queries.users.create, [
        userData.email,
        userData.phone,
        userData.password_hash,
        userData.document_type,
        userData.document_number,
        townshipId,
        roleId,
      ]);
      
      return result.rows[0] as User;
    } catch (error: any) {
      if (error.code === '23505') {
        if (error.constraint?.includes('email')) {
          throw new DatabaseException('Email already exists');
        }
        if (error.constraint?.includes('phone')) {
          throw new DatabaseException('Phone already exists');
        }
        if (error.constraint?.includes('document')) {
          throw new DatabaseException('Document number already exists');
        }
      }
      
      throw new DatabaseException('create user');
    }
  }

  async update(
    uuid: string,
    data: {
      email?: string;
      phone?: string;
      password_hash?: string;
      is_verified?: boolean;
    },
  ): Promise<User> {
    try {
      const result = await this.db.query(queries.users.update, [
        data.email ?? null,
        data.phone ?? null,
        data.password_hash ?? null,
        data.is_verified ?? null,
        uuid,
      ]);
      
      if (result.rows.length === 0) {
        throw new UserNotFoundException(uuid);
      }
      
      return result.rows[0] as User;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new DatabaseException('update user');
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await this.db.query(queries.users.checkEmailExists, [email]);
      return result.rows[0].exists;
    } catch (error) {
      throw new DatabaseException('check email exists');
    }
  }

  async phoneExists(phone: string): Promise<boolean> {
    try {
      const result = await this.db.query(queries.users.checkPhoneExists, [phone]);
      return result.rows[0].exists;
    } catch (error) {
      throw new DatabaseException('check phone exists');
    }
  }
}