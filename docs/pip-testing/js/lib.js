// Knuth Fisher-Yates algorithm
function deck_shuffle(arr) {
    for(let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function pattern_to_pip_set(pip_pattern) {
    // convert [0-9]*[A-Z]* to array of [A-Z]* : [0-9]*
    results = pip_pattern.replace(/\s/g,'').split(/(\d+)/);
    let pip_set = {};
    for (let i = 0; i < results.length - 1; i += 2) {
      pip_set[results[i]] = results[i+1];
    }
    return pip_set;
}

function pip_set_to_pattern(pip_set) {
    text = "";
    for (let key in pip_set) {
        // check if the property/key is defined in the object itself, not in parent
        if (pip_set.hasOwnProperty(key)) {           
            count = pip_set[key];
            text = text + key + count;
        }
    }
    return text;
}

// Count how many colours show
function count_colours(flip_result, pip_match) {
//                console.log("Result: " + flip_result);
    colour_count = 0;
    if(flip_result.length > 1) {
        if(pip_match == '*' || pip_match.includes(flip_result.charAt(0))) {
            colour_count++;
        }
        last_char = flip_result.charAt(0);
        for (let i = 1; i < flip_result.length; i++) {
            if(flip_result.charAt(i) != last_char) {
                if(pip_match == '*' || pip_match.includes(flip_result.charAt(i))) {
                    colour_count++;
                }
                last_char = flip_result.charAt(i);
            }
        }
    }
    return colour_count;
}

// Count how many times a colour shows
function count_pips(flip_result, pip_match) {
//                console.log("Result: " + flip_result);
    colour_count = 0;
    if(flip_result.length > 1) {
        last_char = flip_result.charAt(0);
        for (let i = 0; i < flip_result.length; i++) {
            if(pip_match == '*' || pip_match.includes(flip_result.charAt(i))) {
                colour_count++;
            }
        }
    }
    return colour_count;
}

// TODO: Need to implement OR and presumably NOT.
//       Note that the AND implementation here is quite hacky.
/*
 * Build a function that represents the entered query. Note that this function handles 
 * splitting a query down into a group of statements and then uses precompile_statement
 */
function precompile_condition(condition, flip_result) {
    results = condition.replace(/\s/g,'').split(/(AND)/);
    if(results.length > 1) {
        statements = [];
        for (let result of results) {
            if(result != "AND") {
                statements.push(precompile_statement(result, flip_result));
            }
        }
        compound_func_ptr = function(fr) {
            for (let statement of statements) {
                if(!statement(fr))  {
                    return false;
                }
            }
            return true;
        }
        return compound_func_ptr;
    } else {
        return precompile_statement(condition, flip_result);
    }
}

/*
 * Is the condition a test, like 'x=y'?
 */
function has_operator(condition) {
    return condition.search(/[=<>]+/) != -1;
}

/*
 * count(X) OP Y; where Y is an Integer; OP is < = > >= <=; and X is either * or a pip combination
 * colours(X) OP Y; where letters are the same as above.
 */
function precompile_statement(condition, flip_result) {
    // Parse the condition
    let found = condition.match(/([a-z_]+)\(([*OBKGW]+)\)([=<>]+)?(.*)?/);
    if(found) {
        let term = found[1]
        let pip_combination = found[2]
        let operator = found[3]
        let amount = parseInt(found[4])
        // console.log("Parsed to term: "+term+", pc:"+pip_combination+", op:"+operator+", am:"+amount);

        let func_ptr = null;
        if(term.match(/colou?rs/)) {
            func_ptr = function(fr) {
                return count_colours(fr, pip_combination);
            }
        } else if(term.match(/count/)) {
            func_ptr = function(fr) {
                return count_pips(fr, pip_combination);
            }
        } else {
            console.log("Need to code more combination handling code");
        }

        if(operator == undefined) {
            return function(fr) {
                return func_ptr(fr);
            }
        } else if(operator == '=') {
            return function(fr) {
                return func_ptr(fr) == amount;
            }
        } else if(operator == '<') {
            return function(fr) {
                return func_ptr(fr) < amount;
            }
        } else if(operator == '>') {
            return function(fr) {
                return func_ptr(fr) > amount;
            }
        } else if(operator == '<=') {
            return function(fr) {
                return func_ptr(fr) <= amount;
            }
        } else if(operator == '>=') {
            return function(fr) {
                return func_ptr(fr) >= amount;
            }
        } else {
            console.log("Need to code more conditions...");
        }
    } else {
        console.log("Condition '" + condition + "' is not supported. ");
    }
}

/*
 * Returns an array of percentages that match the array of conditions
 */
function run_test(pip_set, conditions, iteration_count, flip_count) {

    let test_conditions = [];
    let result_list = [];
    for (let condition of conditions) {
        test_conditions.push(precompile_condition(condition));
        result_list.push(0);
    }
    let condition_is_operator = [];
    for (let condition of conditions) {
        condition_is_operator.push(has_operator(condition));
    }
    
    // Build Deck
    let deck = [];
    for (let key in pip_set) {
        // check if the property/key is defined in the object itself, not in parent
        if (pip_set.hasOwnProperty(key)) {           
            count = pip_set[key];
            for (let i = 0; i < count; i++) {
                deck.push(key);
            }
        }
    }
    
    // Need to then iterate the draws over the deck. For each draw we need to collate statistics.
    for (let iteration = 0; iteration < iteration_count; iteration++) {
        deck_shuffle(deck);
        let result = "";
        let white_pipped = false;
        let flip_count_tmp = flip_count;
        for (let flip_index = 0; flip_index < flip_count_tmp; flip_index++) {
            result += deck[flip_index];
            if(!white_pipped) {
                if(deck[flip_index].includes("W")) {
                    flip_count_tmp += 2;
                    white_pipped = true;
                }
            }
        }
        result = result.split('').sort().join('');
        for (let i = 0; i < test_conditions.length; i++) {
            if(!condition_is_operator[i]) {
                result_list[i] += test_conditions[i](result);
            } else {
                if(test_conditions[i](result)) {
                    result_list[i] = result_list[i] + 1;
                }
            }
        }
    }

    for (let i = 0; i < test_conditions.length; i++) {
        if(condition_is_operator[i]) {
            // calculate percentage
            result_list[i] = (result_list[i] * 100) / iteration_count;
        } else {
            // calculate mean
            result_list[i] = result_list[i] / iteration_count;
        }
    }
//            console.log("Results: " + result_list);
    return result_list;
}

function format_result(result, condition) {
    if(has_operator(condition)) {
        return Math.round(result) + "%";
    } else {
        return result.toFixed(2);
    }
}
