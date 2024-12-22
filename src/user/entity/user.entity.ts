import { Exclude } from "class-transformer";
import { Movie } from "src/movie/entity/movie.entity";
import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";


export enum Role {
    admin,
    paidUser,
    user,
}

@Entity()
export class User extends BaseEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
    })
    email: string;

    @Column()
    @Exclude({
        toPlainOnly: true,
    })
    password: string;

    @Column({
        enum: Role,
        default: Role.user,
    })
    role: Role;

    @OneToMany(
        () => Movie,
        (movie) => movie.creator,
    )

    createdMovies: Movie [];


}
