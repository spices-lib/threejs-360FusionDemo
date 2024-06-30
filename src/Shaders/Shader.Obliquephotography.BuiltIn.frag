/*****************************************Pre Compile**********************************************/

#define version 460
//vec4 t = texture2DLodEXT(obliquephotographyTexture, fragUV, 0);
#define FOV 90.0f

/***************************************************************************************************/

/*****************************************Fragment Input********************************************/

varying vec2 fragUV;      /* @brief Fragment Texture Coordinate */
varying mat4 PV;
varying vec3 localpos;

/**************************************************************************************************/

/**************************************Uniform Patameters******************************************/

uniform samplerCube _360TextureC;                     /* @brief Current 360 Texture */
uniform samplerCube _360TextureN;                     /* @brief Next 360 Texture */
uniform sampler2D obliquephotographyTexture;          /* @brief obliquephotography Texture */
uniform vec2 divSize;                                 /* @brief div size */
uniform mat4 view;                                    /* @brief camera view matrix */
uniform float fov;                                    /* @brief camera fov (degree) */
uniform float lerps;                                  /* @brief lerp between _360TextureC and _360TextureN */
uniform int colorMode;                                /* @brief obliquephotography color mode */

/**************************************************************************************************/

/******************************************Functions***********************************************/

/**
* @brief Sample a TextureCube use view direction.
* @param[in] samplerCube Texture Cube Sampler.
* @param[in] dir view direction (world space).
* @return returns the sampled color.
*/
vec3 SampleCubeByViewDirection(in samplerCube samp, in vec3 dir);

/**
* @brief Gamma Correction.
* @param[in] color the color needs to be corrected.
* @return returns the corredted color.
*/
vec3 GammaCorrection(in vec3 color);

/**************************************************************************************************/

/*****************************************Shader Entry*********************************************/

void main()
{
    if(colorMode == 0)
    {
        vec3 color = texture2D(obliquephotographyTexture, fragUV).xyz;
        gl_FragColor = vec4(color, 1.0f);
    }
    else if(colorMode == 1)
    {
        vec4 clipPos = PV * vec4(localpos, 1.0f);
        clipPos = clipPos / clipPos.w;

        vec2 uv = clipPos.xy * 0.5f;

        //vec3 dir = mat3(view) * (normalize(vec3(clipPos.x * tan(3.14f * FOV / 2.0f / 180.0f), clipPos.y * tan(3.14f * FOV / 2.0f / 180.0f)* divSize.y / divSize.x, 1.0f)));
        vec3 dir = mat3(view) * (normalize(vec3(clipPos.x * tan(fov / 2.0f), clipPos.y * tan(fov / 2.0f)* divSize.y / divSize.x, 1.0f)));

        vec3 color = SampleCubeByViewDirection(_360TextureC, dir);
        color = GammaCorrection(color);

        gl_FragColor = vec4(color, 1.0f);
    }
}

/**************************************************************************************************/

vec3 SampleCubeByViewDirection(in samplerCube samp, in vec3 dir)
{
    // sample uv
    vec3 samplePos;

    // +x
    vec3 pxplane = 0.5f * dir / dir.x;
    if(abs(pxplane.y) <= 0.5f && abs(pxplane.z) <= 0.5f && dir.x >= 0.0f) samplePos = pxplane;

    // -x
    vec3 nxplane = -0.5f * dir / dir.x;
    if(abs(nxplane.y) <= 0.5f && abs(nxplane.z) <= 0.5f && dir.x <= 0.0f) samplePos = nxplane;

    // +y
    vec3 pyplane = 0.5f * dir / dir.y;
    if(abs(pyplane.x) <= 0.5f && abs(pyplane.z) <= 0.5f && dir.y >= 0.0f) samplePos = pyplane;

    // -y
    vec3 nyplane = -0.5f * dir / dir.y;
    if(abs(nyplane.x) <= 0.5f && abs(nyplane.z) <= 0.5f && dir.y <= 0.0f) samplePos = nyplane;

    // +z
    vec3 pzplane = 0.5f * dir / dir.z;
    if(abs(pzplane.x) <= 0.5f && abs(pzplane.y) <= 0.5f && dir.z >= 0.0f)  samplePos = pzplane;

    // -z
    vec3 nzplane = -0.5f * dir / dir.z;
    if(abs(nzplane.x) <= 0.5f && abs(nzplane.y) <= 0.5f && dir.z <= 0.0f) samplePos = nzplane;

    // reverse z
    samplePos.z *= -1.0f;

    // sample cube
    return textureCube(samp, samplePos).xyz;
}

vec3 GammaCorrection(in vec3 color)
{
    vec3 outcolor = color;

    outcolor.x = pow(outcolor.x, 1.0f / 2.2f);
    outcolor.y = pow(outcolor.y, 1.0f / 2.2f);
    outcolor.z = pow(outcolor.z, 1.0f / 2.2f);

    return outcolor;
}