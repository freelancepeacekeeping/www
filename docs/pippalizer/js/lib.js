// License: MPL-2.0
// https://github.com/freelancepeacekeeping/www/tree/master/docs/pippalizer

// Knuth Fisher-Yates algorithm
function deck_shuffle(arr) {
    for(let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * i);
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// OU12O12U16 etc.
// Ranges are OU3:36:3  (start/end/step)
function pattern_to_pip_set(pip_pattern) {
    // convert [A-Z]*[0-9]* to array of [A-Z]* : [0-9]*
    results = pip_pattern.replace(/\s/g,'').split(/([\d:]+)/);
    let pip_set = {};
    for (let i = 0; i < results.length - 1; i += 2) {
        if (results[i+1].includes(':')) {
            let value_array = [];
            parameters = results[i+1].split(/:/);
            if(parameters.length == 2) {
                parameters.push('1');
            }
            // TODO: parameters.length should be 3 at this point
            let start = parseInt(parameters[0]);
            let close = parseInt(parameters[1]);
            let step  = parseInt(parameters[2]);

            if(pip_set[results[i]]) {
                if(Array.isArray(pip_set[results[i]])) {
                    // TODO: Replace with an error
                    alert("Unable to combine two ranges for the same battle icon colours. Ignoring additional ranges. ");
                    continue;
                } else {
                    start += parseInt(pip_set[results[i]]);
                    close += parseInt(pip_set[results[i]]);
                }
            }

            if(start < close) {
                for (let j = start; j <= close; j += step) {
                    value_array.push(j);
                }
            } else {
                for (let j = start; j >= close; j -= step) {
                    value_array.push(j);
                }
            }

            pip_set[results[i]] = value_array;
        } else {
            if(pip_set[results[i]]) {
                // This supports folk including the same card type multiple times
                // Multiple ranges aren't supported however, because how would that work?
                if(Array.isArray(pip_set[results[i]])) {
                    // Increase the each element of the array
                    for (let j = 0; j < pip_set[results[i]].length; j++) {
                        pip_set[results[i]][j] = (parseInt(pip_set[results[i]][j]) + parseInt(results[i+1])).toString();
                    }
                } else {
                    // No concern, we're adding two scalars
                    pip_set[results[i]] = (parseInt(pip_set[results[i]]) + parseInt(results[i+1])).toString();
                }
            } else {
                pip_set[results[i]] = results[i+1];
            }
        }
    }

    // At this point we have "PipLetter" : "Num" or "PipLetter" : ["array", "of", "Num"]
    // We want to flip to [ { "PipLetter": "Num", ... }, { "PipLetter": "NextNum" }, ...]
    // Find max length of array in the pip_sets
    let max_length = 0;
    for (let key in pip_set) {
        if (pip_set.hasOwnProperty(key)) {
            count = pip_set[key];
            if(Array.isArray(count)) {
                if(count.length > max_length) {
                    max_length = count.length;
                }
            }
        }
    }
    if(max_length == 0) {
        return pip_set;
    }

    let pip_sets = [];
    for (let i = 0; i < max_length; i++) {
        pip_sets.push({});
    }
    // Flip the array
    for (let key in pip_set) {
        if (pip_set.hasOwnProperty(key)) {
            let remaining = max_length;
            let last_element = undefined;
            count = pip_set[key];
            if(Array.isArray(count)) {
                for (let i=0; i<count.length; i++) {
                    pip_sets[i][key] = count[i];
                    last_element = count[i];
                    remaining--;
                }
            } else {
                last_element = count;
            }
            // Fill the rest of the array with the final element
            for (let i=max_length - remaining; i<max_length; i++) {
                pip_sets[i][key] = last_element;
            }
        }
    }

    return pip_sets;
}

function pip_set_to_pattern(pip_set) {
    text = "";
    for (let key in pip_set) {
        // check if the property/key is defined in the object itself, not in parent
        if (pip_set.hasOwnProperty(key)) {
            count = pip_set[key];
            text = text + ' ' + key + count;
        }
    }
    return text;
}

function cards_in_pip_set(pip_set) {
    let total = 0;
    for (let key in pip_set) {
        if (pip_set.hasOwnProperty(key)) {
            total += parseInt(pip_set[key]);
        }
    }
    return total;
}

// Count how many colours show
function count_colours(flip_result, pip_match) {
    colour_count = 0;
    if(flip_result.length > 0) {
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
    let found = condition.match(/([A-Za-z_]+)\(([*WOBUG]+)\)([=<>]+)?(.*)?/);
    if(found) {
        let term = found[1]
        let pip_combination = found[2]
        let operator = found[3]
        let amount = parseInt(found[4])
        // console.log("Parsed to term: "+term+", pc:"+pip_combination+", op:"+operator+", am:"+amount);

        let func_ptr = null;
        if(term.match(/colou?rs/i)) {
            func_ptr = function(fr) {
                return count_colours(fr, pip_combination);
            }
        } else if(term.match(/count/i)) {
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
 * Returns an 2-dimensional-array of answers that match the array of conditions for each element of pip_set
 * pip_sets may be scalar or an array, however an array of (loosely coined flip-result) objects are always returned.
 * A flip-result is, for now, a basic object with:
 *     'pipset' : String
 *     'result' : array of conditions.length values
 */
function run_test(pip_sets, conditions, iteration_count, flip_count, white_plus_two) {

    if(!Array.isArray(pip_sets)) {
        pip_sets = [pip_sets];
    }

    let test_conditions = [];
    //
    // Optimization: Pre-evaluate the conditions and create runnable functions
    for (let condition of conditions) {
        test_conditions.push(precompile_condition(condition));
    }

    // Optimization: Pre-evaluate whether or not the condition has an operator
    let condition_is_operator = [];
    for (let condition of conditions) {
        condition_is_operator.push(has_operator(condition));
    }

    let all_the_results = [];
    for (let pip_set of pip_sets) {

        // Build Deck
        let deck = [];
        for (let key in pip_set) {
            // check if the property/key is defined in the object itself, not in parent
            if (pip_set.hasOwnProperty(key)) {
                let count = pip_set[key];
                for (let i = 0; i < count; i++) {
                    deck.push(key);
                }
            }
        }

        if(deck.length < flip_count) {
            // TODO: This needs to be replaced with error throwing
            //       It also should happen less often as the UI gets input validation
            alert("The " + pip_set_to_pattern(pip_set) + " deck has less than " + flip_count + " cards. Skipping that test run. ");
            continue;
        }

        let result_list = [];
        for (let i = 0; i < conditions.length; i++) {
            result_list.push(0);
        }

        // Then iterate the draws over the deck. For each draw we need to collate statistics.
        for (let iteration = 0; iteration < iteration_count; iteration++) {
            deck_shuffle(deck);
            let result = "";
            let white_pipped = false;
            let flip_count_tmp = flip_count;
            for (let flip_index = 0; flip_index < flip_count_tmp; flip_index++) {
                // protect from flip_count_tmp going off the end of the array
                if(flip_index < deck.length) {
                    result += deck[flip_index];
                }
                if(white_plus_two) {
                    if(!white_pipped) {
                        if(deck[flip_index].includes("W")) {
                            flip_count_tmp += 2;
                            white_pipped = true;
                        }
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

        all_the_results.push( { 'pipset' : pip_set, 'result' : result_list } );
    }

    return all_the_results;
}

function format_result(result, condition) {
    if(has_operator(condition)) {
        return Math.round(result) + "%";
    } else {
        return result.toFixed(2);
    }
}
