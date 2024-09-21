const realBoardWidth = 319;
const realBoardHeight = 421;
const realBiscuitRadius = 9 / 2;
const realBiscuitCircleInterval = 85;
const realGoalRadius = 37 / 2;
const realDefferenceBetweenGoalToBoardCenter = (313 + realGoalRadius * 2) / 2;
let realBallRadius = 15 / 2;
const realServiceAreaRadius = 47;
let coefficientOfRestitutionBetweenBallAndWall = 0.5;

const raitoDisplayToReal = 2;

const boardWidth = realBoardWidth * raitoDisplayToReal;
const boardHeight = realBoardHeight * raitoDisplayToReal;
const biscuitRadius = realBiscuitRadius * raitoDisplayToReal;
const biscuitCircleInterval = realBiscuitCircleInterval * raitoDisplayToReal;
const goalRadius = realGoalRadius * raitoDisplayToReal;
const goalBoardCenterInterval = realDefferenceBetweenGoalToBoardCenter * raitoDisplayToReal;
let ballRadius = realBallRadius * raitoDisplayToReal;
const serviceAreaRadius = realServiceAreaRadius * raitoDisplayToReal;

const biscuitInnerColor = "rgba(230,230,230,1)"
const biscuitEdgeColor = "rgb(160,160,160)"

const offset = 20;
const canvasWidth = boardWidth + offset * 2;
const canvasHeight = boardHeight + offset * 2;

const boardCenterX = offset + boardWidth / 2;
const boardCenterY = offset + boardHeight / 2;

let ballCollisionLeft = offset + ballRadius;
let ballCollisionRight = offset + boardWidth - ballRadius;
let ballCollisionTop = offset + ballRadius;
let ballCollisionBottom = offset + boardHeight - ballRadius;

const wallRight = canvasWidth - offset;
const wallLeft = offset;
const wallTop = offset;
const wallBottom = canvasHeight - offset;

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
const handleArrowWidth = handleRadius * 2.2;

const ballInitialPoint = new Point(boardCenterX - boardWidth * 0.2, offset + boardHeight * 0.7)
let ballDirectionVector = new Point(boardWidth * 0.4, -boardHeight * 0.3);
const initialDestinationPoint = pointAddedAsVector(ballInitialPoint, ballDirectionVector);
const initialHandlePoint = calculatePointOfHandle(ballInitialPoint, initialDestinationPoint);

const trajectoryNumber = 4;
let displayNoticeArcBackwardShot = false;
let displayBiscuit = true;

const canvas = d3
    .select("#board-svg-wrapper")
    .append("svg")
    .style("height", "100%")
    .style("width", "100%")
    .attr("viewBox", `0 0 ${canvasWidth} ${canvasHeight}`);
const board = canvas
    .append("rect")
    .attr("x", offset)
    .attr("y", offset)
    .attr("width", boardWidth)
    .attr("height", boardHeight)
    .attr("fill", "rgb(31, 63, 223)");

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
    .attr("stroke-width", `${raitoDisplayToReal}`)
    .attr("fill", "rgba(0,0,0,0)");
const my_service_area_right = canvas
    .append("circle")
    .attr("cx", offset + boardWidth)
    .attr("cy", offset + boardHeight)
    .attr("r", serviceAreaRadius)
    .attr("stroke", "white")
    .attr("stroke-width", `${raitoDisplayToReal}`)
    .attr("fill", "rgba(0,0,0,0)");
const opponent_service_area_left = canvas
    .append("circle")
    .attr("cx", offset + boardWidth)
    .attr("cy", offset)
    .attr("r", serviceAreaRadius)
    .attr("stroke", "white")
    .attr("stroke-width", `${raitoDisplayToReal}`)
    .attr("fill", "rgba(0,0,0,0)");
const opponent_service_area_right = canvas
    .append("circle")
    .attr("cx", offset)
    .attr("cy", offset)
    .attr("r", serviceAreaRadius)
    .attr("stroke", "white")
    .attr("stroke-width", `${raitoDisplayToReal}`)
    .attr("fill", "rgba(0,0,0,0)");
