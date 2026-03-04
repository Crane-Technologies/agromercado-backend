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
import { UpdateUserDto } from './dto/update-user.dto';
import {
  buildLimitOffset,
  LimitOffset,
} from '../../common/pagination/build-limit-offset.util';

export interface User {
  app_user_id: string;
  role_id: number;
  email: string;
  phone: string;
  password_hash: string;
  document_type: string;
  document_number: number;
  township_id: number;
  first_name?: string;
  middle_name?: string;
  surname?: string;
  second_surname?: string;
  company_name?: string;
  is_verified: boolean;
  reputation_level_id: number;
  created_at: Date;
  updated_at: Date;
}

@Injectable()
export class UsersService {
  constructor(@Inject(DATABASE) private readonly db: Database) {}

  async getAll(pagination?: LimitOffset): Promise<{
    items: Omit<User, 'password_hash'>[];
    pagination: {
      limit: number;
      offset: number;
      total: number;
      hasMore: boolean;
    };
  }> {
    try {
      const { limit, offset } = buildLimitOffset(
        pagination?.limit,
        pagination?.offset,
      );

      const [rowsResult, countResult] = await Promise.all([
        this.db.query(queries.users.findAll, [limit, offset]),
        this.db.query(queries.users.countAll),
      ]);

      const total = Number(countResult.rows[0]?.total ?? 0);
      const items = rowsResult.rows.map(
        /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
        ({ password_hash: _ph, ...safeUser }: User) => safeUser,
      );

      return {
        items,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + items.length < total,
        },
      };
    } catch (error) {
      throw new DatabaseException('getAll users');
    }
  }

  async findByNameAndSurname(
    firstName: string,
    surname: string,
  ): Promise<User[]> {
    try {
      const result = await this.db.query(queries.users.findByNameAndSurname, [
        `%${firstName.trim()}%`,
        `%${surname.trim()}%`,
      ]);
      return result.rows as User[];
    } catch (error) {
      throw new DatabaseException('findByNameAndSurname');
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

  async create(registerDto: RegisterDto): Promise<User> {
    try {
      const existsResult = await this.db.query(
        queries.users.checkEmailAndPhoneExist,
        [registerDto.email, registerDto.phone],
      );
      const { email_exists, phone_exists } = existsResult.rows[0];

      if (email_exists) {
        throw new UserAlreadyExistsException(registerDto.email);
      }

      if (phone_exists) {
        throw new DatabaseException('Phone number already exists');
      }

      const password_hash = await bcrypt.hash(registerDto.password, 12);

      const result = await this.db.query(queries.users.create, [
        registerDto.email,
        registerDto.phone,
        password_hash,
        registerDto.document_type,
        registerDto.document_number,
        registerDto.township_id || null,
        1,
        registerDto.first_name || null,
        registerDto.middle_name || null,
        registerDto.surname || null,
        registerDto.second_surname || null,
        registerDto.birthdate || null,
        registerDto.company_name || null,
      ]);

      return result.rows[0] as User;
    } catch (error: any) {
      console.error('Error creating user:', error);

      if (
        error instanceof UserAlreadyExistsException ||
        error instanceof DatabaseException
      ) {
        throw error;
      }

      if (error.message?.includes('already exists')) {
        throw new DatabaseException(
          'User with this email, phone, or document number already exists',
        );
      }

      if (error.message?.includes('Company name is required')) {
        throw new DatabaseException(
          'Company name is required for legal entities',
        );
      }

      if (error.message?.includes('First name and surname are required')) {
        throw new DatabaseException(
          'First name and surname are required for natural persons',
        );
      }

      throw new DatabaseException(`create user: ${error.message}`);
    }
  }

  async update(uuid: string, data: UpdateUserDto): Promise<User> {
    try {
      const passwordHash = data.password
        ? await bcrypt.hash(data.password, 12)
        : null;

      const result = await this.db.query(queries.users.update, [
        data.email ?? null,
        data.phone ?? null,
        passwordHash,
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

  async delete(uuid: string): Promise<User> {
    try {
      const result = await this.db.query(queries.users.delete, [uuid]);

      if (result.rows.length === 0) {
        throw new UserNotFoundException(uuid);
      }

      return result.rows[0] as User;
    } catch (error) {
      if (error instanceof UserNotFoundException) {
        throw error;
      }
      throw new DatabaseException('delete user');
    }
  }

  async emailExists(email: string): Promise<boolean> {
    try {
      const result = await this.db.query(queries.users.checkEmailExists, [
        email,
      ]);
      return result.rows[0].exists;
    } catch (error) {
      throw new UserAlreadyExistsException('check email exists');
    }
  }

  async phoneExists(phone: string): Promise<boolean> {
    try {
      const result = await this.db.query(queries.users.checkPhoneExists, [
        phone,
      ]);
      return result.rows[0].exists;
    } catch (error) {
      throw new UserAlreadyExistsException('check phone exists');
    }
  }
}
