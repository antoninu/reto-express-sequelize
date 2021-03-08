const ws = new WebSocket("ws://localhost:3000");

async function postData(url = "", data = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: JSON.stringify(data),
  });

  return response.json();
}

ws.onmessage = (msg) => {
  renderMessages(JSON.parse(msg.data));
};

const renderMessages = (data) => {
  if (data.message) {
    const html = `<p><b>${data.author}:</b> ${data.message} (Enviado en ${Date(
      data.ts
    )})</p>`;
    document.getElementById("messages").innerHTML += html;
  }
};

const handleSubmit = async (evt) => {
  evt.preventDefault();
  const message = document.getElementById("message");
  const author = document.getElementById("author");
  const ts = Date.now();
  const response = await postData("/chat/api/messages", {
    author: author.value,
    message: message.value,
    ts,
  });

  if (response.error) {
    console.log(response.error);
    const html = `<h4 class="errorMessage">${response.error}</h4><h4>Por favor soluciona el error para poder enviar el mensaje correctamente.</h4>`;
    document.getElementById("responseMessage").innerHTML = html;
  } else {
    //ws.send(message.value);
    const html = "<h4>Mensaje enviado con éxito!</h4>";
    document.getElementById("responseMessage").innerHTML = html;
  }

  message.value = "";
  author.value = "";
};

const form = document.getElementById("form");
form.addEventListener("submit", handleSubmit);
