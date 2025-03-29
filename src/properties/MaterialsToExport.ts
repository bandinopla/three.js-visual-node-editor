import { TextLabel } from "../components/TextLabel";
import { Row } from "../layout/Layout";
import { Input } from "./Input";

export class MaterialsToExport extends Input {
    constructor() {
        super(5);
        this.layout = new Row([
            new TextLabel("Materials used")
        ])
    }
}