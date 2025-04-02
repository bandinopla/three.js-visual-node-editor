 
import { Button } from "../components/Button";
//import { ImagePreview } from "../components/ImagePreview";
import { TextLabel } from "../components/TextLabel"; 
import { Layout, Row } from "../layout/Layout";
import { LayoutElement } from "../layout/LayoutElement"; 

export class TextureProperty extends LayoutElement {

    private initial : Layout;
    private overwritten : Layout;
    private _imageDisplayLayout : Layout; 
    private currentLoadedImage? : {
        url:string,
        mime:string,
        dispose:VoidFunction
    };
 
    /**
     * The path/url used to load the image. In case of a file selected from disk this will only be the filename.
     */
    private _filePath?:string; 

    private _imageSrc?:string;
    private _isFromDisk = false;
    get isFromDisk() { return this._isFromDisk }

    //private imgPreview:ImagePreview;
    private filenameLabel:TextLabel;

    get imagePath() {
        return this._filePath;
    }

    get imageSrc() { return this._imageSrc; }
    set src( imageSrc:string ) {
        this.loadImage( imageSrc )
    }

    get imageType() {
        return this.currentLoadedImage?.mime;
    }


    constructor() {
        super()

        //"row", "start", "stretch",
        this.initial = new Layout( [
            new Button("+ File", ()=>this.onSelectFileFromDisk().then( file=>file && this.onFileSelected(file)) ),
            new Button("+ URL", ()=>this.askUserForUrl() ), 
        ], {
            gap:0,
            justify:"space-around" 
        });

        //this.imgPreview = new ImagePreview();
        this.filenameLabel = new TextLabel("");

        //"column","start","stretch",
        this._imageDisplayLayout = new Layout( [

            //"row","space-around","center",
            new Layout( [

                this.filenameLabel, 
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

        //this.overwritten.xPadding = 10

        this.initial.parent = this; 
        this._imageDisplayLayout.parent = this;

        this.layout = this.initial; 
        this.singleLine=true
    } 

    protected async onSelectFileFromDisk() { 
        return new Promise<File|null>((resolve) => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*,.exr,image/x-exr'; // Restrict to image files
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
            const arrayBuffer = e.target!.result as ArrayBuffer;
            // Create a Blob from the ArrayBuffer
            const imageBlob = new Blob([arrayBuffer], { type: file.type }); // Use original file type

            // Create an Object URL from the Blob
            const imageURL = URL.createObjectURL(imageBlob);

            this.currentLoadedImage = {
                url: imageURL,
                mime: file.type,
                dispose: ()=>URL.revokeObjectURL(imageURL)
            }
            //image/x-exr 

            this.loadImage( imageURL );
        };

        reader.onerror = (e) => {
            console.error("FileReader error:", e);
            alert("Oops! Error loading the image...")
        };

        reader.readAsArrayBuffer(file);
    }

    protected loadImage( url:string ) {

        this._imageSrc = url;
        //this.imgPreview.show( url );
        this.filenameLabel.label = this.imagePath!;

        this.layout = this._imageDisplayLayout;
        this.singleLine = false;

        this.root.update()
    }

    protected askUserForUrl() {
        const url = prompt("Paste image url to load from... Beware of CORS policy: If the other domain doesn't allow it the image will look black.","http://");

        if(!url || url=="") return;

        //TODO: Valudate url....

        this._isFromDisk = true;
        this._filePath = url; 

        this.loadImage( url );
    }
 

    protected reset() {

        this.dispose();

        // this.imgPreview.reset();
        this.layout = this.initial;
        this.singleLine = true;

        this.root.update()
    }

    dispose() {
        this.currentLoadedImage?.dispose();
        this.currentLoadedImage = undefined;
    }
 
}