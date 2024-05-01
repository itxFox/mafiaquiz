let endpoint = 'https://baroniadelaide.alwaysdata.net';
let quizzes = {}; //oggetto js contenente le schede quiz
let domande = {}; //oggetto js contenente le domande dei quiz
let risposte = {}; //oggetto js contenente le risposte ai quiz


//variabili che servono strada facendo
let quiz;
let contatoreDomande = 0;
let contaRisposte = 0;
let nDomandeQuiz = 0;
let punteggioQuiz = 0;
let risposteDate = [];

getQuiz();

function getQuiz() { //funzione per la popolazione dell'oggetto quizzes
    console.log('%cBUONGIORNO PROFESSOR FOLLI 😎\nSAPEVO SAREBBE ENTRATO QUI', 'font-weight: bold; color: lightgreen; font-size: 19px;');

    fetch(endpoint + '/quizzes').then(response => response.json()).then(data => {

        let scrollQuizzes = document.getElementById('quizzes');
        scrollQuizzes.classList.add("list-group");

        data.forEach(quiz => { //memorizzo tutti i quiz

            punteggioQuiz = quiz.punteggio; //variabile che serve alla funzione score()

            quizzes[quiz.id_quiz] = {
                "id": parseInt(quiz.id_quiz),
                "punteggio": quiz.punteggio,
                "nome": quiz.nome,
                "descrizione": quiz.descrizione
            };


            let containerScheda = document.createElement('li');
            containerScheda.classList.add("list-group-item", "p-2", "py-3", "m-2", "border", "border-black", "rounded-2", "text-center");

            let bottoneScheda = document.createElement('button');
            bottoneScheda.setAttribute("id", quiz.id_quiz);
            bottoneScheda.classList.add("bg-white");
            bottoneScheda.innerHTML = `<h3>Quiz su ${quiz.nome}</h3><hr><p>${quiz.descrizione}</p><p>${quiz.punteggio} PUNTI</p>`;

            bottoneScheda.addEventListener('click', function () { //ascoltatore click su scheda quiz
                createQuestionBox(this.id);
            });

            containerScheda.appendChild(bottoneScheda);
            scrollQuizzes.appendChild(containerScheda);
        });
    })
        .catch(error => console.error(error));
}



async function createQuestionBox(idQuiz) { //funzione per generare il quiz selezionato

    contatoreDomande = 0;
    contaRisposte = 0; 

    let questionsDiv = document.getElementById("questions");
    questionsDiv.innerHTML = ""; //svuota il div della scheda quiz

    try {
        await getDomande(idQuiz); //attendo che venga eseguita la funzione getDomande()

        Object.values(domande).forEach(domanda => { // Creazione delle domande

            if (domanda.id_quiz == idQuiz) {

                contatoreDomande += 1;

                let quizBox = document.createElement('div');
                quizBox.className = "quizBox";
                questionsDiv.appendChild(quizBox);


                let domandaTitle = document.createElement("p");
                domandaTitle.textContent = contatoreDomande + ". " + domanda.domanda;
                domandaTitle.classList.add("fw-bold");
                quizBox.appendChild(domandaTitle);


                contaRisposte += 1; //variabile che serve per dare un id diverso ai radiobutton(servirà alla f. score())


                Object.values(risposte).forEach(risposta => {// Creazione delle risposte


                    if (risposta.id_domanda == domanda.id) {

                        let label = document.createElement("label");
                        label.setAttribute("for", `${risposta.id}`);
                        label.classList.add("box");

                        // Creazione del radio button per la risposta
                        let input = document.createElement("input");
                        input.setAttribute("type", "radio");
                        input.setAttribute("name", "risposta" + contaRisposte);
                        input.setAttribute("id", risposta.id);

                        // Creazione del testo della risposta
                        let span = document.createElement("span");
                        span.textContent = risposta.risposta;
                        span.classList.add("subject");

                        label.appendChild(input);
                        label.innerHTML += "&nbsp;";
                        label.appendChild(span);

                        // Aggiunta della label al div delle domande
                        quizBox.appendChild(label);

                        // Aggiunta di uno spazio tra le risposte
                        quizBox.appendChild(document.createElement("br"));
                    }
                });

                // Aggiunta di uno spazio tra le domande
                questionsDiv.appendChild(document.createElement("br"));
                document.getElementById('btnRispondi').classList.remove('visually-hidden');
            }
        });
        contatoreDomande = 0;
    } catch (error) {
        console.error(error);
    }
}



