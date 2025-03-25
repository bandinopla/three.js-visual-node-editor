 
import { Theme } from "../colors/Theme";
import { Button } from "../components/Button";
import { ImagePreview } from "../components/ImagePreview";
import { Layout } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { Input } from "./Input"; 

export class TextureProperty extends Input {

    private initial : Layout;
    private _imageDisplayLayout : Layout;
 
    private _fileName?:string; 

    private imgPreview:ImagePreview;


    constructor() {
        super( Theme.config.vec4 )

        this.initial = new Layout("row", "start", "stretch", [
            new Button("+ File", ()=>this.onSelectFileFromDisk().then( file=>file && this.onFileSelected(file)) ),
            new Button("+ URL" ), 
        ], 10);

        this.imgPreview = new ImagePreview();

        this._imageDisplayLayout = new Layout("column","start","stretch", [

            new Layout("row","space-around","center", [

                this.imgPreview, 
                new Button("X", ()=>this.reset() ), 

            ] )

        ],10);

        this.initial.parent = this; 
        this._imageDisplayLayout.parent = this;

        this.layout = this.initial;
        this.singleLine = false;
    } 

    protected async onSelectFileFromDisk() { 
        return new Promise<File|null>((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*'; // Restrict to image files
            input.style.display = 'none';
        
            input.addEventListener('change', (event: Event) => {
                const target = event.target as HTMLInputElement;
                if (target.files && target.files.length > 0) 
                {
                    resolve(target.files[0]); // Resolve with the selected file
                } 
                else 
                {
                    resolve(null); // Resolve with null if no file selected
                }
            
                // Clean up: Remove the input element after use
                document.body.removeChild(input);
            });
        
            document.body.appendChild(input);
            input.click(); // Trigger the file selection dialog
        }); 
    }

    protected onFileSelected( file:File )
    {
        this._fileName = file.name;
 
        const reader = new FileReader();

        reader.onload = e => {
            const dataURL = e.target!.result as string; // dataURL is a string 
            
            this.imgPreview.show( dataURL );
            this.layout = this._imageDisplayLayout;
    
        };

        reader.readAsDataURL(file);
    }

    protected reset() {
        this.imgPreview.reset();
        this.layout = this.initial;
    }
 
}