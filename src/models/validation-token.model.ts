import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('validationTokens')
class ValidationToken {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('text', { nullable: false })
    token: string;

    @Column('text', { nullable: false })
    email: string;

    @Column('datetime', { nullable: false })
    validateTokenTime: Date;

    @Column('datetime', { nullable: false })
    createdAt: Date;

    @Column('boolean', { nullable: false })
    validated: boolean;
}

export default ValidationToken;
