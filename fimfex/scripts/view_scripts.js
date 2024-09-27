async function get_exchange() {
    const id = new URL(window.location.href).searchParams.get('id');
    const viewbox = document.getElementById('viewbox');
    const warningbox = document.getElementById('warningbox');
    const resultbox = document.getElementById('resultbox');

    try {
        const res = await fetch(`http://127.0.0.1:7669/get-exchange/${id}`,{
                method: 'GET'
            }
        );
        const data = await res.json();

        if (!res.ok) {
            viewbox.innerHTML = ''
            resultbox.innerHTML = ''
            resultbox.classList.add('invisible')

            warningbox.innerHTML = `
                <p>The server returned an error:</p>
                <p><strong>Error ${res.status}:</strong> ${res.body}</p> 
            `
            warningbox.classList.remove('invisible')
            return;
        }
        else {
            console.log(data);
            build_view(data);
        }
    } catch (error) {
        viewbox.innerHTML = ''
        resultbox.innerHTML = ''
        resultbox.classList.add('invisible')
        
        warningbox.innerHTML = '<p>There was an uncaught error. Consult the console, and notify site authors.</p>'
        warningbox.classList.remove('invisible')
        console.log(error);
    }
}

async function submit_stories() {
    const id = new URL(window.location.href).searchParams.get('id');
    const viewbox = document.getElementById('viewbox');
    const warningbox = document.getElementById('warningbox');
    const resultbox = document.getElementById('resultbox');

    try {
        const submission_list = document.getElementById("submission_list");
        const sub_count = 5;
        const username = document.getElementById("username").value;

        var obj = {};
        obj['name'] = username;
        obj['stories'] = [];

        for(var i = 0; i < sub_count; i++) {
            const item = submission_list.children[i];
            const arr = [];
            [...item.getElementsByTagName('input')].forEach(element => {
                if(element.value != '') {
                    arr.push(element.value);
                }
            });

            if(arr.length > 0){
                obj.stories.push(arr);
            }
        }

        console.log(`POSTing this: ${JSON.stringify(obj)}`)


        const res = await fetch(`http://127.0.0.1:7669/add-stories/${id}`,{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
                
            }
        );
        const data = res;

        if (!res.ok) {
            viewbox.innerHTML = ''
            resultbox.innerHTML = ''
            resultbox.classList.add('invisible')

            warningbox.innerHTML = `
                <p>The server returned an error:</p>
                <p><strong>Error ${res.status}:</strong> ${res.body}</p> 
            `
            warningbox.classList.remove('invisible')
            return;
        }
        else {
            console.log(data);
            
            resultbox.innerHTML = `
                <p>Your ${obj.stories.length} submissions have been added.</p>
                <p>Check back later (according to the exchange's owner) for the voting stage.</p>
            `
            resultbox.classList.add('invisible')
        }
    } catch (error) {
        viewbox.innerHTML = ''
        resultbox.innerHTML = ''
        resultbox.classList.add('invisible')
        
        warningbox.innerHTML = '<p>There was an uncaught error. Consult the console, and notify site authors.</p>'
        warningbox.classList.remove('invisible')
        console.log(error);
    }
}

async function get_voting_submissions() {
    const id = new URL(window.location.href).searchParams.get('id');
    const username = document.getElementById('username').value;

    const warningbox = document.getElementById('warningbox');
    const resultbox = document.getElementById('resultbox');

    try {
        const res = await fetch(`http://127.0.0.1:7669/get-exchange/${id}?name=${username}`,{
                method: 'GET'
            }
        );
        const data = await res.json();

        if (!res.ok) {
            resultbox.innerHTML = ''
            resultbox.classList.add('invisible')

            warningbox.innerHTML = `
                <p>The server returned an error:</p>
                <p><strong>Error ${res.status}:</strong> ${data}</p> 
            `
            warningbox.classList.remove('invisible')
            return;
        }
        else {
            console.log(data);
            draw_voting_submissions(data);
        }
    } catch (error) {
        console.log(error);
    }
}

async function transition(stage) {
    const id = new URL(window.location.href).searchParams.get('id');
    const passphrase = document.getElementById('passphrase').value;

    switch (stage) {
        case 'Submission': await goto_submission_stage(id, passphrase); break;
        case 'Voting': await goto_voting_stage(id, passphrase); break;
        case 'Selections': await goto_selections_stage(id, passphrase); break;
        case 'Frozen': await goto_frozen_stage(id, passphrase); break;
        default: break;
    }
}

async function goto_submission_stage(id, passphrase) {
    
}