const ballDragger = canvas
    .append("circle")
    .attr("cx", ballInitialPoint.x)
    .attr("cy", ballInitialPoint.y)
    .attr("r", ballDraggerRadius)
    .attr("fill", "rgba(230,230,30, 0.4)")
    .call(
        d3.drag()
            .on("drag", draggedBall)
    );
for (let i = -1; i < 2; i++){
    canvas
    .append("circle")
    .attr("cx", boardCenterX + i * biscuitCircleInterval)
    .attr("cy", boardCenterY)
    .attr("r", biscuitRadius)
    .attr("stroke", "white")
    .attr("stroke-width", `${raitoDisplayToReal}`)
    .attr("fill", "rgba(0,0,0,0)");
}
for (let i = -1; i < 2; i++){
    canvas
    .append("circle")
    .attr("class", "biscuit")
    .attr("cx", boardCenterX + i * biscuitCircleInterval)
    .attr("cy", boardCenterY)
    .attr("r", biscuitRadius)
    .attr("stroke", biscuitEdgeColor)
    .attr("stroke-width", `${raitoDisplayToReal}`)
    .attr("fill", biscuitInnerColor)
    .call(d3.drag()
        .on("drag", function(event) {
            const biscuitPoint = new Point(Number(d3.select(this).attr("cx")) + event.dx, Number(d3.select(this).attr("cy")) + event.dy);
            if (!isInBoardBiscuit(biscuitPoint)) return;
            d3.select(this).attr("cx",biscuitPoint.x)
                .attr("cy", biscuitPoint.y);
    }));
}
const ball = canvas
    .append("circle")
    .attr("cx", ballInitialPoint.x)
    .attr("cy", ballInitialPoint.y)
    .attr("r", ballRadius)
    .attr("fill", "rgb(200,130,120)")
    .attr("stroke", "white")
    .attr("stroke-width", `${raitoDisplayToReal * 1.5}`)
    .style("filter", "drop-shadow(0px 3px 10px rgba(0,0,0,0.2))")
    .call(
        d3.drag()
            .on("drag", draggedBall)
);
const handle_arrow = canvas.insert("image", ":nth-child(12)")
    .attr("class", "handle")
    .attr("href", `./image/arrow_green.png`)
    .attr("width", handleArrowWidth)
    .attr("height", handleArrowWidth)
    .call(
        d3.drag()
            .on("drag", (event) => {
                deleteTrajectory();
                const ballPoint = getBallPoint();
                const eventPoint = new Point(event.x, event.y);
                drawAllTrajectory(ballPoint, eventPoint);
                const handlePoint = calculatePointOfHandle(ballPoint, eventPoint)
                placeHandle(handlePoint);
                ballDirectionVector = vectorP2ToP1(ballPoint, eventPoint);
                placeHandleArrow(handlePoint, ballDirectionVector);
            }));
const handle = canvas.insert("circle", ":nth-child(12)")
    .attr("class", "handle")
    .attr("r", handleRadius)
    .attr("fill", "rgba(30,150,30,0)")
//    .attr("stroke", "white")
//    .attr("stroke-width", handleRadius / 8)
    .style("filter", "drop-shadow(0px 3px 10px rgba(0,0,0,0.2))");
for (let i = 0; i < 14; i++){
    for (let j = 0; j < 2; j++){
        const text_height = 20;
        const text_width = text_height / 16.5 * 10.84;
        const x = (j == 0) ? offset / 3 : canvasWidth - offset / 3;
        const y = offset + i * boardHeight / 14 + boardHeight / 28;
        const rotation = (j == 0) ? -90 : 90;
        canvas
            .append("text")
            .attr("x", x - text_width / 2)
            .attr("y", y + text_height / 2)
            .attr("font-size", `${text_height / 4 * 3}pt`)
            .attr("transform", `rotate(${rotation}, ${x}, ${y})`)
            .text(`${Math.max(6 - i, i - 7)}`);
    }
}

