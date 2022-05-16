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
}

const ballInitialPosition = new Point( boardCenterX - boardWidth * 0.2, offset + boardHeight * 0.7)
const derectionDeciderRadius = ballRadius * 5;
const myGoalPoint = new Point(boardCenterX, boardCenterY + goalBoardCenterInterval);
const opponentGoalPoint = new Point(boardCenterX, boardCenterY - goalBoardCenterInterval);

const trajectoryNumber = 5;
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
const derectionDecider = canvas
    .append("circle")
    .attr("cx", ballInitialPosition.x)
    .attr("cy", ballInitialPosition.y)
    .attr("r", derectionDeciderRadius)
    .attr("fill", "rgba(30,230,30, 0.5)")
    .call(
        d3.drag()
            .on("drag", (event) => {
                deleteTrajectory();
                deleteHandle();
                const ballX = Number(ball.attr("cx"));
                const ballY = Number(ball.attr("cy"));
                drawAllTrajectory(ballX, ballY, event.x, event.y);
                drawHandle(ballX, ballY, event.x, event.y)
                derectionPosition.x = event.x - ballX;
                derectionPosition.y = event.y - ballY;
            })
    );
const ball = canvas
    .append("circle")
    .attr("cx", ballInitialPosition.x)
    .attr("cy", ballInitialPosition.y)
    .attr("r", ballRadius)
    .attr("fill", "rgb(200,130,120)")
    .attr("stroke", "white")
    .attr("stroke-width", 3)
    .style("filter", "drop-shadow(0px 3px 10px rgba(0,0,0,0.2))")
    .call(
        d3.drag()
            .on("drag", (event) => {
                const ballPosition = new Point(event.x, event.y);
                if (!isInboard(ballPosition)) return;
                deleteTrajectory();
                deleteHandle();
                deleteNoticeLine();
                ball.attr("cx", event.x)
                    .attr("cy", event.y);
                derectionDecider
                    .attr("cx", event.x)
                    .attr("cy", event.y);
                drawAllTrajectory(event.x, event.y, event.x + derectionPosition.x, event.y + derectionPosition.y);
                drawHandle(event.x, event.y, event.x + derectionPosition.x, event.y + derectionPosition.y);
                drawAllNoticeLine(ballPosition);
            })
);
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
//         drawAllTrajectory(Number(ball.attr("cx")), Number(ball.attr("cy")),
//             Number(ball.attr("cx")) + derectionPosition.x,
//             Number(ball.attr("cy"))+ derectionPosition.y)
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

