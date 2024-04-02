import { useEffect, useState } from "react";
import Chat, {
  Bubble,
  useMessages,
  Notice,
  Icon,
  Modal,
  Button,
  toast,
} from "@chatui/core";
import { io } from "socket.io-client";
import { v4 as uuid } from 'uuid'
import axios from 'axios'

const converter = new showdown.Converter(); // eslint-disable-line no-undef

let userUUID = localStorage.getItem("userUUID");
if (!userUUID) {
  userUUID = uuid()
  localStorage.setItem("userUUID", userUUID);
}

// const socket = io("//" + process.env.REACT_APP_API_DOMAIN, {
//   query: {
//     userUUID
//   },
//   autoConnect: true,
//   reconnection: true,
//   reconnectionDelay: 1000,
//   timeout: 10000,
// });
const socket = ''

// socket.on("connect", () => {
//   console.log("socket connected");
// });

const initialMessages = [
  {
    type: "notice",
    content: { text: "free版响应慢一些~（免费的要啥自行车）" },
  },
  {
    type: "noticeWithURL",
    content: {
      text: "gitHub：https://github.com/finn/chatgpt-web",
      url: 'https://github.com/yi-ge/chatgpt-web'
    },
  },
];

const defaultQuickReplies = [
  {
    icon: "message",
    name: "热词或者别的什么占个坑",
    isNew: true,
    isHighlight: true,
  },
];

let isExecuted = false;

