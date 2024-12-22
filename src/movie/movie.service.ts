import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { Movie } from './entity/movie.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Like, QueryRunner, Repository } from 'typeorm';
import { MovieDetail } from './entity/movie-detail.entity';
import { Director } from 'src/director/entity/director.entity';
import { Genre } from 'src/genre/entity/genre.entity';
import { error } from 'console';
import { GetMoviesDto } from './dto/get-movies.dto';
import { CommonService } from 'src/common/common.service';
import { join } from 'path';
import { rename } from 'fs/promises';
import { User } from 'src/user/entity/user.entity';
import { MovieUserLike } from './entity/movie-user-like.entitty';

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

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(MovieUserLike)
    private readonly movieUserLikeRepository: Repository<MovieUserLike>,

    private readonly dateSourec: DataSource,

    private readonly commonService: CommonService,
  ){}

  async getManyMovies(dto: GetMoviesDto, userId?: number) {

    const { title } = dto;

    const qb = await this.movieRepository.createQueryBuilder('movie')
    .leftJoinAndSelect('movie.director', 'director')
    .leftJoinAndSelect('movie.genres', 'genres');

    if (title) {
      qb.where('movie.title LIKE :title', {title: `%${title}%`})
    }

    const {nextCursor} = await this.commonService.applyCursorPaginationParamsToQb(qb, dto);
  
    let [data, count] = await qb.getManyAndCount();

    if(userId) {
      const movieIds = data.map(movie => movie.id);

      const likedMovies = movieIds.length < 1 ? [] : await this.movieUserLikeRepository.createQueryBuilder('mul')
      .leftJoinAndSelect('mul.user', 'user')
      .leftJoinAndSelect('mul.movie', 'movie')
      .where('movie.id IN(:...movieIds)', { movieIds })
      .andWhere('user.id = :userId', { userId })
      .getMany();

      const likedMovieMap = likedMovies.reduce((acc, next) => ({
        ...acc,
        [next.movie.id]: next.isLike,
      }), {});

      data = data.map((x) => ({
        ...x,
        likeStatus: x.id in likedMovieMap ? likedMovieMap[x.id] : null,
      }))
    }

    return {
      data,
      nextCursor,
      count,
    }
  }

  async getMovieById(id: number) {
    const movie = await this.movieRepository.findOne({
      where: {
        id,
      },
      relations: ['detail', 'director', 'genres']
    });
  }

  async createMovie(createMovieDto: CreateMovieDto, userId:number,  qr: QueryRunner) {
  
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

      const movieDetail = await qr.manager.createQueryBuilder()
      .insert()
      .into(MovieDetail)
      .values({
        detail: createMovieDto.detail,
      })
      .execute();

      const movieDetailId = movieDetail.identifiers[0].id;

      const movieFolder = join('public', 'movie');
      const tempFolder = join('public', 'temp');

      const movie = await qr.manager.createQueryBuilder()
      .insert()
      .into(Movie)
      .values({
        title: createMovieDto.title,
        detail: {
          id: movieDetailId,
        },
        director,
        creator: {
          id: userId,
        },
        movieFilePath: join(movieFolder, createMovieDto.movieFileName),
      })
      .execute();

      const movieId = movie.identifiers[0].id;

      await qr.manager.createQueryBuilder()
      .relation(Movie, 'genres')
      .of(movieId)
      .add(genres.map(genre => genre.id));

      await rename(
        join(process.cwd(), tempFolder, createMovieDto.movieFileName),
        join(process.cwd(), movieFolder, createMovieDto.movieFileName),
      )

      return await qr.manager.findOne(Movie, {
        where: {
          id: movieId,
        },
        relations: ['detail', 'director', 'genres'],
      });
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

  
  async deleteMovieById(id: number) {
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

  async toggleMovieLike(movieId: number, userId: number, isLike: boolean) {

    const movie = await this.movieRepository.findOne({
      where: {
        id: movieId,
      }
    });

    if(!movie) {
      throw new BadRequestException('존재하지 않는 영화입니다');
    }

    const user = await this.userRepository.findOne({
      where: {
        id: userId,
      }
    })

    if(!user) {
      throw new UnauthorizedException('사용자 정보가 없습니다');
    }

    const likeRecord = await this.movieUserLikeRepository.createQueryBuilder('mul')
    .leftJoinAndSelect('mul.movie', 'movie')
    .leftJoinAndSelect('mul.user', 'user')
    .where('movie.id = :movieId', { movieId })
    .andWhere('user.id = :userId', { userId })
    .getOne();

    if(likeRecord) {
      if(isLike === likeRecord.isLike) {
        await this.movieUserLikeRepository.delete({
          movie,
          user,
        });
      } else {
        await this.movieUserLikeRepository.update({
          movie,
          user,
        }, {

          isLike,
        })
      }
    } else{
        await this.movieUserLikeRepository.save({
          movie,
          user,
          isLike,
        });
    }

    const result = await this.movieUserLikeRepository.createQueryBuilder('mul')
    .leftJoinAndSelect('mul.movie', 'movie')
    .leftJoinAndSelect('mul.user', 'user')
    .where('movie.id = :movieId', { movieId })
    .andWhere('user.id = :userId', { userId })
    .getOne();

    return {
      isLike: result && result.isLike,
    }

  }


}
