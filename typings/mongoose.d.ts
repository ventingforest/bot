import * as mongoose from 'mongoose';

declare module 'mongoose' {
    interface ConnectionOptions {
        /** Flag for using new Server Discovery and Monitoring engine instead of current (deprecated) one */
        useUnifiedTopology?: boolean;
    }
}