function App () {
  const { messages, appendMsg, setTyping, deleteMsg } =
  useMessages(initialMessages);
  const [onlineUserNum, setOnlineUserNum] = useState(null);
  const [waitingUserNum, setWaitingUserNum] = useState(null);
  const [accountCount, setAccountCount] = useState(null);
  const [open, setOpen] = useState(false);

  function handleModalConfirm (action) {
    if (action === 1) {
      // toast.show("正在抢占体验名额")
      // socket.emit('rush', true)
    } else {
      toast.show("此功能尚在开发中")
    }
  }

  function socketHandler () {
    isExecuted = true
    if (!sessionStorage.getItem("token")) toast.show("正在抢占体验名额");
    setTimeout(() => {
      socket.on("systemInfo", (data) => {
        console.log("online user num", data);
        setOnlineUserNum(data.onlineUserNum);
        setWaitingUserNum(data.waitingUserNum);
        setAccountCount(data.accountCount);
      });

      socket.on("restricted", (data) => {
        console.log("restricted");
        toast.show("未能抢到体验名额");
        setOpen(true);
      })

      socket.on("token", (data) => {
        sessionStorage.setItem('token', data)
        setOpen(false);
        toast.success("成功抢到体验名额");
        setTimeout(() => {
          toast.show("请勿长时间占用体验名额，谢谢！");
        }, 5 * 60 * 1000)
      })

      socket.on("answer", (data) => {
        if (data.code === 1) {
          appendMsg({
            type: "html",
            content: { text: converter.makeHtml(data.result) },
            user: { avatar: "/ai.png" },
          });
        } else {
          appendMsg({
            type: "error",
            content: { text: "错误：" + data.msg + "， 请重试。" },
            user: { avatar: "/system.png" },
          });
        }
      })

      socket.emit('ready', true)
    }, 2000); // 避免用户频繁刷新
  }

  useEffect(() => {
    console.log('更新')
    // if (!isExecuted) socketHandler();
    document.querySelectorAll('pre code').forEach((el) => hljs.highlightElement(el)) // eslint-disable-line no-undef
  });

  async function chatWithKimi (messageValue) {
    try {
      //请求接口这块儿我使用的是axios，你也可以用fetch。
      const response = await axios.post(
        `https://api.moonshot.cn/v1/chat/completions`,
        {
          model: 'moonshot-v1-8k',
          // inputValue为用户输入信息
          messages: [
            { role: 'user', content: messageValue },
          ],
          // 使用什么采样温度，值越高随机度越高，官方建议使用0.3.详细看官方文档
          temperature: 0.3,
        },
        {
          headers: {
            Authorization: `sk-R7lyqaVSoLAvVVAaYshGqLkqB0b1QEf5sHGAcRZxReEvTxVa`,
          },
        }
      )
      console.log(
        '仅此而已啦',
        response.data
      )
      const AIchatContent = response.data.choices[0]?.message?.content
      appendMsg({
        type: "html",
        content: { text: converter.makeHtml(AIchatContent) },
        user: { avatar: "/ai.png" },
      });
      console.log(
        'response.data.choices[0].message',
        response.data.choices[0]?.message?.content
      )

    } catch (error) {
      console.error('Error:', error)
    }
  }

  async function handleSend (type, val) {
    console.log('输入了什么啊',val.trim())
    if (type === "text" && val.trim()) {
      appendMsg({
        type: "text",
        content: { text: val },
        position: "right",
        user:{avatar: "https://s.momocdn.com/s1/u/hbificddj/wanwan.jpg"}
      });

      setTyping(true);

      chatWithKimi(val.trim())

      // socket.emit('chatgpt', {
      //   token: sessionStorage.getItem("token"),
      //   userUUID,
      //   text: val.trim()
      // })
    }
  }

  function reSend () {
    for (const m of messages) {
      if (m.position === "right") {
        handleSend("text", m.content?.text);
        break
      }
    }
  }

  function handleLinkClick (url) {
    window.open(url)
  }

  // 根据消息类型来渲染
  function renderMessageContent ({ type, content, _id }) {
    switch (type) {
      case "text":
        return <Bubble content={content.text} />;
      case "error":
        return (
          <Bubble content={content.text}>
            <Icon
              onClick={reSend}
              type="refresh"
              className="btn-refresh"
            />
          </Bubble>
        );
      case "html":
        return (
          <Bubble>
            <div dangerouslySetInnerHTML={{ __html: content.text }} />
          </Bubble>
        );
      case "notice":
        return (
          <Notice
            content={content.text}
            onClose={deleteMsg.bind(this, _id)}
          />
        );
      case "noticeWithURL":
        return (
          <a href="https://github.com/yi-ge/chatgpt-web" target="_blank" rel="noreferrer">
            <Notice
              content={content.text}
              url={content.url}
              onLinkClick={handleLinkClick}
              onClose={deleteMsg.bind(this, _id)}
            />
          </a>
        );
      default:
        return null;
    }
  }

  function handleQuickReplyClick (item) {
    setTyping(true);
    setTimeout(() => {
      appendMsg({
        type: "text",
        content: { text: "拉倒吧" },
        user: { avatar: "/system.png" },
      });
    }, 1000);
  }

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {/* <div className="left-info">{onlineUserNum !== null ? onlineUserNum : '-'} 人在线</div>
      <div className="right-info">{waitingUserNum !== null ? waitingUserNum : '-'} 人等待</div> */}
      <Chat
        navbar={{ title: "moonShort测试@finn" }}
        messages={messages}
        renderMessageContent={renderMessageContent}
        quickReplies={defaultQuickReplies}
        onQuickReplyClick={handleQuickReplyClick}
        onSend={handleSend}
      />
      <Modal
        active={open}
        title="🚫 限流提示"
        showClose={false}
        backdrop='static'
      >
        <p style={{ paddingLeft: '15px' }}>⚠️ 由于ChatGPT系统限制，为确保上下文关联正确，只允许同时 {accountCount !== null ? accountCount : 'loading...'} 个用户体验，系统采用抢单模式进入，下一个用户退出后将释放 1 个体验名额，点击下方“体验”按钮抢占名额（拼手速），也可以使用您自己的账号。需要注意的是，如果您使用自己的OpenAI账号（支持账号密码或cookie，不支持第三方登录），服务器端将在您退出后销毁内存记录，不会将您的账号借给他人使用。</p>
        <p style={{ paddingLeft: '15px' }}>报告故障微信：molegeek</p>
        <p style={{ paddingLeft: '15px' }}>开源地址：<a href="https://github.com/yi-ge/chatgpt-web" target="_blank" rel="noreferrer">https://github.com/yi-ge/chatgpt-web</a></p>
        <p style={{ paddingLeft: '15px' }}>公益项目，请勿长时间占用体验名额！</p>
        <p style={{ paddingLeft: '15px', marginTop: '15px' }}>当前在线人数：{onlineUserNum} 人</p>
        <p style={{ paddingLeft: '15px', fontWeight: 600 }}>当前正在体验人数：{onlineUserNum - waitingUserNum} 人</p>
        <p style={{ paddingLeft: '15px' }}>当前等待体验人数：{waitingUserNum} 人</p>
        <p style={{ paddingLeft: '15px' }}>目前版本支持同时体验人数：{accountCount !== null ? accountCount : 'loading...'} 人</p>
        <p style={{ textAlign: 'center' }}>
          <Button color="primary" onClick={handleModalConfirm.bind(this, 1)}>直接体验</Button>
          <Button style={{ marginLeft: '20px' }} onClick={handleModalConfirm.bind(this, 2)}>使用账号体验</Button>
        </p>
      </Modal>
    </div>
  );
}

export default App;
