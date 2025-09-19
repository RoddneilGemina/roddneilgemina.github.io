// Rotating 3D Cube in JavaScript
class RotatingCube {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        // 3D cube vertices (x, y, z)
        this.vertices = [
            [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], // Back face
            [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]      // Front face
        ];

        // Define the 12 edges of the cube (vertex indices)
        this.edges = [
            [0, 1], [1, 2], [2, 3], [3, 0], // Back face edges
            [4, 5], [5, 6], [6, 7], [7, 4], // Front face edges
            [0, 4], [1, 5], [2, 6], [3, 7]  // Connecting edges
        ];

        // Define the 6 faces of the cube (vertex indices)
        this.faces = [
            [0, 1, 2, 3], // Back face
            [4, 5, 6, 7], // Front face
            [0, 1, 5, 4], // Bottom face
            [2, 3, 7, 6], // Top face
            [0, 3, 7, 4], // Left face
            [1, 2, 6, 5]  // Right face
        ];

        // Face colors
        this.colors = [
            'rgba(255, 0, 0, 0.7)',   // Red - Back
            'rgba(0, 255, 0, 0.7)',   // Green - Front
            'rgba(0, 0, 255, 0.7)',   // Blue - Bottom
            'rgba(255, 255, 0, 0.7)', // Yellow - Top
            'rgba(255, 0, 255, 0.7)', // Magenta - Left
            'rgba(0, 255, 255, 0.7)'  // Cyan - Right
        ];

        // Camera/projection settings
        this.distance = 5;
        this.focalLength = 200;

        // Animation
        this.angleX = 0;
        this.angleY = 0;
        this.angleZ = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.animate();
    }

    setupCanvas() {
        this.canvas.style.background = '#000';
        this.ctx.translate(this.width / 2, this.height / 2);
    }

    // 3D rotation matrices
    rotateX(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            point[0],
            point[1] * cos - point[2] * sin,
            point[1] * sin + point[2] * cos
        ];
    }

    rotateY(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            point[0] * cos + point[2] * sin,
            point[1],
            -point[0] * sin + point[2] * cos
        ];
    }

    rotateZ(point, angle) {
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            point[0] * cos - point[1] * sin,
            point[0] * sin + point[1] * cos,
            point[2]
        ];
    }

    // Project 3D point to 2D screen coordinates
    project3D(point) {
        const scale = this.focalLength / (this.distance + point[2]);
        return [
            point[0] * scale,
            point[1] * scale
        ];
    }

    // Transform all vertices
    transformVertices() {
        return this.vertices.map(vertex => {
            let point = [...vertex];

            // Apply rotations
            point = this.rotateX(point, this.angleX);
            point = this.rotateY(point, this.angleY);
            point = this.rotateZ(point, this.angleZ);

            // Project to 2D
            return this.project3D(point);
        });
    }

    // Calculate face normal for depth sorting
    getFaceNormal(faceVertices3D) {
        const v1 = faceVertices3D[1].map((val, i) => val - faceVertices3D[0][i]);
        const v2 = faceVertices3D[2].map((val, i) => val - faceVertices3D[0][i]);

        // Cross product
        return [
            v1[1] * v2[2] - v1[2] * v2[1],
            v1[2] * v2[0] - v1[0] * v2[2],
            v1[0] * v2[1] - v1[1] * v2[0]
        ];
    }

    // Get average Z depth of a face
    getFaceDepth(faceVertices3D) {
        return faceVertices3D.reduce((sum, vertex) => sum + vertex[2], 0) / faceVertices3D.length;
    }

    render() {
        // Clear canvas
        this.ctx.clearRect(-this.width / 2, -this.height / 2, this.width, this.height);

        // Transform all vertices
        const projectedVertices = this.transformVertices();

        // Get 3D vertices for depth calculation
        const vertices3D = this.vertices.map(vertex => {
            let point = [...vertex];
            point = this.rotateX(point, this.angleX);
            point = this.rotateY(point, this.angleY);
            point = this.rotateZ(point, this.angleZ);
            return point;
        });

        // Prepare faces with depth information
        const facesWithDepth = this.faces.map((face, index) => {
            const faceVertices3D = face.map(vertexIndex => vertices3D[vertexIndex]);
            const normal = this.getFaceNormal(faceVertices3D);
            const depth = this.getFaceDepth(faceVertices3D);

            return {
                face,
                depth,
                normal,
                color: this.colors[index],
                index
            };
        });

        // Sort faces by depth (painter's algorithm)
        facesWithDepth.sort((a, b) => a.depth - b.depth);

        // Draw faces
        facesWithDepth.forEach(({ face, normal, color }) => {
            // Only draw faces facing towards the camera (back-face culling)
            if (normal[2] < 0) {
                this.ctx.beginPath();

                face.forEach((vertexIndex, i) => {
                    const [x, y] = projectedVertices[vertexIndex];
                    if (i === 0) {
                        this.ctx.moveTo(x, y);
                    } else {
                        this.ctx.lineTo(x, y);
                    }
                });

                this.ctx.closePath();
                this.ctx.fillStyle = color;
                this.ctx.fill();
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });

        // Draw wireframe edges for better visibility
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2;

        this.edges.forEach(edge => {
            const [start, end] = edge;
            const [x1, y1] = projectedVertices[start];
            const [x2, y2] = projectedVertices[end];

            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.lineTo(x2, y2);
            this.ctx.stroke();
        });
    }

    animate() {
        // Update rotation angles
        this.angleX += 0.01;
        this.angleY += 0.015;
        this.angleZ += 0.005;

        // Render the cube
        this.render();

        // Continue animation
        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create canvas if it doesn't exist
    if (!document.getElementById('cubeCanvas')) {
        const canvas = document.createElement('canvas');
        canvas.id = 'cubeCanvas';
        canvas.width = 800;
        canvas.height = 600;
        canvas.style.border = '1px solid #333';
        canvas.style.display = 'block';
        canvas.style.margin = '20px auto';
        document.body.appendChild(canvas);
    }

    // Start the rotating cube
    const cube = new RotatingCube('cubeCanvas');
});