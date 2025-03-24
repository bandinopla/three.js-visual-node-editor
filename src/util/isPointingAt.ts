/*
Interpretation:
1 → The direction is perfectly pointing at the target. 
0 → The direction is perpendicular to the target. 
-1 → The direction is exactly opposite to the target.
*/
export function calculateDirectionAlignment( dirX:number, dirY:number, targetX:number, targetY:number, originX:number, originY:number ) {
    // Direction vector (must be normalized)
    const magV = Math.hypot(dirX, dirY);
    const vX = dirX / magV;
    const vY = dirY / magV;

    // Vector to target (normalized)
    const toTargetX = targetX - originX;
    const toTargetY = targetY - originY;
    const magT = Math.hypot(toTargetX, toTargetY);
    const tX = toTargetX / magT;
    const tY = toTargetY / magT;

    // Dot product
    return vX * tX + vY * tY; // Cosine of the angle
}