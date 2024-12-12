import { BaseTable } from "src/common/entity/base-table.entity";
import { MovieDetail } from "src/movie/entity/movie-detail.entity";
import { Movie } from "src/movie/entity/movie.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class Director extends BaseTable {


    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column()
    dob: Date;

    @Column()
    nationality: string;

    @OneToOne(
        () => MovieDetail,
        movieDetail => movieDetail.id,
        {
            cascade: true,
            nullable: false,
        }
    )
    @JoinColumn()
    detail: MovieDetail;

    @OneToMany(
        () => Movie,
        movie => movie.director,
    )
    movies: Movie[];
}


