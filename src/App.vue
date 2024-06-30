<template>
    <div
        style="
        width: 100%;
        height: 100%;
        background:linear-gradient(#151515, #5d6171);
        "
        id="threejs"
    >
    </div>
</template>

<script>
import ThreeJs from "@/components/js/ThreeJs.js";
let app,scene,camera,renderer;

export default {
    name: 'App',
    components: {},
    methods: {
        async init() {
            app = new ThreeJs("threejs");
            app.initThree();
            app.initController();
            app.initHelper();
            renderer = app.renderer;
            scene = app.scene;
            camera = app.camera;
            app.render(() => {
                renderer.render(scene, camera)
            })
        }
    },
    mounted() {
        this.init();
    }
}
</script>

<style>
html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    overflow: hidden; /* 防止出现滚动条 */
}
</style>
