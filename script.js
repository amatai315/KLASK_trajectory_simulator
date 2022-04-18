const canvasWidth = 400;
const canvasHeight = canvasWidth * 1.4;
const offset = 20;
const boardWidth = 300;
const boardHeight = boardWidth * 1.4;

const biscuitCirclePositionDifferenceRaito = 0.25;
const biscuitCircleInterval = boardWidth * biscuitCirclePositionDifferenceRaito;
const goalBoardCenterPositionDifferenceRatio = 0.4;
const goalBoardCenterInterval = boardHeight * goalBoardCenterPositionDifferenceRatio;
const biscuitRadius = 5;
const goalRadius = 20;
const serviceAreaRadius = 50;
const ballRadius = 8;

const boardCenterX = offset + boardWidth / 2;
const boardCenterY = offset + boardHeight / 2;

const ballCollisionLeft = offset + ballRadius;
const ballCollisionRight = offset + boardWidth - ballRadius;
const ballCollisionTop = offset + ballRadius;
const ballCollisionBottom = offset + boardHeight - ballRadius;

let derectionPosition = {
    x: 5,
    y: 10
};

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
                const collisionPoint =
                    calculateCollisionPoint(ballX, ballY, event.x, event.y);
                drawTrajectory(ballX, ballY, collisionPoint.x, collisionPoint.y);
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
                const collisionPoint =
                    calculateCollisionPoint(event.x, event.y, event.x + derectionPosition.x, event.y + derectionPosition.y);
                drawTrajectory(event.x, event.y, collisionPoint.x, collisionPoint.y);
            })
);

let collision_point = [
    { x: ballCollisionRight, y: 90 },
    { x: 230, y: ballCollisionTop }
];

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

drawTrajectory(ball.attr("cx"), ball.attr("cy"), collision_point[0].x, collision_point[0].y);
