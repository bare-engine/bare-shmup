import { Component, InspectorField } from "bare-engine";
import { Bullet } from "../objects/bullet";

export class ShootComponent extends Component
{
    @InspectorField
    shootInterval: number = .5;

    @InspectorField
    entityNameSpawn: string = "bullet";

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

    Shoot()
    {
        var bullet = bScene.AddGameObject(this.entityNameSpawn) as Bullet;
        bullet.SetPosition(this.go.position.x, this.go.position.y - 50);
        bullet.SetVelocityXY(0, -1000)
    }
}