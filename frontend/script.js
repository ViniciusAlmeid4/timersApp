const ip = `${window.location.hostname}:${window.location.port || '3000'}`

let sound, selctedTimerName
const modalEnded = new bootstrap.Modal(document.querySelector('#modal-timer-ended'))
const modalName = document.querySelector("#modal-name-timer")
const modalTime = document.querySelector("#modal-time-ended")

document.addEventListener('click', (event) => {
    if (event.target.classList.contains('bi-stopwatch')) {
        if (event.target.closest("li").classList.contains('list-timer-ended')) {
            modalEnded.show()
            let selectedTimer = event.target.closest(".d-flex").querySelector(".timer-name").innerText;
            selctedTimerName = selectedTimer.innerText;
        }
    }
})

document.addEventListener('DOMContentLoaded', async () => {
    sound = new Audio(`http://${ip}/761182__halo4shaun__bass-saw-c-s14.mp3`)
    sound.loop = true
    connectWebSocket()
    const timers = await getTimers()

    for (const [name, timerData] of Object.entries(timers)) {
        addTimerToList(name, timerData.endTime)
    }
})

document.querySelector('#modal-timer-ended').addEventListener('hidden.bs.modal', () => {
    stopSound()
});

document.querySelector('#btn-confirm-timer').addEventListener('click', async () => {
    stopSound();
    try {
        const response = await fetch(`http://${ip}/remove-timer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name: selctedTimerName }),
        });

        if (response.ok) {
            // Find and remove the timer element from the DOM
            const timersList = document.querySelectorAll('#active-timers-list li');
            timersList.forEach((li) => {
                const timerNameElement = li.querySelector('.timer-name');
                if (timerNameElement && timerNameElement.innerText === selctedTimerName) {
                    li.remove();
                }
            });
        } else {
            console.error('Failed to remove the timer on the server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
});

document.querySelector('#btn-confirm-timer').addEventListener('click', () => {
    stopSound()
})

document.querySelector('#timer-form').addEventListener('submit', async function (e) {
    e.preventDefault()
    const name = document.querySelector('#name')
    const time = document.querySelector('#time')
    const timeMetric = document.querySelector('#time-metric-select')

    if (!this.checkValidity()) {
        e.stopPropagation()
        if (name.value == '') {
            console.log("Name")
            name.classList.add("is-invalid")
        }
        if (time.value == '') {
            console.log("Time")
            time.classList.add("is-invalid")
        }
    } else {
        name.classList.remove("is-invalid")
        time.classList.remove("is-invalid")

        let endTime = new Date()
        let curr = new Date()

        if (timeMetric.value === "h") {
            endTime.setHours(endTime.getHours() + parseInt(time.value))
        } else if (timeMetric === "m") {
            endTime.setMinutes(endTime.getMinutes() + parseInt(time.value))
        }

        try {
            const response = await fetch(`http://${ip}/add-timer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name: [name.value], endTime, createdTime: curr }),
            })

            // if (response.status == 201) {
            //     const data = await response.json()
            // } else {
            //     // error
            // }

        } catch (error) {
            document.querySelector('#response-message').innerText = 'Erro ao adicionar timer!'
            console.error('Erro:', error)
        }
    }
})

function connectWebSocket() {
    socket = new WebSocket(`ws://${ip}`)

    socket.onopen = () => {
    }

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        for (const [name, timerData] of Object.entries(data.addedTimer)) {
            addTimerToList(name, timerData.endTime)
        }
    }

    socket.onclose = () => {
        setTimeout(connectWebSocket, 5000)
    }

    socket.onerror = (error) => {
        console.error("WebSocket error:", error)
        socket.close()
    }
}

function calculateTimeRemaining(endTime) {
    const currentDate = new Date();
    const endDate = new Date(endTime);
    let timeDiff = endDate - currentDate;

    const isNegative = timeDiff < 0;
    timeDiff = Math.abs(timeDiff);

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    const format = (num) => String(num).padStart(2, '0');

    const formattedTime = `${format(hours)} : ${format(minutes)} : ${format(seconds)}`;

    return {
        string: isNegative ? `- ${formattedTime}` : formattedTime,
        timeDiff: isNegative ? -timeDiff : timeDiff
    };
}

