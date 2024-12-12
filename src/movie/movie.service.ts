import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { error } from 'console';

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

    @InjectRepository(Genre)
    private readonly genreRepository: Repository<Genre>,

    private readonly dateSourec: DataSource,
  ){}

  async getManyMovies(title?: string) {

    if(!title) {
      return [ await this.movieRepository.find({
        relations: ['director', 'genres'],
      }), await this.movieRepository.count()];
    }

    return this.movieRepository.findAndCount({
      where: {
        title: Like(`%${title}%`),
      },
      relations: ['director', 'genres'],
    });
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres']
    });
  }

  async createMovie(createMovieDto: CreateMovieDto) {

    const qr = this.dateSourec.createQueryRunner();
    qr.connect();
    qr.startTransaction();

    try {
      
  
      const director = await qr.manager.findOne(Director, {
        where: {
          id: createMovieDto.directorId,
        },
      });
  
      if(!director) {
        throw new NotFoundException('해당 아이디의 감독이 없습니다.')
      }
  
      const genres = await qr.manager.find(Genre, {
        where: {
          id: In(createMovieDto.genreIds)
        },
      });
  
      if (genres.length !== createMovieDto.genreIds.length) {
        throw new NotFoundException(`존재하지 않는 장ㅡㅏ 있습니다. 존재하는 ids -> ${genres.map(genre => genre.id).join(',')}`);
      }
  
      // const movieDetail = await this.movieDetailRepository.save({
      //   detail: createMovieDto.detail,
      // });

      const movieDetail = await qr.manager.createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail: createMovieDto.detail,
      })
      .execute();


      // const movie = await this.movieRepository.save({
      //   title: createMovieDto.title,
      //   detail: {
      //     detail: createMovieDto.detail,
      //   },
      //   director,
      //   genres,
      // });

      const movieDetailId = movieDetail.identifiers[0].id;

      const movie = await qr.manager.createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: {
          id: movieDetailId,
        },
        director,
      })
      .execute();

      const movieId = movie.identifiers[0].id;

      await qr.manager.createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map(genre => genre.id));

      await qr.commitTransaction();

      return await this.movieRepository.findOne({
        where: {
          id: movieId,
        },
        relations: ['detail', 'director', 'genres'],
      });

      
    } catch (e) {
      await qr.rollbackTransaction();
      throw e;
    } finally {
      
      await qr.release();
    }

  }


  async updateMovie(id: number, updateMovieDto: UpdateMovieDto) {

    const qr = this.dateSourec.createQueryRunner()
    qr.connect();
    qr.startTransaction();

    try {
      const movie = await qr.manager.findOne(Director, {
        where: {
          id,
        },
        relations: ['detail']
      });
  
      if(!movie) {
        throw new NotFoundException('존재하지 않는 ID의 영화입니다');
      }
  
      const {detail, directorId, genreIds, ...movieRest} = updateMovieDto;
  
      let newDirector;
  
      if(directorId) {
        const director = qr.manager.findOne(Director, {
          where: {
            id: directorId,
          }
        });
  
        if(!director) {
          throw new NotFoundException('존재하지 않는 감독 ID 입니다')
        }
  
        newDirector = director;
      }
  
      let newGenres;
  
      if (genreIds) {
        const genres = await qr.manager.find(Genre, {
          where: {
            id: In(genreIds),
          },
        });
  
        if (genres.length !== updateMovieDto.genreIds.length) {
          throw new NotFoundException(`존재하지 않는 장ㅡㅏ 있습니다. 존재하는 ids -> ${genres.map(genre => genre.id).join(',')}`);
        }
  
        newGenres = genres;
      }
  
      const movieUpdateFields = {
        ...movieRest,
        ...(newDirector && {director: newDirector})
      }
  
      // await this.movieRepository.update(
      //   {id},
      //   movieRest,
      // );

      await qr.manager.createQueryBuilder()
      .update(Movie)
      .set(movieUpdateFields)
      .where('id = :id', {id})
      .execute()
  
      // if(detail) {
      //   await this.movieDetailRepository.update(
      //     {
      //       id: movie.detail.id,
      //     },
      //     {
      //       detail,
      //     }
      //   )
      // }

      if(detail) {
        await qr.manager.createQueryBuilder()
        .update(MovieDetail)
        .set({
          detail,
        })
        .where('id = :id', {id: movie.detail.id})
        .execute();
      }
  
      const newMovie = await qr.manager.findOne( Movie, {
        where: {
          id,
        },
        relations: ['detail', 'director']
      });
  
      newMovie.genres = newGenres;
  
      await this.movieRepository.save(newMovie);
  
      return this.movieRepository.findOne({
        where: {
          id,
        },
        relations: ['detail', 'director', 'genres']
      });

    } catch(e) {
      await qr.rollbackTransaction();
    } finally {
      await qr.release();
    }

    
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
