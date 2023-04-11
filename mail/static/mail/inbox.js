document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    document.querySelector('#archive').addEventListener('click', archive_email);
    //Function to send an email
    document.querySelector('#compose-form').onsubmit = send_mail;
    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';

    // Clear out composition fields
    document.querySelector('#compose-recipients').value = '';
    document.querySelector('#compose-subject').value = '';
    document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

    // Show the mailbox and hide other views
    document.querySelector('#emails-view').style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#view-email').style.display = 'none';


    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    //Show the emails
    fetch(`/emails/${mailbox}`)
        .then(response => response.json())
        .then(email => {
            // Print email
            email.forEach(mail => show_email(mail))
            console.log(email);

            // ... do something else with email ...
        });
}

function send_mail() {
    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
        method: 'POST',
        body: JSON.stringify({
            recipients: recipients,
            subject: subject,
            body: body
        })
    })
        .then(response => response.json())
        .then(result => {
            // Print result
            console.log(result);
        });
    localStorage.clear() // to load sent mailbox with all the information
    load_mailbox('sent')
    return false; // to avoid reloading inbox page
}

function load_email_view(mail) {
    const mailId = mail.id;
    fetch(`/emails/${mailId}`)
        .then(response => response.json())
        .then(email => {
            // Print email
            console.log(email);
            // ... do something else with email ...

            fetch(`/emails/${mailId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    read: true
                })
            })

            document.querySelector('#emails-view').style.display = 'none';
            document.querySelector('#view-email').style.display = 'block';

            document.querySelector('#email-subject').innerHTML = mail.subject;
            document.querySelector('#email-sender').innerHTML = mail.sender;
            document.querySelector("#email-timestamp").innerHTML = mail.timestamp;
            document.querySelector('#email-massege').innerHTML = mail.body;
        });
}

function archive_email(mail) {
    const mailId = mail.id;
    fetch(`/emails/${mailId}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
    }).then(r => console.log(r.toString()))
    localStorage.clear() // to load sent mailbox with all the information
    load_mailbox('inbox')
}

function show_email(mail) {
    const emailDiv = document.createElement('div');
    emailDiv.classList.add("card", "mb-3");
    emailDiv.id = "email-card";

    // Create a card header with the email sender and date
    const headerDiv = document.createElement("div");
    headerDiv.classList.add("card-header");
    const senderElement = document.createElement("h5");
    senderElement.classList.add("card-title", "mb-0");
    senderElement.textContent = mail.sender;
    const dateElement = document.createElement("small");
    dateElement.classList.add("text-muted");
    dateElement.textContent = mail.timestamp;
    headerDiv.appendChild(senderElement);
    headerDiv.appendChild(dateElement);
    emailDiv.appendChild(headerDiv);

    // Create a card body with the email topic
    const bodyDiv = document.createElement("div");
    bodyDiv.classList.add("card-body");
    const topicElement = document.createElement("h6");
    topicElement.classList.add("card-subtitle", "mb-2", "text-muted");
    topicElement.textContent = mail.subject;
    bodyDiv.appendChild(topicElement);
    emailDiv.appendChild(bodyDiv);

    //Check if email is read
    if (mail.read === true) {
        emailDiv.className = "card text-dark bg-light mb-3"
    } else {
        emailDiv.className = "card border-primary mb-3"
    }
    //card text-dark bg-light mb-3
    //card border-dark mb-3

    // Add a click event listener to the email div to load the email view


    emailDiv.style.cursor = 'pointer';
    emailDiv.addEventListener('click', function () {
        load_email_view(mail);
    });

    // Add the email div to the document
    const containerDiv = document.querySelector('#emails-view');
    containerDiv.appendChild(emailDiv);
}