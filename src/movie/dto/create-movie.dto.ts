import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMovieDto {

    @IsNotEmpty()
    @IsString()
    title: string;

    @IsString()
    @IsNotEmpty()
    detail: string;
    
    @IsNumber()
    @IsNotEmpty()
    directorId: number;

    @IsArray()
    @ArrayNotEmpty()
    @IsNumber({}, {
        each: true,
    })
    @Type(() => Number)
    genreIds: number[];

    @IsString()
    movieFileName: string;
}
