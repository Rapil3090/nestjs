import { Injectable } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { PagePageinationDto } from "./dto/page-pageination.dto";

@Injectable()
export class CommonService {
    constructor(

    ){}

    applyPagePaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: PagePageinationDto) {
        const {page, take} = dto;
        
        const skip = (page -1) * take;

        qb.take(take);
        qb.skip(skip);
    }
}