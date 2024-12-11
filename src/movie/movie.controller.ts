import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MovieService } from './movie.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

@Controller('movie')
export class MovieController {
  constructor(private readonly movieService: MovieService) {}


  @Post()
  createdMovie(@Body() createMovieDto: CreateMovieDto) {

    return this.movieService.createMovie(createMovieDto);
  }

  @Get()
  getMovies() {

  return this.movieService.getManyMovies();
  }

  @Get(':id')
  getMovieById(@Param('id') id:number ) {

    return this.movieService.getMovieById(id);
  }

  @Patch(':id')
  patchMovieById(@Param('id') id:number, @Body() updateMovieDto: UpdateMovieDto) {
    return this.movieService.updateMovie(id, updateMovieDto);
  }



}
