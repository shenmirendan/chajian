import { segment } from "oicq";
import fetch from "node-fetch";
import schedule from "node-schedule";
import moment from "moment";

//群号:258623209 零佬群:862438532 作者:Pluto
//项目路径
const _path = process.cwd();

let Gruop  = [258623209,]; //要推送的群号放这,逗号隔开,不建议多,容易封号


async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}


//定时推送 定时区分 (秒 分 时 日 月 星期)
schedule.scheduleJob('0 0 * * * *', async()=>{ 
     let time = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss")
     let hours =(new Date(time).getHours());
     let path = `${_path}/resources/报时/${hours}.mp3`
     
  
	for (var key of Gruop) {
		
	  	Bot.pickGroup(key).sendMsg(segment.record(`file:///${path}`));
	  	
	  	await sleep(10000) //每隔十秒发送一个群
	}
});



