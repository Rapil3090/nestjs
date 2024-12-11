import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateDirectorDto } from './dto/create-director.dto';
import { UpdateDirectorDto } from './dto/update-director.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Director } from './entity/director.entity';
import { Repository } from 'typeorm';
import { NotFoundError } from 'rxjs';

@Injectable()
export class DirectorService {

  constructor(
    @InjectRepository(Director)
    private readonly direcetorRepository: Repository<Director>,
  ){

  }

  create(createDirectorDto: CreateDirectorDto) {
    return this.direcetorRepository.save(createDirectorDto);
  }

  findAll() {
    return this.direcetorRepository.find();
  }

  findOne(id: number) {
    return this.direcetorRepository.findOne({
      where: {
        id},
    });
  }

  async update(id: number, updateDirectorDto: UpdateDirectorDto) {
    const director = await this.direcetorRepository.findOne({
      where: {
        id,
      }  
    });

    if(!director) {
      throw new NotFoundException('감독을 찾을 수 없습니다');
    }

    await this.direcetorRepository.update(
      {
        id,
      },
      {
        ...updateDirectorDto,
      }
  );

  const newDirector = await this.direcetorRepository.findOne(
    {
      where: {
        id,
      },
    });
    
    return newDirector;
  }

  remove(id: number) {
    return this.direcetorRepository.delete(id);
  }
}
