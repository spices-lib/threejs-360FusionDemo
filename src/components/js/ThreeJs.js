import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import {CSS3DRenderer} from "three/examples/jsm/renderers/CSS3DRenderer"
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import * as THREE from 'three'

import obliquephotographyVertShader from "@/Shaders/Shader.Obliquephotography.BuiltIn.vert?raw";
import obliquephotographyFragShader from "@/Shaders/Shader.Obliquephotography.BuiltIn.frag?raw";

import _360BoxVertShader from "@/Shaders/Shader.360Box.BuiltIn.vert?raw";
import _360BoxFragShader from "@/Shaders/Shader.360Box.BuiltIn.frag?raw";

import routeVertShader from "@/Shaders/Shader.Route.BuiltIn.vert?raw";
import routeFragShader from "@/Shaders/Shader.Route.BuiltIn.frag?raw";
import {FlyControls} from "three/addons";

/**
 * @brief App Global Run Time, and Clock.
 * */
var globalTime = 0.0
var clock = new THREE.Clock()

/**
 * @brief Three Scene.
 **/
const scene =  new THREE.Scene();

/**
 * @brief Obliquephotography Files identify.
 * Also texture identify.
 * Data from https://realsee.cn/wO22ylK6?theme=minimalist&unbranded=1, handled by Spiecs.
 * @attention Miss 01.
 * */
const obliquephotographyFilesId = ['02','03','04','05','06','07','08','09','10',
    '11','12','13','14','15','16','17','18','19','20',
    '21','22','23','24','25','26','27','28','29','30',
    '31','32','33'];

/**
 * @brief Roaming path in Obliquephotography.
 * Also texture identify.
 * Data from https://realsee.cn/wO22ylK6?theme=minimalist&unbranded=1, handled by Spiecs.
 * */
const routeFilesID = ['35','36'];

/**
 * @brief 360 Box.
 * Data from https://realsee.cn/wO22ylK6?theme=minimalist&unbranded=1, handled by Spiecs.
 * */
const _360FileID = '34';

/**
 * @brief Load one Obliquephotography by given id.
 * @param id Specific id.
 **/
function loadSingleObliquephotography(id) {

    // Load texture in local.
    let texturePath = "image/scene/" + id + ".png"
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(texturePath)

    // Load gltf model in local.
    let meshPath = "model/scene/" + id + ".gltf"
    const meshLoader = new GLTFLoader()

    meshLoader.load(meshPath, function(gltf) {

        // instance a custom shader material.
        let material = new THREE.ShaderMaterial({
            uniforms: {
                _360TextureC: { value: new THREE.CubeTexture() },      // 360 texture cube
                _360TextureN: { value: new THREE.CubeTexture() },      // 360 texture cube
                obliquephotographyTexture: { value: texture },         // gltf model texture
                divSize: { value: new THREE.Vector2(100, 100)},  // div size
                view: { value: new THREE.Matrix4() },                  // camera view matrix
                fov: { value: 45 },                                    // camera fov
                lerps: { value: 0},                                    // lerp between _360TextureC and _360TextureN
                colorMode: { value: 0 },                               // color mode highlevel - 0, lowlevel - 1
            },
            vertexShader: obliquephotographyVertShader,                // vertex shader
            fragmentShader: obliquephotographyFragShader,              // fragment shader
        })

        gltf.scene.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.material = material
            }
        });

        gltf.scene.name = 'Obliquephotography' + id              // set item name
        scene.add(gltf.scene);                                   // add to scene for render
    });
}

/**
 * @brief Load all Obliquephotography by obliquephotographyFilesId.
 **/
function loadFullObliquephotography() {

    obliquephotographyFilesId.forEach((el => {
        loadSingleObliquephotography(el)
    }))
}

/**
 * @brief Instance a 360Box in scene.
 * */
