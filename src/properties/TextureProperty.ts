 
import { Theme } from "../colors/Theme";
import { Button } from "../components/Button";
import { Layout } from "../layout/Layout";
import { Input } from "./Input"; 

export class TextureProperty extends Input {

    private initial : Layout;

    constructor() {
        super( Theme.config.vec4 )

        this.initial = new Layout("row", "start", "stretch", [
            new Button("+ File" ),
            new Button("+ From URL" ), 
        ], 10)
    }

    override render(ctx: CanvasRenderingContext2D, maxWidth: number, maxHeight: number): void 
    {
        
        this.initial.render( ctx, maxWidth, maxHeight );

        super.render(ctx, maxWidth, maxHeight);
    }
 
}