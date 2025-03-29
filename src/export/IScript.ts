import { Script } from "./Script"; 

export interface IScript {

    /**
     * Writing a script means something will be added that will have a name. Like a variable or a function or whatever...
     * This function must add whatever and return the name of the thing that was added so others can reference whatever was written here...
     * @param script 
     */
    writeScript( script:Script ):string
}