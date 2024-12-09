import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';

@Injectable()
export class MovieService {
  create(createMovieDto: CreateMovieDto) {
    return 'This action adds a new movie';
  }

  private movies: Movie[] = [];

  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,

    @InjectRepository(MovieDetail)
    private readonly movieDetailRepository: Repository<MovieDetail>,
  ){}

  getManyMovies(title?: string) {

    if(!title) {
      return this.movieRepository.find();
    }

    return this.movieRepository.find({
      where: {
        title: Like(`%${title}%`),
      }
    });
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail']
    });
  }

  async createMovie(createMovieDto: CreateMovieDto) {

    const movieDetail = await this.movieDetailRepository.save({
      detail: createMovieDto.detail,
    });

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre, 
      detail: movieDetail,
    });

    return movie;
  }


  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {

    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail']
    });

    if(!movie) {
      throw new NotFoundException('존재하지 않는 ID의 영화입니다');
    }

    const {detail, ...movieRest} = updateMovieDto;

    await this.movieRepository.update(
      {id},
      movieRest,
    );

    if(detail) {
      await this.movieDetailRepository.update(
        {
          id: movie.detail.id,
        },
        {
          detail,
        }
      )
    }

    const newMovie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail']
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
    await this.movieDetailRepository.delete(movie.detail.id);

    return id;
  }

}