function load360Box(){

    // Load texture in local.
    const textureLoader = new THREE.CubeTextureLoader()
    textureLoader.setPath("image/360/01/")

    const textureCube = textureLoader.load([
        'PX.png', 'NX.png',
        'PY.png', 'NY.png',
        'PZ.png', 'NZ.png',
    ])

    // Instance a Box Mesh as 360Box.
    let _360Box = new THREE.BoxGeometry(20, 20, 100)

    // instance a custom shader material.
    let material = new THREE.ShaderMaterial({
        uniforms: {
            _360TextureC: { value: textureCube },                    // 360 texture cube
            _360TextureN: { value: textureCube },                    // 360 texture cube
            divSize: { value: new THREE.Vector2(100, 100)},    // div size
            view: { value: new THREE.Matrix4() },                    // camera view matrix
            fov: { value: 45 },                                      // camera fov
            opacity: { value: 1 },                                   // opacity, init with 0
            lerps: { value: 0},                                      // lerp between _360TextureC and _360TextureN
        },
        vertexShader: _360BoxVertShader,                             // vertex shader
        fragmentShader: _360BoxFragShader,                           // fragment shader
        side:THREE.BackSide,                                         // front face cull
    })
    material.transparent = true                                      // enable color blend

    let _360Obj = new THREE.Mesh(_360Box, material)
    _360Obj.position.set(5, -5, -30)
    _360Obj.name = '360'
    scene.add(_360Obj)
}

/**
 * @brief Load one Route by given id.
 * @param id Specific id.
 * */
function loadSingleRoute(id) {

    // Load texture in local.
    let texturePath = "image/other/" + id + ".png"
    const textureLoader = new THREE.TextureLoader()
    const texture = textureLoader.load(texturePath)

    // Set texture properties.
    texture.wrapS = THREE.RepeatWrapping         // set repeat in S(x)
    texture.wrapT = THREE.RepeatWrapping         // set repeat in T(y)

    // Load gltf model in local.
    let meshPath = "model/scene/" + id + ".gltf"
    const meshLoader = new GLTFLoader()

    meshLoader.load(meshPath, function(gltf) {

        // instance a custom shader material.
        let material = new THREE.ShaderMaterial({
            uniforms: {
                routeTexture: { value: texture },          // route texture
                time: { value: globalTime },               // global time
                id: { value: id === '35' ? 0 : 1 }         // route id
            },
            vertexShader: routeVertShader,                 // vertex shader
            fragmentShader: routeFragShader,               // fragment shader
            side:THREE.DoubleSide,                         // none face cull
        })
        material.transparent = true                        // enable color blend

        gltf.scene.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.material = material
            }
        });

        gltf.scene.name = 'Route' + id                      // set item name
        scene.add(gltf.scene);                              // add to scene for render
    });
}

/**
 * @brief Load all Routes by routeFilesID.
 * */
function loadFullRoute() {

    routeFilesID.forEach((el => {
        loadSingleRoute(el)
    }))
}

/**
 * @brief Updade time to shaders in need.
 * @param t Time.
 * */
function updateShaderTime(t) {

    // Shader.Route.BuiltIn
    routeFilesID.forEach((el => {
        var obj = scene.getObjectByName('Route' + el)
        if(obj !== undefined)
        {
            obj.children[0].material.uniforms.time.value = t
        }
    }))
}

/**
 * @brief update div size to shaders in need.
 * @param size The div size, type is THREE.Vector2
 * */
function updateShadeDivSize(size) {

    // Shader.360Box.BuiltIn
    var obj = scene.getObjectByName('360')
    if(obj !== undefined)
    {
        obj.material.uniforms.divSize.value = size
    }

    // Shader.Obliquephotography.BuiltIn
    obliquephotographyFilesId.forEach((el => {
        var obj = scene.getObjectByName('Obliquephotography' + el)
        if(obj !== undefined)
        {
            obj.children[0].material.uniforms.divSize.value = size
        }
    }))

}

/**
 * @brief update camera view matrix to shaders in neeed.
 * @param view camera's new view matrix.
 * @param fov camera's new fov.
 * */
function updateShaderView(view, fov) {

    // Shader.360Box.BuiltIn
    var obj = scene.getObjectByName('360')
    if(obj !== undefined)
    {
        obj.material.uniforms.view.value = view
        obj.material.uniforms.fov.value = fov
    }

    // Shader.Obliquephotography.BuiltIn
    obliquephotographyFilesId.forEach((el => {
        var obj = scene.getObjectByName('Obliquephotography' + el)
        if(obj !== undefined)
        {
            obj.children[0].material.uniforms.view.value = view
            obj.children[0].material.uniforms.fov.value = fov
        }
    }))
}

export default class ThreeJs{

    constructor(id) {
        this.id = id;
        this.dom=document.getElementById(id);
    }

