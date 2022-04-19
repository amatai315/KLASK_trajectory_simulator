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
const canvasHeight = boardHeight + offset * 2;

const boardCenterX = offset + boardWidth / 2;
const boardCenterY = offset + boardHeight / 2;

const ballCollisionLeft = offset + ballRadius;
const ballCollisionRight = offset + boardWidth - ballRadius;
const ballCollisionTop = offset + ballRadius;
const ballCollisionBottom = offset + boardHeight - ballRadius;

const trajectoryNumber = 4;
const coefficientOfRestitutionBetweenBallAndWall = 0.9;

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
    .attr("cx", boardCenterX)
    .attr("cy", boardCenterY + goalBoardCenterInterval)
    .attr("r", goalRadius)
    .attr("fill", "rgb(100,150,256)");
const opponent_goal = canvas
    .append("circle")
    .attr("cx", boardCenterX)
    .attr("cy", boardCenterY - goalBoardCenterInterval)
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
    .attr("cx", boardCenterX)
    .attr("cy", offset + boardHeight * 0.7)
    .attr("r", ballRadius * 5)
    .attr("fill", "rgba(30,230,30, 0.5)")
    .call(
        d3.drag()
            .on("drag", (event) => {
                deleteTrajectory();
                const ballX = Number(ball.attr("cx"));
                const ballY = Number(ball.attr("cy"));
                drawAllTrajectory(ballX, ballY, event.x, event.y);
                derectionPosition.x = event.x - ballX;
                derectionPosition.y = event.y - ballY;
            })
    );
const ball = canvas
    .append("circle")
    .attr("cx", boardCenterX)
    .attr("cy", offset + boardHeight * 0.7)
    .attr("r", ballRadius)
    .attr("fill", "rgb(200,130,120)")
    .call(
        d3.drag()
            .on("drag", (event) => {
                deleteTrajectory();
                if (!isInboardX(event.x) || !isInboardY(event.y)) return;
                ball.attr("cx", event.x)
                    .attr("cy", event.y);
                derectionDecider
                    .attr("cx", event.x)
                    .attr("cy", event.y);
                drawAllTrajectory(event.x, event.y, event.x + derectionPosition.x, event.y + derectionPosition.y);
            })
);

function drawTrajectory(startPointX, startPointY, goalPointX, goalPointY) {
    canvas.append("line")
        .attr("class", "trajectory")
        .attr("x1", startPointX)
        .attr("y1", startPointY)
        .attr("x2", goalPointX)
        .attr("y2", goalPointY)
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

function calculateNextEndPoint(x1, y1, x2, y2) {
    if (x2 == ballCollisionLeft || x2 == ballCollisionRight) {
        return {
            x: x1 * coefficientOfRestitutionBetweenBallAndWall +
                x2 * (1 - coefficientOfRestitutionBetweenBallAndWall),
            y: 2 * y2 - y1
        };
    }
    return {
        x: 2 * x2 - x1, y: y1 * coefficientOfRestitutionBetweenBallAndWall +
            y2 * (1 - coefficientOfRestitutionBetweenBallAndWall)
    };
}

function drawAllTrajectory(x1, y1, x2, y2) {
    let startPoint = { x: x1, y: y1 };
    let endPoint = { x: x2, y: y2 };
    for (let i = 0; i < trajectoryNumber; i++) {
        const collisionPoint =
            calculateCollisionPoint(startPoint.x, startPoint.y,
                endPoint.x, endPoint.y);
        drawTrajectory(startPoint.x, startPoint.y, collisionPoint.x, collisionPoint.y);
        endPoint = calculateNextEndPoint(startPoint.x, startPoint.y,
            collisionPoint.x, collisionPoint.y);
        startPoint = { x: collisionPoint.x, y: collisionPoint.y };
    } 
}

let derectionPosition = {
    x: boardWidth * 0.4,
    y: - boardHeight * 0.3
};

const firstBallX = Number(ball.attr("cx"));
const firstBallY = Number(ball.attr("cy"));
drawAllTrajectory(firstBallX, firstBallY, firstBallX + derectionPosition.x, firstBallY + derectionPosition.y);