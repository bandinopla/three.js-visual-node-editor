export type FillStyle = CanvasFillStrokeStyles["fillStyle"];

export class Theme {
    private static theme:Theme;

    static get config() {
        if( !Theme.theme )
        {
            Theme.theme = new Theme()
        }
        return Theme.theme;
    }

    readonly fontSize = 12;
    readonly nodeRowHeight = 20;
    readonly nodeBorderRadius = 5;
    readonly nodeMargin = 10;

    readonly selectionBoxColor = "white";

    readonly fontFamily:string = "Arial"; //https://developer.mozilla.org/en-US/docs/Web/CSS/font-family

    readonly nodeWinBgColor : FillStyle = "#303030";

    readonly vec4 : FillStyle = "#63c763";
    readonly vec3 : FillStyle = "#c7c729";
    readonly vec1 : FillStyle = "#cccccc";
    readonly vec2 : FillStyle = "#6363c7";
    readonly materialOutputSocketColor:FillStyle = "#bf4a06";

    readonly groupTexture : FillStyle = "#79461d";
    readonly groupVector : FillStyle = "#3c3c83";
    readonly groupMath : FillStyle = "#246283";
    readonly groupInput : FillStyle = "#83314a";
    readonly groupOutput : FillStyle = "#3c1d26";
    readonly groupAttribute:FillStyle = "#83314a";
    readonly groupShader:FillStyle = "#2b652b";

    readonly barBgColor : FillStyle = "#545454";
    readonly barFillColor : FillStyle = "#4772b3";
    readonly barTextColor : FillStyle = "white";

    readonly textColor : FillStyle = "white";
    readonly borderColor : FillStyle = "black";

    readonly btnBgColor : FillStyle = "#545454"
    readonly btnTextColor : FillStyle = "white"

    readonly comboboxBgColor : FillStyle = "#282828"
    readonly comboboxTextColor: FillStyle = "white";
    readonly comboboxOptionsBgColor : FillStyle = "#181818"
    readonly comboSelectedItemBgColor : FillStyle = "#4772b3"
    readonly comboSelectedItemTextColor : FillStyle = "white"
}