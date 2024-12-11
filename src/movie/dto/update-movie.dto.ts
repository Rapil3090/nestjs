import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';
import { IsNotEmpty, IsOptional } from 'class-validator';


enum MovieGenre {
    Fantasy = 'fantasy',
    Action = 'action',
}

export class UpdateMovieDto {

    @IsNotEmpty()
    @IsOptional()
    title: string;

    @IsNotEmpty()
    @IsOptional()
    genre: string;

    @IsNotEmpty()
    @IsOptional()
    detail?: string;

    @IsNotEmpty()
    @IsOptional()
    directorId?: number;
}
