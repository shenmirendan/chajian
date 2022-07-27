import { segment } from "oicq";
import fetch from "node-fetch";

import schedule from "node-schedule";
//项目路径
const _path = process.cwd();


function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let Blacklist[];//放黑名单
schedule.scheduleJob("0 0 7 * * ?",async ()=>{
    let grouplist=Bot.gl;
    let url="https://api.iyk0.com/60s";
    let url_1="https://api.2xb.cn/zaob";
    let res=await  fetch(url);
    let res1=await res.json();
    if (res1.msg!='Success'){
      res=await  fetch(url_1);
      res1=await res.json()
    };
    if (res1.msg=='Success'){
      let msg = [
        segment.image(res1.imageUrl),
        ];
      for (var key of grouplist){
        for (var i of key){
          if(typeof(i.group_id)!='undefined'&&!Blacklist.includes(i.group_id)){
            console.log(typeof(i.group_id))
            Bot.pickGroup(i.group_id).sendMsg(msg);

          sleep(10000);
      }}
  }};
})

