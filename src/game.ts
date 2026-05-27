import { GameObject, Scene, StartBare, TextureFilterMode } from 'bare-engine';
import settingsDataJson from '../public/data/settingsData.json';

export class Game extends Scene
{
    obj: GameObject;
    
    constructor()
    {
        super(settingsDataJson);
    }

    OnStart()
    {
        this.obj = this.AddGameObject('ships/ship_0000')
            .SetPosition(bare.width * .5, bare.height * .5)
            .CenterPivot()
            .SetScale(4);
    }
}

StartBare(Game, {antiAlias: false, textureFilter: TextureFilterMode.NEAREST});