import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';

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

    @InjectRepository(Director)
    private readonly directorRepository: Repository<Director>,
  ){}

  async getManyMovies(title?: string) {

    if(!title) {
      return [ await this.movieRepository.find({
        relations: ['director'],
      }), await this.movieRepository.count()];
    }

    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['director'],
    });
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director']
    });
  }

  async createMovie(createMovieDto: CreateMovieDto) {

    const movieDetail = await this.movieDetailRepository.save({
      detail: createMovieDto.detail,
    });

    const director = await this.directorRepository.findOne({
      where: {
        id: createMovieDto.directorId,
      },
    });

    if(!director) {
      throw new NotFoundException('해당 아이디의 감독이 없습니다.')
    }

      

    const movie = await this.movieRepository.save({
      title: createMovieDto.title,
      genre: createMovieDto.genre, 
      detail: movieDetail,
      directorId: createMovieDto.directorId,
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

    const {detail, directorId, ...movieRest} = updateMovieDto;

    let newDirector;

    if(directorId) {
      const director = this.directorRepository.findOne({
        where: {
          id: directorId,
        }
      });

      if(!director) {
        throw new NotFoundException('존재하지 않는 감독 ID 입니다')
      }

      newDirector = director;
    }

    const movieUpdateFields = {
      ...movieRest,
      ...(newDirector && {director: newDirector})
    }

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
