/*****************************************Pre Compile**********************************************/

#define version 460

/***************************************************************************************************/

/*****************************************Vertex Output*********************************************/

varying mat4 PV;
varying vec3 localpos;

/**************************************************************************************************/

/*****************************************Shader Entry*********************************************/

void main()
{
    PV = projectionMatrix * modelViewMatrix;
    localpos = position;

    gl_Position = PV * vec4(position, 1.0);
}

/**************************************************************************************************/