function calculateCollisionPoint(x1, y1, x2, y2) {
    if (x1 < x2) {
        let collisionY = y1 + (ballCollisionRight - x1) * (y2 - y1) / (x2 - x1);
        if (isInboardY(collisionY)) return { x: ballCollisionRight, y: collisionY };
    } else if (x2 < x1) {
        let collisionY = y1 + (ballCollisionLeft - x1) * (y2 - y1) / (x2 - x1);
        if (isInboardY(collisionY)) return { x: ballCollisionLeft, y: collisionY };
    } else {
        return y1 > y2 ? { x: x1, y: ballCollisionTop } : { x: x1, y: ballCollisionBottom };
    }
    if (y1 < y2) {
        return { x: (ballCollisionBottom - y1) * (x2 - x1) / (y2 - y1) + x1, y: ballCollisionBottom };
    } else {
        return { x: (ballCollisionTop - y1) * (x2 - x1) / (y2 - y1) + x1, y: ballCollisionTop };
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

function drawAllTrajectory(x1, y1, x2, y2) {
    let startPoint = { x: x1, y: y1 };
    let endPoint = { x: x2, y: y2 };
    for (let i = 0; i < trajectoryNumber; i++) {
        const collisionPoint =
            calculateCollisionPoint(startPoint.x, startPoint.y,
                endPoint.x, endPoint.y);
        drawTrajectory(startPoint, collisionPoint);
        endPoint = calculateNextEndPoint(startPoint, collisionPoint);
        startPoint = { x: collisionPoint.x, y: collisionPoint.y };
    } 
}

function distanceOfTwoPoints(p1, p2) {
    return ((p2.x - p1.x) ** 2 + (p2.y - p1.y) ** 2) ** (1 / 2);
}

function calculatePositionOfHandle(startPoint, endPoint) {
    const magnification = derectionDeciderRadius /
        distanceOfTwoPoints(startPoint, endPoint);
    return {
        x: startPoint.x + (endPoint.x - startPoint.x) * magnification,
        y: startPoint.y + (endPoint.y - startPoint.y) * magnification
    };
}

function drawHandle(x1, y1, x2, y2) {
    const startPoint = new Point(x1, y1);
    const endPoint = new Point(x2, y2);
    const potisionOfHandle = calculatePositionOfHandle(startPoint, endPoint);
    const handle = canvas.append("circle")
        .attr("class", "handle")
        .attr("cx", potisionOfHandle.x)
        .attr("cy", potisionOfHandle.y)
        .attr("r", 10)
        .attr("fill", "rgba(30,230,30)")
        .attr("stroke", "white")
        .attr("stroke-width", 2)
        .style("filter", "drop-shadow(0px 3px 10px rgba(0,0,0,0.2))")
        .call(
            d3.drag()
                .on("drag", (event) => {
                    deleteTrajectory();
                    const ballPoint = new Point(Number(ball.attr("cx")), Number(ball.attr("cy")));
                    const eventPoint = new Point(event.x, event.y);
                    const ballX = Number(ball.attr("cx"));
                    const ballY = Number(ball.attr("cy"));
                    drawAllTrajectory(ballX, ballY, event.x, event.y);
                    const potisionOfHandle =
                        calculatePositionOfHandle(ballPoint, eventPoint);
                    handle
                        .attr("cx", potisionOfHandle.x)
                        .attr("cy", potisionOfHandle.y);
                    derectionPosition.x = event.x - ballX;
                    derectionPosition.y = event.y - ballY;
        }))
}

function deleteHandle() {
    d3.selectAll(".handle").remove()
}

function calculateLineEquationParamter(p1, p2) {
    if (p1.x == p2.x) {
        a = 1;
        b = 0;
        c = - p1.x;
    } else if (p1.y == p2.y) {
        a = 0;
        b = 1;
        c = - p1.y;
    } else {
        a = 1;
        b = (p2.x - p1.x) / (p1.y - p2.y);
        c = - p1.x - b * p1.y;
    }
    return { a: a, b: b, c: c };
}

function distanceBetweenPointAndLine(lineEquationParameter, p) {
    return Math.abs(lineEquationParameter.a * p.x +
        lineEquationParameter.b * p.y +
        lineEquationParameter.c) /
    (lineEquationParameter.a ** 2 + lineEquationParameter.b ** 2) ** (1 / 2);
}

function isIntoOpponentGoal(startPoint, goalPoint) {
    const lineEquationParameter = calculateLineEquationParamter(startPoint, goalPoint);
    const distance = distanceBetweenPointAndLine(lineEquationParameter, opponentGoalPoint);
    return distance <= goalRadius;
}

function isIntoMyGoal(startPoint, goalPoint) {
    const lineEquationParameter = calculateLineEquationParamter(startPoint, goalPoint);
    const distance = distanceBetweenPointAndLine(lineEquationParameter, myGoalPoint);
    return distance <= goalRadius;
}

function isIntoOpponentGoalFirst(startPoint, endPoint) {
    for (let i = 0; i < trajectoryNumber; i++) {
        const collisionPoint =
            calculateCollisionPoint(startPoint.x, startPoint.y,
                endPoint.x, endPoint.y);
        if (isIntoMyGoal(startPoint, collisionPoint)) return false;
        if (isIntoOpponentGoal(startPoint, collisionPoint)) return true;
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
    .attr("stroke", "rgb(256,0,0)");
}

function drawAllNoticeLine(ballPosition) {
    const angleDevide = 1800;
    for (let i = 0; i < angleDevide; i++){
        const angle = i / angleDevide * 2 * Math.PI;
        const destnationPotision =
            new Point(ballPosition.x + derectionDeciderRadius * Math.cos(angle),
                ballPosition.y + derectionDeciderRadius * Math.sin(angle));
        if (isIntoOpponentGoalFirst(ballPosition, destnationPotision)) {
            drawNoticeLine(ballPosition, destnationPotision);
        }
    }
}

function deleteNoticeLine() {
    d3.selectAll(".notice-line").remove()
}

let derectionPosition = {
    x: boardWidth * 0.4,
    y: - boardHeight * 0.3
};

drawAllTrajectory(ballInitialPosition.x, ballInitialPosition.y,
    ballInitialPosition.x + derectionPosition.x, ballInitialPosition.y + derectionPosition.y);
drawHandle(ballInitialPosition.x, ballInitialPosition.y,
    ballInitialPosition.x + derectionPosition.x, ballInitialPosition.y + derectionPosition.y);
drawAllNoticeLine(ballInitialPosition);