import { ArcadePhysicsController, BareEvent, Events, GameObject, Scene, StartBare, TextureFilterMode, Vec2 } from 'bare-engine';
import settingsDataJson from '../public/data/settingsData.json';

export class Game extends Scene
{
    ship: GameObject;
    
    private skipNextLockedMouseMove = false;
    private readonly maxPointerMove = 32;
    
    constructor()
    {
        bare.AddClass(ArcadePhysicsController)
        
        super(settingsDataJson);
    }

    OnAwake()
    {
        events.persistent.on(BareEvent.pointer_move, this.OnPointerMove.bind(this));
        events.persistent.on(BareEvent.pointer_down, this.ToggleMouseLock.bind(this));
    }

    async ToggleMouseLock({ isLeftButton }: Events['pointer_down'])
    {
        if (!isLeftButton)
            return;

        if (document.pointerLockElement === rapid.canvas)
        {
            this.skipNextLockedMouseMove = false;
            document.exitPointerLock();
            return;
        }

        this.skipNextLockedMouseMove = true;
        await rapid.canvas.requestPointerLock();
    }

    OnStart()
    {
        this.ship = this.AddGameObject('ship')
            .SetPosition(bare.width * .5, bare.height * .5)
            .CenterPivot()
            .SetScale(4);
    }

    OnPointerMove({ movedX, movedY }: Events['pointer_move'])
    {
        if (document.pointerLockElement !== rapid.canvas)
            return;

        if (this.skipNextLockedMouseMove)
        {
            this.skipNextLockedMouseMove = false;
            return;
        }

        const movement = this.ClampPointerMove(movedX, movedY, this.maxPointerMove);
        this.ship.position = this.ship.position.add(movement);
    }

    private ClampPointerMove(movedX: number, movedY: number, max: number): Vec2
    {
        const movement = new Vec2(movedX, movedY);
        const scale = Math.min(1, max / movement.length());

        return movement.mul(scale);
    }
}

StartBare(Game, {antiAlias: false, textureFilter: TextureFilterMode.NEAREST});
