const canvas_width = 400;
const canvas_height = canvas_width * 1.4;
const offset = 20;
const board_width = 300;
const board_height = board_width * 1.4;
const biscuit_circle_position_difference_ratio = 0.25;
const biscuit_circle_interval = board_width * biscuit_circle_position_difference_ratio;
const goal_board_center_position_difference_ratio = 0.4;
const goal_board_center_interval = board_height * goal_board_center_position_difference_ratio;
const board_center_x = offset + board_width / 2;
const board_center_y = offset + board_height / 2;
const biscuit_radius = 5;
const goal_radius = 20;
const service_area_radius = 50;

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
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const biscuit_circle_center = canvas
    .append("circle")
    .attr("cx", board_center_x)
    .attr("cy", board_center_y)
    .attr("r", biscuit_radius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const biscuit_circle_right = canvas
    .append("circle")
    .attr("cx", board_center_x + biscuit_circle_interval)
    .attr("cy", board_center_y)
    .attr("r", biscuit_radius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const my_goal = canvas
    .append("circle")
    .attr("cx", board_center_x)
    .attr("cy", board_center_y + goal_board_center_interval)
    .attr("r", goal_radius)
    .attr("fill", "rgb(100,150,256)");
const opponent_goal = canvas
    .append("circle")
    .attr("cx", board_center_x)
    .attr("cy", board_center_y - goal_board_center_interval)
    .attr("r", goal_radius)
    .attr("fill", "rgb(100,150,256)");
const my_service_area_left = canvas
    .append("circle")
    .attr("cx", offset)
    .attr("cy", offset + board_height)
    .attr("r", service_area_radius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const my_service_area_right = canvas
    .append("circle")
    .attr("cx", offset + board_width)
    .attr("cy", offset + board_height)
    .attr("r", service_area_radius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const opponent_service_area_left = canvas
    .append("circle")
    .attr("cx", offset + board_width)
    .attr("cy", offset)
    .attr("r", service_area_radius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");
const opponent_service_area_right = canvas
    .append("circle")
    .attr("cx", offset)
    .attr("cy", offset)
    .attr("r", service_area_radius)
    .attr("stroke", "white")
    .attr("stroke-width", "2")
    .attr("fill", "rgba(0,0,0,0)");