async function goto_voting_stage(id, passphrase) {
    try{
        const res = await fetch(`http://127.0.0.1:7669/change-stage/${id}/${passphrase}?stage=Voting`,{
            method: 'PATCH'
        });
        const data = await res.text();

        if (!res.ok) {
            warningbox.innerHTML = `
                <p>The server returned an error:</p>
                <p><strong>Error ${res.status}:</strong> ${data}</p> 
            `
            warningbox.classList.remove('invisible')
            return;
        }
        else {
            await get_exchange();
        }
    } catch (error) {
        console.log(error);
    }

    console.log('Go to voting!!!')

}

async function goto_selections_stage(id, passphrase) {

}

async function goto_frozen_stage(id, passphrase) {

}

function build_view(data) {
    switch (data.stage) {
        case 'Submission': build_submission_view(data); break;
        case 'Voting': build_voting_view(data); break;
        case 'Selections': build_selections_view(data); break;
        case 'Frozen': build_frozen_view(data); break;
        default: 
            throw new Error(`Unexpected stage when loading view: '${data.stage}'`)
    }
}

function build_submission_view(data) {
    const viewbox = document.getElementById('viewbox');
    viewbox.innerHTML = `
        <h1>${data.title}</h1>
        <p>This exchange is ready to accept submissions.</p>
        <p>A username and at least one story is required.</p>
        <div>
            <div>
                <label for="username">username:</label>
                <input type="text" id="username" name="username">
            </div>

            <br>

            <ul class="submission_list" id="submission_list">
                <li class="submission_entry">
                    <label for="link1-1">story link:</label>
                    <input type="text" id="link1-1" name="link1-1">
                    <input type="text" id="link1-2" name="link1-2">
                </li>
                <li class="submission_entry">
                    <label for="link2-1">story link:</label>
                    <input type="text" id="link2-1" name="link2-1">
                    <input type="text" id="link2-2" name="link2-2">
                </li>
                <li class="submission_entry">
                    <label for="link3-1">story link:</label>
                    <input type="text" id="link3-1" name="link3-1">
                    <input type="text" id="link3-2" name="link3-2">
                </li>
                <li class="submission_entry">
                    <label for="link4-1">story link:</label>
                    <input type="text" id="link4-1" name="link4-1">
                    <input type="text" id="link4-2" name="link4-2">
                </li>
                <li class="submission_entry">
                    <label for="link5-1">story link:</label>
                    <input type="text" id="link5-1" name="link5-1">
                    <input type="text" id="link5-2" name="link5-2">
                </li>
            </ul>

            <br>

            <button id="submit_stories" onclick="submit_stories()">Submit Stories</button>
        </div>
        <div>
            <br>
            <p>Admin controls:</p>
            <label for="passphrase">passphrase:</label>
            <input type="password" id="passphrase" name="passphrase">
            <br>
            <button id="goto_voting" onclick="transition('Voting')">Go to Voting stage</button>
        </div>
    `
}

function build_voting_view(data) {
    const viewbox = document.getElementById('viewbox');
    viewbox.innerHTML = `
        <h1>${data.title}</h1>
        <p>This exchange is ready to accept votes.</p>
        <p>At least one vote is required, but more is better.</p>
        <div>
            <div id="submission_voting_box">
                <p>Submit your username before casting votes.<p>
                <label for="username">username:</label>
                <input type="text" id="username" name="username">
                <button id="get_voting_submissions" onclick="get_voting_submissions()">Submit</button>
            </div>
        </div>
        <div>
            <br>
            <p>Admin controls:</p>
            <label for="passphrase">passphrase:</label>
            <input type="password" id="passphrase" name="passphrase">
            <br>
            <button id="goto_submission" onclick="transition('Voting')">Go to Submission stage</button>
            <button id="goto_selection" onclick="transition('Voting')">Go to Selection stage</button>
        </div>
    `
}

function draw_voting_submissions(data) {
    const box = document.getElementById('submission_voting_box');
    const username = document.getElementById('username').value;
    
    var string = 
        `<p>Voting as: <span id=username>${username}</span></p>
        <br>
        <ul>`

    data.submissions.forEach(submission => {
        string += 
            `\n<li class="vote_entry">
            <p>`;
        submission.stories.forEach(story => {
            string += 
                `${story}, `;
        });
        string += 
            `</p>
            <label>vote: </label><input type="number" name="vote">
            </li>`;
    });

    string +=
        '\n</ul>';
    
    box.innerHTML = string;
}

function build_selections_view(data) {

}

function build_frozen_view(data) {

}