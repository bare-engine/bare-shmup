import { Color, Component, FlashShader, GameObject, TweenTo, SerializeField, GameMode } from "bare-engine";

export class AliveComponent extends Component
{
    @SerializeField(GameMode.Play)
    health: number = 0;

    @SerializeField
    maxHealth: number = 10;

    healthbarWidth: number = 16;
    healthbarAlpha:number = 0;
    
    override OnAdded(): void
    {
        // IF HEALTH WAS NOT SET BY INSPECTOR OR SAVE VALUE, SET IT TO MAX
        if (this.health == 0)
            this.health = this.maxHealth;
        
        // ENSURE HEALTH IS NOT GREATER THAN MAX, CAN HAPPEN WHEN INSPECTOR OR SAVE SETS MAX HEALTH
        //this.health = Math.min(this.health, this.maxHealth);
    }

    override OnCollisionStart(collidingObject: GameObject): void
    {
        this.OnHit(1, collidingObject);
    }

    override OnPostRender(): void
    {
        if (this.healthbarAlpha == 0)
           return;

        var bounds = this.go.GetBounds();
        var x = bounds.x + bounds.width / 2 - this.healthbarWidth / 2;
        var y = bounds.y - 5;
        
        var colorWhite = Color.White.clone();
        var colorRed = Color.Red.clone();
        colorWhite.a = this.healthbarAlpha * 255;
        colorRed.a = this.healthbarAlpha * 255;
        rapid.drawRect({x: x, y: y, width: this.healthbarWidth, height: 2, color: colorWhite});
        rapid.drawRect({x: x, y: y, width: this.healthbarWidth * this.health / this.maxHealth, height: 2, color: colorRed}); 
    }

    override async OnHit(damage: number, hitter: GameObject): Promise<void>
    {
        if (hitter.name == "bullet")
            hitter.Remove();

        this.go.AddShader(FlashShader);
        
        this.health -= damage;
        if (this.health <= 0)
        {
            bare.component.CallMethodOnComponentsOfObject("OnDie", this.go);
            this.health = 0;
        }
        else
        {
            // SHOW HEALTHBAR, THEN HIDE
            // persistent FIELD IS NEEDED, SO THE TWEEN IS NOT KILLED ON SCENE CHANGE
            // SAME GOES FOR THE WAIT
            TweenTo(this, .2, { healthbarAlpha: 1, persistent: true });
            if (!await this.scene.Wait(.5, true))
                return;
            TweenTo(this, .2, { healthbarAlpha: 0, persistent: true });
        }
    }
    
    override OnDie(): void
    {
        this.go.scene.AddGameObject("explosion")
            .SetPosition(this.go.position.x, this.go.position.y);

        bare.events.emit("died", this.go);
        
        this.go.Remove();
    }
}
