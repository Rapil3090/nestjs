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

@Controller('movie')
@UseInterceptors(ClassSerializerInterceptor)
export class MovieController {
  constructor(private readonly movieService: MovieService) {}


  @Post()
  @RBAC(Role.admin)
  @UseInterceptors(TransactionInterceptor)
  @UseInterceptors(FileInterceptor('movie', {
    limits: {
      fileSize: 2000000,
    },
    fileFilter(req, file, callback) {
      if (file.mimetype !== 'video/mp4') {
        return callback(new BadRequestException('MP4타입만 업로드 가능합니다'), false)
      }
      return callback(null, true);
    }
  }))
  @UseGuards(AuthGuard)
  createdMovie(
    @Body() body: CreateMovieDto,
    @Request() req,
    @UploadedFile() movie?: Express.Multer.File,
    ) {

    return this.movieService.createMovie(
      body,
      movie.filename,
      req.queryRunner,
    );
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
