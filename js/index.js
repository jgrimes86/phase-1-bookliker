document.addEventListener("DOMContentLoaded", function() {
    bookFetcher();
});

const bookDatabase = 'http://localhost:3000/books';
const userDatabase = 'http://localhost:3000/users';

const bookList = document.getElementById('list-panel');
const showPanel = document.getElementById('show-panel');

// When the page loads, get a list of books from http://localhost:3000/books and display their titles by creating a li for each book and adding each li to the ul#list element.

function bookFetcher() {
    fetch(bookDatabase)
    .then(response => response.json())
    .then(bookLister)
}

function bookLister(books) {
    books.forEach(book => {
        const li = document.createElement('li');
        li.innerText = book.title;
        li.dataset.bookId = `${book.id}`;
        li.addEventListener('click', singleBookFetcher);
        bookList.append(li)
    })
}

// When a user clicks the title of a book, display the book's thumbnail, description, and a list of users who have liked the book. This information should be displayed in the div#show-panel element.

function singleBookFetcher(event) {
    let bookId = event.target.dataset.bookId;
    fetch(bookDatabase+'/'+bookId)
    .then(response => response.json())
    .then(bookDetailViewer)
}

function bookDetailViewer(book) {
    showPanel.innerHTML='';

    showPanel.dataset.bookId = `${book.id}`;

    let thumbnail = document.createElement('img');
    thumbnail.src = book.img_url;
    thumbnail.alt = book.title;
    thumbnail.id = 'thumbnail';
    thumbnail.style.margin = '1em';

    let title = document.createElement('div');
    title.innerText = book.title;
    title.id = 'title';
    title.style.margin = '1em';

    let author = document.createElement('div');
    author.innerText = book.author;
    author.id = 'author'
    author.style.margin = '1em';
    
    let description = document.createElement('div');
    description.innerText = book.description;
    description.id = 'description'
    description.style.margin = '1em';
    
    
    let userList = document.createElement('ul');
    book.users.forEach(user => {
        let oneUser = document.createElement('li');
        oneUser.innerText = user.username;
        userList.append(oneUser);
    }) 
    userList.id = 'user-list';
    userList.style.margin = '1em';

    let likeButton = document.createElement('button');
    likeButton.innerText = 'LIKE';
    likeButton.style.margin = '1em';
    likeButton.addEventListener('click', likeABook);
    
    showPanel.append(thumbnail, title, author, description, userList, likeButton);

    if (book.subtitle === true) {
        let subtitle = document.createElement('div');
        subtitle.innerText = book.subtitle;
        subtitle.id = 'subtitle';
        subtitle.style.margin = '1em';
        title.after(subtitle)
    };
}

// A user can like a book by clicking on a button. Display a LIKE button along with the book details. When the button is clicked, send a PATCH request to http://localhost:3000/books/:id with an array of users who like the book, and add a new user to the list.

//check already-listed users and invoke functions to update databases
function likeABook(event) {
    let newUser = prompt("Enter user name to like the book:");
    let bookId = event.target.parentElement.dataset.bookId;

    if (event.target.previousSibling.textContent.includes(newUser)) {
        confirm('Would you like to unlike this book? Click "OK" to confirm.');
        removeUserFromUserDatabase(newUser)
    } else {
        updateUserDatabase(newUser, bookId);
    }
}

//update user database
function updateUserDatabase(newUser, bookId) {
    fetch(userDatabase, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            "username": `${newUser}`
        }),
    })
    .then(response => response.json())
    .then(newUserInfo => updateBookDatabase(newUserInfo, bookId))
}

//update book database
function updateBookDatabase(newUserInfo, bookId) {
    let newUser = newUserInfo.username;
    let userId = newUserInfo.id;
    newUserObject = {};
    newUserObject.id = userId;
    newUserObject.username = newUser;

    fetch(bookDatabase+'/'+bookId)
    .then(response => response.json())
    .then(patchUserInfo)

    function patchUserInfo(bookInfo) {
        let userObject = bookInfo.users;
        userObject.push(newUserObject)
        fetch(bookDatabase+'/'+bookId, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                "users": userObject,
            }),
        })
        .then(response => response.json())
        .then(bookDetailViewer)
    }
}

// Bonus: Un-Like a Book
// If a user has already liked a book, clicking the LIKE button a second time should remove that user from the list of users who have liked the book.

// Make a second PATCH request with the updated array of users, removing your user from the list. Also remove the user from the DOM.

function removeUserFromUserDatabase(newUser) {
    let userId = ''    

    fetch(userDatabase)
    .then(response => response.JSON)
    .then(userList => {
        userList.forEach(object => {
            if (object.username == newUser) {
                userId = object.id
            }
        });
        removeUser
    })

    function removeUser() {
        fetch(userDatabase+'/'+userId, {
            method: "DELTE"
        })
        .then(removeUserFromBookDatabase(userId))
    }

}

function removeUserFromBookDatabase(userId) {
    console.log('this will delete the user\'s like from the book database')

}