    /**
     * @name 初始化控制器
     * @author shaoqunchao
     * @date 2024/1/18 13:05
     * @description 轨道控制器，可以使得相机围绕目标进行轨道运动
     * @param enableZoom 设置控制器是否可以缩放，默认为true。
     * @param autoRotate 设置是否自动旋转，默认为false。
     * @param enableDamping 设置控制器阻尼，让控制器更有真实效果，默认为false。
     * @param dampingFactor 设置控制器阻尼系数，让控制器更有真实效果，默认为0。
     * @param minDistance 设置控制器最小距离，默认为1。
     * @param maxDistance 设置控制器最大距离，默认为300。
     * @param minAzimuthAngle 设置控制器最小旋转角度，默认为0。
     * @update 2024/1/18 13:05
     **/
    initController(enableZoom=true,autoRotate=false,enableDamping=false,dampingFactor=0,minDistance=0.01,maxDistance=10000,minAzimuthAngle=0){
        let width=this.dom.offsetWidth;
        let height=this.dom.offsetHeight;
        //这个Renderer是用来运行3维指标，相当于一个html页面去嵌入至模型中。
        this.labelRenderer=new CSS3DRenderer();
        this.labelRenderer.setSize(width,height);
        //用来调整html页面的样式，让他围绕模型点位时，不会有偏移。
        this.labelRenderer.domElement.style.position='absolute';
        this.labelRenderer.domElement.style.top=0;
        this.labelRenderer.domElement.style.pointerEvents="none";
        this.dom.appendChild(this.labelRenderer.domElement);


        this.controller=new OrbitControls(this.camera,this.renderer.domElement);
        //设置控制器是否可以缩放
        this.controller.enableZoom=enableZoom;
        //设置是否可以旋转
        this.controller.autoRotate=autoRotate;
        //设置控制器阻尼效果，让控制器有真实的效果，
        this.controller.enableDamping=enableDamping;
        //设置阻尼控制器的系数
        this.controller.dampingFactor=dampingFactor;
        //设置控制器放大的最小距离
        this.controller.minDistance=minDistance;
        //设置控制器缩小的最大距离
        this.controller.maxDistance=maxDistance;
        //设置控制器最小旋转角度
        this.controller.minAzimuthAngle=minAzimuthAngle;
    }

