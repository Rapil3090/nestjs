import { IsArray, IsIn, IsInt, IsOptional, IsString } from "class-validator";

export class CursorPageinationDto {

    @IsInt()
    @IsOptional()
    cursor?: string;

    @IsArray()
    @IsString({
        each: true,
    })
    @IsOptional()
    order: string[] = ['id_DESC'];
    

    @IsInt()
    @IsOptional()
    take: number = 5;


}