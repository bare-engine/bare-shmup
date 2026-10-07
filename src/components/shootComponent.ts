import { Bare, Component, Dropdown, Helper, InspectorButton, Limit, SerializeField } from "bare-engine";
import { ArcadeObject } from "bare-engine/arcade";
import { Data } from "../generated/assets";
import { Decimal } from "../../../BareEngine/src/utils/decorators";

export class ShootComponent extends Component
{
    @SerializeField
    @Limit(0)
    @Decimal(2)
    shootInterval: number = .5;

    @SerializeField
    @Dropdown(Bare.data.prefabs)
    entityNameSpawn: string = "bullet";

    @SerializeField
    isPlayer: boolean = false;

    count: number = 0;

    override OnUpdate(delta: number): void
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
        var vecNorm = Helper.PointTowards(this.go.rotation - 90);
        var bullet = bScene.AddGameObject<ArcadeObject>(this.entityNameSpawn, this.isPlayer ? Data.Layer.BULLETS_PLAYER : Data.Layer.BULLETS_ENEMY);
        
        var p = vecNorm.mul(25).add(this.go.position);
        bullet.SetPosition(p.x, p.y);

        var speed = (this.isPlayer ? 1000 : 200);
        var vec = vecNorm.mul(speed);
        bullet.SetVelocity(vec);

        bullet.SetRotation(this.go.rotation);
    }
}