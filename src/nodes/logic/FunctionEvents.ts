import { IOutlet } from '../../core/IOutlet';

export type FunctionNodeEvents = {
    update: {};
    error: {
        outlet: IOutlet;
        message: string;
    };
};
