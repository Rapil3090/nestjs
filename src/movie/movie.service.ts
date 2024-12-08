import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entities/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class MovieService {
  create(createMovieDto: CreateMovieDto) {
    return 'This action adds a new movie';
  }

  private movies: Movie[] = [];

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>
  ){}

  getManyMovies(title?: string) {

    return this.movieRepository.find();
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      }
    });
  }

  async createMovie(createMovieDto: CreateMovieDto) {

    const movie = await this.movieRepository.save(createMovieDto);

    return movie;
  }


  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {

    const movie = await this.movieRepository.findOne({
      where: {
        id,
      }
    });

    if(!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다');
    }

    await this.movieRepository.update(
      {id},
      updateMovieDto,
    );

    const newMovie = await this.movieRepository.findOne({
      where: {
        id,
      }
    });

    return movie;
  }

  
  async deleteMovie(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      }
    });

    if(!movie) {
      throw new NotFoundException('존재하지 않는 ID 입니다');
    }

    await this.movieRepository.delete(id);

    return id;
  }

}
