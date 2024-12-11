import { BaseTable } from "src/common/entity/base-table.entity";
import { Movie } from "src/movie/entity/movie.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Genre extends BaseTable {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique:true
    })
    name: string;

    @ManyToMany(
        () => Movie,
        movie => movie.genres,
        {
            cascade: true,
            nullable: false,
        }
    )
    movies: Movie[];
}