//remove commentout to adjust coefficient
// const coefficientInput = d3
//     .select("body")
//     .append("input")
//     .attr("id", "coefficient-input")
//     .attr("type", "text")
//     .attr("placeholder", coefficientOfRestitutionBetweenBallAndWall)
//     .on("input", () => {
//         coefficientOfRestitutionBetweenBallAndWall = d3.select("#coefficient-input").node().value;
//         redrawAllTrajectoryAndAllNoticeArc(getBallPoint(), ballDirectionVector);
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

function isInBoardBiscuit(p) {
    return offset + biscuitRadius <= p.x && p.x <= offset + boardWidth - biscuitRadius
        && offset + biscuitRadius <= p.y && p.y <= offset + boardHeight - biscuitRadius
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

function placeHandleArrow(handlePoint, ballDirectionVector) {
    handle_arrow
        .attr("x", handlePoint.x - handleArrowWidth / 2)
        .attr("y", handlePoint.y - handleArrowWidth / 2)
        .attr("transform", `rotate(${Math.atan2(ballDirectionVector.y, ballDirectionVector.x) * 180 / Math.PI},${handlePoint.x}, ${handlePoint.y})`)
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
        if (startPoint.y == ballCollisionBottom && !displayNoticeArcBackwardShot) return false;
        if (startPoint.y != ballCollisionTop && i == trajectoryNumber - 1 ) return false; //this case may not occur in real games.
        const isIntoOpponentGoal = 
            didCollideLineSegmentAndCircle(startPoint, collisionPoint, opponentGoalPoint, goalRadius);
        const isIntoMyGoal = 
            didCollideLineSegmentAndCircle(startPoint, collisionPoint, myGoalPoint, goalRadius);
        if (isIntoOpponentGoal && isIntoMyGoal) {
            return distanceOfTwoPoints(startPoint, opponentGoalPoint) < distanceOfTwoPoints(startPoint, myGoalPoint);
        }
        if (isIntoOpponentGoal) return true;
        if (isIntoMyGoal) return false;
        if (startPoint.y == ballCollisionTop && collisionPoint.y == ballCollisionBottom) return false; //this case may not occur in real games.
        endPoint = calculateNextEndPoint(startPoint, collisionPoint);
        startPoint = collisionPoint;
    }
    return false;
}

function drawNoticeArc(p1, p2, ballPoint) {
    canvas.insert("path", ":nth-child(8)")
        .attr("class", "notice-arc")
        .attr("fill", "rgb(256,256,256)")
        .attr("stroke", "rgb(256,256,256)")
        .attr("d", `M ${p1.x},${p1.y} 
        A ${ballDraggerRadius} ${ballDraggerRadius} 0 0 1 ${p2.x},${p2.y}
        L ${ballPoint.x},${ballPoint.y} z`);
}

function drawAllNoticeArc(ballPoint) {
    const angleDevide = 1800;
    let arcStartPoint = new Point(ballPoint.x + ballDraggerRadius, ballPoint.y);
    let preIsIntoOpponentGoalFirst = isIntoOpponentGoalFirst(ballPoint, arcStartPoint);
    for (let i = 0; i < angleDevide; i++){
        const angle = i / angleDevide * 2 * Math.PI;
        const destinationPoint =
            new Point(ballPoint.x + ballDraggerRadius * Math.cos(angle),
                ballPoint.y + ballDraggerRadius * Math.sin(angle));
        if (i % (angleDevide / 4) == 0 && preIsIntoOpponentGoalFirst) {
            //this condition is needed because arc is drawn as one whose angle is lesser than 180 degrees.
            drawNoticeArc(arcStartPoint, destinationPoint, ballPoint)
            arcStartPoint = destinationPoint
        } else if (preIsIntoOpponentGoalFirst && !isIntoOpponentGoalFirst(ballPoint, destinationPoint)) {
            drawNoticeArc(arcStartPoint, destinationPoint, ballPoint);
        } else if (!preIsIntoOpponentGoalFirst && isIntoOpponentGoalFirst(ballPoint, destinationPoint)) {
            arcStartPoint = destinationPoint;
        }
        preIsIntoOpponentGoalFirst = isIntoOpponentGoalFirst(ballPoint, destinationPoint)
    }
    if (preIsIntoOpponentGoalFirst) {
        drawNoticeArc(arcStartPoint, new Point (ballPoint.x + ballDraggerRadius, ballPoint.y), ballPoint)
    }
}

