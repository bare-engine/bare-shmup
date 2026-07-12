import { AnimationComponent, BareEvent, Color, Events, GameObject, Inspector, InspectorField, Scene, StartBare, TextComponent, TextureFilterMode, Vec2 } from 'bare-engine';
import { ArcadeObject, ArcadePhysicsController } from 'bare-engine/arcade';
import settingsDataJson from '../public/data/settingsData.json';
import { Data } from './generated/assets';

export class Game extends Scene
{
    ship: ArcadeObject;
    
    private skipNextLockedMouseMove = false;
    private readonly maxPointerMove = 32;

    @InspectorField
    @Inspector.Int
    enemySpawnInterval: int = 20;

    @Inspector.Class
    watcher = new Watcher(this);

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
        if (go.name == Data.Entity.PLAYER)
        {
            await wait(1.5);
            bare.Restart();
        }
    }

    OnStart()
    {
        this.ship = this.AddGameObject<ArcadeObject>(Data.Entity.PLAYER, Data.Layer.PLAYER)
            .SetPosition(bare.width * .5, bare.height * .5);
    }

    OnFixedUpdate(fixedDeltaTime: number): void
    {
        if (bare.count % this.enemySpawnInterval == 0)
        {
            this.SpawnEnemy();
        }
    }

    @Inspector.Button
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

declare module "bare-engine"
{
    interface Component
    {
        OnHit?(damage: number, hitter: GameObject): void | Promise<void>
        OnDie?(): void
    }
}

class Watcher
{
    constructor(private scene: Scene) {}

    @InspectorField
    get enemies():int { return this.scene.object.GetLayer(Data.Layer.ENEMIES).length }

    @InspectorField
    get bullets():int { return this.scene.object.GetLayer(Data.Layer.BULLETS_ENEMY).length + this.scene.object.GetLayer(Data.Layer.BULLETS_PLAYER).length }
}

StartBare(Game, {
    backgroundColor: Color.fromHex("#def4f4"),
    antiAlias: false,
    textureFilter: TextureFilterMode.NEAREST,
    resolution: { pixelScale: 3 }
});


