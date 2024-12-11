import { PartialType } from '@nestjs/mapped-types';
import { CreateMovieDto } from './create-movie.dto';
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';


enum MovieGenre {
    Fantasy = 'fantasy',
    Action = 'action',
}

export class UpdateMovieDto {

    @IsNotEmpty()
    @IsString()
    @IsOptional()
    title: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {
        each: true,
    })
    @IsOptional()
    genreIds?: number[];

    @IsNotEmpty()
    @IsOptional()
    detail?: string;

    @IsNotEmpty()
    @IsNumber()
    @IsOptional()
    directorId?: number;
}