    initThree(){
        //这个初始化的是场景
        this.scene= scene
        this.width=window.innerWidth
        this.height=window.innerHeight
        this.camera= new THREE.PerspectiveCamera(45,this.width/this.height,1,10000)

        this.camera.position.set(10,10,10)
        this.camera.lookAt(0,0,0)

        //追加webGL的渲染器，他是用来调用浏览器的GPU，去进行实时渲染（前提浏览器已经支持GPU）
        //antialias:是否开启锯齿，alpha：是否开启透明，logarithmicDepthBuffer：是否开启对数深度缓存
        this.renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,logarithmicDepthBuffer:true})
        // 设置渲染器的像素比
        this.renderer.setPixelRatio(window.devicePixelRatio)
        //渲染器的输出颜色
        this.renderer.outputEncoding=THREE.sRGBEncoding
        //设置渲染器的大小
        this.renderer.setSize(this.width,this.height)
        //设置背景颜色
        this.renderer.setClearColor('rgb(20,20,20)',1.0)
        //设置背景alpha，合法参数是一个 0.0 到 1.0 之间的浮点数
        this.renderer.setClearAlpha(0.0)
        //将渲染器的dom元素，添加至我们div的dom元素中
        this.dom.append(this.renderer.domElement)

        loadFullObliquephotography()
        loadFullRoute()
        load360Box()

        // 监听浏览器大小，去更新相机的矩阵
        window.addEventListener('resize',()=>{
            // 更新相机的宽高比
            this.camera.aspect=this.dom.offsetWidth/this.dom.offsetHeight
            this.camera.updateProjectionMatrix()
            //更新渲染器的大小
            this.renderer.setSize(this.dom.offsetWidth,this.dom.offsetHeight)
            if(this.cssRenderer){
                this.cssRenderer.setSize(this.dom.offsetWidth,this.dom.offsetHeight)
            }

            // update shader div size
            updateShadeDivSize(new THREE.Vector2(this.dom.offsetWidth, this.dom.offsetHeight))
        })

        // Listen Keyboard Click Event.
        window.addEventListener('keydown', (event) => {
           switch(event.code) {
               case 'Digit1':
                   this.eventLocating36001()
                   break;
               case 'Digit2':
                   this.eventLocating36002()
                   break;
               case 'Digit3':
                   this.eventFusion36001_02()
                   break;
            }
        });
    }

    /**
     * @name
     * @author shaoqunchao
     * @date 2024/3/5 10:21
     * @description 初始化X，Y，Z轴的扶助对象
     * @update 2024/3/5 10:21
     **/
    initHelper(helperSize=1000){
        this.scene.add(new THREE.AxesHelper(helperSize))

    }

    render(callback){
        callback();

        var delta = clock.getDelta()
        globalTime += delta
        globalTime = globalTime % 1000

        updateShaderTime(globalTime)
        updateShaderView(this.camera.matrixWorldInverse, this.camera.fov)

        requestAnimationFrame(()=>this.render(callback));
    }

    /**
     * @brief Locating 360 01.
    **/
    eventLocating36001() {

        console.log('Event Locating to 360 01')

        // Load texture in local.
        const textureLoader = new THREE.CubeTextureLoader()
        textureLoader.setPath("image/360/01/")

        const textureCube = textureLoader.load([
            'PX.png', 'NX.png',
            'PY.png', 'NY.png',
            'PZ.png', 'NZ.png',
        ])

        // Shader.360Box.BuiltIn
        var obj = scene.getObjectByName('360')
        if(obj !== undefined)
        {
            obj.material.uniforms._360TextureC.value = textureCube
            obj.material.uniforms._360TextureN.value = textureCube
            obj.material.uniforms.opacity.value = 1
            obj.material.uniforms.lerps.value = 0
        }

        // Shader.Obliquephotography.BuiltIn
        obliquephotographyFilesId.forEach((el => {
            var obj = scene.getObjectByName('Obliquephotography' + el)
            if(obj !== undefined)
            {
                obj.children[0].material.uniforms._360TextureC.value = textureCube
                obj.children[0].material.uniforms._360TextureN.value = textureCube
                obj.children[0].material.uniforms.lerps.value = 0
                obj.children[0].material.uniforms.colorMode.value = 0
            }
        }))


        this.camera.position.set(3.434,-6.442,-42.504)
        this.camera.lookAt(3.434,-6.442,-142.504)
    }

    /**
     * @brief Locating 360 02.
     * */
    eventLocating36002() {

        console.log('Event Locating to 360 02')

        // Load texture in local.
        const textureLoader = new THREE.CubeTextureLoader()
        textureLoader.setPath("image/360/02/")

        const textureCube = textureLoader.load([
            'PX.png', 'NX.png',
            'PY.png', 'NY.png',
            'PZ.png', 'NZ.png',
        ])

        // Shader.360Box.BuiltIn
        var obj = scene.getObjectByName('360')
        if(obj !== undefined)
        {
            obj.material.uniforms._360TextureC.value = textureCube
            obj.material.uniforms._360TextureN.value = textureCube
            obj.material.uniforms.opacity.value = 1
            obj.material.uniforms.lerps.value = 0
        }

        // Shader.Obliquephotography.BuiltIn
        obliquephotographyFilesId.forEach((el => {
            var obj = scene.getObjectByName('Obliquephotography' + el)
            if(obj !== undefined)
            {
                obj.children[0].material.uniforms._360TextureC.value = textureCube
                obj.children[0].material.uniforms._360TextureN.value = textureCube
                obj.children[0].material.uniforms.lerps.value = 0
                obj.children[0].material.uniforms.colorMode.value = 0
            }
        }))

        this.camera.position.set(3.274,-5.562,-45.384)
        this.camera.lookAt(3.274,-5.562,-145.384)
    }

    /**
     * @brief fusion from 360 01 to 360 02
     * */
    eventFusion36001_02() {

        console.log('Event Fusion  from 360 01 to 360 02')

        this.camera.position.set(3.494,-5.562,-43.644)
        this.camera.lookAt(3.494,-5.562,-143.644)

        // Shader.360Box.BuiltIn
        var obj = scene.getObjectByName('360')
        if(obj !== undefined)
        {
            obj.material.uniforms.opacity.value = 1
        }
    }

}
