const sidebarJokesContainer = document.querySelector('.sidebar__jokes-container');
//adding jokes to the sidebar
if (localStorage.getItem('favoriteJokes') && JSON.parse(localStorage.getItem('favoriteJokes').length > 0)) {
    for (let joke of JSON.parse(localStorage.getItem('favoriteJokes'))) {
        sidebarJokesContainer.appendChild(createJokeDOM(joke, false));
        //add event to like button
        sidebarJokesContainer.querySelector(`[data-id = "${joke.id}"] .joke__button-like`).addEventListener('click', () => {
            removeJokeFromFavorite(joke.id);
            if (mainJokesContainer.querySelector(`[data-id = "${joke.id}"]`)) mainJokesContainer.querySelector(`[data-id = "${joke.id}"] .joke__button-like`).classList.remove('joke__button-like_active');
        })
    }
    //add array of favorite jokes to local storage
} else if (!localStorage.getItem('favoriteJokes')) {
    let favoriteJokesArr = [];
    favoriteJokesArr = JSON.stringify(favoriteJokesArr);
    localStorage.setItem('favoriteJokes', favoriteJokesArr)
}

const openSidebarBtn = document.querySelector('.main__sidebar-btn_mobile');
//add event to show sidebar button for mobile
openSidebarBtn.addEventListener('click', function () {
    openSidebarBtn.querySelector('.main__sidebar-btn-icon').classList.toggle('main__sidebar-btn-icon_active');
    document.querySelector('.main').classList.toggle('main_sidebar-active');
    document.querySelector('.sidebar').classList.toggle('sidebar_active');
})

const jokesCategoriesContainer = document.querySelector('.search-block__category-items');
const jokesCategoriesUrl = 'https://api.chucknorris.io/jokes/categories';
//add categories of jokes for search joke by category block
fetch(jokesCategoriesUrl)
    .then(resp => resp.json())
    .then(categories => {
        for (let category of categories) {
            let newCategory = document.createElement('input');
            newCategory.type = 'radio';
            newCategory.name = 'category-items';
            newCategory.id = 'category-items__' + category;
            newCategory.value = category;
            let newCategoryLabel = document.createElement('label');
            newCategoryLabel.setAttribute('for', newCategory.id);
            newCategoryLabel.innerHTML = category;
            jokesCategoriesContainer.appendChild(newCategory);
            jokesCategoriesContainer.appendChild(newCategoryLabel);
        }
    })

const mainJokesContainer = document.querySelector('.main__jokes-container');
const getJokeBtn = document.querySelector('.search-block__button-get-joke');
const randomJokeUrl = 'https://api.chucknorris.io/jokes/random';
const categoryJokeUrl = 'https://api.chucknorris.io/jokes/random?category=';
const searchJokeUrl = 'https://api.chucknorris.io/jokes/search?query='
//add event for get joke button
getJokeBtn.addEventListener('click', () => {
    let activeRadio = findCheckedRadio(Array.from(document.querySelectorAll('input[name="search-joke"]')));
    mainJokesContainer.innerHTML = '';
    if (activeRadio.id === 'search-joke__random') {
        fetch(randomJokeUrl)
            .then(resp => resp.json())
            .then(joke => {
                mainJokesContainer.appendChild(createJokeDOM(joke));
                btnLikeEvent(joke);
            });
    } else if (activeRadio.id === 'search-joke__category') {
        let activeCategory = findCheckedRadio(Array.from(document.querySelectorAll('input[name="category-items"]')));
        if (!activeCategory) {
            mainJokesContainer.innerHTML = `<div class="jokes-container_empty">Select category please</div>`;
            return
        }
        fetch(categoryJokeUrl + activeCategory.value)
            .then(resp => resp.json())
            .then(joke => {
                mainJokesContainer.appendChild(createJokeDOM(joke));
                btnLikeEvent(joke);
            });
    } else if (activeRadio.id === 'search-joke__search') {
        let query = document.querySelector('#search-block__search-input').value;
        fetch(searchJokeUrl + query)
            .then(resp => resp.json())
            .then(jokes => {
                if (jokes.result.length > 0) {
                    for (let joke of jokes.result) {
                        mainJokesContainer.appendChild(createJokeDOM(joke));
                        btnLikeEvent(joke);
                    }
                } else {
                    mainJokesContainer.innerHTML = `<div class="jokes-container_empty">No jokes found</div>`;
                }
            });
    }
});