function deleteNoticeArc() {
    d3.selectAll(".notice-arc").remove()
}

function isInWallY(y) {
    return wallTop <= y && y <= wallBottom;
}

function calculateWallIntersectPoint(startPoint, endPoint) {
    const x1 = startPoint.x;
    const y1 = startPoint.y;
    const x2 = endPoint.x;
    const y2 = endPoint.y;
    if (x1 < x2) {
        let collisionY = y1 + (wallRight - x1) * (y2 - y1) / (x2 - x1);
        if (isInWallY(collisionY)) return new Point(wallRight, collisionY);
    } else if (x2 < x1) {
        let collisionY = y1 + (wallLeft - x1) * (y2 - y1) / (x2 - x1);
        if (isInWallY(collisionY)) return new Point(wallLeft, collisionY);
    } else {
        return y1 > y2 ? new Point(x1, wallTop) : new Point(x1, wallBottom);
    }
    if (y1 < y2) {
        return new Point((wallBottom - y1) * (x2 - x1) / (y2 - y1) + x1, wallBottom);
    } else {
        return new Point((wallTop - y1) * (x2 - x1) / (y2 - y1) + x1, wallTop);
    }
}

function areOnDifferentWall(p1, p2) {
    if (p1.x == wallLeft || p1.x == wallRight) {
        if (p1.x == p2.x) return false;
    }
    if (p1.y == wallTop || p1.y == wallBottom) {
        return p1.y != p2.y;
    }
    return true
}

function calculateNearestWallCorner(p) {
    let nearestWallCorner = new Point(wallLeft, wallTop);
    [wallTop, wallBottom].forEach(y => {
        [wallLeft, wallRight].forEach(x => {
            if (distanceOfTwoPoints(new Point(x, y), p)<
                distanceOfTwoPoints(nearestWallCorner, p)) {
                nearestWallCorner = new Point(x, y)
                }
        })
    });
    return nearestWallCorner;
}

function drawNoticeTriangle(ballPoint, p1, p2){
    canvas.insert("path", ":nth-child(8)")
        .attr("class", "notice-triangle")
        .attr("fill", "rgba(256,256,256, 0.2)")
        .attr("stroke", "rgba(256,256,256, 0.2)")
        .attr("d", `M ${p1.x},${p1.y} 
        L ${p2.x},${p2.y}
        L ${ballPoint.x},${ballPoint.y} z`);
}

function drawAllNoticeTriangle(ballPoint) {
    const angleDevide = 1800;
    let lineStartPoint = calculateWallIntersectPoint(ballPoint, pointAddedAsVector(ballPoint, new Point(1, 0)));
    let preIsIntoOpponentGoalFirst = isIntoOpponentGoalFirst(ballPoint, lineStartPoint);
    for (let i = 0; i < angleDevide; i++){
        const angle = i / angleDevide * 2 * Math.PI;
        const destinationPoint = 
            calculateWallIntersectPoint(ballPoint,
                pointAddedAsVector(ballPoint, new Point(Math.cos(angle), Math.sin(angle))));
        if (preIsIntoOpponentGoalFirst && areOnDifferentWall(lineStartPoint, destinationPoint)) {
            const nearestWallCorner = calculateNearestWallCorner(destinationPoint);
            drawNoticeTriangle(ballPoint, lineStartPoint, nearestWallCorner)
            lineStartPoint = nearestWallCorner;
        } else if (preIsIntoOpponentGoalFirst && !isIntoOpponentGoalFirst(ballPoint, destinationPoint)) {
            drawNoticeTriangle(ballPoint, lineStartPoint, destinationPoint);
        } else if (!preIsIntoOpponentGoalFirst && isIntoOpponentGoalFirst(ballPoint, destinationPoint)) {
            lineStartPoint = destinationPoint;
        }
        preIsIntoOpponentGoalFirst = isIntoOpponentGoalFirst(ballPoint, destinationPoint)
    }
    if (preIsIntoOpponentGoalFirst) {
        drawNoticeTriangle(ballPoint, lineStartPoint,
            calculateWallIntersectPoint(ballPoint, pointAddedAsVector(ballPoint, new Point(1,0))))
    }
}

