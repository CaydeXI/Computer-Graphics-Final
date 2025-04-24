#version 330 core

uniform vec2 iResolution;
uniform float iTime;
uniform int iFrame;
in vec2 fragCoord;              /* screen space coordinate */
out vec4 outputColor;           /* output color */

uniform sampler2D tex_buzz; 

in vec3 vtx_pos; // [-1, 1]
in vec2 vtx_uv; // [0, 1]

out vec4 frag_color;

#define NUM_STAR 100.
#define Gravity 0.7
#define NUM_SHOOTING_STARS 20
#define RAINDROPS 5000
#define DURATION 2.0

const vec2 g = vec2(.0, -Gravity); /* gravity */

float hash1d(float t)
{
    t += 1.;
    return fract(sin(t * 674.3) * 453.2);
}
// return random vec2 between 0 and 1
vec2 hash2d(float t)
{
    t += 1.;
    float x = fract(sin(t * 674.3) * 453.2);
    float y = fract(sin((t + x) * 714.3) * 263.2);

    return vec2(x, y);
}

vec3 renderParticle(vec2 uv, vec2 pos, float brightness, vec3 color)
{
    float d = length(uv - pos);
    return brightness / d * color;
}

vec3 renderStars(vec2 uv)
{
    vec3 fragColor = vec3(0.0);

    float t = iTime;
    for(float i = 0.; i < NUM_STAR; i++)
    {
        vec2 pos = hash2d(i) * 2. - 1.; // map to [-1, 1]
        float brightness = .0015;
        brightness *= sin(1.5 * t + i) * .6 + .6; // flicker
        vec3 color = vec3(0.15, 0.71, 0.92);

        fragColor += renderParticle(uv, pos, brightness, color);
    }

    return fragColor;
}

vec2 moveParticle(vec2 initPos, vec2 initVel, float t)
{
    vec2 currentPos = initPos;

    /* your implementation starts */
    currentPos += (initVel * t);

    /* your implementation ends */

    return currentPos;
}

vec3 shootingStars(vec2 uv) {
    vec3 fragColor = vec3(0.0);

    float t = iTime;

    for (float i = 0.0; i < NUM_SHOOTING_STARS; i++) {
        float startTime = i * 0.7;

        if (t > startTime) {
            vec2 initPos = hash2d(i) + vec2(hash1d(i) * 15.0 + 5.0, 3.0);
            vec2 initVel = vec2(hash1d(i) - 6.0, hash1d(i) - 2.0);

            float pTime = mod(t + i, 2.0);
            vec2 currPos = moveParticle(initPos, initVel, pTime);

            float brightness = 0.004 * abs(pTime / DURATION);
            vec3 color = vec3(1.0, 0.8, 0.6);

            fragColor += renderParticle(uv, currPos, brightness, color);
        }
    }

    return fragColor;
}

vec3 rain(vec2 uv) {
    vec3 fragColor = vec3(0.0);

    float t = iTime;

    for (float i = 0.0; i < RAINDROPS; i++) {
        float startTime = i * 0.7;

        if (t > startTime) {
            // Evenly space the raindrops horizontally
            float xSpacing = mod(hash1d(i) * t, 20.0) / 10.0; // Spacing between -1.0 to 1.0
            float yOffset = floor(i / 20.0) * 0.1;            // Slight offset for layered rain
        
            // Calculate initial position
            vec2 initPos = vec2(xSpacing, 1.0 + yOffset);

            // Adjust position to loop when the particle goes off-screen
            vec2 initVel = vec2(-0.5, -0.7);                  // Speed of falling raindrops
            float pTime = mod(t + i * 0.1, DURATION);         // Modulate time for looping effect
            vec2 currPos = moveParticle(initPos, initVel, pTime);

            float brightness = 0.0004 * abs(pTime / DURATION);
            vec3 color = vec3(1.0);

            fragColor += renderParticle(uv, currPos, brightness, color);
        }
    }

    return fragColor;
}

void main()
{
    vec3 outputColor = renderStars(vtx_pos.xy) + shootingStars(vtx_pos.xy) + rain(vtx_pos.xy);

    vec2 uv = vec2(vtx_uv.x, -vtx_uv.y);
    vec3 buzzColor = texture(tex_buzz, uv).xyz;
    buzzColor = vec3(0.0);

    // Info for shooting stars

    frag_color = vec4(mix(outputColor, buzzColor, (sin(iTime) + 1) * .5 * .2), 1.0);
}