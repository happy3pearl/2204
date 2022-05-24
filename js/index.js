class Problem {
    constructor() {
        this.getDate();
        // 给保存按钮绑定点击事件
        this.$(".save-data").addEventListener('click', this.saveData);
        // 给tbody绑定点击事件,利用事件委托将所有的子元素点击事件都委托给他
        this.$('.table tbody').addEventListener('click', this.distribute.bind(this));
        // 给确定删除按钮绑定点击事件
        this.$('.confirm-del').addEventListener('click', this.confirmDel.bind(this));
        // 给修改按钮的保存按钮绑定点击事件
        this.$('.modify-data').addEventListener('click', this.saveModify.bind(this));
    }

    /****封装一个获取点击的是哪个节点的方法(获取事件源)*****/
    distribute(eve) {
        // 获取事件源
        // console.log(eve.target);
        let tar = eve.target;
        // 判断按钮上是否有指定的类,来确定当前点击的是什么按钮
        // console.log(tar.classList.contains('btn-del'));
        // 判断如果是删除按钮的话,则调用删除数据的方法
        if (tar.classList.contains('btn-del')) this.delData(tar);
        // 判断如果是修改按钮的话,则调用修改数据的方法
        if (tar.classList.contains('btn-modify')) this.modifyData(tar);
    }
    /****封装一个修改数据的方法****/
    modifyData(target) {
        // console.log(target);
        // 1.通过js弹出模态框
        $('#modifyModal').modal('show');
        // 2.获取要修改的数据显示在模态框中
        // 2.1判断点击的是span还是button,找到对应的tr
        let trObj = '';
        if (target.nodeName == 'SPAN') {
            trObj = target.parentNode.parentNode.parentNode;
        }
        if (target.nodeName == 'BUTTON') {
            trObj = target.parentNode.parentNode.parentNode;
        }
        // console.log(trObj);
        // 2.2获取tr中的子节点,分别取出id/title/pos/idea
        let child = trObj.children;
        // console.log(child);
        let id = child[0].innerHTML;
        let title = child[1].innerHTML;
        let pos = child[2].innerHTML;
        let idea = child[3].innerHTML;
        // console.log(id, title, pos, idea);
        // 2.3将内容放在修改表单中
        // 获取表单节点,获取表单下的所有属性
        let form = this.$('#modifyModal form').elements;
        // console.log(form);
        // 将内容放在表单中
        form.title.value = title;
        form.pos.value = pos;
        form.idea.value = idea;
        // 修改的时候id不可变,将id设置为类的一个属性
        // console.log(this);
        this.modifyID = id;
    }

    /****封装一个保存修改的方法****/
    saveModify() {
        // 收集表单中修改后的数据
        // 1.获取表单中的节点以及表单下的所有属性,采用解构赋值的方法
        let { title, pos, idea } = this.$('#modifyModal form').elements;
        // 2.获取title pos idea
        let titleVal = title.value.trim();
        let ideaVal = idea.value.trim();
        let posVal = pos.value.trim();
        console.log(titleVal, ideaVal, posVal);
        // 3.给后台发送数据进行修改
        axios.put(' http://localhost:3000/problem/' + this.modifyID, {
            title: titleVal,
            idea: ideaVal,
            pos: posVal
        }).then(res => {
            // console.log(res);
            // 请求成功则强制刷新
            if (res.status == 200) {
                location.reload()
            }
        })

    }

    /*****封装一个删除数据的方法****/
    delData(target) {
        // console.log(this);
        // 通过js控制模态框的弹出
        $('#delModal').modal('show')
        // 将当前要删除的节点保存到属性上,拿到当前要删除的节点
        this.target = target;
    }

    /*****封装一个确认删除的方法*****/
    confirmDel() {
        // console.log('确认删除');
        // 获取点击的节点的id
        let id = 0;
        // 判断当前点击的是span还是button,获取tr中包含的id
        if (this.target.nodeName == 'SPAN') {
            let trObj = this.target.parentNode.parentNode.parentNode;
            // console.log(trObj);
            // 获取tr中包含的id
            id = trObj.firstElementChild.innerHTML;
            // console.log(id);
        }
        if (this.target.nodeName == 'BUTTON') {
            let trObj = this.target.parentNode.parentNode;
            // console.log(trObj);
            id = trObj.firstElementChild.innerHTML;
            // console.log(id);
        }
        // 将id发送给服务器,删除对应的数据
        axios.delete('http://localhost:3000/problem/' + id).then(res => {
            // console.log(res);
            if (res.status == 200) {
                location.reload();
            }
        })
    }

    /****封装一个保存数据的方法****/
    saveData() {
        // console.log(this);
        // 获取表单,获取表单中的input
        let form = document.forms[0].elements;
        // console.log(form);
        // 获取input中的value值
        let title = form.title.value.trim();
        let pos = form.pos.value.trim();
        let idea = form.idea.value.trim();
        console.log(title, pos, idea);
        // 判断表单中每一个input中是否有值,如果为空则抛出错误
        if (!title || !pos || !idea) {
            throw new Error('表单不能为空')
        };
        // 将数据通过ajax发送给服务器进行保存
        axios.post('http://localhost:3000/problem', {
            title,
            pos,
            idea
        })
            .then(res => {
                // console.log(res);
                // 如果添加成功则刷新页面
                if (res.status == 201) {
                    location.reload();
                }
            })
    }

    /*****封装一个获取数据的方法*****/
    getDate() {
        // 发送ajax请求,获取数据
        axios.get('http://localhost:3000/problem').then(res => {
            // console.log(res);
            // 获取返回值中的data,status 采用解构赋值的方法
            let { data, status } = res;
            // console.log(data, status);
            // 判断当状态值为200的时候,表示请求成功
            if (status == 200) {
                // 将请求成功的数据渲染到页面中
                // 遍历数据,将其拼接
                let html = '';
                data.forEach(ele => {
                    html += `<tr>
                    <th scope="row">${ele.id}</th>
                    <td>${ele.title}</td>
                    <td>${ele.pos}</td>
                    <td>${ele.idea}</td>
                    <td>
                        <button type="button" class="btn btn-danger btn-xs btn-del">
                            <span class="glyphicon glyphicon-trash btn-del" aria-hidden="true"></span>
                        </button>
                        <button type="button" class="btn btn-warning btn-xs btn-modify">
                            <span class="glyphicon glyphicon-refresh btn-modify" aria-hidden="true"></span>
                        </button>
                    </td>
                </tr>`
                })
                // console.log(html);
                // 将拼接好的数据追加到页面中
                this.$('.table tbody').innerHTML = html

            }
        })
    }

    /****封装一个获取节点的方法****/
    $(ele) {
        let res = document.querySelectorAll(ele);
        // 判断当前页面只有一个符合条件的,返回单个节点对象,否则返回节点集合
        return res.length == 1 ? res[0] : res
    }
}
new Problem