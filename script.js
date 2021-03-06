const realBoardWidth = 319;
const realBoardHeight = 421;
const realBiscuitRadius = 9 / 2;
const realBiscuitCircleInterval = 85;
const realGoalRadius = 37 / 2;
const realDefferenceBetweenGoalToBoardCenter = (313 + realGoalRadius * 2) / 2;
const realBallRadius = 14.5 / 2;
const realServiceAreaRadius = 47;

const raitoDisplayToReal = 2;

const boardWidth = realBoardWidth * raitoDisplayToReal;
const boardHeight = realBoardHeight * raitoDisplayToReal;
const biscuitRadius = realBiscuitRadius * raitoDisplayToReal;
const biscuitCircleInterval = realBiscuitCircleInterval * raitoDisplayToReal;
const goalRadius = realGoalRadius * raitoDisplayToReal;
const goalBoardCenterInterval = realDefferenceBetweenGoalToBoardCenter * raitoDisplayToReal;
const ballRadius = realBallRadius * raitoDisplayToReal;
const serviceAreaRadius = realServiceAreaRadius * raitoDisplayToReal;

const offset = 20;
const canvasWidth = boardWidth + offset * 2;
const canvasHeight = boardHeight + offset * 2 + boardHeight * 0.3;

const boardCenterX = offset + boardWidth / 2;
const boardCenterY = offset + boardHeight / 2;

const ballCollisionLeft = offset + ballRadius;
const ballCollisionRight = offset + boardWidth - ballRadius;
const ballCollisionTop = offset + ballRadius;
const ballCollisionBottom = offset + boardHeight - ballRadius;

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    get norm() {
        return this.calcNorm();
    }

    get unitVector() {
        return new Point(this.x / this.calcNorm(), this.y / this.calcNorm());
    }

    calcNorm() {
        return (this.x ** 2 + this.y ** 2) ** (1 / 2);
    }
}

const myGoalPoint = new Point(boardCenterX, boardCenterY + goalBoardCenterInterval);
const opponentGoalPoint = new Point(boardCenterX, boardCenterY - goalBoardCenterInterval);

const ballDraggerRadius = ballRadius * 5;
const handleRadius = ballRadius * 2;

const ballInitialPoint = new Point(boardCenterX - boardWidth * 0.2, offset + boardHeight * 0.7)
let ballDirectionVector = new Point(boardWidth * 0.4, -boardHeight * 0.3);
const initialDestinationPoint = pointAddedAsVector(ballInitialPoint, ballDirectionVector);
const initialHandlePoint = calculatePointOfHandle(ballInitialPoint, initialDestinationPoint);

const trajectoryNumber = 4;
const coefficientOfRestitutionBetweenBallAndWall = 0.8;

const canvas = d3
    .select("body")
    .append("svg")
    .attr("width", canvasWidth)
    .attr("height", canvasHeight);
const board = canvas
    .append("rect")
    .attr("x", offset)
    .attr("y", offset)
    .attr("width", boardWidth)
    .attr("height", boardHeight)
    .attr("fill", "rgb(31, 63, 223)");
