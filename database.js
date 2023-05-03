let db;
let openRequest = indexedDB.open("myDataBase");
openRequest.addEventListener("success", (e) => {
    
    db = openRequest.result;
})
openRequest.addEventListener("error", (e) => {

})
openRequest.addEventListener("upgradeneeded", (e) => {

    db = openRequest.result;

    db.createObjectStore("video", { keyPath: "id" });
    db.createObjectStore("image", {keyPath: "id"});
})