function playSound() {
    sound.play().catch(error => {
        console.error("Sound playback failed:", error)
    })
}

function stopSound() {
    sound.pause()
    sound.currentTime = 0
}

function addTimerToList(name, endTime) {
    /*
        <li class="list-group-item d-flex align-items-center justify-content-between">
            <div class="d-flex align-items-center" style="min-width: 100px">
                <i class="bi bi-stopwatch" style="font-size: 35px"></i>
                <strong class="d-inline-block timer-name mx-4">teste</strong>
            </div>
            <p class="card-text mb-0 text-nowrap" data-end-time="2024-11-06T01:39:28.384Z">00 : 00 : 40</p>
            <button class="btn-close position-absolute end-0 me-2 fade" style="transition: opacity 0.3s; opacity: 0;"></button>
        </li>
    */

    const timerList = document.querySelector('#active-timers-list')
    const listItem = document.createElement('li')
    listItem.className = 'list-group-item d-flex align-items-center justify-content-between'

    const div = document.createElement('div')
    div.className = 'd-flex align-items-center'
    div.setAttribute('style', 'min-width: 100px')

    const i = document.createElement('i')
    i.className = 'bi bi-stopwatch'
    i.setAttribute('style', 'font-size: 35px')

    const strong = document.createElement('strong')
    strong.className = 'd-inline-block timer-name mx-4'
    strong.innerText = name

    const p = document.createElement('p')
    p.className = 'card-text mb-0 text-nowrap'
    p.setAttribute('data-end-time', endTime)
    p.innerText = calculateTimeRemaining(endTime).string

    const closeButton = document.createElement('button');
    closeButton.className = 'btn-close position-absolute end-0 me-2 fade';
    closeButton.style.transition = 'opacity 0.3s';
    closeButton.style.opacity = '0';
    closeButton.addEventListener('click', () => {
        removeTimer(name);
    });

    div.appendChild(i);
    div.appendChild(strong);
    listItem.appendChild(div);
    listItem.appendChild(p);
    listItem.appendChild(closeButton);

    timerList.appendChild(listItem);

    listItem.addEventListener('mouseenter', () => {
        closeButton.style.opacity = '1';
    });
    listItem.addEventListener('mouseleave', () => {
        closeButton.style.opacity = '0';
    });
}

async function getTimers() {
    try {
        const response = await fetch(`http://${ip}/timers`)
        const timers = await response.json()

        return timers
    } catch (error) {
        console.error('Erro ao verificar timers:', error)
        return []
    }
}

function checkTimers() {
    const timersList = document.querySelectorAll('#active-timers-list li')
    timersList.forEach(li => {
        const p = li.querySelector('p')
        const endTime = p.getAttribute('data-end-time')
        const timeClock = calculateTimeRemaining(endTime)

        p.innerText = timeClock.string

        if (timeClock.timeDiff <= 0) {
            if (!li.classList.contains('list-timer-ended')) {
                li.classList.add('list-timer-ended');
                let selectedTimer = li.querySelector('.timer-name')
                selctedTimerName = selectedTimer.innerText;
                modalEnded.show()
                playSound()
            }


            if (li.querySelector('.timer-name').innerText == selctedTimerName) {
                modalName.innerHTML = selctedTimerName
                modalTime.innerHTML = timeClock.string
            }
        } else if (timeClock.timeDiff <= 300000) {
            if (!li.classList.contains('list-timer-warning')) {
                li.classList.add('list-timer-warning');
            }
        }
    })
}

async function removeTimer(name) {
    try {
        const response = await fetch(`http://${ip}/remove-timer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ name }),
        });

        if (response.ok) {
            const timersList = document.querySelectorAll('#active-timers-list li');
            timersList.forEach((li) => {
                const timerNameElement = li.querySelector('.timer-name');
                if (timerNameElement && timerNameElement.innerText === name) {
                    li.remove();
                }
            });
        } else {
            console.error('Failed to remove the timer on the server');
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

setInterval(checkTimers, 500);