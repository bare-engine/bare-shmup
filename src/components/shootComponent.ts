import { Bare, Component, Helper, InspectorButton, InspectorField } from "bare-engine";
import { ArcadeObject } from "bare-engine/arcade";
import { Data } from "../generated/assets";

export class ShootComponent extends Component
{
    @InspectorField
    shootInterval: number = .5;

    @InspectorField
    //entityNameSpawn: string = "bullet";

    @InspectorField
    entityNameSpawn = {
        get: () => this._entityNameSpawn,
        set: (entityNameSpawn: string) => this._entityNameSpawn = entityNameSpawn,
        values: () => Bare.data.entities // MAKES IT A DROPDOWN
    };

    _entityNameSpawn: string = "bullet";

    @InspectorField
    isPlayer: boolean = false;

    count: number = 0;

    OnUpdate(delta: number): void
    {
        this.count += delta;
        if (this.count > this.shootInterval)
        {
            this.Shoot();
            this.count = 0;
        }
    }

    @InspectorButton
    Shoot()
    {
        var vecNorm = Helper.PointTowards(this.go.rotation + 90);
        var bullet = bScene.AddGameObject<ArcadeObject>(this._entityNameSpawn, this.isPlayer ? Data.Layer.BULLETS_PLAYER : Data.Layer.BULLETS_ENEMY);
        
        var p = vecNorm.mul(25).add(this.go.position);
        bullet.SetPosition(p.x, p.y);

        var speed = (this.isPlayer ? 1000 : 200);
        var vec = vecNorm.mul(speed);
        bullet.SetVelocity(vec);

        bullet.SetRotation(this.go.rotation);
    }
}