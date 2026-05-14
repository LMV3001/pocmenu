export class Point {
    public x: number;
    public y: number;
    public z: number;

    constructor(x: number, y: number, z: number = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    public to2D(focale : number, canvasWidth: number, canvasHeight: number): {x: number, y: number} {
        const scale = focale / (focale + this.z);
        const x2D = this.x * scale + canvasWidth / 2;
        const y2D = this.y * scale + canvasHeight / 2;
        return {x: x2D, y: y2D};
    }

    public rotateX(angle: number): void {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const y = this.y * cosAngle - this.z * sinAngle;
        const z = this.y * sinAngle + this.z * cosAngle;
        this.y = y;
        this.z = z;
    }

    public rotateY(angle: number): void {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const x = this.x * cosAngle + this.z * sinAngle;
        const z = -this.x * sinAngle + this.z * cosAngle;
        this.x = x;
        this.z = z;
    }

    public rotateZ(angle: number): void {
        const cosAngle = Math.cos(angle);
        const sinAngle = Math.sin(angle);
        const x = this.x * cosAngle - this.y * sinAngle;
        const y = this.x * sinAngle + this.y * cosAngle;
        this.x = x;
        this.y = y;
    }

    public rotate(rotation: {x: number, y: number, z: number}): void {
        this.rotateX(rotation.x);
        this.rotateY(rotation.y);
        this.rotateZ(rotation.z);
    }
}