const biscuit_circle_left = canvas
    .append("circle")
    .attr("cx", boardCenterX - biscuitCircleInterval)
    .attr("cy", boardCenterY)
    .attr("r", biscuitRadius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const biscuit_circle_center = canvas
    .append("circle")
    .attr("cx", boardCenterX)
    .attr("cy", boardCenterY)
    .attr("r", biscuitRadius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const biscuit_circle_right = canvas
    .append("circle")
    .attr("cx", boardCenterX + biscuitCircleInterval)
    .attr("cy", boardCenterY)
    .attr("r", biscuitRadius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const my_goal = canvas
    .append("circle")
    .attr("cx", myGoalPoint.x)
    .attr("cy", myGoalPoint.y)
    .attr("r", goalRadius)
    .attr("fill", "rgb(100,150,256)");
const opponent_goal = canvas
    .append("circle")
    .attr("cx", opponentGoalPoint.x)
    .attr("cy", opponentGoalPoint.y)
    .attr("r", goalRadius)
    .attr("fill", "rgb(100,150,256)");
const my_service_area_left = canvas
    .append("circle")
    .attr("cx", offset)
    .attr("cy", offset + boardHeight)
    .attr("r", serviceAreaRadius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const my_service_area_right = canvas
    .append("circle")
    .attr("cx", offset + boardWidth)
    .attr("cy", offset + boardHeight)
    .attr("r", serviceAreaRadius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const opponent_service_area_left = canvas
    .append("circle")
    .attr("cx", offset + boardWidth)
    .attr("cy", offset)
    .attr("r", serviceAreaRadius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const opponent_service_area_right = canvas
    .append("circle")
    .attr("cx", offset)
    .attr("cy", offset)
    .attr("r", serviceAreaRadius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const ballDragger = canvas
    .append("circle")
    .attr("cx", ballInitialPoint.x)
    .attr("cy", ballInitialPoint.y)
    .attr("r", ballDraggerRadius)
    .attr("fill", "rgba(230,230,30, 0.5)")
    .call(
        d3.drag()
            .on("drag", draggedBall)
    );
const ball = canvas
    .append("circle")
    .attr("cx", ballInitialPoint.x)
    .attr("cy", ballInitialPoint.y)
    .attr("r", ballRadius)
    .attr("fill", "rgb(200,130,120)")
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .style("filter", "drop-shadow(0px 3px 10px rgba(0,0,0,0.2))")
    .call(
        d3.drag()
            .on("drag", draggedBall)
);
const handle = canvas.insert("circle", ":nth-child(12)")
    .attr("class", "handle")
    .attr("cx", initialHandlePoint.x)
    .attr("cy", initialHandlePoint.y)
    .attr("r", handleRadius)
    .attr("fill", "rgba(30,150,30)")
    .attr("stroke", "white")
    .attr("stroke-width", handleRadius / 8)
    .style("filter", "drop-shadow(0px 3px 10px rgba(0,0,0,0.2))")
    .call(
        d3.drag()
            .on("drag", (event) => {
                deleteTrajectory();
                const ballPoint = getBallPoint();
                const eventPoint = new Point(event.x, event.y);
                drawAllTrajectory(ballPoint, eventPoint);
                placeHandle(calculatePointOfHandle(ballPoint, eventPoint));
                ballDirectionVector = vectorP2ToP1(ballPoint, eventPoint);
            }));
//remove commentout to adjust coefficient
// const coefficientInput = d3
//     .select("body")
//     .append("input")
//     .attr("id", "coefficient-input")
//     .attr("type", "text")
//     .attr("placeholder", coefficientOfRestitutionBetweenBallAndWall)
//     .on("input", () => {
//         coefficientOfRestitutionBetweenBallAndWall = d3.select("#coefficient-input").node().value;
//         deleteTrajectory();
//         const ballPoint = new Point(Number(ball.attr("cx")), Number(ball.attr("cy"));
//         const destinationPoint = new Point(ballPoint.x + ballDirectionVector.x, ballPoint.y + ballDirectionVector.y);
//         drawAllTrajectory(ballPoint, destinationPoint);
//     });

function drawTrajectory(p1, p2) {
    canvas.append("line")
        .attr("class", "trajectory")
        .attr("x1", p1.x)
        .attr("y1", p1.y)
        .attr("x2", p2.x)
        .attr("y2", p2.y)
        .attr("stroke", "rgb(30,230,30)");
}

function deleteTrajectory() {
    d3.selectAll(".trajectory").remove()
}

function isInboardY(y) {
    return ballCollisionTop <= y && y <= ballCollisionBottom;
}
function isInboardX(x) {
    return ballCollisionLeft <= x && x <= ballCollisionRight;
}

function isInboard(p) {
    return isInboardX(p.x) && isInboardY(p.y);
}

function calculateCollisionPoint(startPoint, endPoint) {
    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = endPoint.y;
    if (x1 < x2) {
        let collisionY = y1 + (ballCollisionRight - x1) * (y2 - y1) / (x2 - x1);
        if (isInboardY(collisionY)) return new Point(ballCollisionRight, collisionY);
    } else if (x2 < x1) {
        let collisionY = y1 + (ballCollisionLeft - x1) * (y2 - y1) / (x2 - x1);
        if (isInboardY(collisionY)) return new Point(ballCollisionLeft, collisionY);
    } else {
        return y1 > y2 ? new Point(x1, ballCollisionTop) : new Point(x1, ballCollisionBottom);
    }
    if (y1 < y2) {
        return new Point((ballCollisionBottom - y1) * (x2 - x1) / (y2 - y1) + x1, ballCollisionBottom);
    } else {
        return new Point((ballCollisionTop - y1) * (x2 - x1) / (y2 - y1) + x1, ballCollisionTop);
    }
}

function calculateNextEndPoint(startPoint, endPoint) {
    if (endPoint.x == ballCollisionLeft || endPoint.x == ballCollisionRight) {
        return new Point(startPoint.x * coefficientOfRestitutionBetweenBallAndWall +
            endPoint.x * (1 - coefficientOfRestitutionBetweenBallAndWall),
            2 * endPoint.y - startPoint.y);
    }
    return new Point(2 * endPoint.x - startPoint.x,
        startPoint.y * coefficientOfRestitutionBetweenBallAndWall +
        endPoint.y * (1 - coefficientOfRestitutionBetweenBallAndWall));
}

function drawAllTrajectory(startPoint, endPoint) {
    for (let i = 0; i < trajectoryNumber; i++) {
        const collisionPoint =
            calculateCollisionPoint(startPoint, endPoint);
        drawTrajectory(startPoint, collisionPoint);
        endPoint = calculateNextEndPoint(startPoint, collisionPoint);
        startPoint = new Point(collisionPoint.x, collisionPoint.y)
    } 
}

function distanceOfTwoPoints(p1, p2) {
    return ((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) ** (1 / 2);
}

function calculatePointOfHandle(startPoint, endPoint) {
    const magnification = ballDraggerRadius /
        distanceOfTwoPoints(startPoint, endPoint);
    return new Point(startPoint.x + (endPoint.x - startPoint.x) * magnification,
        startPoint.y + (endPoint.y - startPoint.y) * magnification);
}

function placeHandle(handlePoint) {
    handle
        .attr("cx", handlePoint.x)
        .attr("cy", handlePoint.y)
}

function didCollideLineSegmentAndCircle(lineSegmentPoint1, lineSegmentPoint2, centerPoint, circleRadius){
    const lineSegmentVector = vectorP2ToP1(lineSegmentPoint1, lineSegmentPoint2);
    const lineSegmentUnitVector = lineSegmentVector.unitVector;
    const vectorPoint1ToCenter = vectorP2ToP1(lineSegmentPoint1, centerPoint);
    if (Math.abs(crossProduct(lineSegmentUnitVector, vectorPoint1ToCenter)) > circleRadius) return false;
    const vectorPoint2ToCenter = vectorP2ToP1(lineSegmentPoint2, centerPoint);
    if (innerProduct(lineSegmentVector, vectorPoint1ToCenter) *
        innerProduct(lineSegmentVector, vectorPoint2ToCenter) <= 0) return true;
    return vectorPoint1ToCenter.norm <= circleRadius || vectorPoint2ToCenter.norm <= circleRadius;
}

function isIntoOpponentGoalFirst(startPoint, endPoint) {
    for (let i = 0; i < trajectoryNumber; i++) {
        const collisionPoint =
            calculateCollisionPoint(startPoint, endPoint);
        if (collisionPoint.y == ballCollisionBottom) return false;
        const isIntoOpponentGoal = 
            didCollideLineSegmentAndCircle(startPoint, collisionPoint, opponentGoalPoint, goalRadius);
        const isIntoMyGoal = 
            didCollideLineSegmentAndCircle(startPoint, collisionPoint, myGoalPoint, goalRadius);
        if (isIntoOpponentGoal && isIntoMyGoal) {
            return distanceOfTwoPoints(startPoint, opponentGoalPoint) < distanceOfTwoPoints(startPoint, myGoalPoint);
        }
        if (isIntoOpponentGoal) return true;
        if (isIntoMyGoal) return false;
        endPoint = calculateNextEndPoint(startPoint, collisionPoint);
        startPoint = collisionPoint;
    }
    return false;
}

function drawNoticeLine(p1, p2) {
    canvas.insert("line", ":nth-child(11)")
    .attr("class", "notice-line")
    .attr("x1", p1.x)
    .attr("y1", p1.y)
    .attr("x2", p2.x)
    .attr("y2", p2.y)
    .attr("stroke", "rgb(256,256,256)");
}

function drawAllNoticeLine(ballPoint) {
    const angleDevide = 1800;
    for (let i = 0; i < angleDevide; i++){
        const angle = i / angleDevide * 2 * Math.PI;
        const destinationPoint =
            new Point(ballPoint.x + ballDraggerRadius * Math.cos(angle),
                ballPoint.y + ballDraggerRadius * Math.sin(angle));
        if (isIntoOpponentGoalFirst(ballPoint, destinationPoint)) {
            drawNoticeLine(ballPoint, destinationPoint);
        }
    }
}

function deleteNoticeLine() {
    d3.selectAll(".notice-line").remove()
}

function draggedBall(event) {
    const ballPoint = new Point(event.x, event.y);
    if (!isInboard(ballPoint)) return;
    deleteTrajectory();
    deleteNoticeLine();
    const destinationPoint = pointAddedAsVector(ballPoint, ballDirectionVector);
    ball.attr("cx", ballPoint.x)
        .attr("cy", ballPoint.y);
    ballDragger
        .attr("cx", ballPoint.x)
        .attr("cy", ballPoint.y);
    drawAllTrajectory(ballPoint, destinationPoint);
    placeHandle(calculatePointOfHandle(ballPoint, destinationPoint));
    drawAllNoticeLine(ballPoint);
}

function getBallPoint() {
    return new Point(Number(ball.attr("cx")), Number(ball.attr("cy")));
}

function pointAddedAsVector(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y);
}

function vectorP2ToP1(p1, p2) {
    return new Point(p2.x - p1.x, p2.y - p1.y);
}

function crossProduct(p1, p2) {
    return p1.x * p2.y - p2.x * p1.y;
}

function innerProduct(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y;
}

drawAllTrajectory(ballInitialPoint, initialDestinationPoint);
drawAllNoticeLine(ballInitialPoint);