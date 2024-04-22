import React from "react";
import Graph from "../../modulesCalculator/graph/Graph";
import Point from "../../modulesCalculator/Math3D/entities/Point";
import Light from "../../modulesCalculator/Math3D/entities/Light";
import Sphera from "../../modulesCalculator/Math3D/surfaces/sphere";
import Math3D from "../../modulesCalculator/Math3D/Math3D";

window.requestAnimFrame = (function () {
    return window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        window.mozRequestAnimationFrame ||
        window.oRequestAnimationFrame ||
        window.msRequestAnimationFrame ||
        function (callback) {
            window.setTimeout(callback, 1000 / 60);
        };
})();

class Graph3D extends React.Component{
    constructor(props) {
        super(props);
        this.WIN = {
            LEFT: -10,
            BOTTOM: -10,
            WIDTH: 20,
            HEIGHT: 20,
            CENTER: new Point(0, 0, -30),
            CAMERA: new Point(0, 0, -50),
        }

        this.math3D = new Math3D({ WIN: this.WIN });
        this.LIGHT = new Light(-40, 15, 0, 1500);

        this.scene = [new Sphera()];

        this.dx = 0;
        this.dy = 0;

        this.canMove = false;
        this.drawPoints = true;
        this.drawEdges = true;
        this.drawPolygons = true;

        this.colorPoints = '#d26ef5';
        this.colorEdges = '#d26ef5';
        this.colorPolygons = { r: 255, g: 255, b: 0 };

        this.sizePoints = 1;
        this.sizeEdges = 1;

        setInterval(() => {
            this.scene.forEach(surface => surface.doAnimation(this.math3D));
        }, 50);

        let FPS = 0;
        let countFPS = 0;
        let timestamp = Date.now();

        const renderLoop = () => {
            countFPS++;
            const currentTimestamp = Date.now();
            if (currentTimestamp - timestamp >= 1000) {
                FPS = countFPS;
                countFPS = 0;
                timestamp = currentTimestamp;
            }

            this.renderScene(FPS);
            window.requestAnimFrame(renderLoop);
        }
        renderLoop();
    }
    mouseup() {
        this.canMove = false;
    }

    mousedown() {
        this.canMove = true;
    }

    wheel(event) {
        event.preventDefault();
        const delta = (event.wheelDelta > 0) ? 0.9 : 1.1;
        const matrix = this.math3D.zoom(delta)
        this.scene.forEach(surface =>
            surface.points.forEach(point => this.math3D.transform(matrix, point))
        );
    }

    mousemove(event) {
        if (this.canMove) {
            const alpha = Math.PI / 180 / 4;
            const matrix1 = this.math3D.rotateOx((this.dy - event.offsetY) * alpha);
            const matrix2 = this.math3D.rotateOy((this.dx - event.offsetX) * alpha);
            const matrix = this.math3D.getTransform(matrix1, matrix2);
            this.scene.forEach(surface =>
                surface.points.forEach(point => this.math3D.transform(matrix, point))
            );
        }
        this.dx = event.offsetX;
        this.dy = event.offsetY;

    }

    SolarSystem() {
        const Earth = this.surfaces.sphere({ r: 5, color: '#ffff' });
        Earth.addAnimation('rotateOy', 0.1);
        const Moon = this.surfaces.sphere({ r: 2, x0: 16 });
        Moon.addAnimation('rotateOz', 0.2);
        Moon.addAnimation('rotateOy', 0.05, Earth.center);
        return [Earth, Moon];
    }
    
    renderScene(FPS) {

        //console.log(FPS);

        this.graph.clear();
        if (this.drawPolygons) {
            const polygons = [];
            this.scene.forEach((surface, index) => {
                this.math3D.calcDistance(surface, this.WIN.CAMERA, `distance`);
                this.math3D.calcDistance(surface, this.LIGHT, `lumen`);
                this.math3D.calcCenter(surface);
                this.math3D.calcRadius(surface);
                this.math3D.calcVisibility(surface, this.WIN.CAMERA);
                surface.polygons.forEach(polygon => {
                    polygon.index = index
                    polygons.push(polygon);
                });
            });

            this.math3D.sortByArtistAlgorithm(polygons);

            polygons.forEach(polygon => {
                if (polygon.visibility) {
                    polygon.color = this.colorPolygons;
                    const points = polygon.points.map(index =>
                        new Point(
                            this.math3D.xs(this.scene[polygon.index].points[index]),
                            this.math3D.ys(this.scene[polygon.index].points[index])
                        )
                    );
                    const { isShadow, dark } = this.math3D.calcShadow(polygon, this.scene, this.LIGHT);
                    const lumen = this.math3D.calcIllumination(polygon.lumen, this.LIGHT.lumen * (isShadow ? dark : 1));
                    let { r, g, b } = polygon.color;
                    r = Math.round(r * lumen);
                    g = Math.round(g * lumen);
                    b = Math.round(b * lumen);
                    this.graph.polygon(points, polygon.rgbToHex(r, g, b));
                }
            });
        }

        if (this.drawPoints) {
            this.scene.forEach(surface => {
                surface.points.forEach(point =>
                    this.graph.point(this.math3D.xs(point), this.math3D.ys(point), this.colorPoints, this.sizePoints)
                )
            });
        }

        if (this.drawEdges) {
            this.scene.forEach(surface => {
                surface.edges.forEach(edge => {
                    const point1 = surface.points[edge.p1];
                    const point2 = surface.points[edge.p2];
                    this.graph.line(
                        this.math3D.xs(point1), this.math3D.ys(point1),
                        this.math3D.xs(point2), this.math3D.ys(point2), this.colorEdges, this.sizeEdges
                    );
                })
            });
        }
        this.graph.text(FPS, -8, 8);
        this.graph.renderFrame();
    }


