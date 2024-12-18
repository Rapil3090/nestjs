import { IsInt, IsOptional, IsString } from "class-validator";
import { CursorPageinationDto } from "src/common/dto/cursor.pagination.dto";
import { PagePageinationDto } from "src/common/dto/page-pageination.dto";

export class GetMoviesDto extends CursorPageinationDto {

    @IsString()
    @IsOptional()
    title?: string;
}