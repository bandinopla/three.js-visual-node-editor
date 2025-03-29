 
import { Theme } from "../colors/Theme";
import { Button } from "../components/Button";
import { ImagePreview } from "../components/ImagePreview";
import { TextLabel } from "../components/TextLabel";
import { IOutlet } from "../core/IOutlet";
import { Layout, Row } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement";
import { Input } from "./Input"; 

export class TextureProperty extends LayoutElement {

    private initial : Layout;
    private overwritten : Layout;
    private _imageDisplayLayout : Layout; 
 
    /**
     * The path/url used to load the image. In case of a file selected from disk this will only be the filename.
     */
    private _filePath?:string; 

    private _imageSrc?:string;
    private _isFromDisk = false;
    get isFromDisk() { return this._isFromDisk }

    private imgPreview:ImagePreview;

    get imagePath() {
        return this._filePath;
    }

    get imageSrc() { return this._imageSrc; }


    constructor() {
        super()

        //"row", "start", "stretch",
        this.initial = new Layout( [
            new Button("+ File", ()=>this.onSelectFileFromDisk().then( file=>file && this.onFileSelected(file)) ),
            new Button("+ URL" ), 
        ], {
            gap:10,
            align:"stretch"
        });

        this.imgPreview = new ImagePreview();

        //"column","start","stretch",
        this._imageDisplayLayout = new Layout( [

            //"row","space-around","center",
            new Layout( [

                this.imgPreview, 
                new Button("X", ()=>this.reset() ), 

            ], {
                justify:"space-around",
                align:"center"
            } )

        ],{
            gap: 10,
            direction:"column",
            align:"stretch"
        }); 

        this.overwritten = new Row([
            new TextLabel("Texture Data")
        ] );

        this.overwritten.xPadding = 10

        this.initial.parent = this; 
        this._imageDisplayLayout.parent = this;

        this.layout = this.initial; 
        this.singleLine=true
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
        this._isFromDisk = true;
        this._filePath = file.name;
 
        const reader = new FileReader();

        reader.onload = e => {
            const dataURL = e.target!.result as string; // dataURL is a string 
            
            this.loadImage( dataURL );
        };

        reader.readAsDataURL(file);
    }

    protected loadImage( url:string ) {

        this._imageSrc = url;
        this.imgPreview.show( url );
        this.layout = this._imageDisplayLayout;
        this.singleLine = false;

        this.root.update()
    }
 

    protected reset() {
        this.imgPreview.reset();
        this.layout = this.initial;
        this.singleLine = true;

        this.root.update()
    }
 
}