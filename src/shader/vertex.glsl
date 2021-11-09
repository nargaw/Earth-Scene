varying vec2 vUv;
varying vec3 vPos;
varying vec2 vCoordinates;
attribute vec3 aCoordinates;

uniform float u_time;

void main()
{
    vUv=uv;
    vec3 stable=position;

    vec4 mvPosition=modelViewMatrix*vec4(position,1.);
    mvPosition.y+=sin(u_time+mvPosition.x*5.);
    mvPosition.x+=sin(u_time+mvPosition.z*5.);
    mvPosition.z+=sin(u_time+mvPosition.z*5.);
    gl_PointSize=180.*(1./-mvPosition.z);
    gl_Position=projectionMatrix*mvPosition;

    vCoordinates=aCoordinates.xy;
}