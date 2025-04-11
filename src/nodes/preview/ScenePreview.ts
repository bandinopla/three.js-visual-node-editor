import { Theme } from '../../colors/Theme';
import { DraggableValue } from '../../components/DraggableValue';
import { MaterialProperty } from '../../properties/MaterialProperty';
import { WinNode } from '../WinNode';
import { ThreeScene } from '../../ThreeScene';
import { Script } from '../../export/Script';
import { ComboBox } from '../../components/ComboBox';
import { MeshBasicMaterial } from 'three';

export class ScenePreviewNode extends WinNode {
    protected materialSlots: MaterialProperty[];

    protected ambientLightSlider: DraggableValue;
    protected rotationSpeedSlider: DraggableValue;
    protected objTypeCombo: ComboBox;
    protected errorMaterial: MeshBasicMaterial;
    protected updateWaitInterval = 0;

    constructor(protected scene: ThreeScene) {
        const ambientLightSlider = new DraggableValue(
            'Ambient light',
            true,
            0,
            3,
            0.1,
            (value) => this.onAmbientLightSlider(value),
        );
        const rotationSpeedSlider = new DraggableValue(
            'Rotation speed',
            true,
            0,
            2,
            0.1,
            (value) => (scene.rotationSpeed = value),
        );
        const objType = new ComboBox(
            'Object',
            scene.meshes.map((m) => m.name),
            (value) => (scene.currentObjectIndex = value),
        );

        const materialSlots = [
            new MaterialProperty(0),
            // new MaterialProperty(1),
            // new MaterialProperty(2),
        ];

        super('Scene Preview', Theme.config.groupOutput, [
            ambientLightSlider,
            rotationSpeedSlider,
            objType,

            ...materialSlots,
        ]);

        this.canBeDeleted = false;
        this.materialSlots = materialSlots;

        this.ambientLightSlider = ambientLightSlider;
        this.rotationSpeedSlider = rotationSpeedSlider;
        this.objTypeCombo = objType;

        ambientLightSlider.value = this.scene.ambientLight.intensity;
        rotationSpeedSlider.value = this.scene.rotationSpeed;
        objType.index = this.scene.currentObjectIndex;

        this.errorMaterial = new MeshBasicMaterial({ color: 0xff0000 });

        scene.addEventListener('modelLoaded', () => {
            objType.updateOptions(scene.meshes.map((m) => m.name));
        });
    }

    protected onAmbientLightSlider(intensity: number) {
        this.scene.ambientLight.intensity = intensity;
    }

    override update(): void {
        clearInterval(this.updateWaitInterval);

        this.updateWaitInterval = setTimeout(() => {
            this.compileMaterialAndAdd(0);
        }, 400);
    }

    protected compileMaterialAndAdd(materialIndex: number) {
        const slot = this.materialSlots[materialIndex];

        if (!slot.connectedTo) {
            this.scene.setMaterial(materialIndex, undefined);
            return;
        }

        const script = new Script();

        try {
            const materialRef = slot.writeScript(script);

            console.log(script.toString('', false));

            const material = script.eval(materialRef + '()');

            this.scene.setMaterial(materialIndex, material);
        } catch (error) {
            console.error(error);
            this.scene.setMaterial(materialIndex, this.errorMaterial);
        }
    }

    override serialize(): Record<string, any> {
        return {
            ...super.serialize(),
            ambientLight: this.ambientLightSlider.value,
            rotationSpeed: this.rotationSpeedSlider.value,
            objType: this.objTypeCombo.index,
        };
    }

    override unserialize(data: Record<string, any>): void {
        super.unserialize(data);

        this.ambientLightSlider.value = data.ambientLight ?? 1;
        this.rotationSpeedSlider.value = data.rotationSpeed ?? 1;
        this.objTypeCombo.index = data.objType ?? 0;
    }
}
