import './style.css'
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer'
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass'
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass'
import * as dat from 'dat.gui'
const canvas = document.querySelector('.webgl')

class NewScene{
    constructor(){
        this._Init()
    }
    
    _Init(){
        this.scene = new THREE.Scene()
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

        this.geometry = new THREE.SphereGeometry(50, 250, 250)
        console.log(this.material)
        this.world = new THREE.Mesh(this.geometry, new THREE.MeshStandardMaterial({ 
            map: this.colorTexture,
            transparent: true,
            displacementMap: this.heightTexture,
            displacementScale: 1.0

        }))
        this.scene.add(this.world)
        this.world.geometry.setAttribute('uv2', new THREE.Float32BufferAttribute(this.world.geometry.attributes.uv.array, 2))

        
        
        
    }

    InitSettings(){
        this.settings = {
            progress: 0,
            bloomStrength: 0.2,
            bloomRadius: 0.9,
            bloomThreshold: 0.2
        }
        this.gui = new dat.GUI({closed: true})
        this.gui.add(this.settings, 'progress', 0, 1, 0.01)
        this.gui.add(this.settings, 'bloomStrength', 0, 10, 0.01)
        this.gui.add(this.settings, 'bloomRadius', 0, 10, 0.01)
        this.gui.add(this.settings, 'bloomThreshold', 0, 10, 0.01)
    }

    InitPostProcessing(){
        this.renderScene = new RenderPass(this.scene, this.camera)
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.55, 2.5, 0.05)
        this.composer = new EffectComposer(this.renderer)
        
        this.composer.addPass(this.renderScene)
        
        this.composer.addPass(this.bloomPass)
    } 


    InitCamera(){
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 150)
        this.camera.position.set(0, 0.5, 120)
        this.scene.add(this.camera)
    }

    InitLights(){
        this.ambientLight = new THREE.AmbientLight(0xffffff, 1)
        this.pointLight = new THREE.PointLight(0xffffff, 1, 200, 125)
        this.scene.add(this.pointLight)
        this.pointLight.position.set(0, 100, 0)
        this.scene.add(this.ambientLight)
    }

    InitRenderer(){
        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
        })
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
    }

    Resize(){
        this.camera.aspect = window.innerWidth / window.innerHeight
        this.camera.updateProjectionMatrix()
        this.renderer.setSize(window.innerWidth, window.innerHeight)
    }

    Update(){
        requestAnimationFrame(() => {  
            if(this.bloomPass){
                this.bloomPass.threshold = this.settings.bloomThreshold
                this.bloomPass.strength = this.settings.bloomStrength
                this.bloomPass.radius = this.settings.bloomRadius
                this.composer.render(this.scene, this.camera)
            }   
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