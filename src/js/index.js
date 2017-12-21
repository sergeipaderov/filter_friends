import '../scss/main.scss'

const vkData = {
    init: function () {                
        if (!localStorage.valueRight || localStorage.valueRight.length<12) {
            localStorage.clear();
            this.vkAuth().then(()=>{
                return this.callAPI('friends.get', { fields: 'photo_100' })
            })
                .then((response)=>{
                    let friends = []

                    for (let i in response) {
                        let fio = `${response[i].first_name} ${response[i].last_name}`,
                            photo = `${response[i].photo_100}`;

                        friends.push({ userName: fio, 'photo': photo })
                    }
                    userListLeft.list=friends;
                    vkData.update(userListLeft, sortRight);
                });
        }
    },
    vkAuth: () => {
        return new Promise((resolve, reject) => {
            VK.init({
                apiId: 6304506
            });
            VK.Auth.login(data => {
                if (data.session) {
                    resolve();
                } else {
                    reject(new Error('Auth rejected'));
                }
            }, 2)
        })
    },
    callAPI: (method, params) => {
        return new Promise((resolve, reject)=>{
            VK.api(method, params, (data)=>{
                params.v = '5.69';
                if (data.error) {
                    reject(data.error)
                } else {
                    resolve(data.response);
                }
            })
        })
    },
    userListRight: () => {
        return localStorage.valueRight ? JSON.parse(localStorage.valueRight) : undefined;
    },    
    tmplFriends: require('../tmpl/components/friends_list.hbs'),
    tmplChoosed: require('../tmpl/components/choosed_list.hbs'),
    listRight: document.querySelector('.choosed_js'),
    listLeft: document.querySelector('.friends_js'),
    inputLeft: document.querySelector('.input-left'),
    inputRight: document.querySelector('.input-right'),
    block: document.querySelector('.block'),
    btnSave: document.querySelector('.btn-save'),
    removeFriend: (elem, list) => {
        for (let i = 0; i < list.length; i++) {
            if (list[i].userName === elem) {
                list.splice(i, 1);
            }
        }
    },
    addFriend: (elem, list) => {
        list.push(elem)
    },
    friendData: (elem) => {
        let photo = elem.closest('li').children[0].children[0].children[0].getAttribute('src');
        let user = elem.closest('li').children[0].children[1].textContent;
        
        return { 'userName': user, 'photo': photo };
    },
    update: function (valueLeft, valueRight) {
        this.listLeft.innerHTML = this.tmplFriends(valueLeft);
        this.listRight.innerHTML = this.tmplChoosed(valueRight);
    },
    check: (full, chunk) => {
        if (full.toLowerCase().indexOf(chunk.toLowerCase()) === -1) {
            return false;
        } 

        return true;
        
    }

}
var userListRight = {
    list: []
}

var userListLeft = {
    list: []
}

window.onload = vkData.init();

let sortLeft = { list: [] };
let sortRight = { list: [] };

userListLeft = localStorage.valueLeft ? JSON.parse(localStorage.valueLeft) : userListLeft;
userListRight =localStorage.valueRight ? JSON.parse(localStorage.valueRight) : userListRight;

sortLeft.list = userListLeft.list
sortRight.list = userListRight.list

vkData.update(sortLeft, sortRight);

vkData.block.addEventListener('click', (e) => {
    let itemLeft = e.target.closest('.user__add');
    let itemRight = e.target.closest('.user__remove');

    if (itemLeft) {
        let data = vkData.friendData(itemLeft);

        vkData.removeFriend(data.userName, userListLeft.list);
        vkData.addFriend(data, userListRight.list)
    } else if (itemRight) {
        let data = vkData.friendData(itemRight);

        vkData.removeFriend(data.userName, userListRight.list);
        vkData.addFriend(data, userListLeft.list)

    } else {
        return;
    }
    var listenerLeft = new Event('keyup');
    var listenerRight = new Event('keyup');

    vkData.inputLeft.dispatchEvent(listenerLeft);
    vkData.inputRight.dispatchEvent(listenerRight);
    vkData.update(sortLeft, sortRight);
})

vkData.inputLeft.addEventListener('keyup', (e) => {
    sortLeft.list = [];
    if (e.target.value.length) {
        for (let i = 0; i < userListLeft.list.length; i++) {
            if (vkData.check(userListLeft.list[i].userName, e.target.value)) {
                sortLeft.list.push(userListLeft.list[i]);
            }
        }
        vkData.update(sortLeft, sortRight);
    } else {
        sortLeft.list = userListLeft.list
        vkData.update(sortLeft, sortRight);
    }
})

vkData.inputRight.addEventListener('keyup', (e) => {
    sortRight.list = [];
    if (e.target.value.length) {
        for (let i = 0; i < userListRight.list.length; i++) {
            if (vkData.check(userListRight.list[i].userName, e.target.value)) {
                sortRight.list.push(userListRight.list[i]);
            }
        }
        vkData.update(sortLeft, sortRight);
    } else {
        sortRight.list = userListRight.list
        vkData.update(sortLeft, sortRight);
    }
})

vkData.btnSave.addEventListener('click', () => {
    localStorage.valueLeft = JSON.stringify(userListLeft);
    localStorage.valueRight = JSON.stringify(userListRight);
})

function start(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', JSON.stringify([e.target.closest('ul').classList[1], 
        vkData.friendData(e.target)]))
}

function handleDragEnter(e) {
    e.preventDefault();
    
    return true;
}
function handleDragOver(e) {
    e.preventDefault();
    
    return true;
}

function DragAndDrop(e) {
    var data = JSON.parse(e.dataTransfer.getData('text/html'));
    let blockPos = e.target.closest('ul').classList[1];

    if (blockPos ==='friends_js' && blockPos !==data[0]) {
        vkData.removeFriend(data[1].userName, userListRight.list);
        vkData.addFriend(data[1], userListLeft.list)
    }
    if (blockPos ==='choosed_js' && blockPos !==data[0]) {
        vkData.removeFriend(data[1].userName, userListLeft.list);
        vkData.addFriend(data[1], userListRight.list)
    }
    var listenerLeft = new Event('keyup');
    var listenerRight = new Event('keyup');

    vkData.inputLeft.dispatchEvent(listenerLeft);
    vkData.inputRight.dispatchEvent(listenerRight);
    vkData.update(sortLeft, sortRight);
    
    return false;
}

vkData.listLeft.addEventListener('dragover', handleDragOver, false);
vkData.listLeft.addEventListener('drop', DragAndDrop, false);
vkData.listLeft.addEventListener('dragenter', handleDragEnter, false);

vkData.listRight.addEventListener('dragover', handleDragOver, false);
vkData.listRight.addEventListener('drop', DragAndDrop, false);
vkData.listRight.addEventListener('dragenter', handleDragEnter, false);

vkData.block.addEventListener('mousedown', function (e) {
    if (e.target.closest('li')) {
        e.target.closest('li').addEventListener('dragstart', start, false);
    }
})
