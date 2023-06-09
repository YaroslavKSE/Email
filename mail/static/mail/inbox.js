document.addEventListener('DOMContentLoaded', function () {

    // Use buttons to toggle between views
    document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
    document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
    document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
    document.querySelector('#compose').addEventListener('click', compose_email);
    //Function to send an email
    document.querySelector('#compose-form').onsubmit = send_mail;
    document.querySelector('#reply-form').onsubmit = reply_mail;
    // By default, load the inbox
    load_mailbox('inbox');
});

function compose_email() {

    // Show compose view and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'block';
    document.querySelector('#reply-view').style.display = 'none';

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
    document.querySelector('#reply-view').style.display = 'none';

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
        })
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
    load_mailbox('sent')
    window.location.reload();
}

function reply_mail() {
    const recipients = document.querySelector('#reply-recipients').value;
    const subject = document.querySelector('#reply-subject').value;
    const body = document.querySelector('#reply-body').value;

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
    load_mailbox('sent')
    window.location.reload();
}

function load_email_view(mail) {
    const mailId = mail.id;

    fetch(`/emails/${mailId}`, {
        method: 'PUT',
        body: JSON.stringify({
            read: true
        })
    }).then()

    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#view-email').style.display = 'block';

    document.querySelector('#email-subject').innerHTML = mail.subject;
    document.querySelector('#email-sender').innerHTML = mail.sender;
    document.querySelector("#email-timestamp").innerHTML = mail.timestamp;
    document.querySelector('#email-massage').innerHTML = mail.body;


    if (mail.archived === true) {
        document.querySelector('#archive').innerHTML = "UnArchive"
        document.querySelector('#archive').addEventListener('click', () => unarchive_email(mail));


    } else {
        document.querySelector('#archive').addEventListener('click', () => archive_email(mail));
    }
    document.querySelector('#reply').addEventListener('click', () => reply_view(mail));
}

function archive_email(mail) {
    const mailId = mail.id;
    fetch(`/emails/${mailId}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: true
        })
    }).then()
    load_mailbox('inbox')
    window.location.reload();

}

function unarchive_email(mail) {
    const mailId = mail.id;
    fetch(`/emails/${mailId}`, {
        method: 'PUT',
        body: JSON.stringify({
            archived: false
        })
    }).then()
    load_mailbox('inbox')
    window.location.reload();
}

function reply_view(mail) {
    document.querySelector('#view-email').style.display = 'none';
    document.querySelector('#reply-view').style.display = 'block';
    document.querySelector('#reply-recipients').value = mail.sender;
    document.querySelector('#reply-subject').value = `RE: ${mail.subject}`;
    document.querySelector("#reply-body").innerHTML = `On ${mail.timestamp} wrote: ${mail.body}`;

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