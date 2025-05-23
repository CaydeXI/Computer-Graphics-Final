#version 330 core

/*default camera matrices. do not modify.*/
layout(std140) uniform camera
{
    mat4 projection;	/*camera's projection matrix*/
    mat4 view;			/*camera's view matrix*/
    mat4 pvm;			/*camera's projection*view*model matrix*/
    mat4 ortho;			/*camera's ortho projection matrix*/
    vec4 position;		/*camera's position in world space*/
};

/* set light ubo. do not modify.*/
struct light
{
	ivec4 att; 
	vec3 pos; // position
	vec4 dir;
	vec3 amb; // ambient intensity
	vec3 dif; // diffuse intensity
	vec3 spec; // specular intensity
	vec4 atten;
	vec4 r;
};
layout(std140) uniform lights
{
	vec4 amb;
	ivec4 lt_att; // lt_att[0] = number of lights
	light lt[4];
};

/*input variables*/
in vec3 vtx_normal; // vtx normal in world space
in vec3 vtx_position; // vtx position in world space
in vec3 vtx_model_position; // vtx position in model space
in vec4 vtx_color;
in vec2 vtx_uv;
in vec3 vtx_tangent;

uniform vec3 ka;            /* object material ambient */
uniform vec3 kd;            /* object material diffuse */
uniform vec3 ks;            /* object material specular */
uniform float shininess;    /* object material shininess */

uniform sampler2D tex_color;   /* texture sampler for color */
uniform sampler2D tex_normal;   /* texture sampler for normal vector */

/*output variables*/
out vec4 frag_color;

vec3 shading_texture_with_phong(light li, vec3 e, vec3 p, vec3 s, vec3 n)
{

    // vec3 ka = materials[matId].ka;
    // vec3 kd = materials[matId].kd;
    // vec3 ks = materials[matId].ks;
    // float shininess = materials[matId].shininess;
    
    /* your implementation starts */

    vec3 l = normalize(s-p);
    float dotted = dot(l,n);
    float maximum1 = max(0, dotted);


    vec3 v = normalize(p-e); // From eye to position
    vec3 l2 = normalize(s-p); // light to position
    vec3 r = reflect(l2,n);

    float maximum2 = max(0, dot(v,r));


    vec3 color = vec3(li.amb * ka + kd * li.dif * maximum1+ ks * li.spec * pow(maximum2, shininess));
	
    
	return color;
}

vec3 read_normal_texture()
{
    vec3 normal = texture(tex_normal, vtx_uv).rgb;
    normal = normalize(normal * 2.0 - 1.0);
    return normal;
}

void main()
{
    vec3 e = position.xyz;              //// eye position
    vec3 p = vtx_position;              //// surface position
    vec3 N = normalize(vtx_normal);     //// normal vector
    vec3 T = normalize(vtx_tangent);    //// tangent vector

    light li = light(
        ivec4(1, 1, 1, 1),
        vec3(0, 1, 1),
        vec4(0, 0, 0, 0),
        vec3(0.4, 0.4, 0.4),
        vec3(0.8, 0.8, 0.8),
        vec3(0.4, 0.4, 0.4),
        vec4(1, 1, 1, 1),
        vec4(1, 1, 1, 1)
    );

    // vec3 texture_normal = read_normal_texture();
    // vec3 texture_color = texture(tex_color, vtx_uv).rgb;

    // frag_color = vec4(texture_color.rgb, 1.0);

    frag_color = vec4(shading_texture_with_phong(li, e, p, li.pos, N), 1);
}