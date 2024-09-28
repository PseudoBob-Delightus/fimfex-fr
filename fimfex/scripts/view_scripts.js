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

async function submit_votes() {
    const id = new URL(window.location.href).searchParams.get('id');
    const viewbox = document.getElementById('viewbox');
    const warningbox = document.getElementById('warningbox');
    const resultbox = document.getElementById('resultbox');

    try {
        const username = document.getElementById("username").innerText;
        const submission_voting_box = document.getElementById("submission_voting_box");
        const vote_list = submission_voting_box.getElementsByTagName("ul")[0];

        var obj = {};
        obj['name'] = username;
        obj['votes'] = [];

        [...vote_list.children].forEach(submission => {
            const entry_arr = [];

            [...submission.getElementsByTagName("span")].forEach(story => {
                entry_arr.push(story.innerText);
            });

            const priority = Number(submission.getElementsByTagName("input")[0].value);

            obj.votes.push({priority:priority, entry:{stories:entry_arr}})
        });

        console.log(`POSTing this: ${JSON.stringify(obj)}`)
        console.log(obj)


        const res = await fetch(`http://127.0.0.1:7669/cast-votes/${id}`,{
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
                <p>Your ${obj.votes.length} votes have been added.</p>
                <p>Check back later (according to the exchange's owner) for the results stage.</p>
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

async function generate_results() {
    const warningbox = document.getElementById('warningbox');
    const resultbox = document.getElementById('resultbox');

    const id = new URL(window.location.href).searchParams.get('id');
    const passphrase = document.getElementById('passphrase').value;
    const user_max_e = document.getElementById('user_max');
    const a_factor_e = document.getElementById('a_factor');

    var user_max = 2;
    var a_factor = 0.5;

    if(user_max_e.value.trim().length){
        user_max = Number(user_max_e.value);
    } else {
        user_max = Number(user_max_e.placeholder);
    }

    if(a_factor_e.value.trim().length) {
        a_factor = Number(a_factor_e.value);
    } else {
        a_factor = Number(a_factor_e.placeholder);
    }

    obj = {	"user_max": user_max,"assignment_factor": a_factor}

    try {
        const res = await fetch(`${global_api}/update-results/${id}/${passphrase}`,{
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(obj)
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
            draw_results(data);
        }
    } catch (error) {
        console.log(error);
    }
}

async function get_results() {
    const warningbox = document.getElementById('warningbox');
    const resultbox = document.getElementById('resultbox');

    const id = new URL(window.location.href).searchParams.get('id');
    const passphrase = document.getElementById('passphrase').value;

    try {
        const res = await fetch(`${global_api}/get-exchange/${id}/${passphrase}`,{
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
            draw_results(data);
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
    try{
        const res = await fetch(`http://127.0.0.1:7669/change-stage/${id}/${passphrase}?stage=Submission`,{
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

    console.log('Go to submission!!!')
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
    try{
        const res = await fetch(`http://127.0.0.1:7669/change-stage/${id}/${passphrase}?stage=Selection`,{
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

    console.log('Go to selection!!!')
}

async function goto_frozen_stage(id, passphrase) {
    try{
        const res = await fetch(`http://127.0.0.1:7669/change-stage/${id}/${passphrase}?stage=Frozen`,{
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

    console.log('Go to frozen!!!')
}

function build_view(data) {
    switch (data.stage) {
        case 'Submission': build_submission_view(data); break;
        case 'Voting': build_voting_view(data); break;
        case 'Selection': build_selections_view(data); break;
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
            <button id="goto_submission" onclick="transition('Submission')">Go to Submission stage</button>
            <button id="goto_selection" onclick="transition('Selections')">Go to Results stage</button>
        </div>
    `
}

function draw_voting_submissions(data) {
    const box = document.getElementById('submission_voting_box');
    const username = document.getElementById('username').value;
    
    var string = 
        `<p>Voting as: <span id=username>${username}</span></p>
        <ul>`

    data.submissions.forEach(submission => {
        string += 
            `\n<li class="vote_entry">
            <p>`;
        submission.stories.forEach(story => {
            string += 
                `<span class='vote_story'>${story}</span>, `;
        });
        string += 
            `</p>
            <label>vote: </label><input type="number" name="vote">
            </li>`;
    });

    string +=
        `\n</ul>
        <button id="submit_votes" onclick="submit_votes()">Submit votes</button>`;
    
    box.innerHTML = string;
}

function build_selections_view(data) {
    const viewbox = document.getElementById('viewbox');
    viewbox.innerHTML = `
        <h1>${data.title}</h1>
        <p>This exchange is ready to generate results.</p>
        <p>You can experiment with different settings before publishing.</p>
        <div id="resultsbox"></div>
        <div>
            <br>
            <p>Admin controls:</p>
            
            <label for="user_max">Max submissions per user:</label>
            <input type="number" id="user_max" name="user_max" placeholder="2">
            <br>
            <label for="a_factor">Assignment factor:</label>
            <input type="number" id="a_factor" name="a_factor" placeholder="0.5">
            <br>
            <label for="passphrase">passphrase:</label>
            <input type="password" id="passphrase" name="passphrase">
            <br>
            <button id="generate_results" onclick="generate_results()">Generate Results</button>
            <br>
            <button id="goto_voting" onclick="transition('Voting')">Go to Voting stage</button>
            <button id="goto_frozen" onclick="transition('Frozen')">Publish (this is PERMANENT!)</button>
        </div>
    `
}

function draw_results(data) {
    const box = document.getElementById("resultsbox");

    var string = 
        `<h2>Results</h2>
        <ul id="resultslist">`;

    Object.keys(data.results).forEach(user => {
        string += 
            `<li><p>${user} is assigned:</p>
            <ul>`;
        data.results[user].forEach(submission => {
            string += `<li><p>`;
            submission.stories.forEach(story => {
                string += `${story}, `;
            });
            string += `</p></li>`
        });
        string += `</ul></li>`
    });

    string += `</ul>`

    box.innerHTML = string;
}

function build_frozen_view(data) {
    const viewbox = document.getElementById('viewbox');
    viewbox.innerHTML = `
        <h1>${data.title}</h1>
        <p>This exchange has concluded.</p>
        <p>Results below:</p>
        <div id="resultsbox">
        </div>
    `
}