function deleteNoticeTriangle() {
    d3.selectAll(".notice-triangle").remove()
}

function draggedBall(event) {
    const preBallPoint = getBallPoint();
    const ballPoint = new Point(preBallPoint.x + event.dx, preBallPoint.y + event.dy);
    if (!isInboard(ballPoint)) return;
    ball.attr("cx", ballPoint.x)
        .attr("cy", ballPoint.y);
    ballDragger
        .attr("cx", ballPoint.x)
        .attr("cy", ballPoint.y);
    redrawAllTrajectoryAndAllNoticeArc(ballPoint, ballDirectionVector);
    const destinationPoint = pointAddedAsVector(ballPoint, ballDirectionVector);
    const handlePoint = calculatePointOfHandle(ballPoint, destinationPoint)
    placeHandle(handlePoint);
    placeHandleArrow(handlePoint, ballDirectionVector);
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

function redrawAllTrajectoryAndAllNoticeArc(ballPoint, ballDirectionVector) {
    deleteTrajectory();
    deleteNoticeArc();
    deleteNoticeTriangle();
    const destinationPoint = pointAddedAsVector(ballPoint, ballDirectionVector);
    drawAllTrajectory(ballPoint, destinationPoint);
    drawAllNoticeArc(ballPoint);
    drawAllNoticeTriangle(ballPoint);
}


function onclickButtonBallVer2019() {
    setVer2019BallCharacteristics();
    document.getElementById("ball-ver-2019-button").style.backgroundColor = "aqua";
    document.getElementById("ball-ver-2023-button").style.backgroundColor = "aliceblue";
}

function onclickButtonBallVer2023() {
    setVer2023BallCharacteristics();
    document.getElementById("ball-ver-2019-button").style.backgroundColor = "aliceblue";
    document.getElementById("ball-ver-2023-button").style.backgroundColor = "aqua";
}

function reconfigureRealBallRadius(realBallRadius) {
    ballRadius = realBallRadius * raitoDisplayToReal;
    ball.attr("r", ballRadius)
    ballCollisionLeft = offset + ballRadius;
    ballCollisionRight = offset + boardWidth - ballRadius;
    ballCollisionTop = offset + ballRadius;
    ballCollisionBottom = offset + boardHeight - ballRadius;
}

function setVer2019BallCharacteristics() {
    reconfigureRealBallRadius(14.5 / 2);
    coefficientOfRestitutionBetweenBallAndWall = 0.8;
    redrawAllTrajectoryAndAllNoticeArc(getBallPoint(), ballDirectionVector);
}

function setVer2023BallCharacteristics() {
    reconfigureRealBallRadius(15 / 2);
    coefficientOfRestitutionBetweenBallAndWall = 0.5;
    redrawAllTrajectoryAndAllNoticeArc(getBallPoint(), ballDirectionVector);
}

function onclickButtonBackwardShot() {
    displayNoticeArcBackwardShot = !displayNoticeArcBackwardShot;
    document.getElementById("backward-shot-button").style.backgroundColor = displayNoticeArcBackwardShot ? "aqua" : "aliceblue";
    redrawAllTrajectoryAndAllNoticeArc(getBallPoint(), ballDirectionVector);
}

function onclickButtonDisplayBiscuit() {
    displayBiscuit = !displayBiscuit
    document.getElementById("display-biscuit-button").style.backgroundColor = displayBiscuit ? "aqua" : "aliceblue";
    if (displayBiscuit) d3.selectAll(".biscuit").attr("visibility", "visible");
    else d3.selectAll(".biscuit").attr("visibility", "hidden");
}

placeHandle(initialHandlePoint);
placeHandleArrow(initialHandlePoint, ballDirectionVector);
drawAllTrajectory(ballInitialPoint, initialDestinationPoint);
drawAllNoticeArc(ballInitialPoint);
drawAllNoticeTriangle(ballInitialPoint);