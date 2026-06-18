import { AnimationComponent, BareEvent, Color, Events, GameObject, InspectorButton, InspectorField, Int, Scene, StartBare, TextureFilterMode, Vec2 } from 'bare-engine';
import { ArcadeObject, ArcadePhysicsController } from 'bare-engine/arcade';
import settingsDataJson from '../public/data/settingsData.json';
import { Data } from './generated/assets';
import { InspectorClass } from '../../BareEngine/src/utils/decorators';

declare module "bare-engine"
{
    interface Component
    {
        OnHit?(damage: number, hitter: GameObject): void | Promise<void>
        OnDie?(): void
    }
}

export class Game extends Scene
{
    ship: ArcadeObject;
    
    private skipNextLockedMouseMove = false;
    private readonly maxPointerMove = 32;

    @InspectorField
    @Int
    enemySpawnInterval: int = 20;

    constructor()
    {
        bare.AddClass(ArcadePhysicsController);
        bare.AddClass(AnimationComponent);

        super(settingsDataJson);
    }

    OnAwake()
    {
        bare.events.persistent.on(BareEvent.pointer_move, this.OnPointerMove.bind(this));
        bare.events.persistent.on(BareEvent.pointer_down, this.ToggleMouseLock.bind(this));

        bare.events.persistent.on("died", this.OnDie.bind(this));
    }

    async OnDie(go: ArcadeObject)
    {
        if (go.name == "ship")
        {
            await wait(1.5);
            bare.Restart();
        }
    }

    OnStart()
    {
        this.ship = this.AddGameObject<ArcadeObject>(Data.Entity.SHIP, Data.Layer.PLAYER)
            .SetPosition(bare.width * .5, bare.height * .5);
    }

    OnFixedUpdate(fixedDeltaTime: number): void
    {
        if (bare.count % this.enemySpawnInterval == 0)
        {
            this.SpawnEnemy();
        }
    }

    @InspectorButton
    SpawnEnemy()
    {
        this.AddGameObject<ArcadeObject>(Data.Entity.ENEMY1, Data.Layer.ENEMIES)
            .SetPosition(bare.width * Math.random(), 0)
            .SetRotation(-180)
            .SetVelocityXY(0, 100);
    }

    async ToggleMouseLock({ }: Events['pointer_down'])
    {
        if (document.pointerLockElement === rapid.canvas)
        {
            this.skipNextLockedMouseMove = false;
            document.exitPointerLock();
            return;
        }

        this.skipNextLockedMouseMove = true;
        await rapid.canvas.requestPointerLock();
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

StartBare(Game, {
    backgroundColor: Color.fromHex("#def4f4"),
    antiAlias: false,
    textureFilter: TextureFilterMode.NEAREST,
    resolution: { pixelScale: 3 }
});
