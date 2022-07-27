import { segment } from "oicq";
import { createRequire } from 'module';

const require = createRequire(import.meta.url);

//项目路径
const _path = process.cwd();

//1.定义命令规则
export const rule = {
    presoutu: {
        reg: "^#搜图$",  //匹配消息正则，命令正则
        priority: 101, //优先级，越小优先度越高
        describe: "【#搜图】带上图", //【命令】功能说明
    },
    soutu: {
        reg: "",
        priority: 102,
        describe: "【#搜图】带上图",
    },
};

let soutuUser = {}

export async function presoutu(e) {

    if (e.hasReply) {
        let reply = (await e.group.getChatHistory(e.source.seq, 1)).pop()?.message;
        if (reply) {
            for (let val of reply) {
                if (val.type == "image") {
                    e.img = [val.url];
                    break;
                }
            }
        }
    }

    if (!e.img) {
        if (soutuUser[e.user_id]) {
            clearTimeout(soutuUser[e.user_id]);
        }
        soutuUser[e.user_id] = setTimeout(() => {
            if (soutuUser[e.user_id]) {
                delete soutuUser[e.user_id];
                e.reply([segment.at(e.user_id), " 搜图已取消"]);
            }
        }, 50000);

        e.reply([segment.at(e.user_id), " 请发送图片"]);
        return true;
    }

    soutuUser[e.user_id] = true;

    return soutu(e);
}

export async function soutu(e) {
    try {
        if (!soutuUser[e.user_id]) return;

        if (!e.img) {
            cancel(e);
            return true;
        }

        //自行去源站注册获取api_key
        let api_key = '';

        /*阻拦除主人外的私聊
        let panduan = null;
        if (e.isGroup) {
            panduan = e.group;
        } else if (e.isMaster) {
            panduan = e.friend;
        } else {
            let msg =[
                "此功能不支持私聊嗷~"
            ]
            e.reply(msg);
            return false;
        }
*/
//如果需要禁止私聊去掉上面的注释

        let imgURL = e.img[0];
        let url;
        if (imgURL.length > 0) {
            url = "https://saucenao.com/search.php";
        }

        const axios = require('axios')

        const response = await axios.get(url, {
            params: {
                url: imgURL,
                db: 999,
                api_key: api_key,
                output_type: 2,
                numres: 3
            }
        })

        const res = response.data;

        let penable = false;
        let jp = false;
        let k = 0;

        //优先p站源，其次携带日文名，最后是其他
        if (res) {
            let i = 0;
            for (i; i < 3; i++) {
                if (res.results[i].data.pixiv_id) { penable = true; k = i; break; }
                else if (res.results[i].data.jp_name) { jp = true; k = i; break; }
                else { penable = false; k = 0; }
            }
        }

        //过滤相似度<=70%的图片，并返回首张图片
        if (res.results[k].header.similarity <= 70) { k = 0; }

        console.log(k);
        console.log(penable);
        console.log(jp);

        let msg;

        if (penable) {
            msg = [
                segment.at(e.user_id), '\n',
                "相似度：" + res.results[k].header.similarity + "%\n",
                "标题：" + res.results[k].data.title, '\n',
                "P站ID：" + res.results[k].data.pixiv_id, '\n',
                "画师：" + res.results[k].data.member_name, '\n',
                "来源：" + res.results[k].data.ext_urls[0], '\n',
                segment.image(res.results[k].header.thumbnail),
            ];
            console.log('penable');
        }
        else if (jp) {
            msg = [
                segment.at(e.user_id), '\n',
                "相似度：" + res.results[k].header.similarity + "%\n",
                "画师：" + res.results[k].data.creator, '\n',
                "来源：" + res.results[k].data.source, '\n',
                "日文名：" + res.results[k].data.jp_name, '\n',
                segment.image(res.results[k].header.thumbnail),
            ];
            console.log('jp');
        }
        else {
            msg = [
                segment.at(e.user_id), '\n',
                "相似度：" + res.results[k].header.similarity + "%\n",
                "画师：" + res.results[k].data.creator, '\n',
                "来源：" + res.results[k].data.source, '\n',
                segment.image(res.results[k].header.thumbnail),
            ];
            console.log('other');
        }

        console.log(res.results[k]);
        
        //发送消息
        e.reply(msg);
    } catch (err) {
        console.log(err.response.data.header.message);
        let msg = [
            segment.at(e.user_id), '\n',
            "错误码：" + err.response.status, '\n',
            "大概率搜图已上限，别搜了！",
        ];
        e.reply(msg);
    };

    cancel(e)
    
    return true;//返回true 阻挡消息不再往下
}

function cancel(e) {
    if (soutuUser[e.user_id]) {
        clearTimeout(soutuUser[e.user_id]);
        delete soutuUser[e.user_id];
    }
}