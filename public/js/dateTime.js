function getDateTime(){
    const displayDateTime = document.getElementById("dateTime");
    const objDate = new Date();
    const date = objDate.toLocaleDateString();
    const time = objDate.toLocaleTimeString();

    displayDateTime.textContent = `${date} ${time}`;
}
setInterval(getDateTime, 1000);
