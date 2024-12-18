import { IsInt, IsOptional, IsString } from "class-validator";
import { PagePageinationDto } from "src/common/dto/page-pageination.dto";

export class GetMoviesDto extends PagePageinationDto {

    @IsString()
    @IsOptional()
    title?: string;
}