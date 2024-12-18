import { Injectable } from "@nestjs/common";
import { SelectQueryBuilder } from "typeorm";
import { PagePageinationDto } from "./dto/page-pageination.dto";
import { CursorPageinationDto as CursorPaginationDto } from "./dto/cursor.pagination.dto";

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

    applyCursorPaginationParamsToQb<T>(qb: SelectQueryBuilder<T>, dto: CursorPaginationDto) {

        const {order, take, id} = dto;

        if(id) {
            const direction = order === 'ASC' ? '>' : '<';

            qb.where(`${qb.alias}.id ${direction} :id`, {id});
        }

        qb.orderBy(`${qb.alias}.id`, order);

        qb.take(take);
    }
}