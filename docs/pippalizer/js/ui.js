// License: MPL-2.0
// https://github.com/freelancepeacekeeping/www/tree/master/docs/pippalizer

function test_from_form() {
    let flip_count = parseInt($("#flip").val() );
    let iteration_count = parseInt( $("#iterations").val() );
    let queries = $("#pipql").val().split(',');
    let white_plus_two = $("#white_plus_two").is(":checked");

    let pip_pattern = "";
    for (let child of $("#chosen_deck").children('li')) {
        pip_pattern += $(child).find("[type='hidden']").val();
    }

    if(pip_pattern == "") {
        pip_pattern = $("#pip_pattern").val();
    }

    pip_set = pattern_to_pip_set(pip_pattern);

    //console.log("Running: run_test(" + pip_pattern + ", " + queries + ", " + iteration_count + ", " + flip_count + ")");
    all_results = run_test( pip_set, queries, iteration_count, flip_count, white_plus_two );

    let text = "<tr><th>Pip Pattern</th><th>Deck Size</th>";
    for (let query of queries) {
        text += "<th>" + query + "</th>";
    }
    text += "</tr>";
    $("#pip_results").html(text);
    for(let results of all_results) {
        text = "<tr><td>" + pip_set_to_pattern(results['pipset']) + "</td><td>" + cards_in_pip_set(results['pipset']) + "</td>";
        for (let i = 0; i < results['result'].length; i++) {
            text += "<td>" + format_result(results['result'][i], queries[i]) + "</td>";
        }
        text += "</tr>";

        $("#pip_results").append(text);
    }
    return false;
}

function remove_pipset(element) {
    $(element).parent().remove();
}
function icon_letter_to_img_html(letter) {
    switch(letter) {
        case "O" :
            return '<img src="img/piporange.png"/>';
        case "B" :
            return '<img src="img/pipblue.png"/>';
        case "K" :
            return '<img src="img/pipblack.png"/>';
        case "W" :
            return '<img src="img/pipwhite.png"/>';
        case "G" :
            return '<img src="img/pipgreen.png"/>';
        default:
            return '';
    }
}

let colour_map = { 'W' : 1, 'O' : 2, 'K' : 3, 'B' : 4, 'G' : 5 }

function get_icons() {
    // get the three pip colors
    let battleicons_1=$("#battleicons1").val();
    let battleicons_2=$("#battleicons2").val();
    let battleicons_3=$("#battleicons3").val();

    // if all three are X, then use the blank pip. Otherwise ignore X
    let img_text = "";
    let pip_text = "";
    if(battleicons_1 == "X" && battleicons_2 == "X" && battleicons_3 == "X") {
        pip_text = "X";
        img_text = '<img src="img/pipblank.png"/>';
    } else {
        let pips = [];
        if(battleicons_1 != "X") {
            pips.push(battleicons_1);
        }
        if(battleicons_2 != "X") {
            pips.push(battleicons_2);
        }
        if(battleicons_3 != "X") {
            pips.push(battleicons_3);
        }
        // Custom sort these to the order WOKBG
        pips = pips.sort( function(pip1, pip2) { return pip1 < pip2; } );

        for ( let pip of pips ) {
            pip_text += pip;
            img_text += icon_letter_to_img_html(pip);
        }
    }
    return [pip_text, img_text];
}
function add_pipset() {
    let card_count=$("#card_count").val();
    append_pipset_html(card_count, card_count);
}
function append_pipset_html(count_code, count_text) {
    icon_data = get_icons();

    // Build HTML
    let text = '<li class="pipset"><input type="hidden" value="' + icon_data[0] + count_code +'"/><img class="close" src="img/x-square.svg" onclick="remove_pipset(this)">' + icon_data[1] + ' &times; ' + count_text + '</li>';
    // Append HTML
    $("#chosen_deck").append(text);
}
function add_ranged_pipset() {
    let varying_start=$("#varying_start").val();
    let varying_end=$("#varying_end").val();
    let varying_step=$("#varying_step").val();

    let count_code = varying_start + ':' + varying_end;
    if(varying_step != "" && varying_step != "1") {
        count_code += ':' + varying_step;
    }
    
    let count_text = varying_start + " &rarr;";
    if(varying_step != "" && varying_step != "1") {
        count_text += '<sup style="font-size: 0.5em;">' + varying_step + '</sup>';
    }
    count_text += ' ' + varying_end;

    append_pipset_html(count_code, count_text);
}
function replace_pipql(name) {
    console.log("CALLED! " + name);
    let canned_query = $("#" + name + ' option:selected').val();
    if( canned_query != "") {
        $('#pipql').val(canned_query);
    }
}
