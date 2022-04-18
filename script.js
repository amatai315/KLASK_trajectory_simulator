const canvas_width = 400;
const canvas_height = canvas_width * 1.4;
const offset = 20;
const board_width = 300;
const board_height = board_width * 1.4;
const biscuit_circle_position_difference_ratio = 0.25;
const biscuit_circle_interval = board_width * biscuit_circle_position_difference_ratio;
const board_center_x = offset + board_width / 2;
const board_center_y = offset + board_height / 2;
const biscuit_radius = 5;

const canvas = d3
    .select("body")
    .append("svg")
    .attr("width", canvas_width)
    .attr("height", canvas_height);
const board = canvas
    .append("rect")
    .attr("x", offset)
    .attr("y", offset)
    .attr("width", board_width)
    .attr("height", board_height)
    .attr("fill", "rgb(31, 63, 223)");
const biscuit_circle_left = canvas
    .append("circle")
    .attr("cx", board_center_x - biscuit_circle_interval)
    .attr("cy", board_center_y)
    .attr("r", biscuit_radius)
    .attr("fill", "white");
const biscuit_circle_center = canvas
    .append("circle")
    .attr("cx", board_center_x)
    .attr("cy", board_center_y)
    .attr("r", biscuit_radius)
    .attr("fill", "white");
const biscuit_circle_right = canvas
    .append("circle")
    .attr("cx", board_center_x + biscuit_circle_interval)
    .attr("cy", board_center_y)
    .attr("r", biscuit_radius)
    .attr("fill", "white");
