/**
 * RODDNEIL B. GEMINA — SLEEK GLASS & 3D VIRUS-SPREAD CUBE BACKDROP ENGINE (js/main.js)
 */

document.addEventListener('DOMContentLoaded', () => {

    // ==========================================================================
    // 1. SYNTHESIZED RETRO/MODERN AUDIO ENGINE (WEB AUDIO API)
    // ==========================================================================
    let sfxEnabled = localStorage.getItem('sfx_enabled') !== 'false';

    function playSfx(type) {
        if (!sfxEnabled) return;
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            const now = ctx.currentTime;
            if (type === 'move') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(300, now);
                osc.frequency.exponentialRampToValueAtTime(500, now + 0.05);
                gain.gain.setValueAtTime(0.06, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.05);
                osc.start(now);
                osc.stop(now + 0.05);
            } else if (type === 'rotate') {
                osc.type = 'triangle';
                osc.frequency.setValueAtTime(400, now);
                osc.frequency.exponentialRampToValueAtTime(700, now + 0.07);
                gain.gain.setValueAtTime(0.08, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.07);
                osc.start(now);
                osc.stop(now + 0.07);
            } else if (type === 'drop') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(500, now);
                osc.frequency.linearRampToValueAtTime(150, now + 0.09);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.09);
                osc.start(now);
                osc.stop(now + 0.09);
            } else if (type === 'clear') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now);
                osc.frequency.setValueAtTime(659.25, now + 0.08);
                osc.frequency.setValueAtTime(783.99, now + 0.16);
                gain.gain.setValueAtTime(0.1, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.25);
                osc.start(now);
                osc.stop(now + 0.25);
            } else if (type === 'virus') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(200, now);
                osc.frequency.exponentialRampToValueAtTime(900, now + 0.15);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.15);
                osc.start(now);
                osc.stop(now + 0.15);
            } else if (type === 'click') {
                osc.type = 'sine';
                osc.frequency.setValueAtTime(600, now);
                gain.gain.setValueAtTime(0.05, now);
                gain.gain.linearRampToValueAtTime(0, now + 0.04);
                osc.start(now);
                osc.stop(now + 0.04);
            }
        } catch (e) {
            // Audio policy fallback
        }
    }

    document.querySelectorAll('.sleek-btn, .btn, .nav-link, .game-ctrl-btn').forEach(btn => {
        btn.addEventListener('click', () => playSfx('click'));
    });

    // ==========================================================================
    // 2. THREE.JS 3D CUBE BACKDROP WITH VIRUS SPREAD WAVE & BOB/TWITCH PHYSICS
    // ==========================================================================
    let threeScene, threeCamera, threeRenderer, cubeMeshArray = [];
    let targetMouseX = 0, targetMouseY = 0, currentMouseX = 0, currentMouseY = 0;

    // Virus Spread Animation State
    let virusWaveActive = false;
    let virusWaveProgress = 0;
    const virusWaveSpeed = 38; // 3D units per second
    let virusWaveOrigin = { x: 22, y: 18 }; // Origin near top-right screen toggle button
    let currentThemeMode = localStorage.getItem('portfolio_theme') || 'light';

    // Color definitions for Light & Dark mode 3D Cubes
    const LIGHT_CUBE_COLORS = [
        new THREE.Color(0xffffff),
        new THREE.Color(0xf1f5f9),
        new THREE.Color(0xe2e8f0),
        new THREE.Color(0x38bdf8),
        new THREE.Color(0x818cf8)
    ];

    const DARK_CUBE_COLORS = [
        new THREE.Color(0x0f172a),
        new THREE.Color(0x1e293b),
        new THREE.Color(0x334155),
        new THREE.Color(0x0284c7),
        new THREE.Color(0xf43f5e)
    ];

    function init3DBackdrop() {
        const canvas = document.getElementById('canvas-3d-bg');
        if (!canvas || typeof THREE === 'undefined') return;

        threeScene = new THREE.Scene();
        threeCamera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        threeCamera.position.set(0, 0, 32);

        threeRenderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
        threeRenderer.setSize(window.innerWidth, window.innerHeight);
        threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
        threeScene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.9);
        dirLight1.position.set(25, 40, 35);
        threeScene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0x38bdf8, 0.4);
        dirLight2.position.set(-25, -20, 25);
        threeScene.add(dirLight2);

        // Generate Dense 3D Cube Grid / Floating Matrix (~140 Cubes)
        const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);

        for (let x = -20; x <= 20; x += 3.2) {
            for (let y = -14; y <= 14; y += 3.2) {
                const isDark = (currentThemeMode === 'dark');
                const palette = isDark ? DARK_CUBE_COLORS : LIGHT_CUBE_COLORS;
                const baseColor = palette[Math.floor(Math.random() * palette.length)].clone();

                const mat = new THREE.MeshStandardMaterial({
                    color: baseColor,
                    roughness: 0.2,
                    metalness: 0.1,
                    transparent: true,
                    opacity: 0.88
                });

                const mesh = new THREE.Mesh(boxGeo, mat);

                // Add random depth offsets
                const zPos = (Math.random() - 0.5) * 22;
                mesh.position.set(
                    x + (Math.random() - 0.5) * 1.2,
                    y + (Math.random() - 0.5) * 1.2,
                    zPos
                );

                mesh.rotation.set(
                    Math.random() * Math.PI,
                    Math.random() * Math.PI,
                    Math.random() * Math.PI
                );

                mesh.userData = {
                    baseX: mesh.position.x,
                    baseY: mesh.position.y,
                    baseZ: mesh.position.z,
                    rotSpeedX: (Math.random() - 0.5) * 0.015,
                    rotSpeedY: (Math.random() - 0.5) * 0.018,
                    floatSpeed: Math.random() * 0.015 + 0.005,
                    floatOffset: Math.random() * Math.PI * 2,
                    isFlipped: false,
                    targetColor: baseColor.clone(),
                    twitchTime: 0
                };

                cubeMeshArray.push(mesh);
                threeScene.add(mesh);
            }
        }

        // Mouse Move Event Listener for 3D Perspective Tilt
        window.addEventListener('mousemove', (e) => {
            targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
            targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
        });

        // Touch Tilt Fallback
        window.addEventListener('touchmove', (e) => {
            if (e.touches.length > 0) {
                targetMouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
                targetMouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
            }
        });

        // Window Resize
        window.addEventListener('resize', () => {
            threeCamera.aspect = window.innerWidth / window.innerHeight;
            threeCamera.updateProjectionMatrix();
            threeRenderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Animation Loop
        let clock = new THREE.Clock();

        function animate() {
            requestAnimationFrame(animate);
            const delta = clock.getDelta();
            const elapsedTime = clock.getElapsedTime();

            // Smooth Interpolation (Lerp) for Camera Mouse Tilt
            currentMouseX += (targetMouseX - currentMouseX) * 0.05;
            currentMouseY += (targetMouseY - currentMouseY) * 0.05;

            threeCamera.position.x = currentMouseX * 6;
            threeCamera.position.y = -currentMouseY * 5;
            threeCamera.rotation.y = -currentMouseX * 0.12;
            threeCamera.rotation.x = currentMouseY * 0.1;

            // Handle Virus Spreading Wave Animation across 3D Cubes
            if (virusWaveActive) {
                virusWaveProgress += delta * virusWaveSpeed;

                let allFinished = true;
                cubeMeshArray.forEach(cube => {
                    const dist = Math.hypot(cube.position.x - virusWaveOrigin.x, cube.position.y - virusWaveOrigin.y);

                    if (dist <= virusWaveProgress && !cube.userData.isFlipped) {
                        cube.userData.isFlipped = true;
                        cube.userData.twitchTime = 1.0; // Trigger sudden Bob/Twitch excitation!
                        playSfx('virus');
                    }

                    if (!cube.userData.isFlipped) {
                        allFinished = false;
                    }
                });

                if (allFinished || virusWaveProgress > 70) {
                    virusWaveActive = false;
                }
            }

            // Animate Individual Cubes (Rotation, Floating, Color Lerp, & Twitch Physics)
            cubeMeshArray.forEach(cube => {
                // Continuous Rotation
                cube.rotation.x += cube.userData.rotSpeedX;
                cube.rotation.y += cube.userData.rotSpeedY;

                // Color Lerp
                cube.material.color.lerp(cube.userData.targetColor, 0.1);

                // Twitch / Bob Excitation Damping Physics
                if (cube.userData.twitchTime > 0) {
                    cube.userData.twitchTime -= delta * 3.5;
                    const popVal = Math.sin(Math.max(0, cube.userData.twitchTime) * Math.PI);
                    const scaleFactor = 1.0 + popVal * 0.5; // Scale up to 1.5x during twitch!

                    cube.scale.set(scaleFactor, scaleFactor, scaleFactor);
                    cube.position.y = cube.userData.baseY + popVal * 1.8; // Vertical Bob
                    cube.rotation.z += popVal * 0.2; // Rotational Twitch
                } else {
                    cube.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
                    cube.position.y = cube.userData.baseY + Math.sin(elapsedTime * cube.userData.floatSpeed * 2 + cube.userData.floatOffset) * 0.6;
                }
            });

            threeRenderer.render(threeScene, threeCamera);
        }

        animate();
    }

    init3DBackdrop();

    // ==========================================================================
    // 3. VIRUS SPREAD DARK / LIGHT MODE TOGGLE CONTROLLER
    // ==========================================================================
    const themeVirusToggle = document.getElementById('theme-virus-toggle');
    const htmlElement = document.documentElement;

    function applyThemeMode(targetMode, triggerVirusSpread = false) {
        currentThemeMode = targetMode;
        htmlElement.setAttribute('data-theme', targetMode);
        localStorage.setItem('portfolio_theme', targetMode);

        const themeLabel = themeVirusToggle ? themeVirusToggle.querySelector('.theme-label') : null;
        if (themeLabel) {
            themeLabel.textContent = targetMode === 'dark' ? 'Dark Mode' : 'Light Mode';
        }

        if (triggerVirusSpread && cubeMeshArray.length > 0) {
            virusWaveOrigin = { x: 20, y: 15 }; // Top Right toggle position
            virusWaveProgress = 0;
            virusWaveActive = true;

            const isDark = (targetMode === 'dark');
            const palette = isDark ? DARK_CUBE_COLORS : LIGHT_CUBE_COLORS;

            // Assign new target color to each cube for wave trigger
            cubeMeshArray.forEach(cube => {
                cube.userData.isFlipped = false;
                cube.userData.targetColor = palette[Math.floor(Math.random() * palette.length)].clone();
            });
        }
    }

    applyThemeMode(currentThemeMode, false);

    if (themeVirusToggle) {
        themeVirusToggle.addEventListener('click', () => {
            const nextMode = currentThemeMode === 'light' ? 'dark' : 'light';
            applyThemeMode(nextMode, true);
        });
    }

    // ==========================================================================
    // 4. INTERACTIVE TETRIS BRICK MINI-GAME WIDGET
    // ==========================================================================
    function initBrickGame() {
        const canvas = document.getElementById('brick-game-canvas');
        const nextCanvas = document.getElementById('next-piece-canvas');
        if (!canvas || !nextCanvas) return;

        const ctx = canvas.getContext('2d');
        const nextCtx = nextCanvas.getContext('2d');

        const COLS = 10, ROWS = 18, BLOCK_SIZE = 20;
        let board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));

        let score = 0, lines = 0, level = 1;
        let autoPlay = true;
        let dropCounter = 0, dropInterval = 800, lastTime = 0;

        const gameScore = document.getElementById('game-score');
        const gameLines = document.getElementById('game-lines');
        const gameLevel = document.getElementById('game-level');

        const SHAPES = [
            [[1, 1, 1, 1]], [[1, 1], [1, 1]], [[0, 1, 0], [1, 1, 1]],
            [[1, 0, 0], [1, 1, 1]], [[0, 0, 1], [1, 1, 1]],
            [[0, 1, 1], [1, 0, 0]], [[1, 1, 0], [0, 1, 1]]
        ];

        const COLORS = ['#38bdf8', '#f43f5e', '#fbbf24', '#34d399', '#c084fc', '#60a5fa', '#f97316'];

        function createPiece() {
            const id = Math.floor(Math.random() * SHAPES.length);
            return {
                shape: SHAPES[id],
                color: COLORS[id],
                x: Math.floor((COLS - SHAPES[id][0].length) / 2),
                y: 0
            };
        }

        let playerPiece = createPiece();
        let nextPiece = createPiece();

        function collide(board, piece) {
            for (let r = 0; r < piece.shape.length; r++) {
                for (let c = 0; c < piece.shape[r].length; c++) {
                    if (piece.shape[r][c] !== 0) {
                        let newY = piece.y + r;
                        let newX = piece.x + c;
                        if (newX < 0 || newX >= COLS || newY >= ROWS || (newY >= 0 && board[newY][newX] !== 0)) {
                            return true;
                        }
                    }
                }
            }
            return false;
        }

        function merge(board, piece) {
            piece.shape.forEach((row, r) => {
                row.forEach((val, c) => {
                    if (val !== 0 && piece.y + r >= 0) {
                        board[piece.y + r][piece.x + c] = piece.color;
                    }
                });
            });
        }

        function clearLines() {
            let cleared = 0;
            outer: for (let r = ROWS - 1; r >= 0; r--) {
                for (let c = 0; c < COLS; c++) {
                    if (board[r][c] === 0) continue outer;
                }
                const row = board.splice(r, 1)[0].fill(0);
                board.unshift(row);
                cleared++;
                r++;
            }
            if (cleared > 0) {
                lines += cleared;
                score += cleared * 100 * level;
                level = Math.floor(lines / 5) + 1;
                dropInterval = Math.max(150, 800 - (level - 1) * 70);
                playSfx('clear');
                updateGameStats();
            }
        }

        function updateGameStats() {
            if (gameScore) gameScore.textContent = String(score).padStart(4, '0');
            if (gameLines) gameLines.textContent = lines;
            if (gameLevel) gameLevel.textContent = level;
        }

        function playerDrop() {
            playerPiece.y++;
            if (collide(board, playerPiece)) {
                playerPiece.y--;
                merge(board, playerPiece);
                clearLines();
                playerPiece = nextPiece;
                nextPiece = createPiece();
                drawNextPiece();
                if (collide(board, playerPiece)) {
                    board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
                    score = 0; lines = 0; level = 1;
                    updateGameStats();
                }
            }
            dropCounter = 0;
        }

        function playerMove(dir) {
            playerPiece.x += dir;
            if (collide(board, playerPiece)) playerPiece.x -= dir;
            else playSfx('move');
        }

        function playerRotate() {
            const matrix = playerPiece.shape;
            const N = matrix.length, M = matrix[0].length;
            let rotated = Array.from({ length: M }, () => Array(N).fill(0));
            for (let r = 0; r < N; r++) {
                for (let c = 0; c < M; c++) {
                    rotated[c][N - 1 - r] = matrix[r][c];
                }
            }
            const oldShape = playerPiece.shape;
            playerPiece.shape = rotated;
            if (collide(board, playerPiece)) playerPiece.shape = oldShape;
            else playSfx('rotate');
        }

        function drawBlock(context, x, y, color, size = BLOCK_SIZE) {
            context.fillStyle = color;
            context.fillRect(x * size, y * size, size - 1, size - 1);
            context.fillStyle = 'rgba(255,255,255,0.3)';
            context.fillRect(x * size, y * size, size - 1, 2);
        }

        function draw() {
            ctx.fillStyle = '#090d16';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (board[r][c] !== 0) drawBlock(ctx, c, r, board[r][c]);
                }
            }

            if (playerPiece) {
                playerPiece.shape.forEach((row, r) => {
                    row.forEach((val, c) => {
                        if (val !== 0) drawBlock(ctx, playerPiece.x + c, playerPiece.y + r, playerPiece.color);
                    });
                });
            }
        }

        function drawNextPiece() {
            nextCtx.fillStyle = '#090d16';
            nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);
            if (nextPiece) {
                const size = 12;
                const offsetX = (nextCanvas.width - nextPiece.shape[0].length * size) / 2 / size;
                const offsetY = (nextCanvas.height - nextPiece.shape.length * size) / 2 / size;
                nextPiece.shape.forEach((row, r) => {
                    row.forEach((val, c) => {
                        if (val !== 0) drawBlock(nextCtx, offsetX + c, offsetY + r, nextPiece.color, size);
                    });
                });
            }
        }

        function runAutoPlay() {
            if (!autoPlay) return;
            if (Math.random() < 0.12) {
                if (Math.random() < 0.5) playerMove(-1);
                else playerMove(1);
            }
            if (Math.random() < 0.06) playerRotate();
        }

        function update(time = 0) {
            const deltaTime = time - lastTime;
            lastTime = time;

            dropCounter += deltaTime;
            if (dropCounter > dropInterval) {
                runAutoPlay();
                playerDrop();
            }

            draw();
            requestAnimationFrame(update);
        }

        drawNextPiece();
        update();

        const btnLeft = document.getElementById('btn-game-left');
        const btnRotate = document.getElementById('btn-game-rotate');
        const btnRight = document.getElementById('btn-game-right');
        const btnDrop = document.getElementById('btn-game-drop');
        const btnToggle = document.getElementById('btn-game-toggle');

        if (btnLeft) btnLeft.addEventListener('click', () => { autoPlay = false; playerMove(-1); });
        if (btnRotate) btnRotate.addEventListener('click', () => { autoPlay = false; playerRotate(); });
        if (btnRight) btnRight.addEventListener('click', () => { autoPlay = false; playerMove(1); });
        if (btnDrop) btnDrop.addEventListener('click', () => { autoPlay = false; playSfx('drop'); playerDrop(); });
        if (btnToggle) btnToggle.addEventListener('click', () => { autoPlay = !autoPlay; btnToggle.textContent = autoPlay ? 'Auto' : 'Manual'; });
    }

    initBrickGame();

    // ==========================================================================
    // 5. MOBILE NAVIGATION MENU
    // ==========================================================================
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = mainNav.classList.toggle('mobile-active');
            mobileMenuToggle.classList.toggle('active', isOpen);
            mobileMenuToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('mobile-active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            });
        });

        document.addEventListener('click', (e) => {
            if (!mainNav.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                mainNav.classList.remove('mobile-active');
                mobileMenuToggle.classList.remove('active');
                mobileMenuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }

    // ==========================================================================
    // 6. PROJECTS OVERLAY DIALOG & FILTERING
    // ==========================================================================
    const allProjectsDialog = document.getElementById('all-projects-dialog');
    const openAllProjectsBtn = document.getElementById('open-all-projects-btn');
    const closeOverlayBtn = document.getElementById('close-overlay-btn');
    const overlayCloseAction = document.getElementById('overlay-close-action');

    if (openAllProjectsBtn && allProjectsDialog) {
        openAllProjectsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            allProjectsDialog.showModal();
        });
    }

    if (closeOverlayBtn && allProjectsDialog) {
        closeOverlayBtn.addEventListener('click', () => allProjectsDialog.close());
    }

    if (overlayCloseAction && allProjectsDialog) {
        overlayCloseAction.addEventListener('click', () => allProjectsDialog.close());
    }

    if (allProjectsDialog) {
        allProjectsDialog.addEventListener('click', (e) => {
            if (e.target === allProjectsDialog) {
                allProjectsDialog.close();
            }
        });
    }

    // Category filtering
    const overlayFilterButtons = document.querySelectorAll('#all-projects-dialog .filter-btn');
    const overlayProjectCards = document.querySelectorAll('#all-projects-dialog .project-card');

    overlayFilterButtons.forEach(button => {
        button.addEventListener('click', () => {
            overlayFilterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');

            overlayProjectCards.forEach(card => {
                const categories = card.getAttribute('data-category').split(' ');
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    card.classList.remove('hidden');
                } else {
                    card.classList.add('hidden');
                }
            });
        });
    });

    // ==========================================================================
    // 7. PROJECT SPECIFICATION MODAL DIALOG
    // ==========================================================================
    const projectModal = document.getElementById('project-modal');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const modalCloseAction = document.getElementById('modal-close-action');

    const projectData = {
        p1: {
            title: 'Fusion Rush: Gamified Boolean Logic & AI Tutoring',
            type: 'Scopus ICETT 2026 Paper',
            image: 'images/fusionrush.jpg',
            videoUrl: 'images/fusion-rush-demo.mp4',
            desc: 'AI tutoring software providing gamified learning on the Rules of Inference for Discrete Math. Deployed and tested by students in coordination with CIT-U instructors and accepted at the Scopus-indexed ICETT 2026 Conference.',
            highlights: [
                'Accepted paper at Scopus-indexed ICETT 2026 Conference.',
                'Gamified step-by-step logic solver algorithm for propositional calculus.',
                'Evaluated by Computer Science students and faculty with high usability ratings.'
            ],
            tech: ['Python', 'AI Tutoring', 'Discrete Math', 'Scopus ICETT 2026']
        },
        p2: {
            title: 'Visual AI Logic Proof Parser & Evaluator',
            type: 'PCSC 2026 Davao Presentation',
            image: 'images/visualai.jpg',
            videoUrl: '',
            desc: 'System using Visual AI to scan, parse, and evaluate validity and scoring of handwritten Discrete Math proofs. Presented at the Philippine Computing Science Congress (PCSC) 2026 in Davao.',
            highlights: [
                'Presented at PCSC 2026 national conference in Davao.',
                'Visual AI OCR engine trained to read handwritten logical symbols and line proofs.',
                'Automated step validation verifying rule application correctness.'
            ],
            tech: ['Visual AI', 'OCR Parsing', 'Logic Verification', 'PCSC 2026']
        },
        p3: {
            title: 'TakeIt — Event Management & Ticketing System',
            type: 'Web Application',
            image: 'images/takeit.png',
            videoUrl: '',
            desc: 'An end-to-end event management and ticketing platform ensuring smooth booking workflows, ticket distribution, and event organizer dashboard management.',
            highlights: [
                'Complete ticketing checkout flow with digital ticket generation.',
                'Organizer management dashboard for event metrics & attendee tracking.',
                'Optimized relational database schema for high event concurrency.'
            ],
            tech: ['React', 'Node.js', 'Database Design', 'Full-Stack']
        },
        p4: {
            title: 'DishCover — Pantry & Inventory Management App',
            type: 'Web / Mobile App',
            image: 'images/dishcover.png',
            videoUrl: '',
            desc: 'A smart pantry management app enabling users to track food item expiration dates, manage storage inventory, and minimize household food waste.',
            highlights: [
                'Real-time expiration notification logic and category tracking.',
                'Recipe suggestions based on available pantry ingredients.',
                'Clean responsive UI for fast mobile item logging.'
            ],
            tech: ['Full-Stack', 'Inventory Logic', 'UI/UX', 'JavaScript']
        },
        p5: {
            title: 'CropConnect — Direct Farmer Fresh Produce E-Commerce',
            type: 'E-Commerce Platform',
            image: 'images/cropconnect.png',
            videoUrl: '',
            desc: 'A fresh produce e-commerce application bridging local farmers directly with consumers, empowering agricultural communities to list and sell fresh goods transparently.',
            highlights: [
                'Direct farmer-to-consumer marketplace architecture eliminating middlemen fees.',
                'Order processing, fresh inventory management, and price listings.',
                'Designed to empower agricultural workers with digital tools.'
            ],
            tech: ['E-Commerce', 'Django / Python', 'Web Tech', 'AgriTech']
        },
        p6: {
            title: 'Bomberman BattleRoyale — Java PvP Game',
            type: 'Java Multiplayer Game',
            image: 'images/bomberman.png',
            videoUrl: '',
            desc: 'A multiplayer arcade game in Java featuring real-time socket networking, arena shrinking mechanics, and battle-royale styled player-vs-player combat.',
            highlights: [
                'Real-time multi-threaded Java socket client/server networking.',
                'Grid explosion collision algorithms and power-up spawn engine.',
                'Shrinking zone logic forcing high-stakes PvP endgame action.'
            ],
            tech: ['Java', 'Socket Networking', 'OOP Architecture', 'Game Loop']
        },
        p8: {
            title: 'Nexchef — Live Step Cooking & Recipe Platform',
            type: 'Interactive Cooking Prototype',
            image: 'images/nexchef.png',
            videoUrl: '',
            desc: 'An experimental culinary web application enabling users to share recipes and follow synchronized live step timers for precision home cooking.',
            highlights: [
                'Synchronized multi-timer execution engine for sequential cooking steps.',
                'Interactive recipe card layout with measurement adjusters.',
                'Community recipe publishing and rating UI.'
            ],
            tech: ['JavaScript', 'Web Timers', 'UX Design']
        }
    };

    let activeModalProject = null;
    const modalMediaContainer = document.getElementById('modal-project-media');
    const mediaTabBtns = document.querySelectorAll('.media-tab-btn');

    function renderModalMedia(tabType) {
        if (!activeModalProject || !modalMediaContainer) return;

        if (tabType === 'screenshot') {
            if (activeModalProject.image) {
                modalMediaContainer.innerHTML = `
                    <div class="modal-media-wrapper">
                        <img src="${activeModalProject.image}" alt="${activeModalProject.title} Screenshot Preview" class="modal-media-img">
                    </div>
                `;
            } else {
                modalMediaContainer.innerHTML = `
                    <div class="empty-media-box">
                        <span>Media Area Placeholder</span>
                    </div>
                `;
            }
        } else if (tabType === 'video') {
            if (activeModalProject.videoUrl) {
                modalMediaContainer.innerHTML = `
                    <div class="modal-media-wrapper">
                        <video controls class="modal-media-video">
                            <source src="${activeModalProject.videoUrl}">
                            Your browser does not support the video tag.
                        </video>
                    </div>
                `;
            } else {
                modalMediaContainer.innerHTML = `
                    <div class="empty-media-box">
                        <span>Video Demo Placeholder</span>
                    </div>
                `;
            }
        }
    }

    mediaTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            mediaTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const mediaType = btn.getAttribute('data-media-tab');
            renderModalMedia(mediaType);
        });
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('.open-modal-btn');
        if (!btn) return;

        const projectId = btn.getAttribute('data-project');
        const data = projectData[projectId];
        activeModalProject = data;

        if (data && projectModal) {
            document.getElementById('modal-project-title').textContent = data.title;
            document.getElementById('modal-project-type').textContent = data.type;
            document.getElementById('modal-project-desc').textContent = data.desc;

            const mediaTabGroup = document.getElementById('modal-media-tab-group');
            if (mediaTabGroup) {
                mediaTabGroup.style.display = (data.videoUrl && data.videoUrl.trim() !== '') ? 'flex' : 'none';
            }

            mediaTabBtns.forEach(b => b.classList.remove('active'));
            const defaultTab = document.querySelector('.media-tab-btn[data-media-tab="screenshot"]');
            if (defaultTab) defaultTab.classList.add('active');

            renderModalMedia('screenshot');

            const highlightsList = document.getElementById('modal-project-highlights');
            highlightsList.innerHTML = '';
            data.highlights.forEach(item => {
                const li = document.createElement('li');
                li.textContent = item;
                highlightsList.appendChild(li);
            });

            const techTagsContainer = document.getElementById('modal-tech-tags');
            techTagsContainer.innerHTML = '';
            data.tech.forEach(tech => {
                const span = document.createElement('span');
                span.className = 'skill-tag glass-tag';
                span.innerHTML = `<span class="tag-dot"></span>${tech}`;
                techTagsContainer.appendChild(span);
            });

            projectModal.showModal();
        }
    });

    if (closeModalBtn && projectModal) closeModalBtn.addEventListener('click', () => projectModal.close());
    if (modalCloseAction && projectModal) modalCloseAction.addEventListener('click', () => projectModal.close());
    if (projectModal) {
        projectModal.addEventListener('click', (e) => {
            if (e.target === projectModal) projectModal.close();
        });
    }

    // ==========================================================================
    // 8. EMAIL COPY TO CLIPBOARD
    // ==========================================================================
    const copyEmailBtn = document.getElementById('copy-email-btn');
    if (copyEmailBtn) {
        copyEmailBtn.addEventListener('click', () => {
            const email = 'roddneilgemina@gmail.com';
            navigator.clipboard.writeText(email).then(() => {
                const span = copyEmailBtn.querySelector('span');
                const originalText = span.textContent;
                span.textContent = 'Copied!';
                copyEmailBtn.style.backgroundColor = 'var(--accent-pink)';
                copyEmailBtn.style.color = '#ffffff';
                playSfx('clear');
                setTimeout(() => {
                    span.textContent = originalText;
                    copyEmailBtn.style.backgroundColor = '';
                    copyEmailBtn.style.color = '';
                }, 2000);
            }).catch(err => {
                console.error('Failed to copy email: ', err);
            });
        });
    }
});
