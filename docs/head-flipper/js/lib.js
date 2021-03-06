        head_index = 0;
        body_index = 0;

        function change(imageId, direction) {
            if(imageId.includes('head')) {
                if(direction == 'left') {
                    head_index--;
                    if(head_index == -1) {
                        head_index = head_array.length - 1;
                    }
                } else {
                    head_index++;
                    if(head_index == head_array.length) {
                        head_index = 0;
                    }
                }
            } else {
                if(direction == 'left') {
                    body_index--;
                    if(body_index == -1) {
                        body_index = body_array.length - 1;
                    }
                } else {
                    body_index++;
                    if(body_index == body_array.length) {
                        body_index = 0;
                    }
                }
            }

            display();
        }

        function random() {
            head_index = Math.floor(Math.random() * head_array.length);
            body_index = Math.floor(Math.random() * body_array.length);
            display();
        }

        function init() {
            let searchParams = new URLSearchParams(window.location.search);
            if(searchParams.has('h') && searchParams.has('b')) {
                select(searchParams.get('h'), searchParams.get('b'));
                display();
            } else {
                random();
            }
        }

        function select(head_id, body_id) {
            for(let i=0; i<head_array.length; i++) {
                if(head_array[i]['id'] == head_id) {
                    head_index = i;
                    break;
                }
            }
            for(let i=0; i<body_array.length; i++) {
                if(body_array[i]['id'] == body_id) {
                    body_index = i;
                    break;
                }
            }
        }

        function display() {

            head = head_array[head_index];
            body = body_array[body_index];

            // Add Head Value
            headText = head['Text'];
            incrATK = 0;
            incrHP = 0;
            incrDEF = 0;
            if(headText.includes("[DEF]")) {
                headText = headText.replace(/\+ /, '').replace(/ \[DEF\]/, '');
                incrDEF = parseInt(headText);
                headText = "";
            } else if(headText.includes("[ATK]")) {
                headText = headText.replace(/\+ /, '').replace(/ \[ATK\]/, '');
                incrATK = parseInt(headText);
                headText = "";
            } else if(headText.includes("[HEALTH]")) {
                headText = headText.replace(/\+ /, '').replace(/ \[HEALTH\]/, '');
                incrHP = parseInt(headText);
                headText = "";
            } else {
                headText = headText.replace(/\+ /, '') + ". ";
            }

            // Set Title
            $(body_Name).html(body['name']);
            $(head_Name).html(head['name']);

            // Set Body Mode Stats
            $(body_ATK).html(body['botATK'] + incrATK);
            $(body_HP).html(body['HP'] + incrHP);
            $(body_DEF).html(body['botDEF'] + incrDEF);
            $(body_Text).html(body['botText'] + "<b>" + headText + "</b>");

            // Set Alt Mode Stats
            $(alt_ATK).html(body['ATK'] + incrATK);
            $(alt_HP).html(body['HP'] + incrHP);
            $(alt_DEF).html(body['DEF'] + incrDEF);
            $(alt_Text).html(body['Text'] + "<b>" + headText + "</b>");

            // Set Stars
            $(star_count).html(body['Stars'] + head['Stars']);
            $(body_star_count).html(body['Stars']);
            $(head_star_count).html(head['Stars']);

            // Set permalink
            $(permalink).attr('href', "?h=" + head['id'] + "&b=" + body['id']);

            // Set Images
            document.getElementById('tfbody-img').src = "images/bodies/" + body['id'] + ".bot.png";
            document.getElementById('tfhead-img').src = "images/heads/" + head['id'] + ".png";
        }
