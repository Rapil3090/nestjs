import { IsInt, IsOptional } from "class-validator";

export class PagePageinationDto {

    @IsInt()
    @IsOptional()
    page: number = 1;

    @IsInt()
    @IsOptional()
    take: number = 5;
    
}