function findCheckedRadio(arr) {
    return arr.find(radio => radio.checked);
}

function calculateLastUpdate(jokeObj) {
    return parseInt((Date.now() - Date.parse(jokeObj.updated_at)) / 1000 / 60 / 60);
}

function createJokeDOM(jokeObj, forMainContainer = true) {
    let joke = document.createElement('div');
    joke.className = 'joke';
    joke.setAttribute('data-id', jokeObj.id)
    if (forMainContainer) {
        joke.innerHTML = `<div class="joke__button-like ${checkLike(jokeObj.id)?`joke__button-like_active`:``}"></div>
<div class="joke__id">
    ID: <a href="${jokeObj.url}" target="_blank" class="joke__id-link"> ${jokeObj.id}</a>
</div>
<div class="joke__content"> ${jokeObj.value} </div>
<div class="joke__info">
    <div class="joke__update">Last update: <p>${calculateLastUpdate(jokeObj)} hours ago</p>
    </div>
    ${jokeObj.categories.length > 0 ? `<div class="joke__category">${jokeObj.categories[0]}</div>`: ''}
    
</div>`;
    } else {
        joke.classList.add('sidebar-joke');
        joke.innerHTML = ` <div class="joke__button-like sidebar-joke__button-like joke__button-like_active">
        </div>
        <div class="joke__id sidebar-joke__id">
            ID: <a href="${jokeObj.url}" target="_blank" class="joke__id-link sidebar-joke__id-link"> ${jokeObj.id}</a>
        </div>
        <div class="joke__content sidebar-joke__content">${jokeObj.value} </div>
        <div class="joke__info sidebar-joke__info">
            <div class="joke__update sidebar-joke__update">Last update: <p>${calculateLastUpdate(jokeObj)} hours ago</p>
            </div>
            ${jokeObj.categories.length > 0 ? `<div class="joke__category sidebar-joke__category">${jokeObj.categories[0]}</div>`: ''}
        </div>`;
    }
    return joke;
}

function btnLikeEvent(joke) {
    document.querySelector(`[data-id = "${joke.id}"]`).querySelector('.joke__button-like').addEventListener('click', (e) => {
        e.target.classList.toggle('joke__button-like_active');
        if (e.target.classList.contains('joke__button-like_active')) {
            addJokeToFavorite(joke);
        } else {
            removeJokeFromFavorite(joke.id);
        }
    })
}

function searchJokeById(jokesArr, id) {
    return jokesArr.find(joke => joke.id === id);
}



function addJokeToFavorite(joke) {
    let storageArr = getArrayFromLocalStorage();
    storageArr.unshift(joke);
    sidebarJokesContainer.insertBefore(createJokeDOM(joke, false), sidebarJokesContainer.firstChild);
    sidebarJokesContainer.querySelector(`[data-id = "${joke.id}"] .joke__button-like`).addEventListener('click', () => {
        removeJokeFromFavorite(joke.id);
        if (mainJokesContainer.querySelector(`[data-id = "${joke.id}"]`)) mainJokesContainer.querySelector(`[data-id = "${joke.id}"] .joke__button-like`).classList.remove('joke__button-like_active');
    })
    sendArrayToLocalStorage(storageArr);
}

function removeJokeFromFavorite(id) {
    let storageArr = getArrayFromLocalStorage();
    sidebarJokesContainer.removeChild(sidebarJokesContainer.querySelector(`[data-id = "${id}"]`))
    storageArr.splice(storageArr.indexOf(searchJokeById(storageArr, id)), 1);
    sendArrayToLocalStorage(storageArr);
}

function getArrayFromLocalStorage() {
    return JSON.parse(localStorage.getItem('favoriteJokes'));
}

function sendArrayToLocalStorage(array) {
    array = JSON.stringify(array)
    localStorage.setItem('favoriteJokes', array);
}

function checkLike(id) {
    let storageArr = getArrayFromLocalStorage();
    return Boolean(storageArr.find(joke => joke.id === id));
}