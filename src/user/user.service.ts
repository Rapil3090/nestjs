import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  create(createUserDto: CreateUserDto) {

    const createUser = this.userRepository.save(createUserDto);

    return createUserDto;
  }

  findAll() {
    return this.userRepository.find()
  }

  findOne(id: number) {
    const user = this.userRepository.findOne({
      where: {
        id,
      }
    });

    if(!user) {
      throw new NotFoundException('회원을 찾을 수 없습니다');
    }

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    
    const user = await this.userRepository.findOne({
      where: {
        id,
      }
    });

    if(!user) {
      throw new NotFoundException('회원을 찾을 수 없습니다');
    }

    await this.userRepository.update(
      {
        id,
      },
        updateUserDto,
    );

    const newUser= await this.userRepository.findOne(
      {
        where: {
          id,
        },
      });
    
    return newUser;
  }

  remove(id: number) {
    return this.userRepository.delete(id);
  }
}
