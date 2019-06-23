import { Typegoose, prop } from 'typegoose';

class User extends Typegoose {
    @prop()
    tag: string;

    @prop()
    id: string;

    @prop()
    isolation: {
        isolated: boolean;
        isolatedRoles: Array<string>;
    }
}

export default new User().getModelForClass(User);