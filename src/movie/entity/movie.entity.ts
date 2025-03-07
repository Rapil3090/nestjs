import { Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, VersionColumn } from "typeorm";
import { BaseTable } from "../../common/entity/base-table.entity";
import { MovieDetail } from "./movie-detail.entity";
import { Director } from "src/director/entity/director.entity";
import { Genre } from "src/genre/entity/genre.entity";
import { Transform } from "class-transformer";
import { User } from "src/user/entity/user.entity";
import { MovieUserLike } from "./movie-user-like.entitty";


@Entity()
export class Movie extends BaseTable {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    title: string;

    @ManyToMany(
        () => Genre,
        genre => genre.movies,
    )
    @JoinTable()
    genres: Genre[];

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

    @ManyToOne(
        () => Director,
        director => director.id,
        {
            cascade: true,
            nullable: false,
        }
    )
    director: Director;

    @Column({
        default: 0,
    })
    likeCount: number;

    @Column()
    @Transform(({value}) => `http:/localhost:3000/${value}`)
    movieFilePath: string;

    @ManyToOne(
        () => User,
        (user) => user.createdMovies,
    )

    creator: User;

    @OneToMany(
        ()=> MovieUserLike,
        (mul) => mul.movie,
    )
    likedUsers: MovieUserLike[];
}