function getDomande(idQuiz) { //funzione per popolare l'oggetto domande
    
    return new Promise((resolve, reject) => {
        fetch(endpoint + '/domande').then(response => response.json()).then(data => {
            const promises = data.map(domanda => {

                if (domanda.id_quiz == idQuiz) {

                    nDomandeQuiz += 1; //variabile utilizzata dalla funzione score

                    domande[domanda.id_domanda] = { //popolazione oggetto domande
                        "id": parseInt(domanda.id_domanda),
                        "id_quiz": parseInt(domanda.id_quiz),
                        "domanda": domanda.domanda,
                        "punti": domanda.punti
                    };
                    return getRisposte(domanda.id_domanda); //return del risultato di getRisposte con parametro id_domanda
                }
            });

            Promise.all(promises)
                .then(() => resolve());
        })
            .catch(error => reject(error));
    });
}



function getRisposte(idDomanda) {  //funzione per popolare l'oggetto risposte
    return new Promise((resolve, reject) => {

        fetch(endpoint + '/risposte').then(response => response.json()).then(data => {

            data.forEach(risposta => {
                if (risposta.id_domanda == idDomanda) { //popolazione oggetto risposte

                    risposte[risposta.id_risposta] = {
                        "id": parseInt(risposta.id_risposta),
                        "id_domanda": parseInt(risposta.id_domanda),
                        "risposta": risposta.risposta,
                        "corretta": risposta.corretta
                    };
                }
            });
            resolve();
        })
            .catch(error => reject(error));
    });
}


let riepilogoBox;
function score() {
    risposteDate = [];

    for (let i = 1; i < nDomandeQuiz + 1; i++) {
        var risposteInput = document.getElementsByName('risposta' + i);

        for (let k = 0; k < risposteInput.length; k++) {
            if (risposteInput[k].checked) {
                risposteDate.push(risposteInput[k].id);
            }
        }
    }

    let punteggioOttenuto = 0;
    riepilogoBox = document.createElement('div');
    riepilogoBox.className = "border border-2 rounded-3";

    let domandeRisposte = document.createElement('h3');
    domandeRisposte.innerText = "Hai risposto a " + risposteDate.length + " domande su " + nDomandeQuiz;
    nDomandeQuiz = 0;
    riepilogoBox.appendChild(domandeRisposte);

    Object.values(risposte).forEach(risposta => {
        if (risposteDate.includes(String(risposta.id)) && parseInt(risposta.corretta) === 1) {

            punteggioOttenuto += parseInt(domande[risposta.id_domanda].punti);
            let rispostaCorretta = document.createElement('h5');
            rispostaCorretta.innerText = "Risposta corretta: " + risposta.risposta;
            rispostaCorretta.className = "text-success";
            riepilogoBox.appendChild(rispostaCorretta);

        } else if (risposteDate.includes(String(risposta.id)) && parseInt(risposta.corretta) === 0) {
            let rispostaSbagliata = document.createElement('h5');
            rispostaSbagliata.innerText = "Risposta sbagliata: " + risposta.risposta;
            rispostaSbagliata.className = "text-danger";
            riepilogoBox.appendChild(rispostaSbagliata);
        }
    });

    // Aggiorna il punteggio del quiz
    punteggioQuiz = punteggioOttenuto;
    document.getElementById('questions').innerHTML = "<h3>punteggio ottenuto " + punteggioOttenuto + "</h3><br><h2>RITENTA UN'ALTRO QUIZ ⮕</h2><br><br>";

    document.getElementById('questions').innerHTML += '<button id="btnRiepilogo" class="text-light p-2 bg-info rounded-3" onclick="riepilogo()">Riepilogo quiz</button>';
    console.log("Punteggio ottenuto:", punteggioOttenuto);
    document.getElementById('btnRispondi').classList.add('visually-hidden');
}

function riepilogo() {
    let btnRiepilogo = document.getElementById('btnRiepilogo');

    if (btnRiepilogo.classList.contains('bg-info')) {
        btnRiepilogo.classList.remove('bg-info');
        btnRiepilogo.classList.add('bg-danger');
        btnRiepilogo.innerText = "Nascondi Riepilogo";
        document.getElementById('questions').appendChild(riepilogoBox);
    }
    else{
        btnRiepilogo.classList.remove('bg-danger');
        btnRiepilogo.classList.add('bg-info');
        btnRiepilogo.innerText = "Riepilogo";
        document.getElementById('questions').removeChild(riepilogoBox);
    }


}





