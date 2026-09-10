// @ts-nocheck
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import gsap from "gsap";
import { advanceOrbit } from "../lib/orbit";

export function createHome3D(container, projects) {
        function reduceMotion() {
            return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        }

        function projectsByCategory(id) {
            if (id === "ALL") return projects;
            return projects.filter(function (p) { return p.categorie.indexOf(id) !== -1; });
        }

        var hovered = null;
        var hoverEnabled = true;
        var hoverCallback = null;
        var relayout = false;
        var relayoutTimeout = null;
        var selectCallback = null;
        var onFilterChange = null;
        var currentFilter = "ALL";
        var resolveReady = null;
        var ready = new Promise(function (r) { resolveReady = r; });

        // --- Renderer / scena / camera ---
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);

        var scene = new THREE.Scene();

        function width() { return container.clientWidth || window.innerWidth; }
        function height() { return container.clientHeight || window.innerHeight; }

        var camera = new THREE.PerspectiveCamera(45, width() / height(), 0.1, 300);

        // Luci: ambient bassa + direzionale marcata, così ogni faccia del cubo
        // riceve la sua ombreggiatura naturale (tono editoriale, alto contrasto).
        scene.add(new THREE.AmbientLight(0xffffff, 0.45));
        var key = new THREE.DirectionalLight(0xffffff, 1.35);
        key.position.set(4, 8, 6);
        scene.add(key);
        var rim = new THREE.DirectionalLight(0xffffff, 0.55);
        rim.position.set(-6, -2, -4);
        scene.add(rim);

        // Stato animabile della traiettoria.
        var orbit = { radius: 4 };

        // --- Cubetti (un cubo per progetto) ---
        var cubes = [];

        // Rampa della palette contemporanea: da terracotta pieno a tortora,
        // ogni cubo è monomateriale con una gradazione diversa (il primo più
        // terracotta, gli altri via via meno intensi).
        var RAMP = [
            0xbd5836,  // terracotta
            0xc16a44,
            0xc77e58,
            0xcf9470,  // sabbia/terracotta chiaro
            0xd6b18f,  // beige
            0xc1ab93   // tortora
        ];

        function layoutParams(n) {
            var radius = Math.max(3.8, n * 0.16);
            var spacing = (2 * Math.PI * radius) / Math.max(1, n);
            var size = Math.max(0.3, Math.min(1.0, spacing * 0.34));
            return { radius: radius, size: size };
        }

        function makeFaceTexture(project) {
            var size = 256;
            var canvas = document.createElement("canvas");
            canvas.width = canvas.height = size;
            var ctx = canvas.getContext("2d");

            var c1 = (project.img === "villa") ? "#cfd3d1" :
                     (project.img === "torre") ? "#b8b1a4" :
                     (project.img === "padiglione") ? "#e88c7c" :
                     (project.img === "corte") ? "#d9c9a8" :
                     (project.img === "museo") ? "#9aa7b5" :
                     (project.img === "hub") ? "#c9cfc0" : "#d8d5cc";
            var c2 = (project.img === "villa") ? "#4c5356" :
                     (project.img === "torre") ? "#33302b" :
                     (project.img === "padiglione") ? "#8f2f14" :
                     (project.img === "corte") ? "#5c4a26" :
                     (project.img === "museo") ? "#222c36" :
                     (project.img === "hub") ? "#39422f" : "#5a5750";

            var grad = ctx.createLinearGradient(0, 0, size, size);
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);

            // Grana leggera.
            for (var i = 0; i < 1100; i += 1) {
                ctx.fillStyle = "rgba(17,17,16," + (Math.random() * 0.05) + ")";
                ctx.fillRect(Math.random() * size, Math.random() * size, 1, 1);
            }

            var tex = new THREE.CanvasTexture(canvas);
            if (typeof THREE.SRGBColorSpace !== "undefined") {
                tex.colorSpace = THREE.SRGBColorSpace;
            }
            return tex;
        }

        // Foto dei progetti: texture nitida da usare come sfondo a tutta pagina in hover.
        var photoCache = {};

        function getPhotoTexture(project) {
            if (!project.photo) return null;
            if (photoCache[project.slug]) return photoCache[project.slug];

            var loader = new THREE.TextureLoader();
            var tex = loader.load(encodeURI(project.photo), function (loaded) {
                // A caricamento avvenuto, se è ancora lo sfondo attivo applica il cover.
                if (bgMat && bgMat.map === loaded) applyCover(loaded);
            });
            if (typeof THREE.SRGBColorSpace !== "undefined") {
                tex.colorSpace = THREE.SRGBColorSpace;
            }
            tex.anisotropy = 4;
            photoCache[project.slug] = tex;
            return tex;
        }

        function positionFromAngle(group) {
            group.position.set(
                Math.cos(group.userData.angle) * orbit.radius,
                group.userData.yOff,
                Math.sin(group.userData.angle) * orbit.radius
            );
        }

        function build(projects) {
            var params = layoutParams(projects.length);
            orbit.radius = params.radius;

            projects.forEach(function (project, i) {
                var geometry = new THREE.BoxGeometry(1, 1, 1);

                // Cubo monomateriale: un colore della rampa (gradazione per cubo).
                // Le facce si ombreggiano da sole grazie alle luci direzionali.
                var monoMat = new THREE.MeshStandardMaterial({
                    color: RAMP[i % RAMP.length],
                    roughness: 0.9,
                    metalness: 0.03,
                });

                var mesh = new THREE.Mesh(geometry, monoMat);

                var edges = new THREE.LineSegments(
                    new THREE.EdgesGeometry(geometry),
                    new THREE.LineBasicMaterial({
                        color: 0x111110,
                        transparent: true,
                        opacity: 0.35,
                    })
                );

                var group = new THREE.Group();
                group.add(mesh);
                group.add(edges);

                group.userData.project = project;
                group.userData.mesh = mesh;
                group.userData.baseColor = monoMat.color.clone();
                group.userData.angle = (i / projects.length) * Math.PI * 2;
                group.userData.yOff = (Math.random() - 0.5) * 0.5;

                // Precarica la foto del progetto (se presente) per l'hover.
                if (project.photo) getPhotoTexture(project);

                // Deformazione organica reale dei vertici (BufferGeometry):
                // snapshot delle posizioni di base + parametri specifici del cubo.
                group.userData.meshGeo = mesh.geometry;
                group.userData.edgeGeo = edges.geometry;
                group.userData.baseMesh = new Float32Array(mesh.geometry.attributes.position.array);
                group.userData.baseEdge = new Float32Array(edges.geometry.attributes.position.array);
                group.userData.deform = {
                    amp: 0.08 + Math.random() * 0.06,   // 8%–14% dello spigolo
                    sx: 1.1 + Math.random() * 0.8,
                    sy: 1.2 + Math.random() * 0.7,
                    sz: 0.6 + Math.random() * 0.3,
                    px: Math.random() * Math.PI * 2,
                    py: Math.random() * Math.PI * 2,
                    pz: Math.random() * Math.PI * 2,
                };
                group.userData.deformed = false;

                positionFromAngle(group);
                group.scale.setScalar(0.001);
                scene.add(group);
                cubes.push(group);
            });
        }

        // --- Camera + OrbitControls (drag / zoom / touch / inertia) ---
        var controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.07;
        controls.enablePan = false;
        controls.target.set(0, 0, 0);
        controls.minDistance = 2.2;
        controls.maxDistance = 30;
        controls.minPolarAngle = 0.2;
        controls.maxPolarAngle = Math.PI * 0.48;

        var dist = orbit.radius * 2.1 + 1.4;
        camera.position.set(dist * 0.5, dist * 0.42, dist * 0.82);
        camera.lookAt(0, 0, 0);
        controls.update();

        renderer.domElement.style.touchAction = "none";
        renderer.domElement.style.cursor = "grab";

        // --- Sfondo a tutta pagina (foto del progetto in hover) ---
        // Piano ancorato alla camera: copre sempre tutto il viewport, dietro i cubi.
        var BG_DIST = 42;
        var bgMat = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0,
            depthWrite: false,
        });
        var bgMesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), bgMat);
        bgMesh.position.z = -BG_DIST;
        camera.add(bgMesh);
        scene.add(camera);

        // --- Raycast (hover / click) ---
        var raycaster = new THREE.Raycaster();
        var pointer = new THREE.Vector2();
        var downPos = null;

        function setPointer(clientX, clientY) {
            var rect = renderer.domElement.getBoundingClientRect();
            pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
        }

        function findProjectGroup(hit) {
            var node = hit && hit.object ? hit.object : null;
            while (node && !node.userData.project) node = node.parent;
            return node;
        }

        function groupAtPointer() {
            raycaster.setFromCamera(pointer, camera);
            // Interseca solo i cubi effettivamente visibili (filtri nascosti esclusi).
            var visibleCubes = [];
            for (var i = 0; i < cubes.length; i++) {
                if (cubes[i].visible) visibleCubes.push(cubes[i]);
            }
            var hits = raycaster.intersectObjects(visibleCubes, true);
            return findProjectGroup(hits[0]);
        }

        function projectToScreen(position) {
            var v = position.clone().project(camera);
            return {
                x: (v.x * 0.5 + 0.5) * width(),
                y: (-v.y * 0.5 + 0.5) * height(),
            };
        }

        var WHITE = new THREE.Color(1, 1, 1);

        // In hover: il cubo selezionato si ingrandisce (1.5x), gli altri si riducono (0.5x).
        // Al leave (selected null) tutti tornano a dimensione normale.
        function scaleCubes(selected) {
            cubes.forEach(function (g) {
                var s = selected ? ((g === selected) ? 1.5 : 0.5) : 1;
                gsap.to(g.scale, {
                    x: s, y: s, z: s,
                    duration: reduceMotion() ? 0 : 0.35,
                    ease: "power2.out",
                    overwrite: "auto",
                });
            });
        }

        // In hover: il cubo selezionato mantiene il suo colore, gli altri diventano bianchi.
        // Al leave (selected null) tutti tornano al colore della rampa.
        function whiteOutOthers(selected) {
            cubes.forEach(function (g) {
                var target = (!selected || g === selected) ? g.userData.baseColor : WHITE;
                gsap.to(g.userData.mesh.material.color, {
                    r: target.r, g: target.g, b: target.b,
                    duration: reduceMotion() ? 0 : 0.35,
                    overwrite: "auto",
                });
            });
        }

        // Riempimento "cover": la foto copre sempre l'intera pagina senza deformarsi.
        function applyCover(tex) {
            if (!tex || !tex.image) return;
            var iw = tex.image.naturalWidth || tex.image.width;
            var ih = tex.image.naturalHeight || tex.image.height;
            if (!iw || !ih) return;
            var av = width() / height();       // proporzione viewport
            var ai = iw / ih;                  // proporzione immagine
            var rw = Math.min(1, av / ai);
            var rh = Math.min(1, ai / av);
            if (Math.abs(tex.repeat.x - rw) > 1e-4 || Math.abs(tex.repeat.y - rh) > 1e-4) {
                tex.repeat.set(rw, rh);
                tex.offset.set((1 - rw) / 2, (1 - rh) / 2);
            }
        }

        function emitHover(group) {
            if (hovered === group) return;
            hovered = group;

            if (!group) {
                renderer.domElement.style.cursor = "grab";
                scaleCubes(null);
                whiteOutOthers(null);
                gsap.to(bgMat, { opacity: 0, duration: reduceMotion() ? 0 : 0.4 });
                if (hoverCallback) hoverCallback(null);
                return;
            }

            renderer.domElement.style.cursor = "pointer";
            scaleCubes(group);
            whiteOutOthers(group);
            // La foto del progetto diventa lo sfondo dell'intera pagina, dietro i cubi.
            var tex = getPhotoTexture(group.userData.project) || makeFaceTexture(group.userData.project);
            applyCover(tex);
            if (bgMat.map !== tex) {
                bgMat.map = tex;
                bgMat.needsUpdate = true;
            }
            gsap.to(bgMat, { opacity: 0.92, duration: reduceMotion() ? 0 : 0.4 });
            if (hoverCallback) {
                var project = group.userData.project;
                var p = projectToScreen(group.position);
                hoverCallback({
                    title: project.title,
                    category: project.principaleLabel,
                    year: project.year,
                    x: p.x,
                    y: p.y,
                });
            }
        }

        renderer.domElement.addEventListener("pointermove", function (e) {
            if (!hoverEnabled) return;
            setPointer(e.clientX, e.clientY);
            emitHover(groupAtPointer());
        });

        renderer.domElement.addEventListener("pointerleave", function () {
            if (!hoverEnabled) return;
            emitHover(null);
        });

        renderer.domElement.addEventListener("pointerdown", function (e) {
            setPointer(e.clientX, e.clientY);
            downPos = { x: e.clientX, y: e.clientY };
            if (hoverEnabled) emitHover(groupAtPointer());
        });

        if (controls.addEventListener) {
            controls.addEventListener("start", function () {
                renderer.domElement.style.cursor = "grabbing";
            });
            controls.addEventListener("end", function () {
                renderer.domElement.style.cursor = hovered ? "pointer" : "grab";
            });
        }

        renderer.domElement.addEventListener("pointerup", function (e) {
            if (!downPos) return;
            var moved = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
            downPos = null;

            if (moved > 6) return;

            setPointer(e.clientX, e.clientY);
            var group = groupAtPointer();
            if (group && selectCallback) selectCallback(group.userData.project);
        });

        // Se il mouse esce dal canvas verso elementi DOM sovrapposti (filtri, header, link)
        // il canvas non riceve pointerleave; forziamo il reset dell'hover.
        document.addEventListener("pointermove", function (e) {
            if (!hoverEnabled) return;
            if (!renderer.domElement.contains(e.target) && hovered !== null) {
                emitHover(null);
            }
        });

        // --- Riconfigurazione dei filtri lungo la traiettoria ---
        function shortestAngle(from, to) {
            var twoPi = Math.PI * 2;
            var delta = (to - from) % twoPi;
            if (delta > Math.PI) delta -= twoPi;
            if (delta < -Math.PI) delta += twoPi;
            return delta;
        }

        function cubeFor(project) {
            for (var i = 0; i < cubes.length; i += 1) {
                if (cubes[i].userData.project === project) return cubes[i];
            }
            return null;
        }

        function setFilter(id) {
            if (!id || id === currentFilter) return;

            // Resetta sempre lo stato di hover prima di riconfigurare: evita che colori
            // bianchi o scale alterate da un hover precedente persistano nel nuovo filtro.
            if (hovered) {
                hovered = null;
                scaleCubes(null);
                whiteOutOthers(null);
                gsap.to(bgMat, { opacity: 0, duration: reduceMotion() ? 0 : 0.3 });
                if (hoverCallback) hoverCallback(null);
            }

            relayout = true;
            var previous = currentFilter;
            currentFilter = id;

            var visible = projectsByCategory(id);
            var previousList = projectsByCategory(previous);
            var params = layoutParams(visible.length);

            // La traiettoria si adatta (raggio) mentre i cubi si muovono.
            gsap.to(orbit, {
                radius: params.radius,
                duration: 1.05,
                ease: "power2.inOut",
                onUpdate: function () {
                    cubes.forEach(positionFromAngle);
                },
            });

            // Cubi che escono: si nascondono subito e tornano al colore rampa.
            previousList.forEach(function (project) {
                if (visible.indexOf(project) !== -1) return;
                var group = cubeFor(project);
                if (!group) return;
                group.visible = false;
                group.scale.setScalar(0.001);
                gsap.killTweensOf(group.scale);
                gsap.killTweensOf(group.userData.mesh.material.color);
                group.userData.mesh.material.color.copy(group.userData.baseColor);
                if (hovered === group) {
                    hovered = null;
                    whiteOutOthers(null);
                    gsap.to(bgMat, { opacity: 0, duration: reduceMotion() ? 0 : 0.3 });
                    if (hoverCallback) hoverCallback(null);
                }
            });

            // Cubi che restano (o rientrano): si ridistribuiscono equamente.
            var longest = 1.05;
            visible.forEach(function (project, i) {
                var group = cubeFor(project);
                if (!group) return;

                if (!group.visible) {
                    group.visible = true;
                    group.scale.setScalar(0.001);
                    gsap.killTweensOf(group.userData.mesh.material.color);
                    group.userData.mesh.material.color.copy(group.userData.baseColor);
                }
                gsap.to(group.scale, {
                    x: 1, y: 1, z: 1,
                    duration: reduceMotion() ? 0 : 0.5,
                    ease: "power2.out",
                    overwrite: "auto",
                });

                var target = (i / visible.length) * Math.PI * 2;
                var current = group.userData.angle;
                var delta = shortestAngle(current, target);
                var dur = 1.05 + i * 0.02;
                if (dur > longest) longest = dur;
                gsap.to(group.userData, {
                    angle: current + delta,
                    duration: dur,
                    ease: "power3.inOut",
                    delay: i * 0.025,
                    onUpdate: function () { positionFromAngle(group); },
                });
            });

            // Nessun drift / deform durante il riconfigurarsi dei filtri.
            if (relayoutTimeout) clearTimeout(relayoutTimeout);
            if (visible.length === 0) {
                relayout = false;
            } else {
                var relayoutEndMs = Math.max(1050, longest * 1000 + visible.length * 25) + 100;
                relayoutTimeout = setTimeout(function () { relayout = false; }, relayoutEndMs);
            }

            if (onFilterChange) onFilterChange(id);
        }

        // --- Deformazione organica dei vertici (BufferGeometry) ---
        // Sposta i vertici (grip degli spigoli) con combinazioni sinusoidali lente:
        // ogni cubo mantiene la propria fase/velocità/ampiezza e torna a base periodicamente.

        function resetDeform(group) {
            group.userData.meshGeo.attributes.position.array.set(group.userData.baseMesh);
            group.userData.edgeGeo.attributes.position.array.set(group.userData.baseEdge);
            group.userData.meshGeo.attributes.position.needsUpdate = true;
            group.userData.edgeGeo.attributes.position.needsUpdate = true;
            group.userData.meshGeo.computeVertexNormals();
            group.userData.meshGeo.computeBoundingSphere();
            group.userData.edgeGeo.computeBoundingSphere();
            group.userData.deformed = false;
        }

        function deformCube(group, t) {
            var d = group.userData.deform;
            var amp = d.amp;
            var half = 0.5;

            // Tre oscillazioni principali + armonici: pattern irregolare, mai meccanico.
            var s1 = Math.sin(t * d.sx + d.px);
            var s2 = Math.sin(t * d.sy + d.py);
            var s3 = Math.sin(t * d.sz + d.pz);
            var n1 = Math.sin(t * d.sx * 0.55 + d.pz);
            var n2 = Math.sin(t * d.sy * 0.65 + d.px);
            var n3 = Math.sin(t * d.sz * 0.6 + d.py);
            var kx = 0.5 * s1 + 0.3 * n1;   // tra -0.8 e +0.8
            var ky = 0.5 * s2 + 0.3 * n2;
            var kz = 0.5 * s3 + 0.3 * n3;

            var mp = group.userData.meshGeo.attributes.position.array;
            var base = group.userData.baseMesh;
            for (var i = 0; i < 24; i += 1) {
                var px = base[i * 3], py = base[i * 3 + 1], pz = base[i * 3 + 2];
                var sx = px >= 0 ? 1 : -1;
                var sy = py >= 0 ? 1 : -1;
                var sz = pz >= 0 ? 1 : -1;
                // Grip lungo la diagonale + taglio leggero che inclina spigoli e facce.
                var dx = sx * amp * kx + amp * 0.65 * s2 * (Math.abs(py) / half);
                var dy = sy * amp * ky + amp * 0.65 * s3 * (Math.abs(pz) / half);
                var dz = sz * amp * kz + amp * 0.65 * s1 * (Math.abs(px) / half);
                mp[i * 3] = px + dx;
                mp[i * 3 + 1] = py + dy;
                mp[i * 3 + 2] = pz + dz;
            }

            // Gli spigoli (linee) seguono esattamente gli stessi vertici deformati.
            var ep = group.userData.edgeGeo.attributes.position.array;
            var eb = group.userData.baseEdge;
            for (var j = 0; j < 24; j += 1) {
                var qx = eb[j * 3], qy = eb[j * 3 + 1], qz = eb[j * 3 + 2];
                var jx = qx >= 0 ? 1 : -1;
                var jy = qy >= 0 ? 1 : -1;
                var jz = qz >= 0 ? 1 : -1;
                ep[j * 3] = qx + jx * amp * kx + amp * 0.65 * s2 * (Math.abs(qy) / half);
                ep[j * 3 + 1] = qy + jy * amp * ky + amp * 0.65 * s3 * (Math.abs(qz) / half);
                ep[j * 3 + 2] = qz + jz * amp * kz + amp * 0.65 * s1 * (Math.abs(qx) / half);
            }

            group.userData.meshGeo.attributes.position.needsUpdate = true;
            group.userData.edgeGeo.attributes.position.needsUpdate = true;
            group.userData.meshGeo.computeVertexNormals();
            group.userData.meshGeo.computeBoundingSphere();
            group.userData.edgeGeo.computeBoundingSphere();
            group.userData.deformed = true;
        }

        // --- Movimento automatico (drift orbitale) + deformazione ---
        // Velocità max: rivoluzione completa in ~42s (≈2× rispetto alla versione precedente).
        var DRIFT_MAX = 0.15; // rad/s
        var IDLE_MS = 5000;
        var motionOn = !reduceMotion();
        var driftSpeed = 0;
        var lastActivity = Date.now();
        var lastNow = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();

        function markActivity() { lastActivity = Date.now(); }

        function idleFactor() {
            return (Date.now() - lastActivity > IDLE_MS) ? 1 : 0;
        }

        if (window.matchMedia) {
            var motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
            var onMotionQuery = function (e) {
                motionOn = !e.matches;
                if (!motionOn) driftSpeed = 0;
            };
            if (motionQuery.addEventListener) motionQuery.addEventListener("change", onMotionQuery);
            else if (motionQuery.addListener) motionQuery.addListener(onMotionQuery);
        }

        // Interazione = pausa del drift (ripresa graduale dopo IDLE_MS di inattività).
        renderer.domElement.addEventListener("pointerdown", markActivity);
        renderer.domElement.addEventListener("wheel", markActivity, { passive: true });
        if (controls.addEventListener) {
            controls.addEventListener("start", markActivity);
        }
        document.addEventListener("visibilitychange", function () {
            if (document.hidden) markActivity();
        });

        // --- Anello di render ---
        var firstFrame = true;
        function tick() {
            requestAnimationFrame(tick);

            var now = (typeof performance !== "undefined" && performance.now) ? performance.now() : Date.now();
            var dt = Math.min((now - lastNow) / 1000, 0.05);
            lastNow = now;

            // Drift orbitale: si ferma durante interazione o riconfigurazione filtri.
            var interacting = !!hovered;
            var target = (motionOn && !document.hidden && !interacting && !relayout) ? idleFactor() : 0;
            driftSpeed += (target * DRIFT_MAX - driftSpeed) * Math.min(1, dt * 1.4);
            if (!relayout && Math.abs(driftSpeed) > 1e-7) {
                var moving = [];
                for (var c = 0; c < cubes.length; c += 1) {
                    if (cubes[c].visible) moving.push(cubes[c]);
                }
                var next = advanceOrbit(moving.map(function (g) { return g.userData.angle; }), driftSpeed * dt);
                moving.forEach(function (g, i) {
                    g.userData.angle = next[i];
                    positionFromAngle(g);
                });
            }

            // Deformazione organica dei vertici, fase/velocità/ampiezza per cubo.
            // In hover/disinterazione/relayout si ferma: il cubo torna alla forma pulita.
            cubes.forEach(function (g) {
                if (!motionOn || interacting || relayout || !g.visible) {
                    if (g.userData.deformed) resetDeform(g);
                    return;
                }
                deformCube(g, now * 0.001);
            });

            controls.update();
            renderer.render(scene, camera);
            if (firstFrame) {
                firstFrame = false;
                if (resolveReady) resolveReady();
            }
        }

        // --- Entrata ---
        function entrance() {
            var reduced = reduceMotion();
            var dur = reduced ? 0 : 0.7;
            cubes.forEach(function (group, i) {
                gsap.to(group.scale, {
                    x: 1, y: 1, z: 1,
                    duration: dur,
                    delay: reduced ? 0 : i * 0.06,
                    ease: "back.out(1.8)",
                });
            });

            if (!reduced) {
                var from = new THREE.Vector3(
                    camera.position.x * 1.45,
                    camera.position.y * 1.45,
                    camera.position.z * 1.45
                );
                camera.position.copy(from);
                gsap.to(camera.position, {
                    x: dist * 0.5,
                    y: dist * 0.42,
                    z: dist * 0.82,
                    duration: 1.6,
                    ease: "power2.out",
                    onUpdate: function () { controls.update(); },
                });
            }
        }

        // --- Resize / performance ---
        function resize() {
            camera.aspect = width() / height();
            camera.updateProjectionMatrix();
            renderer.setSize(width(), height());
            // Lo sfondo a tutta pagina copre sempre esattamente il viewport.
            var halfH = _bgHalfH();
            bgMesh.scale.set(halfH * 2 * (width() / height()), halfH * 2, 1);
            // Re-apply del "cover" per le nuove proporzioni del viewport.
            if (bgMat.map) applyCover(bgMat.map);
        }

        function _bgHalfH() {
            return BG_DIST * Math.tan((camera.fov * Math.PI) / 360);
        }
        window.addEventListener("resize", resize);
        window.addEventListener("load", resize);
        document.addEventListener("visibilitychange", function () {
            if (!document.hidden) resize();
        });

        // --- Bootstrap ---
        renderer.setSize(width(), height());
        // First sizing of camera + background (prima dei resize eventi).
        resize();
        container.appendChild(renderer.domElement);
        build(projects);
        entrance();
        tick();

        // --- API pubblica ---
        return {
            ready: ready,
            onFilterChange: function (cb) { onFilterChange = cb; },
            onHover: function (cb) { hoverCallback = cb; },
            onSelect: function (cb) { selectCallback = cb; },
            setFilter: setFilter,
            setHoverEnabled: function (v) {
                hoverEnabled = v;
                if (!v) emitHover(null);
            },
        };
}