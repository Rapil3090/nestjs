import { CreateDateColumn, UpdateDateColumn, VersionColumn } from "typeorm";


export class BaseTable {

    @CreateDateColumn()
    createAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @VersionColumn()
    version: number;

}