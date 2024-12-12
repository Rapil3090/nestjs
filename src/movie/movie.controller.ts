import { Controller, Get, Post, Body, Patch, Param, Delete, ClassSerializerInterceptor, UseInterceptors, ParseIntPipe, Query } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieTitleValidationPipe } from './pipe/movie-title-validation-pipe';

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}


  @Post()
  createdMovie(@Body() createMovieDto: CreateMovieDto) {

    return this.movieService.createMovie(createMovieDto);
  }

  @Get()
  getMovies(
    @Query('title', MovieTitleValidationPipe) title?: string,
  ) {

  return this.movieService.getManyMovies(title);
  }

  @Get(':id')
  getMovieById(@Param('id', ParseIntPipe ) id:number ) {

    return this.movieService.getMovieById(id);
  }

  @Patch(':id')
  patchMovieById(@Param('id', ParseIntPipe ) id:number, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.updateMovie(id, updateMovieDto);
  }

  @Delete(':id')
  deleteMovieById(@Param('id', ParseIntPipe ) id: number) {
    return this.deleteMovieById(id);
  }



}
