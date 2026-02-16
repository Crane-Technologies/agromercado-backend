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
import { RegisterDto } from './dto/register.dto';

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

  async create(registerDto: RegisterDto): Promise<User> {
    try {
      // 1. Verificar que el email no exista
      const emailExists = await this.emailExists(registerDto.email);
      if (emailExists) {
        throw new UserAlreadyExistsException(registerDto.email);
      }

      // 2. Verificar que el teléfono no exista
      const phoneExists = await this.phoneExists(registerDto.phone);
      if (phoneExists) {
        throw new DatabaseException('Phone number already exists');
      }

      // 3. Encriptar password
      const password_hash = await bcrypt.hash(registerDto.password, 10);

      // 4. Llamar a la función de BD
      const result = await this.db.query(queries.users.create, [
        registerDto.email,
        registerDto.phone,
        password_hash,
        registerDto.document_type,
        registerDto.document_number,
        registerDto.township_id || null,
        1, // role_id por defecto
        registerDto.first_name || null,
        registerDto.middle_name || null,
        registerDto.surname || null,
        registerDto.second_surname || null,
        registerDto.birthdate || null,
        registerDto.company_name || null,
      ]);

      console.log('Result from create_app_user:', result.rows);

      // 5. Buscar usuario completo
      const userId = result.rows[0].app_user_id;
      console.log('Searching for user with ID:', userId);
      const user = await this.findById(userId);
      console.log('User found after creation:', user);

      if (!user) {
        throw new DatabaseException('User created but not found');
      }

      return user;
    } catch (error: any) {
      console.error('Error creating user:', error);
      
      if (error instanceof UserAlreadyExistsException || error instanceof DatabaseException) {
        throw error;
      }

      if (error.message?.includes('already exists')) {
        throw new DatabaseException('User with this email, phone, or document number already exists');
      }
      
      if (error.message?.includes('Company name is required')) {
        throw new DatabaseException('Company name is required for legal entities');
      }
      
      if (error.message?.includes('First name and surname are required')) {
        throw new DatabaseException('First name and surname are required for natural persons');
      }
      
      throw new DatabaseException(`create user: ${error.message}`);
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
      const result = await this.db.query(queries.users.checkEmailExists, [
        email,
      ]);
      return result.rows[0].exists;
    } catch (error) {
      throw new DatabaseException('check email exists');
    }
  }

  async phoneExists(phone: string): Promise<boolean> {
    try {
      const result = await this.db.query(queries.users.checkPhoneExists, [
        phone,
      ]);
      return result.rows[0].exists;
    } catch (error) {
      throw new DatabaseException('check phone exists');
    }
  }
}
