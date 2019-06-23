import { Typegoose, prop } from 'typegoose';

class User extends Typegoose {
    @prop()
    tag: string;

    @prop()
    id: string;

    @prop()
    isolation: {
        isolated: boolean;
        roles: Array<string>;
    }
}

export default new User().getModelForClass(User);