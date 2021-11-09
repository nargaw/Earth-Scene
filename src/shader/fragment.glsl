precision highp float;

uniform sampler2D u_texture1;
uniform sampler2D u_texture2;
uniform sampler2D u_texture3;

uniform float u_time;

varying vec2 vUv;

void main(){
    vec3 color;
    vec4 textureOne = texture2D(u_texture1, vUv);
    vec4 textureTwo = texture2D(u_texture2, vUv);
    vec4 textureThree=texture2D(u_texture3, vUv);
    color = textureThree.rgb - textureTwo.rgb ;
    color += textureTwo.rgb;
    // color *= textureTwo.rgb;
    float distanceToCenter=distance(gl_PointCoord,vec2(100.0));
    float strength=5.5/distanceToCenter-.05*10.25;
    //color = textureOne * textureTwo;
    gl_FragColor = vec4(color.rgb, strength);
}