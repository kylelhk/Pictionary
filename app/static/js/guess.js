window.addEventListener("DOMContentLoaded", (e) => {

    const inputText = document.querySelector("#inputText");
    const btnSend = document.querySelector(".button-send");

    // Guessed words appear on right
    const messageArea = document.querySelector(".message.message-right");

    //Button Send onclick event
    btnSend.addEventListener("click", (e) => {
        let mess = inputText.value;
        let bubble = document.createElement('div');
        bubble.className += " bubble bubble-dark";
        bubble.textContent = mess;


        messageArea.appendChild(bubble);
        inputText.value = "";
    });

//     TODO: GIVE TIMEOUT OR SUCCESS BUBBLE MESSAGE

});
