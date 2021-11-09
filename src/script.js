import './style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import * as dat from 'dat.gui'
import fragment from './shader/fragment.glsl'
import vertex from './shader/vertex.glsl'
const canvas = document.querySelector('.webgl')

class NewScene{
    constructor(){
        this._Init()
    }
    
    _Init(){
        this.scene = new THREE.Scene()
        this.clock = new THREE.Clock()
        this.InitTextures()
        this.Globe()
        this.InitSettings()
        this.InitCamera()
        this.InitLights()
        this.InitRenderer()
        this.InitControls()
        this.InitPostProcessing()
        this.Update()
        window.addEventListener('resize', () => {
            this.Resize()
        })
    }

    InitTextures(){
        
        this.loadingManager = new THREE.LoadingManager()
        this.loadingManager.onStart = () => {
            console.log('started')
        }
        this.loadingManager.onLoad = () => {
            console.log('loaded')
        }
        this.loadingManager.onProgress = () => {
            console.log('loading...')
        }
        this.loadingManager.onError = () => {
            console.log('error')
        }
        this.textureLoader = new THREE.TextureLoader(this.loadingManager)
        this.colorTexture = this.textureLoader.load('color.jpg')
        this.alphaTexture = this.textureLoader.load('alpha.jpg')
        this.heightTexture = this.textureLoader.load('height.jpg')
        this.cloudTexture = this.textureLoader.load('cloudColor.jpg')
        this.cloudHeight = this.textureLoader.load('cloudHeight.jpg')
        this.lightTexture = this.textureLoader.load('lightColor.jpg')
    }

    Globe(){
        this.shaderMaterial = new THREE.ShaderMaterial({ 
            fragmentShader: fragment,
            vertexShader: vertex,
            uniforms: {
                u_time:  {value: 0},
                u_texture1: { value: this.cloudTexture },
                u_texture2: { value: this.colorTexture },
                u_texture3: { value: this.lightTexture }
            }
        })


        this.number = 12 * 12
        this.geometry = new THREE.BufferGeometry()
        this.positions = new THREE.BufferAttribute(new Float32Array(this.number * 3), 3)
        this.coordinates = new THREE.BufferAttribute(new Float32Array(this.number * 3), 3)

        let index = 0
        for (let i = 0; i < this.number; i++){
            for(let j = 0; j < this.number; j++){
                this.positions.setXYZ(index, i * 2, j * 2, 0)
                this.coordinates.setXYZ(index,i,j,0)
                index++
            }
        }

        this.geometry.setAttribute('position', this.positions)
        //console.log(this.positions)
        this.geometry.setAttribute('aCoordinates', this.coordinates)

        this.geometry = new THREE.SphereGeometry(50, 500, 500)
        this.world = new THREE.Points(this.geometry, this.shaderMaterial)
        this.scene.add(this.world)
        this.world.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(this.world.geometry.attributes.uv.array, 2))

        
        
        
    }

    InitSettings(){
        this.settings = {
            progress: 0,
            bloomStrength: 3.0,
            bloomRadius: 0.9,
            bloomThreshold: 0.2
        }
        this.gui = new dat.GUI({closed: true})
        //this.gui.add(this.settings, 'progress', 0, 1, 0.01)
        this.gui.add(this.settings, 'bloomStrength', 0, 10, 0.01)
        this.gui.add(this.settings, 'bloomRadius', 0, 10, 0.01)
        this.gui.add(this.settings, 'bloomThreshold', 0, 10, 0.01)
    }

    InitPostProcessing(){
        this.renderScene = new RenderPass(this.scene, this.camera)
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 2.5, 0.05)
        this.composer = new EffectComposer(this.renderer)
        this.composer.setSize(window.innerWidth, window.innerHeight)
        this.composer.addPass(this.renderScene)
        this.composer.addPass(this.bloomPass)
    } 


    InitCamera(){
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 500)
        this.camera.position.set(0, 0.5, 120)
        this.scene.add(this.camera)
    }

    InitLights(){
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.pointLight = new THREE.PointLight(0xffffff, 1000, 200, 125)
        this.scene.add(this.pointLight)
        this.pointLight.position.set(0, 100, 100)
        this.scene.add(this.ambientLight)
    }

    InitRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        })
        this.renderer.setClearColor(0x01152d)
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        //this.renderer.render(this.scene, this.camera)
    }

    InitControls(){
        this.controls = new OrbitControls(this.camera, canvas)
        this.controls.enableDamping = true
        this.controls.update()
        this.controls.enablePan = false
        this.controls.enableZoom = false
    }

    Resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
        this.composer.setSize(window.innerWidth, window.innerHeight)
        this.composer.render()
    }

    Update(){
        requestAnimationFrame(() => {  
            if(this.bloomPass){
                this.bloomPass.threshold = this.settings.bloomThreshold
                this.bloomPass.strength = this.settings.bloomStrength
                this.bloomPass.radius = this.settings.bloomRadius
                this.composer.render(this.scene, this.camera)
            }
            this.shaderMaterial.uniforms.u_time.value = this.clock.getElapsedTime() 
            //this.renderer.render(this.scene, this.camera)
            this.composer.render()
            this.controls.update()
            this.Update()
        })  
    }
}

let _APP = null

window.addEventListener('DOMContentLoaded', () => {
    _APP = new NewScene()
})
