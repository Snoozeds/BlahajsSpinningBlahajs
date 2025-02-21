import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040, 2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// Load model
const loader = new GLTFLoader();
let model;

loader.load('/blahaj.glb', 
    function (gltf) {
        model = gltf.scene;
        model.scale.set(1000, 1000, 1000);
        scene.add(model);
    },
    function (progress) {
        console.log('Loading progress: ', (progress.loaded / progress.total * 100) + '%');
    },
    function (error) {
        console.error('Error loading model:', error);
    }
);

class AudioCache {
    constructor() {
        this.dbName = 'audioCache';
        this.storeName = 'audioFiles';
        this.version = 1;
        this.db = null;
    }

    async init() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Failed to open database');
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    db.createObjectStore(this.storeName);
                }
            };
        });
    }

    async saveAudio(key, arrayBuffer) {
        try {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readwrite');
                const store = transaction.objectStore(this.storeName);
                const request = store.put(arrayBuffer, key);

                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error saving audio:', error);
            throw error;
        }
    }

    async getAudio(key) {
        try {
            await this.init();
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([this.storeName], 'readonly');
                const store = transaction.objectStore(this.storeName);
                const request = store.get(key);

                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        } catch (error) {
            console.error('Error getting audio:', error);
            return null;
        }
    }
}

// Audio setup
const audioCache = new AudioCache();
const listener = new THREE.AudioListener();
camera.add(listener);

const sound = new THREE.Audio(listener);
const audioLoader = new THREE.AudioLoader();
const audioFilename = 'Monkeys_Spinning_Monkeys_by_Kevin_MacLeod.mp3';

// Play/stop button
let isPlaying = false;

async function loadAudio() {
    try {
        const audioCache = new AudioCache();
        const listener = new THREE.AudioListener();
        camera.add(listener);
        const sound = new THREE.Audio(listener);
        
        // Try to load from cache first
        const cachedAudioData = await audioCache.getAudio(audioFilename);
        
        if (cachedAudioData) {
            console.log('Audio loaded from cache');
            // Create AudioContext
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // Decode the cached ArrayBuffer
            const audioBuffer = await audioContext.decodeAudioData(cachedAudioData);
            sound.setBuffer(audioBuffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
        } else {
            // Load from URL if not in cache
            const response = await fetch('https://assets.snoozeds.com/Monkeys_Spinning_Monkeys_by_Kevin_MacLeod.mp3');
            const arrayBuffer = await response.arrayBuffer();
            
            // Save the raw ArrayBuffer to cache
            await audioCache.saveAudio(audioFilename, arrayBuffer);
            
            // Create AudioBuffer and play
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            sound.setBuffer(audioBuffer);
            sound.setLoop(true);
            sound.setVolume(0.5);
            sound.play();
            isPlaying = true;
        }
    } catch (error) {
        console.error('Error in loadAudio:', error);
    }
}

document.getElementById("playAudio").addEventListener("click", async () => {
    try {
        if (isPlaying) {
            sound.stop();
            document.getElementById("playAudio").textContent = "Play Audio";
            isPlaying = false;
            return;
        }

        const cachedAudioData = await audioCache.getAudio(audioFilename);
        
        if (cachedAudioData) {
            console.log('Audio loaded from cache');
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(cachedAudioData);
            sound.setBuffer(audioBuffer);
        } else {
            const response = await fetch('https://assets.snoozeds.com/Monkeys_Spinning_Monkeys_by_Kevin_MacLeod.mp3');
            const arrayBuffer = await response.arrayBuffer();
            await audioCache.saveAudio(audioFilename, arrayBuffer);
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
            sound.setBuffer(audioBuffer);
        }

        sound.setLoop(true);
        sound.setVolume(0.5);
        sound.play();
        
        document.getElementById("playAudio").textContent = "Stop Audio";
        isPlaying = true;
    } catch (error) {
        console.error('Error playing audio:', error);
    }
});

loadAudio();

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Move camera back
camera.position.z = 50;

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Randomised speed factors
    const rotationSpeed = Math.random() * 0.05 + 0.01;
    const positionSpeed = Math.random() * 0.02 + 0.005;

    // Spin the Blahaj if it's loaded
    if (model) {
        model.rotation.y += rotationSpeed;
        model.rotation.x = Math.sin(Date.now() * 0.001) * positionSpeed;
        model.position.y = Math.sin(Date.now() * 0.002) * 10;
    }

    renderer.render(scene, camera);
}

animate();
