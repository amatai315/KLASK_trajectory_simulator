const canvasWidth = 400;
const canvasHeight = canvasWidth * 1.4;
const offset = 20;
const boardWidth = 300;
const boardHeight = boardWidth * 1.4;
const biscuitCirclePositionDifferenceRaito = 0.25;
const biscuitCircleInterval = boardWidth * biscuitCirclePositionDifferenceRaito;
const goalBoardCenterPositionDifferenceRatio = 0.4;
const goalBoardCenterInterval = boardHeight * goalBoardCenterPositionDifferenceRatio;
const boardCenterX = offset + boardWidth / 2;
const boardCenterY = offset + boardHeight / 2;
const biscuitRadius = 5;
const goalRadius = 20;
const serviceAreaRadius = 50;
const ballRadius = 8;

const ballCollisionLeft = offset + ballRadius;
const ballCollisionRight = offset + boardWidth - ballRadius;
const ballCollisionTop = offset + ballRadius;
const ballCollisionBottom = offset + boardHeight - ballRadius;

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
                ball.attr("cx", event.x)
                    .attr("cy", event.y);
                drawTrajectory(ball.attr("cx"), ball.attr("cy"), collision_point[0].x, collision_point[0].y);
            })
);

let collision_point = [
    {x: ballCollisionRight, y: 100}
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

drawTrajectory(ball.attr("cx"), ball.attr("cy"), collision_point[0].x, collision_point[0].y);