import { Controller, Get, Post, Body, Patch, Param, Delete, ClassSerializerInterceptor, UseInterceptors, ParseIntPipe, Query, Request, UseGuards, UploadedFile, BadRequestException } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation-pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entity/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';
import { TransactionInterceptor } from 'src/common/interceptor/tracsaction.interceptor';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Movie } from './entity/movie.entity';
import { UserId } from 'src/user/decorator/user-id.decorator';
import { QueryRunner } from 'src/common/decorator/query-runner.decorator';
import { QueryRunner as QR } from 'typeorm';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}


  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  createdMovie(
    @Body() body: CreateMovieDto,
    // @Request() req,
    @QueryRunner() queryRunner: QR,
    @UserId() userId: number,
    ) {

    return this.movieService.createMovie(
      body,
      userId,
      // req.queryRunner,
      queryRunner,
    );
  }

  @Get()
  @Public()
  getMovies( 
    @Query() dto: GetMoviesDto,
    @UserId() userId?: number,
  ) {

  return this.movieService.getManyMovies(dto, userId);
  }

  @Get(':id')
  @Public()
  getMovieById(@Param('id', ParseIntPipe ) id:number ) {

    return this.movieService.getMovieById(id);
  }

  @Patch(':id')
  @RBAC(Role.admin)
  patchMovieById(@Param('id', ParseIntPipe ) id:number, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.updateMovie(id, updateMovieDto);
  }

  @Delete(':id')
  @RBAC(Role.admin)
  deleteMovieById(@Param('id', ParseIntPipe ) id: number) {
    return this.movieService.deleteMovieById(id);
  }

  @Post(':id/like')
  createMovieLike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, true);
  }


  @Post(':id/dislike')
  createMovieDislike(
    @Param('id', ParseIntPipe) movieId: number,
    @UserId() userId: number,
  ) {
    return this.movieService.toggleMovieLike(movieId, userId, false);
  }

}
