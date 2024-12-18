import { Controller, Get, Post, Body, Patch, Param, Delete, ClassSerializerInterceptor, UseInterceptors, ParseIntPipe, Query, Request, UseGuards } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation-pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Public } from 'src/auth/decorator/public.decorator';
import { RBAC } from 'src/auth/decorator/rbac.decorator';
import { Role } from 'src/user/entity/user.entity';
import { GetMoviesDto } from './dto/get-movies.dto';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}


  @Post()
  @RBAC(Role.admin)
  @UseGuards(AuthGuard)
  createdMovie(@Body() createMovieDto: CreateMovieDto) {

    return this.movieService.createMovie(createMovieDto);
  }

  @Get()
  @Public()
  getMovies(
    @Query() dto: GetMoviesDto,
  ) {

  return this.movieService.getManyMovies(dto);
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
    return this.deleteMovieById(id);
  }



}
