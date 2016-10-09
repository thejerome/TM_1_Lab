function init_lab() {
    var container,
        default_animation_data = [
            [0.01, 0.3, 3.5],
            [1.01, 0.8, 3.5],
            [2.02, 1.2, 3.6],
            [3.03, 1.4, 3.7],
            [4.04, 1.9, 3.1],
            [5.05, 2.3, 2.5],
            [6.06, 2.8, 4],
            [7.00, 2.9, 1],
            [8.00, 3.2, 1]
        ],
        lab_animation_data = [],
        THREAD_LENGTH = 140,
        CARGO_HEIGHT = 30,
        FREE_ENDING = 8,
        pendulum_radius,
        experiment_time = 8,
        table_experiments_rows = 1,
        help_active = false,
        graphics_active = false,
        default_var = {
            "radius_bounds": [3, 6],
            "mass": 1
        },
        left_bound,
        right_bound,
        mass,
        lab_var,
        length_coefficient,
        btn_stop_blocked = true,
        btn_launch_blocked = false,
        controls_blocked = false,
        show_graphics_blocked = false,
        pendulum_timeout,
        clock_timeout,
        LEFT_BOUND_TIME = 1,
        RIGHT_BOUND_TIME = 30,
        window = '<div class="vlab_setting"><div class="block_title"><div class="vlab_name">Виртуальная лаборатория «Затухающие колебания»' +
            '</div><input class="btn_help btn" type="button" value="Справка"/></div><div class="block_pendulum">' +
            '<canvas width="350px" height="300px" class="pendulum_canvas">браузер не поддерживает canvas</canvas>' +
            '<div class="pendulum_graphics"><div class="waiting_loading"></div></div><div class="pendulum_clock">00:<span class="clock_seconds"></span>' +
            '</div></div><div class="block_control"><div class="pendulum_cargo_weight"></div>' +
            '<label for="control_radius_slider">Радиус <i>r</i>:</label><input class="control_radius_slider" id="control_radius_slider" type="range" ' +
            'step="0.1" /><input class="control_radius_value" type="number" step="0.1"/> см<label for="control_duration_slider">' +
            'Продолжительность эксперимента <i>S</i>:</label><input class="control_duration_slider" id="control_duration_slider" type="range" max="' + RIGHT_BOUND_TIME + '" min="' + LEFT_BOUND_TIME + '" step="1"/>' +
            '<input class="control_duration_value" type="number" step="1" min="'+ LEFT_BOUND_TIME + '" max="' + RIGHT_BOUND_TIME + '"> c<input class="control_launch btn" type="button" value="Запустить"/>' +
            '<input class="control_stop btn" type="button" value="Стоп"/>' +
            '</div><div class="block_user_table"><div class="block_user_table_caption">Таблица экспериментов</div><table>' +
            '<thead class="user_table_head"><tr><th>№</th><th><i>r</i>, см</th><th><i>t<sub>1</sub></i>, с</th><th>&#966;(<i>t<sub>1</sub></i>), рад</th>' +
            '<th><i>t<sub>2</sub></i>, с</th><th>&#966;(<i>t<sub>2</sub></i>), рад</th><th><i>S</i></th></tr></thead><tbody class="user_table_body">' +
            '<tr class="row_1"><td class="experiment_number">1</td><td class="experiment_radius"><input type="text"/></td>' +
            '<td class="experiment_time_1"><input type="text"/></td><td class="experiment_angle_1"><input type="text"/></td>' +
            '<td class="experiment_time_2"><input type="text"/></td><td class="experiment_angle_2"><input type="text"/></td>' +
            '<td class="experiment_time"><input type="text"/></td></tr></tbody></table>' +
            '<input class="table_add_row btn" type="button" value="+"/><input class="table_delete_row not_active btn" type="button" value="-"/></div>' +
            '<div class="block_user_results"><div><label for="results_gyration_radius">Радиус инерции груза <i>i</i>: </label>' +
            '<input class="results_gyration_radius" id="results_gyration_radius" type="number" step="0.001" min="0"/><span class="results_radius_sm">см</span></div>' +
            '<div><label for="results_friction_coefficient">Коэффициент вязкого трения подшипника &#957;: </label>' +
            '<input class="results_friction_coefficient" id="results_friction_coefficient" type="number" step="0.001" min="0"/></div></div>' +
            '<div class="block_graphics">' +
            '<input class="show_experiment_table btn" type="button" value="Таблица результатов"/>' +
            '<button class="show_graphic_angle btn" type="button">График &#966;(<i>t</i>)</button>' +
            '<button class="show_graphic_speed btn" type="button">График &#631;(<i>t</i>)</button>' +
            '<input class="close_graphics btn" type="button" value="Вернуться к установке"/>' +
            '<div class="experiment_table graphic"><table class="fixed_headers"><thead><tr><th>Время <i>t</i>, с</th><th>Угол отклонения &#966;(<i>t</i>), рад</th>' +
            '<th>Угловая скорость &#631;(<i>t</i>), рад/с</th></tr></thead><tbody>' +
            '</tbody></table></div>' +
            '<div class="graphic_angle graphic"><svg width="600" height="220"></svg></div>' +
            '<div class="graphic_speed graphic"><svg width="600" height="220"></svg></div>' +
            '</div><div class="block_help">Справка</div></div>';

    function freeze_control_block() {
        controls_blocked = true;
        btn_launch_blocked = true;
        btn_stop_blocked = true;
        $(".control_stop").addClass("not_active");
        $(".control_launch").addClass("not_active");
        $(".control_radius_slider").addClass("not_active").attr("readonly", "readonly");
        $(".control_duration_slider").addClass("not_active").attr("readonly", "readonly");
        $(".control_radius_value").addClass("not_active").attr("readonly", "readonly");
        $(".control_duration_value").addClass("not_active").attr("readonly", "readonly");
    }

    function check_user_values(that) {
        that.focusout(function () {
            if ($(this).val().match(/^[0-9]+(\.[0-9]+){0,1}$/)) {
                $(this).attr("value", $(this).val());
            } else {
                if ($(this).val().match(/^[0-9]+(,[0-9]+){0,1}$/)) {
                    $(this).val($(this).val().replace(",", "."));
                    $(this).attr("value", $(this).val());
                } else {
                    $(this).val("");
                    $(this).attr("value", $(this).val());
                }
            }
        });
        that.mouseout(function () {
            if ($(this).val().match(/^[0-9]+(\.[0-9]+){0,1}$/)) {
                $(this).attr("value", $(this).val());
            } else {
                if ($(this).val().match(/^[0-9]+(,[0-9]+){0,1}$/)) {
                    $(this).val($(this).val().replace(",", "."));
                    $(this).attr("value", $(this).val());
                } else {
                    $(this).val("");
                    $(this).attr("value", $(this).val());
                }
            }
        });
    }

    function unfreeze_control_block() {
        btn_launch_blocked = false;
        btn_stop_blocked = true;
        controls_blocked = false;
        $(".control_launch.not_active").removeClass("not_active");
        $(".control_stop").addClass("not_active");
        $(".control_radius_slider.not_active").removeAttr("readonly").removeClass("not_active");
        $(".control_duration_slider.not_active").removeAttr("readonly").removeClass("not_active");
        $(".control_radius_value.not_active").removeAttr("readonly").removeClass("not_active");
        $(".control_duration_value.not_active").removeAttr("readonly").removeClass("not_active");
    }

    function freeze_installation() {
        show_graphics_blocked = true;
        $(".pendulum_graphics").addClass("active_waiting");
    }

    function unfreeze_installation() {
        show_graphics_blocked = false;
        $(".pendulum_graphics").removeClass("active_waiting");
    }

    function stop_animation() {
        clearTimeout(pendulum_timeout);
        clearTimeout(clock_timeout);
        draw_pendulum(pendulum_radius * length_coefficient);
        put_seconds(0);
        unfreeze_control_block();
    }

    function init_experiment_table(table_selector, data) {
        $(table_selector).empty();
        for (var i = 0; i < data.length; i++) {
            $(table_selector).append("<tr><td>" + data[i][0].toFixed(2) + "</td><td><span class='cell_right_align'>" + data[i][1].toFixed(7) +
                "</span></td><td><span class='cell_right_align'>" + data[i][2].toFixed(7) + "</span></td></tr>");
        }
    }

    function init_plot(data, plot_selector, y_coefficient) {
        $(plot_selector).empty();
        var vis = d3.select(plot_selector),
            WIDTH = 600,
            HEIGHT = 220,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            },

            xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(data, function (d) {
                return d[0];
            }),
                d3.max(data, function (d) {
                    return d[0];
                })
            ]),

            yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(data, function (d) {
                return d[y_coefficient];
            }),
                d3.max(data, function (d) {
                    return d[y_coefficient];
                })
            ]),

            xAxis = d3.svg.axis()
                .scale(xRange)
                .tickSize(5)
                .tickSubdivide(true),

            yAxis = d3.svg.axis()
                .scale(yRange)
                .tickSize(5)
                .orient("left")
                .tickSubdivide(true),

            lineFunc = d3.svg.line()
                .x(function (d) {
                    return xRange(d[0]);
                })
                .y(function (d) {
                    return yRange(d[y_coefficient]);
                })
                .interpolate('basis');

        vis.append("svg:g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + (HEIGHT - MARGINS.bottom) + ")")
            .call(xAxis);

        vis.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(" + (MARGINS.left) + ",0)")
            .call(yAxis);

        vis.append("svg:path")
            .attr("d", lineFunc(data))
            .attr("stroke", "blue")
            .attr("stroke-width", 2)
            .attr("fill", "none");
    }

    function increase_table_rows() {
        table_experiments_rows++;
        var new_row = '<tr class="row_' + table_experiments_rows + '">' +
            '<td class="experiment_number">' + table_experiments_rows + '</td>' +
            '<td class="experiment_radius"><input type="text"/></td>' +
            '<td class="experiment_time_1"><input type="text"/></td>' +
            '<td class="experiment_angle_1"><input type="text"/></td>' +
            '<td class="experiment_time_2"><input type="text"/></td>' +
            '<td class="experiment_angle_2"><input type="text"/></td>' +
            '<td class="experiment_time"><input type="text"/></td></tr>';
        $('.user_table_body').append(new_row);
        if ((table_experiments_rows) > 1) {
            $(".table_delete_row.btn.not_active").removeClass("not_active");
        }
    }

    function decrease_table_rows() {
        if (table_experiments_rows > 1) {
            table_experiments_rows--;
            $('.user_table_body tr:last-child').remove();
            if ((table_experiments_rows) === 1) {
                $(".table_delete_row.btn").addClass("not_active");
            }
        }
    }

    function show_graphics_block() {
        if (!show_graphics_blocked) {
            if (!graphics_active) {
                graphics_active = true;
                $(".block_graphics").css("display", "block");
            } else {
                graphics_active = false;
                $(".block_graphics").css("display", "none");
            }
        }
    }

    function show_help() {
        if (!help_active) {
            help_active = true;
            $(".block_help").css("display", "block");
            $(".btn_help").attr("value", "Вернуться");
        } else {
            help_active = false;
            $(".block_help").css("display", "none");
            $(".btn_help").attr("value", "Справка");
        }
    }

    function show_graphic(graphic_show) {
        $(".graphic").css("display", "none");
        $(graphic_show).css("display", "block");
    }

    function draw_pendulum(r) {
        var canvas = $(".pendulum_canvas")[0];
        var ctx = canvas.getContext("2d");
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4f5e6d';
        ctx.strokeStyle = '#000000';
        ctx.save();
        ctx.translate(100, 0);
        ctx.fillRect(0, 0, 100, 50);
        ctx.beginPath();
        ctx.moveTo(100, 30);
        ctx.quadraticCurveTo(110, 30, 120, 100);
        ctx.moveTo(120, 100);
        ctx.quadraticCurveTo(130, 215, 160, 215);
        ctx.moveTo(100, 25);
        ctx.quadraticCurveTo(115, 25, 130, 100);
        ctx.moveTo(130, 100);
        ctx.quadraticCurveTo(145, 160, 180, 160);
        ctx.stroke();
        ctx.strokeStyle = '#af261c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(167, 230);
        ctx.quadraticCurveTo(180, 190, 193, 220);
        ctx.moveTo(193, 220);
        ctx.quadraticCurveTo(206, 260, 219, 230);
        ctx.moveTo(219, 230);
        ctx.quadraticCurveTo(232, 195, 245, 230);
        ctx.moveTo(245, 230);
        ctx.quadraticCurveTo(250, 235, 250, 230);
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(50, 25, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.translate(50, 25);
        ctx.fillStyle = '#777';
        ctx.rotate(Math.PI / 2);
        ctx.fillRect(0, -4, THREAD_LENGTH, 8);
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, 2 * Math.PI);
        ctx.arc(THREAD_LENGTH, 0, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.translate(r, 0);
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(CARGO_HEIGHT, -20);
        ctx.lineTo(CARGO_HEIGHT, 20);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fillStyle = '#f1c901';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, 0, 2, 0, 2 * Math.PI);
        ctx.arc(19, 0, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
    }

    function animate_pendulum(r, data, i) {
        var canvas = $(".pendulum_canvas")[0];
        var ctx = canvas.getContext("2d");
        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#4f5e6d';
        ctx.strokeStyle = '#000000';
        ctx.save();
        ctx.translate(100, 0);
        ctx.fillRect(0, 0, 100, 50);
        ctx.beginPath();
        ctx.moveTo(100, 30);
        ctx.quadraticCurveTo(110, 30, 120, 100);
        ctx.moveTo(120, 100);
        ctx.quadraticCurveTo(130, 215, 160, 215);
        ctx.moveTo(100, 25);
        ctx.quadraticCurveTo(115, 25, 130, 100);
        ctx.moveTo(130, 100);
        ctx.quadraticCurveTo(145, 160, 180, 160);
        ctx.stroke();
        ctx.strokeStyle = '#af261c';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(167, 230);
        ctx.quadraticCurveTo(180, 190, 193, 220);
        ctx.moveTo(193, 220);
        ctx.quadraticCurveTo(206, 260, 219, 230);
        ctx.moveTo(219, 230);
        ctx.quadraticCurveTo(232, 195, 245, 230);
        ctx.moveTo(245, 230);
        ctx.quadraticCurveTo(250, 235, 250, 230);
        ctx.stroke();
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(50, 25, 12, 0, 2 * Math.PI);
        ctx.fill();
        ctx.translate(50, 25);
        ctx.fillStyle = '#777';
        ctx.rotate(data[i][1]+Math.PI/2);
        ctx.fillRect(0, -4, THREAD_LENGTH, 8);
        ctx.beginPath();
        ctx.arc(0, 0, 4, 0, 2 * Math.PI);
        ctx.arc(THREAD_LENGTH, 0, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(0, 0, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fill();
        ctx.translate(r, 0);
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(CARGO_HEIGHT, -20);
        ctx.lineTo(CARGO_HEIGHT, 20);
        ctx.lineTo(0, 10);
        ctx.closePath();
        ctx.fillStyle = '#f1c901';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(12, 0, 2, 0, 2 * Math.PI);
        ctx.arc(19, 0, 2, 0, 2 * Math.PI);
        ctx.closePath();
        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.restore();
        var diff_time;
        if (i === 0) {
            diff_time = data[i][0] * 1000;
        } else {
            diff_time = (data[i][0] - data[i - 1][0]) * 1000;
        }
        i++;
        if (i < data.length) {
            pendulum_timeout = setTimeout(function () {
                animate_pendulum(r, data, i)
            }, diff_time);
        } else {
            pendulum_timeout = setTimeout(function () {
                draw_pendulum(pendulum_radius * length_coefficient);
                unfreeze_control_block();
            }, diff_time);

        }
    }

    function animate_clock(t) {
        if (t >= 1) {
            clock_timeout = setTimeout(function () {
                t--;
                put_seconds(t);
                animate_clock(t)
            }, 1000);
        }
    }

    function put_seconds(sec) {
        var sec_str;
        if (sec < 10) {
            sec_str = "0" + sec;
        } else {
            sec_str = sec;
        }
        $(".clock_seconds").html(sec_str);
    }

    function animate_installation() {
        put_seconds(experiment_time);
        animate_clock(experiment_time);
        animate_pendulum(pendulum_radius * length_coefficient, lab_animation_data, 0);
    }

    function launch() {
        freeze_control_block();
        freeze_installation();
        ANT.calculate();
    }

    function change_radius_value() {
        $(".control_radius_value").val($(".control_radius_slider").val());
        pendulum_radius = $(".control_radius_slider").val();
        draw_pendulum(pendulum_radius * length_coefficient);
    }

    function change_duration_value() {
        $(".control_duration_value").val($(".control_duration_slider").val());
        experiment_time = $(".control_duration_slider").val();
        put_seconds(experiment_time);
    }

    function change_radius_slider() {
        $(".control_radius_slider").val($(".control_radius_value").val());
        pendulum_radius = $(".control_radius_value").val();
        draw_pendulum(pendulum_radius * length_coefficient);
    }

    function change_duration_slider() {
        $(".control_duration_slider").val($(".control_duration_value").val());
        experiment_time = $(".control_duration_value").val();
        put_seconds(experiment_time);
    }

    function parse_variant(str, def_obj) {
        var parse_str;
        if (typeof str === 'string' && str !== "") {
            try {
                parse_str = str.replace(/<br\/>/g, "\r\n").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&lt;br\/&gt;/g, "\r\n")
                    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&minus;/g, "-").replace(/&apos;/g, "\'").replace(/&#0045;/g, "-");
                parse_str = JSON.parse(parse_str);
            } catch (e) {
                if (def_obj){
                    parse_str = def_obj;
                } else {
                    parse_str = false;
                }
            }
        } else {
            if (def_obj){
                parse_str = def_obj;
            } else {
                parse_str = false;
            }
        }
        return parse_str;
    }

    function parse_calculate_results(str, def_obj) {
        var parse_str;
        if (typeof str === 'string' && str !== "") {
            try {
                parse_str = str.replace(/<br\/>/g, "\r\n").replace(/&amp;/g, "&").replace(/&quot;/g, "\"").replace(/&lt;br\/&gt;/g, "\r\n")
                    .replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&minus;/g, "-").replace(/&apos;/g, "\'").replace(/&#0045;/g, "-");
                parse_str = JSON.parse(parse_str);
                parse_str = parse_str.table;
            } catch (e) {
                parse_str = def_obj;
            }
        } else {
            parse_str = def_obj;
        }
        return parse_str;
    }

    function get_variant() {
        var variant;
        if ($("#preGeneratedCode") !== null) {
            variant = parse_variant($("#preGeneratedCode").val(), default_var);
        } else {
            variant = default_var;
        }
        return variant;
    }

    function draw_previous_solution(previous_solution) {
        $("#results_gyration_radius").val(previous_solution.i);
        $("#results_friction_coefficient").val(previous_solution.v);
        if ((previous_solution.table.length) > 1) {
            $(".table_delete_row.btn.not_active").removeClass("not_active");
        }
        table_experiments_rows = 0;
        $('.user_table_body').empty();
        for (var i=0; i < previous_solution.table.length; i++) {
            table_experiments_rows++;
            var new_row = '<tr class="row_' + table_experiments_rows + '">' +
                '<td class="experiment_number">' + table_experiments_rows + '</td>' +
                '<td class="experiment_radius"><input type="text" value="' + previous_solution.r + '"/></td>' +
                '<td class="experiment_time_1"><input type="text" value="' + previous_solution.t1 + '"/></td>' +
                '<td class="experiment_angle_1"><input type="text" value="' + previous_solution.phi1 + '"/></td>' +
                '<td class="experiment_time_2"><input type="text" value="' + previous_solution.t2 + '"/></td>' +
                '<td class="experiment_angle_2"><input type="text" value="' + previous_solution.phi2 + '"/></td>' +
                '<td class="experiment_time"><input type="text" value="' + previous_solution.S + '"/></td></tr>';
            $('.user_table_body').append(new_row);
        }
    }

    function create_length_coefficient(r) {
        var coefficient;
        coefficient = (THREAD_LENGTH - CARGO_HEIGHT - FREE_ENDING) / r;
        return coefficient;
    }

    return {
        init: function () {
            lab_var = get_variant();
            left_bound = lab_var.radius_bounds[0];
            right_bound = lab_var.radius_bounds[1];
            length_coefficient = create_length_coefficient(right_bound);
            pendulum_radius = left_bound + (right_bound - left_bound) / 2;
            mass = lab_var.mass;
            container = $("#jsLab")[0];
            container.innerHTML = window;
            $(".control_stop").addClass("not_active");
            $(".pendulum_cargo_weight").html("Масса груза <i>m</i>: " + mass + " кг");
            $("#control_radius_slider").attr("max", right_bound).attr("min", left_bound).attr("value", pendulum_radius);
            $(".control_radius_value").attr("max", right_bound).attr("min", left_bound).attr("value", pendulum_radius);
            $("#control_duration_slider").attr("value", experiment_time);
            $(".control_duration_value").attr("value", experiment_time);
            put_seconds(experiment_time);
            draw_pendulum(pendulum_radius * length_coefficient);
            if ($("#previousSolution") !== null && $("#previousSolution").length > 0 && parse_variant(      $("#previousSolution").val())) {
                var previous_solution = parse_variant($("#previousSolution").val());
                draw_previous_solution(previous_solution);
            }
            $(".control_launch").on("click", function () {
                if (!btn_launch_blocked) {
                    launch();
                }
            });
            $(".control_radius_slider").change(function () {
                if (!controls_blocked) {
                    change_radius_value();
                }
            });
            $(".control_duration_slider").change(function () {
                if (!controls_blocked) {
                    change_duration_value();
                }
            });
            $(".control_radius_value").change(function () {
                if (!controls_blocked) {
                    if ($(this).val() < left_bound) {
                        $(this).val(left_bound)
                    } else if($(this).val() > right_bound){
                        $(this).val(right_bound)
                    }
                    change_radius_slider();
                }
            });
            $(".control_duration_value").change(function () {
                if (!controls_blocked) {
                    if ($(this).val() < LEFT_BOUND_TIME) {
                        $(this).val(LEFT_BOUND_TIME)
                    } else if($(this).val() > RIGHT_BOUND_TIME){
                        $(this).val(RIGHT_BOUND_TIME)
                    }
                    change_duration_slider();
                }
            });
            $(".table_add_row").click(function () {
                increase_table_rows();
            });
            $(".table_delete_row").click(function () {
                decrease_table_rows();
            });
            $(".btn_help").click(function () {
                show_help();
            });
            $(".pendulum_graphics").click(function () {
                show_graphics_block();
            });
            $(".close_graphics").click(function () {
                show_graphics_block();
            });
            $(".show_experiment_table").click(function () {
                show_graphic(".experiment_table");
            });
            $(".show_graphic_angle").click(function () {
                show_graphic(".graphic_angle");
            });
            $(".show_graphic_speed").click(function () {
                show_graphic(".graphic_speed");
            });
            $(".control_stop").click(function () {
                if (!btn_stop_blocked) {
                    stop_animation();
                }
            });
            $(".block_user_table table").on("focus", "input", function () {
                check_user_values($(this));
            });
            $(".block_user_results input").on("focus", function(){
                check_user_values($(this));
            });
        },
        calculateHandler: function () {
            lab_animation_data = parse_calculate_results(arguments[0], default_animation_data);
            init_plot(lab_animation_data, ".graphic_angle svg", 1);
            init_plot(lab_animation_data, ".graphic_speed svg", 2);
            init_experiment_table(".experiment_table table tbody", lab_animation_data);
            unfreeze_installation();
            btn_stop_blocked = false;
            $(".control_stop.not_active").removeClass("not_active");
            animate_installation();
        },
        getResults: function () {
            var answer = {
                "table": [],
                "i": parseFloat($("#results_gyration_radius").val()),
                "v": parseFloat($("#results_friction_coefficient").val())
            };
            for (var i = 1; i < (table_experiments_rows + 1); i++) {
                answer.table.push({
                    "r": parseFloat($(".row_" + i + " td:nth-child(2) input").val()),
                    "t1": parseFloat($(".row_" + i + " td:nth-child(3) input").val()),
                    "phi1": parseFloat($(".row_" + i + " td:nth-child(4) input").val()),
                    "t2": parseFloat($(".row_" + i + " td:nth-child(5) input").val()),
                    "phi2": parseFloat($(".row_" + i + " td:nth-child(6) input").val()),
                    "S": parseFloat($(".row_" + i + " td:nth-child(7) input").val())
                })
            }
            return JSON.stringify(answer);
        },
        getCondition: function () {
            var condition;
            condition = {
                "r": pendulum_radius,
                "t": experiment_time
            };
            return JSON.stringify(condition);
        }
    }
}

var Vlab = init_lab();