    componentDidMount(){
        this.graph = new Graph({
            WIN: this.WIN,
            id: 'canvas3D',
            width: 600,
            height: 600,
            WIN: this.WIN,
            callbacks: {
                wheel: (event) => this.wheel(event),
                mousemove: (event) => this.mousemove(event),
                mouseup: () => this.mouseup(),
                mousedown: () => this.mousedown(),
            }
        });
    }

    render(){
        return(<>
            <div className="controls-container">
                <label for="drawPoints">Нарисовать точки</label>
                <input className = 'customSurface' data-custom = 'drawPoints' type='checkbox' id='drawPoints' checked> </input>
            
                <label for="drawEdges">Нарисовать ребра</label>
                <input className = 'customSurface' data-custom = 'drawEdges' type='checkbox' id='drawEdges' checked> </input>
                
                <label for="drawPolygons">Нарисовать полигоны</label>
                <input className = 'customSurface' data-custom = 'drawPolygons' type='checkbox' id='drawPolygons' checked> </input>

                <select id = 'selectSurface'>
                    <option value="cube">Кубик</option>
                    <option value="thor">Бублик</option>
                    <option value="sphere">Шар</option>
                    <option value="ellipsoid">Эллипсоид</option>
                    <option value='cone'>Конус</option>
                    <option value="kleinBottle">Бутылка Клейна</option>
                    <option value='hyperbolicCylinder'>Гиперболический цилиндр</option>
                    <option value='parabolicCylinder'>Параболический цилиндр</option>
                    <option value='ellipticalCylinder'>Эллиптический цилиндр</option>
                    <option value='singleLineHyperboloid'>Однополосной гиперболоид</option>
                    <option value='twoLineHyperboloid'>Двуполосной гиперболоид</option>
                    <option value='ellipticalParaboloid'>Эллиптический параболоид</option>
                    <option value='hyperbolicParaboloid'> Гиперболический параболоид</option>
                </select>

                <div >
                    <label for = 'colorPoints'> Цвет точек</label>
                    <input type='color' id = 'colorPoints'> </input>                    
                    <label for = 'colorEdges'> Цвет ребер</label>
                    <input type='color' id = 'colorEdges'> </input>

                    <label for = 'colorPolygons'>Цвет полигонов</label>
                    <input type = 'color' id = 'colorPolygons'> </input>
                </div>

                <div>
                    <label for="pointsSizeRange">Размер точек</label>
                    <input type="range" min="1" max="15" value="1"  className = 'customSizeRange' data-custom = 'sizePoints' id="pointsSizeRange"> </input>
                    <input type="number" min="1" max="15" value="1" className = 'customSizeInput' data-custom = 'sizePoints' id="pointsSizeInput"> px </input>
                </div>

                <div>
                    <label for='edgesSizeRange'>Размер ребер</label>
                    <input type="range" min="1" max="10" value="1" className = 'customSizeRange' data-custom = 'sizeEdges' id="edgesSizeRange"> </input>
                    <input type="number" min="1" max="10" value="1"  className = 'customSizeInput' data-custom = 'sizeEdges' id="edgesSizeInput"> px </input>
                </div>

                <div>
                    <label for = 'powerBrightnessRange'>Яркость</label>
                    <input type="range" min="1" max="4000" value="1500" id="powerBrightnessRange"> </input>
                    <input type="number" min="1" max="4000" value="1500" id="powerBrightnessInput"> лм</input>
                </div>
                
            </div>
                <canvas id='canvas3D'></canvas>
        </>);
    }
}

export default Graph3D;