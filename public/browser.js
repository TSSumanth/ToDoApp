let form = document.getElementById("tasksform")
let forminput = document.getElementById("taskinputfield")
let showdeleted = document.getElementById("showDeleted");
let hideDeleted = document.getElementById("HideDeleted");
showdeleted.addEventListener("click",(e)=>{
    e.preventDefault();
    axios.get('/show-deleted').then((response) =>{
        showdeleted.nextElementSibling.nextElementSibling.insertAdjacentHTML("afterend",deletedItemTemplete(response.data))        
    }); 
    showdeleted.disabled = true;
    hideDeleted.disabled = false;
});
hideDeleted.addEventListener("click",(e)=>{
    e.preventDefault();
    document.getElementById("deletedlist").remove()
    showdeleted.disabled = false;
    hideDeleted.disabled = true;
})
form.addEventListener("submit",(e)=>{
    e.preventDefault();
    axios.post('/create-item',
    {
        text: forminput.value
    }).then((response) => {
        document.getElementById("tasklist").insertAdjacentHTML("beforebegin",pendingItemTemplete(response.data))
        forminput.value=""
        forminput.focus();
    }).catch(() => {

    });
})
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-me")) {
        let actualtext = e.target.parentElement.parentElement.querySelector(".item-text").innerHTML;
        let userInput = prompt("Please update the task details..", actualtext)
        if (userInput !=actualtext) { 
            axios.post('/update-item',
            {
                text: userInput, 
                id: e.target.getAttribute("data-id")
            }).then((response) => {
                e.target.parentElement.parentElement.querySelector(".item-text").innerHTML = userInput
            }).catch(() => {

            });
        }
    }

    if(e.target.classList.contains('delete-me')){
        let actualtext = e.target.parentElement.parentElement.querySelector(".item-text").innerHTML;
        if(confirm(`Do you really want to delete task "${actualtext}" permanantly?`)){
            axios.post('/delete-item',
            {
                id: e.target.getAttribute("data-id")
            }).then((response) => {
                e.target.parentElement.parentElement.remove();
            }).catch(() => {

            });
        }
    }
})
function pendingItemTemplete(item){
    return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
    <span class="item-text">${item.taskDetails}</span>
    <div>
        <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Edit</button>
        <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete</button>
    </div>
    </li>`
}

function deletedItemTemplete(items){
    console.log(items)
    return `
    <br>
    <ul id="deletedlist" class="list-group pb-5">
    ${
        items.map((item) => {    
        return `<li class="list-group-item list-group-item-action d-flex align-items-center justify-content-between">
        <span class="item-text">${item.taskDetails}</span>
        <div>
            <button data-id="${item._id}" class="edit-me btn btn-secondary btn-sm mr-1">Restore</button>
            <button data-id="${item._id}" class="delete-me btn btn-danger btn-sm">Delete Permanently</button>
        </div>
        </li>`}).join('')
    }
    </ul>`
}